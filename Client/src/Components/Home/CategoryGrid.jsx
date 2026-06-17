import React from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { id: 'electronics', label: 'Electronics',       icon: '💻', path: '/auctions?category=electronics', color: '#2563eb' },
  { id: 'art',         label: 'Art & Collectibles', icon: '🎨', path: '/auctions?category=art',         color: '#7c3aed' },
  { id: 'vehicles',    label: 'Vehicles',            icon: '🏍️', path: '/auctions?category=vehicles',    color: '#dc2626' },
  { id: 'jewellery',   label: 'Jewellery & Gold',   icon: '💍', path: '/auctions?category=jewellery',   color: '#d97706' },
  { id: 'realestate',  label: 'Real Estate',         icon: '🏠', path: '/auctions?category=realestate',  color: '#059669' },
  { id: 'fashion',     label: 'Fashion & Luxury',    icon: '👜', path: '/auctions?category=fashion',     color: '#db2777' },
  { id: 'antiques',    label: 'Antiques',             icon: '🏺', path: '/auctions?category=antiques',    color: '#b45309' },
  { id: 'sports',      label: 'Sports & Fitness',    icon: '🏋️', path: '/auctions?category=sports',      color: '#0891b2' },
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
