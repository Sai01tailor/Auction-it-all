import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createCustomItem } from '../services/auctionService';
import { useAuth } from '../Context/AuthContext';
import Header from '../Components/Global/Header';
import AuthController from '../Components/Global/AuthController';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Multi-step index (1, 2, 3)
  const [step, setStep] = useState(1);

  // Form Field States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Luxury Watches');
  const [description, setDescription] = useState('');
  const [meetingPoint, setMeetingPoint] = useState('');
  const [photos, setPhotos] = useState([]); // File objects
  const [photoPreviews, setPhotoPreviews] = useState([]); // Base64 or objectURLs
  const [auctionType, setAuctionType] = useState('ENGLISH'); // ENGLISH | DUTCH | BLIND

  // English details
  const [startingPrice, setStartingPrice] = useState('50000');
  const [reservePrice, setReservePrice] = useState('75000');
  const [bidIncrement, setBidIncrement] = useState('2500');

  // Dutch details
  const [dutchStartingPrice, setDutchStartingPrice] = useState('100000');
  const [priceFloor, setPriceFloor] = useState('45000');
  const [dropAmount, setDropAmount] = useState('5000');
  const [dropInterval, setDropInterval] = useState('30'); // in seconds

  // Blind details
  const [blindStartingPrice, setBlindStartingPrice] = useState('40000');
  const [revealTimeOffset, setRevealTimeOffset] = useState('60'); // minutes after deadline

  // General Timing
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // UI States
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  };

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    const updatedPhotos = [...photos, ...newFiles].slice(0, 5); // limit to 5
    setPhotos(updatedPhotos);

    // Generate previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviews([...photoPreviews, ...newPreviews].slice(0, 5));
  };

  const removePhoto = (index) => {
    const updatedPhotos = [...photos];
    updatedPhotos.splice(index, 1);
    setPhotos(updatedPhotos);

    const updatedPreviews = [...photoPreviews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setPhotoPreviews(updatedPreviews);
  };

  // 10% Deposit calculation example (calculated from startingPrice)
  const getDepositExample = () => {
    let basePrice = 0;
    if (auctionType === 'ENGLISH') basePrice = Number(startingPrice) || 0;
    else if (auctionType === 'DUTCH') basePrice = Number(dutchStartingPrice) || 0;
    else if (auctionType === 'BLIND') basePrice = Number(blindStartingPrice) || 0;
    return Math.floor(basePrice * 0.10);
  };

  const validateStep1 = () => {
    if (!title.trim()) return 'Title is required';
    if (!description.trim()) return 'Description is required';
    if (!meetingPoint.trim()) return 'Handoff meeting point is required';
    if (photos.length === 0) return 'At least one photo is required';
    return '';
  };

  const handleNextStep = () => {
    setErrorMessage('');
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMessage(err);
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // Validate times
      const now = new Date();
      const start = startTime ? new Date(startTime) : now;
      const end = new Date(endTime);

      if (start < new Date(now.getTime() - 5 * 60 * 1000)) { // allow 5 min clock skew
        throw new Error('Start time cannot be in the past');
      }
      if (end <= start) {
        throw new Error('End time must be after the start time');
      }

      // Format custom fields and validate prices based on type
      let finalStartingPrice = 0;
      const customFields = {
        auctionType,
        meetingPoint,
      };

      if (auctionType === 'ENGLISH') {
        finalStartingPrice = Number(startingPrice);
        const reserve = Number(reservePrice);
        const increment = Number(bidIncrement);

        if (!finalStartingPrice || finalStartingPrice <= 0) throw new Error('Starting price must be greater than 0');
        if (reserve && reserve < finalStartingPrice) throw new Error('Reserve price cannot be less than starting price');
        if (!increment || increment <= 0) throw new Error('Bid increment must be greater than 0');

        customFields.reservePrice = reserve;
        customFields.bidIncrement = increment;
      } else if (auctionType === 'DUTCH') {
        finalStartingPrice = Number(dutchStartingPrice);
        const floor = Number(priceFloor);
        const dropAmt = Number(dropAmount);
        const interval = Number(dropInterval);

        if (!finalStartingPrice || finalStartingPrice <= 0) throw new Error('Starting price must be greater than 0');
        if (floor >= finalStartingPrice) throw new Error('Price floor must be strictly less than the starting price');
        if (floor <= 0) throw new Error('Price floor must be greater than 0');
        if (!dropAmt || dropAmt <= 0) throw new Error('Drop amount must be greater than 0');
        if (!interval || interval <= 0) throw new Error('Drop interval must be greater than 0');

        customFields.priceFloor = floor;
        customFields.dropAmount = dropAmt;
        customFields.dropInterval = interval;
        customFields.currentQuantity = 1;
      } else if (auctionType === 'BLIND') {
        finalStartingPrice = Number(blindStartingPrice);
        const offset = Number(revealTimeOffset);

        if (!finalStartingPrice || finalStartingPrice <= 0) throw new Error('Starting price must be greater than 0');
        if (!offset || offset <= 0) throw new Error('Reveal offset must be greater than 0 minutes');

        customFields.revealTime = new Date(end.getTime() + offset * 60 * 1000).toISOString();
        customFields.submissionDeadline = end.toISOString();
      }

      // Assemble Multipart FormData
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('startingPrice', String(finalStartingPrice));
      formData.append('startTime', start.toISOString());
      formData.append('endTime', end.toISOString());

      // Append all custom fields directly to the FormData payload
      Object.keys(customFields).forEach(key => {
        formData.append(key, String(customFields[key]));
      });

      // Append files matching the "photos" key on server
      photos.forEach(file => {
        formData.append('photos', file);
      });

      // Submit API call
      const res = await createCustomItem(formData);
      if (res.success) {
        navigate('/seller/studio');
      } else {
        throw new Error(res.message || 'Failed to list item');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom styling elements to enforce deep navy and gold focus rings
  const inputStyle = {
    height: '46px',
    borderRadius: '10px',
    border: '1px solid var(--color-border-subtle)',
    padding: '0 1rem',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-surface-bg)' }}>
      <AuthController />
      <Header />

      <div style={{ maxWidth: '720px', margin: '3rem auto', padding: '0 1.5rem' }}>
        
        {/* Step Indicator Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-brand-accent-dark)', fontWeight: 800 }}>
              SELLER PLATINUM SUITE
            </span>
            <h1 style={{ margin: '0.2rem 0 0', fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-brand-primary)' }}>
              Launch New Auction
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: step === i
                    ? 'var(--color-brand-primary)'
                    : step > i ? 'var(--color-brand-accent)' : '#fff',
                  color: step === i ? '#fff' : 'var(--color-brand-primary)',
                  border: '1.5px solid var(--color-brand-primary)',
                  boxShadow: step === i ? '0 0 10px rgba(0,35,102,0.2)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {i}
              </div>
            ))}
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div style={{
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Multi-step Container */}
        <div style={{
          background: '#fff',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '24px',
          boxShadow: '0 10px 30px rgba(0,35,102,0.03)',
          overflow: 'hidden',
          padding: '2rem',
        }}>
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--color-brand-primary)' }}>
                    Step 1: Item & Logistical Basics
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0' }}>
                    Provide premium details and coordinates for authentication & handoff.
                  </p>
                </div>

                <div>
                  <label htmlFor="item-title" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                    Item Title
                  </label>
                  <input
                    id="item-title"
                    type="text"
                    placeholder="e.g. Vintage Rolex Cosmograph Daytona 1988"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                  <div>
                    <label htmlFor="item-category" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                      Category
                    </label>
                    <select
                      id="item-category"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      style={{ ...inputStyle, background: '#fff' }}
                    >
                      <option value="Luxury Watches">Luxury Watches</option>
                      <option value="Fine Art & Sculpture">Fine Art & Sculpture</option>
                      <option value="Rare Coins & Bullion">Rare Coins & Bullion</option>
                      <option value="Vintage Vehicles">Vintage Vehicles</option>
                      <option value="Haute Couture">Haute Couture</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="item-desc" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                    Description
                  </label>
                  <textarea
                    id="item-desc"
                    rows={4}
                    placeholder="Describe craftsmanship, rarity, visual flaws, and box/papers availability..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    style={{
                      width: '100%',
                      borderRadius: '10px',
                      border: '1px solid var(--color-border-subtle)',
                      padding: '0.8rem 1rem',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="item-meeting" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                    Offline Handoff Meeting Point (India Escrow Coordination)
                  </label>
                  <input
                    id="item-meeting"
                    type="text"
                    placeholder="e.g. Tanishq Showroom showroom, Surat Station Road, Gujarat"
                    value={meetingPoint}
                    onChange={e => setMeetingPoint(e.target.value)}
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                    Note: To preserve trust and security, final payment handoff takes place in person at this coordinate.
                  </span>
                </div>

                {/* Drag and Drop Zone */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                    Media Uploads (Max 5 High-res Photos)
                  </label>
                  
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-uploader').click()}
                    style={{
                      border: isDragOver
                        ? '2px dashed var(--color-brand-accent)'
                        : '2.5px dashed var(--color-border-subtle)',
                      borderRadius: '16px',
                      padding: '2rem 1rem',
                      textAlign: 'center',
                      background: isDragOver ? 'rgba(254, 206, 68, 0.04)' : 'var(--color-surface-bg)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: isDragOver ? '0 0 15px rgba(254,206,68,0.2)' : 'none',
                    }}
                    className={isDragOver ? 'animate-pulse' : ''}
                  >
                    <input
                      id="file-uploader"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-brand-primary)' }}>
                      {isDragOver ? 'Drop items now!' : 'Drag & Drop photos here'}
                    </p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      or click to browse your desktop files (supports JPG, PNG up to 10MB)
                    </p>
                  </div>

                  {/* Thumbnail Preview Area */}
                  {photoPreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                      {photoPreviews.map((previewUrl, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            width: '72px',
                            height: '72px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            border: '1.5px solid var(--color-border-subtle)',
                          }}
                        >
                          <img
                            src={previewUrl}
                            alt={`preview-${idx}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              right: '2px',
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              fontSize: '0.65rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              cursor: 'pointer',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  style={{
                    height: '46px',
                    borderRadius: '10px',
                    fontWeight: 700,
                    width: '100%',
                    marginTop: '0.5rem',
                  }}
                >
                  Continue to Auction Format
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--color-brand-primary)' }}>
                    Step 2: Choose Auction Format
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0' }}>
                    Select how buyers will compete for your luxury item.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  {/* English Format Card */}
                  <div
                    onClick={() => setAuctionType('ENGLISH')}
                    style={{
                      border: '2px solid ' + (auctionType === 'ENGLISH' ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)'),
                      borderRadius: '16px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      background: auctionType === 'ENGLISH' ? 'rgba(0,35,102,0.02)' : '#fff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-brand-primary)' }}>🟢 English Rising Auction</strong>
                      <input
                        type="radio"
                        checked={auctionType === 'ENGLISH'}
                        onChange={() => setAuctionType('ENGLISH')}
                        style={{ accentColor: 'var(--color-brand-primary)' }}
                      />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Traditional format. Price climbs as buyers bid against one another. Starting price rises dynamically with each bid.
                    </p>
                  </div>

                  {/* Dutch Format Card */}
                  <div
                    onClick={() => setAuctionType('DUTCH')}
                    style={{
                      border: '2px solid ' + (auctionType === 'DUTCH' ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)'),
                      borderRadius: '16px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      background: auctionType === 'DUTCH' ? 'rgba(0,35,102,0.02)' : '#fff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-brand-primary)' }}>⚡ Dutch Falling Ticker</strong>
                      <input
                        type="radio"
                        checked={auctionType === 'DUTCH'}
                        onChange={() => setAuctionType('DUTCH')}
                        style={{ accentColor: 'var(--color-brand-primary)' }}
                      />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Descending ticker. Price drops by set amounts at regular intervals. First bidder to click 'BUY NOW' claims the item instantly.
                    </p>
                  </div>

                  {/* Blind Format Card */}
                  <div
                    onClick={() => setAuctionType('BLIND')}
                    style={{
                      border: '2px solid ' + (auctionType === 'BLIND' ? 'var(--color-brand-primary)' : 'var(--color-border-subtle)'),
                      borderRadius: '16px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      background: auctionType === 'BLIND' ? 'rgba(0,35,102,0.02)' : '#fff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-brand-primary)' }}>🔒 Sealed Blind Bid</strong>
                      <input
                        type="radio"
                        checked={auctionType === 'BLIND'}
                        onChange={() => setAuctionType('BLIND')}
                        style={{ accentColor: 'var(--color-brand-primary)' }}
                      />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Silent pricing. Bids are submitted privately. The deadline triggers a sealed reveal, and the highest sealed offer wins.
                    </p>
                  </div>

                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    style={{
                      height: '46px',
                      borderRadius: '10px',
                      background: 'var(--color-surface-bg)',
                      border: '1.5px solid var(--color-border-subtle)',
                      color: 'var(--color-text-rich)',
                      fontWeight: 700,
                      flex: 1,
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    style={{
                      height: '46px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      flex: 2,
                    }}
                  >
                    Proceed to Pricing Rules
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--color-brand-primary)' }}>
                    Step 3: Pricing Rules & Schedule
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: '0.2rem 0 0' }}>
                    Configure the bid limits and time window.
                  </p>
                </div>

                {/* ENGLISH PRICING FIELDS */}
                {auctionType === 'ENGLISH' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label htmlFor="eng-start" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                          Starting Price (₹)
                        </label>
                        <input
                          id="eng-start"
                          type="number"
                          value={startingPrice}
                          onChange={e => setStartingPrice(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label htmlFor="eng-reserve" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                          Reserve Price (₹)
                        </label>
                        <input
                          id="eng-reserve"
                          type="number"
                          value={reservePrice}
                          onChange={e => setReservePrice(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="eng-incr" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                        Smart Increment Step (₹)
                      </label>
                      <input
                        id="eng-incr"
                        type="number"
                        value={bidIncrement}
                        onChange={e => setBidIncrement(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}

                {/* DUTCH PRICING FIELDS */}
                {auctionType === 'DUTCH' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label htmlFor="dutch-start" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                          Starting Price (₹)
                        </label>
                        <input
                          id="dutch-start"
                          type="number"
                          value={dutchStartingPrice}
                          onChange={e => setDutchStartingPrice(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label htmlFor="dutch-floor" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                          Price Floor (₹)
                        </label>
                        <input
                          id="dutch-floor"
                          type="number"
                          value={priceFloor}
                          onChange={e => setPriceFloor(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                      <div>
                        <label htmlFor="dutch-drop" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                          Drop Amount per Interval (₹)
                        </label>
                        <input
                          id="dutch-drop"
                          type="number"
                          value={dropAmount}
                          onChange={e => setDropAmount(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label htmlFor="dutch-interval" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                          Interval (Seconds)
                        </label>
                        <input
                          id="dutch-interval"
                          type="number"
                          value={dropInterval}
                          onChange={e => setDropInterval(e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* BLIND PRICING FIELDS */}
                {auctionType === 'BLIND' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label htmlFor="blind-start" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                        Minimum Acceptable Starting Price (₹)
                      </label>
                      <input
                        id="blind-start"
                        type="number"
                        value={blindStartingPrice}
                        onChange={e => setBlindStartingPrice(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label htmlFor="blind-reveal" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                        Reveal Wait Offset (Minutes after submission ends)
                      </label>
                      <input
                        id="blind-reveal"
                        type="number"
                        value={revealTimeOffset}
                        onChange={e => setRevealTimeOffset(e.target.value)}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                )}

                {/* TIMING CONFIG */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label htmlFor="auc-start-time" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                      Start Time
                    </label>
                    <input
                      id="auc-start-time"
                      type="datetime-local"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="auc-end-time" style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--color-brand-primary)' }}>
                      End Time (Deadline)
                    </label>
                    <input
                      id="auc-end-time"
                      type="datetime-local"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* 10% Deposit calculation display box */}
                <div style={{
                  background: 'var(--color-surface-bg)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '16px',
                  padding: '1.25rem',
                }}>
                  <strong style={{ fontSize: '0.82rem', display: 'block', color: 'var(--color-brand-primary)', marginBottom: '0.2rem' }}>
                    ⚖️ Escrow 10% Verification Policy
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: '1.4', display: 'block' }}>
                    To ensure bidding integrity, all participating buyers must secure a 10% wallet reserve. 
                    Based on your starting configuration, bidders are required to lock a deposit of{' '}
                    <strong style={{ color: 'var(--color-brand-primary)' }}>
                      ₹{getDepositExample().toLocaleString('en-IN')}
                    </strong>{' '}
                    in cash escrow before placing an offer.
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                    style={{
                      height: '46px',
                      borderRadius: '10px',
                      background: 'var(--color-surface-bg)',
                      border: '1.5px solid var(--color-border-subtle)',
                      color: 'var(--color-text-rich)',
                      fontWeight: 700,
                      flex: 1,
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={{
                      height: '46px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, var(--color-brand-primary), #1a3c7a)',
                      color: '#fff',
                      flex: 2,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSubmitting ? 'Uploading to cloud...' : '🚀 Authorize & List Item'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
