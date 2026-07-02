import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuctionById } from '../services/auctionService';
import Header from '../Components/Global/Header';

export default function InvoicePage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);

  useEffect(() => {
    const loadItem = async () => {
      setLoading(true);
      try {
        const data = await getAuctionById(itemId);
        setItem(data);
      } catch (err) {
        console.error('Failed to load item for invoice', err);
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [itemId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
        <Header />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(0,35,102,0.1)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Loading invoice credentials...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
        <Header />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <p style={{ color: 'var(--color-text-muted)', fontWeight: 700, marginTop: '1rem' }}>Transaction not found.</p>
        </div>
      </div>
    );
  }

  const hammerPrice = item.currentHighestBid || item.startingPrice || 0;
  const securityDeposit = Math.floor(hammerPrice * 0.10);
  const offlineBalance = hammerPrice - securityDeposit;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <style>{`
        @media print {
          .no-print,
          header,
          footer,
          nav,
          button,
          aside {
            display: none !important;
          }
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .invoice-card-container {
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            padding: 1.5cm !important;
            max-width: 100% !important;
            width: 100% !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      <div className="no-print">
        <Header />
      </div>

      {/* Invoice Container */}
      <div style={{
        maxWidth: '800px',
        margin: '2rem auto',
        background: '#fff',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: '24px',
        padding: '3rem',
        boxShadow: '0 10px 30px rgba(0,35,102,0.02)',
        position: 'relative',
        overflow: 'hidden'
      }} className="invoice-card-container print:m-0 print:border-none print:shadow-none print:rounded-none">
        
        {/* Watermark backdrop */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '15%',
          opacity: 0.04,
          fontSize: '70px',
          fontWeight: 900,
          transform: 'rotate(-35deg)',
          zIndex: 1,
          pointerEvents: 'none',
          color: '#002366',
          whiteSpace: 'nowrap'
        }}>
          VERIFIED BY BIDKAR
        </div>

        {/* Print controls in UI only */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '1.25rem', marginBottom: '2rem' }} className="no-print">
          <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>📄 In-app Sales Statement</span>
          <button
            onClick={handlePrint}
            style={{
              padding: '0.5rem 1.25rem',
              background: 'var(--color-brand-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            🖨️ Print / Save PDF
          </button>
        </div>

        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: 'var(--color-brand-primary)', letterSpacing: '-1px' }}>BidKar</h1>
            <p style={{ margin: '0.25rem 0', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>The Premier Live Auction Platform</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-brand-primary)', letterSpacing: '1px' }}>INVOICE</h2>
            <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              <strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}
            </p>
            <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              <strong>TxID:</strong> tx-{itemId?.slice(-8)}
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ background: 'var(--color-surface-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Billed To (Winner)</span>
            <p style={{ margin: '0.2rem 0', fontWeight: 800, color: 'var(--color-brand-primary)' }}>{item.winnerId?.username || 'Verified Winner'}</p>
            <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ID: {item.winnerId?._id || 'UID-440292'}</p>
          </div>
          <div style={{ background: 'var(--color-surface-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Sold By (Seller)</span>
            <p style={{ margin: '0.2rem 0', fontWeight: 800, color: 'var(--color-brand-primary)' }}>{item.sellerId?.username || 'Verified Seller'}</p>
            <p style={{ margin: '0.2rem 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ID: {item.sellerId?._id || 'SID-883920'}</p>
          </div>
        </div>

        {/* Hammer price breakdown table */}
        <div style={{ marginBottom: '3rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-bg)', borderBottom: '2px solid var(--color-border-subtle)' }}>
                <th style={{ textAlign: 'left', padding: '1rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>Item Description</th>
                <th style={{ textAlign: 'right', padding: '1rem', fontWeight: 700, color: 'var(--color-brand-primary)' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '1.25rem 1rem' }}>
                  <strong>{item.title}</strong>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Final Winning Bid (Hammer Price)</p>
                </td>
                <td style={{ textAlign: 'right', padding: '1.25rem 1rem', fontWeight: 700 }}>₹{hammerPrice.toLocaleString('en-IN')}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '1.25rem 1rem' }}>
                  Security Deposit (10%)
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Paid online via BidKar Wallet</p>
                </td>
                <td style={{ textAlign: 'right', padding: '1.25rem 1rem', fontWeight: 700, color: '#ef4444' }}>- ₹{securityDeposit.toLocaleString('en-IN')}</td>
              </tr>
              <tr style={{ background: '#eff6ff', borderBottom: '2px solid #bfdbfe', color: 'var(--color-brand-primary-dark)' }}>
                <td style={{ padding: '1.25rem 1rem' }}>
                  <strong>Balance Due Offline (90%)</strong>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.72rem', color: 'var(--color-brand-primary-light)' }}>To be paid directly to seller at handoff</p>
                </td>
                <td style={{ textAlign: 'right', padding: '1.25rem 1rem', fontWeight: 900, fontSize: '1.15rem' }}>₹{offlineBalance.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
          <p style={{ margin: '0.2rem 0' }}>This is a system-generated statement documenting the auction closing results.</p>
          <p style={{ margin: '0.2rem 0' }}>For compliance and disputes support, email <strong>support@bidkar.in</strong></p>
          <p style={{ margin: '0.4rem 0 0', fontStyle: 'italic' }}>Note: Applicable TDS/GST liabilities must be settled directly between buyer and seller as per Indian E-commerce guidelines.</p>
        </div>

      </div>
    </div>
  );
}
