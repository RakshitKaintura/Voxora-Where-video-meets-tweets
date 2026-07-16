import { useRef, useState, useEffect } from 'react'

export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null)
  
  return (
    <div className="relative w-full bg-black aspect-video rounded-xl overflow-hidden group">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        controls
        controlsList="nodownload"
        className="w-full h-full object-contain"
        autoPlay
      />
    </div>
  )
}
