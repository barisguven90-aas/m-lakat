import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text, language, companyStyle } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        const trimmedText = text.slice(0, 1000);
        const langCode = language === 'tr' ? 'tr' : 'en';

        // 1. Try Google Cloud TTS if key is present
        const apiKey = process.env.GOOGLE_TTS_API_KEY;
        if (apiKey) {
            try {
                let voiceName = language === 'tr' ? 'tr-TR-Wavenet-B' : 'en-US-Neural2-F';
                if (language === 'tr') {
                    if (companyStyle === 'startup') voiceName = 'tr-TR-Wavenet-A';
                    else voiceName = 'tr-TR-Wavenet-B';
                } else {
                    if (companyStyle === 'startup') voiceName = 'en-US-Neural2-F';
                    else if (companyStyle === 'corporate') voiceName = 'en-US-Neural2-D';
                    else voiceName = 'en-US-Neural2-F';
                }

                const response = await fetch(
                    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            input: { text: trimmedText },
                            voice: { languageCode: language === 'tr' ? 'tr-TR' : 'en-US', name: voiceName },
                            audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0, pitch: 0 }
                        }),
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.audioContent) {
                        const audioBuffer = Buffer.from(data.audioContent, 'base64');
                        return new NextResponse(audioBuffer, {
                            headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-cache' },
                        });
                    }
                }
            } catch (cloudErr) {
                console.warn('Google Cloud TTS failed, falling back to Free Google TTS...', cloudErr);
            }
        }

        // 2. Fallback: Free Google TTS Engine (No API Key Required!)
        const freeTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(trimmedText)}&tl=${langCode}&client=tw-ob`;
        const freeRes = await fetch(freeTtsUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (freeRes.ok) {
            const freeAudioBuffer = await freeRes.arrayBuffer();
            return new NextResponse(freeAudioBuffer, {
                headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-cache' },
            });
        }

        return NextResponse.json({ error: 'TTS generation failed' }, { status: 500 });
    } catch (error: any) {
        console.error('TTS Route Error:', error);
        return NextResponse.json({ error: error.message || 'Internal TTS error' }, { status: 500 });
    }
}
