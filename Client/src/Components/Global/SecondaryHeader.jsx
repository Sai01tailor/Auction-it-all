import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
const SecondaryHeader = () => {
    const EnglishAuction = React.useRef(null)
    if(document.URL.includes('English-auction')){
        EnglishAuction.current.classList.add('border-b-2','border-blue-600')
    }
  return (
    <motion.div
        className="w-full h-[50px] bg-transparent flex items-center shadow-md justify-around  "
        initial={{ opacity: 0, y: -20 ,height:0}}
        animate={{ opacity: 1, y: 0 ,height:50}}
        transition={{ duration: 0.5 ,delay: 0.2}}
    >
    <div>
        <Link to = '/English-auction'>
            <span ref={EnglishAuction}className={'mx-4 text-sm sm:text-base font-medium text-gray-600 hover:text-blue-600 transition-colors duration-300'}>English Auction</span>
        </Link>
    </div>
    </motion.div>
  )
}

export default SecondaryHeader