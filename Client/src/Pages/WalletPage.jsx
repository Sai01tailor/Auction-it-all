import { useEffect, useState } from 'react';
import { walletAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await walletAPI.getBalance();
      setWallet(response.data);
    } catch (error) {
      toast.error('Failed to load wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const fundAmount = parseFloat(amount);

    if (!fundAmount || fundAmount < 100) {
      toast.error('Minimum amount is 100');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await walletAPI.createOrder(fundAmount, 'INR');
      // In a real app, this would integrate with Razorpay
      toast.success('Order created. Integrate with Razorpay for payment');
      setAmount('');
      fetchWallet();
    } catch (error) {
      toast.error(error.message || 'Failed to create order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <span className="material-symbols-outlined text-4xl">loading</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container-main py-8">
        <h1 className="text-headline-lg mb-8">My Wallet</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Balance Card */}
          <div className="lg:col-span-2">
            <div className="card bg-primary text-on-primary">
              <p className="text-on-primary/80 mb-2">Available Balance</p>
              <h2 className="text-5xl font-display-bid text-gold-light mb-6">
                ₹{wallet?.balance?.toLocaleString() || '0'}
              </h2>
              <p className="text-on-primary/60">
                Last updated: {new Date(wallet?.lastUpdated).toLocaleString()}
              </p>
            </div>

            {/* Add Funds Section */}
            <div className="card mt-6">
              <h3 className="text-headline-lg mb-6">Add Funds</h3>
              <form onSubmit={handleAddFunds} className="space-y-4">
                <div>
                  <label className="text-primary-label">Amount (INR)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500"
                    className="input-field"
                    min="100"
                    required
                  />
                  <p className="text-xs text-on-surface-variant mt-1">
                    Minimum: ₹100
                  </p>
                </div>

                {/* Quick Add Buttons */}
                <div>
                  <p className="text-xs text-on-surface-variant mb-2">Quick Add</p>
                  <div className="grid grid-cols-4 gap-2">
                    {[500, 1000, 5000, 10000].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setAmount(qty.toString())}
                        className="btn-secondary text-sm py-2"
                      >
                        ₹{qty}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="btn-bid w-full"
                >
                  {isProcessing ? 'Processing...' : 'Continue to Payment'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant">
                <p className="text-xs text-on-surface-variant">
                  <span className="font-bold">Info:</span> Payments are processed through Razorpay. 
                  Your funds are credited instantly to your wallet.
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <aside>
            <div className="card">
              <h3 className="text-headline-lg mb-4">Recent Transactions</h3>
              {wallet?.transactions && wallet.transactions.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {wallet.transactions.slice(0, 10).map((txn, idx) => (
                    <div key={idx} className="pb-3 border-b border-border-subtle last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-primary">
                            {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount?.toLocaleString()}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {txn.reason}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold ${
                            txn.type === 'CREDIT'
                              ? 'text-success-pulse'
                              : 'text-timer-urgent'
                          }`}
                        >
                          {txn.type}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">
                        {new Date(txn.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant text-center py-4">
                  No transactions yet
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
