import { NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

export async function POST(request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Validate YouTube URL
        if (!ytdl.validateURL(url)) {
            return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
        }

        const info = await ytdl.getInfo(url);
        
        // Process formats to include only what we need
        const formats = info.formats.map(format => ({
            url: format.url,
            quality: format.qualityLabel || format.audioQuality,
            type: format.hasVideo && format.hasAudio ? 'video_with_audio' :
                  format.hasVideo ? 'video_only' : 'audio',
            ext: format.container,
            fps: format.fps,
            audioQuality: format.audioQuality,
            bitrate: format.bitrate,
            formatId: format.itag,
            label: format.qualityLabel || format.audioQuality
        }));

        return NextResponse.json({
            title: info.videoDetails.title,
            thumbnailUrl: info.videoDetails.thumbnails[0].url,
            formats
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    } catch (error) {
        console.error('Extract error:', error);
        return NextResponse.json(
            { error: 'Failed to extract video information' },
            { status: 500 }
        );
    }
}

export async function OPTIONS(request) {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
