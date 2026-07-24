const express = require('express');
const router = express.Router();
const sitemapController = require('../controllers/sitemap.controller');

// GET /sitemap.xml & GET /api/sitemap.xml
router.get('/', sitemapController.getSitemapXml);

module.exports = router;
