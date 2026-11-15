// WebAudio sound effects for Simmerdown: Dinner Rush.
// Every sound is synthesised with oscillators — no audio files, no network.
// The context is created on the first user gesture; in a headless screenshot
// run there is no gesture, so every call safely does nothing.

let context = null;
let muted = false;

export function unlockAudio() {
  if (context) {
    if (context.state === 'suspended') context.resume();
    return;
  }
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    context = new AudioContext();
  } catch {
    context = null;
  }
}

export function setMuted(value) {
  muted = value;
}

function tone(frequency, duration, type, volume, when = 0, slideTo = 0) {
  if (!context || muted) return;
  const start = context.currentTime + when;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (slideTo > 0) oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

export const sfx = {
  click() {
    tone(660, 0.07, 'triangle', 0.12);
  },
  pickup() {
    tone(520, 0.08, 'sine', 0.14, 0, 780);
  },
  place() {
    tone(240, 0.09, 'triangle', 0.16, 0, 160);
  },
  chop() {
    tone(180, 0.05, 'square', 0.1);
    tone(140, 0.05, 'square', 0.08, 0.05);
  },
  ding() {
    tone(880, 0.35, 'sine', 0.18);
    tone(1318, 0.3, 'sine', 0.1, 0.02);
  },
  serve() {
    tone(784, 0.1, 'triangle', 0.16);
    tone(1046, 0.14, 'triangle', 0.16, 0.09);
    tone(1318, 0.2, 'triangle', 0.14, 0.18);
  },
  coin() {
    tone(988, 0.08, 'square', 0.07);
    tone(1319, 0.12, 'square', 0.07, 0.07);
  },
  walkout() {
    tone(220, 0.3, 'sawtooth', 0.12, 0, 110);
  },
  wrong() {
    tone(160, 0.15, 'square', 0.1, 0, 120);
  },
  rushStart() {
    tone(523, 0.12, 'triangle', 0.16);
    tone(659, 0.12, 'triangle', 0.16, 0.1);
    tone(784, 0.22, 'triangle', 0.16, 0.2);
  },
  win() {
    [523, 659, 784, 1046, 1318].forEach((frequency, i) => {
      tone(frequency, 0.22, 'triangle', 0.16, i * 0.13);
    });
  },
  lose() {
    [392, 330, 262, 196].forEach((frequency, i) => {
      tone(frequency, 0.28, 'triangle', 0.14, i * 0.16);
    });
  },
};
