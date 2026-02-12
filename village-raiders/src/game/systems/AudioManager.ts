import Phaser from 'phaser';

function createWavBuffer(sampleRate: number, samples: Float32Array): ArrayBuffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s * 0x7fff, true);
  }

  return buffer;
}

function generateTone(
  freq: number,
  duration: number,
  sampleRate: number,
  decay = true,
): Float32Array {
  const len = Math.floor(sampleRate * duration);
  const samples = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate;
    const env = decay ? 1 - i / len : 1;
    samples[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.5;
  }
  return samples;
}

function generateNoise(duration: number, sampleRate: number): Float32Array {
  const len = Math.floor(sampleRate * duration);
  const samples = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const env = 1 - i / len;
    samples[i] = (Math.random() * 2 - 1) * env * 0.3;
  }
  return samples;
}

function concatSamples(...arrays: Float32Array[]): Float32Array {
  const totalLen = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Float32Array(totalLen);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function generateSlideTone(
  startFreq: number,
  endFreq: number,
  duration: number,
  sampleRate: number,
): Float32Array {
  const len = Math.floor(sampleRate * duration);
  const samples = new Float32Array(len);
  for (let i = 0; i < len; i++) {
    const t = i / sampleRate;
    const progress = i / len;
    const freq = startFreq + (endFreq - startFreq) * progress;
    const env = 1 - progress;
    samples[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.5;
  }
  return samples;
}

function toBlobUrl(sampleRate: number, samples: Float32Array): string {
  const wavData = createWavBuffer(sampleRate, samples);
  const blob = new Blob([wavData], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

export class AudioManager {
  static generateAll(scene: Phaser.Scene): void {
    const sr = 22050;

    const sounds: Record<string, Float32Array> = {
      'sfx-footstep': generateNoise(0.05, sr),
      'sfx-key-pickup': concatSamples(
        generateTone(523, 0.1, sr),
        generateTone(659, 0.15, sr),
      ),
      'sfx-zombie-groan': generateSlideTone(90, 70, 0.4, sr),
      'sfx-heart-loss': generateSlideTone(440, 220, 0.2, sr),
      'sfx-object-break': generateNoise(0.1, sr),
      'sfx-win': concatSamples(
        generateTone(523, 0.15, sr, false),
        generateTone(659, 0.15, sr, false),
        generateTone(784, 0.3, sr),
      ),
      'sfx-lose': concatSamples(
        generateTone(392, 0.2, sr, false),
        generateTone(330, 0.2, sr, false),
        generateTone(262, 0.4, sr),
      ),
    };

    for (const [key, samples] of Object.entries(sounds)) {
      const url = toBlobUrl(sr, samples);
      scene.load.audio(key, url);
    }

    scene.load.start();
  }
}
