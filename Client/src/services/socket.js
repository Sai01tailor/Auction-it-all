let socket = null;
let socketInitialized = false;

// Lazy load socket.io-client
async function loadSocket() {
  if (socketInitialized) return socket;
  try {
    const { default: io } = await import('socket.io-client');
    return io;
  } catch (error) {
    console.warn('socket.io-client not available:', error);
    return null;
  }
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export async function initializeSocket(token) {
  try {
    if (socket?.connected) return socket;

    const io = await loadSocket();
    if (!io) {
      console.warn('Socket.io client not loaded');
      return null;
    }

    socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('🟢 WebSocket connected');
      socketInitialized = true;
    });

    socket.on('disconnect', () => {
      console.log('🔴 WebSocket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('⚠️ WebSocket connection error:', error);
    });

    socketInitialized = true;
    return socket;
  } catch (error) {
    console.error('Failed to initialize socket:', error);
    socketInitialized = false;
    return null;
  }
}

export function getSocket() {
  return socket;
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function isConnected() {
  return socket?.connected || false;
}

// ==================== Event Listeners ====================

/**
 * Listen to real-time bid updates
 * Data: { itemId, bidAmount, bidderUsername, timestamp }
 */
export function onBidUpdate(callback) {
  if (socket) {
    socket.on('bid:update', callback);
  }
}

export function offBidUpdate(callback) {
  if (socket) {
    socket.off('bid:update', callback);
  }
}

/**
 * Listen to auction ending soon notification
 * Data: { itemId, timeRemaining }
 */
export function onAuctionEnding(callback) {
  if (socket) {
    socket.on('auction:ending', callback);
  }
}

export function offAuctionEnding(callback) {
  if (socket) {
    socket.off('auction:ending', callback);
  }
}

/**
 * Listen to auction ended notification
 * Data: { itemId, winnerId, finalBidAmount, status }
 */
export function onAuctionEnded(callback) {
  if (socket) {
    socket.on('auction:ended', callback);
  }
}

export function offAuctionEnded(callback) {
  if (socket) {
    socket.off('auction:ended', callback);
  }
}

/**
 * Listen to Dutch auction item sold notification
 * Data: { itemId, buyerId, purchasePrice, timestamp }
 */
export function onItemSold(callback) {
  if (socket) {
    socket.on('item:sold', callback);
  }
}

export function offItemSold(callback) {
  if (socket) {
    socket.off('item:sold', callback);
  }
}

/**
 * Listen to leaderboard updates
 * Data: { itemId, topBidders[] }
 */
export function onLeaderboardUpdate(callback) {
  if (socket) {
    socket.on('leaderboard:update', callback);
  }
}

export function offLeaderboardUpdate(callback) {
  if (socket) {
    socket.off('leaderboard:update', callback);
  }
}

// ==================== Emitters ====================

/**
 * Emit join item event to subscribe to specific auction
 */
export function joinAuction(itemId) {
  if (socket) {
    socket.emit('auction:join', { itemId });
  }
}

/**
 * Emit leave item event to unsubscribe from specific auction
 */
export function leaveAuction(itemId) {
  if (socket) {
    socket.emit('auction:leave', { itemId });
  }
}
