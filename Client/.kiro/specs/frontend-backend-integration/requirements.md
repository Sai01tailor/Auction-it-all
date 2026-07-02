# Frontend-Backend Integration Requirements

## Introduction

### Purpose
This document defines the requirements for refactoring the BidKar auction platform frontend to fully integrate with the backend API, removing all mock/simulated data and implementing proper API-based functionality.

### Scope
- Replace all mock data implementations with real API calls
- Map existing frontend endpoints to documented backend APIs
- Implement missing API endpoints
- Ensure data consistency across the application
- Maintain existing UI/UX while improving data integrity

### Background
The current frontend implementation contains extensive mock data including:
- Simulated auction bidding (English, Dutch, Blind)
- LocalStorage-based wallet management
- Fake transaction history
- Mock seller dashboard metrics
- Simulated handoff/dispute flows

The backend API documentation (BidKar_Frontend_API_Reference.txt) provides 15+ documented endpoints, but many features are not yet integrated.

## Glossary

| Term | Definition |
|------|------------|
| Mock Data | Simulated data generated client-side using setTimeout, Promise.resolve, or localStorage |
| API Integration | Direct communication with backend REST endpoints |
| Service Layer | Abstraction layer (auctionService.js) that handles API communication |
| JWT Token | JSON Web Token for authentication, stored in cookies |
| Paise | Indian currency unit (1 INR = 100 paise) - used by backend |
| Razorpay | Payment gateway for wallet top-ups |
| Settlement | Post-auction payment processing (10% deposit + 90% offline) |

## User Stories

### Authentication & User Management

#### Requirement 1: User Registration with OTP Verification

**User Story:** As a new user, I want to register with my email and receive an OTP so that I can verify my account before accessing the platform.

**Acceptance Criteria**

1. User can submit registration form with username, email, password, and role (USER/SELLER)
2. Backend sends OTP to provided email via POST /api/auth/register
3. Frontend displays OTP input screen with 2-minute countdown timer
4. User can resend OTP if expired
5. On successful OTP verification via POST /api/auth/verify, JWT token is stored in cookies
6. User is redirected to dashboard with authenticated session
7. Form validation prevents submission with weak passwords
8. Error messages display for invalid email, existing user, or network failures

**Current Implementation Issues:**
- Uses mock endpoints: `/signup`, `/verify`, `/resend-otp`
- Should use documented endpoints: `/api/auth/register`, `/api/auth/verify`

#### Requirement 2: User Login

**User Story:** As a registered user, I want to log in with my email and password so that I can access my account and participate in auctions.

**Acceptance Criteria**

1. User can submit login credentials via POST /api/auth/login
2. On success, JWT token is stored in cookies with 7-day expiry
3. User object (userId, username, email, role) is stored in AuthContext
4. User is redirected to dashboard based on role (USER → bidder dashboard, SELLER → seller studio)
5. Invalid credentials show clear error message
6. "Remember me" functionality extends cookie expiration
7. OAuth integration with Google uses POST /api/auth/google (if available)

**Current Implementation Issues:**
- Uses `/login` instead of `/api/auth/login`
- OAuth endpoint `/auth/google` not documented in API reference

#### Requirement 3: Session Persistence

**User Story:** As a logged-in user, I want my session to persist across page refreshes so that I don't have to re-login frequently.

**Acceptance Criteria**

1. On app initialization, check for auth_token cookie
2. If token exists, validate via GET /api/auth/profile
3. User object is restored to AuthContext if token is valid
4. If token is expired/invalid, cookie is cleared and user sees login screen
5. User does not see flash of login screen during initialization
6. isInitializing state prevents UI flicker

**Current Implementation Issues:**
- Uses `/me` instead of documented `/api/auth/profile`

#### Requirement 4: Password Reset

**User Story:** As a user who forgot my password, I want to receive an OTP via email so that I can reset my password securely.

**Acceptance Criteria**

1. User can request password reset via POST /api/auth/forgot-password
2. 6-digit OTP is sent to registered email
3. User enters OTP and new password on reset screen
4. Password is updated via POST /api/auth/reset-password
5. User is redirected to login with success message
6. OTP expires after 2 minutes with resend option

**Current Implementation Issues:**
- Uses `/forgot-password` and `/reset-password` instead of `/api/auth/forgot-password` and `/api/auth/reset-password`

### Auction Item Management

#### Requirement 5: Browse Active Auctions

**User Story:** As a user, I want to view all active auctions with filtering and search capabilities so that I can find items of interest.

**Acceptance Criteria**

1. Fetch active items via GET /api/items with status=ACTIVE query parameter
2. Display items in paginated grid (16 items per page)
3. Client-side filtering by search query, price range, category, and condition
4. Search matches against item title and description
5. Price filtering uses currentHighestBid or startingPrice
6. Items show Redis cache source indicator (database/cache)
7. Prices are converted from paise to INR for display (divide by 100)
8. Item cards show photo, title, current bid, time remaining, and status

**Current Implementation Issues:**
- Uses GET /api/items correctly but applies client-side filtering
- Missing backend endpoints: GET /api/auctions/featured, GET /api/auctions/ending-soon
- Should implement server-side filtering/sorting for better performance

#### Requirement 6: View Auction Details

**User Story:** As a user, I want to view detailed information about an auction item so that I can make an informed bidding decision.

**Acceptance Criteria**

1. Fetch item details via GET /api/items/:id
2. Display all item fields: title, description, photos, startingPrice, currentHighestBid, status
3. Show seller information (username, reputation)
4. Display auction timing: startTime, endTime, time remaining
5. Show bid history and participant count
6. Photos are displayed in carousel/gallery from Cloudinary URLs
7. Bidding console is displayed based on auction type (English/Dutch/Blind)
8. Status changes (DRAFT→ACTIVE→SOLD) are reflected in real-time

**Current Implementation Issues:**
- Injects mock auctionType data (ENGLISH/DUTCH/BLIND) client-side
- Backend API doesn't support auctionType field - needs custom endpoint

#### Requirement 7: Create Auction Listing (Seller)

**User Story:** As a seller, I want to create a new auction listing with photos so that buyers can bid on my items.

**Acceptance Criteria**

1. Only users with SELLER or ADMIN role can access listing creation
2. Submit listing via POST /api/items with multipart/form-data
3. Required fields: title, description, startingPrice (paise), endTime (ISO date)
4. Upload up to 5 photos with field name "photos"
5. Photos are uploaded to Cloudinary and URLs returned in response
6. New item is created with status=DRAFT, becomes ACTIVE at startTime
7. Seller can view created listing in their dashboard
8. Form validation prevents invalid prices, dates, or missing photos

**Current Implementation Issues:**
- Missing fields in API: auctionType, category, condition, priceFloor, dropInterval
- These should be added to backend schema or handled via custom endpoints

### Bidding & Auction Participation

#### Requirement 8: Place English Auction Bid

**User Story:** As a bidder, I want to place incrementally higher bids on English auctions so that I can win items I'm interested in.

**Acceptance Criteria**

1. User must be authenticated to place bids
2. Bid amount must be higher than currentHighestBid
3. Wallet must have sufficient balance (10% of bid amount)
4. POST /api/bids/place endpoint creates new bid
5. If successful, item's currentHighestBid is updated
6. Previous bidder's deposit is released
7. New bidder's deposit (10%) is locked in wallet
8. Real-time bid updates are reflected via WebSocket/polling
9. User receives notification if outbid
10. Bid history is displayed with timestamps and bidder names

**Current Implementation Issues:**
- Currently uses mock Promise with setTimeout
- API endpoint POST /api/bids/place not documented - needs custom implementation
- WebSocket integration for real-time updates not yet implemented

#### Requirement 9: Dutch Auction Buy Now

**User Story:** As a bidder, I want to purchase a Dutch auction item at the current price before it drops further so that I can secure the item.

**Acceptance Criteria**

1. User can click "Buy Now" on Dutch auction at current price
2. POST /api/bids/dutch-buy endpoint processes purchase
3. If successful (quantity available), user wins the item
4. If race condition occurs (sold out), user sees "Beaten by another bidder" message
5. Price drops automatically every N seconds based on dropInterval
6. Quantity decreases as items are purchased
7. Auction ends when quantity reaches zero or priceFloor is reached
8. Winner's deposit (10% of purchase price) is locked immediately

**Current Implementation Issues:**
- Fully mocked with 20% simulated failure rate
- Backend endpoint POST /api/bids/dutch-buy not documented - needs implementation
- Dutch auction fields (priceFloor, dropInterval, dropAmount, currentQuantity) not in backend schema

#### Requirement 10: Blind Auction Sealed Bid

**User Story:** As a bidder, I want to submit a sealed bid on blind auctions so that I can participate without revealing my bid to others.

**Acceptance Criteria**

1. User can submit sealed bid via POST /api/bids/blind-submit before submissionDeadline
2. Bid amount is not visible to other bidders before reveal
3. User can update their bid before deadline
4. After revealTime, all bids are revealed via GET /api/bids/blind-reveal/:itemId
5. Highest bidder wins the auction
6. Reveal screen shows sorted leaderboard with masked bidder names (e.g., "s***m_98")
7. Winner sees their bid highlighted with winner badge
8. Losing bidders see their rank and bid amount

**Current Implementation Issues:**
- Fully mocked using localStorage
- Backend endpoints not documented: POST /api/bids/blind-submit, GET /api/bids/blind-reveal/:itemId
- Blind auction fields (submissionDeadline, revealTime) not in backend schema

### Wallet & Payment Management

#### Requirement 11: View Wallet Balance

**User Story:** As a user, I want to view my wallet balance and bidding power so that I know how much I can bid.

**Acceptance Criteria**

1. Fetch wallet balance via GET /api/wallet/balance
2. Display availableMoney (funds ready for bidding)
3. Display frozenMoney (locked deposits on active bids)
4. Display biddingPower (10x leverage: availableMoney × 10)
5. Currency is always INR
6. Wallet status (ACTIVE/SUSPENDED) is displayed
7. If SUSPENDED, disable all bidding functionality and show warning
8. Balance updates in real-time after transactions

**Current Implementation Issues:**
- Currently uses localStorage with mock balance (₹15,000 default)
- All wallet operations (add funds, lock deposit, release, capture) are simulated
- Should integrate with GET /api/wallet/balance

#### Requirement 12: Top-Up Wallet via Razorpay

**User Story:** As a user, I want to add funds to my wallet using UPI/Card payment so that I can participate in auctions.

**Acceptance Criteria**

1. User enters amount to add on wallet page
2. Create Razorpay order via POST /api/payments/create-order
3. Razorpay checkout popup opens with orderId, amount, currency
4. After user completes payment, Razorpay calls backend webhook POST /api/payments/webhook
5. Backend credits wallet after successful payment
6. Frontend polls GET /api/wallet/balance to confirm credit
7. Transaction is added to history with status=SUCCESS
8. User sees success toast with new balance
9. Failed payments show error message and are not credited

**Current Implementation Issues:**
- Mock implementation with setTimeout (1.8s delay)
- Razorpay SDK integration is present in UI but not connected to backend
- Should use POST /api/payments/create-order as documented

#### Requirement 13: View Transaction History

**User Story:** As a user, I want to view my complete transaction history so that I can track all wallet activities.

**Acceptance Criteria**

1. Fetch transaction history via GET /api/transaction/history
2. Display paginated list of transactions with pagination controls
3. Each transaction shows: date, type (TOP-UP/HELD/REFUNDED/CAPTURED), amount, status
4. Transactions are sorted by date (newest first)
5. Filter by transaction type and date range
6. Export transaction history as PDF/CSV
7. Show running balance for each transaction
8. Status indicators: PENDING (order created), SUCCESS (payment confirmed)

**Current Implementation Issues:**
- Currently stored in localStorage with mock transactions
- Should integrate with GET /api/transaction/history
- Transaction types in wallet context (TOP-UP, HELD, REFUNDED, CAPTURED) may not match backend schema

### Settlement & Post-Auction Flow

#### Requirement 14: Auction Settlement Processing

**User Story:** As a winning bidder, I want the auction to be settled automatically after it ends so that I can complete the purchase.

**Acceptance Criteria**

1. AuctionCloser cron automatically triggers settlement when auction ends
2. Settlement calculates hammer price (winning bid amount)
3. 10% security deposit is captured from winner's wallet
4. Settlement record is created via POST /api/settlements/:itemId/settle
5. Settlement response includes: settlementId, hammerPriceRupees, securityDepositRupees, offlineBalanceRupees
6. Item status changes to SOLD
7. Winner sees settlement details on dashboard
8. Seller sees settlement pending in their studio
9. Settlement status: PENDING → COMPLETED or DISPUTED

**Current Implementation Issues:**
- Settlement flow not implemented
- API endpoints are documented: POST /api/settlements/:itemId/settle, GET /api/settlements/:settlementId/invoice
- Need to integrate frontend settlement UI

#### Requirement 15: Download Invoice

**User Story:** As a buyer/seller, I want to download the settlement invoice PDF so that I have a record of the transaction.

**Acceptance Criteria**

1. After settlement is COMPLETED, invoice download button is enabled
2. Click download triggers GET /api/settlements/:settlementId/invoice
3. PDF binary stream is converted to blob and downloaded
4. Invoice filename format: invoice-{settlementId}.pdf
5. Invoice contains: buyer name, seller name, hammer price, security deposit (10%), offline balance (90%)
6. Download only works when settlement status=COMPLETED

**Current Implementation Issues:**
- Invoice download not implemented
- Should use GET /api/settlements/:settlementId/invoice as documented

#### Requirement 16: Dispute Handling

**User Story:** As a buyer, if I don't complete offline payment within 48 hours, the settlement should be marked as disputed and my wallet suspended.

**Acceptance Criteria**

1. settlementMonitor cron checks PENDING settlements every hour
2. If 48 hours pass without payment confirmation, status changes to DISPUTED
3. Buyer's wallet status changes to SUSPENDED
4. Buyer cannot place new bids while SUSPENDED
5. Buyer sees prominent warning on dashboard
6. Admin can resolve dispute via admin panel
7. After resolution, wallet status can be restored to ACTIVE

**Current Implementation Issues:**
- Dispute detection and wallet suspension handled by backend crons
- Frontend should poll settlement status and display warnings
- Admin dispute resolution panel needs backend endpoints (not documented)

### Seller Management

#### Requirement 17: Seller Dashboard Metrics

**User Story:** As a seller, I want to view dashboard metrics for my auctions so that I can track performance.

**Acceptance Criteria**

1. Fetch seller's items via GET /api/items?sellerId={userId}
2. Calculate live revenue: sum of currentHighestBid for all ACTIVE items
3. Count pending handoffs: ended items with status≠COMPLETED
4. Calculate completed sales: sum of hammer prices for SOLD items
5. Display item list with status, current bid, end time, and actions
6. Show auction performance charts (optional)
7. Allow filtering by status: DRAFT, ACTIVE, SOLD

**Current Implementation Issues:**
- Currently uses client-side filtering of all items by sellerId
- Mock handoff status stored in localStorage
- Backend doesn't have GET /api/items?sellerId={id} parameter - needs custom endpoint
- Alternative: GET /api/sellers/:sellerId/items

#### Requirement 18: Seller Profile & Reputation

**User Story:** As a buyer, I want to view a seller's profile and reputation so that I can trust them before bidding.

**Acceptance Criteria**

1. Fetch seller profile via GET /api/sellers/:sellerId
2. Display seller information: username, joinedDate, reputation score, success rate
3. Show KYC verification status with badge
4. List active auctions from this seller
5. Display buyer reviews with ratings and comments
6. Calculate total items sold count
7. Reputation score based on successful handoffs and positive reviews

**Current Implementation Issues:**
- Currently returns mock data with hardcoded reviews
- Backend endpoint GET /api/sellers/:sellerId not documented - needs implementation
- KYC status stored in localStorage - should come from backend

### Handoff & Physical Exchange

#### Requirement 19: Handoff Room Communication

**User Story:** As a buyer/seller, I want to coordinate the physical item handoff in a dedicated chat room so that we can complete the transaction safely.

**Acceptance Criteria**

1. After auction ends, buyer and seller access handoff room
2. Fetch handoff details via GET /api/handoff/item/:itemId
3. Chat messages are fetched via GET /api/handoff/:handoffId/messages
4. Send messages via POST /api/handoff/:handoffId/messages
5. Both parties confirm handoff checklist items
6. Update checklist via PATCH /api/handoff/:handoffId/checklist
7. Track handoff progress: stepper states (Initiated → Meeting Scheduled → Item Inspected → Item Received)
8. Update stepper via PATCH /api/handoff/:handoffId/stepper
9. Real-time message updates via polling or WebSocket

**Current Implementation Issues:**
- Handoff endpoints exist but are used correctly
- Should verify API behavior matches frontend expectations

#### Requirement 20: Deposit Capture & Payment Confirmation

**User Story:** As a seller, after confirming the handoff, I want the buyer's deposit to be captured so that I receive payment.

**Acceptance Criteria**

1. Seller confirms handoff completion via UI
2. Backend captures 10% deposit via POST /api/handoff/:handoffId/capture-deposit
3. Buyer confirms offline payment (90%) via POST /api/handoff/:handoffId/confirm-payment
4. Both parties mark item received via POST /api/handoff/:handoffId/confirm-received
5. After all confirmations, settlement status changes to COMPLETED
6. Both parties can leave reviews via POST /api/reviews

**Current Implementation Issues:**
- Handoff API calls are implemented
- Review submission endpoint POST /api/reviews not documented - may need verification

### KYC & Verification

#### Requirement 21: Seller KYC Verification

**User Story:** As a seller, I want to complete KYC verification using Aadhaar and PAN so that I can list auction items.

**Acceptance Criteria**

1. Check KYC status via GET /api/kyc/status
2. If not verified, display KYC form with Aadhaar number input
3. Initiate Aadhaar verification via POST /api/kyc/initiate
4. Receive OTP and submit via POST /api/kyc/verify-otp
5. After Aadhaar verification, submit PAN details
6. Backend verifies PAN and completes KYC
7. Seller can only create listings after KYC status=Verified
8. KYC badge is displayed on seller profile

**Current Implementation Issues:**
- KYC endpoints are used correctly: GET /api/kyc/status, POST /api/kyc/initiate, POST /api/kyc/verify-otp
- PAN verification step is mocked (setTimeout) - may need backend endpoint

### Admin Panel

#### Requirement 22: Admin Dashboard Metrics

**User Story:** As an admin, I want to view platform health metrics so that I can monitor system status.

**Acceptance Criteria**

1. Fetch platform pulse via GET /api/admin/pulse
2. Display metrics: total users, active auctions, completed settlements, pending disputes
3. Show system health indicators: database status, cache hit rate, cron job status
4. Display revenue charts and growth trends

**Current Implementation Issues:**
- Admin endpoints are used: GET /api/admin/pulse
- Should verify all metrics are provided by backend

#### Requirement 23: User & KYC Management

**User Story:** As an admin, I want to manage users and approve/reject KYC requests so that I can maintain platform integrity.

**Acceptance Criteria**

1. Fetch user list via GET /api/admin/users with search parameter
2. View user details: role, registration date, wallet balance, auction activity
3. Block/unblock users via POST /api/admin/users/:userId/toggle-block
4. Fetch pending KYC requests via GET /api/admin/kyc/pending
5. Approve/reject KYC via POST /api/admin/kyc/resolve
6. View audit logs via GET /api/admin/audit-logs

**Current Implementation Issues:**
- Admin endpoints are used correctly
- Should verify all admin actions are properly implemented

### Disputes & Support
