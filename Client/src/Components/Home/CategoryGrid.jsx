import React from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  {
    id: 'electronics', label: 'Electronics', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="12" rx="2" ry="2" />
      <path d="M2 20h20" />
    </svg>, path: '/auctions?category=electronics', color: '#2563eb'
  },
  {
    id: 'art', label: 'Art & Collectibles', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Sweeping Brush Stroke */}
      <path d="M4 20s3.5-2 8-2 8 2 8 2" />
      {/* Paintbrush */}
      <path d="M18.5 4.5a2.12 2.12 0 0 0-3 0l-8.5 8.5c-.8.8-1.5 2.5-1.5 4 1.5 0 3.2-.7 4-1.5l8.5-8.5a2.12 2.12 0 0 0 0-3z" />
      {/* Ferrule / Brush Detail */}
      <line x1="12" y1="10" x2="15" y2="13" />
    </svg>, path: '/auctions?category=art', color: '#7c3aed'
  },
  {
    id: 'vehicles', label: 'Vehicles', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>, path: '/auctions?category=vehicles', color: '#dc2626'
  },
  {
    id: 'jewellery', label: 'Jewellery & Gold', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 11a6 6 0 1 0 7 0" />
      <path d="M9 7l3-4 3 4-3 3-3-3z" />
    </svg>, path: '/auctions?category=jewellery', color: '#d97706'
  },
  {
    id: 'realestate', label: 'Real Estate', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>, path: '/auctions?category=realestate', color: '#059669'
  },
  {
    id: 'fashion', label: 'Fashion & Luxury', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>, path: '/auctions?category=fashion', color: '#db2777'
  },
  {
    id: 'antiques', label: 'Antiques', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2h6" />
      <path d="M8 22h8" />
      <path d="M10 2v4" />
      <path d="M14 2v4" />
      <path d="M7 6c-4 5-4 11 0 16" />
      <path d="M17 6c4 5 4 11 0 16" />
    </svg>, path: '/auctions?category=antiques', color: '#b45309'
  },
  {
    id: 'sports', label: 'Sports & Fitness', icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="18" y2="12" />
      <rect x="2" y="8" width="4" height="8" rx="1" />
      <rect x="18" y="8" width="4" height="8" rx="1" />
      <line x1="6" y1="6" x2="6" y2="18" />
      <line x1="18" y1="6" x2="18" y2="18" />
    </svg>, path: '/auctions?category=sports', color: '#0891b2'
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8">

        <div className="mb-7">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-[var(--color-text-muted)] mb-1">
            Browse by Category
          </p>
          <h2 className="text-[var(--color-brand-primary)] text-xl font-bold m-0">
            What are you looking for?
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.id}
              to={cat.path}
              id={`cat-${cat.id}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--color-border-subtle)] bg-white hover:border-transparent hover:shadow-md transition-all duration-200 group text-center no-underline"
            >
              <span
                className="text-2xl w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${cat.color}15` }}
              >
                {cat.icon}
              </span>
              <span
                className="text-[0.72rem] font-600 leading-tight"
                style={{ color: 'var(--color-text-rich)' }}
              >
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
