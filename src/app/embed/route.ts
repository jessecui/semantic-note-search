import { NextRequest, NextResponse } from 'next/server'
import fetch from 'node-fetch';

export async function GET(request: NextRequest) {    
    const text = request.nextUrl.searchParams.get('text');
    
    if (!text) {
        return NextResponse.json({
            error: 'Missing text parameter',
        }, { status: 400 });
    }

    const requestBody = {
        input: [text],
        model: 'voyage-large-2'
    };

    const response = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${"pa-W8QFeZBxvxxYeH0XkdddM_VQyprLhYxpim3f1fN8IUw"}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    });

    const embedding_response = await response.json();
    const embedding = (embedding_response as any).data[0].embedding;

    return NextResponse.json({embedding});
}