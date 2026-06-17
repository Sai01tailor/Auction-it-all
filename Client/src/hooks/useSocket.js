import { useEffect, useRef, useState, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────
   useSocket — Socket.io client hook for real-time bid updates
   
   Phase 1: Server's auction.socket.js is empty, so this hook
   runs in DEV MOCK mode: it simulates bid increments every
   8–15 seconds so the UI looks alive during development.
   
   Phase 2: Remove mock block and uncomment the real socket
   connection (currently commented below).
   
   Events (Phase 2 target):
     EMIT:  join:auction  { auctionId }
     EMIT:  leave:auction { auctionId }
     RECV:  bid:update    { auctionId, currentBid, totalBids, lastBidder, timestamp }
     RECV:  auction:ended { auctionId, winnerId, finalBid }
───────────────────────────────────────────────────────────── */

const MOCK_BIDDERS = [
  'rahul_m', 'priya_k', 'anjali.s', 'vikram99',
  'deepak_j', 'sneha_r', 'arjun.v', 'kavya2024',
];

export function useSocket(auctionId, initialBid = 0) {
  const [currentBid,   setCurrentBid]   = useState(initialBid);
  const [totalBids,    setTotalBids]     = useState(0);
  const [lastBidder,   setLastBidder]    = useState(null);
  const [isConnected,  setIsConnected]   = useState(false);

  const mockTimerRef = useRef(null);
  const bidCountRef  = useRef(0);

  // ── DEV MOCK: simulates live bidding ─────────────────────────
  const startMock = useCallback((baseBid) => {
    const tick = () => {
      const increment = Math.floor(Math.random() * 2000) + 500; // ₹500–₹2500
      const bidder    = MOCK_BIDDERS[Math.floor(Math.random() * MOCK_BIDDERS.length)];

      setCurrentBid(prev => prev + increment);
      bidCountRef.current += 1;
      setTotalBids(bidCountRef.current);
      setLastBidder(bidder);

      const next = (Math.random() * 7000) + 8000; // 8–15 seconds
      mockTimerRef.current = setTimeout(tick, next);
    };

    const delay = (Math.random() * 5000) + 3000; // first bid after 3–8s
    mockTimerRef.current = setTimeout(tick, delay);
    setIsConnected(true);
  }, []);

  useEffect(() => {
    if (!auctionId) return;

    startMock(initialBid);

    // ── Phase 2: real socket connection (uncomment when server is ready) ──
    // import { io } from 'socket.io-client';
    // const socket = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000');
    // socket.emit('join:auction', { auctionId });
    // socket.on('bid:update', ({ currentBid, totalBids, lastBidder }) => {
    //   setCurrentBid(currentBid);
    //   setTotalBids(totalBids);
    //   setLastBidder(lastBidder);
    // });
    // socket.on('connect', () => setIsConnected(true));
    // socket.on('disconnect', () => setIsConnected(false));
    // return () => { socket.emit('leave:auction', { auctionId }); socket.disconnect(); };

    return () => {
      if (mockTimerRef.current) clearTimeout(mockTimerRef.current);
      setIsConnected(false);
    };
  }, [auctionId]);

  // Sync initialBid when item data loads
  useEffect(() => {
    if (initialBid > 0) setCurrentBid(initialBid);
  }, [initialBid]);

  return { currentBid, totalBids, lastBidder, isConnected };
}
