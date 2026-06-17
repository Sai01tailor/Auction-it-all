import React, { useState, useEffect } from 'react';
import api from '../../Config/Axios';
import ProductCard from './ProductCard';

const Product_grid = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        if (loading || !hasMore) return; 
        
        setLoading(true);
        try {
            const response = await api.get(`/products?limit=10&offset=${products.length}`);
            const newProducts = response.data;

            if (newProducts.length === 0) {
                setHasMore(false); 
            } else {
                setProducts(prevProducts => [...prevProducts, ...newProducts]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 5) {
            fetchProducts();
        }
    };

    return (
        <div 
            className='grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-6 lg:ml-[5%] lg:mr-[5%] mt-[20px] h-screen overflow-y-auto' 
            onScroll={handleScroll}
        >
            {products.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
            
            {loading && <div className="col-span-full text-center py-4">Loading more...</div>}
            {!hasMore && <div className="col-span-full text-center py-4 text-gray-500">No more products</div>}
        </div>
    );
}

export default Product_grid;