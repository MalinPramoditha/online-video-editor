import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
        }

        // Forward the request headers
        const headers = new Headers();
        request.headers.forEach((value, key) => {
            if (key.toLowerCase() === 'range') {
                headers.set(key, value);
            }
        });

        // Add YouTube headers
        headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        headers.set('Origin', 'https://www.youtube.com');
        headers.set('Referer', 'https://www.youtube.com');

        const response = await fetch(url, {
            headers,
            method: request.method,
            duplex: 'half',
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch video' }, { status: response.status });
        }

        // Forward the response headers
        const responseHeaders = new Headers();
        response.headers.forEach((value, key) => {
            if (!['content-length', 'content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
                responseHeaders.set(key, value);
            }
        });

        // Set CORS and caching headers
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Range');
        responseHeaders.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length');
        responseHeaders.set('Cache-Control', 'public, max-age=31536000');

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function OPTIONS(request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Range',
            'Access-Control-Max-Age': '86400',
        },
    });
}
