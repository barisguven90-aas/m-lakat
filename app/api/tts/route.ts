import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text, language, companyStyle } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_TTS_API_KEY;
        if (!apiKey) {
            console.error('GOOGLE_TTS_API_KEY is not set in environment variables');
            return NextResponse.json({ error: 'Google Cloud API key not configured' }, { status: 500 });
        }

        // Map language/style to Google Cloud Wavenet/Neural2 voices
        let voiceName = language === 'tr' ? 'tr-TR-Wavenet-B' : 'en-US-Neural2-F';

        if (language === 'tr') {
            // Google Cloud Turkish Premium Voices (Wavenet)
            if (companyStyle === 'startup') voiceName = 'tr-TR-Wavenet-A'; // Female
            else if (companyStyle === 'corporate') voiceName = 'tr-TR-Wavenet-B'; // Male
            else voiceName = 'tr-TR-Wavenet-B';
        } else {
            // Google Cloud English Premium Voices (Neural2)
            if (companyStyle === 'startup') voiceName = 'en-US-Neural2-F'; // Female, energetic
            else if (companyStyle === 'corporate') voiceName = 'en-US-Neural2-D'; // Male, deep
            else voiceName = 'en-US-Neural2-F';
        }

        // Trim text to prevent huge API calls (though Google supports up to 5000 chars)
        const trimmedText = text.slice(0, 1500);

        const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    input: { text: trimmedText },
                    voice: {
                        languageCode: language === 'tr' ? 'tr-TR' : 'en-US',
                        name: voiceName
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                        speakingRate: 1.0,
                        pitch: 0
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Google Cloud TTS Error [${response.status}]:`, errorText);
            return NextResponse.json({
                error: 'TTS generation failed',
                status: response.status,
                detail: errorText.slice(0, 200)
            }, { status: response.status });
        }

        const data = await response.json();

        if (!data.audioContent) {
            console.error('Google Cloud returned empty audio content');
            return NextResponse.json({ error: 'Empty audio response' }, { status: 500 });
        }

        // Convert base64 string back to an array buffer
        const audioBuffer = Buffer.from(data.audioContent, 'base64');

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error: any) {
        console.error('Google Cloud TTS Error:', error);
        return NextResponse.json({ error: error.message || 'Internal TTS error' }, { status: 500 });
    }
}
