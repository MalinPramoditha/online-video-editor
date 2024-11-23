'use client'
import React, { useState } from 'react'
import VideoPlayer from '@/app/components/VideoPlayer'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"
import MediaLibrary from '@/app/components/MediaLibrary'
import Seekbar from '@/app/components/Seekbar'
import useVideoStore from '@/app/store/videoStore';

export default function Page() {
  const [screenshots, setScreenshots] = useState([]);
  const { videoSrc } = useVideoStore();
  const [timelineImages, setTimelineImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(videoSrc);
  
    return (
    <div className='w-full'>
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={25}  className='p-2'>
                <MediaLibrary screenshots={screenshots}/>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={70} minSize={70} className='p-2'>
                <VideoPlayer onScreenshotsChange={setScreenshots } onTimelineImagesChange={setTimelineImages} video={selectedVideo}/>
            </ResizablePanel>
        </ResizablePanelGroup>

    </div>
  )
}
