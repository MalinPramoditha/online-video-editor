"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Delete, Download, ImageIcon, LoaderCircle, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function Home() {
  const { register, handleSubmit } = useForm();
  const [result, setResult] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [frameSpeed, setFrameSpeed] = useState(1);

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
      video.currentTime = Math.min(video.currentTime + frameSpeed, video.duration);
    }
  }

  const previousFrame = () => {
    const video = document.querySelector('video');
    if (video) {
      video.currentTime = Math.max(video.currentTime - frameSpeed, 0);
    }
  }

  const screenshot = async () => {
    const video = document.querySelector('video');
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
          videoUrl: selectedVideo.url,
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
      
      setScreenshots(prev => [...prev, {
        id: Math.random().toString(36).slice(2),
        url,
        filename,
        timestamp,
        blob
      }]);
    } catch (error) {
      console.error('Screenshot error:', error);
      alert('Failed to capture screenshot: ' + error.message);
    } finally {
      setIsCapturing(false);
    }
  }

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      screenshots.forEach(screenshot => {
        URL.revokeObjectURL(screenshot.url);
      });
    };
  }, [screenshots]);

  const downloadSelected = (screenshot) => {
    const a = document.createElement('a');
    a.href = screenshot.url;
    a.download = screenshot.filename;
    a.click();
  }

  const deleteSelected = (screenshot) => {
    // Revoke the URL for the deleted screenshot
    URL.revokeObjectURL(screenshot.url);
    // Remove the screenshot from state
    setScreenshots(prev => prev.filter(s => s.id !== screenshot.id));
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
            <div className="flex gap-2 items-center">
            <Button onClick={() => setFrameSpeed(frameSpeed - .1)} className="rounded-md" variant="outline">-</Button>
            <p>{frameSpeed}</p>
            <Button onClick={() => setFrameSpeed(frameSpeed + .1)} className="rounded-md" variant="outline">+</Button>
            </div>
            <Button onClick={previousFrame} className="rounded-md" variant="outline"><ChevronLeft/></Button>
            <Button className="rounded-md" variant="outline"> <Play/> </Button>
            <Button onClick={nextFrame} className="rounded-md" variant="outline"><ChevronRight/></Button>
            <Button 
              onClick={screenshot} 
              className="rounded-md" 
              variant="outline"
              disabled={isCapturing}
            > 
              {isCapturing ? (
                <div className="flex justify-center items-center">
                  <div className="animate-spin"><LoaderCircle/></div>
                </div>
              ) : (
                <ImageIcon/>
              )}
            </Button>
          </div>
          {screenshots.length > 0 && (
            <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap gap-4 mt-4">
                  {screenshots.map(screenshot => (
                    <div key={screenshot.id} className="relative">
                      <img 
                        src={screenshot.url} 
                        alt={screenshot.filename}
                        className="w-32 h-32 object-cover rounded-md"
                      />
                      <div className="absolute flex justify-between items-center bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                      <div>
                        {Math.round(screenshot.timestamp)}s
                      </div>
                      <div className="flex gap-2">
                      <a onClick={() => downloadSelected(screenshot)}><Download className="size-4"/></a>
                        <a onClick={() => deleteSelected(screenshot)}><Delete className="size-4"/></a>
                      </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <Button>Download All</Button>
                  <Button>Edit</Button>
                </div>
            </div>
          )}
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
        <Button onClick={() => {setResult(null); setSelectedVideo(null); setScreenshots([]);}}>New</Button> }


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
