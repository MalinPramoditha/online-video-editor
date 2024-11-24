import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        console.log('Extracting info for URL:', body.url);

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
        console.log('Received video formats:', data.formats?.length || 0);

        // Ensure we have the correct format structure
        const formats = data.formats?.map(format => ({
            ...format,
            url: format.url,
            type: format.hasVideo && format.hasAudio ? 'video_with_audio' :
                  format.hasVideo ? 'video_only' :
                  format.hasAudio ? 'audio' : 'unknown',
            quality: format.qualityLabel || format.quality || format.resolution || 'Unknown',
            ext: format.container || format.ext || 'unknown',
            fps: format.fps,
            audioQuality: format.audioQuality,
            bitrate: format.bitrate,
            formatId: format.formatId || format.itag || Math.random().toString(36).substring(7)
        })) || [];

        const response = {
            ...data,
            formats,
            thumbnailUrl: data.thumbnailUrl || data.thumbnail
        };

        console.log('Sending response with formats:', formats.length);

        return NextResponse.json(response, {
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
