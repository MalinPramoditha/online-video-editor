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
  const [startKeyframe, setStartKeyframe] = useState(null);
  const [endKeyframe, setEndKeyframe] = useState(null);
  const [isCreatingClip, setIsCreatingClip] = useState(false);
  const [clipProgress, setClipProgress] = useState(0);
  const [clipPhase, setClipPhase] = useState(1);

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

  const handleCreateClip = async () => {
    if (!selectedVideo?.url || startKeyframe === null || endKeyframe === null) return;
    
    setIsCreatingClip(true);
    setClipProgress(0);
    setClipPhase(1);

    try {
      // First request: Get progress updates
      const response = await fetch('/api/clip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: selectedVideo.url,
          startTime: startKeyframe,
          endTime: endKeyframe,
          progressMode: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to create clip');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(5));
              console.log('Progress update:', data);
              
              setClipProgress(data.progress);
              setClipPhase(data.phase);

              if (data.done && data.tempOutputPath) {
                console.log('Processing complete, downloading file');
                
                // Second request: Download the file
                const downloadResponse = await fetch('/api/clip', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    videoUrl: selectedVideo.url,
                    startTime: startKeyframe,
                    endTime: endKeyframe,
                    progressMode: false,
                    tempOutputPath: data.tempOutputPath
                  }),
                });

                if (!downloadResponse.ok) {
                  const errorData = await downloadResponse.json();
                  throw new Error(errorData.details || errorData.error || 'Failed to download clip');
                }

                const blob = await downloadResponse.blob();
                if (blob.size === 0) {
                  throw new Error('Received empty file');
                }

                console.log('Download complete, size:', blob.size);
                
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `clip_${startKeyframe.toFixed(2)}_${endKeyframe.toFixed(2)}.mp4`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                break;
              }
            } catch (parseError) {
              console.error('Error parsing progress data:', parseError);
              console.log('Raw data:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error creating clip:', error);
      alert(error.message || 'Failed to create clip');
    } finally {
      setIsCreatingClip(false);
      setClipProgress(0);
      setClipPhase(1);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-screen items-center justify-center">


        { selectedVideo &&  
        <div className="flex flex-col gap-4 items-center">
          <div className="relative w-full max-w-3xl mx-auto">
            <video 
              src={selectedVideo.url}
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
          </div>
          <div className="flex gap-4">
            <div className="flex gap-2 items-center">
            <Button 
              onClick={() => setFrameSpeed(prev => Math.max(0.01, Number((prev - 0.01).toFixed(2))))} 
              className="rounded-md" 
              variant="outline"
            >
              -
            </Button>
            <p>{frameSpeed.toFixed(2)}</p>
            <Button 
              onClick={() => setFrameSpeed(prev => Math.min(1, Number((prev + 0.01).toFixed(2))))} 
              className="rounded-md" 
              variant="outline"
            >
              +
            </Button>
            </div>
            <Button onClick={previousFrame} className="rounded-md" variant="outline"><ChevronLeft/></Button>
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
            <Button onClick={nextFrame} className="rounded-md" variant="outline"><ChevronRight/></Button>
            
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    const video = document.querySelector('video');
                    if (video) {
                      setStartKeyframe(video.currentTime);
                    }
                  }}
                  variant={startKeyframe !== null ? "default" : "outline"}
                >
                  {startKeyframe !== null ? `Start: ${startKeyframe.toFixed(2)}s` : 'Set Start'}
                </Button>
                <Button 
                  onClick={() => {
                    const video = document.querySelector('video');
                    if (video) {
                      setEndKeyframe(video.currentTime);
                    }
                  }}
                  variant={endKeyframe !== null ? "default" : "outline"}
                >
                  {endKeyframe !== null ? `End: ${endKeyframe.toFixed(2)}s` : 'Set End'}
                </Button>
              </div>
              {startKeyframe !== null && endKeyframe !== null && (
                <div className="flex items-center space-x-4">
                  <Button
                    className={`px-4 py-2 rounded ${
                      isCreatingClip
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    } text-white font-semibold transition-colors`}
                    onClick={handleCreateClip}
                    disabled={!selectedVideo?.url || startKeyframe === null || endKeyframe === null || isCreatingClip}
                  >
                    {isCreatingClip ? (
                      <>
                        <div className="flex items-center gap-2">
                          Extracting... {clipProgress.toFixed(0)}%
                          {clipPhase === 1 && "(Processing)"}
                          {clipPhase === 2 && "(Converting)"}
                          {clipPhase === 3 && "(Finalizing)"}
                        </div>
                      </>
                    ) : (
                      'Extract Clip'
                    )}
                  </Button>
                  
                  {isCreatingClip && (
                    <div className="flex-1 space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${clipProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {clipPhase === 1 && 'Extracting clip...'}
                        {clipPhase === 2 && 'Converting to MP4...'}
                        {clipPhase === 3 && 'Finalizing...'}
                        {' '}({Math.round(clipProgress)}%)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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