import { NextRequest, NextResponse } from 'next/server'
import fetch from 'node-fetch';

interface HuggingFaceResponse {
    [key: number]: number;
}

export async function GET(request: NextRequest) {    
    const text = request.nextUrl.searchParams.get('text');
    
    if (!text) {
        return NextResponse.json({
            error: 'Missing text parameter',
        }, { status: 400 });
    }

    const response = await fetch(
        "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: text,
                options: {
                    wait_for_model: true
                }
            }),
        }
    );

    const embedding = await response.json() as HuggingFaceResponse[];    

    return NextResponse.json({embedding:embedding});
}