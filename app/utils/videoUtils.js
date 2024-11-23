/**
 * Creates a canvas and context for capturing video frames
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {{ canvas: HTMLCanvasElement, context: CanvasRenderingContext2D }}
 */
function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = width;
    canvas.height = height;
    return { canvas, context };
}

/**
 * Captures a single frame from a video element
 * @param {HTMLVideoElement} videoElement - The video element to capture from
 * @param {number} timestamp - The timestamp to capture at (in seconds)
 * @returns {Promise<{id: string, url: string, timestamp: number, blob: Blob}>}
 */
export async function captureVideoFrame(videoElement, timestamp) {
    if (!videoElement) {
        throw new Error('Invalid video element');
    }

    const originalTime = videoElement.currentTime;
    
    try {
        // Seek to timestamp
        videoElement.currentTime = timestamp;
        
        // Wait for seek to complete
        await new Promise((resolve, reject) => {
            const seekHandler = () => {
                videoElement.removeEventListener('seeked', seekHandler);
                resolve();
            };
            const errorHandler = (error) => {
                videoElement.removeEventListener('error', errorHandler);
                reject(error);
            };
            videoElement.addEventListener('seeked', seekHandler);
            videoElement.addEventListener('error', errorHandler);
        });

        // Create canvas and capture frame
        const { canvas, context } = createCanvas(videoElement.videoWidth, videoElement.videoHeight);
        
        // Set black background
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw video frame
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Convert to blob
        const blob = await new Promise((resolve, reject) => {
            try {
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
            } catch (error) {
                reject(error);
            }
        });

        if (!blob) {
            throw new Error('Failed to create blob');
        }

        const url = URL.createObjectURL(blob);
        
        return {
            id: `screenshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url,
            timestamp,
            blob
        };
    } finally {
        // Restore original position
        videoElement.currentTime = originalTime;
    }
}

/**
 * Creates a temporary video element for processing
 * @param {string} videoSrc - Source URL of the video
 * @returns {Promise<HTMLVideoElement>}
 */
async function createTempVideo(videoSrc) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.style.display = 'none';
        
        const loadHandler = () => {
            video.removeEventListener('loadedmetadata', loadHandler);
            video.removeEventListener('error', errorHandler);
            resolve(video);
        };
        
        const errorHandler = (error) => {
            video.removeEventListener('loadedmetadata', loadHandler);
            video.removeEventListener('error', errorHandler);
            reject(error);
        };
        
        video.addEventListener('loadedmetadata', loadHandler);
        video.addEventListener('error', errorHandler);
        
        video.src = videoSrc;
        video.crossOrigin = 'anonymous';
        document.body.appendChild(video);
    });
}

/**
 * Generates 10 evenly distributed screenshots from a video source
 * @param {string} videoSrc - Source URL of the video
 * @returns {Promise<Array<{id: string, url: string, timestamp: number, blob: Blob}>>}
 */
export async function generateTimelineScreenshots(videoSrc) {
    let tempVideo = null;
    const screenshots = [];

    try {
        // Create temporary video element
        tempVideo = await createTempVideo(videoSrc);
        
        if (!tempVideo.duration) {
            throw new Error('Invalid video duration');
        }

        const totalScreenshots = 10;
        const duration = tempVideo.duration;
        const interval = duration / (totalScreenshots - 1); // -1 to include both start and end

        for (let i = 0; i < totalScreenshots; i++) {
            const timestamp = i * interval;
            const screenshot = await captureVideoFrame(tempVideo, timestamp);
            screenshots.push({
                ...screenshot,
                index: i
            });
        }

        return screenshots;
    } catch (error) {
        // Clean up any created URLs before throwing
        screenshots.forEach(screenshot => {
            if (screenshot.url) {
                URL.revokeObjectURL(screenshot.url);
            }
        });
        throw error;
    } finally {
        // Clean up temporary video element
        if (tempVideo) {
            tempVideo.remove();
        }
    }
}

/**
 * Clean up screenshot resources
 * @param {Array<{url: string}>} screenshots - Array of screenshot objects containing URLs
 */
export function cleanupScreenshots(screenshots) {
    if (!Array.isArray(screenshots)) return;
    
    screenshots.forEach(screenshot => {
        if (screenshot?.url) {
            URL.revokeObjectURL(screenshot.url);
        }
    });
}
