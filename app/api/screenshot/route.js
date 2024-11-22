import { spawn } from 'child_process';
import { Readable } from 'stream';

const MAX_RETRIES = 3;
const TIMEOUT = 30000; // 30 seconds

async function captureScreenshot(videoUrl, timestamp, attempt = 1) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      if (ffmpegProcess) {
        ffmpegProcess.kill('SIGKILL');
        console.log(`Killed FFmpeg process for attempt ${attempt} due to timeout`);
      }
      if (attempt < MAX_RETRIES) {
        console.log(`Attempt ${attempt} timed out after ${TIMEOUT}ms, retrying...`);
        setTimeout(() => {
          resolve(captureScreenshot(videoUrl, timestamp, attempt + 1));
        }, 2000);
      } else {
        reject(new Error(`Screenshot capture timed out after ${MAX_RETRIES} attempts (${TIMEOUT}ms each)`));
      }
    }, TIMEOUT);

    console.log(`Starting screenshot attempt ${attempt} for timestamp ${timestamp}`);

    // FFmpeg command with fast seeking
    const ffmpegArgs = [
      '-y',
      '-ss', timestamp.toString(), // Seek before input for faster seeking
      '-reconnect', '1',
      '-reconnect_at_eof', '1',
      '-reconnect_streamed', '1',
      '-reconnect_delay_max', '5',
      '-i', videoUrl,
      '-frames:v', '1',
      '-vf', 'scale=1280:-1',
      '-c:v', 'png',
      '-f', 'image2pipe',
      '-v', 'error', // Only show errors in output
      'pipe:1'
    ];

    // Add user agent for YouTube URLs
    if (videoUrl.includes('googlevideo.com')) {
      ffmpegArgs.splice(1, 0, 
        '-user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        '-headers', 'Origin: https://www.youtube.com\r\nReferer: https://www.youtube.com\r\n'
      );
    }

    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const chunks = [];
    let ffmpegError = '';
    let hasReceivedData = false;
    let isErrorFatal = false;

    ffmpegProcess.stdout.on('data', (chunk) => {
      hasReceivedData = true;
      chunks.push(chunk);
    });

    ffmpegProcess.stderr.on('data', (data) => {
      const message = data.toString();
      ffmpegError += message;
      console.log(`FFmpeg message (attempt ${attempt}):`, message);
      
      // Check for specific errors
      if (message.includes('403') || message.includes('401') || 
          message.includes('forbidden') || message.includes('unauthorized')) {
        isErrorFatal = true;
        ffmpegProcess.kill('SIGKILL');
        clearTimeout(timeoutId);
        reject(new Error('Video URL has expired or is not accessible. Please refresh the page and try again.'));
      }
    });

    ffmpegProcess.on('error', (error) => {
      clearTimeout(timeoutId);
      console.error(`FFmpeg process error (attempt ${attempt}):`, error);
      if (!isErrorFatal && attempt < MAX_RETRIES) {
        console.log('Retrying screenshot capture after process error...');
        setTimeout(() => {
          resolve(captureScreenshot(videoUrl, timestamp, attempt + 1));
        }, 2000);
      } else {
        reject(new Error(`FFmpeg process failed: ${error.message}`));
      }
    });

    ffmpegProcess.on('close', (code) => {
      clearTimeout(timeoutId);
      
      // Check if we got valid data
      if (code === 0 && chunks.length > 0 && hasReceivedData) {
        const buffer = Buffer.concat(chunks);
        // Verify the buffer is a valid PNG
        if (buffer.length > 8 && buffer.toString('hex', 0, 8) === '89504e470d0a1a0a') {
          console.log(`Screenshot captured successfully (attempt ${attempt})`);
          resolve(buffer);
          return;
        }
      }
      
      if (!isErrorFatal && attempt < MAX_RETRIES) {
        console.log(`Attempt ${attempt} failed with code ${code}, retrying...`);
        setTimeout(() => {
          resolve(captureScreenshot(videoUrl, timestamp, attempt + 1));
        }, 2000);
      } else {
        reject(new Error(`Failed to capture screenshot. ${ffmpegError}`));
      }
    });
  });
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { videoUrl, timestamp } = data;
    
    if (!videoUrl || timestamp === undefined) {
      return new Response(JSON.stringify({
        error: 'Missing parameters',
        details: 'Both videoUrl and timestamp are required'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Starting screenshot capture for:', videoUrl, 'at timestamp:', timestamp);

    const screenshotBuffer = await captureScreenshot(videoUrl, timestamp);
    
    if (!screenshotBuffer || screenshotBuffer.length === 0) {
      throw new Error('Generated screenshot is empty');
    }

    // Verify the buffer is a valid PNG
    if (screenshotBuffer.length <= 8 || screenshotBuffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
      throw new Error('Generated file is not a valid PNG image');
    }

    console.log('Screenshot captured successfully, size:', screenshotBuffer.length);

    return new Response(screenshotBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename=screenshot_${timestamp}.png`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Screenshot error:', error);
    
    // Check if the error is related to expired URL
    if (error.message.includes('expired') || error.message.includes('403') || 
        error.message.includes('401') || error.message.includes('forbidden')) {
      return new Response(JSON.stringify({
        error: 'Video URL expired',
        details: 'The video URL has expired. Please refresh the page and try again.',
        technicalDetails: error.toString()
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Screenshot capture failed',
      details: error.message,
      technicalDetails: error.toString()
    }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
