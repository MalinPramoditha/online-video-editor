'use client'
import { LoaderCircle } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react'

export default function Seekbar({ video, onSeek, timelineImages = [] }) {
  console.log('Video duration:', video?.duration);
  const seekbarRef = useRef(null);
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [bufferedPosition, setBufferedPosition] = useState(0);

  useEffect(() => {
    console.log('Timeline images changed:', timelineImages);
  }, [timelineImages]);

  const handleMouseDown = (event) => {
    event.preventDefault();
    setIsDragging(true);
    updatePosition(event);
  }

  const handleMouseMove = (event) => {
    if (isDragging) {
      event.preventDefault();
      updatePosition(event);
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false);
  }

  const updatePosition = (event) => {
    if (!seekbarRef.current || !video?.current) return;
    
    const rect = seekbarRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    
    // Calculate the percentage (0 to 1)
    const percentage = Math.max(0, Math.min(x, width)) / width;
    
    // Calculate the new time based on video duration
    const newTime = percentage * video.current.duration;
    
    // Update position and seek video
    setPosition(x);
    if (onSeek) {
      onSeek(newTime);
    }
  }

  useEffect(() => {
    // Add mouse move and up listeners to window
    if (isDragging) {
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
  }, [isDragging]);

  // Update buffered position
  useEffect(() => {
    const updateBufferedPosition = () => {
      if (!video?.current) return;

      const buffered = video.current.buffered;
      if (buffered.length > 0) {
        const bufferedEnd = buffered.end(buffered.length - 1);
        const duration = video.current.duration;
        const width = seekbarRef.current?.clientWidth || 0;
        const newPosition = (bufferedEnd / duration) * width;
        setBufferedPosition(newPosition);
      }
    };

    const videoElement = video?.current;
    if (videoElement) {
      videoElement.addEventListener('progress', updateBufferedPosition);
      videoElement.addEventListener('loadedmetadata', updateBufferedPosition);
      // Initial update
      updateBufferedPosition();
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('progress', updateBufferedPosition);
        videoElement.removeEventListener('loadedmetadata', updateBufferedPosition);
      }
    };
  }, [video]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className='w-full py-2 border-t relative'>
      <div className='flex justify-between text-xs text-gray-500 py-2'>
        {[...Array(10).keys()].map(i => (
          <p key={i}>{`${Math.floor((i * (video?.current?.duration / 10)) / 60)}:${(((i * (video?.current?.duration / 10)) % 60) / 100).toFixed(2).slice(-2)}`}</p>
        ))}
      </div>

      <div className='relative select-none h-20 w-full ' ref={seekbarRef}>
        { timelineImages.length !== 0 ?
            <div className='flex rounded-md overflow-hidden justify-between bg-gray-500 overflow-hidden relative'>
            {timelineImages.map((image, index) => (
                <div key={index} className='relative select-none '>
                <img 
                    src={image.url} 
                    className="size-20 object-cover select-none" 
                    draggable="false"
                />
                </div>
                ))}
                  {/* buffering indicator */}
                  <div style={{ left: `${bufferedPosition}px` }} className='absolute w-full top-0 bottom-0 bg-black/60 cursor-ew-resize select-none' />
                  {/* buffering indicator end*/}
            </div>
          :
            <div className='flex justify-center items-center w-full h-20 gap-2 text-sm text-primary z-10'>
                <div className='animate-spin flex items-center justify-center'>
                    <LoaderCircle className='size-4'/>
                </div>
                <p >Generating timeline this will take a few seconds... </p>
            </div>
         }
         
         {/* seekbar controller */}
        { timelineImages.length !== 0 &&
        <div 
          style={{ 
            left: `${position ? (position / seekbarRef.current?.clientWidth) * 100 : (video?.current?.currentTime / video?.current?.duration) * 100}%`, 
            transform: 'translateX(-50%)' 
          }}
          className='absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize select-none z-10'
          onMouseDown={handleMouseDown}
        >
          <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full' />
          <div className='bg-primary absolute -top-7 left-1/2 transform -translate-x-1/2 text-xs p-1 rounded-md'>
            <p>{formatTime(video?.current?.currentTime || 0)}</p>
          </div>
        </div>
        }
          {/* seekbar controller end  */
          }

      </div>
    </div>
  )
}
