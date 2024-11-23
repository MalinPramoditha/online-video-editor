'use client'
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CornerLeftDown, CornerRightDown, Image, LoaderCircle, Play, Scissors } from 'lucide-react';
import { generateTimelineScreenshots } from '../utils/videoUtils';
import { useEffect, useState, useRef } from 'react';
import Seekbar from './Seekbar';


export default function VideoPlayer({ onScreenshotsChange, onTimelineImagesChange, props }) {
    const [selectedVideo, setSelectedVideo] = useState("https://rr2---sn-8vq54voxqx-cxgs.googlevideo.com/videoplayback?expire=1732360818&ei=EmZBZ62vLdO16dsPxvrZkQU&ip=109.40.243.143&id=o-AFMmCI7jm8PBNLLpVGGkp-z5Vcd2ofazAHsBD0noTmRN&itag=137&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C278%2C330%2C331%2C332%2C333%2C334%2C335&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1732339218%2C&mh=nJ&mm=31%2C29&mn=sn-8vq54voxqx-cxgs%2Csn-i5h7lnls&ms=au%2Crdu&mv=m&mvi=2&pcm2cms=yes&pl=18&rms=au%2Cau&initcwndbps=1410000&bui=AQn3pFRcUCr2hlRIZoUGmj4zuqShpW8IjD8Q4Uxd7BzO2iadIKZmTz3b7Ld0dmlqrFOF2TOlw0kkg68l&spc=qtApAXsd2p6Pl7FRPCXZ4yRphCzjdpoJHppEpJyazSu1VGE0Og&vprv=1&svpuc=1&mime=video%2Fmp4&ns=4dG2dx6sMTSjgGcGDNGsXEAQ&rqh=1&gir=yes&clen=198271699&dur=380.100&lmt=1726578452866979&mt=1732338792&fvip=4&keepalive=yes&fexp=51326932%2C51335594&c=WEB&sefc=1&txp=6309224&n=OdJwrKZ3BvUPGQ&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgCQPAO1TpgVlbvZOzE7Gea4AJmytc7IARCFN47TYY4QYCIQDJPLptjKdiWJeszuzSMhiMSrRy82ECPNU1-Ehw5yiV2Q%3D%3D&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpcm2cms%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRAIgVGZJRbfYXWr4AqxvM0xOnF5wyF6iTYLIqovtp_iHrIQCIGYnel0T6E3qdl-MYHCccAd_SNvC7bXT8lI_ihJbkmae");
    const [screenshots, setScreenshots] = useState([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [timelineImages, setTimelineImages] = useState([]);
    const videoRef = useRef(null);

    // Get proxied video URL
    const getProxiedUrl = (url) => {
        if (!url) return '';
        try {
            return `/api/proxy?url=${encodeURIComponent(url)}`;
        } catch (e) {
            console.error('Error encoding URL:', e);
            return '';
        }
    };

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [selectedVideo]);

    const handleVideoLoaded = () => {
        setError(null);
    };

    // Video source with proxy
    const videoSource = getProxiedUrl(selectedVideo);

    const screenshot = async () => {
        const video = videoRef.current;
        if (!video) return;
    
        try {
            setIsCapturing(true);
            const timestamp = video.currentTime;
            
            // Create canvas and capture frame
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            
            // Set background to black first
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw the video frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            try {
                // Try to get blob directly
                const blob = await new Promise((resolve) => {
                    canvas.toBlob(resolve, 'image/jpeg', 0.95);
                });
                
                if (!blob) throw new Error('Failed to create blob');
                
                // Create object URL
                const url = URL.createObjectURL(blob);
                const filename = `screenshot_${timestamp}.jpg`;
                
                const newScreenshot = { url, filename, timestamp, blob };
                const updatedScreenshots = [...screenshots, newScreenshot];
                setScreenshots(updatedScreenshots);
                onScreenshotsChange?.(updatedScreenshots);
            } catch (error) {
                console.error('Canvas export error:', error);
                // Fallback: Try to get base64 data
                const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                const response = await fetch(dataUrl);
                const blob = await response.blob();
                
                const url = URL.createObjectURL(blob);
                const filename = `screenshot_${timestamp}.jpg`;
                
                const newScreenshot = { url, filename, timestamp, blob };
                const updatedScreenshots = [...screenshots, newScreenshot];
                setScreenshots(updatedScreenshots);
                onScreenshotsChange?.(updatedScreenshots);
            }
        } catch (error) {
            console.error('Error capturing screenshot:', error);
        } finally {
            setIsCapturing(false);
        }
    };

    const createTimeline = async () => {
        if (!videoRef.current) return;
        
        try {
            const screenshots = await generateTimelineScreenshots(videoRef.current);
            setTimelineImages(screenshots);
            if (onTimelineImagesChange) {
                onTimelineImagesChange(screenshots);
            }
        } catch (error) {
            console.error('Failed to create timeline:', error);
        }
    };

    useEffect(() => {
        if(!selectedVideo){
            return
        }
        createTimeline()
       }, [selectedVideo])

       useEffect(() => {
        return () => {
            // Cleanup object URLs when component unmounts
            screenshots.forEach(screenshot => {
                if (screenshot.url) {
                    URL.revokeObjectURL(screenshot.url);
                }
            });
            timelineImages.forEach(image => {
                if (image.url) {
                    URL.revokeObjectURL(image.url);
                }
            });
        };
    }, [screenshots, timelineImages]);

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
                <video 
                    src={videoSource}
                    controls 
                    playsInline
                    webkit-playsinline="true"
                    x5-playsinline="true"
                    ref={videoRef}
                    crossOrigin="anonymous"
                    className='w-full max-h-[70vh] h-full object-contain bg-black'
                    onLoadedMetadata={() => {
                        if (videoRef.current) {
                            createTimeline();
                        }
                    }}
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
