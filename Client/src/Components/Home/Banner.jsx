import React from 'react'
import Bubble from './Bubble'
import Search from './Search'
const Banner = () => {
    const [bubbles,setBubbles] = React.useState(30)
    const [a,seta] = React.useState(13)
    const [b,setb] = React.useState(200)


  return (
    <div className='Hero-Full' style={{backgroundColor:'rosybrown !important'}} >
      {
        [...Array(bubbles)].map((_, i) => (
          <Bubble
            key={i}
            size = {(i+1)*5}
            transparency = {(i/bubbles)}
            cord = {[(a*i)+b*(Math.PI/15)*Math.cos(Math.PI/15 *i),((a*i)+b*(Math.PI/15))*Math.sin(Math.PI/15 *i)]}
          />
        ))
      }
      {
        [...Array(bubbles)].map((_, i) => (
          <Bubble
            key={i}
            size = {(i+1)*5}
            transparency = {(i/bubbles)}
            cord = {[-1*[(a*i)+b*(Math.PI/15)*Math.cos(Math.PI/15 *i)],-1*[((a*i)+b*(Math.PI/15))*Math.sin(Math.PI/15 *i)]]}
          />
        ))
      }
      <Search/>
    </div>
  )
}

export default Banner