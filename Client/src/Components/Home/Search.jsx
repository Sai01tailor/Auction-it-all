import React from 'react'
import { motion } from 'framer-motion'
// import {search} from '../../Assets/Icons/search.png'
const Search = () => {
  return (
    <motion.div
    className='search'
    initial={{ scaleX: 0,scaleY:0 }}
    animate={{ scaleX: 1,scaleY:1 }}
    transition={{ ease: "easeInOut", duration: 0.5 }}
    style={{
        height:50,
        width:'30%',
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
      <input type="text" style={{borderRadius:'50px 0 0 50px',width:'90%',padding:'0 10px'}}  placeholder="Search..." />
      <button style={{borderRadius:'0 50px 50px 0',width:'10%'}}>{'Search'}</button>
    </motion.div>
  )
}

export default Search