import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text, voice_id } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
        }

        // Use a professional, natural-sounding voice
        // "Rachel" = 21m00Tcm4TlvDq8ikWAM (calm, professional female)
        // "Adam" = pNInz6obpgDQGcFmaJgB (deep, authoritative male)
        // "Josh" = TxGEqnHWrfWFTfGW9XjX (young professional male)
        const selectedVoice = voice_id || 'TxGEqnHWrfWFTfGW9XjX'; // Josh - natural professional male

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}/stream`,
            {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2', // Supports Turkish too
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
            console.error('ElevenLabs TTS Error:', response.status, errorText);
            return NextResponse.json({ error: 'TTS generation failed' }, { status: response.status });
        }

        // Stream the audio back
        const audioBuffer = await response.arrayBuffer();
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error: any) {
        console.error('TTS Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
