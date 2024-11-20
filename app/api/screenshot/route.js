import { spawn } from 'child_process';
import { Readable } from 'stream';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.json();
    const { videoUrl, timestamp } = data;
    
    if (!videoUrl) {
      return new Response('No video URL provided', { status: 400 });
    }

    // Fetch video as stream
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error('Failed to fetch video');
    }

    // Create FFmpeg process
    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',  // Read from stdin
      '-ss', timestamp.toString(),
      '-vframes', '1',
      '-f', 'image2',  // Force image2 format
      '-c:v', 'png',   // Use PNG codec
      'pipe:1'         // Output to stdout
    ]);

    // Create readable stream from response body
    const videoStream = Readable.from(videoResponse.body);

    // Pipe video data to FFmpeg
    videoStream.pipe(ffmpeg.stdin);

    // Collect output data
    const chunks = [];
    ffmpeg.stdout.on('data', chunk => chunks.push(chunk));

    // Handle errors
    ffmpeg.stderr.on('data', data => console.error(`FFmpeg stderr: ${data}`));

    // Wait for FFmpeg to finish
    await new Promise((resolve, reject) => {
      ffmpeg.on('close', code => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg exited with code ${code}`));
      });
    });

    // Combine chunks into single buffer
    const screenshotBuffer = Buffer.concat(chunks);

    // Return the screenshot
    return new Response(screenshotBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename=screenshot.png'
      }
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
