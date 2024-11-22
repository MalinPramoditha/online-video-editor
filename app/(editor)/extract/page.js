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

export default function page() {
  const [screenshots, setScreenshots] = useState([]);
  const [timelineImages, setTimelineImages] = useState([]);

  return (
    <div className='w-full'>
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={25}  className='p-2'>
                <MediaLibrary screenshots={screenshots}/>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} minSize={50} className='p-2'>
                <VideoPlayer onScreenshotsChange={setScreenshots } onTimelineImagesChange={setTimelineImages}/>
            </ResizablePanel>
        </ResizablePanelGroup>
        <Seekbar timelineImages={timelineImages}/>

    </div>
  )
}
