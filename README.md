# 🎯 BidKar - Live Auction Platform

<div align="center">

**🌐 [Live Demo: bidkar.in](https://bidkar.in)**

![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?logo=redis&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?logo=socket.io&logoColor=white)

**A full-stack, real-time auction platform with live bidding, payments, KYC verification, and comprehensive audit trails.**

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
- [Real-Time Features](#-real-time-features)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Team](#-team)

---

## 🌟 Overview

**BidKar** is a production-ready, real-time auction platform built with modern web technologies. It provides a secure, scalable solution for conducting live auctions with features like:

- **Real-time bidding** with Socket.io for instant updates
- **Distributed locking** with Redis to prevent race conditions
- **Wallet system** with frozen funds for bid deposits
- **Payment gateway** integration (Razorpay)
- **KYC verification** for secure user authentication
- **Automated auction lifecycle** with cron jobs
- **Leaderboards** showing top bidders in real-time
- **Smart notifications** (live popups, email, database inbox)
- **Comprehensive audit trails** for all critical actions
- **PDF generation** for receipts and invoices

Perfect for collectibles, antiques, electronics, real estate, or any item-based auction marketplace.

### 🚀 Live Deployment

- **Live at**: [https://bidkar.in](https://bidkar.in)

---

## ✨ Features

### 🔥 Core Features

#### 1. **Real-Time Bidding Engine**
- WebSocket-based live bidding with instant updates
- Redis distributed locks prevent race conditions
- Server-side timestamp for tie-breaking
- Automatic bid validation and deposit freezing
- Outbid notifications (popup, email, database)

#### 2. **Wallet & Payment System**
- Virtual wallet with available and frozen funds
- 10% bid deposit automatically frozen/refunded
- Razorpay integration for deposits and withdrawals
- Transaction history with status tracking
- PDF receipt generation for all transactions
- Automatic settlement system for sellers

#### 3. **KYC Verification**
- Aadhaar-based verification with OTP
- Two-step verification process
- KYC audit logs for compliance
- Admin oversight for verification status
- IP tracking and device fingerprinting
- **Note**: Uses mock Aadhaar API for development/testing

#### 4. **Auction Management**
- Scheduled auction start/end with cron jobs
- Multiple auction states (DRAFT, ACTIVE, SOLD, CANCELLED)
- Image upload to Cloudinary (up to 5 photos)
- Category-based filtering (10 categories)
- Condition tracking (NEW, LIKE_NEW, GOOD, FAIR)
- Starting price and current bid tracking

#### 5. **Leaderboard System**
- Redis-backed real-time rankings
- Top 5 bidders displayed live
- Efficient sorted set operations
- Auto-updates on every bid

#### 6. **Notification System**
- **Live Popups**: Socket.io for instant alerts
- **Email Fallback**: Resend API for offline users
- **Database Inbox**: Persistent notification history
- Smart detection of online/offline status

#### 7. **Security & Audit**
- JWT authentication with secure tokens
- Google OAuth 2.0 integration
- Comprehensive audit logs (all bid attempts, payments, KYC)
- IP tracking and device fingerprinting
- Protected routes with role-based access

#### 8. **Seller Features**
- Auction settlement system (automated via cron)
- Commission calculation
- Invoice generation (PDF download)
- Settlement tracking with unique IDs
- Review and rating system

#### 9. **Admin Features**
- KYC verification oversight
- Audit log viewer (KYC actions)
- Transaction monitoring
- Review moderation (soft-delete)
- User management

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | Primary database |
| **Mongoose** | ODM for MongoDB |
| **Redis** | Caching, distributed locks, leaderboards |
| **Socket.io** | Real-time bidding engine |
| **JWT** | Authentication |
| **Passport.js** | OAuth integration |
| **Razorpay** | Payment gateway |
| **Cloudinary** | Image storage |
| **Puppeteer** | PDF generation |
| **Resend** | Email service |
| **node-cron** | Scheduled jobs |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite** | Build tool & dev server |

### Infrastructure
- **MongoDB Atlas** - Managed database
- **Upstash Redis** - Managed Redis
- **Render** - Backend hosting
- **Vercel** - Frontend hosting

---

## 🏗 Architecture

### System Overview

```
┌─────────────┐     WebSocket      ┌──────────────┐
│   Client    │ ◄─────────────────► │  Socket.io   │
│  (React)    │                     │   Server     │
└─────────────┘                     └──────────────┘
       │                                    │
       │ HTTP/REST                          │
       ▼                                    ▼
┌─────────────┐                     ┌──────────────┐
│   Express   │ ◄──────────────────►│    Redis     │
│   Routes    │   Distributed Lock  │   (Upstash)  │
└─────────────┘   + Leaderboard     └──────────────┘
       │                                    
       ▼                                    
┌─────────────┐
│   MongoDB   │
│   (Atlas)   │
│             │
│ - Users     │
│ - Items     │
│ - Bids      │
│ - Wallets   │
│ - Auctions  │
└─────────────┘
```

### Bidding Flow

1. **User places bid** → Socket.io receives event
2. **Acquire Redis lock** → Prevents concurrent modifications
3. **Validate bid** → Check balance, auction status, minimum bid
4. **Update database** → Item, Wallet, Bid history (atomic)
5. **Broadcast update** → All connected clients receive new bid
6. **Send notifications** → Outbid alerts (popup/email/database)
7. **Release lock** → Allow next bid
8. **Update leaderboard** → Redis sorted set

---

## 📦 Installation

### Prerequisites

- Node.js >= 16.0.0
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- npm or yarn

### 1. Clone Repository

```bash
git clone https://github.com/Sai01tailor/Auction-it-all.git
cd Auction-it-all
```

### 2. Install Backend Dependencies

```bash
cd Server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../Client
npm install
```

### 4. Configure Environment Variables

Copy the example file and edit with your values:

```bash
cd Server
cp .env.example .env
# Edit .env with your API keys and configuration
```

See `Server/.env.example` for all required variables.

### 5. Start Development Servers

**Backend:**
```bash
cd Server
npm run dev
```

**Frontend:**
```bash
cd Client
npm run dev
```

The backend runs on `http://localhost:3000` and frontend on `http://localhost:5173`.

---

## 📚 API Documentation

### Base URL
- **Local**: `http://localhost:3000`

### Authentication Endpoints

#### Register (Step 1: Send OTP)
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePass123",
  "role": "BUYER"
}
```

#### Verify OTP (Step 2: Complete Registration)
```http
POST /api/auth/verify
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePass123"
}
```

#### Google OAuth
```http
GET /api/auth/google
GET /api/auth/google/callback
```

### Item/Auction Endpoints

#### Get All Items
```http
GET /api/items?status=ACTIVE&category=Electronics&page=1&limit=10
```

#### Create Item (Seller)
```http
POST /api/items
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "Vintage Camera",
  "description": "Rare collectible",
  "startingPrice": 5000,
  "category": "Electronics",
  "startTime": "2026-08-01T10:00:00Z",
  "endTime": "2026-08-01T18:00:00Z",
  "images": [file]
}
```

#### Get Single Item
```http
GET /api/items/:id
```

### Wallet Endpoints

#### Get Wallet Balance
```http
GET /api/wallet/balance
Authorization: Bearer {token}
```

#### Deposit Money (Step 1: Create Order)
```http
POST /api/payments/create-order
Authorization: Bearer {token}

{
  "amount": 10000
}
```

Note: Withdrawal feature - Contact admin or check seller settlement system

### Transaction Endpoints

#### Get Transaction History
```http
GET /api/transaction/history
Authorization: Bearer {token}
```

#### Download Receipt (PDF)
```http
GET /api/transaction/:transactionId/receipt
Authorization: Bearer {token}
```

### KYC Endpoints

#### Initiate KYC Verification
```http
POST /api/kyc/initiate
Authorization: Bearer {token}
Content-Type: application/json

{
  "mobile": "+919876543210"
}
```

#### Verify OTP
```http
POST /api/kyc/verify-otp
Authorization: Bearer {token}

{
  "otp": "123456"
}
```

#### Get KYC Status
```http
GET /api/kyc/status
Authorization: Bearer {token}
```

### Notification Endpoints

#### Get All Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```

#### Mark as Read
```http
PATCH /api/notifications/:id/read
Authorization: Bearer {token}
```

---

## ⚡ Real-Time Features

### Socket.io Events

#### Client → Server

**Join Auction Room**
```javascript
socket.emit('join_auction', auctionId);
```

**Place Bid**
```javascript
socket.emit('place_bid', {
  auctionId: '507f1f77bcf86cd799439011',
  amount: 15000
});
```

**Leave Auction Room**
```javascript
socket.emit('leave_auction', auctionId);
```

#### Server → Client

**New Bid Update**
```javascript
socket.on('new_bid_update', (data) => {
  // { auctionId, newHighestBid, bidderId, timestamp }
  console.log(`New highest bid: ₹${data.newHighestBid}`);
});
```

**Leaderboard Update**
```javascript
socket.on('leaderboard_update', (data) => {
  // { leaderboard: [{ username, amount, rank }] }
  updateLeaderboardUI(data.leaderboard);
});
```

**Bid Accepted**
```javascript
socket.on('bid_accepted', (data) => {
  // { message, amount, remainingBiddingPower }
  showSuccess(data.message);
});
```

**Bid Rejected**
```javascript
socket.on('bid_rejected', (data) => {
  // { message }
  showError(data.message);
});
```

**Outbid Alert**
```javascript
socket.on('outbid_alert', (data) => {
  // { title, message, auctionId }
  showNotification(data.title, data.message);
});
```

### Connection Example

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});

socket.on('connect', () => {
  console.log('Connected to auction server');
  socket.emit('join_auction', auctionId);
});

socket.on('new_bid_update', (data) => {
  // Update UI with new bid
});
```

---

## 📊 Database Schema

### Key Collections

#### Users
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  role: Enum['BUYER', 'SELLER', 'ADMIN'],
  isKYCVerified: Boolean,
  googleId: String (optional),
  createdAt: Date
}
```

#### Items (Auctions)
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  startingPrice: Number,
  currentHighestBid: Number,
  winnerId: ObjectId (ref: User),
  sellerId: ObjectId (ref: User),
  status: Enum['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
  startTime: Date,
  endTime: Date,
  category: String,
  images: [String],
  createdAt: Date
}
```

#### Bids (History Ledger)
```javascript
{
  _id: ObjectId,
  auctionId: ObjectId (ref: Item),
  bidderId: ObjectId (ref: User),
  amount: Number,
  status: Enum['ACCEPTED', 'REJECTED', 'OUTBID'],
  ipAddress: String,
  timestamp: Date
}
```

#### Wallets
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  availableMoney: Number,
  frozenMoney: Number,
  totalDeposited: Number,
  totalWithdrawn: Number
}
```

#### Transactions
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: Enum['DEPOSIT', 'WITHDRAWAL', 'REFUND', 'PAYMENT'],
  amount: Number,
  status: Enum['PENDING', 'COMPLETED', 'FAILED'],
  razorpayOrderId: String,
  razorpayPaymentId: String,
  createdAt: Date
}
```

---

## 📁 Project Structure

```
Auction-it-all/
├── Client/                    # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── Server/                    # Node.js Backend
│   ├── config/
│   │   └── redis.js          # Redis connection
│   │
│   ├── controllers/          # Business logic
│   │   ├── auth.controller.js
│   │   ├── item.controller.js
│   │   ├── payment.controller.js
│   │   ├── wallet.controller.js
│   │   ├── kyc.controller.js
│   │   ├── notification.controller.js
│   │   └── ... (more controllers)
│   │
│   ├── models/               # MongoDB schemas
│   │   ├── user.model.js
│   │   ├── item.model.js
│   │   ├── bid.model.js
│   │   ├── wallet.model.js
│   │   └── ... (more models)
│   │
│   ├── routes/               # API routes
│   │   ├── auth.routes.js
│   │   ├── item.routes.js
│   │   ├── payment.routes.js
│   │   └── ... (more routes)
│   │
│   ├── middlewares/          # Custom middleware
│   │   ├── auth.middleware.js
│   │   ├── kycVerification.middleware.js
│   │   └── auditTracker.middleware.js
│   │
│   ├── sockets/              # WebSocket logic
│   │   └── socket.js
│   │
│   ├── redis/                # Redis utilities
│   │   ├── distributed.lock.js
│   │   └── auction.cache.js
│   │
│   ├── jobs/                 # Cron jobs
│   │   ├── auctionStarter.job.js
│   │   ├── auctionCloser.job.js
│   │   └── scheduler.js
│   │
│   ├── services/             # Business services
│   │   └── leaderboard.service.js
│   │
│   ├── utils/                # Helper functions
│   │   ├── mailer.js
│   │   └── pdfGenerator.js
│   │
│   ├── app.js                # Express app setup
│   ├── Index.js              # Server entry point
│   ├── connection.js         # Database connection
│   ├── .env.example          # Environment template
│   └── package.json
│
└── README.md                 # This file
```

---

## 👥 Team

### Contributors

- **[@Sai01tailor](https://github.com/Sai01tailor)** - Frontend Development
- **[@Krish-9441](https://github.com/Krish-9441)** - Backend Development
- **[@Preet-Kotak](https://github.com/Preet-Kotak)** - Backend Development
