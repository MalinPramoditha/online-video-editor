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
    const [selectedVideo, setSelectedVideo] = useState('');
    const [processingVideo, setProcessingVideo] = useState('');
    const [screenshots, setScreenshots] = useState([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [timelineImages, setTimelineImages] = useState([]);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadingFrame, setLoadingFrame] = useState(null);
    const [showFrameSpeedControls, setShowFrameSpeedControls] = useState(false);
    const [showPlayerSpeedControls, setShowPlayerSpeedControls] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [frameSpeed, setFrameSpeed] = useState(1);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);

    // Get proxied video URL for processing
    const getProxiedUrl = useCallback((url) => {
        if (!url) return '';
        const baseUrl = window.location.origin;
        return `${baseUrl}/api/proxy?url=${encodeURIComponent(url)}`;
    }, []);

    useEffect(() => {
        if (video) {
            console.log('Original video URL:', video);
            // Use direct URL for display
            setSelectedVideo(video);
            // Use proxied URL for processing
            const proxiedUrl = getProxiedUrl(video);
            setProcessingVideo(proxiedUrl);
        }
    }, [video, getProxiedUrl]);

    useEffect(() => {
        if (videoRef.current) {
            const handleError = (e) => {
                console.error('Video error:', e);
                console.error('Video error details:', videoRef.current.error);
                setError('Failed to load video. Please try again.');
            };

            videoRef.current.addEventListener('error', handleError);
            return () => {
                if (videoRef.current) {
                    videoRef.current.removeEventListener('error', handleError);
                }
            };
        }
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleVideoLoaded = () => {
        setError(null);
    };

    const captureScreenshot = async () => {
        if (!videoRef.current) return;
        
        try {
            setIsCapturing(true);
            const screenshot = await captureVideoFrame(videoRef.current);
            const newScreenshots = [...screenshots, screenshot];
            setScreenshots(newScreenshots);
            onScreenshotsChange(newScreenshots);
        } catch (error) {
            console.error('Error capturing screenshot:', error);
        } finally {
            setIsCapturing(false);
        }
    };

    const handleSeek = (time) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
    };

    const handleSpeedChange = (newSpeed) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = newSpeed;
            setPlaybackSpeed(newSpeed);
        }
    };

    const handleFrameSpeedChange = (newSpeed) => {
        setFrameSpeed(newSpeed);
    };

    const seekFrame = async (direction) => {
        if (!videoRef.current || loadingFrame) return;

        setLoadingFrame(direction);
        const frameTime = 1 / (30 * frameSpeed); // Assuming 30fps
        const currentTime = videoRef.current.currentTime;
        const newTime = direction === 'next' 
            ? Math.min(currentTime + frameTime, videoRef.current.duration)
            : Math.max(currentTime - frameTime, 0);

        videoRef.current.currentTime = newTime;
        setLoadingFrame(null);
    };

    const generateTimeline = async () => {
        if (!videoRef.current) return;
        
        try {
            const images = await generateTimelineScreenshots(processingVideo);
            setTimelineImages(images);
            onTimelineImagesChange(images);
        } catch (error) {
            console.error('Error generating timeline:', error);
        }
    };

    useEffect(() => {
        if(!selectedVideo){
            return
        }
        generateTimeline()
       }, [selectedVideo])

       useEffect(() => {
        return () => {
            cleanupScreenshots(screenshots);
            cleanupScreenshots(timelineImages);
        };
    }, []);

    return (
        <div className='w-full flex flex-col gap-2'>
            <Card>
                <CardContent className='py-6 w-full justify-center relative aspect-video bg-black/5'>
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                        <p>{error}</p>
                    </div>
                    )}
                    <video 
                        ref={videoRef}
                        className='w-full max-h-[70vh] h-full object-contain bg-black'
                        crossOrigin="anonymous"
                        playsInline
                        webkit-playsinline="true"
                        x5-playsinline="true"
                    >
                        {selectedVideo && <source src={selectedVideo} type="video/mp4" />}
                    </video>
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
                                    {isCapturing ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Image className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            <div className='flex gap-1'>
                                <Button variant="outline" onClick={() => handleFrameSpeedChange(Math.max(0.1, frameSpeed - 0.1))}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" onClick={() => seekFrame('previous')} disabled={loadingFrame === 'previous'}>
                                    {loadingFrame === 'previous' ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ChevronLeft className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button variant="outline" onClick={togglePlay}>
                                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                                <Button variant="outline" onClick={() => seekFrame('next')} disabled={loadingFrame === 'next'}>
                                    {loadingFrame === 'next' ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button variant="outline" onClick={() => handleFrameSpeedChange(Math.min(2, frameSpeed + 0.1))}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className='flex gap-1'>
                                <Button variant="outline" onClick={() => handleSpeedChange(Math.max(0.25, playbackSpeed - 0.25))}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" onClick={() => handleSpeedChange(Math.min(2, playbackSpeed + 0.25))}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <Seekbar duration={duration} onSeek={handleSeek} videoRef={videoRef} />
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
