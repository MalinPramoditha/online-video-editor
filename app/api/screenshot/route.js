import { spawn } from 'child_process';
import { Readable } from 'stream';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

export async function POST(request) {
  let ffmpegProcess = null;

  try {
    const data = await request.json();
    const { videoUrl, timestamp } = data;
    
    if (!videoUrl) {
      return new Response('No video URL provided', { status: 400 });
    }

    console.log('Starting screenshot capture at timestamp:', timestamp);

    // Create FFmpeg process with two-pass seeking
    ffmpegProcess = spawn('ffmpeg', [
      '-y',                         // Overwrite output files
      '-ss', Math.max(0, timestamp - 1).toString(),  // Seek before target
      '-reconnect', '1',
      '-reconnect_at_eof', '1',
      '-reconnect_streamed', '1',
      '-i', videoUrl,
      '-ss', '1',                   // Fine-tune seek to exact frame
      '-frames:v', '1',
      '-an',                        // Disable audio
      '-sn',                        // Disable subtitles
      '-vf', 'scale=w=1280:h=-2',   // Scale width to 1280px
      '-vsync', '0',                // Video sync method
      '-strict', '-2',              // Less strict timestamp checking
      '-avoid_negative_ts', 'make_zero',
      '-q:v', '1',                  // Highest quality
      '-f', 'image2pipe',
      '-c:v', 'png',
      'pipe:1'
    ]);

    console.log('FFmpeg process started with command:', ffmpegProcess.spawnargs.join(' '));

    // Set up error handling with detailed logging
    let ffmpegError = '';
    let lastProgress = Date.now();
    let hasSeenFrame = false;
    
    ffmpegProcess.stderr.on('data', (data) => {
      const message = data.toString();
      lastProgress = Date.now();
      
      if (!message.includes('frame=') && !message.includes('time=')) {
        console.log('FFmpeg message:', message);
        ffmpegError += message;
      }

      if (message.includes('frame=')) {
        hasSeenFrame = true;
      }
    });

    // Collect output with progress monitoring
    const chunks = [];
    try {
      await new Promise((resolve, reject) => {
        // Progress check interval
        const progressInterval = setInterval(() => {
          const now = Date.now();
          if (now - lastProgress > 15000) { // 15 second progress timeout
            clearInterval(progressInterval);
            if (ffmpegProcess) ffmpegProcess.kill();
            reject(new Error('No progress for 15 seconds'));
          }
        }, 1000);

        // Overall timeout
        const timeout = setTimeout(() => {
          clearInterval(progressInterval);
          if (ffmpegProcess) ffmpegProcess.kill();
          reject(new Error('Overall processing timeout'));
        }, 90000); // 90 second total timeout

        ffmpegProcess.stdout.on('data', (chunk) => {
          lastProgress = Date.now();
          chunks.push(chunk);
        });

        ffmpegProcess.on('close', (code) => {
          clearTimeout(timeout);
          clearInterval(progressInterval);
          console.log('FFmpeg process closed with code:', code);
          
          if (chunks.length > 0 && hasSeenFrame) {
            console.log('Successfully captured screenshot');
            resolve();
          } else {
            console.error('FFmpeg error output:', ffmpegError);
            reject(new Error('Failed to capture screenshot: No valid frame generated'));
          }
        });
      });

      const screenshotBuffer = Buffer.concat(chunks);
      console.log('Screenshot buffer size:', screenshotBuffer.length);

      if (screenshotBuffer.length === 0) {
        throw new Error('Generated screenshot is empty');
      }

      return new Response(screenshotBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename=screenshot.png',
          'Cache-Control': 'no-cache'
        }
      });

    } catch (error) {
      console.error('Processing error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Screenshot error:', error);
    if (ffmpegProcess) ffmpegProcess.kill();
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString(),
      ffmpegError: ffmpegError
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
