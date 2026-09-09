import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI, walletAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AuctionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [item, setItem] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBidding, setIsBidding] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [itemRes, bidsRes] = await Promise.all([
        itemsAPI.getItemById(id),
        itemsAPI.getItemBids(id, { limit: 50 }),
      ]);
      setItem(itemRes.data);
      setBids(bidsRes.data.bids);

      if (user) {
        const walletRes = await walletAPI.getBalance();
        setWalletBalance(walletRes.data.balance);
      }
    } catch (error) {
      toast.error('Failed to load auction details');
      navigate('/browse');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/auth/login');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (!amount || amount <= item.currentHighestBid) {
      toast.error(`Bid must be higher than ${item.currentHighestBid}`);
      return;
    }

    if (walletBalance && amount > walletBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setIsBidding(true);
    try {
      await itemsAPI.placeBid(id, amount);
      toast.success('Bid placed successfully!');
      setBidAmount('');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to place bid');
    } finally {
      setIsBidding(false);
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

  if (!item) return null;

  const timeRemaining = item.timeRemaining
    ? formatDistanceToNow(new Date(Date.now() + item.timeRemaining * 1000), {
        addSuffix: false,
      })
    : 'Ended';

  const isEnding = item.timeRemaining && item.timeRemaining < 3600;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container-main py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images */}
          <div className="lg:col-span-2">
            <div className="card overflow-hidden mb-6">
              <img
                src={item.photos?.[0] || 'https://via.placeholder.com/500x400'}
                alt={item.title}
                className="w-full h-96 md:h-[500px] object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {item.photos?.slice(1, 5).map((photo, idx) => (
                <div key={idx} className="card overflow-hidden cursor-pointer hover:opacity-75">
                  <img
                    src={photo}
                    alt={`${item.title} - ${idx + 2}`}
                    className="w-full h-24 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details & Bidding */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Status Badge */}
            {item.status === 'ACTIVE' && (
              <div className="badge-success flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success-pulse animate-pulse-soft"></span>
                LIVE AUCTION
              </div>
            )}

            {/* Title */}
            <div>
              <h1 className="text-headline-lg mb-2">{item.title}</h1>
              <p className="text-on-surface-variant text-body-md">{item.description}</p>
            </div>

            {/* Seller Info */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Seller</p>
                  <p className="font-body-md font-bold text-primary">
                    {item.seller?.username}
                  </p>
                </div>
                {item.seller?.kycStatus === 'Verified' && (
                  <span className="material-symbols-outlined text-success-pulse">verified</span>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-border-subtle">
                <span className="text-xs text-on-surface-variant">Rating</span>
                <p className="font-body-md font-bold text-primary">
                  {item.seller?.averageRating} / 5.0
                </p>
              </div>
            </div>

            {/* Bid Info */}
            <div className="card space-y-4 bg-primary-fixed/10 border border-primary">
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Starting Price</p>
                <p className="font-data-tabular text-data-tabular font-bold text-primary">
                  ${item.startingPrice?.toLocaleString()}
                </p>
              </div>

              <div className="border-t border-border-subtle pt-4">
                <p className="text-xs text-on-surface-variant mb-1">Current Highest Bid</p>
                <p className="text-bid">${item.currentHighestBid?.toLocaleString()}</p>
                {item.currentHighestBidder && (
                  <p className="text-xs text-on-surface-variant mt-1">
                    by {item.currentHighestBidder.username}
                  </p>
                )}
              </div>

              <div className="border-t border-border-subtle pt-4">
                <p className="text-xs text-on-surface-variant mb-1">Bids Placed</p>
                <p className="font-data-tabular text-data-tabular font-bold text-primary">
                  {item.bidsCount}
                </p>
              </div>
            </div>

            {/* Timer */}
            <div className={`card text-center ${isEnding ? 'bg-timer-urgent/10 border-timer-urgent' : 'bg-timer-warning/10 border-timer-warning'}`}>
              <p className="text-xs text-on-surface-variant mb-1">Time Remaining</p>
              <p className={`font-display-bid text-display-bid ${isEnding ? 'text-timer-urgent' : 'text-timer-warning'}`}>
                {timeRemaining}
              </p>
            </div>

            {/* Bidding Form */}
            {item.status === 'ACTIVE' && (
              <form onSubmit={handlePlaceBid} className="card space-y-4 bg-surface-container-low">
                <div>
                  <label className="text-primary-label">Your Bid Amount</label>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="0"
                    className="input-field"
                    min={item.currentHighestBid + 1}
                    required
                  />
                  <p className="text-xs text-on-surface-variant mt-1">
                    Minimum: ${(item.currentHighestBid + 1).toLocaleString()}
                  </p>
                </div>

                {walletBalance !== null && (
                  <p className="text-xs">
                    <span className="text-on-surface-variant">Wallet Balance: </span>
                    <span className="font-bold text-primary">
                      ${walletBalance?.toLocaleString()}
                    </span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isBidding || !user}
                  className="btn-bid w-full disabled:opacity-50"
                >
                  {isBidding ? 'Placing Bid...' : 'Place Bid'}
                </button>

                {!user && (
                  <p className="text-xs text-timer-urgent text-center">
                    Please log in to bid
                  </p>
                )}
              </form>
            )}

            {/* Item Details */}
            <div className="card space-y-4">
              <h3 className="font-body-lg font-bold text-primary">Item Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Category</p>
                  <p className="text-primary font-medium">{item.category}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Condition</p>
                  <p className="text-primary font-medium">{item.condition}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Location</p>
                  <p className="text-primary font-medium">{item.location}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1">Auction Type</p>
                  <p className="text-primary font-medium">{item.auctionType}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Bids History */}
        <div className="mt-12">
          <h2 className="text-headline-lg mb-6">Bid History</h2>
          <div className="card">
            {bids.length > 0 ? (
              <div className="space-y-4">
                {bids.map((bid, idx) => (
                  <div
                    key={bid.bidId}
                    className={`flex justify-between items-center pb-4 ${
                      idx < bids.length - 1 ? 'border-b border-border-subtle' : ''
                    } ${bid.isHighestBid ? 'bg-success-pulse/5 p-3 rounded' : ''}`}
                  >
                    <div>
                      <p className="font-body-md font-medium text-primary">
                        {bid.bidderUsername}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {formatDistanceToNow(new Date(bid.bidTime), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-data-tabular text-data-tabular font-bold text-primary">
                        ${bid.bidAmount?.toLocaleString()}
                      </p>
                      {bid.isHighestBid && (
                        <span className="text-xs text-success-pulse font-bold">Highest</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-on-surface-variant py-8">
                No bids yet. Be the first to bid!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
