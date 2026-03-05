import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text, voice_id, language, companyStyle } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error('OPENAI_API_KEY is not set in environment variables');
            return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
        }

        // Map company style to different OpenAI voices for variety
        // Voices available: alloy, echo, fable, onyx, nova, and shimmer
        const STYLE_VOICES: Record<string, string> = {
            standard: 'alloy',   // Neutral, standard
            corporate: 'onyx',   // Deep, formal, authoritative 
            google: 'echo',      // Clear, friendly
            amazon: 'shimmer',   // Confident
            startup: 'nova',     // Energetic, casual
        };
        const selectedVoice = voice_id || STYLE_VOICES[companyStyle || 'standard'] || 'alloy';

        // Limit text to prevent excessive API usage
        const trimmedText = text.slice(0, 1000);

        const response = await fetch(
            `https://api.openai.com/v1/audio/speech`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'tts-1',
                    input: trimmedText,
                    voice: selectedVoice,
                    response_format: 'mp3',
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenAI TTS Error [${response.status}]:`, errorText);

            // Return specific error info for debugging
            return NextResponse.json({
                error: 'TTS generation failed',
                status: response.status,
                detail: errorText.slice(0, 200)
            }, { status: response.status });
        }

        // Stream the audio back
        const audioBuffer = await response.arrayBuffer();

        if (audioBuffer.byteLength === 0) {
            console.error('OpenAI returned empty audio buffer');
            return NextResponse.json({ error: 'Empty audio response' }, { status: 500 });
        }

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error: any) {
        console.error('TTS Error:', error);
        return NextResponse.json({ error: error.message || 'Internal TTS error' }, { status: 500 });
    }
}
