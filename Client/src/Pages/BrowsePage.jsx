import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import AuctionCard from '../components/AuctionCard';
import FilterBar from '../components/FilterBar';
import toast from 'react-hot-toast';

// Dummy data for testing
const dummyItems = [
  {
    itemId: 1,
    title: "Vintage Omega Seamaster Watch",
    image: "https://via.placeholder.com/300x300?text=Omega+Watch",
    currentBid: 2500,
    startPrice: 1000,
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    bidsCount: 12,
    category: "Electronics",
    condition: "Excellent"
  },
  {
    itemId: 2,
    title: "Antique Mahogany Writing Desk",
    image: "https://via.placeholder.com/300x300?text=Writing+Desk",
    currentBid: 750,
    startPrice: 300,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    bidsCount: 8,
    category: "Furniture",
    condition: "Good"
  },
  {
    itemId: 3,
    title: "Original Oil Painting - Landscape",
    image: "https://via.placeholder.com/300x300?text=Oil+Painting",
    currentBid: 1800,
    startPrice: 500,
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    bidsCount: 15,
    category: "Art",
    condition: "Excellent"
  },
  {
    itemId: 4,
    title: "Sony A7III Professional Camera",
    image: "https://via.placeholder.com/300x300?text=Sony+Camera",
    currentBid: 1200,
    startPrice: 800,
    endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    bidsCount: 22,
    category: "Electronics",
    condition: "Like New"
  },
  {
    itemId: 5,
    title: "19th Century Porcelain Vase",
    image: "https://via.placeholder.com/300x300?text=Porcelain+Vase",
    currentBid: 650,
    startPrice: 200,
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    bidsCount: 10,
    category: "Collectibles",
    condition: "Good"
  },
  {
    itemId: 6,
    title: "Grand Piano - Steinway & Sons",
    image: "https://via.placeholder.com/300x300?text=Steinway+Piano",
    currentBid: 5500,
    startPrice: 3000,
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    bidsCount: 6,
    category: "Musical Instruments",
    condition: "Excellent"
  },
  {
    itemId: 7,
    title: "Rolex Day-Date Gold Watch",
    image: "https://via.placeholder.com/300x300?text=Rolex+Watch",
    currentBid: 4200,
    startPrice: 2500,
    endTime: new Date(Date.now() + 2.5 * 24 * 60 * 60 * 1000),
    bidsCount: 18,
    category: "Electronics",
    condition: "Excellent"
  },
  {
    itemId: 8,
    title: "Vintage Leather Armchair",
    image: "https://via.placeholder.com/300x300?text=Leather+Chair",
    currentBid: 450,
    startPrice: 150,
    endTime: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000),
    bidsCount: 9,
    category: "Furniture",
    condition: "Good"
  },
];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [filterOptions, setFilterOptions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    auctionType: searchParams.get('auctionType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Use dummy data for development
      const filteredItems = dummyItems.filter(item => {
        const matchesSearch = !filters.search || item.title.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCategory = !filters.category || item.category === filters.category;
        const matchesCondition = !filters.condition || item.condition === filters.condition;
        const matchesMinPrice = !filters.minPrice || item.currentBid >= parseInt(filters.minPrice);
        const matchesMaxPrice = !filters.maxPrice || item.currentBid <= parseInt(filters.maxPrice);
        
        return matchesSearch && matchesCategory && matchesCondition && matchesMinPrice && matchesMaxPrice;
      });

      setItems(filteredItems);
      setPagination({
        page: filters.page,
        pages: Math.ceil(filteredItems.length / 20),
        hasPrev: filters.page > 1,
        hasNext: filters.page < Math.ceil(filteredItems.length / 20),
      });

      // Set filter options from dummy data
      if (!filterOptions) {
        setFilterOptions({
          categories: [...new Set(dummyItems.map(item => item.category))],
          conditions: [...new Set(dummyItems.map(item => item.condition))],
          auctionTypes: ["Live", "Sealed Bid", "Fixed Price"],
        });
      }
    } catch (error) {
      toast.error('Failed to load auctions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 1) params.set(k, v);
    });
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({
      category: '',
      condition: '',
      auctionType: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      page: 1,
    });
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Filter Bar */}
      <FilterBar 
        filters={filters} 
        handleFilterChange={handleFilterChange} 
        filterOptions={filterOptions}
        onClearFilters={handleClearFilters}
      />

      {/* Main Content */}
      <div className="container-main py-8">
        {/* Header */}
        <h1 className="text-headline-lg mb-8">Browse Auctions</h1>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card h-96 animate-pulse bg-surface-container" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {items.map((item) => (
                <AuctionCard key={item.itemId} item={item} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-border-subtle">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={!pagination.hasPrev}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-body-md">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  disabled={!pagination.hasNext}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">
              search_off
            </span>
            <p className="font-body-lg text-on-surface-variant">
              No auctions found matching your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
