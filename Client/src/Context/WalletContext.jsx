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
        const serverBalance = data.data?.availableMoney ?? data.walletBalance ?? 0;
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
        setBiddingPower(finalBalance * 10);
      }
    } catch (err) {
      // 401 = not authenticated; skip silently
      if (err?.response?.status !== 401) {
        console.warn('Wallet balance fetch failed:', err?.response?.status);
      }
    } finally {
      setIsLoadingWallet(false);
    }
  }, [user]);

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


  // Helper to load Razorpay SDK dynamically
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const updateVirtualState = useCallback((amount, orderId, paymentId) => {
    if (!user) return;
    const userId = user.userId || user._id;
    const currentVirtual = Number(localStorage.getItem(`virtual_balance:${userId}`) || walletBalance);
    const newVirtual = currentVirtual + amount;
    localStorage.setItem(`virtual_balance:${userId}`, String(newVirtual));

    let virtualTxs = [];
    try {
      virtualTxs = JSON.parse(localStorage.getItem(`virtual_transactions:${userId}`) || '[]');
    } catch (e) { }

    virtualTxs.unshift({
      _id: 'tx_virtual_' + Math.random().toString(36).substring(2, 15),
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      amountInPaise: amount * 100,
      coinsToBeAdded: amount,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    localStorage.setItem(`virtual_transactions:${userId}`, JSON.stringify(virtualTxs));
  }, [user, walletBalance]);

  // ── Add Funds (Top-Up) via payments/create-order & webhook ───────────────
  const addFunds = useCallback(async (amount) => {
    try {
      // 1. Create order on the server
      const { data: orderData } = await api.post('/payments/create-order', {
        coinsRequested: amount
      });

      if (!orderData.success) {
        return { success: false, message: 'Could not initiate payment order.' };
      }

      const rzpLoaded = await loadRazorpay();

      if (rzpLoaded && window.Razorpay) {
        return new Promise((resolve) => {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SslcoQcFBltexQ', // Razorpay Test Mode Key
            amount: orderData.amount,
            currency: orderData.currency || 'INR',
            name: 'BidKar Escrow',
            description: `Top-up Wallet for ₹${amount.toLocaleString()}`,
            order_id: orderData.orderId,
            handler: async function (response) {
              try {
                // Call webhook manually to verify and credit the balance
                const { data: verifyData } = await api.post('/payments/webhook', {
                  event: 'payment.captured',
                  payload: {
                    payment: {
                      entity: {
                        id: response.razorpay_payment_id || 'pay_mock_' + Math.random().toString(36).substring(2, 15),
                        order_id: response.razorpay_order_id || orderData.orderId
                      }
                    }
                  }
                });

                if (verifyData.success) {
                  updateVirtualState(amount, orderData.orderId, response.razorpay_payment_id || 'pay_mock_' + Math.random().toString(36).substring(2, 15));
                }

                await fetchBalance();
                resolve(verifyData);
              } catch (verifyErr) {
                console.error('Payment confirmation failed:', verifyErr);
                resolve({ success: false, message: 'Escrow credit confirmation failed.' });
              }
            },
            modal: {
              ondismiss: function () {
                resolve({ success: false, message: 'Payment cancelled by user.' });
              }
            },
            theme: {
              color: '#002366'
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        });
      } else {
        // Razorpay SDK block fallback (Dev/Mock Mode)
        console.warn('Razorpay SDK failed to load. Falling back to local verification mockup.');
        const { data: verifyData } = await api.post('/payments/webhook', {
          event: 'payment.captured',
          payload: {
            payment: {
              entity: {
                id: 'pay_mock_' + Math.random().toString(36).substring(2, 15),
                order_id: orderData.orderId
              }
            }
          }
        });

        if (verifyData.success) {
          updateVirtualState(amount, orderData.orderId, 'pay_mock_' + Math.random().toString(36).substring(2, 15));
        }

        await fetchBalance();
        return verifyData;
      }
    } catch (err) {
      console.error('Escrow Top-up creation failed:', err);
      return { success: false, message: err.response?.data?.message || 'Top-up initiation failed.' };
    }
  }, [fetchBalance, user, walletBalance, updateVirtualState]);

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
