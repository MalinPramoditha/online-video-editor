import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const result = await fetch('https://submagic-free-tools.fly.dev/api/youtube-info', {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!result.ok) {
            const errorData = await result.json().catch(() => ({}));
            console.error('API Error:', {
                status: result.status,
                statusText: result.statusText,
                error: errorData
            });
            return NextResponse.json(
                { error: errorData.message || 'Failed to fetch video info' },
                { 
                    status: result.status,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    }
                }
            );
        }

        const data = await result.json();
        return NextResponse.json(data, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    } catch (error) {
        console.error('Extract API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { 
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            }
        );
    }
}

export async function OPTIONS(request) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        },
    });
}
