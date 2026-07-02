const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const DistributedLock = require("../redis/distributed.lock");

// Import all your exact models
const Item = require("../models/item.model");
const Wallet = require("../models/wallet.model");
const Bid = require("../models/bid.model"); // The history ledger

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
    socket.on("join_auction", (auctionId) => {
      socket.join(`auction:${auctionId}`);
      console.log(`User ${socket.user.userId} joined room: auction:${auctionId}`);
    });

    socket.on("leave_auction", (auctionId) => {
      socket.leave(`auction:${auctionId}`);
    });

    // THE CORE BIDDING ENGINE
    socket.on("place_bid", async (data) => {
      const { auctionId, amount } = data;
      const userId = socket.user.userId;
      const lockKey = `lock:auction:${auctionId}`;

      // 1. Engage the Redis Shield
      const lockToken = await DistributedLock.acquireLock(lockKey, 500);

      if (!lockToken) {
        return socket.emit("bid_rejected", {
          message: "Auction is busy processing a bid. Please try again!",
        });
      }

      try {
        // 2. Fetch Data concurrently
        const [item, userWallet] = await Promise.all([
            Item.findById(auctionId),
            Wallet.findOne({ userId: userId })
        ]);

        if (!item) throw new Error("Item not found.");
        if (!userWallet) throw new Error("Wallet not found. Please complete setup.");

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

        // 7. Broadcasts
        io.to(`auction:${auctionId}`).emit("new_bid_update", {
          auctionId,
          newHighestBid: amount,
          bidderId: userId,
          timestamp: new Date(),
        });

        if (previousHighestBidderId) {
          io.to(`user:${previousHighestBidderId}`).emit("outbid_alert", {
            title: "You've been outbid!",
            message: `Someone just bid ₹${amount}. Your 10% deposit has been released. Re-bid now!`,
            auctionId: auctionId,
          });
        }

        socket.emit("bid_accepted", {
          message: "Your bid was placed successfully!",
          amount: amount,
          remainingBiddingPower: userWallet.availableMoney * 10
        });

      } catch (error) {
          // Log the failed attempt just in case you need it for audit
          await Bid.create({
              auctionId: auctionId,
              bidderId: userId,
              amount: amount,
              status: 'REJECTED'
          }).catch(err => console.error("Failed to log rejected bid", err));

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