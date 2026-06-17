import React, { useState, useEffect } from 'react'
import Search from '../Home/Search'
import { Link } from 'react-router-dom'
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMobile(true)
      } else {
        setMobile(false)
      }
    }

    // Set initial size
    handleResize()

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (mobile) {
    return (
      <div 
        className={`h-[70px] z-50 sticky top-0 w-full flex justify-between items-center px-4 Header-div transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-md shadow-md shadow-neutral-100/40 border-neutral-200/80 py-2' 
            : 'bg-white/20 backdrop-blur-xs border-neutral-200/30 py-4'
        }`}
      >
        <button className='burger w-[15%] h-[50%]' style={{borderRadius:'50px'}}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#ffffff" style={{ width: '20px', height: '20px' }}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
</svg>
        </button>
        <h1 className='text-lg w-[70%] font-bold tracking-tight m-0 select-none cursor-pointer text-brand-primary whitespace-nowrap'>
          Auction It All
        </h1>
        
         
      </div>
    )
  }

  return (
    <div 
      className={`h-[70px] z-50 sticky top-0 w-full flex justify-between items-center px-8 Header-div shadow-md transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-md shadow-neutral-100/40 border-neutral-200/80 py-2' 
          : 'bg-white/20 backdrop-blur-xs border-neutral-200/30 py-4'
      }`}
    >
      <h1 className='text-2xl w-1/8 font-bold tracking-tight m-0 select-none cursor-pointer text-brand-primary whitespace-nowrap'>
        Auction It All
      </h1>
      
      <div className='w-1/2 relative h-full flex items-center'>
        <Search />
      </div>  

      <div className='h-full flex justify-end items-center w-1/8' >
        {/* <span className='inline-flex items-center text-xs font-semibold tracking-wider text-neutral-600 bg-neutral-100/90 px-3.5 py-1.5 rounded-full border border-neutral-200/60 shadow-xs gap-1.5 transition-all duration-300 hover:bg-neutral-200/50 hover:shadow-sm select-none whitespace-nowrap'>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          0 Bids in Last 1 Hours
        </span> */}
          <Link to="/login">
            <button className='ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-semibold rounded-lg'>Sign In</button>
          </Link>
      </div>

    </div>
  )
}

export default Header