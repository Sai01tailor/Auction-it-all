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
  const [totalBids, setTotalBids] = useState(0);
  const [lastBidder, setLastBidder] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

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
  }, [initialBid]);

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
      // Security middleware on the server requires authentication token.
      // Guests don't have token; skip connection to avoid terminal spams / closed ws connection errors.
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
      // Join the auction room using the server's expected join_auction event name and raw string payload
      socket.emit('join_auction', auctionId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // English bid updates
    socket.on('new_bid_update', (payload) => {
      if (payload.auctionId !== auctionId) return;

      setCurrentBid(payload.newHighestBid);
      setTotalBids(prev => prev + 1);
      
      const isMe = payload.bidderId === user?.userId;
      setLastBidder({
        username: isMe ? 'You' : `Bidder_${payload.bidderId.slice(-4)}`
      });
    });

    // Dutch: client-side countdown display
    if (auctionType === 'DUTCH' && item) {
      const interval = item.dropInterval || 20;
      setNextDropCountdown(interval);

      dutchTimerRef.current = setInterval(() => {
        setNextDropCountdown(prev => {
          if (prev <= 1) return interval;
          return prev - 1;
        });
      }, 1000);
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

  return {
    currentBid,
    totalBids,
    lastBidder,
    isConnected,
    quantityRemaining,
    nextDropCountdown,
    blindBidsList,
    isRevealed,
    placeBidEvent,
    buyNowDutchEvent,
    submitBlindBidEvent,
  };
}
