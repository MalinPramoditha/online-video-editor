"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download, ImageIcon, Play } from "lucide-react";

export default function Home() {
  const { register, handleSubmit } = useForm();
  const [result, setResult] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      console.log('API Response:', result);
      setResult(result);
      
      if (result?.url) {
        setSelectedVideo(result);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const nextFrame = () => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = Math.min(video.currentTime + 0.1, video.duration);
    }
  }

  const previousFrame = () => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = Math.max(video.currentTime - 0.1, 0);
    }
  }

  const screenshot = async () => {
    const video = document.querySelector('video');
    if (!video) return;

    try {
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: selectedVideo.url,
          timestamp: video.currentTime
        })
      });

      if (!response.ok) {
        throw new Error('Failed to take screenshot');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Generate unique filename with date and random number
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const time = date.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 000-999
      const filename = `screenshot_${formattedDate}_${time}_${random}.png`;
      
      // Create and click a download link
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      
      // Clean up the URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Screenshot error:', error);
    }
  }

  return (
    <div className="flex flex-col gap-4 h-screen items-center justify-center">


        { selectedVideo &&  
        <div className="flex flex-col gap-4 items-center">
          <div className="flex justify-center">
            <video 
              src={selectedVideo.url}
              controls 
              width={500} 
              height={200}
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={previousFrame} className="rounded-md" variant="outline"><ChevronLeft/></Button>
            <Button className="rounded-md" variant="outline"> <Play/> </Button>
            <Button onClick={nextFrame} className="rounded-md" variant="outline"><ChevronRight/></Button>
            <Button onClick={screenshot} className="rounded-md" variant="outline"> <ImageIcon/> </Button>
          </div>
        </div>
        }



        {!result ?
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-4">
                <Input placeholder="Video URL" {...register("url")} />
                <Button> Extract </Button>
            </div>
          </form>
        :
        <Button onClick={() => {setResult(null); setSelectedVideo(null);}}>New</Button> }


        { !selectedVideo &&
        <div className="flex flex-wrap gap-4 lg:w-2/5 w-full">
            {result?.formats.map((format) => (
              <Button key={format.formatId} onClick={() => setSelectedVideo(format)}>
              {format.quality}
              </Button> 
            ))}
        </div>
        }



       
    </div>
  );
}
