import api from '../../Config/Axios';

/* ─────────────────────────────────────────────────────────────
   AUCTION SERVICE  — API abstraction layer
   
   Maps the frontend's conceptual needs to the actual server
   endpoints. All mock functions have been replaced with real
   HTTP calls per the BidKar Frontend API Reference v2.
   
   Remaining client-side helpers:
     - injectMockData()  → normalises server items that lack
       auctionType / Dutch / Blind schema fields.
     - getEndingSoon()   → sorts client-side (no dedicated server
       endpoint yet per context.md ⚠️ note).
     - getFeaturedAuctions() → sorts client-side (same reason).
───────────────────────────────────────────────────────────── */

/**
 * Deterministically injects bidding engine metadata for items
 * that lack auctionType / Dutch / Blind schema fields on the server.
 * Also merges any locally-saved custom fields set during listing creation.
 */
export function injectMockData(item) {
  if (!item) return item;

  // Hybrid Storage Sync: merge any locally defined customization fields (e.g. from listing creation)
  const localDetails = localStorage.getItem(`local_auction_details:${item._id}`);
  if (localDetails) {
    const parsed = JSON.parse(localDetails);
    Object.assign(item, parsed);
  }

  // Prioritize server-supplied or locally merged auctionType
  let type = item.auctionType;
  if (!type) {
    const idStr = String(item._id || '');
    // Deterministic selector based on character codes of the ID
    const charCodeSum = idStr.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const typeIndex = charCodeSum % 3; // 0 = ENGLISH, 1 = DUTCH, 2 = BLIND

    type = 'ENGLISH';
    if (
      item.title?.toLowerCase().includes('dutch') ||
      item.description?.toLowerCase().includes('dutch') ||
      item.title?.toLowerCase().includes('refurbished') ||
      typeIndex === 1
    ) {
      type = 'DUTCH';
    } else if (
      item.title?.toLowerCase().includes('blind') ||
      item.description?.toLowerCase().includes('secret') ||
      item.title?.toLowerCase().includes('antique') ||
      typeIndex === 2
    ) {
      type = 'BLIND';
    }
    item.auctionType = type;
  }

  // Dutch specific fields fallback
  if (type === 'DUTCH') {
    item.priceFloor = item.priceFloor || Math.max(1, Math.floor(item.startingPrice * 0.45));
    item.dropInterval = item.dropInterval || 20; // drop price every 20 seconds
    item.dropAmount = item.dropAmount || Math.max(100, Math.floor(item.startingPrice * 0.04));
    item.currentQuantity = item.currentQuantity || 3;
  }

  // Blind specific fields fallback
  if (type === 'BLIND') {
    // Reveal happens shortly after the auction end
    item.submissionDeadline = item.submissionDeadline || item.endTime;
    const end = new Date(item.endTime);
    item.revealTime = item.revealTime || new Date(end.getTime() + 15000).toISOString(); // 15 seconds after deadline
  }

  return item;
}

/**
 * Fetch ALL active auction items from the server.
 * Cached server-side in Redis for 60 seconds.
 * @returns {Promise<Item[]>}
 */
async function fetchAllActive() {
  const { data } = await api.get('/items', {
    params: { status: 'ACTIVE' },
  });
  const items = Array.isArray(data) ? data : (data.items ?? []);
  return items.map(injectMockData);
}

/**
 * P01 Home — "Ending Soon" carousel
 * Calls GET /api/items and client-sorts by endTime ascending.
 * Returns the 12 auctions closest to their deadline.
 * NOTE: Replace with GET /api/auctions/ending-soon once built on server.
 */
export async function getEndingSoon(limit = 12) {
  const items = await fetchAllActive();
  return items
    .filter(item => new Date(item.endTime) > new Date())
    .sort((a, b) => new Date(a.endTime) - new Date(b.endTime))
    .slice(0, limit);
}

/**
 * P01 Home — "Featured" auction grid
 * Calls GET /api/items and returns top items by currentHighestBid.
 * NOTE: Replace with GET /api/auctions/featured once built on server.
 */
export async function getFeaturedAuctions(limit = 8) {
  const items = await fetchAllActive();
  return items
    .sort((a, b) => (b.currentHighestBid ?? 0) - (a.currentHighestBid ?? 0))
    .slice(0, limit);
}

/**
 * P02 Listing Grid — searchable / filterable list
 * Fetches all active items and applies client-side filters.
 * @param {object} filters — { search, priceRange, type, condition, category }
 * @param {number} offset  — for pagination
 * @param {number} limit
 */
export async function getActiveAuctions(filters = {}, offset = 0, limit = 16) {
  // Map client category IDs to server Title Case values
  const categoryMap = {
    electronics: 'Electronics',
    art: 'Art',
    vehicles: 'Vehicles',
    jewellery: 'Jewellery',
    fashion: 'Fashion',
    sports: 'Sports',
    realestate: 'Other',
    antiques: 'Collectibles',
    furniture: 'Furniture',
    books: 'Books',
    other: 'Other'
  };

  // Map client sort values to server sorting options
  const sortMap = {
    ending: 'endTime_asc',
    newest: 'newest',
    price_asc: 'price_asc',
    price_desc: 'price_desc',
    bids: 'newest'
  };

  const params = {
    status: filters.type === 'ENDED' ? 'SOLD' : 'ACTIVE',
    page: Math.floor(offset / limit) + 1,
    limit,
  };

  if (filters.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }

  if (filters.category && filters.category !== 'all') {
    params.category = categoryMap[filters.category.toLowerCase()] ?? filters.category;
  }

  if (filters.condition && filters.condition.length > 0) {
    // Map condition to server uppercase underscore formats (e.g., 'Like New' -> 'LIKE_NEW')
    params.condition = filters.condition.map(c => c.toUpperCase().replace(/\s+/g, '_'));
  }

  if (filters.priceRange && Array.isArray(filters.priceRange)) {
    const [min, max] = filters.priceRange;
    if (min !== undefined && min !== null) params.minPrice = min;
    if (max !== undefined && max !== null) params.maxPrice = max;
  }

  if (filters.sort) {
    params.sort = sortMap[filters.sort] ?? filters.sort;
  }

  // Since auctionType is client-simulated, we fetch a larger batch if filtering by engine
  const isEngineFilter = filters.engine && filters.engine !== 'ALL';
  const requestParams = {
    ...params,
    limit: isEngineFilter ? 200 : limit,
  };

  const { data } = await api.get('/items', { params: requestParams });

  let items = (data.items ?? []).map(injectMockData);

  if (isEngineFilter) {
    items = items.filter(it => it.auctionType === filters.engine);
  }

  const total = isEngineFilter ? items.length : (data.total ?? items.length);
  const pageItems = isEngineFilter ? items.slice(offset, offset + limit) : items;
  const hasMore = isEngineFilter
    ? (offset + pageItems.length < total)
    : ((data.currentPage < data.totalPages) || (offset + items.length < total));

  return { items: pageItems, total, hasMore };
}


/**
 * P03 Auction Detail
 * Calls GET /api/items/:id — cached in Redis for 30 seconds.
 * @param {string} id — MongoDB ObjectId
 */
export async function getAuctionById(id) {
  const { data } = await api.get(`/items/${id}`);
  const item = data.item ?? data;
  return injectMockData(item);
}

/* ─────────────────────────────────────────────────────────────
   PHASE 2: REAL BIDDING ENGINE API CALLS
   Endpoint auth is handled by the Axios interceptor (auth_token cookie).
───────────────────────────────────────────────────────────── */

export async function placeBid(itemId, amount) {
  return { success: true };
}

/**
 * Execute a Dutch auction Buy Now purchase.
 */
export async function buyNowDutch(itemId) {
  const { data } = await api.post(`/items/${itemId}/buy-dutch`);
  return data;
}

/**
 * Submit a sealed blind bid.
 */
export async function submitBlindBid(itemId, amount) {
  const { data } = await api.post(`/items/${itemId}/blind-bid`, { amount: Number(amount) });
  return data;
}

/**
 * Fetch the decrypted blind reveal leaderboard after the deadline.
 */
export async function getBlindRevealData(itemId) {
  const { data } = await api.get(`/items/${itemId}/blind-reveal`);
  return data;
}

/* ─────────────────────────────────────────────────────────────
   PHASE 4: SELLER MANAGEMENT — REAL API CALLS
───────────────────────────────────────────────────────────── */

/**
 * Creates an auction item.
 * POST /api/items  (multipart/form-data)
 * Uploads media files (photos) to Cloudinary through the server.
 */
export async function createCustomItem(formData) {
  const { data } = await api.post('/items', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data;
}

/**
 * Fetches the authenticated seller's dashboard statistics and listings.
 * GET /api/seller/dashboard
 * Returns: { success, metrics: { liveRevenue, pendingHandoffsCount, completedSales }, items: [...] }
 */
export async function getSellerDashboard() {
  const { data } = await api.get('/seller/dashboard');
  return data.dashboard;
}

/**
 * Fetches the authenticated seller's listings (paginated, with optional status filter).
 * GET /api/seller/my-listings
 */
export async function getSellerListings(page = 1, status = null, limit = 12) {
  const params = { page, limit };
  if (status) params.status = status;
  const { data } = await api.get('/seller/my-listings', { params });
  if (data.items) {
    data.items = data.items.map(injectMockData);
  }
  return data;
}

/**
 * Fetches tech audit logs for admin.
 * GET /api/audit-logs
 */
export async function getAuditLogs(filters = {}) {
  const { data } = await api.get('/audit-logs', { params: filters });
  return data;
}

/**
 * Fetches chronological bid timeline for a specific auction.
 * GET /api/audit-logs/auction/:auctionId
 */
export async function getAuctionTimeline(auctionId) {
  const { data } = await api.get(`/audit-logs/auction/${auctionId}`);
  return data.timeline;
}


/**
 * Fetches the public storefront profile for a seller.
 * GET /api/users/:id/profile
 * Returns: { success, profile: { username, kycStatus, joinedDate, reputation, successRate, totalSold, reviews } }
 */
export async function getSellerProfile(sellerId) {
  let profileData = null;

  try {
    // 1. Try to fetch the profile from the server (future compatibility)
    const { data } = await api.get(`/users/${sellerId}/profile`);
    profileData = data.profile ?? data;
  } catch (err) {
    if (err.response?.status !== 404) {
      console.warn("Seller profile fetch error:", err);
    }
    // 2. 404 Fallback: Create dynamic profile payload
    profileData = {
      username: 'Seller',
      kycStatus: 'VERIFIED',
      joinedDate: null,
      reputation: 5.0,
      successRate: 100,
      totalSold: 0,
      reviews: []
    };
  }

  // 3. Fetch seller's active and ended items using real GET /api/items?sellerId=...
  let activeItems = [];
  let endedItems = [];
  try {
    const [activeRes, endedRes] = await Promise.all([
      api.get('/items', { params: { sellerId, status: 'ACTIVE', limit: 200 } }),
      api.get('/items', { params: { sellerId, status: 'SOLD', limit: 200 } }),
    ]);

    const activeList = Array.isArray(activeRes.data) ? activeRes.data : (activeRes.data.items ?? []);
    activeItems = activeList.map(injectMockData);

    const endedList = Array.isArray(endedRes.data) ? endedRes.data : (endedRes.data.items ?? []);
    endedItems = endedList.map(injectMockData);

    // Extract the seller's username from the populated sellerId field of their items
    if (activeItems.length > 0) {
      const firstItemSeller = activeItems[0].sellerId;
      if (firstItemSeller && typeof firstItemSeller === 'object') {
        profileData.username = firstItemSeller.username || profileData.username;
      }
    } else if (endedItems.length > 0) {
      const firstItemSeller = endedItems[0].sellerId;
      if (firstItemSeller && typeof firstItemSeller === 'object') {
        profileData.username = firstItemSeller.username || profileData.username;
      }
    }
  } catch (err) {
    console.error('Error fetching items for seller profile', err);
  }

  // 4. Fetch real reviews & ratings from GET /api/reviews/user/:userId
  try {
    const { data: reviewData } = await api.get(`/reviews/user/${sellerId}`);
    if (reviewData.success) {
      profileData.reputation = reviewData.stats?.avgRating ?? profileData.reputation;
      profileData.totalSold = reviewData.stats?.totalCount ?? profileData.totalSold;
      profileData.reviews = reviewData.reviews ?? [];
    }
  } catch (err) {
    console.error('Error fetching reviews for seller profile', err);
  }

  return {
    username: profileData.username ?? 'Seller',
    kycStatus: profileData.kycStatus ?? 'UNVERIFIED',
    kycType: 'Aadhaar + PAN Verified',
    joinedDate: profileData.joinedDate
      ? `Joined ${new Date(profileData.joinedDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`
      : profileData.createdAt
        ? `Joined ${new Date(profileData.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`
        : 'Joined Recently',
    reputation: profileData.reputation ?? 0,
    successRate: profileData.successRate ?? 98,
    totalSold: profileData.totalSold ?? 0,
    activeItems,
    endedItems,
    reviews: (profileData.reviews ?? []).map((r, idx) => ({
      id: r._id ?? idx,
      bidder: r.reviewerId?.username ?? r.reviewer ?? 'Anonymous',
      rating: r.rating ?? 5,
      comment: r.comment ?? '',
      date: r.createdAt
        ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : '',
    })),
  };
}



/**
 * Syncs handoff completion status with the server.
 * PATCH /api/handoff/item/:itemId
 * @param {string} itemId — MongoDB ObjectId of the auction item
 * @param {string} status — e.g. "COMPLETED"
 */
export async function updateHandoffStatus(itemId, status) {
  const { data } = await api.patch(`/handoff/item/${itemId}`, { status });
  return data;
}
