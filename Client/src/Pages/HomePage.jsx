import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, filterRes] = await Promise.all([
        itemsAPI.getItems({ limit: 8, page: 1 }),
        itemsAPI.getFilterOptions(),
      ]);
      setItems(itemsRes.data.items);
      setFilterOptions(filterRes.data);
    } catch (error) {
      toast.error('Failed to load auctions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-on-primary py-16 md:py-24 px-margin-mobile md:px-margin-desktop">
        <div className="container-main">
          <div className="max-w-2xl">
            <h1 className="font-headline-xl-mobile md:font-headline-xl text-headline-xl-mobile md:text-headline-xl mb-4">
              Premium Auctions for Luxury Collectors
            </h1>
            <p className="font-body-lg text-body-lg text-primary-fixed-dim mb-8">
              Join thousands of collectors bidding on authentic luxury watches, art, vehicles, and collectibles in real-time.
            </p>
            <Link to="/browse" className="btn-bid inline-flex">
              Explore Auctions
              <span className="material-symbols-outlined ml-2">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop">
        <div className="container-main">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-headline-lg">Featured Auctions</h2>
            <Link to="/browse" className="text-primary font-bold hover:underline">
              View All
              <span className="material-symbols-outlined inline ml-1">arrow_forward</span>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card h-96 animate-pulse bg-surface-container" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <AuctionCard key={item.itemId} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      {filterOptions && (
        <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="container-main">
            <h2 className="text-headline-lg mb-8">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {filterOptions.categories?.slice(0, 5).map((category) => (
                <Link
                  key={category}
                  to={`/browse?category=${category}`}
                  className="card-hover text-center py-6"
                >
                  <p className="font-body-md font-medium text-primary">{category}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop">
        <div className="container-main">
          <div className="bg-primary text-on-primary rounded-2xl p-8 md:p-12 text-center">
            <h2 className="font-headline-lg text-on-primary mb-4">
              Ready to Start Bidding?
            </h2>
            <p className="font-body-lg text-primary-fixed-dim mb-6">
              Complete your KYC verification to unlock full bidding capabilities
            </p>
            <Link to="/kyc" className="btn-primary bg-gold-dark text-[#0A0A0A] hover:bg-secondary-container">
              Complete KYC Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
