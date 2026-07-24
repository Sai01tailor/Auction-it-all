console.log("app.js loaded")
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const compression = require('compression');
const passport = require('./strategies/google.strategy');

const app = express()

// Enable gzip/brotli compression for HTML, JSON, XML, and assets
app.use(compression());

// routes imports below !
const authRoutes = require("./routes/auth.routes");
const itemRoutes = require("./routes/item.routes");
const paymentRoutes = require('./routes/payment.routes');
const walletRoutes = require('./routes/wallet.routes');
const transactionRoutes = require('./routes/transaction.routes');
const settlementRoutes = require('./routes/auctionSettlement.routes');
const reviewRoutes = require('./routes/review.routes');
const sellerRoutes = require('./routes/seller.routes');
const auditLogRoutes = require('./routes/auditLog.routes');
const KYCRoutes = require('./routes/kyc.routes')
const sitemapRoutes = require('./routes/sitemap.routes');

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'))
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Initialize Passport (no session — we use JWT)
app.use(passport.initialize());

// routing below !
app.use('/sitemap.xml', sitemapRoutes);
app.use('/api/sitemap.xml', sitemapRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/kyc', KYCRoutes)
//test route 
app.get("/", (req, res) => {
  res.send(`API is running on Worker PID:${process.pid}`);
  console.log(`request Handled by worker ${process.pid}`);
});

module.exports = app
