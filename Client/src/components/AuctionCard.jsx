import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function AuctionCard({ item }) {
  const timeRemaining = item.timeRemaining
    ? formatDistanceToNow(new Date(Date.now() + item.timeRemaining * 1000), {
        addSuffix: false,
      })
    : 'Ended';

  const isEnding = item.timeRemaining && item.timeRemaining < 3600; // Less than 1 hour

  return (
    <Link to={`/auction/${item.itemId}`}>
      <div className="card-hover overflow-hidden flex flex-col h-full">
        {/* Image */}
        <div className="relative overflow-hidden h-48 bg-surface-container">
          <img
            src={item.photos?.[0] || 'https://via.placeholder.com/300x200'}
            alt={item.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {item.status === 'ACTIVE' && (
            <div className="absolute top-3 right-3 bg-success-pulse text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse-soft"></span>
              LIVE
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-grow p-4 flex flex-col">
          {/* Title */}
          <h3 className="font-body-md font-semibold text-primary line-clamp-2 mb-2">
            {item.title}
          </h3>

          {/* Category & Condition */}
          <div className="flex gap-2 mb-3">
            <span className="text-xs bg-surface-container-low text-on-surface-variant px-2 py-1 rounded">
              {item.category}
            </span>
            <span className="text-xs bg-surface-container-low text-on-surface-variant px-2 py-1 rounded">
              {item.condition}
            </span>
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border-subtle">
            <span className="text-xs text-on-surface-variant">By {item.seller?.username}</span>
            {item.seller?.kycStatus === 'Verified' && (
              <span className="material-symbols-outlined text-xs text-success-pulse">verified</span>
            )}
          </div>

          {/* Bid Info */}
          <div className="space-y-2 mb-4">
            <div>
              <span className="text-xs text-on-surface-variant block">Starting Bid</span>
              <p className="font-data-tabular text-data-tabular font-bold text-primary">
                ${item.startingPrice?.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant block">Current Highest</span>
              <p className="text-bid">
                ${item.currentHighestBid?.toLocaleString()}
              </p>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-on-surface-variant">
                {item.bidsCount} bids
              </span>
              <span className={`text-xs font-bold ${
                isEnding ? 'text-timer-urgent' : 'text-timer-warning'
              }`}>
                {timeRemaining}
              </span>
            </div>
          </div>
        </div>

        {/* Action */}
        <button className="w-full btn-bid">
          Place Bid
        </button>
      </div>
    </Link>
  );
}
