import { NextResponse } from 'next/server';
import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { text, language, companyStyle } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        // Map language/style to Edge TTS Neural voices
        // tr-TR options: tr-TR-AhmetNeural (male), tr-TR-EmelNeural (female)
        // en-US options: en-US-AriaNeural (female), en-US-ChristopherNeural (male), en-US-GuyNeural (male)
        let selectedVoice = language === 'tr' ? 'tr-TR-AhmetNeural' : 'en-US-AriaNeural';

        if (language === 'tr') {
            if (companyStyle === 'startup') selectedVoice = 'tr-TR-EmelNeural';
            else if (companyStyle === 'corporate') selectedVoice = 'tr-TR-AhmetNeural';
            else selectedVoice = 'tr-TR-AhmetNeural';
        } else {
            if (companyStyle === 'startup') selectedVoice = 'en-US-GuyNeural';
            else if (companyStyle === 'corporate') selectedVoice = 'en-US-ChristopherNeural';
            else selectedVoice = 'en-US-AriaNeural';
        }

        // Add character limit to avoid exceptionally long edge streams
        const trimmedText = text.slice(0, 1500);

        const tts = new EdgeTTS({ voice: selectedVoice, lang: language === 'tr' ? 'tr-TR' : 'en-US' });

        // Generate a random unique file path in Vercel's temporary directory
        const tmpFile = path.join(os.tmpdir(), `tts-${Date.now()}-${Math.random().toString(36).substring(7)}.mp3`);

        await tts.ttsPromise(trimmedText, tmpFile);

        // Read the file buffer
        const audioBuffer = fs.readFileSync(tmpFile);

        // Clean up synchronously
        try { fs.unlinkSync(tmpFile); } catch (e) { console.error('Failed to unlink tmp audio file', e); }

        if (audioBuffer.byteLength === 0) {
            console.error('Edge TTS returned empty audio buffer');
            return NextResponse.json({ error: 'Empty audio response' }, { status: 500 });
        }

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'no-cache',
            },
        });
    } catch (error: any) {
        console.error('Edge TTS Error:', error);
        return NextResponse.json({ error: error.message || 'Internal TTS error' }, { status: 500 });
    }
}
