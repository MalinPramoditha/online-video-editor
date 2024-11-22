'use client'
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CornerLeftDown, CornerRightDown, Image, LoaderCircle, Play, Scissors } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Seekbar from './Seekbar';


export default function VideoPlayer({ onScreenshotsChange, onTimelineImagesChange, props }) {
    const [selectedVideo, setSelectedVideo] = useState("https://rr4---sn-npoe7nsr.googlevideo.com/videoplayback?expire=1732313268&ei=VKxAZ6-zMKXi6dsPjOmI-A4&ip=176.6.137.121&id=o-ANTMLu8iXZs1NMqY5EA_wbO22ol1FQFxryRS2UlZdiKC&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&bui=AQn3pFTd3jBenK2-K7U2IujQdyESdCMDCCy4Z9N2XTTl46hAoCfFXaCIFgxchCmRxh1X7tVaAYD41PIb&spc=qtApAYL6ZHEaT39ie-_fNsFiPqo9hh55a2os-Wmz51dNlJMKpCAt&vprv=1&svpuc=1&mime=video%2Fmp4&ns=uBTlS5QHpvf0B-IQazSZgZkQ&rqh=1&cnr=14&ratebypass=yes&dur=205.171&lmt=1662910177796340&fexp=24350590,24350655,24350675,24350705,24350737,51326932,51335594&c=WEB&sefc=1&txp=5318224&n=csXHNZEJM-tVGg&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRAIgERcNkwMJTO9ABC9_QiQnZCWGehNBKKTaOg1XwVRM41cCIB5DN3nTQyHsbaH28hvieItd73gKDa7HLv1XaxJL5nHP&rm=sn-uxax4vopj5qx-cxgz7z&rrc=79,80&req_id=de64493c1452a3ee&redirect_counter=2&cm2rm=sn-4g5e6r7z&cms_redirect=yes&cmsv=e&met=1732291683,&mh=qX&mip=175.157.48.104&mm=34&mn=sn-npoe7nsr&ms=ltu&mt=1732290197&mv=u&mvi=4&pl=22&rms=ltu,au&lsparams=met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=AGluJ3MwRgIhAJB-rE4Mo9KYTvmkbz6747JHX6ZCpjDxc6PFaHN6eIy5AiEAwZRykTyV9lIkVqsNiInbgb2RAqie7tJBJ8sXmTMouis%3D");
    const [screenshots, setScreenshots] = useState([]);
    const [isCapturing, setIsCapturing] = useState(false);
   const [timelineImages, setTimelineImages] = useState([]);
   const videoRef = useRef(null);
  
    const screenshot = async () => {
        const video = videoRef.current;
        if (!video) return;
    
        try {
            setIsCapturing(true);
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
          setIsCapturing(false);
        } catch (error) {
          console.error('Screenshot error:', error);
          alert('Failed to capture screenshot: ' + error.message);
        } 
      }
      

     
      const createTimeline = () => {    
            const video = videoRef.current;
            const duration = video?.duration || 0;
            const interval = duration / 10;
            const timestamps = [];
            for (let i = 0; i < 10; i++) {
            timestamps.push((i * interval).toFixed(2));
            }
            captureTimelinImages(timestamps);
        }

        const captureTimelinImages = async (timestamps) => {

            const newScreenshots = [];
            for (const timestamp of timestamps) {
                console.log('Capturing screenshot at timestamp:', timestamp);
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
            
            newScreenshots.push({
              id: Math.random().toString(36).slice(2),
              url,
              filename,
              timestamp,
              blob
            });
          }
        //   onTimelineImagesChange?.(screenshots.concat(newScreenshots));
        setTimelineImages(screenshots.concat(newScreenshots));
          console.log('Screenshots:', screenshots);
            
        }

   useEffect(() => {
    if(!selectedVideo){
        return
    }
    createTimeline()
   }, [selectedVideo])

   const nextFrame = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.min(video.currentTime + 1, video.duration);
      
    }
  }

  const previousFrame = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Math.max(video.currentTime - 0.5, 0);
    }
  }
      
  
    return (
    <div className='w-full flex flex-col gap-2'>
        <Card>
            <CardContent className='py-6 w-full justify-center'>
                {/* <video controls src={selectedVideo}  className='w-full'/> */}
                <video 
              src={selectedVideo}
              controls 
              playsInline
              webkit-playsinline="true"
              x5-playsinline="true"
              ref={videoRef}
            //   style={{
            //     maxHeight: '70vh',
            //     objectFit: 'contain',
            //     backgroundColor: 'black'
            //   }}
              className='w-full max-h-[70vh] h-full object-contain bg-black' 
              />
            </CardContent>
            <CardFooter>
                <div className='w-full flex justify-between items-center'>
                    <div className='flex gap-1'>
                        <Button variant="outline" onClick={screenshot} disabled={isCapturing}>
                            {isCapturing ?
                           
                            <div className='animate-spin'>
                                <LoaderCircle className='text-primary'/>
                            </div>
                             :
                              <Image/>
                              }
                        </Button>
                        <Button variant="outline">
                                <Play/>
                        </Button>
                        <Button variant="outline">
                                <ChevronRight/>
                        </Button>
                    </div>
                    <div className='flex gap-1' onClick={previousFrame}>
                        <Button variant="outline">
                                <ChevronLeft/>
                        </Button>
                        <Button variant="outline" >
                                <Play/>
                        </Button>
                        <Button variant="outline" onClick={nextFrame}>
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

        <Card>
            <CardContent>
                <Seekbar timelineImages={timelineImages} video={videoRef}/>
            </CardContent> 
        </Card>
    </div>
  )
}
