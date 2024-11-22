'use client'
import { LoaderCircle } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react'

export default function Seekbar({ timelineImages = [], video }) {
  console.log('Video duration:', video?.duration);
  const seekbarRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    console.log('Timeline images changed:', timelineImages);
  }, [timelineImages]);

  const handleMouseDown = (event) => {
    event.preventDefault();
    setDragging(true);
    updatePosition(event);
  }

  const handleMouseMove = (event) => {
    if (dragging) {
      event.preventDefault();
      updatePosition(event);
    }
  }

  const handleMouseUp = () => {
    setDragging(false);
  }

  const updatePosition = (event) => {
    if (!seekbarRef.current) return;
    
    const rect = seekbarRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    
    // Constrain position between 0 and width
    const newPosition = Math.max(0, Math.min(x, width));
    setPosition(newPosition);
  }

  useEffect(() => {
    // Add mouse move and up listeners to window
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      // Restore text selection
      document.body.style.userSelect = '';
    };
  }, [dragging]);

  return (
    <div className='w-full py-2 border-t'>
      <div className='flex justify-between text-xs text-gray-500 py-2'>
        {[...Array(10).keys()].map(i => (
          <p key={i}>{`${Math.floor((i * (video?.current?.duration / 10)) / 60)}:${(((i * (video?.current?.duration / 10)) % 60) / 100).toFixed(2).slice(-2)}`}</p>
        ))}
      </div>

      <div className='relative select-none h-20 w-full' ref={seekbarRef}>
        { timelineImages.length !== 0 ?
            <div className='flex rounded-md overflow-hidden justify-between bg-gray-500'>
            {timelineImages.map((image, index) => (
                <div key={index} className='relative select-none '>
                <img 
                    src={image.url} 
                    className="size-20 object-cover select-none" 
                    draggable="false"
                />
                </div>
            ))}
        </div>
          :
            <div className='flex justify-center items-center w-full h-20 gap-2 text-sm text-primary'>
                <div className='animate-spin flex items-center justify-center'>
                    <LoaderCircle className='size-4'/>
                </div>
                <p >Generating timeline this will take a few seconds... </p>
            </div>
         }
         
        { timelineImages.length !== 0 &&
        <div style={{ left: `${position}px`, transform: 'translateX(-50%)' }}
          className='absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize select-none'
          onMouseDown={handleMouseDown}
        >
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full' />
        </div>
        }
      </div>
    </div>
  )
}
