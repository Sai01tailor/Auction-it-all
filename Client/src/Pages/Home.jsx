import React from 'react'
import Header from '../Components/Global/Header'
import Banner from '../Components/Home/Banner'
import SecondaryHeader from '../Components/Global/SecondaryHeader'
import ProductCard from '../Components/Product/ProductCard'
const Home = () => {
  const product1 = {
    title:'Sample Product',
    description:'this is a sample product description this is a sample product description this is a sample product description ',
    startingPrice:5000,
    currentHighestBid:15000,
    // we store an array of Cloudinary Secure URLS here
    photos:['https://res.cloudinary.com/dzcmadjl1/image/upload/v1700000000/sample.jpg'],
    sellerId:125466,
    startTime:Date.now()+200, // auction starts in the future
    endTime: Date.now() + 10000000 // auction ends in the future
  }
  return (<>
    <Header/>
    <SecondaryHeader/>
    <Banner/>
    <div className='grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-6 lg:ml-[5%] lg:mr-[5%] mt-[20px]  '  >
    <ProductCard product={product1} />
    <ProductCard product={product1} />
    <ProductCard product={product1} />
    <ProductCard product={product1} />
    <ProductCard product={product1} />
    <ProductCard product={product1} />
    </div>
  </>
  )
}

export default Home