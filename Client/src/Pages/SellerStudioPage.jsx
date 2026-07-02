import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSellerDashboard, updateHandoffStatus } from '../services/auctionService';
import { useAuth } from '../Context/AuthContext';
import Header from '../Components/Global/Header';
import AuthController from '../Components/Global/AuthController';

export default function SellerStudioPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const sellerId = user?._id || user?.id || 'mock-seller-id';

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [metrics, setMetrics] = useState({
    liveRevenue: 0,
    pendingHandoffsCount: 0,
    completedSales: 0,
  });

  // Tabs: 'ACTIVE' | 'ENDED'
  const [activeTab, setActiveTab] = useState('ACTIVE');

  // Load Dashboard Data from GET /api/seller/dashboard
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await getSellerDashboard(); // No sellerId arg — server uses JWT
      setItems(data.items || []);
      setMetrics(data.metrics || { liveRevenue: 0, pendingHandoffsCount: 0, completedSales: 0 });
    } catch (err) {
      console.error('Failed to load seller studio dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle handoff validation toggle — calls PATCH /api/handoff/item/:itemId
  const handleConfirmHandoff = async (itemId) => {
    try {
      await updateHandoffStatus(itemId, 'COMPLETED');
      // Reload stats and state
      await loadDashboardData();
    } catch (err) {
      console.error('Handoff update failed', err);
    }
  };

  const now = new Date();

  // Filter items
  const filteredItems = items.filter(item => {
    const isEnded = new Date(item.endTime) <= now;
    if (activeTab === 'ACTIVE') return !isEnded;
    return isEnded;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <AuthController />
      <Header />

      <div style={{ maxWidth: '1100px', margin: '2.5rem auto', padding: '0 1.5rem' }}>

        {/* Dashboard Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-brand-primary), #00153d)',
          color: '#fff',
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0,35,102,0.15)',
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-brand-accent)', fontWeight: 800 }}>
              AUTHENTICATED SELLER CENTER
            </span>
            <h1 style={{ margin: '0.2rem 0 0.5rem', fontSize: '2.2rem', fontWeight: 900, color: '#fff' }}>
              Seller Studio
            </h1>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', maxWidth: '500px' }}>
              Track live bids, complete local escrow handoffs, and manage premium listings.
            </p>
          </div>
          <div>
            <Link to="/seller/create">
              <button style={{
                background: 'linear-gradient(135deg, var(--color-brand-accent), #e5b630)',
                color: 'var(--color-brand-primary)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.85rem 1.75rem',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(254,206,68,0.35)',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                ➕ Create New Listing
              </button>
            </Link>
          </div>
        </div>

        {/* Overview Tiles (Responsive: stack vertically on mobile, grid on desktop) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }} className="md:grid md:grid-cols-3">

          {/* Live Revenue Tile */}
          <div style={{
            background: '#fff',
            border: '1px solid var(--color-border-subtle)',
            borderTop: '4px solid var(--color-brand-primary)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,35,102,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '120px',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Estimated Live Revenue
              </span>
              <h2 className="tabular-nums" style={{ margin: '0.4rem 0 0', fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>
                ₹{metrics.liveRevenue.toLocaleString('en-IN')}
              </h2>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              Potential value of all active block listings
            </span>
          </div>

          {/* Pending Handoffs Tile */}
          <div style={{
            background: '#fff',
            border: '1px solid var(--color-border-subtle)',
            borderTop: '4px solid var(--color-brand-accent-dark)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,35,102,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '120px',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Pending Handoffs
              </span>
              <h2 className="tabular-nums" style={{ margin: '0.4rem 0 0', fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>
                {metrics.pendingHandoffsCount} Items
              </h2>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#b45309', marginTop: '0.5rem', fontWeight: 600 }}>
              Requires physical exchange verification
            </span>
          </div>

          {/* Completed Sales Tile */}
          <div style={{
            background: '#fff',
            border: '1px solid var(--color-border-subtle)',
            borderTop: '4px solid #10b981',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0,35,102,0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '120px',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Completed Escrow Sales
              </span>
              <h2 className="tabular-nums" style={{ margin: '0.4rem 0 0', fontSize: '1.8rem', fontWeight: 900, color: '#10b981' }}>
                ₹{metrics.completedSales.toLocaleString('en-IN')}
              </h2>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#047857', marginTop: '0.5rem', fontWeight: 600 }}>
              Funds successfully released from escrow
            </span>
          </div>

        </div>

        {/* Listings Manager Workspace */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '24px',
          boxShadow: '0 8px 30px rgba(0,35,102,0.02)',
          padding: '1.5rem 2rem',
        }}>

          {/* Tab Selection */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--color-border-subtle)',
            marginBottom: '2rem',
            gap: '1.5rem',
          }}>
            <button
              onClick={() => setActiveTab('ACTIVE')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: activeTab === 'ACTIVE' ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
                borderBottom: activeTab === 'ACTIVE' ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
                cursor: 'pointer',
                borderRadius: 0,
                boxShadow: 'none',
              }}
            >
              Active Auctions
            </button>
            <button
              onClick={() => setActiveTab('ENDED')}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.75rem 0.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: activeTab === 'ENDED' ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
                borderBottom: activeTab === 'ENDED' ? '3px solid var(--color-brand-primary)' : '3px solid transparent',
                cursor: 'pointer',
                borderRadius: 0,
                boxShadow: 'none',
              }}
            >
              Ended / Logistical Handoffs
            </button>
          </div>

          {/* Listings List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(0,35,102,0.1)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Retrieving listing records...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--color-text-muted)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>🏷️</span>
              <p style={{ margin: 0, fontWeight: 700 }}>No listings found in this category.</p>
              <p style={{ margin: '0.2rem 0 1.5rem', fontSize: '0.85rem' }}>Create a high-fidelity listing to start receiving escrow bids.</p>
              {activeTab === 'ACTIVE' && (
                <Link to="/seller/create">
                  <button style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>Create Listing</button>
                </Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredItems.map(item => {
                const isEnded = new Date(item.endTime) <= now;
                // handoffStatus comes from the server response field (set by PATCH /api/handoff/item/:id)
                const handoffStatus = item.handoffStatus || 'PENDING';

                return (
                  <div
                    key={item._id}
                    style={{
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      background: '#fff',
                      transition: 'all 0.25s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-brand-primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
                  >

                    {/* Upper row: Details & Format Tag */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                        {item.photos && item.photos[0] && (
                          <img
                            src={item.photos[0]}
                            alt={item.title}
                            style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--color-border-subtle)' }}
                          />
                        )}
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                            {item.title}
                          </h3>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.2rem' }}>
                            Auction Type: <strong style={{ color: 'var(--color-brand-primary-light)' }}>{item.auctionType}</strong>
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{
                          background: item.auctionType === 'ENGLISH' ? '#eff6ff' : item.auctionType === 'DUTCH' ? '#fef3c7' : '#faf5ff',
                          color: item.auctionType === 'ENGLISH' ? '#1e40af' : item.auctionType === 'DUTCH' ? '#92400e' : '#6b21a8',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}>
                          {item.auctionType}
                        </span>

                        <span style={{
                          background: isEnded ? '#fee2e2' : '#dcfce7',
                          color: isEnded ? '#991b1b' : '#166534',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}>
                          {isEnded ? 'Ended' : 'Active'}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Pricing stats & Logistical details */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      background: 'var(--color-surface-bg)',
                      padding: '1rem',
                      borderRadius: '12px',
                    }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>
                          Starting Price
                        </span>
                        <strong className="tabular-nums" style={{ fontSize: '0.95rem', color: 'var(--color-brand-primary)' }}>
                          ₹{item.startingPrice?.toLocaleString('en-IN') || '0'}
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>
                          Current Bid / Valuation
                        </span>
                        <strong className="tabular-nums" style={{ fontSize: '0.95rem', color: 'var(--color-brand-primary)' }}>
                          ₹{(item.currentHighestBid || item.startingPrice)?.toLocaleString('en-IN') || '0'}
                        </strong>
                      </div>

                      {item.meetingPoint && (
                        <div style={{ gridColumn: 'span 2' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block' }}>
                            Escrow Meeting Coordinates
                          </span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--color-text-rich)', fontWeight: 600 }}>
                            📍 {item.meetingPoint}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Center & Logistics */}
                    {isEnded && (
                      <div style={{
                        borderTop: '1px dashed var(--color-border-subtle)',
                        paddingTop: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                      }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block' }}>
                            Bid Winner Coordinates:
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>
                            {item.winnerId?.username ? `👤 ${item.winnerId.username} (${item.winnerId.email})` : '👤 Rohan Sharma (rohan.sharma@gmail.com)'}
                          </span>
                        </div>

                        <div>
                          {handoffStatus === 'COMPLETED' ? (
                            <div style={{
                              background: '#ecfdf5',
                              border: '1.5px solid #34d399',
                              color: '#065f46',
                              padding: '0.45rem 1rem',
                              borderRadius: '8px',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              boxShadow: '0 0 10px rgba(52,211,153,0.15)',
                            }}>
                              ✅ Escrow Handoff Verified
                            </div>
                          ) : (
                            <button
                              onClick={() => handleConfirmHandoff(item._id)}
                              style={{
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '0.55rem 1.25rem',
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 3px 12px rgba(16,185,129,0.25)',
                              }}
                              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                              🤝 Confirm Exchange Completed
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Console entry for Active items */}
                    {!isEnded && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Link to={`/auction/${item._id}/console`}>
                          <button style={{
                            background: 'var(--color-brand-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 1.25rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}>
                            💻 Enter Trading Terminal →
                          </button>
                        </Link>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
