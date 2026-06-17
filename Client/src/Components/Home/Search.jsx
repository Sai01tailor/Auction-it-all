import React from 'react'
import { motion } from 'framer-motion'
// import {search} from '../../Assets/Icons/search.png'
const Search = () => {
  return (
    <motion.div
    className='search'
    initial={{ opacity:0 }}
    animate={{ opacity:1 }}
    transition={{ ease: "easeInOut", duration: 0.5 }}
    style={{
        height:50,
        width:'50%',
        display:'flex',
        position:'absolute',
        zIndex:2,
        margin:'auto',
        top:0,
        bottom:0,
        left:0, 
        right:0,
    }}
    >
      <input type="text" style={{borderRadius:'50px 0 0 50px',width:'85%',padding:'0 15px',border:'1px solid var(--color-border-subtle)',borderRight:'none',outline:'none'}} placeholder="Search..." />
      <button style={{borderRadius:'0 50px 50px 0',width:'15%',display:'flex',justifyContent:'center',alignItems:'center',cursor:'pointer',border:'1px solid var(--color-border-subtle)',borderLeft:'none',backgroundColor:'var(--color-brand-primary)'}}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#ffffff" style={{ width: '20px', height: '20px' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </button>
    </motion.div>
  )
}

export default Search