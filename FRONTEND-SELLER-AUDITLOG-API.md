# Seller System & Audit Logs - Frontend API Documentation

## 🏪 SELLER SYSTEM

### Overview
- Users automatically become **SELLER** after completing KYC verification
- No manual upgrade needed - it happens automatically
- Sellers can access dashboard and manage their listings

---

### 1️⃣ Get Seller Dashboard

**Endpoint:** `GET /api/seller/dashboard`

**Auth Required:** Yes (Bearer token)

**Role Required:** SELLER or ADMIN

**Headers:**
```javascript
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "totalListings": 25,
    "activeListings": 8,
    "soldListings": 15,
    "cancelledListings": 2,
    "totalRevenueRupees": "125000.00",
    "pendingSettlements": 3,
    "disputedSettlements": 0,
    "recentListings": [
      {
        "_id": "64abc123...",
        "title": "iPhone 14 Pro",
        "status": "ACTIVE",
        "currentHighestBid": 50000,
        "endTime": "2026-07-05T10:30:00.000Z",
        "createdAt": "2026-07-01T08:00:00.000Z"
      }
      // ... up to 5 recent items
    ]
  }
}
```

**Error Responses:**
```json
// Not authenticated
{ "success": false, "message": "Unauthorized" } // 401

// Not a seller
{ "success": false, "message": "Seller access required. Complete KYC to sell." } // 403
```

**Frontend Usage:**
```javascript
const getDashboard = async () => {
  const response = await axios.get('http://localhost:3000/api/seller/dashboard', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.dashboard;
};
```

---

### 2️⃣ Get My Listings (Paginated)

**Endpoint:** `GET /api/seller/my-listings`

**Auth Required:** Yes (Bearer token)

**Role Required:** SELLER or ADMIN

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | Number | No | 1 | Page number |
| limit | Number | No | 12 | Items per page |
| status | String | No | - | Filter by status (ACTIVE, SOLD, CANCELLED, PENDING) |

**Example Request:**
```
GET /api/seller/my-listings?page=1&limit=12&status=ACTIVE
```

**Headers:**
```javascript
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Response:**
```json
{
  "success": true,
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "total": 25
  },
  "items": [
    {
      "_id": "64abc123...",
      "title": "iPhone 14 Pro",
      "description": "Brand new condition...",
      "category": "ELECTRONICS",
      "condition": "LIKE_NEW",
      "startingPrice": 40000,
      "currentHighestBid": 50000,
      "winnerId": "64def456...",
      "sellerId": "64xyz789...",
      "status": "ACTIVE",
      "images": ["url1", "url2"],
      "startTime": "2026-07-01T08:00:00.000Z",
      "endTime": "2026-07-05T10:30:00.000Z",
      "createdAt": "2026-07-01T08:00:00.000Z",
      "updatedAt": "2026-07-01T10:15:00.000Z"
    }
    // ... more items
  ]
}
```

**Error Responses:**
```json
// Not authenticated
{ "success": false, "message": "Unauthorized" } // 401

// Not a seller
{ "success": false, "message": "Seller access required. Complete KYC to sell." } // 403
```

**Frontend Usage:**
```javascript
const getMyListings = async (page = 1, status = null) => {
  const params = { page, limit: 12 };
  if (status) params.status = status;
  
  const response = await axios.get('http://localhost:3000/api/seller/my-listings', {
    headers: { Authorization: `Bearer ${token}` },
    params
  });
  return response.data;
};
```

---

### 🎯 How to Show Seller Features in UI

**Step 1: Check User Role**
```javascript
// After login, decode JWT or check user object
const user = jwtDecode(token);

if (user.role === 'SELLER' || user.role === 'ADMIN') {
  // Show seller dashboard link
  // Show "My Listings" menu
}
```

**Step 2: KYC Flow**
```javascript
// After user completes KYC verification:
// Backend automatically upgrades role to 'SELLER'
// Refresh user token or fetch user profile again

// User can now:
// 1. Access seller dashboard
// 2. Create new listings
// 3. View their items
```

**Step 3: Dashboard UI Example**
```jsx
<SellerDashboard>
  <StatCard label="Total Listings" value={dashboard.totalListings} />
  <StatCard label="Active Auctions" value={dashboard.activeListings} />
  <StatCard label="Total Revenue" value={`₹${dashboard.totalRevenueRupees}`} />
  <StatCard label="Pending Settlements" value={dashboard.pendingSettlements} />
  
  <RecentListings items={dashboard.recentListings} />
</SellerDashboard>
```

---

## 📊 AUDIT LOG SYSTEM (ADMIN ONLY)

### Overview
- Tracks every bid attempt with millisecond precision
- Used for tie-breaking and fraud detection
- Only accessible by admins
- Logs: BID_ATTEMPT, BID_ACCEPTED, BID_REJECTED

---

### 1️⃣ Get Audit Logs (Query with Filters)

**Endpoint:** `GET /api/audit-logs`

**Auth Required:** Yes (Bearer token)

**Role Required:** ADMIN only

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | String | No | Filter by user ID |
| action | String | No | Filter by action (BID_ATTEMPT, BID_ACCEPTED, BID_REJECTED) |
| auctionId | String | No | Filter by auction/item ID |
| startDate | String | No | ISO date string (e.g., "2026-07-01") |
| endDate | String | No | ISO date string |
| page | Number | No | Page number (default: 1) |
| limit | Number | No | Items per page (default: 50) |

**Example Request:**
```
GET /api/audit-logs?action=BID_ACCEPTED&page=1&limit=50
```

**Headers:**
```javascript
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Response:**
```json
{
  "success": true,
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 248,
    "totalPages": 5
  },
  "logs": [
    {
      "_id": "64log123...",
      "userId": {
        "_id": "64user123...",
        "username": "john_doe",
        "email": "john@example.com"
      },
      "action": "BID_ACCEPTED",
      "ipAddress": "192.168.1.100",
      "deviceInfo": "Mozilla/5.0...",
      "metadata": {
        "auctionId": "64abc123...",
        "amount": 50000,
        "serverReceivedAt": 1719825600123,
        "serverId": 4528,
        "previousWinnerId": "64user456..."
      },
      "createdAt": "2026-07-01T10:00:00.123Z",
      "updatedAt": "2026-07-01T10:00:00.123Z"
    }
    // ... more logs
  ]
}
```

**Error Responses:**
```json
// Not authenticated
{ "success": false, "message": "Unauthorized" } // 401

// Not admin
{ "success": false, "message": "Admin access required" } // 403
```

**Frontend Usage:**
```javascript
const getAuditLogs = async (filters = {}) => {
  const response = await axios.get('http://localhost:3000/api/audit-logs', {
    headers: { Authorization: `Bearer ${adminToken}` },
    params: {
      page: filters.page || 1,
      limit: filters.limit || 50,
      userId: filters.userId,
      action: filters.action,
      auctionId: filters.auctionId,
      startDate: filters.startDate,
      endDate: filters.endDate
    }
  });
  return response.data;
};
```

---

### 2️⃣ Get Auction Bid Timeline (Tie-Breaking Analysis)

**Endpoint:** `GET /api/audit-logs/auction/:auctionId`

**Auth Required:** Yes (Bearer token)

**Role Required:** ADMIN only

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| auctionId | String | Yes | The item/auction ID |

**Example Request:**
```
GET /api/audit-logs/auction/64abc123456789
```

**Headers:**
```javascript
{
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Response:**
```json
{
  "success": true,
  "auctionId": "64abc123456789",
  "timeline": [
    {
      "timestamp": "2026-07-01T10:00:00.123Z",
      "serverReceivedAt": 1719825600123,
      "action": "BID_ATTEMPT",
      "userId": "64user123...",
      "username": "john_doe",
      "amount": 50000,
      "serverId": 4528,
      "ipAddress": "192.168.1.100",
      "reason": null
    },
    {
      "timestamp": "2026-07-01T10:00:00.125Z",
      "serverReceivedAt": 1719825600125,
      "action": "BID_ACCEPTED",
      "userId": "64user123...",
      "username": "john_doe",
      "amount": 50000,
      "serverId": 4528,
      "ipAddress": "192.168.1.100",
      "reason": null
    },
    {
      "timestamp": "2026-07-01T10:00:00.124Z",
      "serverReceivedAt": 1719825600124,
      "action": "BID_REJECTED",
      "userId": "64user456...",
      "username": "jane_smith",
      "amount": 50000,
      "serverId": 4528,
      "ipAddress": "192.168.1.101",
      "reason": "LOCK_BUSY"
    }
    // ... chronological bid attempts
  ]
}
```

**Error Responses:**
```json
// Not authenticated
{ "success": false, "message": "Unauthorized" } // 401

// Not admin
{ "success": false, "message": "Admin access required" } // 403
```

**Frontend Usage:**
```javascript
const getAuctionTimeline = async (auctionId) => {
  const response = await axios.get(
    `http://localhost:3000/api/audit-logs/auction/${auctionId}`,
    { headers: { Authorization: `Bearer ${adminToken}` } }
  );
  return response.data.timeline;
};
```

---

### 🎯 Understanding Audit Log Actions

| Action | Description | When It Happens |
|--------|-------------|-----------------|
| **BID_ATTEMPT** | User tries to place a bid | Before lock acquisition |
| **BID_ACCEPTED** | Bid successfully placed | After all validations pass |
| **BID_REJECTED** | Bid failed | Lock busy OR validation error |

**Rejection Reasons:**
- `LOCK_BUSY` - Another bid is being processed
- Validation errors - "Insufficient funds", "Auction ended", etc.

---

### 🎯 Tie-Breaking Logic

When two users bid at the **exact same millisecond**, the winner is determined by:

1. **serverReceivedAt** - The millisecond timestamp when server received the bid
2. **serverId** - Process ID (for multi-server scenarios)
3. The one that acquired the Redis lock first wins

**Example Scenario:**
```
User A: serverReceivedAt = 1719825600123
User B: serverReceivedAt = 1719825600124

Winner: User A (arrived 1ms earlier)
```

---

### 🎯 Admin Dashboard UI Example

```jsx
<AuditLogViewer>
  <FilterBar>
    <Select name="action" options={['BID_ATTEMPT', 'BID_ACCEPTED', 'BID_REJECTED']} />
    <DatePicker name="startDate" />
    <DatePicker name="endDate" />
    <Input name="userId" placeholder="User ID" />
  </FilterBar>
  
  <LogTable logs={logs} />
  <Pagination {...pagination} />
</AuditLogViewer>

<AuctionTimelineViewer auctionId={selectedAuction}>
  <Timeline events={timeline} />
</AuctionTimelineViewer>
```

---

## 🔐 Authentication Summary

**All endpoints require:**
```javascript
headers: {
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

**Role Requirements:**
- Seller endpoints: `SELLER` or `ADMIN`
- Audit log endpoints: `ADMIN` only

**Getting User Role:**
```javascript
// Decode JWT token
import jwtDecode from 'jwt-decode';
const decoded = jwtDecode(token);
console.log(decoded.role); // 'USER', 'SELLER', or 'ADMIN'
```

---

## 🚀 Complete Integration Example

```javascript
// Axios setup
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Seller Dashboard
const fetchSellerDashboard = async () => {
  try {
    const { data } = await api.get('/seller/dashboard');
    return data.dashboard;
  } catch (error) {
    if (error.response?.status === 403) {
      alert('Complete KYC to access seller features');
    }
    throw error;
  }
};

// My Listings
const fetchMyListings = async (page = 1, status = null) => {
  const params = { page, limit: 12 };
  if (status) params.status = status;
  
  const { data } = await api.get('/seller/my-listings', { params });
  return data;
};

// Audit Logs (Admin)
const fetchAuditLogs = async (filters) => {
  const { data } = await api.get('/audit-logs', { params: filters });
  return data;
};

// Auction Timeline (Admin)
const fetchAuctionTimeline = async (auctionId) => {
  const { data } = await api.get(`/audit-logs/auction/${auctionId}`);
  return data.timeline;
};
```

---

## ✅ Testing Checklist

### Seller System:
- [ ] User completes KYC → role becomes 'SELLER'
- [ ] Seller can access dashboard
- [ ] Dashboard shows correct stats
- [ ] My listings pagination works
- [ ] Status filter works (ACTIVE, SOLD, etc.)
- [ ] Non-sellers get 403 error

### Audit Logs:
- [ ] Admin can view all logs
- [ ] Filters work (action, date, user, auction)
- [ ] Pagination works
- [ ] Timeline shows chronological bid order
- [ ] Non-admins get 403 error
- [ ] Tie-breaking scenario visible in timeline

---

## 📞 Support

For any issues or questions, contact the backend team.

**Base URL:** `http://localhost:3000/api`

**Server Status:** ✅ Running
