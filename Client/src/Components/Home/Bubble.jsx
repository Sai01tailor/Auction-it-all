import React from 'react'
import {motion} from 'framer-motion'
const Bubble = (param) => {
  return (
    <motion.div
      className='Bubble'
      style={{
        height:param.size,
        width:param.size,
        borderRadius:50000,
        backgroundColor:'#002366',
        opacity:param.transparency,
        position:'absolute',
        zIndex:2,
        margin:'auto',
        top:0,
        bottom:0,
        left:0, 
        right:0,
      }}
      initial={{ x:0,y:0 ,scale:param.animateOnScale?0:1}}
      animate={{ scale: 1,x:param.cord[0],y:param.cord[1] }}    
      transition={{ease: "easeInOut", duration: 2,type:param.type?param.type:'linear'}}

    >
      
    </motion.div>
  )
}

export default Bubble