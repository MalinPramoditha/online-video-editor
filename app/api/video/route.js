export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return new Response('Video URL is required', { status: 400 });
  }

  try {
    const response = await fetch(videoUrl);
    
    // Forward the response with appropriate headers
    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
        'Content-Length': response.headers.get('Content-Length'),
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    return new Response('Error fetching video', { status: 500 });
  }
}
