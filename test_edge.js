const { EdgeTTS } = require('node-edge-tts');
const fs = require('fs');
const os = require('os');
const path = require('path');

async function main() {
    console.log('Starting Edge TTS Test');
    const tts = new EdgeTTS({ voice: 'tr-TR-AhmetNeural', lang: 'tr-TR' });
    const tmpFile = path.join(os.tmpdir(), `test-tts-${Date.now()}.mp3`);
    console.log('Generating to', tmpFile);
    await tts.ttsPromise('Merhaba Barış, sistemi Edge seslerine geçiriyoruz!', tmpFile);
    console.log('Done generating. Reading file...');
    const buf = fs.readFileSync(tmpFile);
    console.log('Size:', buf.length);
    fs.unlinkSync(tmpFile);
}
main().catch(console.error);
