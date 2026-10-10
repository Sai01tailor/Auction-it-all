# BidKar — Complete Frontend Technical Documentation & Interview Preparation Guide

> **Project:** BidKar.in — Live Auction Marketplace
> **Stack:** React 19 · Vite · TailwindCSS v4 · Socket.io · Axios · Framer Motion · Razorpay
> **Built & documented for interview-ready technical defence**

---

## TABLE OF CONTENTS

1. Project Overview & Architecture
2. File-by-File Breakdown
3. React Component Hierarchy
4. Hooks — Extremely Detailed
5. Rendering & Re-rendering
6. Data Flow
7. API & Asynchronous Processing
8. Authentication & Security
9. Forms & User Interaction
10. Conditional Rendering
11. Performance
12. Responsive Design & UI
13. Accessibility
14. Error Handling
15. State Management
16. JavaScript Concepts Used
17. CSS / Tailwind Logic
18. Complete User Flow Traces
19. "Why Did I Code It This Way?"
20. Code Smells & Improvements
21. Interview Preparation — Project Questions
22. Project-Specific Interview Questions
23. Rapid-Fire FAQ
24. "Explain This Code to an Interviewer"
25. Cheat Sheet
26. Final 2-Minute Project Explanation

---

# SECTION 1: PROJECT OVERVIEW

## What BidKar Does

BidKar is a **real-time live auction marketplace** for India. Buyers (Bidders) can browse active auction listings, enter bidding consoles, and compete in live price battles. Sellers list items through a studio dashboard. Three distinct auction engines are supported:

| Engine | Mechanic |
|---|---|
| **English (Rising Bids)** | Classic ascending bid; Popcorn Bidding extends timer on last-minute bids |
| **Dutch (Price Drop)** | Price falls every N seconds; first click wins |
| **Blind (Sealed Bid)** | All bids are hidden; winner revealed at deadline |

## Main User Flows

```
Guest → Browse Auctions → View Detail → Sign Up/Login
                                              ↓
                                  Complete KYC → Top-Up Wallet
                                              ↓
                                    Enter Bidding Console
                                              ↓
                               Win Auction → Handoff Room → Invoice
```

```
Seller → Login → Seller Studio → Create Listing
                                      ↓
                             Auction Goes Live → Monitor
                                      ↓
                              Auction Ends → Handoff with Winner
```

## Overall Frontend Architecture (ASCII)

```
┌──────────────────────────────────────────────────────────────┐
│                        main.jsx                              │
│          (Entry Point — Provider wrapping order)             │
│  AuthProvider                                                │
│   └── WalletProvider                                        │
│        └── GoogleOAuthProvider                              │
│             └── BrowserRouter                               │
│                  └── StrictMode                             │
│                       └── <App />                           │
└──────────────────────────────────────────────────────────────┘

<App /> → <Routes>
  ├── / → Home
  ├── /auctions → ListingGridPage
  ├── /auction/:id → AuctionDetailPage
  ├── /auction/:id/console → BiddingConsolePage  ← Socket.io live
  ├── /dashboard → BidderDashboardPage
  ├── /seller/studio → SellerStudioPage
  ├── /wallet → WalletPage (Razorpay)
  ├── /kyc → KYCPage
  ├── /handoff/:itemId → HandoffRoomPage
  ├── /admin → AdminPanelPage
  └── * → NotFoundPage

Data flows:
User Input → Event Handler → State Update → Re-render
                  ↓
            API call (Axios + interceptor)
                  ↓
           Backend (Express/Node)
                  ↓
           Response → setState → UI Update

Real-time:
BiddingConsolePage → useSocket() → Socket.io server
                          ↑
              new_bid_update / bid_rejected / outbid_alert
```

## Technologies & Why Each Was Chosen

| Technology | Version | Why Used |
|---|---|---|
| **React 19** | ^19.0.0 | Component model, hooks, concurrent features |
| **Vite** | ^6.3.1 | Instant HMR, fast builds, ESM-native |
| **TailwindCSS v4** | ^4.3.0 | Utility-first; minimal custom CSS required |
| **React Router v7** | ^7.15.1 | Client-side routing, nested routes |
| **Axios** | ^1.16.1 | Interceptor support for auth header injection |
| **Socket.io-client** | ^4.8.3 | Real-time bidding events (WebSocket + polling fallback) |
| **Framer Motion** | ^12.38.0 | Declarative spring animations (tab transitions, etc.) |
| **react-toastify** | ^11.1.0 | Non-blocking toast notifications |
| **@react-oauth/google** | ^0.13.5 | One-tap Google OAuth flow |
| **Razorpay** | (Dynamic script) | Indian payment gateway for wallet top-up |

---

# SECTION 2: FILE-BY-FILE BREAKDOWN

## `main.jsx` — Application Bootstrap

**Purpose:** Entry point. Wraps the entire app in context providers in the correct order.

**Provider nesting order matters critically:**
1. `AuthProvider` — outermost; every other context depends on knowing the user
2. `WalletProvider` — consumes `AuthContext` internally to know when to fetch balance
3. `GoogleOAuthProvider` — provides Google OAuth client ID to child components
4. `BrowserRouter` — enables React Router hooks in all children
5. `StrictMode` — runs effects twice in development to catch side-effect bugs

**Key import:** `import '../Config/interceptor.js'` — this side-effect-only import bootstraps the Axios request/response interceptors before any API call can happen.

---

## `App.jsx` — Routing Declaration

**Purpose:** Declares all client-side routes using React Router v7's `<Routes>` + `<Route>`.

**Architecture decision:** Routes are organized in comments by "Phase" (1–5) matching the product roadmap:
- Phase 1: Discovery & browsing
- Phase 2: Bidding terminal
- Phase 3: User wallet & verification
- Phase 4: Seller management
- Phase 5: Closing & operations

**Global layout elements** rendered outside `<Routes>`:
- `<Footer />` — always visible regardless of route
- `<ToastContainer />` — global toast notification container; positioned `bottom-right`

**Catch-all route:** `path="*"` renders `<NotFoundPage />` for any unmatched URL.

---

## `Config/Axios.jsx` — Axios Instance

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // reads from .env
  timeout: 5000,                               // 5-second timeout on all requests
  headers: { 'Content-Type': 'application/json' }
});
```

**Why a custom instance?** So the `baseURL` and default headers are set once. All `api.get()` calls automatically prepend the backend URL. If you used `axios.get()` directly, you'd repeat the URL on every call.

---

## `Config/interceptor.js` — Axios Interceptors

**Two interceptors bootstrapped here:**

**Request Interceptor:**
```js
api.interceptors.request.use((config) => {
  const token = getCookie('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```
- Reads the JWT from the `auth_token` cookie on every outgoing request
- Attaches it as a Bearer token header
- This is why you never see `Authorization` set manually in any component

**Response Interceptor:**
```js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      deleteCookie('auth_token');
      window.location.replace('/login'); // full page reload to clear React state
    }
    return Promise.reject(error);
  }
);
```
- Globally handles expired/invalid tokens
- Uses `window.location.replace` (not `navigate()`) because a full reload is needed to clear React context state (AuthContext, WalletContext) that would still hold stale `user` data

---

## `Context/AuthContext.jsx` — Authentication State

**What it does:** Creates a global authentication context that:
1. Checks for an `auth_token` cookie on startup
2. Validates it with the server (`GET /auth/profile`)
3. Stores the decoded user object in state
4. Prevents any child rendering until validation completes (`isInitializing`)

**`isInitializing` flag:**
```js
const [isInitializing, setIsInitializing] = useState(true);
// ...
{!isInitializing && children}  // ← holds the entire app until auth resolves
```
This prevents a "flash" where a logged-in user briefly sees the login page before the token is validated.

**`useAuth()` custom hook:**
```js
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within <AuthProvider>');
  return context;
};
```
The guard throws during development if you forget to wrap a component in the provider — much more debuggable than silent undefined.

---

## `Context/WalletContext.jsx` — Wallet & Payment State

**Responsibilities:**
- Fetches and caches wallet balance from server
- Manages virtual balance (optimistic UI while payment webhook may be delayed)
- Exposes `addFunds()` — triggers Razorpay checkout flow
- Exposes `lockDeposit()` — optimistically deducts 10% when bidding
- Exposes `fetchTransactions()` — loads transaction history

**Virtual balance pattern:**
```js
// After Razorpay payment, server webhook may take seconds to credit
// So we store a "virtual" balance in localStorage and show the higher value
const virtualVal = localStorage.getItem(`virtual_balance:${userId}`);
if (virtualBalance > serverBalance) {
  finalBalance = virtualBalance;  // show optimistic value
} else {
  localStorage.removeItem(`virtual_balance:${userId}`);  // server caught up, remove virtual
}
```

**`useCallback` on every exported function:** Prevents child components consuming `addFunds`, `lockDeposit`, etc. from re-rendering just because WalletProvider re-renders.

---

## `hooks/useSocket.js` — Real-Time Bidding Hook

**Purpose:** The most complex hook in the codebase. Manages Socket.io lifecycle for a single auction room.

**Inputs:** `(auctionId, initialBid, auctionType, item)`

**Connection logic:**
```js
const socket = io(socketUrl, {
  auth: { token },              // JWT sent on handshake for server-side auth
  transports: ['websocket', 'polling'],  // WebSocket first, polling fallback
});
socketRef.current = socket;   // stored in ref, not state, so changes don't re-render
```

**Why `useRef` for socket?** Storing the socket instance in state would cause a re-render every time the socket connects/disconnects, which would re-run the connection effect. `useRef` persists the value without triggering renders.

**Three auction engines handled differently:**
- **English:** Listens for `new_bid_update` events; updates `currentBid`, `lastBidder`
- **Dutch:** Runs `setInterval` locally (every 1s) to calculate descending price based on elapsed time
- **Blind:** Runs `setTimeout` recursively to poll for reveal time; fetches reveal data once deadline passes

**Cleanup:**
```js
return () => {
  socket.emit('leave_auction', auctionId);  // notify server
  socket.disconnect();
  clearInterval(dutchTimerRef.current);     // prevent memory leak
  clearTimeout(blindTimerRef.current);
};
```

---

## `services/auctionService.js` — API Abstraction Layer

**Purpose:** Single file where all auction-related API calls are defined. Components import from here instead of calling `api.get()` directly.

**`injectMockData(item)`** — The most interesting function:
- The backend doesn't always return `auctionType`
- This function deterministically assigns one based on character code sum of the item ID
- Also merges `localStorage` custom fields (set during listing creation)
- Sets Dutch/Blind specific fallback fields (`priceFloor`, `dropInterval`, `submissionDeadline`)

**`getActiveAuctions()` — client-side filtering reality:**
When filtering by auction engine (English/Dutch/Blind), the function fetches up to 200 items and filters client-side because there's no server endpoint for engine-based filtering. This is a known technical debt documented in `context.md`.

---

## `Components/Global/AuthController.jsx` — Route Guard

```jsx
const AuthController = () => {
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isInitializing && !user) navigate('/login', { replace: true });
  }, [user, isInitializing, navigate]);
  return null;  // renders nothing
};
```

**Drop-in route guard:** Add `<AuthController />` at the top of any page JSX. It renders nothing visible but redirects to `/login` if no authenticated user is found. The `{ replace: true }` prevents the login redirect from polluting browser history.

---

## `Components/Global/CookieIT.js` — Cookie Utilities

**Why cookies instead of localStorage for the auth token?**
- Cookies can be set with `SameSite=Lax` to reduce CSRF risk
- In production, `Secure` flag ensures HTTPS-only transmission
- However: cookies accessible via `document.cookie` are still vulnerable to XSS if scripts run on the page — `HttpOnly` cookies (set by the server) would be safer

**`getCookie()` pattern:**
```js
const value = `; ${document.cookie}`;
const parts = value.split(`; ${name}=`);
```
The leading `; ` prefix prevents false matches where a cookie named `token` would accidentally match inside `auth_token=`.

---

# SECTION 3: REACT COMPONENT HIERARCHY

```
<AuthProvider>                          ← global auth state
  <WalletProvider>                      ← global wallet state
    <GoogleOAuthProvider>               ← Google OAuth
      <BrowserRouter>                   ← routing
        <App>                           ← route definitions
          <Header />                    ← global nav (reads AuthContext)
          
          [Route: /dashboard]
          <BidderDashboardPage>
            <SEO />                     ← updates <head> tags
            <AuthController />          ← redirects if not logged in
            <BrowseAuctionCard />       ← persistent first grid card
            <ActiveBidCard />           ← per-bid card (uses useSocket internally)
            
          [Route: /auction/:id/console]
          <BiddingConsolePage>
            → useSocket(auctionId, ...)  ← real-time state
            
          [Route: /seller/:id]
          <SellerProfilePage>
            <SEO />
            → getSellerProfile() (auctionService)
            
          <Footer />                    ← always rendered
          <ToastContainer />            ← global toasts
```

**Data flow between parent → child:**
- `BidderDashboardPage` passes `item` and `onDelete` props to `ActiveBidCard`
- `ActiveBidCard` internally calls `useSocket(item._id, ...)` to get live bid data
- `ActiveBidCard` calls `onDelete(item._id)` to remove itself from parent's state

---

# SECTION 4: HOOKS — EXTREMELY DETAILED

## `useState` — State in This Project

### What it does internally:
When `setState(newValue)` is called, React schedules a re-render. The component function runs again with the new state value. React compares the new VDOM to the previous one (reconciliation) and commits only the changed DOM nodes.

### State is asynchronous-looking but synchronous in scheduling:
```js
// WRONG mental model:
setCurrentBid(500);
console.log(currentBid); // still old value! state hasn't updated yet

// WHY: React batches state updates. The new value is only available
// on the NEXT render cycle.
```

### Functional updates for derived state:
```js
// In useSocket.js:
setTotalBids(prev => prev + 1);  // safe even with concurrent renders

// vs:
setTotalBids(totalBids + 1);  // could be stale if multiple updates batched
```
`prev => prev + 1` always works on the latest committed state, not a potentially stale closure variable.

### useState examples from this project:

| State | File | Type | Purpose |
|---|---|---|---|
| `user` | AuthContext | Object/null | Current logged-in user |
| `isInitializing` | AuthContext | Boolean | Prevents render before auth check |
| `walletBalance` | WalletContext | Number | Current available balance |
| `currentBid` | useSocket | Number | Live current highest bid |
| `lastBidder` | useSocket | Object | Who placed the last bid |
| `activeItems` | BidderDashboardPage | Array | User's active bids |
| `activeTab` | BidderDashboardPage | String | 'bids'/'watchlist'/'won' |
| `search` | BidderDashboardPage | String | Filter text |
| `loading` | Multiple pages | Boolean | Show spinner while fetching |
| `profile` | SellerProfilePage | Object/null | Seller profile data |

---

## `useEffect` — Complete Analysis

### AuthContext.jsx — Session validation on mount:

```js
useEffect(() => {
  const token = getCookie('auth_token');
  if (!token) {
    setIsInitializing(false);
    return;  // ← early return, no cleanup needed
  }
  api.get('/auth/profile')
    .then(res => setUser(res.data?.user || res.data))
    .catch(() => { deleteCookie('auth_token'); setUser(null); })
    .finally(() => setIsInitializing(false));
}, []);  // ← empty array = runs ONCE on mount
```

**Lifecycle trace:**
1. `AuthProvider` mounts
2. `isInitializing = true` initially
3. Effect runs: checks cookie
4. If no token: sets `isInitializing = false`, stops
5. If token: calls `/auth/profile`
6. Response: sets `user` + `isInitializing = false`
7. Children now render (because `{!isInitializing && children}`)

**What if you removed the empty array `[]`?**
Effect would run on every render, causing an infinite loop: render → fetch → setUser → render → fetch...

---

### WalletContext.jsx — Fetch balance when user changes:

```js
useEffect(() => {
  if (isInitializing) return;
  if (!user) {
    setWalletBalance(0); setBiddingPower(0); setTransactions([]);
    return;
  }
  setIsLoadingWallet(true);
  fetchBalance();
}, [user, isInitializing, fetchBalance]);
```

**Dependency analysis:**
- `user` — re-fetch if user logs in/out/changes
- `isInitializing` — don't fetch while AuthContext is still resolving
- `fetchBalance` — memoized with `useCallback([user])`, so only changes when user changes

**What if `fetchBalance` wasn't in deps?**
ESLint exhaustive-deps rule would warn. More importantly, `fetchBalance` closes over `user`, so an outdated `fetchBalance` could post to wrong user's endpoint.

---

### useSocket.js — Connection on auctionId change:

```js
useEffect(() => {
  if (!auctionId) return;
  const token = getCookie('auth_token');
  if (!token) return;
  // ... connect, register events, start timers
  return () => {
    socket.emit('leave_auction', auctionId);
    socket.disconnect();
    clearInterval(dutchTimerRef.current);
  };
}, [auctionId, auctionType, item, user]);
```

**Cleanup is critical here.** Without the return cleanup function:
- Old socket connections would remain open (memory leak)
- Dutch countdown timers would pile up (setInterval every 1s, never cleared)
- Server would think the client is still in the old auction room

---

## `useContext` — AuthContext & WalletContext

**Pattern used:** Context + custom hook (e.g., `useAuth()`, `useWallet()`):
```js
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('...');  // dev-time guard
  return context;
};
```

**Why not export `AuthContext` and let components call `useContext(AuthContext)` directly?**
- Central guard: throws helpful error if used outside provider
- Encapsulation: consumers don't need to import both `AuthContext` and `useContext`
- Future-proofing: if the context shape changes, you update one file

**Re-render implication:** Any component calling `useAuth()` re-renders whenever `user` or `isInitializing` changes — even if the component only uses `user.username`. This could be optimized with context splitting (separate contexts for user data vs. loading state).

---

## `useRef` — Socket & Timer Storage

```js
const socketRef = useRef(null);    // holds Socket.io instance
const dutchTimerRef = useRef(null); // holds setInterval ID
const blindTimerRef = useRef(null); // holds setTimeout ID
```

**Why refs, not state?**
`useRef` changes do NOT trigger re-renders. If the socket was stored in state:
- Connecting (setting socket) would re-render
- Re-render would re-run the effect
- Effect would connect again → infinite loop

**Refs persist across renders** without causing them — perfect for mutable infrastructure objects (timers, sockets, DOM nodes).

---

## `useMemo` — Filtered Lists in BidderDashboardPage

```js
const filteredBids = useMemo(
  () => activeItems.filter(i => i.title?.toLowerCase().includes(search.toLowerCase())),
  [activeItems, search]
);
```

**Why `useMemo` here?**
- `activeItems` can have many items
- `search` is typed character by character — without `useMemo`, filter runs on every keystroke AND every other state change (tab switch, etc.)
- With `useMemo`, the filter only re-runs when `activeItems` or `search` actually changes

**When does `useMemo` recalculate?**
- When `activeItems` array reference changes (new fetch, item removed)
- When `search` string changes (user types)

---

## `useCallback` — Preventing Unnecessary Function Recreation

**In WalletContext:**
```js
const fetchBalance = useCallback(async () => { ... }, [user]);
```
Without `useCallback`, `fetchBalance` would be a new function reference on every WalletProvider render. This would cause the `useEffect([user, isInitializing, fetchBalance])` to fire on every render — potential infinite loop.

**In useSocket.js:**
```js
const placeBidSocket = useCallback((amount) => {
  socketRef.current?.emit('place_bid', { auctionId, amount });
}, [auctionId]);
```
`placeBidSocket` is passed as a prop to bidding UI components. Without `useCallback`, every parent re-render gives child a new function reference, causing unnecessary child re-renders.

---

## Custom Hooks Table

| Hook | Location | Purpose | Dependencies | Trigger | Output | Interview Importance |
|---|---|---|---|---|---|---|
| `useAuth()` | AuthContext | Access auth state | `useContext(AuthContext)` | Any render | `{user, setUser, isInitializing}` | ⭐⭐⭐⭐⭐ |
| `useWallet()` | WalletContext | Access wallet state | `useContext(WalletContext)` | Any render | `{walletBalance, addFunds, ...}` | ⭐⭐⭐⭐ |
| `useSocket()` | hooks/useSocket.js | Real-time auction data | `auctionId, auctionType, item, user` | auctionId change | `{currentBid, placeBidSocket, ...}` | ⭐⭐⭐⭐⭐ |

---

# SECTION 5: RENDERING & RE-RENDERING

## Initial Render Flow (BidderDashboardPage)

```
1. BidderDashboardPage function runs
2. useState initializes: activeItems=[], loading=true, activeTab='bids', search=''
3. useMemo runs: filteredBids = [] (empty since activeItems=[])
4. JSX returned: renders loading spinner
5. DOM committed
6. useEffect([user]) fires
7. api.get('/items/user/my-bids') starts
8. Component is "waiting" — no re-render yet
9. Response arrives → setActiveItems([...data]) → setLoading(false)
10. React schedules re-render (both state updates batched in React 18+/19)
11. Component re-renders: loading=false, activeItems=[...], filteredBids=[...]
12. Grid with bid cards renders
13. Each ActiveBidCard mounts → each calls useSocket() → connects to Socket.io
```

## Re-render Triggers

| Trigger | Which components re-render |
|---|---|
| `setUser()` in AuthContext | ALL consumers of `useAuth()` |
| `setWalletBalance()` | ALL consumers of `useWallet()` |
| New Socket.io event → `setCurrentBid()` | That specific `ActiveBidCard` |
| Tab click → `setActiveTab()` | `BidderDashboardPage` only |
| Search input → `setSearch()` | `BidderDashboardPage` only (useMemo recalcs) |

## Key Prop: `key` in Lists

```jsx
{filteredBids.map(item => <ActiveBidCard key={item._id} item={item} />)}
```

**Why `key={item._id}` and not `key={index}`?**
- If you use index and remove item at position 2, React thinks all items from position 2 onwards changed
- With `item._id`, React correctly identifies which specific card was removed and only destroys that DOM node
- **Critical here:** `ActiveBidCard` has a Socket.io connection. Wrong keys would cause connections to be torn down and rebuilt unnecessarily

---

# SECTION 6: DATA FLOW

## User Searches for Bids

```
User types in search input
        ↓
onChange fires → setSearch(e.target.value)
        ↓
BidderDashboardPage re-renders
        ↓
useMemo([activeItems, search]) recalculates filteredBids
        ↓
activeItems.filter(i => i.title.includes(search))
        ↓
New filteredBids array returned
        ↓
Grid renders filtered ActiveBidCards
        ↓
No API call needed — pure client-side filtering
```

## Wallet Top-Up Flow

```
User clicks "Top Up Wallet"
        ↓
addFunds(amount) called (from WalletContext)
        ↓
POST /payments/create-order → server creates Razorpay order
        ↓
loadRazorpay() dynamically injects <script> tag
        ↓
new window.Razorpay(options).open() → Razorpay modal appears
        ↓
User completes payment
        ↓
Razorpay handler callback fires with razorpay_payment_id
        ↓
POST /payments/webhook { event: 'payment.captured', payload: { payment: { entity: { id } } } }
        ↓
Server credits wallet
        ↓
updateVirtualState(amount) → stores in localStorage optimistically
        ↓
fetchBalance() → GET /wallet/balance → updates walletBalance state
        ↓
WalletContext consumers re-render with new balance
```

## Live Bid Update Flow

```
Opponent places bid in BiddingConsolePage
        ↓
POST /items/:id/place-bid (or socket emit)
        ↓
Server processes bid, broadcasts to all room members
        ↓
Socket.io emits 'new_bid_update' to all clients in auction room
        ↓
useSocket's socket.on('new_bid_update', ...) fires
        ↓
setCurrentBid(payload.newHighestBid)
setLastBidder({ username: 'OpponentName' })
setTotalBids(prev => prev + 1)
setBidHistoryList(prev => [newEntry, ...prev])
        ↓
ActiveBidCard re-renders showing new price
```

---

# SECTION 7: API & ASYNCHRONOUS PROCESSING

## API Layer Architecture

```
Components
    ↓
services/auctionService.js  (named functions)
    ↓
Config/Axios.jsx  (axios instance, baseURL)
    ↓
Config/interceptor.js  (auth header injection)
    ↓
Backend API
```

## Key API Endpoints Used

| Endpoint | Method | Used In | Purpose |
|---|---|---|---|
| `/auth/profile` | GET | AuthContext | Validate token, fetch user |
| `/wallet/balance` | GET | WalletContext | Fetch current balance |
| `/payments/create-order` | POST | WalletContext `addFunds` | Create Razorpay order |
| `/payments/webhook` | POST | WalletContext `addFunds` | Confirm payment |
| `/transaction/history` | GET | WalletContext | Load ledger |
| `/items` | GET | auctionService | Fetch auctions (paginated) |
| `/items/:id` | GET | auctionService | Single auction detail |
| `/items/user/my-bids` | GET | BidderDashboardPage | User's active bids |
| `/items` (status=SOLD) | GET | BidderDashboardPage | Won auctions |
| `/items` (POST, multipart) | POST | auctionService `createCustomItem` | Create listing |
| `/seller/dashboard` | GET | auctionService | Seller metrics |
| `/users/:id/profile` | GET | auctionService `getSellerProfile` | Seller public profile |

## Error Handling Pattern

```js
api.get('/items/user/my-bids')
  .then(res => {
    setActiveItems(res.data?.items ?? []);
  })
  .catch(err => {
    console.warn('Failed to fetch user active bids', err);
    setActiveItems([]);  // graceful degradation: show empty state
  })
  .finally(() => setLoading(false));  // always stop spinner
```

**Important:** `.finally()` runs regardless of success/failure, ensuring `loading` is always reset. Without it, a network error would leave the spinner spinning forever.

## Race Condition Risk in BidderDashboardPage

```js
useEffect(() => {
  api.get('/items/user/my-bids')
    .then(res => setActiveItems(res.data?.items ?? []));
}, [user]);
```

**Problem:** If `user` changes rapidly (logout then immediate login), two requests could be in-flight. The earlier request could resolve last and overwrite the correct response.

**Current mitigation:** None explicit. The `useEffect` cleanup could add request cancellation with `AbortController`:
```js
useEffect(() => {
  const controller = new AbortController();
  api.get('/items/user/my-bids', { signal: controller.signal })
    .then(...);
  return () => controller.abort();  // cancel on cleanup
}, [user]);
```

---

# SECTION 8: AUTHENTICATION & SECURITY

## Authentication Flow

```
User submits login form
        ↓
POST /auth/login { email, password }
        ↓
Server validates credentials, creates JWT
        ↓
Server sets HttpOnly cookie OR returns token
        ↓
Frontend receives token in response body
        ↓
setCookie('auth_token', token, { days: 7, sameSite: 'Lax' })
        ↓
Subsequent requests: interceptor reads getCookie('auth_token')
        ↓
config.headers.Authorization = `Bearer ${token}`
        ↓
Server validates JWT on protected routes
```

## Cookie Security Configuration

```js
setCookie(name, value, {
  days: 7,
  path: '/',
  sameSite: 'Lax',     // blocks cross-site request forgery in most cases
  secure: window.location.protocol === 'https:'  // HTTPS only in production
});
```

**Security considerations:**
- **What's protected:** `SameSite=Lax` prevents CSRF for most navigation; `Secure` prevents interception on HTTP
- **What's NOT protected:** The cookie is accessible via `document.cookie` — vulnerable to XSS. An `HttpOnly` cookie (server-set) would be immune to XSS
- **Interviewer will likely ask:** "Why not HttpOnly?" — because the frontend needs to read it directly for Axios headers. A better architecture would use HTTP-only cookies and rely on the browser to send them automatically

## Route Protection Pattern

```jsx
// On any protected page:
<AuthController />  // null-rendering guard
// If !user → redirects to /login
// If user → page continues rendering
```

**Why not a `PrivateRoute` wrapper component?** The current approach is simpler — drop `<AuthController />` anywhere in JSX. The downside is it's less explicit than route-level protection.

## Google OAuth Flow

```
User clicks "Sign in with Google"
        ↓
@react-oauth/google renders Google button
        ↓
Google returns OAuth credential (JWT)
        ↓
POST /auth/google with credential token
        ↓
Server verifies with Google, creates/finds user
        ↓
Server returns BidKar JWT
        ↓
setCookie + setUser
```

---

# SECTION 9: FORMS & USER INTERACTION

## Search Filter in BidderDashboardPage

```
Controlled component pattern:
input value={search} onChange={e => setSearch(e.target.value)}
        ↓
setSearch fires on every keystroke
        ↓
BidderDashboardPage re-renders
        ↓
useMemo recalculates filteredBids/filteredWatch/filteredWon
        ↓
Grid updates with filtered results
```

**No debouncing currently.** For the current list sizes this is fine, but with thousands of items a 300ms debounce on `setSearch` would prevent lag.

## Tab Switching

```jsx
<button onClick={() => { setActiveTab(tab.key); setSearch(''); }}>
```

**Two state updates in one handler:** React 18+ batches these automatically — only ONE re-render happens, not two.

## Wallet Top-Up Form (WalletPage)

1. User enters amount
2. `setAmount(value)` updates local state
3. User clicks "Add Funds"
4. Validation: `amount < 100 → toast.error`
5. `addFunds(amount)` called from WalletContext
6. Loading state set
7. Razorpay modal opens
8. On success: balance updates, success toast
9. On dismiss: cancelled toast

---

# SECTION 10: CONDITIONAL RENDERING

## Authentication-Dependent UI (Header.jsx pattern)

```jsx
{user ? (
  <UserMenu />  // shows profile, dashboard links
) : (
  <LoginButton />  // shows login/signup
)}
```

## Loading States

```jsx
{loading ? (
  <div className="spinner" />
) : (
  <div className="grid">
    {items.map(item => <Card item={item} />)}
  </div>
)}
```

## Empty State

```jsx
{filteredWon.length === 0 && search && (
  <div>No won items matching "{search}".</div>
)}
```

**Note the condition:** `filteredWon.length === 0 && search` — only shows "no results" message when user has actively searched. Without `&& search`, it would show "no results" for a user who genuinely has no won items AND hasn't searched.

## KYC Status in Hero

```jsx
{user?.kycStatus?.toLowerCase() === 'verified'
  ? 'KYC Details'
  : 'Complete KYC'
}
```

**Optional chaining (`?.`):** `user?.kycStatus` prevents crash if `user` is null (e.g., during initialization).

---

# SECTION 11: PERFORMANCE

## Issue 1: No Memoization on ActiveBidCard

**Problem:** `BidderDashboardPage` passes `item` and `onDelete` props to `ActiveBidCard`. When BidderDashboardPage re-renders (e.g., tab switch), all `ActiveBidCard`s re-render even if their `item` data didn't change.

**Why it happens:** React re-renders all children by default unless told otherwise.

**Fix:**
```jsx
const ActiveBidCard = React.memo(({ item, onDelete }) => { ... });
```

**Trade-off:** Adds shallow comparison on every render. Only worthwhile if cards are expensive to render (they are — they each have a Socket.io connection).

---

## Issue 2: getActiveAuctions Fetches 200 Items for Engine Filter

**Problem:**
```js
const requestParams = { ...params, limit: isEngineFilter ? 200 : limit };
```
Fetching 200 items to filter client-side is wasteful.

**Why:** No server endpoint for engine-type filtering exists (acknowledged in `context.md`).

**Fix:** Add backend filter: `GET /items?auctionType=ENGLISH&limit=16`. Currently blocked by server architecture.

---

## Issue 3: Axios Timeout = 5 Seconds

```js
timeout: 5000
```
On slow Indian networks, 5 seconds may be too short. Consider 10–15s or per-endpoint configuration.

---

## Issue 4: Razorpay Script Loaded Dynamically

```js
const script = document.createElement('script');
script.src = 'https://checkout.razorpay.com/v1/checkout.js';
script.async = true;
document.body.appendChild(script);
```

This is correct — loading Razorpay eagerly would add ~100KB to the initial bundle. Dynamic import on first wallet top-up is good practice.

---

# SECTION 12: RESPONSIVE DESIGN & UI

## Dual Styling System

The project uses **both** Tailwind utility classes (for most components) and **vanilla CSS classes** in `index.css` (for responsive layout overrides). This dual system exists because:
- Older pages/components were styled with Tailwind
- Responsive breakpoints for complex multi-column layouts were added to `index.css`

## Key Responsive Classes in `index.css`

```css
/* Desktop: 2-column sidebar + main content */
@media (min-width: 900px) {
  .bidder-dashboard-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 1.75rem;
    align-items: start;
  }
}

/* Mobile: Stack sidebar above content */
.bidder-dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
```

## Gavel Card Visibility

```jsx
{/* Hidden on mobile, shown on md+ */}
<div className="hidden md:flex w-full md:w-[380px] ...">
  <img src="/hero/gavel.jpg" ... />
</div>
```

**Decision:** On small screens, the gavel card takes up vertical space without adding information. Hiding it at `< 768px` keeps the hero tight and the CTA buttons visible above the fold.

## Small Device Typography Scaling

```css
@media (max-width: 767px) {
  .dashboard-hero-title {
    font-size: clamp(1.6rem, 6.8vw, 2.3rem) !important;
  }
  .dashboard-balance-amount {
    font-size: 1.4rem !important;
  }
}
```

`clamp()` is used for fluid typography — scales between min and max based on viewport width, no hard breakpoints needed.

---

# SECTION 13: ACCESSIBILITY

## Current Gaps (Honest Assessment)

| Issue | Example | Severity | Fix |
|---|---|---|---|
| Clickable divs | `<div onClick={...}>` in several cards | High | Use `<button>` with proper ARIA |
| No skip navigation | Header has no "Skip to main content" | Medium | Add `<a href="#main" className="sr-only focus:not-sr-only">` |
| Form labels missing | Some inputs identified only by placeholder | High | Add `<label htmlFor="...">` |
| Tab navigation | Custom tab buttons not keyboard-navigable | Medium | Add `onKeyDown` handler for arrow keys |
| Color contrast | Muted text `#94a3b8` on navy may fail AA | Medium | Verify contrast ratio ≥ 4.5:1 |

## What Works

- `<section>`, `<h1>`, `<h3>` semantic elements used in hero sections
- `alt` text on all images
- `aria-hidden="true"` on decorative SVG elements
- `loading="eager"` on above-the-fold gavel image

---

# SECTION 14: ERROR HANDLING

## API Error Handling Patterns

**Pattern 1: Graceful degradation with empty state**
```js
.catch(() => { setActiveItems([]); })
```
User sees "no items" rather than a broken page.

**Pattern 2: Silent ignore for non-critical endpoints**
```js
api.get('/items', { params: { sellerId, status: 'ACTIVE' }})
// In getSellerProfile():
} catch (err) {
  console.error('Error fetching items for seller profile', err);
  // activeItems stays [] — page still renders
}
```

**Pattern 3: Toast for user-facing errors**
```js
// In WalletContext:
return { success: false, message: err.response?.data?.message || 'Top-up initiation failed.' };
// Caller shows toast.error(result.message)
```

**Pattern 4: Global 401 intercept**
```js
// interceptor.js:
if (error.response?.status === 401) {
  deleteCookie('auth_token');
  window.location.replace('/login');
}
```
No page needs to handle auth expiry individually.

## What User Sees on Failure

| Failure | User Experience |
|---|---|
| Network error on bid fetch | Loading stops, empty grid shown |
| Auth token expired | Automatic redirect to /login |
| Seller profile 404 | Fallback "Seller" profile with empty listings |
| Razorpay SDK fails to load | Mock webhook is sent (dev mode fallback) |
| Socket.io disconnect | `isConnected = false`, UI shows disconnected state |

---

# SECTION 15: STATE MANAGEMENT

## State Categories

### Global State (React Context)

| State | Context | Shape | Who modifies | Who reads |
|---|---|---|---|---|
| `user` | AuthContext | `{userId, username, email, role, kycStatus}` or `null` | AuthContext on login/logout | Header, AuthController, useSocket, WalletContext |
| `isInitializing` | AuthContext | `boolean` | AuthContext once | WalletContext, AuthController |
| `walletBalance` | WalletContext | `number` | fetchBalance(), lockDeposit() | WalletPage, BidderDashboard hero |
| `biddingPower` | WalletContext | `number` (balance × 10) | fetchBalance(), lockDeposit() | BiddingConsolePage |

### Local Server State (per-page)

| State | Page | Lifecycle |
|---|---|---|
| `activeItems` | BidderDashboardPage | Fetched on mount, filtered by search |
| `wonItems` | BidderDashboardPage | Fetched on mount |
| `profile` | SellerProfilePage | Fetched on mount |
| `loading` | Multiple | true→false after fetch |

### Derived State (computed from other state)

```js
// Computed by useMemo — not stored separately:
const filteredBids = useMemo(
  () => activeItems.filter(i => i.title?.includes(search)),
  [activeItems, search]
);
```

### Persistent State (localStorage)

| Key | Purpose |
|---|---|
| `watchlist:{userId}` | Per-user watchlist (persists across sessions) |
| `virtual_balance:{userId}` | Optimistic wallet after top-up (cleared when server syncs) |
| `virtual_transactions:{userId}` | Optimistic transaction entries |
| `local_auction_details:{itemId}` | Custom auction fields set during listing creation |

---

# SECTION 16: JAVASCRIPT CONCEPTS USED

## Optional Chaining `?.`

```js
// useSocket.js:
const isMe = (item.winnerId._id || item.winnerId) === user?.userId;
// user?.userId → if user is null, returns undefined instead of throwing TypeError

// BidderDashboardPage:
user?.kycStatus?.toLowerCase() === 'verified'
// If user is null → undefined. If kycStatus is undefined → undefined. No crash.
```

## Nullish Coalescing `??`

```js
// WalletContext:
const serverBalance = data.data?.availableMoney ?? data.walletBalance ?? 0;
// Uses first non-null/undefined value
// Different from || which would skip 0 (a valid balance)
```

## Spread + Rest

```js
// auctionService.js injectMockData:
Object.assign(item, parsed);  // merge localStorage fields into item

// getActiveAuctions:
const requestParams = { ...params, limit: isEngineFilter ? 200 : limit };
// Spread params then override limit
```

## Array Methods

```js
// map + filter + sort in auctionService:
items
  .filter(item => new Date(item.endTime) > new Date())  // filter expired
  .sort((a, b) => new Date(a.endTime) - new Date(b.endTime))  // sort ascending
  .slice(0, limit);  // take first N

// Reduce to sum character codes (deterministic auction type):
const charCodeSum = idStr.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
```

## Promise.all for Parallel Requests

```js
// auctionService.getSellerProfile:
const [activeRes, endedRes] = await Promise.all([
  api.get('/items', { params: { sellerId, status: 'ACTIVE' } }),
  api.get('/items', { params: { sellerId, status: 'SOLD' } }),
]);
// Both requests run simultaneously — halves wait time vs sequential await
```

## Closures in Event Handlers

```js
// socket.on('new_bid_update', (payload) => {
//   payload.bidderId === user?.userId  ← closes over `user` from useEffect scope
// });
```
**Stale closure risk:** If `user` changes after the socket listener is registered but before it fires, the listener uses the old `user` value. This is why `user` is in the dependency array — the effect re-runs and re-registers listeners with the current `user`.

---

# SECTION 17: CSS / TAILWIND LOGIC

## Mixed Styling Architecture

The project uses Tailwind utility classes on most elements but adds `.css` classes for:
1. Complex responsive grid layouts
2. Animation keyframes (`@keyframes spin`)
3. Overriding inline styles on mobile (using `!important` with media queries)

## Clip Path Cards (No Border Radius)

```js
// BidderDashboardPage & SellerProfilePage:
style={{
  clipPath: 'url(#dashboard-card-notch)',
  WebkitClipPath: 'url(#dashboard-card-notch)',
}}
```
Defined in an invisible `<svg>` with `<defs>`. This creates a complex non-rectangular card shape that CSS `border-radius` cannot achieve.

## Gold Gradient Text

```js
style={{
  background: 'linear-gradient(90deg, #fece44 0%, #feda75 50%, #e5b630 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}}
```
`WebkitTextFillColor: 'transparent'` makes the text transparent so the background gradient shows through. Both vendor-prefixed and standard properties are needed for cross-browser support.

## `clamp()` for Fluid Typography

```css
font-size: clamp(1.6rem, 6.8vw, 2.3rem);
/* Minimum: 1.6rem | Preferred: 6.8% of viewport width | Maximum: 2.3rem */
```
No hard breakpoints needed — scales smoothly between min and max.

---

# SECTION 18: COMPLETE USER FLOW TRACES

## Flow 1: First-Time User Registration

```
1. User visits /sign-up
2. Fills email, username, password
3. onChange → setEmail/setUsername/setPassword
4. Submit → validation check
5. POST /auth/signup { email, username, password }
6. Server sends OTP to email
7. User redirected to /Verify-email
8. User enters OTP
9. POST /auth/verify-otp
10. Server creates user, returns JWT
11. setCookie('auth_token', jwt)
12. setUser(userData) in AuthContext
13. Navigate to /dashboard or home
```

## Flow 2: Placing a Bid (English Auction)

```
1. User opens /auction/:id/console
2. BiddingConsolePage mounts
3. useSocket(auctionId, initialBid, 'ENGLISH', item) called
4. Socket connects, joins room
5. bid_history received → setBidHistoryList
6. User enters bid amount
7. setAmount(e.target.value)
8. User clicks "Place Bid"
9. lockDeposit(auctionId, title, amount) → check walletBalance ≥ 10%
10. placeBidSocket(amount) → socket.emit('place_bid', { auctionId, amount })
11. placeBidEvent(amount) → optimistic UI (currentBid = amount, lastBidder = 'You')
12. Server processes bid
13. Server broadcasts 'new_bid_update' to all room members
14. Other clients' currentBid updates in real-time
15. If valid: bid accepted, escrow locked server-side
16. If invalid: 'bid_rejected' event → setSocketError(message)
```

## Flow 3: Wallet Top-Up

```
1. User clicks "Top Up" in wallet page or dashboard
2. Amount input → setAmount
3. Click "Add Funds"
4. addFunds(amount) called
5. POST /payments/create-order { coinsRequested: amount }
6. Server creates Razorpay order, returns orderId + amount (in paise)
7. loadRazorpay() → dynamic <script> injection
8. new window.Razorpay(options).open()
9. Razorpay modal appears
10. User enters card/UPI details
11. Razorpay handler fires with payment response
12. POST /payments/webhook (manual call to simulate server webhook)
13. Server credits wallet
14. updateVirtualState(amount) → localStorage optimistic update
15. fetchBalance() → re-fetch actual balance
16. toast.success("Wallet credited!")
```

## Flow 4: Seller Creates Listing

```
1. Seller navigates to /seller/create
2. DesktopOnlyNoticePage may redirect mobile users to /seller/create-desktop-only
3. CreateListingPage renders multi-step form
4. Seller fills: title, description, category, startingPrice, auctionType
5. Seller uploads images (photos)
6. Submit → createCustomItem(formData)
7. POST /items (multipart/form-data) — Cloudinary upload via server
8. Server creates item, returns { item: { _id } }
9. Any Dutch/Blind specific fields saved to localStorage:
   localStorage.setItem(`local_auction_details:${item._id}`, JSON.stringify(customFields))
10. Navigate to /seller/studio
```

## Flow 5: Viewing Seller Profile

```
1. User clicks seller name link → /seller/:id
2. SellerProfilePage mounts
3. setLoading(true)
4. getSellerProfile(sellerId) called
5. Three parallel operations:
   a. GET /users/:id/profile (profile data)
   b. GET /items?sellerId=:id&status=ACTIVE (active listings)
   c. GET /items?sellerId=:id&status=SOLD (ended listings)
   d. GET /reviews/user/:id (reviews)
   Actually: profile first, then Promise.all for items, then reviews
6. Data assembled into { username, kycStatus, activeItems, endedItems, reviews }
7. setProfile(assembled data)
8. setLoading(false)
9. Hero renders seller name, KYC status, reputation
10. Grid renders active listings
```

---

# SECTION 19: "WHY DID I CODE IT THIS WAY?"

## Q: Why Context instead of Redux/Zustand?

**Problem:** Auth state and wallet state needed to be globally accessible without prop drilling.

**Why Context is reasonable here:**
- Two global states (auth + wallet) — not complex enough to justify Redux overhead
- No complex state operations like undo/redo, time-travel debugging
- Context updates are infrequent (login, logout, balance change)

**When Redux would be better:** If 10+ interdependent state slices existed, if many actions needed to update the same state, or if state required middleware (e.g., for analytics).

---

## Q: Why is `useSocket` a custom hook and not inline?

**Problem:** Multiple components need real-time bid data for the same or different auctions.

**How it's reused:**
- `ActiveBidCard` uses `useSocket(item._id, ...)` — one connection per active bid
- `BiddingConsolePage` uses `useSocket(auctionId, ...)` — one connection for the current console

**Why extracted:** Keeps connection lifecycle (connect, event handlers, cleanup, timers) out of component render functions. Components become declarative data consumers.

---

## Q: Why `window.location.replace` instead of `navigate()` for 401?

**Problem:** When a JWT expires, the entire app's React state (`user`, `walletBalance`, etc.) is stale.

**Why replace:** `navigate('/login')` keeps React running with stale state. `window.location.replace('/login')` triggers a full page reload — React remounts from scratch, providers re-initialize with null states. This is the correct behavior for auth expiry.

---

## Q: Why are auction types partially client-side?

**Problem:** The backend doesn't always return `auctionType` in item data (schema gap).

**Decision:** `injectMockData()` deterministically assigns types based on item ID character codes. This means:
- Same item always gets the same type across sessions
- No random assignment per user session
- Data persists in localStorage for seller-created custom types

**Trade-off:** This is a hack. The correct fix is for the backend to always include `auctionType`. Acknowledged in `context.md`.

---

## Q: Why store virtual balance in localStorage?

**Problem:** After Razorpay payment, the server webhook (which actually credits the wallet) may be delayed by seconds. If `fetchBalance()` is called immediately, it returns the pre-payment balance.

**Solution:** Store the expected post-payment balance in localStorage and show the higher of (server balance, virtual balance). Once server catches up, virtual balance is cleared.

**Risk:** If the webhook fails and server never credits, the virtual balance shows forever until manually cleared or user logs out. A TTL (expiry timestamp) would mitigate this.

---

# SECTION 20: CODE SMELLS & IMPROVEMENTS

## Smell 1: `placeBid` is a stub

```js
// auctionService.js:
export async function placeBid(itemId, amount) {
  return { success: true };  // ← does nothing!
}
```
**Severity:** High — misleading stub. Actual bidding uses Socket.io (`placeBidSocket`), but this function implies HTTP bidding is implemented.
**Fix:** Remove or implement properly.

---

## Smell 2: Inline styles everywhere in dashboard pages

Large objects like:
```js
style={{ margin: '0 0 0.5rem', fontSize: '0.88rem', fontWeight: 800, ... }}
```
**Problem:** No design system, hard to maintain, verbose JSX.
**Fix:** Extract to CSS classes or a design token system.

---

## Smell 3: Missing AbortController for API calls

```js
useEffect(() => {
  api.get('/items/user/my-bids').then(res => setActiveItems(res.data?.items ?? []));
}, [user]);
```
No cleanup → if `user` changes quickly, stale response can overwrite fresh data.
**Fix:** Add `AbortController` and `signal` to axios request.

---

## Smell 4: Console.log/warn left in production paths

```js
console.warn('Failed to fetch user active bids', err);
console.error('Blind reveal fetch failed:', err);
```
**Severity:** Low-Medium. Logs internal details in browser console in production.
**Fix:** Use a proper logger that's silenced in production (`NODE_ENV === 'production'`).

---

## Smell 5: Hardcoded Razorpay key in source

```js
key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SslcoQcFBltexQ'
```
The test key is committed to source. Even test keys should not be hardcoded — use env variable exclusively.

---

## Smell 6: `getEndingSoon` and `getFeaturedAuctions` fetch ALL active items

```js
export async function getEndingSoon(limit = 12) {
  const items = await fetchAllActive();  // fetches potentially hundreds of items
  return items.sort(...).slice(0, 12);  // uses only 12
}
```
Wastes bandwidth. Needs dedicated server endpoints.

---

# SECTION 21: INTERVIEW PREPARATION

## Beginner Questions

**Q: What does your project do?**
A: BidKar is a real-time auction marketplace for India. Bidders can browse items, enter live bidding consoles, and compete in English (rising bids), Dutch (price drop), or Blind (sealed) auctions. Sellers list items, manage their studio, and complete handoffs with winners. The wallet system uses Razorpay for top-ups and manages 10% escrow deposits.

**Q: Why did you choose React?**
A: React's component model maps perfectly to an auction UI — each auction card, bid entry, timer display, and real-time update is its own component. The hook system (`useSocket`, `useAuth`, `useWallet`) lets me encapsulate complex logic. React's reconciliation is efficient for the frequent state updates driven by Socket.io events.

**Q: What is useState?**
A: `useState` is a React hook that declares a state variable and a setter function. When the setter is called, React schedules a re-render of the component. Unlike regular variables, state persists across renders. Example: `const [currentBid, setCurrentBid] = useState(0)` in `useSocket` — `setCurrentBid` is called when a Socket.io event arrives, causing the bid display to update.

**Q: What is useEffect?**
A: `useEffect` runs side effects after render. The dependency array controls when it re-runs. With `[]` it runs once on mount; with `[user]` it re-runs when `user` changes. In `AuthContext`, the empty-dependency effect validates the auth token on startup. In `useSocket`, the effect creates the Socket.io connection and returns a cleanup function that disconnects on unmount.

---

## Intermediate Questions

**Q: Why does `useSocket` have `item` in its dependency array even though `item` is complex?**
A: Because the Dutch auction price calculation uses `item.startingPrice`, `item.dropAmount`, `item.startTime`. If `item` loads asynchronously (API response), the effect needs to re-run with the actual item data to start the correct price countdown. If `item` was missing from deps, the timer would start with `undefined` values.

**Q: Why does WalletContext use `useCallback` for `fetchBalance`?**
A: `fetchBalance` is listed as a dependency of `useEffect` in WalletContext. Without `useCallback`, `fetchBalance` would be a new function reference on every render, causing the `useEffect` to fire on every render — an infinite loop of balance fetches.

**Q: How do you handle the case where Razorpay fails to load?**
A: The `loadRazorpay()` function returns a Promise that resolves `true` or `false`. If `window.Razorpay` doesn't exist after loading, we fall back to calling the `/payments/webhook` endpoint directly with a mock payment ID. This is explicitly a development fallback and should be removed in production.

---

## Advanced Questions

**Q: Could the Socket.io effect cause a memory leak?**
A: Yes, if the cleanup function is missing or incomplete. Currently, the cleanup emits `leave_auction`, calls `socket.disconnect()`, and clears the Dutch/Blind timers. Without this cleanup:
1. The socket connection stays open indefinitely
2. `setInterval` (Dutch countdown) keeps firing after unmount — calling `setCurrentBid` on an unmounted component (React 18+ shows a warning for this)
3. The server keeps the user counted as present in the auction room

**Q: How would you optimize rendering of many active bid cards?**
A: 1. `React.memo()` on `ActiveBidCard` to prevent re-renders when parent state changes unrelated to that card. 2. Virtualization (e.g., `react-window`) if lists exceed 50+ items. 3. Separate the real-time Socket.io state from the static card data — currently the whole card re-renders on any bid update; only the price display needs to.

**Q: What's the risk of the deterministic auction type injection?**
A: The character code sum modulo 3 assignment is deterministic but semantically meaningless. An item with ID `abc123` gets DUTCH not because it IS a Dutch auction, but because the math happens to produce `1`. This confuses:
- The user (they see "Dutch" on an item that's actually English)
- The bidding console (shows Dutch UI for an English item)
- Analytics (wrong auction type in reports)
The only correct fix is for the server to always include `auctionType`.

---

# SECTION 22: PROJECT-SPECIFIC INTERVIEW QUESTIONS

**Q1: Walk me through what happens when AuthProvider renders.**

**Short answer:** It checks for an `auth_token` cookie, validates it with the server, and holds all children from rendering until validation completes.

**Detailed answer:** `AuthProvider` renders with `isInitializing = true`. It renders `null` for children (the entire app is blocked). A `useEffect` with `[]` runs once: reads `getCookie('auth_token')`. If no token exists, it sets `isInitializing = false` — app renders as guest. If token exists, it calls `GET /auth/profile`. On success, `setUser(data.user)` and `setIsInitializing(false)` — app renders as authenticated. On failure (expired/invalid token), it deletes the cookie and sets `isInitializing = false` — app renders as guest.

**Code reference:** `AuthContext.jsx` lines 13–41

**Follow-up:** "What if the network is down?" → The `.catch()` handles the rejection, deletes the cookie, sets `isInitializing = false`. App renders as guest even though the user might actually be valid. This could be improved by caching the user object in localStorage as a fast-path fallback.

---

**Q2: Why does `useSocket` connect to Socket.io using `auth: { token }`?**

**Short answer:** The server validates the JWT on the WebSocket handshake to ensure only authenticated users can join auction rooms.

**Detailed answer:** Socket.io supports an `auth` option on the client that's sent as part of the connection handshake. The server can access this via `socket.handshake.auth.token`. The server middleware validates this JWT before allowing the socket to connect. This prevents unauthenticated users from joining rooms and receiving real-time bid data.

**Code reference:** `useSocket.js` line 77–80

---

**Q3: Explain `injectMockData` and why it exists.**

**Short answer:** The backend doesn't always return `auctionType` or Dutch/Blind specific fields, so this function fills in the gaps deterministically.

**Detailed answer:** When items are fetched, some may lack `auctionType`, `priceFloor`, `dropInterval`, or `submissionDeadline`. Without these, the bidding console wouldn't know which UI to show or how to calculate prices. `injectMockData` solves this by: 1) Checking localStorage for custom fields saved during listing creation. 2) Using character code sum to deterministically assign ENGLISH/DUTCH/BLIND based on item ID. 3) Setting fallback values for Dutch (priceFloor = 45% of startingPrice, etc.) and Blind (revealTime = endTime + 15 seconds).

**Code reference:** `auctionService.js` lines 23–77

**Potential follow-up:** "Is this production-ready?" No — it's a workaround for a missing backend feature.

---

**Q4: How does the optimistic bid update work in useSocket?**

When a user places a bid, two things happen:
1. `placeBidEvent(amount)` is called — immediately updates `currentBid`, `lastBidder` to `'You'`, increments `totalBids` in local state
2. `placeBidSocket(amount)` is called — emits to server

If the server accepts the bid, the `new_bid_update` event arrives and confirms the state. If rejected, `bid_rejected` event arrives and `setSocketError(message)` displays the error. The optimistic update makes the UI feel instant even though the socket round-trip takes 50–200ms.

---

**Q5: Explain the `watchlist` persistence mechanism.**

```js
// BidderDashboardPage:
const watchlistKey = `watchlist:${user?.userId || user?._id || 'guest'}`;
const saved = localStorage.getItem(watchlistKey);
if (saved) { const p = JSON.parse(saved); if (p?.length > 0) setWatchlist(p); }
```

The watchlist is stored in localStorage per user ID. When a user removes an item:
```js
const removeWatchedItem = id => setWatchlist(prev => {
  const next = prev.filter(i => i._id !== id);
  localStorage.setItem(watchlistKey, JSON.stringify(next));
  return next;
});
```
State and localStorage are kept in sync synchronously. The key includes the user ID to prevent Account A from seeing Account B's watchlist on the same browser.

---

**Q6: How does BidderDashboardPage avoid API calls when switching tabs?**

It doesn't — it fetches all data on mount and filters client-side. There's no per-tab API call. `useMemo` handles the filtering:
```js
const filteredBids = useMemo(() => activeItems.filter(...), [activeItems, search]);
const filteredWatch = useMemo(() => watchlist.filter(...), [watchlist, search]);
const filteredWon = useMemo(() => wonItems.filter(...), [wonItems, search]);
```
Tab switches update `activeTab` state — no API call, just a different array displayed. This is intentional for fast UX.

---

**Q7: Why does the 401 response handler use `window.location.replace` instead of React Router's `navigate`?**

`navigate('/login')` would only change the URL. React's component tree, including `AuthContext` and `WalletContext`, would remain mounted with their current state — `user` still set, `walletBalance` still showing. The next page load would try to read an auth state that's been invalidated.

`window.location.replace('/login')` does a full browser navigation — the page reloads, all React state is destroyed and re-initialized from scratch. This is the correct behavior when a session expires: start fresh.

---

# SECTION 23: RAPID-FIRE FAQ

**Q: What is the virtual DOM?**
A: A JavaScript representation of the DOM tree that React maintains. When state changes, React generates a new virtual DOM, diffs it with the previous one (reconciliation), and commits only the changed real DOM nodes.

**Q: What is reconciliation?**
A: The process by which React compares the new virtual DOM tree with the previous one and determines the minimal set of DOM operations needed to bring the real DOM up to date.

**Q: What does `key` prop do?**
A: Helps React identify which list items changed, were added, or removed. Without unique stable keys, React may incorrectly reuse component instances, causing state corruption and unnecessary re-renders.

**Q: When does useEffect cleanup run?**
A: Before the effect runs again (on dependency change) and when the component unmounts.

**Q: What is the difference between `useMemo` and `useCallback`?**
A: `useMemo` memoizes a computed value. `useCallback` memoizes a function reference. `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

**Q: Can you update state in a useEffect cleanup?**
A: No (and shouldn't). The cleanup runs when the component is unmounting or before the next effect. Setting state in cleanup calls setState on a potentially unmounted component.

**Q: What is prop drilling?**
A: Passing props through intermediate components that don't need them. Context solves prop drilling by providing data globally without threading props down the tree.

**Q: What is the difference between `null` and `undefined` in state?**
A: Both represent "no value," but `null` is explicit ("I have no user") while `undefined` is implicit. React treats both as falsy. `useState(null)` is preferred when you want to express "not yet loaded" explicitly.

**Q: What triggers a React re-render?**
A: 1) `setState` call. 2) Context value change. 3) Parent re-render (unless `React.memo` is used). 4) `useReducer` dispatch.

**Q: What is `React.StrictMode`?**
A: Development-only wrapper that double-invokes renders and effects to surface side-effect bugs. Explains why effects run twice in development with `[]` dependency.

**Q: What is the difference between `replace` and `push` in React Router?**
A: `push` adds to history stack (back button works). `replace` replaces current entry (back button goes to the page before). Used for redirects where going "back" shouldn't return to the redirect.

**Q: What is `Promise.all`?**
A: Takes an array of Promises, runs them in parallel, resolves when ALL succeed (returns array of results), rejects immediately if ANY fails.

**Q: What is the difference between `async/await` and `.then/.catch`?**
A: Syntactic sugar — `async/await` is built on Promises. `await` pauses execution of the async function until the Promise resolves. `.then` chains callbacks. Both handle Promises; `async/await` is generally more readable.

**Q: What is CORS?**
A: Cross-Origin Resource Sharing. Browser security policy that restricts web pages from making requests to a different domain than the one that served the page. The server must include `Access-Control-Allow-Origin` headers.

**Q: What is XSS?**
A: Cross-Site Scripting. Attack where malicious scripts are injected into a web page viewed by other users. In this project, `document.cookie` access for the auth token is an XSS risk (an injected script could steal the token). `HttpOnly` cookies mitigate this.

**Q: Why use Axios over fetch?**
A: Axios provides: automatic JSON parsing, request/response interceptors, request timeout, automatic request cancellation, better error objects with `response.status`.

**Q: What is WebSocket?**
A: Full-duplex communication channel over a single TCP connection. Unlike HTTP, the server can push data to the client without a request. Socket.io wraps WebSocket with fallback to HTTP long-polling and adds rooms, namespaces, and event abstraction.

**Q: What is `SameSite=Lax` on cookies?**
A: Allows cookies to be sent on top-level navigation but not on cross-site sub-requests (AJAX, images). Prevents most CSRF attacks without completely blocking cookies on navigation.

**Q: What is the difference between `localStorage` and `sessionStorage`?**
A: `localStorage` persists until explicitly cleared. `sessionStorage` is cleared when the browser tab closes. This project uses `localStorage` for watchlist, virtual balance — intentionally persisted across sessions.

**Q: What does `Object.assign(target, source)` do?**
A: Copies all enumerable own properties from `source` to `target`. Mutates and returns `target`. Used in `injectMockData` to merge localStorage custom fields into the item object.

**Q: Why use Vite instead of Create React App?**
A: Vite uses native ES modules in development — no bundling, instant HMR. CRA uses webpack which bundles everything, causing slow cold starts. Vite build (via Rollup) produces smaller, faster bundles.

**Q: What is `clamp()` in CSS?**
A: `clamp(min, preferred, max)` — returns `preferred` clamped between `min` and `max`. Used for fluid typography that scales with viewport width without hard breakpoints.

---

# SECTION 24: "EXPLAIN THIS CODE TO AN INTERVIEWER"

## Code 1: AuthContext Session Validation

```js
useEffect(() => {
  const token = getCookie('auth_token');
  if (!token) { setIsInitializing(false); return; }
  api.get('/auth/profile')
    .then((res) => setUser(res.data?.user || res.data))
    .catch(() => { deleteCookie('auth_token'); setUser(null); })
    .finally(() => setIsInitializing(false));
}, []);
```

**What it does:** Validates the stored JWT on app startup.

**Why it exists:** Without this, a hard refresh would log out every user. With this, users stay logged in as long as their token is valid.

**Line by line:**
- Line 1: `useEffect` with `[]` — runs exactly once when `AuthProvider` mounts
- Line 2: Reads JWT from cookie — if absent, skip network call
- Line 3: If no token, `isInitializing = false` — app renders as guest immediately
- Line 4: HTTP GET to validate token server-side and get user data
- Line 5: Success — store user object in state
- Line 6: Failure — delete corrupted/expired token, ensure user = null
- Line 7: Always (success or failure) — mark initialization complete

**Edge cases:** Network down → catch fires → user appears as guest. Token present but API offline → same result. App should cache user data in localStorage to handle this.

**Interview answer:** "This is the auth initialization guard. The empty dependency array ensures it runs once on mount. The `isInitializing` flag prevents any child rendering until we know the auth state — this prevents a flash where a logged-in user briefly sees the login page."

---

## Code 2: Dutch Auction Local Price Calculation

```js
const updateDutchPrice = () => {
  const now = Date.now();
  if (now < startMs) { setCurrentBid(item.startingPrice); return; }
  const elapsedSeconds = Math.floor((now - startMs) / 1000);
  const drops = Math.floor(elapsedSeconds / interval);
  const activePrice = Math.max(floor, item.startingPrice - (drops * dropAmt));
  setCurrentBid(activePrice);
  // ...
};
dutchTimerRef.current = setInterval(updateDutchPrice, 1000);
```

**What it does:** Computes the current Dutch auction price purely client-side, every second.

**Why client-side?** Broadcasting price drops from the server every second to potentially thousands of clients would be expensive. Instead, all clients compute the same price independently from the same start time.

**Why `useRef` for timer ID?** So `clearInterval` can be called in cleanup without triggering re-renders.

**Interview answer:** "Rather than the server pushing price every second, all clients compute the price from a shared timestamp. `Math.floor(elapsedSeconds / interval)` gives the number of drops, multiplied by `dropAmt` and subtracted from starting price. `Math.max(floor, ...)` ensures price never goes below the minimum."

---

## Code 3: Socket Cleanup

```js
return () => {
  socket.emit('leave_auction', auctionId);
  socket.disconnect();
  setIsConnected(false);
  if (dutchTimerRef.current) { clearInterval(dutchTimerRef.current); dutchTimerRef.current = null; }
  if (blindTimerRef.current) { clearTimeout(blindTimerRef.current); blindTimerRef.current = null; }
};
```

**What it does:** Cleans up all resources when the auction component unmounts.

**Why it matters:**
- Without `socket.disconnect()`: open connection leaks
- Without `clearInterval`: timer fires calling `setCurrentBid` on unmounted component
- Without `socket.emit('leave_auction')`: server counts ghost viewers

**Interview answer:** "This cleanup function runs when the component unmounts or when `auctionId`/`auctionType` changes. It's critical for preventing memory leaks and ghost socket connections. The `dutchTimerRef.current = null` after clearing prevents a double-clear bug if cleanup runs twice (StrictMode)."

---

## Code 4: Virtual Balance Reconciliation

```js
const virtualVal = localStorage.getItem(`virtual_balance:${userId}`);
if (virtualVal) {
  const virtualBalance = Number(virtualVal);
  if (virtualBalance > serverBalance) {
    finalBalance = virtualBalance;
  } else {
    localStorage.removeItem(`virtual_balance:${userId}`);  // server caught up
  }
}
```

**What it does:** Shows the higher of server balance or locally-stored optimistic balance.

**Why it exists:** Razorpay payment confirmation webhooks can take seconds. Without this, after a top-up the user would briefly see their old balance.

**Interview answer:** "This is an optimistic UI pattern. After payment, I immediately write the expected new balance to localStorage. When I fetch from the server, I compare — if server hasn't caught up yet, I show the virtual balance. Once the server balance equals or exceeds the virtual, I clear it. The risk is if the webhook fails and the credit never happens — the user sees a phantom balance. In production I'd add a TTL."

---

# SECTION 25: CHEAT SHEET

## Project Architecture

```
main.jsx
  ├── AuthProvider (auth_token cookie → JWT validation)
  ├── WalletProvider (balance, addFunds, lockDeposit)
  ├── GoogleOAuthProvider
  └── BrowserRouter → App.jsx → Routes
```

## Critical Files

| File | Role |
|---|---|
| `Config/Axios.jsx` | Axios instance with baseURL |
| `Config/interceptor.js` | Auth header + 401 handler |
| `Context/AuthContext.jsx` | Global user state |
| `Context/WalletContext.jsx` | Global wallet state + Razorpay |
| `hooks/useSocket.js` | Real-time Socket.io hook |
| `services/auctionService.js` | All API calls |
| `Components/Global/AuthController.jsx` | Route guard (null render) |
| `Components/Global/CookieIT.js` | Cookie CRUD utilities |

## Key State Variables

| Variable | Location | Type | Purpose |
|---|---|---|---|
| `user` | AuthContext | Object/null | Auth state |
| `isInitializing` | AuthContext | boolean | Prevents render before auth |
| `walletBalance` | WalletContext | number | Balance in ₹ |
| `biddingPower` | WalletContext | number | walletBalance × 10 |
| `currentBid` | useSocket | number | Live bid price |
| `lastBidder` | useSocket | {username} | Last bid placer |
| `isConnected` | useSocket | boolean | Socket connection status |

## Authentication Flow

```
Startup: cookie check → GET /auth/profile → setUser
Login: POST /auth/login → setCookie → setUser
Google: Google OAuth → POST /auth/google → setCookie → setUser
Expiry: 401 → deleteCookie → window.location.replace('/login')
Route guard: AuthController → useEffect → navigate('/login', { replace: true })
```

## Auction Engines (useSocket)

| Engine | Price Source | Timer |
|---|---|---|
| ENGLISH | Socket.io `new_bid_update` | Server-driven |
| DUTCH | Client calculation every 1s | `setInterval` in useSocket |
| BLIND | Server fetch on reveal time | `setTimeout` polling |

## Security Points

- JWT stored in `SameSite=Lax; Secure` cookie (not HttpOnly — XSS risk)
- Auth header injected by Axios interceptor globally
- 401 handled globally — full page reload to clear state
- Razorpay test key should not be hardcoded in source

## Performance Optimizations Present

- `useMemo` for filtered bid/watchlist/won lists
- `useCallback` on all WalletContext functions
- Dutch price computed locally (no server push per second)
- Razorpay SDK loaded dynamically (not in initial bundle)

## Known Technical Debts

1. `auctionType` is client-injected (should be server-provided)
2. No `AbortController` on API calls (race condition risk)
3. Watchlist and some auction types use localStorage (not server-persisted)
4. `placeBid()` in auctionService is a no-op stub
5. Fetches 200 items for engine filter (no server-side engine filtering)

---

# SECTION 26: FINAL 2-MINUTE PROJECT EXPLANATION

## 30-Second Version

"BidKar is a real-time auction marketplace I built with React and Node.js. Users can browse live auctions, enter bidding consoles that stream live bid updates via Socket.io, and top up a wallet through Razorpay to participate. I built three auction modes — English rising bids, Dutch descending price, and Blind sealed bids. The frontend uses Context for global auth and wallet state, and a custom useSocket hook handles all real-time connection lifecycle."

---

## 2-Minute Version

"BidKar is a live auction marketplace for India. On the frontend I used React 19 with Vite for fast development, Tailwind for styling, and Socket.io for real-time bid events.

The application has two user roles — Bidders and Sellers. Bidders browse active auctions, enter a live bidding console, and compete in real-time. Sellers use a studio dashboard to create listings and manage their auctions.

For authentication, I wrote a custom `AuthContext` that validates a JWT stored in a cookie on every page load. This prevents the flash of an unauthenticated state and keeps all components in sync. The `AuthController` component is a zero-render route guard that redirects to login if no user is found.

The wallet system integrates Razorpay for payments. After a payment, there's a webhook delay before the server credits the balance, so I implemented an optimistic virtual balance in localStorage — the UI shows the expected balance immediately and reconciles with the server once it catches up.

The most complex part is the `useSocket` hook. It manages the entire Socket.io lifecycle — connecting with auth tokens, joining auction rooms, handling bid updates, running Dutch price countdowns as local timers, and cleaning up all resources on unmount. Each auction card in the dashboard has its own socket connection via this hook.

The main challenge was the auction type system — the backend doesn't always return `auctionType`, so I wrote a deterministic injector that assigns types based on item ID character codes and merges any locally saved seller preferences."

---

## 5-Minute Deep-Dive Version

"Let me walk you through BidKar from the ground up.

**Entry point and providers:** `main.jsx` wraps the app in `AuthProvider` first — everything else depends on knowing the user. `WalletProvider` is nested inside because it reads `user` from AuthContext to know when to fetch the balance. Then `GoogleOAuthProvider` for social login, then `BrowserRouter` for routing. This nesting order is deliberate — reversing it would break the context dependencies.

**Authentication architecture:** When the app starts, `AuthContext` checks for an `auth_token` cookie. If found, it makes a single `GET /auth/profile` call to validate it server-side. The `isInitializing` flag blocks all child rendering until this completes — preventing a flash of an unauthenticated state. The Axios `interceptor.js` file attaches the token to every outgoing request and handles 401 responses globally with a full page reload to cleanly reset all React state.

**Real-time bidding via useSocket:** This custom hook handles everything about a live auction connection. It connects to Socket.io with the user's JWT in the auth handshake. For English auctions, it listens for `new_bid_update` events from the server. For Dutch auctions, it runs a `setInterval` locally to compute the descending price every second — this avoids the server needing to broadcast price updates at 1Hz to potentially thousands of clients. For Blind auctions, it uses `setTimeout` polling to check if the reveal time has passed, then fetches the decrypted results.

**Wallet and payments:** The WalletContext manages balance state. When users top up, it triggers Razorpay dynamically — the SDK is loaded lazily via a script injection, not in the initial bundle. After payment, there's a webhook delay before the server confirms the credit. I handle this with an optimistic localStorage balance that's shown until the server catches up.

**Data layer:** All API calls go through `services/auctionService.js`, which imports a shared Axios instance. The `injectMockData` function is a technical compromise — the backend doesn't always send `auctionType`, so this function deterministically assigns it based on the item ID. It's a known workaround that the team plans to fix on the backend.

**Responsive design:** The pages use Tailwind utilities for components and vanilla CSS in `index.css` for complex responsive grid layouts — specifically the dashboard's sidebar-main split and the mobile reflow. On mobile, hero image cards are hidden with `hidden md:flex`, and typography scales with `clamp()` to avoid hard breakpoints.

The biggest technical challenge was the auction type injection and making sure Dutch price calculations were consistent across all clients simultaneously without server coordination."

---

> **Interview Tip:** For every technical decision, be ready to say: "I chose this because X. The trade-off is Y. In a production/scaled system, I would consider Z."

> **Common Mistake to avoid:** Don't say "I used React because it's popular." Say "I used React because its component model maps naturally to the auction card grid, and hooks like useSocket and useCallback let me encapsulate complex real-time state."
