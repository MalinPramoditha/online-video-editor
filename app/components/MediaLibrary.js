'use client'
import React, { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Crop, Download, Grid2X2, Rows2 } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from '@/components/ui/button'

export default function MediaLibrary() {

const [media, setMedia] = useState([
    {
      url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-26-33_825_tlkroo.png',
    },
    {
      url: 'https://res.cloudinary.com/gamey/image/upload/v1732263103/screenshot_2024-11-20_21-00-45_094_y4mxyf.png',
    },
  ]);
  const [toggleValue, setToggleValue] = useState(false);

  return (
    <div className='h-full flex flex-col justify-between items-between'>
        <div className='flex flex-col'>
            <div className='flex justify-between items-center p-2'>
                <div>
                    <h6 className='text-sm'>12 Images / 4 Videos</h6>
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
                        {media.map((media, index) => (
                            <div key={index} className='relative'>
                                <img src={media.url} className="size-32 object-cover rounded-md" />
                            </div>
                        ))}
                    </div>
                    :
                    <div className='flex flex-col gap-2 p-2'>
                        {media.map((media, index) => (
                            <div key={index} className='relative flex gap-2 items-center'>
                                <img src={media.url} className="h-10 w-20 object-cover rounded-md" />
                                <p>{index}</p>
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
  )
}
