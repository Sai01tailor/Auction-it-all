const Item = require('../models/item.model');
const User = require('../models/user.model');

/**
 * Dynamically generates a valid sitemap.xml for SEO indexing.
 * Automatically pulls active auction listings, verified seller profiles, and public pages.
 */
exports.getSitemapXml = async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://bidkar.in';

    // 1. Static Core Pages
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/auctions', changefreq: 'hourly', priority: 0.9 },
      { url: '/how-it-works', changefreq: 'weekly', priority: 0.8 },
      { url: '/contact', changefreq: 'monthly', priority: 0.7 },
      { url: '/sitemap', changefreq: 'weekly', priority: 0.6 },
      { url: '/legal/terms', changefreq: 'monthly', priority: 0.5 },
      { url: '/legal/privacy', changefreq: 'monthly', priority: 0.5 },
      { url: '/legal/refund', changefreq: 'monthly', priority: 0.5 },
    ];

    // 2. Dynamic Active & Recent Auction Listings
    let itemPages = [];
    try {
      const items = await Item.find({ status: { $in: ['ACTIVE', 'SOLD'] } })
        .select('_id updatedAt createdAt')
        .lean();

      itemPages = items.map((item) => ({
        url: `/auction/${item._id}`,
        lastmod: item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date(item.createdAt || Date.now()).toISOString(),
        changefreq: 'hourly',
        priority: 0.8,
      }));
    } catch (e) {
      console.warn('Sitemap item fetch warning:', e.message);
    }

    // 3. Dynamic Public Seller Profile Pages
    let sellerPages = [];
    try {
      const sellers = await User.find({ role: { $in: ['SELLER', 'ADMIN'] } })
        .select('_id updatedAt createdAt')
        .lean();

      sellerPages = sellers.map((seller) => ({
        url: `/seller/${seller._id}`,
        lastmod: seller.updatedAt ? new Date(seller.updatedAt).toISOString() : new Date(seller.createdAt || Date.now()).toISOString(),
        changefreq: 'daily',
        priority: 0.7,
      }));
    } catch (e) {
      console.warn('Sitemap seller fetch warning:', e.message);
    }

    const allPages = [...staticPages, ...itemPages, ...sellerPages];

    // 4. Construct XML Document
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    allPages.forEach((page) => {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      if (page.lastmod) {
        xml += `    <lastmod>${page.lastmod}</lastmod>\n`;
      }
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap.xml:', error);
    return res.status(500).send('<error>Failed to generate sitemap</error>');
  }
};
