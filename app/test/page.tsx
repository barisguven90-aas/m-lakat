'use client';
import { useState, useRef } from 'react';

export default function AudioTest() {
    const [log, setLog] = useState<string[]>([]);
    const print = (m: string) => setLog(p => [...p, m]);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const attemptWebAudioTTS = async () => {
        try {
            print('Fetching...');
            const r = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: 'Web audio test.', language: 'en', companyStyle: 'standard' })
            });
            print(`Status: ${r.status}`);
            const arrayBuffer = await r.arrayBuffer();
            print(`Bytes: ${arrayBuffer.byteLength}`);

            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (audioCtxRef.current.state === 'suspended') {
                await audioCtxRef.current.resume();
            }

            print('Decoding audio data...');
            const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
            print('Decoding OK. Creating source...');

            const source = audioCtxRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtxRef.current.destination);

            source.onended = () => print("Source ended playback");

            print('Starting Web Audio playback...');
            source.start(0);
            print('Playback started successfully!');

        } catch (e: any) {
            print('Exception: ' + e.name + ' - ' + e.message);
        }
    };

    const handleStart = () => {
        print('Start click (Web Audio API)');

        // Unlock Audio Context immediately
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        audioCtxRef.current.resume().then(() => print("Context resumed: " + audioCtxRef.current?.state));

        // Simulate async API response
        setTimeout(attemptWebAudioTTS, 500);
    };

    return (
        <div style={{ padding: '50px' }}>
            <button id="test-btn" onClick={handleStart} style={{ padding: '10px', background: 'blue', color: 'white' }}>Test Web Audio</button>
            <pre style={{ marginTop: '20px' }} id="logs">{log.join('\n')}</pre>
        </div>
    );
}
