import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: {
                'Range': request.headers.get('range') || '',
                'Origin': 'https://www.youtube.com',
                'Referer': 'https://www.youtube.com'
            }
        });

        // Forward all relevant headers
        const headers = new Headers();
        response.headers.forEach((value, key) => {
            headers.set(key, value);
        });
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Failed to proxy video' }, { status: 500 });
    }
}
