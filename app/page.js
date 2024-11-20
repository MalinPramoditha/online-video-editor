"use client";

import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, Play } from "lucide-react";

export default function Home() {
  const { register, handleSubmit } = useForm();
  const [result, setResult] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);


  const onSubmit = async (data) => {

    await fetch("/api/extract", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(res => res.json()).then(setResult);

  };

  console.log(result);

  return (
    <div className="flex flex-col gap-4 h-screen items-center justify-center">


        { selectedVideo &&  
        <div className="flex flex-col gap-4 items-center">
          <div className="flex justify-center">
            <video src={selectedVideo?.url} controls width={500} height={200} />
          </div>
          <div className="flex gap-4">
            <Button className="rounded-md" variant="outline"><ChevronLeft/></Button>
            <Button className="rounded-md" variant="outline"> <Play/> </Button>
            <Button className="rounded-md" variant="outline"><ChevronRight/></Button>
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
