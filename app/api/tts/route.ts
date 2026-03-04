import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text, voice_id, language } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            console.error('ELEVENLABS_API_KEY is not set in environment variables');
            return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
        }

        // Use a professional, natural-sounding voice
        // "Josh" = TxGEqnHWrfWFTfGW9XjX (young professional male — good for EN)
        // "Adam" = pNInz6obpgDQGcFmaJgB (deep, authoritative male)
        // "Rachel" = 21m00Tcm4TlvDq8ikWAM (calm, professional female)
        const selectedVoice = voice_id || 'TxGEqnHWrfWFTfGW9XjX';

        // Limit text to prevent excessive API usage
        const trimmedText = text.slice(0, 1000);

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}/stream`,
            {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: trimmedText,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.3,
                        use_speaker_boost: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`ElevenLabs TTS Error [${response.status}]:`, errorText);

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
            console.error('ElevenLabs returned empty audio buffer');
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
