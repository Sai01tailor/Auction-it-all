# BidKar.in — Client Context Document
> Last updated: Phase 4: Seller Management · June 2026

---

## 🏗️ Project Identity

| Key | Value |
|---|---|
| **Platform Name** | BidKar.in |
| **Type** | Live Auction Marketplace (India-focused) |
| **Stack** | Vite + React 19 + TailwindCSS v4 + Framer Motion + Axios |
| **Backend** | Node.js + Express + MongoDB + Redis (cluster mode) |
| **Real-time** | Socket.io (server socket is scaffolded but empty in Phase 1) |
| **Auth** | JWT via cookie (`auth_token`) + Google OAuth |
| **Dev Server** | `http://localhost:5173` (client) · `http://localhost:3000` (server) |

---

## 🎨 Brand & Theme (DO NOT CHANGE `index.css`)

```
Primary:       #002366  (Deep Royal Navy)
Primary Light: #1a3c7a
Primary Dark:  #00153d
Accent:        #fece44  (Golden Yellow)
Accent Light:  #feda75
Accent Dark:   #e5b630
Text Rich:     #0a0a0a
Text Muted:    #525252
Surface Main:  #ffffff
Surface BG:    #f8fafc
Border Subtle: #e5e7eb
```

**Font:** Inter (system-ui fallback)  
**CSS Framework:** Tailwind v4 — use `@theme` tokens, NOT hardcoded hex in component styles. Prefer CSS vars like `var(--color-brand-primary)`.

---

## 🗂️ Directory Structure

```
Client/
├── Config/
│   ├── Axios.jsx          — Base axios instance (baseURL from VITE_API_BASE_URL)
│   ├── interceptor.js     — Attaches auth_token cookie + handles 401 redirect
│   └── GoogleClient.jsx   — Google OAuth client ID
├── src/
│   ├── main.jsx           — Root: AuthProvider > GoogleOAuthProvider > BrowserRouter
│   ├── App.jsx            — Route declarations (react-router-dom v7)
│   ├── index.css          — ⛔ LOCKED — Theme + Tailwind v4 config
│   ├── Context/
│   │   ├── AuthContext.jsx — useAuth() hook · { user, setUser, isInitializing }
│   │   └── WalletContext.jsx — useWallet() hook · { walletBalance, biddingPower, transactions, addFunds, lockDeposit }
│   ├── services/
│   │   └── auctionService.js — API abstraction layer (see API section below)
│   ├── hooks/
│   │   └── useSocket.js   — Socket.io client hook with dev-mode mock
│   ├── Components/
│   │   ├── Global/
│   │   │   ├── Header.jsx         — Sticky, scroll-aware, search bar, BidKar.in brand
│   │   │   ├── Footer.jsx         — ⛔ DO NOT CHANGE — already production-quality
│   │   │   ├── LiveTimer.jsx      — Atomic countdown (HH:MM:SS), urgency colors
│   │   │   ├── AuthController.jsx — Drop into protected pages → redirects to /login
│   │   │   ├── Toast.jsx          — react-toastify wrapper
│   │   │   └── CookieIT.js        — getCookie / setCookie / deleteCookie utils
│   │   ├── Home/
│   │   │   ├── TrustBar.jsx       — 3-pillar trust section (navy bg)
│   │   │   └── CategoryGrid.jsx   — 8 category pills
│   │   ├── Product/
│   │   │   ├── ProductCard.jsx    — Auction card: live timer, bid pulse, photo, CTA
│   │   │   ├── Carousel.jsx       — Horizontal scroll strip of ProductCards
│   │   │   └── Product_grid.jsx   — Infinite-scroll grid of ProductCards
│   │   ├── Listing/
│   │   │   ├── FilterSidebar.jsx  — Price range, type, condition, category filters
│   │   │   ├── AuctionGrid.jsx    — 4-col grid with infinite scroll
│   │   │   └── SearchBar.jsx      — Debounced search input
│   │   ├── Detail/
│   │   │   ├── MediaGallery.jsx       — Hover-zoom gallery + thumbnail strip
│   │   │   ├── BiddingStatsCard.jsx   — Live bid stats + synchronized countdown
│   │   │   ├── SellerCredibilityCard.jsx — KYC badge, rating, seller info
│   │   │   └── BidConsoleButton.jsx   — Primary CTA → /auction/:id/console
│   │   └── Bidding/
│   │       ├── EnglishConsole.jsx  — P04: English console layout with smart buttons
│   │       ├── LiveLeaderboard.jsx — P05: Anonymized vertical scrolling bids feed
│   │       ├── DutchConsole.jsx    — P07: Descending price stopwatch ticker
│   │       ├── BlindConsole.jsx    — P08: Sealed wax envelope submission form
│   │       └── BlindReveal.jsx     — P09: Winner spotlight ranking tables
│   └── Pages/
│       ├── Home.jsx              — P01: Hero + EndingSoon carousel + CategoryGrid + Grid + TrustBar
│       ├── ListingGridPage.jsx   — P02: Sidebar + 4-col AuctionGrid + SearchBar
│       ├── AuctionDetailPage.jsx — P03: MediaGallery + BiddingStats + SellerCard + CTA
│       ├── BiddingConsolePage.jsx — Dynamic bidding terminal router for Phase 2
│       ├── WalletPage.jsx        — P15: Interactive 10x leverage cash wallet & power dial
│       ├── TransactionLedgerPage.jsx — P16: Mobile-first responsive passbook rows
│       ├── KYCPage.jsx           — P14: Aadhaar OTP server client + PAN liveness check
│       ├── BidderDashboardPage.jsx — P17: Command tower with AnimatePresence reorder list
│       ├── CreateListingPage.jsx — P19: Multi-step creation form & gold-pulse file uploader
│       ├── SellerStudioPage.jsx  — P18: Metrics dashboard tiles & exchange confirmer
│       ├── SellerProfilePage.jsx — P11: Public trust storefront & glowing verified badges
│       └── Signup&login/         — Auth pages (unified phone OTP gateway consent checks)
```

---

## 🔌 API Mapping

> **IMPORTANT:** Server mounts item routes at `/api/items`, NOT `/api/auctions`.

| Frontend Needs | Actual Server Endpoint | Status |
|---|---|---|
| All active auctions | `GET /api/items` | ✅ Live |
| Single auction detail | `GET /api/items/:id` | ✅ Live |
| Create auction item | `POST /api/items` | ✅ Protected (SELLER/ADMIN role) |
| Featured auctions | No endpoint | ⚠️ Mocked in `auctionService.js` |
| Ending soon | No endpoint | ⚠️ Mocked in `auctionService.js` |
| Socket bid events | `auction.socket.js` (empty) | ⚠️ Dev-mock in `useSocket.js` |

### Item Schema (MongoDB — `item.model.js`)
```js
{
  _id, title, description,
  startingPrice,       // Number, min: 1
  currentHighestBid,   // Number, default: 0
  photos: [String],    // Cloudinary secure URLs
  sellerId: ObjectId,  // ref: User → { username, email }
  winnerId: ObjectId,  // ref: User, default: null
  status: 'DRAFT' | 'ACTIVE' | 'SOLD' | 'CANCELLED',
  startTime: Date,
  endTime: Date,
  createdAt, updatedAt
}
```

### User Schema (MongoDB — `user.model.js`)
```js
{
  _id, username, email, password,
  role: 'USER' | 'ADMIN' | 'SELLER',
  isVerified: Boolean,
  kycStatus: 'Unverified' | 'Pending' | 'Verified' | 'Failed',
  kycVerifiedAt, otp, otpExpiresAt
}
```

---

## ⚡ Socket.io Events (Phase 2 target)

```
Client emits:
  join:auction   { auctionId }    — Subscribe to a room
  leave:auction  { auctionId }    — Unsubscribe

Server emits:
  bid:update     { auctionId, currentBid, totalBids, lastBidder, timestamp }
  auction:ended  { auctionId, winnerId, finalBid }
  auction:error  { message }
```

---

## 📐 Component Contracts

### `<LiveTimer endTime startTime size />`
- `size`: `'sm'` | `'md'` | `'lg'`
- Colors: green (>30 min) → orange (>5 min) → red (<5 min) → gray (ended)
- Ticks every 1s via `setInterval`

### `<ProductCard item />`
- `item` must match Item schema above
- `item.currentHighestBid` prop change → triggers green pulse animation (`.bid-pulse`)
- Navigates to `/auction/:id` on click

### `<Carousel title endpoint params items />`
- `endpoint`: API path string (calls via `Config/Axios`)
- `params`: query params object
- `items`: optional static list (skips fetch)
- Accepts a `service` async function as alternative to `endpoint`

### `<FilterSidebar onFilterChange />`
- Emits: `{ priceRange: [min, max], type: string, condition: string[], category: string }`

### `useSocket(auctionId, initialBid, auctionType)`
- Returns: `{ currentBid, totalBids, lastBidder, isConnected, quantityRemaining, nextDropPrice, nextDropCountdown, blindBidsList, isRevealed, timerExpired }`
- Dev mock: Simulates English live bid intervals, Dutch descending price drop ticks & race condition buy-nows, and Blind envelope seals & reveal states.

---

## 🛣️ Routes

```
/                     → Home.jsx (P01)
/auctions             → ListingGridPage.jsx (P02)
/auction/:id          → AuctionDetailPage.jsx (P03)
/auction/:id/console  → BiddingConsolePage (Phase 2)
/seller/create        → CreateListingPage.jsx (P19)
/seller/studio        → SellerStudioPage.jsx (P18)
/seller/:id           → SellerProfilePage.jsx (P11)
/handoff/:itemId      → HandoffRoomPage.jsx (P21 & P22)
/disputes             → DisputeCenterPage.jsx (P24)
/admin                → AdminPanelPage.jsx (P26)
/legal/:section       → LegalHubPage.jsx (P28)
/sitemap              → SitemapPage.jsx (P29)
/invoice/:itemId      → InvoicePage.jsx (P23)
/withdrawn            → ErrorStatePages.jsx (P30)
/maintenance          → ErrorStatePages.jsx (P30)
/sign-up              → SignUp.jsx
/Verify-email         → VerifyEmail.jsx
/login                → Login.jsx
/forgot-password      → ForgotPassword.jsx
```

---

## 🔒 Auth Rules

- Public routes: `/`, `/auctions`, `/auction/:id` (read-only)
- Protected: `/auction/:id/console` (must be logged in + bid deposit)
- `useAuth()` → `{ user, setUser, isInitializing }`
- `<AuthController />` in a page = hard redirect to `/login` if no session

---

## 📦 Installed Packages

```json
"react": "^19",
"react-router-dom": "^7",
"axios": "^1",
"framer-motion": "^12",
"tailwindcss": "^4",
"@tailwindcss/vite": "^4",
"@react-oauth/google": "^0.13",
"react-toastify": "^11",
"react-otp-input": "^3",
"socket.io-client": "^4"   ← Added in Phase 1
```

---

## 🚦 Phase Progress

- [x] Phase 1 — Discovery & Hype (P01 Home, P02 Listing, P03 Detail, P10, P12, P29)
- [x] Phase 2 — Bidding Console (P04 English, P05 Leaderboard, P07 Dutch, P08 Blind, P09 Reveal)
- [x] Phase 3 — User Verification & Wallet (P13 Auth OTP, P14 KYC, P15 Wallet, P16 Ledger, P17 Dashboard)
- [x] Phase 4 — Seller Management (P18 Seller Studio, P19 Create Listing, P11 Seller Profile)
- [x] Phase 5 — Closing & Operations (P20-P26, P28, P30-P31) ← **COMPLETED**

---

## ⚙️ Dev Notes

- **Tailwind v4**: Uses `@theme {}` in `index.css` — no `tailwind.config.js` file.
- **CSS vars** are the source of truth for colors. Always use `var(--color-*)` in inline styles.
- **Axios** base instance is at `Config/Axios.jsx`. Always import from there, not directly from `axios`.
- **Import paths**: Components import Axios as `'../../../Config/Axios'` (3 levels up from `src/Components/*/`).
- **No TypeScript** — plain JS/JSX throughout.
- **framer-motion** is available — use it for page transitions and micro-animations.
- **Server is cluster-mode** — every restart forks N workers (N = CPU count). Keep this in mind for Socket.io (needs sticky sessions or Redis adapter in Phase 2).
