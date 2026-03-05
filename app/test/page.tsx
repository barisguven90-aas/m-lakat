'use client';
import { useState, useRef } from 'react';

export default function TestPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const log = (...msg: any[]) => setLogs(p => [...p, msg.map(m => String(m)).join(' ')]);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleTest = async () => {
        log('Click handled. Creating audio.');
        try {
            const silentAudio = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');
            silentAudio.volume = 0;
            await silentAudio.play();
            log('Silent audio played.');
        } catch (e: any) {
            log('Silent audio play failed:', e.message);
        }

        try {
            log('Fetching TTS...');
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: 'Test audio output.', language: 'en', companyStyle: 'standard' })
            });
            log('TTS Fetch status:', res.status);
            if (!res.ok) {
                log('TTS body:', await res.text());
                return;
            }
            const blob = await res.blob();
            log('Blob size:', blob.size);
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.onended = () => log('Audio ended successfully');
            audio.onerror = (e) => log('Audio error fired');

            log('Calling play...');
            await audio.play();
            log('Audio play returned OK!');
        } catch (err: any) {
            log('Error in flow:', err.message);
        }
    };

    return (
        <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
            <button id="test-btn" onClick={handleTest} style={{ padding: '20px', fontSize: '20px' }}>Test Audio</button>
            <div id="logs" style={{ marginTop: '20px', whiteSpace: 'pre-wrap' }}>
                {logs.join('\n')}
            </div>
        </div>
    );
}
