# BidKar.in — Project Current State

This document captures the current functional state of the **BidKar.in** live-auction marketplace frontend client, following the completion of **Phase 4: Seller Management**.

---

## 🚦 Project Milestone Status

- **Phase 1 — Discovery & Hype**: 🟩 **COMPLETE** (Home Page, Listing Grid, Product Cards, Infinite Scroll, Countdowns)
- **Phase 2 — Bidding Engines**: 🟩 **COMPLETE** (English Trading Terminal, Live Leaderboards, Dutch Price Deceleration, Sealed Blind Bid Form, Blind Reveals)
- **Phase 3 — User Verification & Wallet**: 🟩 **COMPLETE** (OTP Authentication UI, Aadhaar Verification, Liveness checks, Razorpay cash flow simulation, 10x Power dials, Passbooks)
- **Phase 4 — Seller Management**: 🟩 **COMPLETE** (Create Listing, Seller Studio, Public Profile storefront, glow badges, custom escrow configurations)
- **Phase 5 — Closing & Operations**: ⬜ **PENDING** (Dispute modules, bidder feedback scoring, notification logs)

---

## 📐 Completed Phase 4 Components

1. **Create Listing Form (`/seller/create`)**:
   - Dynamic 3-Step layout driven by `framer-motion` sliding page transitions.
   - Smart fields toggling between English (reserve, increment), Dutch (floor, drops), and Blind (reveal delay).
   - Minimum `44px` mobile-friendly click sizes.
   - Pulsing gold drag-and-drop file uploader zone.
   - Auto-calculating 10% escrow indicator based on starting prices.

2. **Seller Studio Dashboard (`/seller/studio`)**:
   - Collapses to vertical grids on small touch-screens, expanding to 3-column rows on desktop.
   - Uses `tabular-nums` for alignment stability on cash and item aggregations.
   - Action list indicating offline handoff meeting coordinates and winner information.
   - Interactive handoff confirmer that updates stats in real-time.

3. **Public Storefront Profile (`/seller/:id`)**:
   - Editorial asymmetrical split column configuration.
   - Premium emerald and gold glowing verification trust tags.
   - Display ratings, total sold history, active auctions, and customer reviews.

---

## 🧪 Fake Simulation & Client-Side Mocked Pages

During the development of the client application, several pages were integrated with client-side simulations and fake/mock interfaces to represent live operations. These components accept user inputs but process actions locally using memory timers (`setTimeout`/`setInterval`) or browser storage (`localStorage`) instead of calling backend REST/WebSocket APIs.

1. **Bidding Terminal Console Page (`/auction/:id/console`)**:
   - Runs client-side simulators via `useSocket.js` for each auction type:
     - **English Console**: Simulates periodic outbidding by random mock bidders and local updates to live leaderboards.
     - **Dutch Console**: Runs a descending price stopwatch countdown that drops active prices and reduces item quantities.
     - **Blind Console**: Simulates sealed envelope submissions, countdowns to deadline/reveal, and displays mock decrypted bids on unsealing.
2. **KYC Verification Page (`/kyc`)**:
   - Aadhaar instant verification flow is fully connected to backend APIs.
   - PAN card validation flow and webcam liveness selfie check are simulated using mock timeouts and state.
3. **Wallet Dashboard Page (`/wallet`)**:
   - Razorpay payment gateway top-up checkout triggers a mock payment resolution sequence.
   - Active bidding power dial and cash balance are managed in client browser memory and synced to `localStorage`.
4. **Transaction Passbook Ledger Page (`/ledger`)**:
   - Loaded and recorded entirely from browser memory/`localStorage` with generated mock payment reference IDs (`rzpay_mock_...`).
5. **Invoice Page (`/invoice/:itemId`)**:
   - Displays static transaction info and triggers a mock PDF receipt download using client-side alerts.
6. **Create Listing Form Page (`/seller/create`)**:
   - Intercepts and strips custom auction parameters (e.g., Dutch price floor, blind reveal dates) and offline handoff coordinates to save them in local storage, owing to basic schema restrictions in backend databases.
7. **Seller Studio Dashboard Page (`/seller/studio`)**:
   - Aggregates live sales metrics and confirms offline payments (the seller kill-switch) using localized `localStorage` checks instead of writing to backend handoff states.
8. **Public Storefront Profile Page (`/seller/:id`)**:
   - Public trust statistics, joined date, active list counts, and customer reviews are dynamically generated via client-side mock models.
9. **Mediation Dispute Center Page (`/disputes`)**:
   - Submits dispute claims but hardcodes evidence uploads to an empty array due to missing client file inputs; logs disputes queue from client-side state.
10. **Support Hub Page (`/contact`)**:
    - Triggers a mock ticket creation sequence (`BK-XXXXXX`) via client-side timeouts.

---

## 🧪 Build Verification
- Production build runs cleanly with zero linting or bundling errors:
  - **Asset Output**: `dist/assets/index-JIqUmMyQ.js` (674.71 kB) · `dist/assets/index-HO0dDQj-.css` (25.18 kB).

