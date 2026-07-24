import { useEffect } from 'react';

/**
 * SEO Component — Dynamically updates <title> and <meta> tags as users navigate between routes.
 * Serves as a lightweight, zero-dependency alternative to React Helmet.
 */
export default function SEO({ title, description, keywords, ogImage, ogUrl }) {
  useEffect(() => {
    // 1. Dynamic Page Title
    const baseTitle = 'BidKar.in — Premier Online Live & Reserve Auctions';
    const finalTitle = title ? `${title} | BidKar.in` : baseTitle;
    document.title = finalTitle;

    // Helper to create or update head meta tags
    const setMetaTag = (name, content, isProperty = false) => {
      if (!content) return;
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Standard Meta Description & Keywords
    const defaultDesc = 'Discover and bid on exclusive verified items on BidKar.in. Real-time transparent bidding, escrow protection, and instant notifications.';
    setMetaTag('description', description || defaultDesc);
    if (keywords) {
      setMetaTag('keywords', keywords);
    }

    // 3. OpenGraph Meta Tags (Facebook / WhatsApp / LinkedIn previews)
    setMetaTag('og:title', finalTitle, true);
    setMetaTag('og:description', description || defaultDesc, true);
    if (ogImage) setMetaTag('og:image', ogImage, true);
    setMetaTag('og:url', ogUrl || window.location.href, true);
    setMetaTag('og:type', 'website', true);

    // 4. Twitter Card Meta Tags
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', finalTitle);
    setMetaTag('twitter:description', description || defaultDesc);
    if (ogImage) setMetaTag('twitter:image', ogImage);

  }, [title, description, keywords, ogImage, ogUrl]);

  return null;
}
