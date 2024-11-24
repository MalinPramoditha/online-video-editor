import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
        }

        // Create headers for YouTube request
        const requestHeaders = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Range': request.headers.get('range') || 'bytes=0-',
            'Origin': 'https://www.youtube.com',
            'Referer': 'https://www.youtube.com/',
            'Sec-Fetch-Dest': 'video',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'cross-site',
            'Connection': 'keep-alive'
        };

        // Make request to YouTube
        const response = await fetch(url, {
            headers: requestHeaders,
            method: 'GET'
        });

        if (!response.ok) {
            console.error('YouTube response error:', response.status, response.statusText);
            return NextResponse.json({ 
                error: 'Failed to fetch video',
                status: response.status,
                statusText: response.statusText 
            }, { status: response.status });
        }

        // Get content type and other important headers
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        const contentRange = response.headers.get('content-range');

        // Create response headers
        const responseHeaders = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Range, Accept, Content-Type',
            'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
            'Content-Type': contentType || 'video/mp4',
            'Accept-Ranges': 'bytes'
        });

        // Forward important headers if they exist
        if (contentLength) responseHeaders.set('Content-Length', contentLength);
        if (contentRange) responseHeaders.set('Content-Range', contentRange);

        // Create and return response
        return new NextResponse(response.body, {
            status: response.status,
            headers: responseHeaders
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            message: error.message 
        }, { status: 500 });
    }
}

export async function OPTIONS(request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Range, Accept, Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
}
