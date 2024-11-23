/**
 * Generates 10 evenly distributed screenshots from a video element
 * @param {HTMLVideoElement} videoElement - The video element to capture screenshots from
 * @returns {Promise<Array<{url: string, timestamp: number}>>} Array of screenshot objects with URL and timestamp
 */
export async function generateTimelineScreenshots(videoElement) {
    if (!videoElement || !videoElement.duration) {
        throw new Error('Invalid video element or duration not available');
    }

    const screenshots = [];
    const totalScreenshots = 10;
    const duration = videoElement.duration;
    const interval = duration / (totalScreenshots - 1); // -1 to include both start and end

    // Create canvas once and reuse
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Store original time to restore later
    const originalTime = videoElement.currentTime;

    try {
        for (let i = 0; i < totalScreenshots; i++) {
            const timestamp = i * interval;
            videoElement.currentTime = timestamp;

            // Wait for video to seek to the new timestamp
            await new Promise((resolve) => {
                const seekHandler = () => {
                    videoElement.removeEventListener('seeked', seekHandler);
                    resolve();
                };
                videoElement.addEventListener('seeked', seekHandler);
            });

            // Draw the video frame to canvas
            context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            // Convert to blob and create URL
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.7);
            });

            const url = URL.createObjectURL(blob);
            screenshots.push({
                url,
                timestamp,
                index: i
            });
        }

        // Restore original playback position
        videoElement.currentTime = originalTime;

        return screenshots;
    } catch (error) {
        console.error('Error generating timeline screenshots:', error);
        throw error;
    }
}
