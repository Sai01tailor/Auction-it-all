import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../../Config/Axios';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const { user, isInitializing } = useAuth();

  const [walletBalance, setWalletBalance] = useState(0);
  const [biddingPower, setBiddingPower] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);

  // ── Fetch balance from server — only when authenticated ──────────────────
  const fetchBalance = useCallback(async () => {
    try {
      const { data } = await api.get('/wallet/balance');
      if (data.success) {
        setWalletBalance(data.walletBalance ?? 0);
        setBiddingPower(data.biddingPower ?? (data.walletBalance ?? 0) * 10);
      }
    } catch (err) {
      // 401 = not authenticated; skip silently
      if (err?.response?.status !== 401) {
        console.warn('Wallet balance fetch failed:', err?.response?.status);
      }
    } finally {
      setIsLoadingWallet(false);
    }
  }, []);

  // ── Only fire when a real authenticated user is present ──────────────────
  useEffect(() => {
    if (isInitializing) return;   // wait for AuthContext to resolve the session
    if (!user) {
      // Guest — reset wallet to zero, don't hit the server
      setWalletBalance(0);
      setBiddingPower(0);
      setTransactions([]);
      return;
    }
    setIsLoadingWallet(true);
    fetchBalance();
  }, [user, isInitializing, fetchBalance]);


  // ── Add Funds (Top-Up) via real Razorpay integration ─────────────────────
  // Called AFTER Razorpay checkout succeeds, with payment verification ids.
  // If razorpay ids are not available (pre-integration), amount is still sent
  // and the server logs it as a manual credit.
  const addFunds = useCallback(async (amount, razorpayPaymentId = null, razorpayOrderId = null, razorpaySignature = null) => {
    const payload = { amount };
    if (razorpayPaymentId) payload.razorpayPaymentId = razorpayPaymentId;
    if (razorpayOrderId) payload.razorpayOrderId = razorpayOrderId;
    if (razorpaySignature) payload.razorpaySignature = razorpaySignature;

    const { data } = await api.post('/wallet/topup', payload);
    if (data.success) {
      // Re-fetch the canonical balance from the server
      await fetchBalance();
    }
    return data;
  }, [fetchBalance]);

  // ── Fetch transaction ledger ───────────────────────────────────────────────
  const fetchTransactions = useCallback(async (type = 'ALL') => {
    try {
      const params = {};
      if (type && type !== 'ALL') params.type = type;
      const { data } = await api.get('/transaction/history', { params });
      setTransactions(data.transactions ?? data.data ?? []);
    } catch (err) {
      console.warn('Transaction fetch failed:', err?.response?.status);
    }
  }, []);

  // ── Lock a 10% bid deposit (server-driven; optimistic local update) ───────
  // The actual escrow lock is created server-side when a bid is placed.
  // This local helper only updates UI state optimistically.
  const lockDeposit = useCallback(async (itemId, title, bidAmount) => {
    const depositNeeded = Math.floor(bidAmount * 0.10);
    if (walletBalance < depositNeeded) return false;

    // Optimistic UI update — server confirms via next fetchBalance()
    setWalletBalance(prev => prev - depositNeeded);
    setBiddingPower(prev => prev - depositNeeded * 10);

    // Re-sync with server after a short delay
    setTimeout(fetchBalance, 2000);
    return true;
  }, [walletBalance, fetchBalance]);

  // ── Release deposit (outbid / lost) ──────────────────────────────────────
  const releaseDeposit = useCallback(async (itemId) => {
    // Server handles actual release; re-fetch to sync UI
    await fetchBalance();
  }, [fetchBalance]);

  // ── Capture deposit on win ────────────────────────────────────────────────
  const captureDeposit = useCallback(async (itemId) => {
    // Server handles actual capture; re-fetch to sync UI
    await fetchBalance();
  }, [fetchBalance]);

  return (
    <WalletContext.Provider value={{
      walletBalance,
      biddingPower,
      transactions,
      isLoadingWallet,
      addFunds,
      lockDeposit,
      releaseDeposit,
      captureDeposit,
      fetchBalance,
      fetchTransactions,
    }}>
      {children}
    </WalletContext.Provider>
  );
};
