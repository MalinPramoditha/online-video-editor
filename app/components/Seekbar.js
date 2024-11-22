'use client'
import React, { useState } from 'react'

export default function Seekbar() {
    const [media, setMedia] = useState([
        {
          url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-26-33_825_tlkroo.png',
        },
        {
          url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-00-45_094_y4mxyf.png',
        },
        {
            url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-26-33_825_tlkroo.png',
          },
          {
            url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-00-45_094_y4mxyf.png',
          },
          {
            url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-26-33_825_tlkroo.png',
          },
          {
            url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-00-45_094_y4mxyf.png',
          },
          {
            url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-26-33_825_tlkroo.png',
          },
          {
            url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-00-45_094_y4mxyf.png',
          },
          {
              url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-26-33_825_tlkroo.png',
            },
            {
              url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-00-45_094_y4mxyf.png',
            },
            {
              url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-26-33_825_tlkroo.png',
            },
            {
              url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-00-45_094_y4mxyf.png',
            },
            {
                url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-26-33_825_tlkroo.png',
              },
              {
                url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-00-45_094_y4mxyf.png',
              },
              {
                  url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-26-33_825_tlkroo.png',
                },
                {
                  url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-00-45_094_y4mxyf.png',
                }
      ]);


  return (
    <div className='w-full p-4 border-t'>
        <div className='flex justify-between text-sm py-2'>
            <p>0.00</p>
            <p>3.00</p>
        </div>
        <div className='flex rounded-md overflow-hidden'>
            {media.map((media, index) => ( 
                <div key={index} className='relative'>
                    <img src={media.url} className="size-20 object-cover" />
                </div>
            ))}
        </div>
    </div>
  )
}
