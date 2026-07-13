import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../Components/Global/Header';
import AuthController from '../Components/Global/AuthController';
import { toast } from 'react-toastify';
import api from '../../Config/Axios';
import { useAuth } from '../Context/AuthContext';

const mapTransaction = (t) => {
  if (!t) return null;
  if (t.amount !== undefined && t.type !== undefined) return t;
  return {
    // mongoId is the raw _id used for the receipt API endpoint
    mongoId: t._id || null,
    id: t._id || t.razorpayOrderId || 'N/A',
    date: t.createdAt || new Date().toISOString(),
    title: t.razorpayPaymentId
      ? `Wallet Top-up (ID: ${t.razorpayPaymentId})`
      : 'Wallet Top-up (Pending)',
    amount: (t.amountInPaise ?? 0) / 100,
    coinsAdded: t.coinsToBeAdded ?? null,
    razorpayOrderId: t.razorpayOrderId || null,
    razorpayPaymentId: t.razorpayPaymentId || null,
    type: 'TOP-UP',
    status: t.status || 'PENDING',
  };
};

const TYPE_FILTERS = [
  { key: 'ALL', label: 'All Operations' },
  { key: 'TOP-UPS', label: 'Top-Ups' },
  { key: 'DEPOSITS', label: 'Holds & Escrow' },
  { key: 'REFUNDS', label: 'Refunds' },
];

export default function TransactionLedgerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [expandedTxId, setExpandedTxId] = useState(null);
  const [search, setSearch] = useState('');
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [txRes, balRes] = await Promise.all([
          api.get('/transaction/history'),
          api.get('/wallet/balance'),
        ]);
        let rawTxs = txRes.data?.transactions ?? txRes.data?.data ?? [];

        if (user) {
          const userId = user.userId || user._id;
          try {
            const virtualTxs = JSON.parse(localStorage.getItem(`virtual_transactions:${userId}`) || '[]');
            const serverOrderIds = new Set(rawTxs.map(tx => tx.razorpayOrderId));
            const activeVirtuals = virtualTxs.filter(tx => !serverOrderIds.has(tx.razorpayOrderId));
            rawTxs = [...activeVirtuals, ...rawTxs];
          } catch (e) { }
        }

        setTransactions(rawTxs.map(mapTransaction).filter(Boolean));

        let serverBalance = balRes.data?.data?.availableMoney ?? balRes.data?.walletBalance ?? 0;
        let finalBalance = serverBalance;
        if (user) {
          const userId = user.userId || user._id;
          const virtualVal = localStorage.getItem(`virtual_balance:${userId}`);
          if (virtualVal) {
            const virtualBalance = Number(virtualVal);
            if (virtualBalance > serverBalance) {
              finalBalance = virtualBalance;
            } else {
              localStorage.removeItem(`virtual_balance:${userId}`);
            }
          }
        }
        setWalletBalance(finalBalance);
      } catch (err) {
        console.error('Failed to load ledger data', err);
        toast.error('Failed to load transaction history.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleFilterChange = async (filter) => {
    setActiveFilter(filter);
    setExpandedTxId(null);
    try {
      const typeMap = { 'TOP-UPS': 'TOP-UP', 'DEPOSITS': 'HELD', 'REFUNDS': 'REFUNDED' };
      const params = filter !== 'ALL' && typeMap[filter] ? { type: typeMap[filter] } : {};
      const { data } = await api.get('/transaction/history', { params });
      let rawTxs = data?.transactions ?? data?.data ?? [];

      if (user) {
        const userId = user.userId || user._id;
        try {
          const virtualTxs = JSON.parse(localStorage.getItem(`virtual_transactions:${userId}`) || '[]');
          const serverOrderIds = new Set(rawTxs.map(tx => tx.razorpayOrderId));
          const activeVirtuals = virtualTxs.filter(tx => !serverOrderIds.has(tx.razorpayOrderId));
          rawTxs = [...activeVirtuals, ...rawTxs];
        } catch (e) { }
      }

      setTransactions(rawTxs.map(mapTransaction).filter(Boolean));
    } catch (err) {
      console.error('Filter fetch failed', err);
    }
  };

  const baseFiltered = useMemo(() => transactions.filter(tx => {
    if (activeFilter === 'DEPOSITS') return tx.type === 'HELD' || tx.type === 'CAPTURED';
    if (activeFilter === 'REFUNDS') return tx.type === 'REFUNDED';
    if (activeFilter === 'TOP-UPS') return tx.type === 'TOP-UP';
    return true;
  }), [transactions, activeFilter]);

  const filteredTx = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return baseFiltered;
    return baseFiltered.filter(tx =>
      tx.title?.toLowerCase().includes(q) ||
      tx.id?.toLowerCase().includes(q) ||
      tx.type?.toLowerCase().includes(q)
    );
  }, [baseFiltered, search]);

  const toggleExpand = (id) => setExpandedTxId(expandedTxId === id ? null : id);

  const getBadge = (type, status) => {
    if (status === 'FAILED') return { label: 'Failed', bg: '#fef2f2', color: '#ef4444', border: '#fecaca' };
    if (status === 'PENDING') return { label: 'Pending', bg: '#fffbeb', color: '#f59e0b', border: '#fde68a' };
    switch (type) {
      case 'TOP-UP': return { label: 'Success', bg: '#ecfdf5', color: '#10b981', border: '#a7f3d0' };
      case 'HELD': return { label: 'Held', bg: '#fffbeb', color: '#f59e0b', border: '#fde68a' };
      case 'REFUNDED': return { label: 'Refunded', bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe' };
      case 'CAPTURED': return { label: 'Captured', bg: '#fef2f2', color: '#ef4444', border: '#fecaca' };
      default: return { label: type, bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
    }
  };

  const totalLocked = transactions.filter(tx => tx.type === 'HELD').reduce((s, tx) => s + tx.amount, 0);
  const totalDeposited = walletBalance + totalLocked;

  const handleDownloadReceipt = async (tx) => {
    // The receipt API requires the MongoDB _id of the transaction
    const transactionId = tx.mongoId || tx.id;
    if (!transactionId || transactionId === 'N/A') {
      toast.error('Cannot download receipt: transaction ID unavailable.');
      return;
    }
    setDownloadingReceiptId(transactionId);
    try {
      const response = await api.get(`/transaction/${transactionId}/receipt`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BidKar-Receipt-${transactionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Receipt downloaded!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Receipt download failed.';
      toast.error(msg);
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  const statsCards = [
    { label: 'Total Deposited', value: totalDeposited, color: 'var(--color-brand-primary)', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22V12" /><path d="M17 7l-5-5-5 5" /><path d="M5 12H2a10 10 0 0 0 20 0h-3" /></svg> },
    { label: 'Available Balance', value: walletBalance, color: '#10b981', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg> },
    { label: 'Currently Locked', value: totalLocked, color: '#f59e0b', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <AuthController />
      <Header />

      {/* ── HERO BANNER (same as BidderDashboardPage) ── */}
      <div style={{
        background: 'linear-gradient(135deg,var(--color-brand-primary-dark) 0%,var(--color-brand-primary) 55%,#1a3c7a 100%)',
        padding: '2rem 2rem 3.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#fff 1.5px,transparent 0)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            {/* <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(254,206,68,0.12)', border: '1px solid rgba(254,206,68,0.25)', padding: '0.3rem 0.85rem', borderRadius: '20px', marginBottom: '0.75rem' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-accent)" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-brand-accent)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Passbook Ledger</span>
            </div> */}
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Transaction Ledger</h1>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>Real-time audit log for all escrow, top-up, and refund operations</p>
          </div>
          <button
            onClick={() => navigate('/wallet')}
            style={{
              padding: '0.65rem 1.25rem',
              background: 'rgba(255,255,255,0.1)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
              transition: 'background 0.15s', backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
            Back to Wallet
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT (overlaps hero) ── */}
      <div style={{ maxWidth: '1100px', margin: '-1.75rem auto 4rem', padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>

        {/* STATS STRIP */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {statsCards.map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '18px', padding: '1.1rem 1.25rem', boxShadow: '0 4px 20px rgba(0,35,102,0.02)', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{s.label}</p>
                <strong style={{ fontSize: '1.35rem', fontWeight: 900, color: s.color, letterSpacing: '-0.02em' }}>₹{s.value.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* LEDGER CARD */}
        <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,35,102,0.025)', overflow: 'hidden' }}>

          {/* Toolbar: filter pills + search */}
          <div style={{ borderBottom: '1px solid var(--color-border-subtle)', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', background: 'var(--color-surface-bg)' }}>
            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {TYPE_FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => handleFilterChange(f.key)}
                  style={{
                    padding: '0.4rem 0.9rem', borderRadius: '8px', border: '1.5px solid',
                    borderColor: activeFilter === f.key ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)',
                    background: activeFilter === f.key ? 'var(--color-brand-primary)' : '#fff',
                    color: activeFilter === f.key ? '#fff' : 'var(--color-text-muted)',
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (activeFilter !== f.key) { e.currentTarget.style.borderColor = 'var(--color-brand-primary)'; e.currentTarget.style.color = 'var(--color-brand-primary)'; } }}
                  onMouseLeave={e => { if (activeFilter !== f.key) { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; e.currentTarget.style.color = 'var(--color-text-muted)'; } }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <div style={{ position: 'relative', minWidth: '200px', maxWidth: '280px', width: '100%' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by ID or description..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '0.5rem 0.85rem 0.5rem 2.1rem',
                  border: '1.5px solid var(--color-border-subtle)',
                  borderRadius: '10px', fontSize: '0.8rem', fontFamily: 'inherit',
                  background: '#fff', outline: 'none', transition: 'border-color 0.15s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--color-brand-primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border-subtle)'}
              />
            </div>
          </div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 140px 1fr 120px 110px 140px', gap: 0, padding: '0.7rem 1.5rem', background: 'var(--color-surface-bg)', borderBottom: '1px solid var(--color-border-subtle)', fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <div>TX ID</div>
            <div>Timestamp</div>
            <div>Description</div>
            <div style={{ textAlign: 'right' }}>Amount</div>
            <div style={{ textAlign: 'center' }}>Status</div>
            <div style={{ textAlign: 'center' }}>Actions</div>
          </div>

          {/* Transaction rows */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {isLoading ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(0,35,102,0.1)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '1rem' }} />
                <p style={{ margin: 0, fontSize: '0.88rem' }}>Loading transactions...</p>
              </div>
            ) : filteredTx.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>
                {search ? `No transactions matching "${search}".` : 'No operations recorded for this filter.'}
              </div>
            ) : filteredTx.map((tx) => {
              const badge = getBadge(tx.type, tx.status);
              const isExpanded = expandedTxId === tx.id;
              const isCredit = tx.type === 'TOP-UP' || tx.type === 'REFUNDED';

              const isDownloading = downloadingReceiptId === (tx.mongoId || tx.id);
              const canDownloadReceipt = tx.status === 'SUCCESS' && tx.type === 'TOP-UP';

              return (
                <div key={tx.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  {/* Main row */}
                  <div
                    onClick={() => toggleExpand(tx.id)}
                    style={{
                      display: 'grid', gridTemplateColumns: '120px 140px 1fr 120px 110px 140px',
                      alignItems: 'center', padding: '0.95rem 1.5rem',
                      cursor: 'pointer', transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,35,102,0.012)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* ID */}
                    <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {String(tx.id).slice(0, 10)}…
                    </div>

                    {/* Date */}
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      <span style={{ display: 'block' }}>{new Date(tx.date).toLocaleDateString('en-IN')}</span>
                      <span style={{ fontSize: '0.7rem' }}>{new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Description */}
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-brand-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '0.5rem' }}>
                      {tx.title}
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, fontSize: '0.9rem', color: isCredit ? '#10b981' : '#ef4444' }}>
                      {isCredit ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                    </div>

                    {/* Status badge */}
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ display: 'inline-block', padding: '0.2rem 0.65rem', fontSize: '0.68rem', fontWeight: 700, borderRadius: '20px', background: badge.bg, color: badge.color, border: `1.5px solid ${badge.border}` }}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Actions — inline receipt download for SUCCESS top-ups */}
                    <div style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                      {canDownloadReceipt ? (
                        <button
                          onClick={() => handleDownloadReceipt(tx)}
                          disabled={isDownloading}
                          style={{
                            padding: '0.3rem 0.7rem',
                            background: isDownloading ? 'rgba(0,35,102,0.05)' : '#fff',
                            border: '1.5px solid var(--color-brand-primary)',
                            borderRadius: '8px', cursor: isDownloading ? 'not-allowed' : 'pointer',
                            fontWeight: 700, fontSize: '0.72rem',
                            color: 'var(--color-brand-primary)',
                            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            transition: 'all 0.15s', opacity: isDownloading ? 0.7 : 1,
                          }}
                          onMouseEnter={e => { if (!isDownloading) e.currentTarget.style.background = 'rgba(0,35,102,0.06)'; }}
                          onMouseLeave={e => { if (!isDownloading) e.currentTarget.style.background = '#fff'; }}
                        >
                          {isDownloading ? (
                            <>
                              <div style={{ width: '10px', height: '10px', border: '2px solid rgba(0,35,102,0.2)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                              Generating…
                            </>
                          ) : (
                            <>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                              Receipt PDF
                            </>
                          )}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                          {tx.status === 'PENDING' ? 'Pending…' : tx.status === 'FAILED' ? '—' : '—'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expandable detail drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '1.25rem 1.5rem 1.5rem', background: 'var(--color-surface-bg)', borderTop: '1px solid var(--color-border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.5rem' }}>
                          {/* Transaction IDs */}
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <strong style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-rich)', marginBottom: '0.1rem' }}>Transaction Details</strong>
                            <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}><strong>Order ID:</strong> {tx.razorpayOrderId || tx.id}</span>
                            {tx.razorpayPaymentId && (
                              <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}><strong>Payment ID:</strong> {tx.razorpayPaymentId}</span>
                            )}
                            <span><strong>Mode:</strong> Razorpay (Online Payment)</span>
                          </div>
                          {/* Payment breakdown */}
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                            <strong style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-rich)', marginBottom: '0.1rem' }}>Payment Breakdown</strong>
                            <span><strong>Amount Paid:</strong> ₹{tx.amount.toLocaleString('en-IN')}</span>
                            {tx.coinsAdded != null && (
                              <span><strong>Coins Credited:</strong> {tx.coinsAdded.toLocaleString('en-IN')} BidKar Coins</span>
                            )}
                            <span style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.15rem' }}>Conversion: ₹1 = 1 BidKar Coin</span>
                            <span><strong>Status:</strong> {tx.status}</span>
                          </div>
                          {/* Receipt download (in drawer) */}
                          {canDownloadReceipt && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: '0.25rem' }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDownloadReceipt(tx); }}
                                disabled={isDownloading}
                                style={{
                                  padding: '0.55rem 1rem', background: '#fff',
                                  border: '1.5px solid var(--color-border-subtle)',
                                  borderRadius: '10px', cursor: isDownloading ? 'not-allowed' : 'pointer',
                                  fontWeight: 700, fontSize: '0.78rem',
                                  color: 'var(--color-brand-primary)',
                                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                                  transition: 'all 0.15s', opacity: isDownloading ? 0.7 : 1,
                                }}
                                onMouseEnter={e => { if (!isDownloading) { e.currentTarget.style.borderColor = 'var(--color-brand-primary)'; e.currentTarget.style.background = 'rgba(0,35,102,0.03)'; } }}
                                onMouseLeave={e => { if (!isDownloading) { e.currentTarget.style.borderColor = 'var(--color-border-subtle)'; e.currentTarget.style.background = '#fff'; } }}
                              >
                                {isDownloading ? (
                                  <>
                                    <div style={{ width: '11px', height: '11px', border: '2px solid rgba(0,35,102,0.15)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    Generating PDF…
                                  </>
                                ) : (
                                  <>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                    Download Receipt (PDF)
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Footer count */}
          {!isLoading && filteredTx.length > 0 && (
            <div style={{ padding: '0.85rem 1.5rem', background: 'var(--color-surface-bg)', borderTop: '1px solid var(--color-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              <span>Showing {filteredTx.length} of {transactions.length} transactions</span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-brand-primary)', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
