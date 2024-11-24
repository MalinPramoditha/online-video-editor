import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
        }

        // YouTube-specific headers
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://www.youtube.com',
            'Referer': 'https://www.youtube.com/'
        };

        // Forward range header if present
        const rangeHeader = request.headers.get('range');
        if (rangeHeader) {
            headers['Range'] = rangeHeader;
        }

        const response = await fetch(url, { headers });

        if (!response.ok && response.status !== 206) {
            console.error('Proxy error:', response.status, response.statusText);
            return NextResponse.json({ 
                error: 'Failed to fetch video',
                status: response.status,
                statusText: response.statusText
            }, { status: response.status });
        }

        // Get content type from response or default to video/mp4
        const contentType = response.headers.get('content-type') || 'video/mp4';

        // Create response headers with CORS
        const responseHeaders = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges, Content-Type',
            'Content-Type': contentType
        });

        // Forward important headers
        ['content-range', 'content-length', 'accept-ranges'].forEach(header => {
            const value = response.headers.get(header);
            if (value) {
                responseHeaders.set(header, value);
            }
        });

        return new NextResponse(response.body, {
            status: response.status,
            headers: responseHeaders
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            message: error.message
        }, { 
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
                'Access-Control-Allow-Headers': '*'
            }
        });
    }
}

export async function OPTIONS(request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400'
        }
    });
}
