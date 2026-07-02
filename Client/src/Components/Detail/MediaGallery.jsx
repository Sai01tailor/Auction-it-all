import React, { useState } from 'react';

/* ─────────────────────────────────────────────────────────────
   MediaGallery — High-res image gallery with hover-to-zoom
   
   Props:
     photos  {string[]}  — Cloudinary secure URLs
     title   {string}    — item title (for alt text)
───────────────────────────────────────────────────────────── */
export default function MediaGallery({ photos = [], title = 'Auction Item' }) {
  const [selected, setSelected] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const hasPhotos = photos.length > 0;
  const mainPhoto = hasPhotos ? photos[selected] : null;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* ── Main Image ── */}
      <div
        id="media-gallery-main"
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '16px',
          border: '1px solid var(--color-border-subtle)',
          background: hasPhotos ? '#000' : '#f0f4ff',
          aspectRatio: '4/3',
          cursor: zoomed ? 'zoom-out' : 'zoom-in',
          boxShadow: '0 4px 24px rgba(0,35,102,0.1)',
        }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={`${title} — photo ${selected + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              transform: zoomed ? 'scale(1.85)' : 'scale(1)',
              transition: zoomed ? 'transform 0.15s ease-out' : 'transform 0.3s ease',
              display: 'block',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            color: '#9ca3af',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>No photos available</span>
          </div>
        )}

        {/* Photo counter badge */}
        {hasPhotos && (
          <div style={{
            position: 'absolute', bottom: '12px', right: '12px',
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '0.25rem 0.65rem',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            {selected + 1} / {photos.length}
          </div>
        )}

        {/* Zoom hint */}
        {!zoomed && hasPhotos && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            fontSize: '0.68rem',
            fontWeight: 600,
            padding: '0.2rem 0.55rem',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            Hover to zoom
          </div>
        )}

        {/* Prev / Next arrows (keyboard nav) */}
        {photos.length > 1 && (
          <>
            <button
              id="gallery-prev"
              onClick={() => setSelected(s => (s - 1 + photos.length) % photos.length)}
              style={arrowStyle('left')}
              aria-label="Previous photo"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              id="gallery-next"
              onClick={() => setSelected(s => (s + 1) % photos.length)}
              style={arrowStyle('right')}
              aria-label="Next photo"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail Strip ── */}
      {photos.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
        }}>
          {photos.map((photo, i) => (
            <button
              key={i}
              id={`gallery-thumb-${i}`}
              onClick={() => setSelected(i)}
              style={{
                flexShrink: 0,
                width: '72px', height: '56px',
                borderRadius: '8px',
                border: i === selected
                  ? '2.5px solid var(--color-brand-primary)'
                  : '2px solid var(--color-border-subtle)',
                overflow: 'hidden',
                padding: 0, cursor: 'pointer',
                transition: 'border-color 0.15s',
                opacity: i === selected ? 1 : 0.65,
              }}
            >
              <img
                src={photo}
                alt={`Thumbnail ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function arrowStyle(side) {
  return {
    position: 'absolute',
    [side]: '10px',
    top: '50%', transform: 'translateY(-50%)',
    width: '36px', height: '36px',
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-brand-primary)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'background 0.15s',
    zIndex: 5,
    padding: 0,
  };
}
