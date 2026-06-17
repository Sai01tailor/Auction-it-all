import api from '../../Config/Axios';

/* ─────────────────────────────────────────────────────────────
   AUCTION SERVICE  — Phase 1 abstraction layer
   
   Maps the frontend's conceptual needs to the actual server
   endpoints at /api/items. Fills gaps for endpoints that don't
   exist yet on the server with client-side filtering/sorting.
   
   Missing server endpoints (will be built in later phases):
     - GET /api/auctions/featured   → mocked via getFeaturedAuctions()
     - GET /api/auctions/ending-soon → mocked via getEndingSoon()
───────────────────────────────────────────────────────────── */

/**
 * Fetch ALL active auction items from the server.
 * Cached server-side in Redis for 60 seconds.
 * @returns {Promise<Item[]>}
 */
async function fetchAllActive() {
  const { data } = await api.get('/items', {
    params: { status: 'ACTIVE' },
  });
  return Array.isArray(data) ? data : (data.items ?? []);
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
  const { data } = await api.get('/items', {
    params: { status: filters.type === 'ENDED' ? undefined : 'ACTIVE', limit: 200 },
  });
  let items = Array.isArray(data) ? data : (data.items ?? []);

  // ── client-side filtering ──────────────────────────────────
  const { search, priceRange, condition, category } = filters;

  if (search && search.trim()) {
    const q = search.toLowerCase();
    items = items.filter(
      it =>
        it.title?.toLowerCase().includes(q) ||
        it.description?.toLowerCase().includes(q),
    );
  }

  if (priceRange) {
    const [min, max] = priceRange;
    items = items.filter(
      it => (it.currentHighestBid || it.startingPrice) >= min &&
            (it.currentHighestBid || it.startingPrice) <= max,
    );
  }

  if (condition && condition.length > 0) {
    // condition lives on the item in Phase 2 — pass through for now
    // items = items.filter(it => condition.includes(it.condition));
  }

  if (category && category !== 'all') {
    // category lives on the item in Phase 2 — pass through for now
    // items = items.filter(it => it.category === category);
  }

  const total = items.length;
  const page  = items.slice(offset, offset + limit);
  return { items: page, total, hasMore: offset + limit < total };
}

/**
 * P03 Auction Detail
 * Calls GET /api/items/:id — cached in Redis for 30 seconds.
 * @param {string} id — MongoDB ObjectId
 */
export async function getAuctionById(id) {
  const { data } = await api.get(`/items/${id}`);
  return data.item ?? data;
}
