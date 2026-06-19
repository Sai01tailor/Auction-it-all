console.log("app.js loaded")
const express=require('express')
const morgan=require('morgan')
const cors=require('cors')
const passport = require('./strategies/google.strategy');

const app=express()

// routes imports below !
const authRoutes=require("./routes/auth.routes");
const itemRoutes = require("./routes/item.routes");
const paymentRoutes=require('./routes/payment.routes');
const walletRoutes=require('./routes/wallet.routes');
const transactionRoutes=require('./routes/transaction.routes');
const settlementRoutes=require('./routes/auctionSettlement.routes');
const reviewRoutes=require('./routes/review.routes');

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'))
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Initialize Passport (no session — we use JWT)
app.use(passport.initialize());

// routing below !
app.use('/api/auth',authRoutes);
app.use('/api/items',itemRoutes);
app.use('/api/payments',paymentRoutes);
app.use('/api/wallet',walletRoutes);
app.use('/api/transaction',transactionRoutes);
app.use('/api/settlements',settlementRoutes);
app.use('/api/reviews',reviewRoutes);

//test route 
app.get("/", (req, res) => {
  res.send(`API is running on Worker PID:${process.pid}`);
  console.log(`request Handled by worker ${process.pid}`);
});

module.exports=app
