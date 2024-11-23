'use client'
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter
} from "@/components/ui/card";
import { ArrowLeftRight, ChevronLeft, ChevronRight, CornerLeftDown, CornerRightDown, Gauge, Image, LoaderCircle, Minus, Pause, Play, Plus, Scissors } from 'lucide-react';
import { captureVideoFrame, generateTimelineScreenshots, cleanupScreenshots } from '../utils/videoUtils';
import { useEffect, useState, useRef, useCallback } from 'react';
import Seekbar from './Seekbar';


export default function VideoPlayer({ onScreenshotsChange, onTimelineImagesChange, video }) {
    const [selectedVideo, setSelectedVideo] = useState(video);
    const [screenshots, setScreenshots] = useState([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [timelineImages, setTimelineImages] = useState([]);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadingFrame, setLoadingFrame] = useState(null); // 'next', 'previous', or null
    const [showFrameSpeedControls, setShowFrameSpeedControls] = useState(false);
    const [showPlayerSpeedControls, setShowPlayerSpeedControls] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [frameSpeed, setFrameSpeed] = useState(1);
    const videoRef = useRef(null);

    // Get proxied video URL
    const getProxiedUrl = (url) => {
        if (!url) return '';
        return `/api/proxy?url=${encodeURIComponent(url)}`;
    };

    const decreaseSpeed = useCallback(() => {
        setPlaybackSpeed(prev => Math.round((Math.max(0.10, prev - 0.10)) * 100) / 100);
    }, []);

    const increaseSpeed = useCallback(() => {
        setPlaybackSpeed(prev => Math.round((Math.min(4, prev + 0.10)) * 100) / 100);
    }, []);

    const decreaseFrameSpeed = useCallback(() => {
        setFrameSpeed(prev => {
            if (prev > 0.10) {
                return Number((prev - 0.10).toFixed(2));
            }
            return Math.max(0.01, Number((prev - 0.01).toFixed(2)));
        });
    }, []);

    const increaseFrameSpeed = useCallback(() => {
        setFrameSpeed(prev => {
            if (prev >= 0.10) {
                return Math.min(4, Number((prev + 0.10).toFixed(2)));
            }
            return Math.min(0.10, Number((prev + 0.01).toFixed(2)));
        });
    }, []);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [selectedVideo]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    const handleVideoLoaded = () => {
        setError(null);
    };

    // Video source with proxy
    const videoSource = getProxiedUrl(selectedVideo);

    const captureScreenshot = async () => {
        if (!videoRef.current) return;
        
        try {
            setIsCapturing(true);
            const screenshot = await captureVideoFrame(videoRef.current, videoRef.current.currentTime);
            setScreenshots(prev => {
                const newScreenshots = [...prev, screenshot];
                if (onScreenshotsChange) {
                    onScreenshotsChange(newScreenshots);
                }
                return newScreenshots;
            });
        } catch (error) {
            console.error('Failed to capture screenshot:', error);
        } finally {
            setIsCapturing(false);
        }
    };

    const createTimeline = async () => {
        if (!selectedVideo) return;
        
        try {
            const newTimelineImages = await generateTimelineScreenshots(videoSource);
            setTimelineImages(newTimelineImages);
            if (onTimelineImagesChange) {
                onTimelineImagesChange(newTimelineImages);
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
            cleanupScreenshots(screenshots);
            cleanupScreenshots(timelineImages);
        };
    }, []);

   const nextFrame = async () => {
    const video = videoRef.current;
    if (video) {
        setLoadingFrame('next');
        try {
            const seekPromise = new Promise((resolve) => {
                const seekHandler = () => {
                    video.removeEventListener('seeked', seekHandler);
                    resolve();
                };
                video.addEventListener('seeked', seekHandler);
            });

            video.currentTime = Math.min(video.currentTime + frameSpeed, video.duration);
            await seekPromise;
        } finally {
            setLoadingFrame(null);
        }
    }
  }

  const previousFrame = async () => {
    const video = videoRef.current;
    if (video) {
      setLoadingFrame('previous');
      try {
        const seekPromise = new Promise((resolve) => {
          const seekHandler = () => {
            video.removeEventListener('seeked', seekHandler);
            resolve();
          };
          video.addEventListener('seeked', seekHandler);
        });

        video.currentTime = Math.max(video.currentTime - frameSpeed, 0);
        await seekPromise;
      } finally {
        setLoadingFrame(null);
      }
    }
  }

  const handleSeek = (time) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            // Ensure the video plays after seeking if it was already playing
            if (!videoRef.current.paused) {
                videoRef.current.play();
            }
        }
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Update isPlaying state when video plays or pauses
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

    return (
    <div className='w-full flex flex-col gap-2'>
        <Card>
            <CardContent className='py-6 w-full justify-center'>
                <video 
                    src={videoSource}
                    // controls 
                    playsInline
                    webkit-playsinline="true"
                    x5-playsinline="true"
                    ref={videoRef}
                    crossOrigin="anonymous"
                    className='w-full max-h-[70vh] h-full object-contain bg-black'
                    onLoadedMetadata={(e) => {
                        if (videoRef.current) {
                            setDuration(videoRef.current.duration);
                            createTimeline();
                        }
                    }}
                />
            </CardContent>
            <CardFooter>
                <div className='w-full flex flex-col justify-between items-center'>
                    <div className='flex justify-between items-center w-full text-xs py-1'>
                        <p>Frame Speed : {frameSpeed.toFixed(2)}x</p>
                        <p>Play Speed : {playbackSpeed.toFixed(2)}x</p>
                    </div>
                    <div className='w-full flex justify-between items-center'>
                        <div className='flex gap-1'>
                            <Button variant="outline" onClick={captureScreenshot} disabled={isCapturing}>
                                {isCapturing ?
                            
                                <div className='animate-spin'>
                                    <LoaderCircle className='text-primary'/>
                                </div>
                                :
                                <Image/>
                                }
                            </Button>
                            <Button variant="outline">
                                    <Minus/>
                            </Button>
                            <Button variant="outline">
                                    <Plus/>
                            </Button>
                        </div>
                        <div className='flex gap-1'>
                            <Button variant="outline" onClick={previousFrame} disabled={loadingFrame === 'previous'}>
                                {loadingFrame === 'previous' ? 
                                    <div className="animate-spin">
                                        <LoaderCircle className="h-4 w-4"/>
                                    </div> 
                                    : 
                                    <ChevronLeft/>
                                }
                            </Button>
                            <Button variant="outline" onClick={togglePlayPause}>
                                    {isPlaying ? <Pause/> : <Play/>}
                            </Button>
                            <Button variant="outline" onClick={nextFrame} disabled={loadingFrame === 'next'}>
                                {loadingFrame === 'next' ? 
                                    <div className="animate-spin">
                                        <LoaderCircle className="h-4 w-4"/>
                                    </div> 
                                    : 
                                    <ChevronRight/>
                                }
                            </Button>
                        </div>
                        <div className='flex gap-1'>
                            {showFrameSpeedControls ? (
                                <div className='flex rounded-md p-1 border transition-all duration-300 ease-in-out transform origin-left'>
                                    <a className='flex gap-1 items-center px-3 hover:bg-accent rounded-sm transition-colors' onClick={() => {setShowFrameSpeedControls(false); setShowPlayerSpeedControls(false)}}>
                                        <ArrowLeftRight className='size-4'/>
                                    </a>

                                    <div className='flex gap-2 items-center border-l overflow-hidden animate-in slide-in-from-left'>
                                        <a 
                                            className='flex gap-1 items-center px-3 py-1 hover:bg-accent rounded-sm transition-colors'
                                            onClick={decreaseFrameSpeed}
                                        >
                                            <Minus className='size-4'/>
                                        </a>
                                        <div className='px-1 text-sm'>
                                            <p>{frameSpeed.toFixed(2)}x</p>
                                        </div>
                                        <a 
                                            className='flex gap-1 items-center px-3 py-1 hover:bg-accent rounded-sm transition-colors'
                                            onClick={increaseFrameSpeed}
                                        >
                                            <Plus className='size-4'/>
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <Button 
                                    variant="outline" 
                                    onClick={() => {setShowFrameSpeedControls(true); setShowPlayerSpeedControls(false)}}
                                    className="transition-all duration-300 ease-in-out hover:bg-accent"
                                >
                                    <ArrowLeftRight/>
                                </Button>
                            )}


                            {showPlayerSpeedControls ? (
                                <div className='flex rounded-md p-1 border transition-all duration-300 ease-in-out transform origin-right'>
                                    <div className='flex gap-2 items-center border-r overflow-hidden animate-in slide-in-from-right'>
                                        <a 
                                            className='flex gap-1 items-center px-3 py-1 hover:bg-accent rounded-sm transition-colors'
                                            onClick={decreaseSpeed}
                                        >
                                            <Minus className='size-4'/>
                                        </a>
                                        <div className='px-1 text-sm'>
                                            <p>{playbackSpeed.toFixed(2)}x</p>
                                        </div>
                                        <a 
                                            className='flex gap-1 items-center px-3 py-1 hover:bg-accent rounded-sm transition-colors'
                                            onClick={increaseSpeed}
                                        >
                                            <Plus className='size-4'/>
                                        </a>
                                    </div>

                                    <a className='flex gap-1 items-center px-3 hover:bg-accent rounded-sm transition-colors' onClick={() => setShowPlayerSpeedControls(false)}>
                                        <Gauge className='size-4'/>
                                    </a>
                                </div>
                            ) : (
                                <Button 
                                    variant="outline" 
                                    onClick={() => {setShowPlayerSpeedControls(true); setShowFrameSpeedControls(false)}}
                                    className="transition-all duration-300 ease-in-out hover:bg-accent"
                                >
                                    <Gauge/>
                                </Button>
                            )}

                        </div>
                    </div>
                </div>
            </CardFooter>
        </Card>

        <Card>
            <CardContent>
                <Seekbar 
                    video={videoRef} 
                    onSeek={handleSeek} 
                    timelineImages={timelineImages}
                    duration={duration}
                />
            </CardContent> 
        </Card>
    </div>
  )
}
