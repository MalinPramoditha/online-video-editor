import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import os from 'os';
import crypto from 'crypto';

// Helper function to parse FFmpeg progress
function parseProgress(line) {
  const timeMatch = line.match(/time=(\d+:\d+:\d+.\d+)/);
  if (timeMatch) {
    const [hours, minutes, seconds] = timeMatch[1].split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return null;
}

export async function POST(request) {
  let ffmpegProcess = null;
  let ffmpegError = '';
  let tempInputPath = null;
  let tempOutputPath = null;

  try {
    const data = await request.json();
    console.log('Received request with data:', data);

    const { videoUrl, startTime, endTime, progressMode, tempOutputPath: inputTempPath } = data;
    
    if (!videoUrl || startTime === undefined || endTime === undefined) {
      return new Response('Missing required parameters', { status: 400 });
    }

    if (startTime >= endTime) {
      return new Response('Start time must be less than end time', { status: 400 });
    }

    // If this is a download request
    if (!progressMode && inputTempPath) {
      console.log('Processing download request for file:', inputTempPath);
      try {
        // Check if file exists
        await fs.access(inputTempPath);
        
        // Read the final MP4 file
        const finalBuffer = await fs.readFile(inputTempPath);
        console.log('Successfully read file, size:', finalBuffer.length);
        
        // Clean up temporary files
        try {
          await fs.unlink(inputTempPath);
          console.log('Cleaned up temporary file');
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }

        return new Response(finalBuffer, {
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Disposition': `attachment; filename=clip_${startTime.toFixed(2)}_${endTime.toFixed(2)}.mp4`,
            'Cache-Control': 'no-cache'
          }
        });
      } catch (error) {
        console.error('Error processing download request:', error);
        return new Response(JSON.stringify({ 
          error: 'Failed to process video file',
          details: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // This is a progress tracking request
    console.log('Processing progress tracking request');
    
    // Create temporary file paths
    const tempDir = os.tmpdir();
    const randomId = crypto.randomBytes(8).toString('hex');
    tempInputPath = join(tempDir, `input_${randomId}.mkv`);
    tempOutputPath = join(tempDir, `output_${randomId}.mp4`);

    console.log('Created temporary paths:', {
      tempInputPath,
      tempOutputPath
    });

    // Calculate duration
    const duration = endTime - startTime;
    console.log('Clip duration:', duration);

    // Create ReadableStream for progress updates
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('Starting FFmpeg extraction process');
          
          // First FFmpeg process: Extract clip to temporary MKV file
          ffmpegProcess = spawn('ffmpeg', [
            '-y',
            '-reconnect', '1',
            '-reconnect_at_eof', '1',
            '-reconnect_streamed', '1',
            '-i', videoUrl,
            '-ss', startTime.toString(),
            '-t', duration.toString(),
            '-map', '0:v:0',
            '-map', '0:a:0?',
            '-c:v', 'copy',
            '-c:a', 'copy',
            '-avoid_negative_ts', 'make_zero',
            '-progress', 'pipe:2',
            tempInputPath
          ]);

          let lastProgress = Date.now();
          let hasSeenProgress = false;
          
          await new Promise((resolve, reject) => {
            ffmpegProcess.stderr.on('data', (data) => {
              const message = data.toString();
              lastProgress = Date.now();
              
              const currentTime = parseProgress(message);
              if (currentTime !== null) {
                hasSeenProgress = true;
                const progress = Math.min(((currentTime / duration) * 45), 45);
                controller.enqueue(`data: ${JSON.stringify({ progress, phase: 1 })}\n\n`);
              } else if (!message.includes('frame=') && !message.includes('time=')) {
                console.log('FFmpeg message:', message);
                ffmpegError += message;
              }
            });

            ffmpegProcess.on('error', (error) => {
              console.error('FFmpeg process error:', error);
              reject(error);
            });

            ffmpegProcess.on('close', (code) => {
              console.log('FFmpeg extraction process closed with code:', code);
              if (code === 0 && hasSeenProgress) {
                resolve();
              } else {
                reject(new Error(`FFmpeg extraction failed with code ${code}: ${ffmpegError}`));
              }
            });
          });

          console.log('Starting remux process');
          
          // Second FFmpeg process: Convert MKV to MP4
          const remuxProcess = spawn('ffmpeg', [
            '-y',
            '-i', tempInputPath,
            '-c', 'copy',
            '-movflags', '+faststart',
            tempOutputPath
          ]);

          let remuxError = '';
          await new Promise((resolve, reject) => {
            remuxProcess.stderr.on('data', (data) => {
              const message = data.toString();
              console.log('Remux message:', message);
              remuxError += message;
              controller.enqueue(`data: ${JSON.stringify({ progress: 75, phase: 2 })}\n\n`);
            });

            remuxProcess.on('error', (error) => {
              console.error('Remux process error:', error);
              reject(error);
            });

            remuxProcess.on('close', async (code) => {
              console.log('Remux process closed with code:', code);
              if (code === 0) {
                resolve();
              } else {
                reject(new Error(`Remuxing failed with code ${code}: ${remuxError}`));
              }
            });
          });

          // Verify the output file exists and is readable
          await fs.access(tempOutputPath);
          const stats = await fs.stat(tempOutputPath);
          console.log('Output file created successfully, size:', stats.size);

          // Signal completion
          controller.enqueue(`data: ${JSON.stringify({ 
            progress: 100, 
            phase: 3, 
            done: true,
            tempOutputPath
          })}\n\n`);
          
          controller.close();

        } catch (error) {
          console.error('Stream processing error:', error);
          controller.error(error);
        }
      },
      cancel() {
        console.log('Stream cancelled, cleaning up processes');
        if (ffmpegProcess) ffmpegProcess.kill();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Top-level error:', error);
    
    // Clean up temporary files if they exist
    if (tempInputPath) {
      await fs.unlink(tempInputPath).catch(err => 
        console.error('Error cleaning up input file:', err)
      );
    }
    if (tempOutputPath) {
      await fs.unlink(tempOutputPath).catch(err => 
        console.error('Error cleaning up output file:', err)
      );
    }
    
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
