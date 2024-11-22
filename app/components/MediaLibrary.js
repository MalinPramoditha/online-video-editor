'use client'
import React, { useState, useEffect } from 'react'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Crop, Download, Grid2X2, Rows2 } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from '@/components/ui/button'

export default function MediaLibrary({ screenshots = [] }) {
  const [toggleValue, setToggleValue] = useState(false);
  
  // Log screenshots whenever they change
  useEffect(() => {
    console.log('Screenshots in MediaLibrary:', screenshots);
  }, [screenshots]);

  return (
    <div className='h-full flex flex-col justify-between items-between'>
        <div className='flex flex-col'>
            <div className='flex justify-between items-center p-2'>
                <div>
                    <h6 className='text-sm'>{screenshots.length} Screenshots</h6>
                </div>
                <ToggleGroup type="single" onValueChange={(value) => setToggleValue(value)}>
                    <ToggleGroupItem value={false}>
                        <Rows2/>
                    </ToggleGroupItem>
                    <ToggleGroupItem value={true}>
                        <Grid2X2/>
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            <ScrollArea className="">
                { toggleValue ?
                    <div className='flex flex-wrap gap-2 p-2'>
                        {screenshots.map((screenshot) => (
                            <div key={screenshot.id} className='relative'>
                                <img src={screenshot.url} className="size-32 object-cover rounded-md" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                                    {Math.round(screenshot.timestamp)}s
                                </div>
                            </div>
                        ))}
                    </div>
                    :
                    <div className='flex flex-col gap-2 p-2'>
                        {screenshots.map((screenshot) => (
                            <div key={screenshot.id} className='relative flex gap-2 items-center'>
                                <img src={screenshot.url} className="h-10 w-20 object-cover rounded-md" />
                                <p>{Math.round(screenshot.timestamp)}s</p>
                            </div>
                        ))}
                    </div>
                }
            </ScrollArea>
        </div>

        <div>
            <div className='flex gap-2 p-2'>
                <Button  variant="outline"><Download/></Button>
                <Button variant="outline"><Crop/></Button>
            </div>
        </div>
    </div>
  );
}
