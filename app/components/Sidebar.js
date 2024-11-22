import { Button } from '@/components/ui/button'
import { Import } from 'lucide-react'
import React from 'react'

export default function Sidebar() {
  return (
    <div className='flex flex-col gap-2 p-2 border-r'>
        <Button className='size-10' variant="outline">
            <Import/>
        </Button>
    </div>
  )
}
