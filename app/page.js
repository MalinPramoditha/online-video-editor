'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import useVideoStore from '@/app/store/videoStore';


export default function Page() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState();


  const { setVideoSrc } = useVideoStore();

  const router = useRouter();

  const selectedVideo = (format) => {
    setVideoSrc(format.url);
    router.push(`/extract`);
  }


  const getVideos = async () => {
    setLoading(true);
    try {
      await fetch(`/api/extract`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url : url }),
      }).then((res) => res.json())
      .then(setResult)

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex flex-col h-screen w-full justify-center items-center'>
        <div className='flex items-center p-2 gap-2'>
          <Input placeholder='youtube url' type='url' value={url} onChange={(e) => setUrl(e.target.value)}/>  
          <Button onClick={getVideos} disabled={loading}>
            {loading ? 'Loading...' : 'Extract'}
          </Button>
        </div>

        <div className='w-2/3 '>
          <img src={result?.thumbnailUrl} className='rounded-md' />

          <div className='flex flex-wrap gap-2 py-4'>
            {result?.formats.map((format) => (
            <Button 
              key={format.formatId} 
              variant={"outline"}
              className="flex flex-col items-start p-2 h-auto"
              onClick={() => selectedVideo(format)}
            >
              <div className="flex items-center gap-2">
                {format.type === "video_with_audio" && (
                  <span className="text-xs bg-green-500/20 text-green-700 px-1 rounded">Combined</span>
                )}
                {format.type === "video_only" && (
                  <span className="text-xs bg-blue-500/20 text-blue-700 px-1 rounded">Video</span>
                )}
                {format.type === "audio" && (
                  <span className="text-xs bg-purple-500/20 text-purple-700 px-1 rounded">Audio</span>
                )}
                <span className="text-sm font-medium">
                  {format.quality || format.label}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {format.ext.toUpperCase()} • {format.fps ? `${format.fps}fps •` : ''} 
                {format.audioQuality ? ` ${format.audioQuality.replace('AUDIO_QUALITY_', '')}` : ''}
                {format.bitrate ? ` • ${Math.round(format.bitrate / 1024)}kbps` : ''}
              </div>
            </Button>
            ))}
          </div>
        </div>
    </div>
  )
}
