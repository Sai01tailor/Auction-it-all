const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const DistributedLock = require("../redis/distributed.lock");
const AuditLog = require("../models/auditLog.model");

// Import all your exact models
const Item = require("../models/item.model");
const Wallet = require("../models/wallet.model");
const Bid = require("../models/bid.model"); // The history ledger

// <-- NEW (Notifications): Import the Model and Mailer
const Notification = require("../models/notification.model");
const { sendEmail } = require("../utils/mailer");

// Import User model and Leaderboard Service
const User = require("../models/user.model"); 
const LeaderboardService = require("../services/leaderboard.service");

let io;

const initSockets = (server) => {
  io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // Security Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error: No token provided"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; 
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 User connected: ${socket.user.userId}`);

    // Join personal room for private popup alerts
    socket.join(`user:${socket.user.userId}`);

    // Join/Leave Auction Rooms
    socket.on("join_auction", async (auctionId) => {
      socket.join(`auction:${auctionId}`);
      console.log(`User ${socket.user.userId} joined room: auction:${auctionId}`);

      // Instantly fetch and send Top 5 on join
      const leaderboard = await LeaderboardService.getTopBidders(auctionId);
      socket.emit("leaderboard_update", { leaderboard });
    });

    socket.on("leave_auction", (auctionId) => {
      socket.leave(`auction:${auctionId}`);
    });

    // THE CORE BIDDING ENGINE
    socket.on("place_bid", async (data) => {
      const { auctionId, amount } = data;
      const userId = socket.user.userId;
      const lockKey = `lock:auction:${auctionId}`;
      const serverReceivedAt = Date.now(); // Millisecond timestamp for tie-breaking

      // Log bid attempt — BEFORE lock
      await AuditLog.create({
        userId,
        action: 'BID_ATTEMPT',
        ipAddress: socket.handshake.address,
        deviceInfo: socket.handshake.headers['user-agent'],
        metadata: {
          auctionId,
          amount,
          serverReceivedAt,
          serverId: process.pid,
          socketId: socket.id
        }
      }).catch(err => console.error('Audit log failed:', err));

      // 1. Engage the Redis Shield
      const lockToken = await DistributedLock.acquireLock(lockKey, 500);

      if (!lockToken) {
        // Log lock rejection
        await AuditLog.create({
          userId,
          action: 'BID_REJECTED',
          ipAddress: socket.handshake.address,
          metadata: {
            auctionId,
            amount,
            serverReceivedAt,
            serverId: process.pid,
            reason: 'LOCK_BUSY'
          }
        }).catch(err => console.error('Audit log failed:', err));

        return socket.emit("bid_rejected", {
          message: "Auction is busy processing a bid. Please try again!",
        });
      }

      try {
        // 2. Fetch Data concurrently
        const [item, userWallet, user] = await Promise.all([
            Item.findById(auctionId),
            Wallet.findOne({ userId: userId }),
            User.findById(userId).select("username") 
        ]);

        if (!item) throw new Error("Item not found.");
        if (!userWallet) throw new Error("Wallet not found. Please complete setup.");
        if (!user) throw new Error("User not found."); 

        if (item.status !== "ACTIVE" || Date.now() > new Date(item.endTime).getTime()) {
          throw new Error("This auction has already ended.");
        }
        
        const minRequiredBid = item.currentHighestBid > 0 ? item.currentHighestBid : item.startingPrice;
        if (amount <= minRequiredBid && item.currentHighestBid > 0) {
            throw new Error(`Bid must be higher than ₹${minRequiredBid}.`);
        } else if (amount < minRequiredBid) {
            throw new Error(`Starting price is ₹${minRequiredBid}.`);
        }

        const requiredDeposit = amount * 0.10;
        
        if (userWallet.availableMoney < requiredDeposit) {
            throw new Error(`Insufficient Bidding Power. You need ₹${requiredDeposit} available to place this bid.`);
        }

        const previousHighestBidderId = item.winnerId ? item.winnerId.toString() : null;

        if (previousHighestBidderId === userId) {
            throw new Error("You are already the highest bidder!");
        }

        // 3. Log the successful bid in the history ledger
        await Bid.create({
            auctionId: item._id,
            bidderId: userId,
            amount: amount,
            status: 'ACCEPTED',
            ipAddress: socket.handshake.address
        });

        // 4. Handle Previous Bidder (Refund & Mark as Outbid)
        if (previousHighestBidderId) {
            const previousBidDeposit = item.currentHighestBid * 0.10;
            
            // Refund Wallet
            await Wallet.findOneAndUpdate(
                { userId: previousHighestBidderId },
                { $inc: { frozenMoney: -previousBidDeposit, availableMoney: previousBidDeposit } }
            );
            
            // Mark their old bid as OUTBID in the ledger
            await Bid.updateMany(
                { auctionId: item._id, bidderId: previousHighestBidderId, status: 'ACCEPTED' },
                { status: 'OUTBID' }
            );
        }

        // 5. Freeze money for the NEW bidder
        userWallet.availableMoney -= requiredDeposit;
        userWallet.frozenMoney += requiredDeposit;
        await userWallet.save();

        // 6. Update the Item
        item.currentHighestBid = amount;
        item.winnerId = userId;
        await item.save();

        // Update Redis and get the new rankings
        const leaderboard = await LeaderboardService.updateLeaderboard(auctionId, user.username, amount);

        // 7. Broadcasts
        io.to(`auction:${auctionId}`).emit("new_bid_update", {
          auctionId,
          newHighestBid: amount,
          bidderId: userId,
          timestamp: new Date(),
        });

        // Broadcast the Golden Leaderboard to everyone!
        io.to(`auction:${auctionId}`).emit("leaderboard_update", { leaderboard });

        // <-- NEW: SMART OUTBID NOTIFICATIONS -->
        if (previousHighestBidderId) {
          const outbidMessage = `Someone just bid ₹${amount}. Your 10% deposit has been released. Re-bid now!`;

          // A. Send Live Socket Popup (Always attempt)
          io.to(`user:${previousHighestBidderId}`).emit("outbid_alert", {
            title: "You've been outbid!",
            message: outbidMessage,
            auctionId: auctionId,
          });

          // B. Save to Database Inbox (Always save for history)
          await Notification.create({
              userId: previousHighestBidderId,
              type: 'OUTBID',
              title: "You've been outbid!",
              message: outbidMessage,
              auctionId: auctionId
          });

          // C. Check if offline, if yes -> Send Email
          const userRoom = io.sockets.adapter.rooms.get(`user:${previousHighestBidderId}`);
          const isOnline = userRoom && userRoom.size > 0;

          if (!isOnline) {
              const previousUser = await User.findById(previousHighestBidderId).select("email username");
              if (previousUser) {
                  await sendEmail(
                      previousUser.email,
                      "You've been outbid! - BidKar",
                      `<h2>Hello ${previousUser.username},</h2>
                       <p>${outbidMessage}</p>
                       <p>Log in now to reclaim your item before time runs out!</p>`
                  );
              }
          }
        }

        socket.emit("bid_accepted", {
          message: "Your bid was placed successfully!",
          amount: amount,
          remainingBiddingPower: userWallet.availableMoney * 10
        });

        // Log successful bid
        await AuditLog.create({
          userId,
          action: 'BID_ACCEPTED',
          ipAddress: socket.handshake.address,
          metadata: {
            auctionId,
            amount,
            serverReceivedAt,
            serverId: process.pid,
            previousWinnerId: previousHighestBidderId
          }
        }).catch(err => console.error('Audit log failed:', err));

      } catch (error) {
          // Log the failed attempt just in case you need it for audit
          await Bid.create({
              auctionId: auctionId,
              bidderId: userId,
              amount: amount,
              status: 'REJECTED'
          }).catch(err => console.error("Failed to log rejected bid", err));

          // Audit log for validation failure
          await AuditLog.create({
            userId,
            action: 'BID_REJECTED',
            ipAddress: socket.handshake.address,
            metadata: {
              auctionId,
              amount,
              serverReceivedAt,
              serverId: process.pid,
              reason: error.message
            }
          }).catch(err => console.error('Audit log failed:', err));

          socket.emit("bid_rejected", { message: error.message });
      } finally {
        await DistributedLock.releaseLock(lockKey, lockToken);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.userId}`);
    });
  });
};

const getIo = () => {
  if (!io) throw new Error("Socket.io is not initialized!");
  return io;
};

module.exports = { initSockets, getIo };