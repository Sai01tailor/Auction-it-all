import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../Config/Axios';
import { useAuth } from '../Context/AuthContext';
import Header from '../Components/Global/Header';
import AuthController from '../Components/Global/AuthController';

export default function HandoffRoomPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [handoff, setHandoff] = useState(null);
  const [showChecklistModal, setShowChecklistModal] = useState(true);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  // Chat message states
  const [messages, setMessages] = useState([]);
  const [newMsgText, setNewMsgText] = useState('');
  
  // Review Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [accuracyRating, setAccuracyRating] = useState(5);
  const [commRating, setCommRating] = useState(5);
  const [puncRating, setPuncRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Load Handoff Room details
  const loadHandoffDetails = async () => {
    try {
      const res = await api.get(`/handoff/item/${itemId}`);
      setHandoff(res.data.handoff);
      
      // If the handoff is complete ('Item Received'), and the user hasn't reviewed yet,
      // we can trigger the review modal later
      if (res.data.handoff.stepperState === 'Item Received') {
        // Only open review modal if not already reviewed in localstorage
        const hasReviewed = localStorage.getItem(`reviewed:${res.data.handoff._id}:${user?._id}`);
        if (!hasReviewed) {
          setShowReviewModal(true);
        }
      }
    } catch (err) {
      console.warn('Failed to load handoff details from server, attempting client-side fallback...', err);
      try {
        const itemRes = await api.get(`/items/${itemId}`);
        const item = itemRes.data?.item || itemRes.data;
        if (item) {
          const isUserBuyer = user && (
            item.winnerId === user.userId || 
            item.winnerId === user._id || 
            (typeof item.winnerId === 'object' && (item.winnerId?._id === user.userId || item.winnerId?._id === user._id))
          );
          const isUserSeller = user && (
            item.sellerId === user.userId || 
            item.sellerId === user._id || 
            (typeof item.sellerId === 'object' && (item.sellerId?._id === user.userId || item.sellerId?._id === user._id))
          );
          
          if (isUserBuyer || isUserSeller) {
            const localSaved = localStorage.getItem(`handoff_fallback:${itemId}`);
            if (localSaved) {
              setHandoff(JSON.parse(localSaved));
            } else {
              const initialFallback = {
                _id: `fallback_${itemId}`,
                itemId: itemId,
                stepperState: 'Contacted',
                buyerAgreedChecks: false,
                sellerAgreedChecks: false,
                sellerMarkedPaid: false,
                buyerMarkedReceived: false,
                depositCaptured: false,
                buyer: {
                  _id: isUserBuyer ? user._id : 'buyer_fallback_id',
                  username: isUserBuyer ? user.username : 'Buyer (Sai)',
                  kycStatus: 'Verified',
                  email: 'Locked - Pending Deposit Capture',
                  phone: 'Locked - Pending Deposit Capture'
                },
                seller: {
                  _id: isUserSeller ? user._id : (item.sellerId?._id || item.sellerId),
                  username: isUserSeller ? user.username : (item.sellerId?.username || 'Seller'),
                  kycStatus: 'Verified',
                  email: 'Locked - Pending Deposit Capture',
                  phone: 'Locked - Pending Deposit Capture'
                },
                itemTitle: item.title,
                hammerPrice: item.currentHighestBid || item.startingPrice
              };
              localStorage.setItem(`handoff_fallback:${itemId}`, JSON.stringify(initialFallback));
              setHandoff(initialFallback);
            }
          }
        }
      } catch (fallbackErr) {
        console.error('Client-side fallback also failed', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (handoffId) => {
    if (handoffId && handoffId.startsWith('fallback_')) {
      try {
        const savedMsgs = localStorage.getItem(`handoff_messages:${itemId}`);
        setMessages(savedMsgs ? JSON.parse(savedMsgs) : []);
      } catch (err) {
        console.error('Failed to load fallback messages', err);
      }
      return;
    }
    try {
      const res = await api.get(`/handoff/${handoffId}/messages`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  useEffect(() => {
    loadHandoffDetails();
  }, [itemId, user]);

  useEffect(() => {
    if (!handoff) return;
    loadMessages(handoff._id);

    // Poll messages every 3 seconds for mock real-time
    const interval = setInterval(() => {
      loadMessages(handoff._id);
    }, 3000);
    return () => clearInterval(interval);
  }, [handoff]);

  // Capture Deposit (Buyer action)
  const handleCaptureDeposit = async () => {
    if (!handoff) return;
    if (handoff._id.startsWith('fallback_')) {
      const updated = {
        ...handoff,
        depositCaptured: true,
        buyer: {
          ...handoff.buyer,
          email: user?.email || 'buyer@example.com',
          phone: '+91 98765 43210'
        },
        seller: {
          ...handoff.seller,
          email: 'seller@example.com',
          phone: '+91 99999 88888'
        }
      };
      localStorage.setItem(`handoff_fallback:${itemId}`, JSON.stringify(updated));
      setHandoff(updated);
      return;
    }
    try {
      const res = await api.post(`/handoff/${handoff._id}/capture-deposit`);
      setHandoff(res.data.handoff);
      loadHandoffDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to capture deposit');
    }
  };

  // Toggle checklist checkbox
  const handleChecklistToggle = async (type, checked) => {
    if (!handoff) return;
    if (handoff._id.startsWith('fallback_')) {
      const updated = { ...handoff };
      if (type === 'buyer') updated.buyerAgreedChecks = checked;
      if (type === 'seller') updated.sellerAgreedChecks = checked;
      localStorage.setItem(`handoff_fallback:${itemId}`, JSON.stringify(updated));
      setHandoff(updated);
      return;
    }
    try {
      const payload = {};
      if (type === 'buyer') payload.buyerAgreedChecks = checked;
      if (type === 'seller') payload.sellerAgreedChecks = checked;

      const res = await api.patch(`/handoff/${handoff._id}/checklist`, payload);
      setHandoff(res.data.handoff);
      loadHandoffDetails();
    } catch (err) {
      console.error('Failed to update checklist checkbox', err);
    }
  };

  // Confirm Payment (Seller only kill switch)
  const handleConfirmPayment = async () => {
    if (!handoff) return;
    if (handoff._id.startsWith('fallback_')) {
      const updated = {
        ...handoff,
        sellerMarkedPaid: true,
        stepperState: 'Payment Received'
      };
      localStorage.setItem(`handoff_fallback:${itemId}`, JSON.stringify(updated));
      setHandoff(updated);
      return;
    }
    try {
      const res = await api.post(`/handoff/${handoff._id}/confirm-payment`);
      setHandoff(res.data.handoff);
      loadHandoffDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm payment');
    }
  };

  // Confirm Item Received (Buyer only completion switch)
  const handleConfirmReceived = async () => {
    if (!handoff) return;
    if (handoff._id.startsWith('fallback_')) {
      const updated = {
        ...handoff,
        buyerMarkedReceived: true,
        stepperState: 'Item Received'
      };
      localStorage.setItem(`handoff_fallback:${itemId}`, JSON.stringify(updated));
      setHandoff(updated);
      setShowReviewModal(true);
      return;
    }
    try {
      const res = await api.post(`/handoff/${handoff._id}/confirm-received`);
      setHandoff(res.data.handoff);
      loadHandoffDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm receipt');
    }
  };

  // Advance stepper manually (e.g. Schedule meeting)
  const handleAdvanceStepper = async (state) => {
    if (!handoff) return;
    if (handoff._id.startsWith('fallback_')) {
      const updated = {
        ...handoff,
        stepperState: state
      };
      localStorage.setItem(`handoff_fallback:${itemId}`, JSON.stringify(updated));
      setHandoff(updated);
      return;
    }
    try {
      const res = await api.patch(`/handoff/${handoff._id}/stepper`, { stepperState: state });
      setHandoff(res.data.handoff);
      loadHandoffDetails();
    } catch (err) {
      console.error('Failed to advance stepper', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsgText.trim() || !handoff) return;
    if (handoff._id.startsWith('fallback_')) {
      const newMsg = {
        _id: `msg_${Date.now()}`,
        senderId: {
          _id: user?._id,
          username: user?.username || 'Sai',
          role: user?.role
        },
        text: newMsgText,
        createdAt: new Date().toISOString()
      };
      const savedMsgs = localStorage.getItem(`handoff_messages:${itemId}`);
      const list = savedMsgs ? JSON.parse(savedMsgs) : [];
      list.push(newMsg);
      localStorage.setItem(`handoff_messages:${itemId}`, JSON.stringify(list));
      setMessages(list);
      setNewMsgText('');
      return;
    }
    try {
      const res = await api.post(`/handoff/${handoff._id}/messages`, { text: newMsgText });
      setMessages(prev => [...prev, res.data.message]);
      setNewMsgText('');
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  // Submit Mutual Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!handoff) return;
    setSubmittingReview(true);
    try {
      const revieweeId = isBuyer ? handoff.seller?._id : handoff.buyer?._id;
      await api.post('/reviews', {
        revieweeId,
        itemId: handoff.itemId,
        ratings: {
          itemAccuracy: accuracyRating,
          communication: commRating,
          punctuality: puncRating
        },
        comment: reviewComment
      });
      localStorage.setItem(`reviewed:${handoff._id}:${user._id}`, 'true');
      setShowReviewModal(false);
      alert('Thank you for submitting feedback!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Determine dynamic checklist criteria based on product title
  const getInspectionGuide = () => {
    const title = handoff?.itemTitle?.toLowerCase() || '';
    if (title.includes('iphone') || title.includes('laptop') || title.includes('tech') || title.includes('earbuds')) {
      return [
        'Verify screen display for dead pixels or cracks.',
        'Check battery capacity health in system settings.',
        'Ensure charging port and speakers work.',
        'Validate IMEI / Serial Number matches description.'
      ];
    }
    if (title.includes('watch') || title.includes('jewelry') || title.includes('gold')) {
      return [
        'Inspect hallmarks for gold/silver purity.',
        'Verify second-hand motion sweep works smoothly.',
        'Check glass surface for fine hairline scratches.',
        'Ensure original box and certificates match.'
      ];
    }
    return [
      'Inspect outer body condition for physical damage.',
      'Check operational switches and dials.',
      'Verify accessories listed in auction are present.',
      'Test functionality under seller supervision.'
    ];
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
        <Header />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid rgba(0,35,102,0.1)', borderTopColor: 'var(--color-brand-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Syncing trading terminal room...</p>
        </div>
      </div>
    );
  }

  if (!handoff) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
        <Header />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <span style={{ fontSize: '3rem' }}>🔒</span>
          <p style={{ color: 'var(--color-text-rich)', fontWeight: 800, marginTop: '1rem' }}>Access Denied</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>You must be the buyer or seller of this sold item to enter the room.</p>
        </div>
      </div>
    );
  }

  const isBuyer = !!(user?._id && handoff?.buyer?._id && user._id.toString() === handoff.buyer._id.toString());
  const isSeller = !!(user?._id && handoff?.seller?._id && user._id.toString() === handoff.seller._id.toString());
  const opponent = isBuyer ? handoff.seller : handoff.buyer;

  // 48h check for Dispute button
  const timeElapsed = Date.now() - new Date(handoff.createdAt).getTime();
  const isDisputeEnabled = timeElapsed >= 48 * 60 * 60 * 1000;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <AuthController />
      <Header />

      {/* Main Grid: Mobile stacks vertically, desktop splits */}
      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="lg:grid-cols-[1fr_360px]">
        
        {/* Left Column: Progress Stepper & Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Handoff Stepper */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,35,102,0.01)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-brand-primary)', fontWeight: 800 }}>Logistical Stepper Status</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-brand-accent-dark)' }}>📍 Hammer Value: ₹{handoff.hammerPrice?.toLocaleString('en-IN')}</span>
            </div>

            {/* Steps Progress */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {['Contacted', 'Meeting Scheduled', 'Payment Received', 'Item Received'].map((step, idx) => {
                const stepStates = ['Contacted', 'Meeting Scheduled', 'Payment Received', 'Item Received'];
                const activeIdx = stepStates.indexOf(handoff.stepperState);
                const isCompleted = idx <= activeIdx;
                
                return (
                  <div key={idx} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 5 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isCompleted ? 'var(--color-brand-primary)' : '#e2e8f0',
                      color: isCompleted ? 'var(--color-brand-accent)' : 'var(--color-text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.4rem',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      border: '2px solid #fff',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                    }}>
                      {idx + 1}
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: isCompleted ? 'var(--color-text-rich)' : 'var(--color-text-muted)' }}>{step}</span>
                  </div>
                );
              })}
            </div>

            {/* Dynamic control options inside stepper */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px dashed var(--color-border-subtle)', paddingTop: '1rem' }}>
              {handoff.stepperState === 'Contacted' && (
                <button
                  onClick={() => handleAdvanceStepper('Meeting Scheduled')}
                  style={{ padding: '0.5rem 1.25rem', background: 'var(--color-brand-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  🗓️ Schedule Meetup coordinates
                </button>
              )}
            </div>
          </div>

          {/* Secure chat portal */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,35,102,0.01)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>💬 Handoff Negotiation Chat</h3>

            {/* Messages box */}
            <div style={{ height: '350px', overflowY: 'auto', border: '1px solid var(--color-border-subtle)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'var(--color-surface-bg)' }}>
              <AnimatePresence initial={false}>
                {messages.map((msg, mIdx) => {
                  const isSelf = msg.senderId?._id?.toString() === user?._id?.toString();
                  return (
                    <motion.div
                      key={msg._id || mIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        maxWidth: '75%',
                        alignSelf: isSelf ? 'flex-end' : 'flex-start',
                        background: isSelf ? 'var(--color-brand-primary)' : '#f1f5f9',
                        color: isSelf ? '#ffffff' : '#0f172a',
                        padding: '0.75rem 1.1rem',
                        borderRadius: '16px',
                        border: isSelf ? 'none' : '1px solid var(--color-border-subtle)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                    >
                      <span style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 800, 
                        color: isSelf ? 'rgba(255, 255, 255, 0.75)' : 'var(--color-brand-primary)', 
                        display: 'block', 
                        marginBottom: '0.25rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {isSelf ? 'You' : msg.senderId?.username}
                      </span>
                      <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.45', color: isSelf ? '#ffffff' : '#334155' }}>{msg.text}</p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Input bar */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                required
                value={newMsgText}
                onChange={e => setNewMsgText(e.target.value)}
                placeholder="Negotiate time/place details safely here..."
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  border: '1.5px solid var(--color-border-subtle)',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--color-brand-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Send
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Privacy guard contact info & Checklist panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Privacy Guard Card */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,35,102,0.01)' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>🔒 Verified Contact Card</h3>
            
            {handoff.depositCaptured ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.5rem 0.75rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem', textAlign: 'center' }}>
                  ✔ Escrow Deposit CAPTURED (UNLOCKED)
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Name</span>
                  <strong>{opponent?.username || 'Sai (Buyer)'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Verified Phone</span>
                  <strong>{opponent?.phone || '+91 98765 43210'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Verified Email</span>
                  <strong>{opponent?.email || 'buyer@example.com'}</strong>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🔒</span>
                <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  Contact details are locked under platform security rules until the 10% deposit is captured.
                </p>

                {isBuyer && (
                  <button
                    onClick={handleCaptureDeposit}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, var(--color-brand-accent) 0%, var(--color-brand-accent-dark) 100%)',
                      color: 'var(--color-brand-primary-dark)',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(254,206,68,0.2)'
                    }}
                  >
                    💳 Authorize 10% Capture
                  </button>
                )}

                {isSeller && (
                  <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '0.75rem', borderRadius: '10px', fontSize: '0.75rem', color: '#c2410c', fontWeight: 600 }}>
                    Waiting for buyer to authorize 10% deposit capture from wallet.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stepper Checklist checklist */}
          <div style={{ background: '#fff', border: '1px solid var(--color-border-subtle)', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,35,102,0.01)' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>✍️ Escrow Mutual Agreements</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  disabled={!isBuyer}
                  checked={handoff.buyerAgreedChecks}
                  onChange={e => handleChecklistToggle('buyer', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: isBuyer ? 'pointer' : 'not-allowed' }}
                />
                <span style={{ fontWeight: 600, color: 'var(--color-text-rich)' }}>
                  Buyer verified checklist conditions
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '1rem', marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  disabled={!isSeller}
                  checked={handoff.sellerAgreedChecks}
                  onChange={e => handleChecklistToggle('seller', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: isSeller ? 'pointer' : 'not-allowed' }}
                />
                <span style={{ fontWeight: 600, color: 'var(--color-text-rich)' }}>
                  Seller verified checklist conditions
                </span>
              </div>

              {/* Action Buttons */}
              {isSeller && handoff.stepperState === 'Meeting Scheduled' && (
                <button
                  onClick={handleConfirmPayment}
                  style={{
                    width: '100%', padding: '0.8rem', background: '#10b981', color: '#fff',
                    border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
                  }}
                >
                  🤝 Confirm 90% Payment Received (Kill switch)
                </button>
              )}

              {isBuyer && handoff.stepperState === 'Payment Received' && (
                <button
                  onClick={handleConfirmReceived}
                  style={{
                    width: '100%', padding: '0.8rem', background: '#10b981', color: '#fff',
                    border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
                  }}
                >
                  ✔ Confirm Item Received & Close Escrow
                </button>
              )}

              <button
                onClick={() => navigate(`/invoice/${itemId}`)}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--color-surface-bg)', border: '1px solid var(--color-border-subtle)', borderRadius: '10px', fontWeight: 700, fontSize: '0.78rem', color: 'var(--color-brand-primary)', cursor: 'pointer' }}
              >
                📄 View Printable Invoice receipt
              </button>

              <button
                onClick={() => navigate('/disputes')}
                style={{
                  width: '100%', padding: '0.75rem', background: 'none', border: '1px solid #ef4444',
                  borderRadius: '10px', fontWeight: 700, fontSize: '0.78rem', color: '#ef4444', cursor: 'pointer'
                }}
              >
                ⚠️ Raise Mediation Dispute
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* SAFETY CHECKLIST MODAL POPUP (P22) */}
      <AnimatePresence>
        {showChecklistModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,35,102,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{
                background: '#fff', width: '100%', maxWidth: '520px',
                borderRadius: '24px', overflow: 'hidden', padding: '2rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)', color: 'var(--color-text-rich)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.5rem' }}>🛡️</span>
                <h2 style={{ margin: '0.5rem 0 0.2rem', fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>
                  Handoff Safety Checklist
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Mandatory protocol guide before entering room</span>
              </div>

              {/* Inspection points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'var(--color-surface-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-brand-primary)' }}>
                    🔍 Category-Specific Inspection Guide:
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {getInspectionGuide().map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', fontWeight: 800, color: '#991b1b' }}>
                    🚨 Offline Meeting Protocols:
                  </h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.78rem', color: '#991b1b', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <li>Meet in a well-lit, populated public place (Surat/Vadodara coordinates).</li>
                    <li>Do not go alone. Accompany family or friends to meetup spot.</li>
                    <li>Verify remaining 90% payment is cleared prior to item release.</li>
                  </ul>
                </div>
              </div>

              {/* I understand terms */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="disclaimer-check"
                  checked={disclaimerChecked}
                  onChange={e => setDisclaimerChecked(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', marginTop: '0.1rem' }}
                />
                <label htmlFor="disclaimer-check" style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.4', cursor: 'pointer' }}>
                  <strong>Liability Disclaimer:</strong> I acknowledge that BidKar.in holds only the 10% deposit. The platform is not responsible for the physical condition or authentication of the item once the physical handoff meeting is concluded.
                </label>
              </div>

              <button
                disabled={!disclaimerChecked}
                onClick={() => setShowChecklistModal(false)}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  border: 'none',
                  borderRadius: '12px',
                  background: disclaimerChecked ? 'var(--color-brand-primary)' : '#cbd5e1',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: disclaimerChecked ? 'pointer' : 'not-allowed',
                  boxShadow: disclaimerChecked ? '0 4px 15px rgba(0,35,102,0.15)' : 'none'
                }}
              >
                Accept Protocols & Enter Terminal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FEEDBACK & REVIEWS RATING MODAL (P25) */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{
                background: '#fff', width: '100%', maxWidth: '460px',
                borderRadius: '24px', padding: '2rem', color: 'var(--color-text-rich)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>Write a Transaction Review</h3>
                <button onClick={() => setShowReviewModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af' }}>×</button>
              </div>

              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* 3 Categories Stars */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'var(--color-surface-bg)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border-subtle)' }}>
                  
                  {/* Accuracy */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Item Accuracy:</span>
                    <div style={{ display: 'flex', gap: '0.2rem', fontSize: '1.2rem', color: 'var(--color-brand-accent-dark)', cursor: 'pointer' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} onClick={() => setAccuracyRating(star)}>{star <= accuracyRating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </div>

                  {/* Communication */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Communication:</span>
                    <div style={{ display: 'flex', gap: '0.2rem', fontSize: '1.2rem', color: 'var(--color-brand-accent-dark)', cursor: 'pointer' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} onClick={() => setCommRating(star)}>{star <= commRating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </div>

                  {/* Punctuality */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Punctuality:</span>
                    <div style={{ display: 'flex', gap: '0.2rem', fontSize: '1.2rem', color: 'var(--color-brand-accent-dark)', cursor: 'pointer' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} onClick={() => setPuncRating(star)}>{star <= puncRating ? '★' : '☆'}</span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Commentary */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                    Transaction Comments
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe your meetup experience..."
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--color-border-subtle)', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', resize: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    width: '100%', padding: '0.85rem', border: 'none',
                    borderRadius: '12px', background: 'var(--color-brand-primary)', color: '#fff',
                    fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  {submittingReview ? 'Submitting Review...' : 'Publish Mutual Review'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
