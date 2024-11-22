'use client'
import React, { useEffect, useState } from 'react'

export default function Seekbar({ timelineImages = [] }) {

      useEffect(() => {
        console.log('Timeline images changed:', timelineImages);
      }, [timelineImages]);

  return (
    <div className='w-full p-4 border-t'>
        <div className='flex justify-between text-sm py-2'>
            <p>0.00</p>
            <p>3.00</p>
        </div>
        <div className='flex rounded-md overflow-hidden justify-between bg-muted'>
            {timelineImages.map((images, index) => ( 
                <div key={index} className='relative'>
                    <img src={images.url} className="size-20 object-cover" />
                </div>
            ))}
        </div>
    </div>
  )
}
