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
  const [selectedVideo, setSelectedVideo] = useState('https://rr6---sn-uxax4vopj5qx-q0n6.googlevideo.com/videoplayback?expire=1732291095&ei=t1VAZ4e4M7jLi9oP98LKsA8&ip=176.1.194.6&id=o-AIfqFwfADY91t1wJXRRqatTAnPbrUENAQWC9tB9TAnEF&itag=136&aitags=133%2C134%2C135%2C136%2C137%2C160%2C242%2C243%2C244%2C247%2C248%2C271%2C278%2C313%2C394%2C395%2C396%2C397%2C398%2C399%2C400%2C401&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&met=1732269495%2C&mh=va&mm=31%2C29&mn=sn-uxax4vopj5qx-q0n6%2Csn-4g5e6nsy&ms=au%2Crdu&mv=m&mvi=6&pl=18&rms=au%2Cau&initcwndbps=1083750&bui=AQn3pFSWBEwHACe6QKTAE8SmYn_kI7PErSBgDsHpfdcXVP_6LF0arFaSX8E5pf_xOH4spqBkwMK8L0Ab&spc=qtApAcQHVBCVa1-Xp1yWh5dF3NFqGLHStdCE_Ed3bJ3S_MOiYQ&vprv=1&svpuc=1&mime=video%2Fmp4&ns=2tnBY1cc0AXmmbrsfMDt1tcQ&rqh=1&gir=yes&clen=25413749&dur=197.600&lmt=1729734200078899&mt=1732268954&fvip=5&keepalive=yes&fexp=51319288%2C51326932%2C51335594&c=WEB&sefc=1&txp=4532434&n=TlfB5Hr8weTQuQ&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&lsparams=met%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=AGluJ3MwRAIgDY6fmGYK9NmmyHDh6jd0ywmNO1xuLOnvoUDX-tJsf44CIBXh02hvrbyP6RO7JL3hu1ONsTzI2EhowwPUCdIhW5m9&sig=AJfQdSswRgIhALvtTfGDWyKaYa9nD73DFqrWvj07fVWlcBWsVLE7xMjvAiEA2LYpYGzkDDV_ZcusoIeBnR0oxZ1CR6QfOtAgc0t0aMQ%3D');
  


  
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
        {/* <Seekbar timelineImages={timelineImages} video={selectedVideo}/> */}

    </div>
  )
}
