# BidKar.in — Detailed Client-to-Server API Router Document

This document outlines the API specifications required for the BidKar backend to support the Phase 2, 3, 4, and 5 features of the React frontend. It lists all endpoints, including those currently integrated (fully/partially) and the "dead ends" (missing/mocked connections) identified in the frontend codebase.

---

## 📋 Executive Summary of Missing Integrations (Dead Ends)

During a full scan of the frontend components, the following features were found to accept user input but run entirely on mock logic, local storage, or browser-only timeouts. The backend development team **must prioritize building these endpoints** to wire up the functional user journeys:

1. **KYC Document Upload (PAN Flow)**: Aadhaar OTP is wired up, but the PAN flow (uploading front/back images, typing a 10-char alphanumeric PAN, and snapping a webcam liveness selfie) is mocked. Requires a multipart file upload API.
2. **Wallet Balance & Payment Gateway Top-Up**: Wallet balance, transaction records (Passbook), and 10x leverage calculation are stored and managed entirely in the browser's `localStorage`. Requires Razorpay checkout APIs and transaction logging.
3. **Receipt PDF Generator**: Downloading a transaction receipt triggers a dummy alert. Requires a PDF generation microservice/route.
4. **Bidding Engine Terminals**: placing bids in English, buying Dutch items, submitting sealed blind bids, and unmasking blind reveal rankings are mocked in service layers via timeouts and `localStorage` syncing. Requires real-time WebSocket socket events and REST endpoints.
5. **Create Listing custom fields**: Format details (reserve price, drops, deadlines) and handoff coordinates are stripped from the `POST /items` request and saved in the seller's local storage.
6. **Seller Studio Dashboard & Storefront**: Aggregated counts (live revenue, pending handoffs) and historical success ratings are calculated on the client.
7. **Support Hub Form**: Sending a message from the Contact page displays a mock ticket code via `setTimeout`.
8. **User Settings**: No Settings page or language persistence route exists.

---

## 1. 🔑 Authentication & Session Management (P13)

These routes handle onboarding, OTP validation, user login, and session persistence.

### 1.1 Sign Up / User Registration
- **Endpoint:** `POST /api/signup`
- **HTTP Method:** `POST`
- **Purpose:** Registers a new user account and initiates email/mobile OTP verification.
- **Required Payload:**
  ```json
  {
    "username": "ramesh_kumar",
    "email": "ramesh@gmail.com",
    "mobile": "+91 98765 43210",
    "password": "securepassword123",
    "role": "USER"
  }
  ```
- **Example Response:**
  ```json
  {
    "success": true,
    "message": "Verification OTP sent to your registered email."
  }
  ```
- **Status:** **Implemented in Frontend** (`src/Pages/Signup&login/AuthPage.jsx`)

### 1.2 Verify Registered Email / Mobile
- **Endpoint:** `POST /api/verify`
- **HTTP Method:** `POST`
- **Purpose:** Validates the 6-digit OTP code submitted by the user to activate their account.
- **Required Payload:**
  ```json
  {
    "email": "ramesh@gmail.com",
    "otp": "123456"
  }
  ```
- **Example Response:**
  ```json
  {
    "success": true,
    "message": "Email verified successfully. You can now login."
  }
  ```
- **Status:** **Implemented in Frontend** (`src/Pages/Signup&login/AuthPage.jsx`)

### 1.3 Resend Registration OTP
- **Endpoint:** `POST /api/resend-otp`
- **HTTP Method:** `POST`
- **Purpose:** Resends a new OTP registration code to the user.
- **Required Payload:**
  ```json
  {
    "email": "ramesh@gmail.com"
  }
  ```
- **Status:** **Implemented in Frontend** (`src/Pages/Signup&login/AuthPage.jsx`)

### 1.4 Email & Password Login
- **Endpoint:** `POST /api/login`
- **HTTP Method:** `POST`
- **Purpose:** Authenticates user credentials and issues a JSON Web Token.
- **Required Payload:**
  ```json
  {
    "email": "ramesh@gmail.com",
    "password": "securepassword123"
  }
  ```
- **Example Response:**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "60d0fe4f5311236168a109a0",
      "username": "ramesh_kumar",
      "email": "ramesh@gmail.com"
    }
  }
  ```
- **Status:** **Implemented in Frontend** (`src/Pages/Signup&login/AuthPage.jsx`)

### 1.5 Google OAuth Authentication
- **Endpoint:** `POST /api/auth/google`
- **HTTP Method:** `POST`
- **Purpose:** Authenticates a user via Google OAuth Access Token.
- **Required Payload:**
  ```json
  {
    "token": "ya29.a0AfB_byD..."
  }
  ```
- **Status:** **Implemented in Frontend** (`src/Pages/Signup&login/AuthPage.jsx`)

### 1.6 Request Password Reset OTP
- **Endpoint:** `POST /api/forgot-password`
- **HTTP Method:** `POST`
- **Purpose:** Requests a reset OTP code for users who forgot their password.
- **Required Payload:**
  ```json
  {
    "email": "ramesh@gmail.com"
  }
  ```
- **Status:** **Implemented in Frontend** (`src/Pages/Signup&login/ForgotPassword.jsx`)

### 1.7 Confirm Password Reset
- **Endpoint:** `POST /api/reset-password`
- **HTTP Method:** `POST`
- **Purpose:** Submits the OTP code along with the new password to finalize the reset.
- **Required Payload:**
  ```json
  {
    "email": "ramesh@gmail.com",
    "otp": "654321",
    "newPassword": "newsecurepassword456"
  }
  ```
- **Status:** **Implemented in Frontend** (`src/Pages/Signup&login/ForgotPassword.jsx`)

### 1.8 Fetch Logged-In User Profile (Token Check)
- **Endpoint:** `GET /api/me`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Validates the JWT cookie/interceptor and fetches user account details.
- **Example Response:**
  ```json
  {
    "success": true,
    "user": {
      "_id": "60d0fe4f5311236168a109a0",
      "username": "ramesh_kumar",
      "email": "ramesh@gmail.com",
      "role": "USER",
      "kycStatus": "Verified"
    }
  }
  ```
- **Status:** **Implemented in Frontend** (`src/Context/AuthContext.jsx`)

---

## 2. ⚙️ User Settings & Storefront Profiles (P27 & P11)

These endpoints provide user setting adjustments and public profile details.

### 2.1 Update User Settings & Preferred Language
- **Endpoint:** `PATCH /api/users/me`
- **HTTP Method:** `PATCH`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Saves profile edits (name, picture), switches preferred application language (English, Hindi, Gujarati) for persistence, toggles SMS/Email/Push alerts, and activates 2FA.
- **Required Payload:**
  ```json
  {
    "preferredLanguage": "Hindi",
    "twoFactorEnabled": false,
    "profileName": "Ramesh Kumar Sharma",
    "notifications": {
      "sms": true,
      "email": true,
      "push": false
    }
  }
  ```
- **Status:** 🔴 **UI Only / Missing API** (The Settings menu currently redirects to `/dashboard` as the settings page is not built).

### 2.2 Get Public Seller Storefront Profile
- **Endpoint:** `GET /api/users/:id/profile`
- **HTTP Method:** `GET`
- **Purpose:** Returns public storefront details for trust building, including joined date, Aadhaar verification state, successful handoff rate, and past buyer reviews.
- **Example Response:**
  ```json
  {
    "success": true,
    "profile": {
      "username": "lux_seller_surat",
      "kycStatus": "VERIFIED",
      "joinedDate": "2025-10-15T00:00:00.000Z",
      "reputation": 4.9,
      "successRate": 97,
      "totalSold": 24,
      "reviews": [
        {
          "reviewer": "r***a_sharma",
          "rating": 5,
          "comment": "Excellent watch condition, very smooth handoff at Diamond Hall Surat.",
          "createdAt": "2026-06-17T12:00:00.000Z"
        }
      ]
    }
  }
  ```
- **Status:** 🔴 **UI Only / Missing API** (MOCK data is deterministically injected by the client-side `getSellerProfile` service function).

---

## 3. 🛡️ Identity Verification / KYC Portal (P14)

These routes handle regulatory verification required before a user is permitted to place escrow-backed bids.

### 3.1 Fetch KYC Verification Status
- **Endpoint:** `GET /api/kyc/status`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Retrieves the current user's KYC verification status on mount.
- **Status:** **Implemented in Frontend** (`src/Pages/KYCPage.jsx`)

### 3.2 Initiate Aadhaar KYC Verification
- **Endpoint:** `POST /api/kyc/initiate`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Contacts a third-party KYC gateway (e.g., SurePass/Digio) to request an OTP code for the provided Aadhaar number.
- **Required Payload:**
  ```json
  {
    "aadhaarNumber": "543210987654"
  }
  ```
- **Example Response:**
  ```json
  {
    "success": true,
    "verificationRequestId": "req_val_990312"
  }
  ```
- **Status:** **Implemented in Frontend** (`src/Pages/KYCPage.jsx`)

### 3.3 Confirm Aadhaar Verification OTP
- **Endpoint:** `POST /api/kyc/verify-otp`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Submits the OTP received by the user on their Aadhaar-registered mobile to verify identity.
- **Required Payload:**
  ```json
  {
    "verificationRequestId": "req_val_990312",
    "otp": "456789"
  }
  ```
- **Status:** **Implemented in Frontend** (`src/Pages/KYCPage.jsx`)

### 3.4 Submit PAN Card & Liveness Webcam Snapshot
- **Endpoint:** `POST /api/kyc/pan`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: multipart/form-data`
- **Purpose:** Submits a 10-character PAN number along with files for the front card image, back card image, and a webcam selfie image to verify identity.
- **Required Payload (Multipart Form Data):**
  - `panNumber`: `"ABCDE1234F"`
  - `frontImage`: `[File Binary]`
  - `backImage`: `[File Binary]`
  - `selfie`: `[File Binary]`
- **Status:** 🔴 **UI Only / Missing API** (The form is fully constructed in `KYCPage.jsx` but submission triggers a dummy `setTimeout` and updates local state without invoking a server request).

---

## 4. 💳 Wallet & Escrow Passbook (P15 & P16)

Wallet balance and 10% bid locks must be managed on the server to prevent tamper-based bidding.

### 4.1 Fetch Wallet Balance & Bidding Power
- **Endpoint:** `GET /api/wallet/balance`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Retrieves the authenticated user's wallet cash balance and active bidding limits.
- **Example Response:**
  ```json
  {
    "success": true,
    "walletBalance": 15000,
    "biddingPower": 150000
  }
  ```
- **Status:** 🔴 **UI Only / Missing API** (Managed in the client-side `WalletContext.jsx` file using `localStorage`).

### 4.2 Top Up Wallet Funds (Razorpay Integration)
- **Endpoint:** `POST /api/wallet/topup`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Finalizes a payment gateway top-up transaction.
- **Required Payload:**
  ```json
  {
    "amount": 25000,
    "razorpayPaymentId": "pay_O1h92jKlNs38",
    "razorpayOrderId": "order_Kz0982312nN",
    "razorpaySignature": "signature_hash_..."
  }
  ```
- **Status:** 🔴 **UI Only / Missing API** (Simulated as a mock timeout inside `WalletContext.jsx`).

### 4.3 Fetch Transaction Ledger (Passbook Ledger)
- **Endpoint:** `GET /api/transactions`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters:** `type` (optional: `'ALL' | 'TOP-UP' | 'HELD' | 'REFUNDED' | 'CAPTURED'`)
- **Purpose:** Retrieves a status-coded log of the user's deposits, holds, refunds, and payments.
- **Example Response:**
  ```json
  {
    "success": true,
    "transactions": [
      {
        "id": "tx-8f92kc",
        "type": "HELD",
        "itemId": "60d0fe4f5311236168a109a5",
        "title": "10% Bid Deposit: Luxury Watch Brand X",
        "amount": 60000,
        "status": "SUCCESS",
        "date": "2026-06-19T09:41:00.000Z"
      }
    ]
  }
  ```
- **Status:** 🔴 **UI Only / Missing API** (Loaded from local storage inside `TransactionLedgerPage.jsx`).

### 4.4 Download PDF Transaction Receipt
- **Endpoint:** `GET /api/transactions/:id/receipt`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Generates and returns a downloadable tax invoice receipt PDF file for the specific transaction ID.
- **Status:** 🔴 **UI Only / Missing API** (Clicking "Download Receipt" in `TransactionLedgerPage.jsx` triggers a dummy alert `alert()`).

---

## 5. 🏷️ Auction Listing & Discovery (P01, P02, P03, P19)

### 5.1 Fetch Active Items
- **Endpoint:** `GET /api/items`
- **HTTP Method:** `GET`
- **Query Parameters:** `status=ACTIVE`
- **Status:** **Implemented in Frontend** (`src/services/auctionService.js`)

### 5.2 Fetch Single Item Detail
- **Endpoint:** `GET /api/items/:id`
- **HTTP Method:** `GET`
- **Status:** **Implemented in Frontend** (`src/services/auctionService.js`)

### 5.3 Fetch Featured Auctions
- **Endpoint:** `GET /api/auctions/featured`
- **HTTP Method:** `GET`
- **Purpose:** Retrieves a list of trending or high-value auctions for the home page.
- **Status:** 🔴 **UI Only / Missing API** (Mocked in the frontend by fetching `/api/items` and sorting by highest bid amount).

### 5.4 Fetch Ending Soon Auctions
- **Endpoint:** `GET /api/auctions/ending-soon`
- **HTTP Method:** `GET`
- **Purpose:** Retrieves items closest to their expiration time.
- **Status:** 🔴 **UI Only / Missing API** (Mocked in the frontend by fetching `/api/items` and sorting by ending time).

### 5.5 Create Listing (Extended payload)
- **Endpoint:** `POST /api/items`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: multipart/form-data`
- **Purpose:** Submits listing details and photos.
- **Required Payload (Multipart Form Data):**
  - `title`: `"Luxury Watch Brand X"`
  - `description`: `"Vintage luxury mechanical watch..."`
  - `startingPrice`: `"600000"`
  - `startTime`: `"2026-06-19T10:00:00.000Z"`
  - `endTime`: `"2026-06-20T10:00:00.000Z"`
  - `photos`: `[File Binary]`
  - `auctionType`: `"ENGLISH" | "DUTCH" | "BLIND"`
  - `meetingPoint`: `"Tanishq Showroom, Surat Station Road, Gujarat"`
  - `reservePrice`: `"65000"` *(Required if ENGLISH)*
  - `bidIncrement`: `"2500"` *(Required if ENGLISH)*
  - `priceFloor`: `"45000"` *(Required if DUTCH)*
  - `dropAmount`: `"5000"` *(Required if DUTCH)*
  - `dropInterval`: `"30"` *(Required if DUTCH)*
  - `revealTime`: `"2026-06-20T10:15:00.000Z"` *(Required if BLIND)*
- **Status:** ⚠️ **Partially Implemented** (The basic fields `title`, `description`, `startingPrice`, `startTime`, `endTime`, and `photos` are sent to the server. However, `auctionType`, `meetingPoint`, and format-specific parameters are intercepted and saved in `localStorage` under `local_auction_details:${itemId}` because the backend lacks columns/schema support).

---

## 6. ⚔️ Bidding Engines (P04 - P09)

These endpoints run the real-time core mechanics of English, Dutch, and Blind auctions.

### 6.1 Place English Bid
- **Endpoint:** `POST /api/auctions/:id/bid`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Places a rising bid in an English auction. Validates the bid increment and locks a 10% deposit.
- **Required Payload:**
  ```json
  {
    "amount": 610000
  }
  ```
- **Status:** 🔴 **UI Only / Missing API** (Bids are simulated on the client via `placeBid` inside `auctionService.js`).

### 6.2 Buy Now Dutch Auction
- **Endpoint:** `POST /api/auctions/:id/buy-dutch`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Performs a high-speed Dutch purchase, claiming the item instantly. Uses database locking to prevent double-buys.
- **Status:** 🔴 **UI Only / Missing API** (Simulated on the client via `buyNowDutch` inside `auctionService.js`).

### 6.3 Submit Secret Blind Bid
- **Endpoint:** `POST /api/auctions/:id/blind-bid`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Submits an encrypted secret bid. The bid value is concealed from all users (except Admin logs) until revealDate.
- **Required Payload:**
  ```json
  {
    "amount": 625000
  }
  ```
- **Status:** 🔴 **UI Only / Missing API** (Submissions are written to local storage under `blind_bid:${itemId}:You` inside `auctionService.js`).

### 6.4 Fetch Blind Reveal Leaderboard
- **Endpoint:** `GET /api/auctions/:id/blind-reveal`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Retrieves a decrypted ranked leaderboard of all sealed bids submitted after the deadline passes.
- **Example Response:**
  ```json
  {
    "success": true,
    "bids": [
      { "bidder": "a***j_22", "amount": 630000, "timestamp": "2026-06-19T09:30:00Z" },
      { "bidder": "You", "amount": 625000, "timestamp": "2026-06-19T09:35:00Z" },
      { "bidder": "v***r_78", "amount": 605000, "timestamp": "2026-06-19T09:20:00Z" }
    ],
    "winner": { "bidder": "a***j_22", "amount": 630000 }
  }
  ```
- **Status:** 🔴 **UI Only / Missing API** (Mocked in the frontend via `getBlindRevealData` inside `auctionService.js`).

### 6.5 Fetch Bid History Archive
- **Endpoint:** `GET /api/auctions/:id/history`
- **HTTP Method:** `GET`
- **Purpose:** Retrieves the sorted bid history for transparency records once an auction is completed (P06).
- **Status:** 🔴 **UI Only / Missing API** (The page `Bid History Archive` is missing an API connection).

---

## 7. 🎨 Seller Studio Management (P18)

These aggregate routes are used by sellers to monitor performance.

### 7.1 Fetch Seller Dashboard Statistics
- **Endpoint:** `GET /api/seller/dashboard`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Purpose:** Retrieves listing data for the logged-in seller and computes aggregations like active listing counts, potential live revenue, and pending/completed sales.
- **Example Response:**
  ```json
  {
    "success": true,
    "metrics": {
      "liveRevenue": 120000,
      "pendingHandoffsCount": 2,
      "completedSales": 450000
    },
    "items": [
      {
        "_id": "60d0fe4f5311236168a109a5",
        "title": "Luxury Watch Brand X",
        "startingPrice": 600000,
        "endTime": "2026-06-20T10:00:00Z",
        "auctionType": "ENGLISH"
      }
    ]
  }
  ```
- **Status:** 🔴 **UI Only / Missing API** (Mocked on the client inside `getSellerDashboard()` by loading all items from `/api/items` and filtering locally by `sellerId`).

---

## 8. 🔔 Notifications Center (P20)

These routes load, read, and manage in-app notification logs.

### 8.1 Fetch Notifications List
- **Endpoint:** `GET /api/notifications`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters:** `type` (optional: `'All' | 'Bids' | 'Payments' | 'System Alerts'`)
- **Status:** **Implemented in Frontend** (`src/Components/Global/Header.jsx`)

### 8.2 Mark Single Notification Read
- **Endpoint:** `PATCH /api/notifications/:id/read`
- **HTTP Method:** `PATCH`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Components/Global/Header.jsx`)

### 8.3 Mark All Notifications Read
- **Endpoint:** `POST /api/notifications/read-all`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Components/Global/Header.jsx`)

---

## 9. 🤝 Logistical Handoff Room (P21 & P22)

These endpoints handle coordination and payments between the winner and seller.

### 9.1 Fetch Handoff Room Coordinates & Status
- **Endpoint:** `GET /api/handoff/item/:itemId`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Pages/HandoffRoomPage.jsx`)

### 9.2 Capture Escrow Deposit
- **Endpoint:** `POST /api/handoff/:id/capture-deposit`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Pages/HandoffRoomPage.jsx`)

### 9.3 Sync Checklist Checkboxes
- **Endpoint:** `PATCH /api/handoff/:id/checklist`
- **HTTP Method:** `PATCH`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Required Payload:** `{ "buyerAgreedChecks": true }` or `{ "sellerAgreedChecks": true }`
- **Status:** **Implemented in Frontend** (`src/Pages/HandoffRoomPage.jsx`)

### 9.4 Advance Progress Stepper
- **Endpoint:** `PATCH /api/handoff/:id/stepper`
- **HTTP Method:** `PATCH`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Required Payload:** `{ "stepperState": "Meeting Scheduled" }`
- **Status:** **Implemented in Frontend** (`src/Pages/HandoffRoomPage.jsx`)

### 9.5 Confirm offline UPI / Cash Payment (Seller Kill-Switch)
- **Endpoint:** `POST /api/handoff/:id/confirm-payment`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Pages/HandoffRoomPage.jsx`)

### 9.6 Confirm Receipt (Buyer Close-Escrow Switch)
- **Endpoint:** `POST /api/handoff/:id/confirm-received`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Pages/HandoffRoomPage.jsx`)

### 9.7 Sync Handoff Complete (Seller Studio verification)
- **Endpoint:** `PATCH /api/handoff/item/:itemId`
- **HTTP Method:** `PATCH`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Required Payload:** `{ "status": "COMPLETED" }`
- **Status:** 🔴 **UI Only / Missing API** (Confirming handoff in the Seller Studio dashboard saves `COMPLETED` directly into the browser's `localStorage` via `updateHandoffStatus()`).

---

## 10. 💬 Handoff Chat Messages

Provides communication logs during logistical coordination.

### 10.1 Load Chat Messages
- **Endpoint:** `GET /api/handoff/:id/messages`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Pages/HandoffRoomPage.jsx`)

### 10.2 Post Chat Message
- **Endpoint:** `POST /api/handoff/:id/messages`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Required Payload:** `{ "text": "Sure, see you there!" }`
- **Status:** **Implemented in Frontend** (`src/Pages/HandoffRoomPage.jsx`)

---

## 11. ⚖️ Dispute Center (P24)

Enables conflict arbitration and mediation.

### 11.1 Fetch User Disputes
- **Endpoint:** `GET /api/disputes/user`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Pages/DisputeCenterPage.jsx`)

### 11.2 Load Dispute Chat Messages
- **Endpoint:** `GET /api/disputes/:id/messages`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Pages/DisputeCenterPage.jsx`)

### 11.3 Post Dispute Chat Message
- **Endpoint:** `POST /api/disputes/:id/messages`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Required Payload:** `{ "text": "The seller is a no-show." }`
- **Status:** **Implemented in Frontend** (`src/Pages/DisputeCenterPage.jsx`)

### 11.4 Raise Mediation Claim & Upload Evidence
- **Endpoint:** `POST /api/disputes/raise`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: multipart/form-data`
- **Purpose:** Submits a transaction conflict dossier to the Mediation Board.
- **Required Payload (Multipart Form Data):**
  - `itemId`: `"60d0fe4f5311236168a109a5"`
  - `reason`: `"Item not as described" | "Seller didn't show up" | "Buyer refused to pay 90%"`
  - `description`: `"The watch bezel has severe hairline scratches..."`
  - `bypassCooldown`: `true`
  - `evidence`: `[Multiple Image/Video Files]`
- **Status:** ⚠️ **Partially Implemented** (The POST request is sent via REST in `DisputeCenterPage.jsx`, but evidence files are hardcoded as an empty list `evidence: []` because the frontend lacks file uploader inputs).

---

## 12. 📊 Mutual Reviews & Feedback (P25)

Publish transaction ratings after the handoff is complete.

### 12.1 Submit Transaction Review
- **Endpoint:** `POST /api/reviews`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Required Payload:**
  ```json
  {
    "revieweeId": "60d0fe4f5311236168a109a2",
    "itemId": "60d0fe4f5311236168a109a5",
    "ratings": {
      "itemAccuracy": 5,
      "communication": 4,
      "punctuality": 5
    },
    "comment": "Perfect handoff, item exactly as described!"
  }
  ```
- **Status:** **Implemented in Frontend** (`src/Pages/HandoffRoomPage.jsx`)

---

## 13. 📧 Support Hub & Tickets

### 13.1 Submit Contact / Support Form Ticket
- **Endpoint:** `POST /api/contact`
- **HTTP Method:** `POST`
- **Purpose:** Registers an interactive customer support query / email ticket in the support queue.
- **Required Payload:**
  ```json
  {
    "name": "Ramesh Kumar",
    "email": "ramesh@gmail.com",
    "subject": "Account & KYC Support",
    "message": "My Aadhaar OTP verification is timing out..."
  }
  ```
- **Status:** 🔴 **UI Only / Missing API** (The form is present in `ContactUS.jsx` under the `email` tab, but clicking submit runs a client-side mock timeout and yields a random ticket ID like `BK-182391`).

---

## 🛡️ 14. Admin Restricted Panel (P26)

All admin actions require user checks ensuring `user.role === 'ADMIN'`.

### 14.1 Get Platform Pulse Metrics
- **Endpoint:** `GET /api/admin/pulse`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Pages/AdminPanelPage.jsx`)

### 14.2 Fetch User Directory List
- **Endpoint:** `GET /api/admin/users`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters:** `search` (optional string)
- **Status:** **Implemented in Frontend** (`src/Pages/AdminPanelPage.jsx`)

### 14.3 Get Pending KYC Queue
- **Endpoint:** `GET /api/admin/kyc/pending`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Pages/AdminPanelPage.jsx`)

### 14.4 Retrieve Open Disputes List
- **Endpoint:** `GET /api/admin/disputes`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Pages/AdminPanelPage.jsx`)

### 14.5 Fetch Technical Audit Logs
- **Endpoint:** `GET /api/admin/audit-logs`
- **HTTP Method:** `GET`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Pages/AdminPanelPage.jsx`)

### 14.6 Resolve Pending User KYC Status
- **Endpoint:** `POST /api/admin/kyc/resolve`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Required Payload:**
  ```json
  {
    "userId": "60d0fe4f5311236168a109a0",
    "status": "Verified",
    "failureReason": null
  }
  ```
- **Status:** **Implemented in Frontend** (`src/Pages/AdminPanelPage.jsx`)

### 14.7 Toggle User Block (Ban / Unban)
- **Endpoint:** `POST /api/admin/users/:userId/toggle-block`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Status:** **Implemented in Frontend** (`src/Pages/AdminPanelPage.jsx`)

### 14.8 Arbitrate Dispute Verdict Settlements
- **Endpoint:** `POST /api/admin/disputes/resolve`
- **HTTP Method:** `POST`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Required Payload:**
  ```json
  {
    "disputeId": "60d0fe4f5311236168a10a01",
    "action": "RESOLVED",
    "resolutionDetails": "Refund authorized to Buyer due to item description mismatch."
  }
  ```
- **Status:** **Implemented in Frontend** (`src/Pages/AdminPanelPage.jsx`)
