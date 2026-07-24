import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getBlindRevealData } from '../services/auctionService';
import { getCookie } from '../Components/Global/CookieIT';
import { useAuth } from '../Context/AuthContext';

/**
 * useSocket — Real-time bidding hook.
 *
 * Connects to the BidKar Socket.io server, joins the auction room, and
 * propagates live bid events to the calling component.
 */
export function useSocket(auctionId, initialBid = 0, auctionType = 'ENGLISH', item = null) {
  const { user } = useAuth();
  const [currentBid, setCurrentBid] = useState(initialBid);
  const [totalBids, setTotalBids] = useState(item?.bidsCount ?? item?.bids?.length ?? 0);
  const [lastBidder, setLastBidder] = useState(() => {
    if (item?.winnerId) {
      const isMe = (item.winnerId._id || item.winnerId) === user?.userId;
      return {
        username: isMe ? 'You' : (item.winnerId.username || `Bidder_${(item.winnerId._id || item.winnerId).slice(-4)}`)
      };
    }
    return null;
  });
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState(null);
  const [bidHistoryList, setBidHistoryList] = useState([]);
  const [viewerCount, setViewerCount] = useState(1);

  // Dutch specific states
  const [quantityRemaining, setQuantityRemaining] = useState(
    item?.currentQuantity ?? 3
  );
  const [nextDropCountdown, setNextDropCountdown] = useState(
    item?.dropInterval ?? 20
  );

  // Blind specific states
  const [blindBidsList, setBlindBidsList] = useState([]);
  const [isRevealed, setIsRevealed] = useState(false);

  // Refs
  const socketRef = useRef(null);
  const dutchTimerRef = useRef(null);
  const blindTimerRef = useRef(null);

  // Sync initialBid when item data loads
  useEffect(() => {
    if (initialBid > 0) {
      setCurrentBid(initialBid);
    }
    if (item?.bidsCount !== undefined) {
      setTotalBids(item.bidsCount);
    }
  }, [initialBid, item?.bidsCount]);

  // Sync initial Dutch quantity
  useEffect(() => {
    if (item?.currentQuantity) {
      setQuantityRemaining(item.currentQuantity);
    }
  }, [item]);

  // Main Socket.io connection & logic
  useEffect(() => {
    if (!auctionId) return;

    const token = getCookie('auth_token');
    if (!token) {
      return;
    }

    const socketUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '').replace(/\/api\/$/, '');

    // Connect to Socket.io server with authentication payload
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_auction', auctionId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room_viewers_update', (payload) => {
      if (payload.auctionId === auctionId) {
        setViewerCount(payload.viewerCount || 1);
      }
    });

    socket.on('outbid_alert', (data) => {
      setSocketError(`⚡ Outbid Alert: ${data.message || "You've been outbid on this item!"}`);
    });

    // English bid history initial sync
    socket.on('bid_history', (payload) => {
      const history = payload.bids || [];
      const formatted = history.map(b => {
        const isMe = b.bidder?.username === user?.username;
        return {
          bidder: isMe ? 'You' : (b.bidder?.username || 'Bidder'),
          amount: b.amount,
          timestamp: new Date(b.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
      });
      setBidHistoryList(formatted);
      setTotalBids(history.length);
      if (history.length > 0) {
        const top = history[0];
        const isMe = top.bidder?.username === user?.username;
        setLastBidder({
          username: isMe ? 'You' : (top.bidder?.username || 'Bidder')
        });
        setCurrentBid(top.amount);
      }
    });

    // English bid updates
    socket.on('new_bid_update', (payload) => {
      if (payload.auctionId !== auctionId) return;

      setSocketError(null);
      setCurrentBid(payload.newHighestBid);
      setTotalBids(prev => prev + 1);

      const isMe = payload.bidderId === user?.userId;
      const name = isMe ? 'You' : (payload.username || `Bidder_${payload.bidderId.slice(-4)}`);
      
      setLastBidder({ username: name });

      const newTimeStr = new Date(payload.timestamp || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setBidHistoryList(prev => {
        if (prev.length > 0 && prev[0].amount === payload.newHighestBid) return prev;
        return [
          {
            bidder: name,
            amount: payload.newHighestBid,
            timestamp: newTimeStr
          },
          ...prev
        ];
      });
    });

    socket.on('bid_rejected', (payload) => {
      setSocketError(payload.message);
    });

    // Dutch: client-side dynamic price & countdown computation
    if (auctionType === 'DUTCH' && item) {
      const interval = item.dropInterval || 20;
      const dropAmt = item.dropAmount || Math.max(100, Math.floor(item.startingPrice * 0.04));
      const floor = item.priceFloor || Math.max(1, Math.floor(item.startingPrice * 0.45));
      const startMs = new Date(item.startTime).getTime();

      const updateDutchPrice = () => {
        const now = Date.now();
        if (now < startMs) {
          setCurrentBid(item.startingPrice);
          setNextDropCountdown(Math.ceil((startMs - now) / 1000));
          return;
        }

        const elapsedSeconds = Math.floor((now - startMs) / 1000);
        const drops = Math.floor(elapsedSeconds / interval);
        const activePrice = Math.max(floor, item.startingPrice - (drops * dropAmt));

        setCurrentBid(activePrice);

        if (activePrice === floor) {
          setNextDropCountdown(0);
        } else {
          const secondsIntoCurrentDrop = elapsedSeconds % interval;
          setNextDropCountdown(interval - secondsIntoCurrentDrop);
        }
      };

      updateDutchPrice();
      dutchTimerRef.current = setInterval(updateDutchPrice, 1000);
    }

    // Blind: poll for reveal status
    if (auctionType === 'BLIND' && item) {
      const checkBlindStatus = async () => {
        const now = Date.now();
        const deadline = new Date(item.submissionDeadline).getTime();
        const reveal = new Date(item.revealTime).getTime();

        if (now >= reveal) {
          setIsRevealed(true);
          try {
            const data = await getBlindRevealData(auctionId);
            setBlindBidsList(data.bids ?? []);
            if (data.winner) {
              setLastBidder(data.winner);
            }
          } catch (err) {
            console.error('Blind reveal fetch failed:', err);
          }
        } else {
          const target = now >= deadline ? reveal : deadline;
          const remainingSeconds = Math.max(0, Math.ceil((target - now) / 1000));
          setNextDropCountdown(remainingSeconds);
          blindTimerRef.current = setTimeout(checkBlindStatus, 1000);
        }
      };

      checkBlindStatus();
    }

    // Cleanup
    return () => {
      socket.emit('leave_auction', auctionId);
      socket.disconnect();
      setIsConnected(false);

      if (dutchTimerRef.current) {
        clearInterval(dutchTimerRef.current);
        dutchTimerRef.current = null;
      }
      if (blindTimerRef.current) {
        clearTimeout(blindTimerRef.current);
        blindTimerRef.current = null;
      }
    };
  }, [auctionId, auctionType, item, user]);

  // Optimistic UI updates

  const placeBidEvent = useCallback((amount) => {
    if (auctionType !== 'ENGLISH') return;
    setCurrentBid(amount);
    setTotalBids(prev => prev + 1);
    setLastBidder({ username: 'You' });
  }, [auctionType]);

  const buyNowDutchEvent = useCallback(() => {
    if (auctionType !== 'DUTCH') return;
    setQuantityRemaining(prev => Math.max(0, prev - 1));
  }, [auctionType]);

  const submitBlindBidEvent = useCallback(() => {
    // No-op
  }, []);

  const placeBidSocket = useCallback((amount) => {
    setSocketError(null);
    if (socketRef.current) {
      socketRef.current.emit('place_bid', { auctionId, amount });
    }
  }, [auctionId]);

  return {
    currentBid,
    totalBids,
    lastBidder,
    isConnected,
    socketError,
    setSocketError,
    quantityRemaining,
    nextDropCountdown,
    blindBidsList,
    isRevealed,
    bidHistoryList,
    viewerCount,
    placeBidEvent,
    placeBidSocket,
    buyNowDutchEvent,
    submitBlindBidEvent,
  };
}
