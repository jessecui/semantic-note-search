import { NextRequest, NextResponse } from 'next/server'
import { pipeline } from '@xenova/transformers'


export async function GET(request: NextRequest) {    
    const generateEmbedding = await pipeline('feature-extraction', 'Supabase/gte-small')
    const text = request.nextUrl.searchParams.get('text');
    if (!text) {
        return NextResponse.json({
            error: 'Missing text parameter',
        }, { status: 400 });
    }

    const output = await generateEmbedding(text, {
      pooling: 'mean',
      normalize: true,
    })
    
    // Extract the embedding output
    const embedding = Array.from(output.data)

    return NextResponse.json(embedding);
}