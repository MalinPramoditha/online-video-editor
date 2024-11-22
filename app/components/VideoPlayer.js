'use client'
import React, { useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CornerLeftDown, CornerRightDown, Image, Play, Scissors } from 'lucide-react';
  

export default function VideoPlayer({ onScreenshotsChange }) {
    const [selectedVideo, setSelectedVideo] = useState('https://rr6---sn-uxax4vopj5qx-q0n6.googlevideo.com/videoplayback?expire=1732291095&ei=t1VAZ4e4M7jLi9oP98LKsA8&ip=176.1.194.6&id=o-AIfqFwfADY91t1wJXRRqatTAnPbrUENAQWC9tB9TAnEF&itag=136&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C271%2C278%2C313%2C394%2C395%2C396%2C397%2C398%2C399%2C400%2C401&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1732269495%2C&mh=va&mm=31%2C29&mn=sn-uxax4vopj5qx-q0n6%2Csn-4g5e6nsy&ms=au%2Crdu&mv=m&mvi=6&pl=18&rms=au%2Cau&initcwndbps=1083750&bui=AQn3pFSWBEwHACe6QKTAE8SmYn_kI7PErSBgDsHpfdcXVP_6LF0arFaSX8E5pf_xOH4spqBkwMK8L0Ab&spc=qtApAcQHVBCVa1-Xp1yWh5dF3NFqGLHStdCE_Ed3bJ3S_MOiYQ&vprv=1&svpuc=1&mime=video%2Fmp4&ns=2tnBY1cc0AXmmbrsfMDt1tcQ&rqh=1&gir=yes&clen=25413749&dur=197.600&lmt=1729734200078899&mt=1732268954&fvip=5&keepalive=yes&fexp=51319288%2C51326932%2C51335594&c=WEB&sefc=1&txp=4532434&n=TlfB5Hr8weTQuQ&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRAIgDY6fmGYK9NmmyHDh6jd0ywmNO1xuLOnvoUDX-tJsf44CIBXh02hvrbyP6RO7JL3hu1ONsTzI2EhowwPUCdIhW5m9&sig=AJfQdSswRgIhALvtTfGDWyKaYa9nD73DFqrWvj07fVWlcBWsVLE7xMjvAiEA2LYpYGzkDDV_ZcusoIeBnR0oxZ1CR6QfOtAgc0t0aMQ%3D');
    const [screenshots, setScreenshots] = useState([]);
  
    const screenshot = async () => {
        const video = document.querySelector('video');
        if (!video) return;
    
        try {

          const timestamp = video.currentTime;
          
          const response = await fetch('/api/screenshot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              videoUrl: selectedVideo,
              timestamp,
            }),
          });
    
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || 'Failed to capture screenshot');
          }
    
          const blob = await response.blob();
          if (blob.size === 0) {
            throw new Error('Received empty screenshot');
          }
    
          const url = URL.createObjectURL(blob);
          const filename = `screenshot_${new Date().toISOString().replace(/[:.]/g, '-')}_${Math.random().toString(36).slice(2, 5)}.png`;
          
          const newScreenshots = [...screenshots, {
            id: Math.random().toString(36).slice(2),
            url,
            filename,
            timestamp,
            blob
          }];
          
          setScreenshots(newScreenshots);
          onScreenshotsChange?.(newScreenshots); // Call the callback with updated screenshots
        } catch (error) {
          console.error('Screenshot error:', error);
          alert('Failed to capture screenshot: ' + error.message);
        } 
      }

  
  
    return (
    <div className='w-full'>
        <Card>
            <CardContent className='py-6'>
                {/* <video controls src={selectedVideo}  className='w-full'/> */}
                <video 
              src={selectedVideo}
              controls 
              playsInline
              webkit-playsinline="true"
              x5-playsinline="true"
              style={{
                maxHeight: '70vh',
                objectFit: 'contain',
                backgroundColor: 'black'
              }}
              />
            </CardContent>
            <CardFooter>
                <div className='w-full flex justify-between items-center'>
                    <div className='flex gap-1'>
                        <Button variant="outline" onClick={screenshot}>
                            <Image/>
                        </Button>
                        <Button variant="outline">
                                <Play/>
                        </Button>
                        <Button variant="outline">
                                <ChevronRight/>
                        </Button>
                    </div>
                    <div className='flex gap-1'>
                        <Button variant="outline">
                                <ChevronLeft/>
                        </Button>
                        <Button variant="outline">
                                <Play/>
                        </Button>
                        <Button variant="outline">
                                <ChevronRight/>
                        </Button>
                    </div>
                    <div className='flex gap-1'>
                        <Button variant="outline">
                                <CornerLeftDown/>
                        </Button>
                        <Button variant="outline">
                                <CornerRightDown/>
                        </Button>
                        <Button variant="outline">
                                <Scissors/>
                        </Button>
                    </div>
                </div>
            </CardFooter>
        </Card>
    </div>
  )
}
