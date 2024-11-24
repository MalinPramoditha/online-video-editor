import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
        }

        // Create a unique session ID for this request
        const sessionId = Math.random().toString(36).substring(7);
        console.log(`[${sessionId}] Original URL:`, url);

        // Decode URL if it's encoded
        const decodedUrl = decodeURIComponent(url);
        console.log(`[${sessionId}] Decoded URL:`, decodedUrl);

        // YouTube-specific headers
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://www.youtube.com',
            'Referer': 'https://www.youtube.com/',
            'Connection': 'keep-alive',
        };

        // Add range header if present in the request
        const rangeHeader = request.headers.get('range');
        if (rangeHeader) {
            headers['Range'] = rangeHeader;
            console.log(`[${sessionId}] Range header:`, rangeHeader);
        }

        console.log(`[${sessionId}] Fetching with headers:`, headers);

        const response = await fetch(decodedUrl, {
            method: 'GET',
            headers,
            redirect: 'follow',
        });

        console.log(`[${sessionId}] Response status:`, response.status);

        if (!response.ok && response.status !== 206) {
            console.error(`[${sessionId}] Proxy error:`, {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });
            return NextResponse.json({
                error: 'Failed to fetch video',
                status: response.status,
                statusText: response.statusText
            }, { status: response.status });
        }

        // Get the content type from the response or default to video/mp4
        const contentType = response.headers.get('content-type') || 'video/mp4';

        // Create response headers
        const responseHeaders = new Headers({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Range, Accept, Content-Type',
            'Access-Control-Expose-Headers': 'Content-Range, Content-Length, Accept-Ranges',
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
        });

        // Forward important headers
        ['content-range', 'content-length', 'accept-ranges'].forEach(header => {
            const value = response.headers.get(header);
            if (value) {
                responseHeaders.set(header, value);
                console.log(`[${sessionId}] Setting ${header}:`, value);
            }
        });

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
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
                'Access-Control-Allow-Headers': 'Range, Accept, Content-Type'
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
            'Access-Control-Allow-Headers': 'Range, Accept, Content-Type',
            'Access-Control-Max-Age': '86400',
        }
    });
}
