import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs';
import os from 'os';
import path from 'path';

async function main() {
    const tts = new EdgeTTS({ voice: 'tr-TR-AhmetNeural', lang: 'tr-TR' });
    const tmpFile = path.join(os.tmpdir(), `test-tts-${Date.now()}.mp3`);
    console.log('Generating to', tmpFile);
    await tts.ttsPromise('Merhaba Barış, sistemi Azure Edge seslerine geçiriyoruz!', tmpFile);
    console.log('Done generating.');
    const buf = fs.readFileSync(tmpFile);
    console.log('Size:', buf.length);
    fs.unlinkSync(tmpFile);
}
main().catch(console.error);
