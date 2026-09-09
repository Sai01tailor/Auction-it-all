# BidKar API Documentation
**Version:** 2.0  
**Last Updated:** September 2026  
**Base URL:** `http://localhost:3000/api` (development) | `https://api.bidkar.com/api` (production)

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Auction & Item Endpoints](#auction--item-endpoints)
3. [Wallet & Payment Endpoints](#wallet--payment-endpoints)
4. [Seller Endpoints](#seller-endpoints)
5. [KYC & Verification](#kyc--verification)
6. [Error Handling](#error-handling)
7. [WebSocket Events](#websocket-events)

---

## General Information

### Headers Required for Protected Endpoints
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

### Response Format
All responses follow this structure:
```json
{
  "success": true/false,
  "message": "Descriptive message",
  "data": { /* response data */ },
  "statusCode": 200
}
```

### Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

# Authentication Endpoints

## 1. Send Signup OTP
**Endpoint:** `POST /auth/register`  
**Authentication:** No  
**Rate Limit:** 3 requests per minute

### Request
```json
{
  "email": "user@example.com"
}
```

### Response (200)
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "otpId": "unique-otp-identifier",
    "expiresIn": 600
  },
  "statusCode": 200
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Invalid email format",
  "statusCode": 400
}
```

---

## 2. Verify Signup OTP & Create Account
**Endpoint:** `POST /auth/verify`  
**Authentication:** No

### Request
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "username": "john_doe",
  "password": "securePassword123!"
}
```

### Response (201)
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "john_doe",
    "role": "USER",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  },
  "statusCode": 201
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Invalid or expired OTP",
  "statusCode": 400
}
```

---

## 3. Login
**Endpoint:** `POST /auth/login`  
**Authentication:** No

### Request
```json
{
  "email": "user@example.com",
  "password": "securePassword123!"
}
```

### Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "john_doe",
    "role": "USER",
    "avatar": "https://lh3.googleusercontent.com/...",
    "kycStatus": "Unverified",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  },
  "statusCode": 200
}
```

### Error Response (401)
```json
{
  "success": false,
  "message": "Invalid email or password",
  "statusCode": 401
}
```

---

## 4. Google OAuth - Initiate
**Endpoint:** `GET /auth/google`  
**Authentication:** No  
**Redirect:** User is redirected to Google consent screen

---

## 5. Google OAuth - Callback
**Endpoint:** `GET /auth/google/callback`  
**Authentication:** No  
**Query Params:** `code` (from Google)

### Response (Redirect)
```
Redirects to: {CLIENT_URL}/?token={jwt_token}&userId={userId}
```

### Error Response (Redirect)
```
Redirects to: {CLIENT_URL}/auth/google/failure?error=google_failed
```

---

## 6. Forgot Password
**Endpoint:** `POST /auth/forgot-password`  
**Authentication:** No

### Request
```json
{
  "email": "user@example.com"
}
```

### Response (200)
```json
{
  "success": true,
  "message": "Password reset OTP sent to your email",
  "data": {
    "resetToken": "unique-reset-token",
    "expiresIn": 1800
  },
  "statusCode": 200
}
```

---

## 7. Reset Password
**Endpoint:** `POST /auth/reset-password`  
**Authentication:** No

### Request
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123!"
}
```

### Response (200)
```json
{
  "success": true,
  "message": "Password reset successful",
  "statusCode": 200
}
```

---

## 8. Get User Profile
**Endpoint:** `GET /auth/profile`  
**Authentication:** Yes (JWT Token)

### Response (200)
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "user@example.com",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "role": "USER",
    "kycStatus": "Verified",
    "kycVerifiedAt": "2026-06-15T10:00:00Z",
    "createdAt": "2026-01-01T00:00:00Z"
  },
  "statusCode": 200
}
```

---

## 9. Logout
**Endpoint:** `POST /auth/logout`  
**Authentication:** Yes (JWT Token)

### Response (200)
```json
{
  "success": true,
  "message": "Logout successful",
  "statusCode": 200
}
```

---

# Auction & Item Endpoints

## 1. Get Active Items (Browse Auctions)
**Endpoint:** `GET /items`  
**Authentication:** No  
**Method:** GET

### Query Parameters
```
?page=1
&limit=20
&category=Electronics
&sortBy=endTime
&search=laptop
&minPrice=1000
&maxPrice=50000
&condition=GOOD
&location=Mumbai
```

### Response (200)
```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": {
    "items": [
      {
        "itemId": "507f1f77bcf86cd799439011",
        "title": "Vintage Rolex Watch",
        "description": "Authentic Rolex Daytona from 1990s...",
        "startingPrice": 50000,
        "currentHighestBid": 75000,
        "photos": [
          "https://res.cloudinary.com/...",
          "https://res.cloudinary.com/..."
        ],
        "sellerId": "507f1f77bcf86cd799439012",
        "seller": {
          "username": "luxury_seller",
          "avatar": "https://...",
          "kycStatus": "Verified"
        },
        "status": "ACTIVE",
        "category": "Jewellery",
        "condition": "LIKE_NEW",
        "location": "Mumbai",
        "startTime": "2026-06-20T10:00:00Z",
        "endTime": "2026-06-25T10:00:00Z",
        "auctionType": "ENGLISH",
        "bidsCount": 12,
        "timeRemaining": 86400
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  },
  "statusCode": 200
}
```

---

## 2. Get Filter Options
**Endpoint:** `GET /items/filter-options`  
**Authentication:** No

### Response (200)
```json
{
  "success": true,
  "message": "Filter options retrieved",
  "data": {
    "categories": [
      "Electronics",
      "Art",
      "Vehicles",
      "Fashion",
      "Furniture",
      "Collectibles",
      "Jewellery",
      "Books",
      "Sports",
      "Other"
    ],
    "conditions": [
      "NEW",
      "LIKE_NEW",
      "GOOD",
      "FAIR"
    ],
    "auctionTypes": [
      "ENGLISH",
      "DUTCH",
      "BLIND"
    ],
    "priceRange": {
      "min": 100,
      "max": 5000000
    },
    "locations": [
      "Mumbai",
      "Delhi",
      "Bangalore",
      "Pune",
      "Hyderabad"
    ]
  },
  "statusCode": 200
}
```

---

## 3. Get Item by ID (Auction Detail)
**Endpoint:** `GET /items/:id`  
**Authentication:** No

### Response (200)
```json
{
  "success": true,
  "message": "Item retrieved successfully",
  "data": {
    "itemId": "507f1f77bcf86cd799439011",
    "title": "Vintage Rolex Watch",
    "description": "Authentic Rolex Daytona from 1990s with original box and papers. Excellent condition, recently serviced.",
    "startingPrice": 50000,
    "currentHighestBid": 75000,
    "currentHighestBidder": {
      "userId": "507f1f77bcf86cd799439020",
      "username": "watch_collector"
    },
    "photos": [
      "https://res.cloudinary.com/bidkar/image/upload/v1624569600/items/rolex_1.jpg",
      "https://res.cloudinary.com/bidkar/image/upload/v1624569601/items/rolex_2.jpg"
    ],
    "seller": {
      "userId": "507f1f77bcf86cd799439012",
      "username": "luxury_seller",
      "avatar": "https://...",
      "kycStatus": "Verified",
      "averageRating": 4.8,
      "reviewsCount": 45
    },
    "status": "ACTIVE",
    "category": "Jewellery",
    "condition": "LIKE_NEW",
    "location": "Mumbai",
    "startTime": "2026-06-20T10:00:00Z",
    "endTime": "2026-06-25T10:00:00Z",
    "auctionType": "ENGLISH",
    "priceFloor": 40000,
    "bidsCount": 12,
    "winnerId": null,
    "createdAt": "2026-06-19T08:30:00Z",
    "updatedAt": "2026-06-24T14:45:00Z"
  },
  "statusCode": 200
}
```

---

## 4. Get Item Bid History
**Endpoint:** `GET /items/:id/bids`  
**Authentication:** No

### Query Parameters
```
?page=1
&limit=50
```

### Response (200)
```json
{
  "success": true,
  "message": "Bids retrieved successfully",
  "data": {
    "itemId": "507f1f77bcf86cd799439011",
    "bids": [
      {
        "bidId": "507f1f77bcf86cd799439030",
        "bidderUsername": "watch_collector",
        "bidAmount": 75000,
        "bidTime": "2026-06-24T14:45:00Z",
        "isHighestBid": true
      },
      {
        "bidId": "507f1f77bcf86cd799439029",
        "bidderUsername": "collector_pro",
        "bidAmount": 72000,
        "bidTime": "2026-06-24T14:30:00Z",
        "isHighestBid": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 12,
      "pages": 1
    }
  },
  "statusCode": 200
}
```

---

## 5. Get User's Active Bids
**Endpoint:** `GET /items/user/my-bids`  
**Authentication:** Yes (JWT Token)

### Response (200)
```json
{
  "success": true,
  "message": "User bids retrieved successfully",
  "data": {
    "bids": [
      {
        "itemId": "507f1f77bcf86cd799439011",
        "title": "Vintage Rolex Watch",
        "bidAmount": 75000,
        "isHighestBid": true,
        "bidTime": "2026-06-24T14:45:00Z",
        "auctionEndTime": "2026-06-25T10:00:00Z",
        "auctionType": "ENGLISH",
        "currentHighestBid": 75000
      }
    ],
    "totalActiveBids": 3
  },
  "statusCode": 200
}
```

---

## 6. Submit English Auction Bid
**Endpoint:** `POST /items/:id/bid`  
**Authentication:** Yes (JWT Token)

### Request
```json
{
  "bidAmount": 80000
}
```

### Response (200)
```json
{
  "success": true,
  "message": "Bid placed successfully",
  "data": {
    "bidId": "507f1f77bcf86cd799439031",
    "itemId": "507f1f77bcf86cd799439011",
    "bidAmount": 80000,
    "bidTime": "2026-06-24T15:00:00Z",
    "currentHighestBid": 80000,
    "isHighestBid": true,
    "message": "You are the highest bidder!"
  },
  "statusCode": 200
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Bid amount must be higher than current highest bid (75000)",
  "statusCode": 400
}
```

---

## 7. Buy Dutch Auction Item
**Endpoint:** `POST /items/:id/buy-dutch`  
**Authentication:** Yes (JWT Token)

### Request
```json
{}
```

### Response (200)
```json
{
  "success": true,
  "message": "Item purchased successfully",
  "data": {
    "itemId": "507f1f77bcf86cd799439011",
    "transactionId": "507f1f77bcf86cd799439050",
    "purchasePrice": 45000,
    "purchaseTime": "2026-06-24T15:00:00Z",
    "winner": {
      "userId": "507f1f77bcf86cd799439011",
      "username": "buyer_user"
    }
  },
  "statusCode": 200
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "Insufficient wallet balance. Required: 45000, Available: 30000",
  "statusCode": 400
}
```

---

## 8. Submit Blind Bid
**Endpoint:** `POST /items/:id/blind-bid`  
**Authentication:** Yes (JWT Token)

### Request
```json
{
  "bidAmount": 100000
}
```

### Response (200)
```json
{
  "success": true,
  "message": "Sealed bid submitted successfully",
  "data": {
    "bidId": "507f1f77bcf86cd799439032",
    "itemId": "507f1f77bcf86cd799439011",
    "submissionTime": "2026-06-24T15:00:00Z",
    "status": "SEALED",
    "message": "Your bid is sealed. It will be revealed after the submission deadline."
  },
  "statusCode": 200
}
```

---

## 9. Get Blind Reveal Data
**Endpoint:** `GET /items/:id/blind-reveal`  
**Authentication:** No  
**Available:** After reveal time

### Response (200)
```json
{
  "success": true,
  "message": "Blind reveal data retrieved",
  "data": {
    "itemId": "507f1f77bcf86cd799439011",
    "status": "REVEALED",
    "revealTime": "2026-06-24T18:00:00Z",
    "bids": [
      {
        "bidderUsername": "premium_buyer",
        "bidAmount": 120000,
        "isWinner": true
      },
      {
        "bidderUsername": "bidder_2",
        "bidAmount": 100000,
        "isWinner": false
      }
    ],
    "winner": {
      "username": "premium_buyer",
      "bidAmount": 120000
    }
  },
  "statusCode": 200
}
```

---

# Wallet & Payment Endpoints

## 1. Get Wallet Balance
**Endpoint:** `GET /wallet/balance`  
**Authentication:** Yes (JWT Token)

### Response (200)
```json
{
  "success": true,
  "message": "Wallet balance retrieved",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "balance": 150000,
    "currency": "INR",
    "lastUpdated": "2026-06-24T15:00:00Z",
    "transactions": [
      {
        "transactionId": "507f1f77bcf86cd799439050",
        "type": "CREDIT",
        "amount": 50000,
        "reason": "Payment received",
        "timestamp": "2026-06-24T14:00:00Z"
      }
    ]
  },
  "statusCode": 200
}
```

---

## 2. Create Razorpay Order (Add Funds)
**Endpoint:** `POST /payments/create-order`  
**Authentication:** Yes (JWT Token)

### Request
```json
{
  "amount": 50000,
  "currency": "INR"
}
```

### Response (201)
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_1234567890",
    "amount": 50000,
    "currency": "INR",
    "keyId": "rzp_live_XXXXXXXXXXXXX",
    "userId": "507f1f77bcf86cd799439011",
    "status": "CREATED",
    "createdAt": "2026-06-24T15:00:00Z"
  },
  "statusCode": 201
}
```

---

## 3. Payment Webhook (Backend Only)
**Endpoint:** `POST /payments/webhook`  
**Authentication:** Razorpay signature verification

### Webhook Payload
```json
{
  "event": "payment.authorized",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_1234567890",
        "amount": 50000,
        "currency": "INR",
        "status": "captured",
        "notes": {
          "orderId": "order_1234567890"
        }
      }
    }
  }
}
```

### Backend Actions
- Verifies Razorpay signature
- Updates wallet balance
- Creates transaction record
- Returns 200 to Razorpay

---

# Seller Endpoints

## 1. Create New Auction Listing
**Endpoint:** `POST /items`  
**Authentication:** Yes (JWT Token - SELLER/ADMIN role required)  
**Content-Type:** multipart/form-data

### Request (Form Data)
```
Field Name: title
Value: "Vintage Rolex Watch"

Field Name: description
Value: "Authentic Rolex Daytona from 1990s..."

Field Name: startingPrice
Value: "50000"

Field Name: category
Value: "Jewellery"

Field Name: condition
Value: "LIKE_NEW"

Field Name: location
Value: "Mumbai"

Field Name: auctionType
Value: "ENGLISH"

Field Name: endTime
Value: "2026-06-25T10:00:00Z"

Field Name: priceFloor
Value: "40000"

Field Name: photos
File: [up to 5 image files]
```

### Response (201)
```json
{
  "success": true,
  "message": "Auction item created successfully",
  "data": {
    "itemId": "507f1f77bcf86cd799439011",
    "title": "Vintage Rolex Watch",
    "startingPrice": 50000,
    "photos": [
      "https://res.cloudinary.com/bidkar/image/upload/v1624569600/items/rolex_1.jpg",
      "https://res.cloudinary.com/bidkar/image/upload/v1624569601/items/rolex_2.jpg"
    ],
    "status": "ACTIVE",
    "auctionType": "ENGLISH",
    "endTime": "2026-06-25T10:00:00Z",
    "createdAt": "2026-06-24T08:30:00Z"
  },
  "statusCode": 201
}
```

### Error Response (403)
```json
{
  "success": false,
  "message": "Access Denied: Only verified sellers can list auction items.",
  "statusCode": 403
}
```

---

## 2. Get Seller's Listings
**Endpoint:** `GET /seller/listings`  
**Authentication:** Yes (JWT Token)

### Query Parameters
```
?page=1
&limit=20
&status=ACTIVE
```

### Response (200)
```json
{
  "success": true,
  "message": "Seller listings retrieved",
  "data": {
    "listings": [
      {
        "itemId": "507f1f77bcf86cd799439011",
        "title": "Vintage Rolex Watch",
        "status": "ACTIVE",
        "startingPrice": 50000,
        "currentHighestBid": 75000,
        "bidsCount": 12,
        "endTime": "2026-06-25T10:00:00Z",
        "createdAt": "2026-06-24T08:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  },
  "statusCode": 200
}
```

---

## 3. Get Seller's Sales
**Endpoint:** `GET /seller/sales`  
**Authentication:** Yes (JWT Token)

### Response (200)
```json
{
  "success": true,
  "message": "Sales history retrieved",
  "data": {
    "sales": [
      {
        "saleId": "507f1f77bcf86cd799439050",
        "itemId": "507f1f77bcf86cd799439011",
        "itemTitle": "Vintage Rolex Watch",
        "salePrice": 80000,
        "winnerId": "507f1f77bcf86cd799439020",
        "winnerUsername": "watch_collector",
        "saleDate": "2026-06-25T10:00:00Z",
        "paymentStatus": "COMPLETED",
        "settlementStatus": "PENDING"
      }
    ],
    "totalRevenue": 250000,
    "completedSales": 3,
    "pendingSettlement": 80000
  },
  "statusCode": 200
}
```

---

# KYC & Verification

## 1. Get KYC Status
**Endpoint:** `GET /kyc/status`  
**Authentication:** Yes (JWT Token)

### Response (200)
```json
{
  "success": true,
  "message": "KYC status retrieved",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "kycStatus": "Verified",
    "kycVerifiedAt": "2026-06-15T10:00:00Z",
    "kycFailureReason": null,
    "kycLastAttemptAt": "2026-06-15T09:30:00Z"
  },
  "statusCode": 200
}
```

---

## 2. Submit KYC Verification
**Endpoint:** `POST /kyc/submit`  
**Authentication:** Yes (JWT Token)  
**Content-Type:** multipart/form-data

### Request (Form Data)
```
Field Name: aadhaarNumber
Value: "1234 5678 9012"

Field Name: bankAccountNumber
Value: "1234567890123456"

Field Name: bankIfsc
Value: "SBIN0001234"

Field Name: aadhaarDocument
File: [PDF/Image]

Field Name: bankDocument
File: [PDF/Image]
```

### Response (200)
```json
{
  "success": true,
  "message": "KYC submitted for verification",
  "data": {
    "requestId": "kyc_req_507f1f77bcf86cd799439011",
    "status": "PENDING",
    "submittedAt": "2026-06-24T15:00:00Z",
    "estimatedVerificationTime": "24-48 hours"
  },
  "statusCode": 200
}
```

---

# WebSocket Events

## Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'jwt_token'
  }
});
```

## Events to Subscribe

### 1. Real-time Bid Update
```javascript
socket.on('bid:update', (data) => {
  console.log({
    itemId: data.itemId,
    bidAmount: data.bidAmount,
    bidderUsername: data.bidderUsername,
    timestamp: data.timestamp
  });
});
```

### 2. Auction Ending Soon
```javascript
socket.on('auction:ending', (data) => {
  console.log({
    itemId: data.itemId,
    timeRemaining: data.timeRemaining // in seconds
  });
});
```

### 3. Auction Ended
```javascript
socket.on('auction:ended', (data) => {
  console.log({
    itemId: data.itemId,
    winnerId: data.winnerId,
    finalBidAmount: data.finalBidAmount,
    status: 'SOLD'
  });
});
```

### 4. Item Sold (Dutch)
```javascript
socket.on('item:sold', (data) => {
  console.log({
    itemId: data.itemId,
    buyerId: data.buyerId,
    purchasePrice: data.purchasePrice,
    timestamp: data.timestamp
  });
});
```

### 5. Leaderboard Update
```javascript
socket.on('leaderboard:update', (data) => {
  console.log({
    itemId: data.itemId,
    topBidders: [
      {
        position: 1,
        username: 'bidder_1',
        bidAmount: 80000
      },
      // ... more bidders
    ]
  });
});
```

---

# Error Handling

## Common Error Codes

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid request format",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "statusCode": 400
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Authentication required. Please log in.",
  "statusCode": 401
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Access Denied: Only sellers can create listings.",
  "statusCode": 403
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Item not found",
  "statusCode": 404
}
```

### 429 - Rate Limit Exceeded
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60,
  "statusCode": 429
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "An unexpected error occurred. Please try again later.",
  "statusCode": 500
}
```

---

## Frontend Error Handling Best Practices

1. **Token Expiration**: If you receive a 401, refresh the token or redirect to login
2. **Network Errors**: Implement retry logic with exponential backoff
3. **Validation Errors**: Display field-level errors to users
4. **User Feedback**: Show toast notifications for all operations
5. **Loading States**: Show skeleton loaders during API calls

---

## Rate Limits

- **Authentication Endpoints**: 5 requests per minute per IP
- **Browse/Search**: 30 requests per minute per user
- **Bid Submission**: 2 requests per second per user
- **File Upload**: 10 requests per minute per user

---

## Pagination

All list endpoints support pagination:

### Query Parameters
- `page` (default: 1)
- `limit` (default: 20, max: 100)

### Response Format
```json
{
  "data": { /* items array */ },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Environment Variables (Frontend)

```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
VITE_SOCKET_URL=http://localhost:3000
VITE_CLOUDINARY_NAME=bidkar
VITE_GOOGLE_CLIENT_ID=XXXXXXXXXXXXX.apps.googleusercontent.com
```

---

## Testing the API

### Using cURL
```bash
# Get active items
curl -X GET "http://localhost:3000/api/items?page=1&limit=10"

# Create listing (requires auth & file upload)
curl -X POST "http://localhost:3000/api/items" \
  -H "Authorization: Bearer {token}" \
  -F "title=My Item" \
  -F "description=Description" \
  -F "startingPrice=1000" \
  -F "category=Electronics" \
  -F "condition=NEW" \
  -F "endTime=2026-06-25T10:00:00Z" \
  -F "photos=@image1.jpg" \
  -F "photos=@image2.jpg"
```

### Using Postman
1. Create a collection with environment variables for `base_url` and `token`
2. Import all endpoint definitions
3. Use pre-request scripts for dynamic values
4. Test each endpoint with sample data

---

**Last Updated:** September 2026  
**Maintained by:** BidKar Development Team  
**Contact:** api-support@bidkar.com
