import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function MyBidsPage() {
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      const response = await itemsAPI.getUserBids();
      setBids(response.data.bids);
    } catch (error) {
      toast.error('Failed to load your bids');
    } finally {
      setIsLoading(false);
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
        <h1 className="text-headline-lg mb-2">My Active Bids</h1>
        <p className="text-body-lg text-on-surface-variant mb-8">
          Track all your active bids and their status in real-time
        </p>

        {bids.length > 0 ? (
          <div className="space-y-4">
            {bids.map((bid) => {
              const isHighest = bid.isHighestBid;
              const timeRemaining = formatDistanceToNow(
                new Date(bid.auctionEndTime),
                { addSuffix: false }
              );
              const isEnding = new Date(bid.auctionEndTime) - Date.now() < 3600000;

              return (
                <Link
                  key={bid.itemId}
                  to={`/auction/${bid.itemId}`}
                  className="card-hover flex flex-col md:flex-row gap-4 md:gap-6"
                >
                  <div className="md:flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-headline-lg">{bid.title}</h3>
                      <span
                        className={`badge ${
                          isHighest ? 'badge-success' : 'badge-warning'
                        }`}
                      >
                        {isHighest ? 'Winning' : 'Outbid'}
                      </span>
                    </div>
                    <p className="text-body-md text-on-surface-variant mb-3">
                      Auction Type: {bid.auctionType}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">Your Bid</p>
                      <p className="text-bid">${bid.bidAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">
                        Current Highest
                      </p>
                      <p className="font-data-tabular text-data-tabular font-bold text-primary">
                        ${bid.currentHighestBid?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant mb-1">
                        Time Remaining
                      </p>
                      <p
                        className={`font-body-md font-bold ${
                          isEnding ? 'text-timer-urgent' : 'text-timer-warning'
                        }`}
                      >
                        {timeRemaining}
                      </p>
                    </div>
                    <div className="flex items-end">
                      <button className="btn-bid w-full text-sm">
                        Increase Bid
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="card text-center py-12">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">
              gavel
            </span>
            <p className="font-body-lg text-on-surface-variant mb-4">
              You haven't placed any bids yet
            </p>
            <Link to="/browse" className="btn-bid inline-flex">
              Browse Auctions
              <span className="material-symbols-outlined ml-2">arrow_forward</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
