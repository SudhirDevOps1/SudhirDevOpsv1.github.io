// ─── SUDHI OS — WebAudio Sound Engine (v4) ───────────────────────────────────
// Zero-asset, oscillator-based UI sounds. Respects sounds toggle + volume
// from the reactive system settings store. All calls are safe no-ops when
// audio is unavailable (autoplay policies, unsupported browsers).

import { getSystemSettings } from './sysSettings';

let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') { void ctx.resume().catch(() => {}); }
    return ctx;
  } catch {
    return null;
  }
}

function tone(opts: {
  freq: number;
  freqEnd?: number;
  type?: OscillatorType;
  duration: number;
  gain?: number;
  delay?: number;
}) {
  const ac = ensureCtx();
  if (!ac) return;
  const { volume, sounds } = getSystemSettings();
  if (!sounds || volume <= 0) return;

  try {
    const t0 = ac.currentTime + (opts.delay || 0);
    const osc = ac.createOscillator();
    const g = ac.createGain();
    const peak = (opts.gain ?? 0.18) * (volume / 100);

    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(opts.freq, t0);
    if (opts.freqEnd) osc.frequency.exponentialRampToValueAtTime(Math.max(40, opts.freqEnd), t0 + opts.duration);

    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.duration);

    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + opts.duration + 0.03);
    osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch { /* noop */ } };
  } catch { /* never break the UI for sound */ }
}

export type SfxName =
  | 'click' | 'open' | 'close' | 'minimize' | 'maximize'
  | 'notify' | 'error' | 'success' | 'boot' | 'snap' | 'unlock' | 'power';

export const sfx = {
  play(name: SfxName): void {
    try {
      switch (name) {
        case 'click':     tone({ freq: 1500, freqEnd: 1100, type: 'square', duration: 0.045, gain: 0.07 }); break;
        case 'open':      tone({ freq: 420, freqEnd: 940, type: 'sine', duration: 0.16, gain: 0.12 }); break;
        case 'close':     tone({ freq: 900, freqEnd: 380, type: 'sine', duration: 0.13, gain: 0.10 }); break;
        case 'minimize':  tone({ freq: 660, freqEnd: 300, type: 'triangle', duration: 0.12, gain: 0.09 }); break;
        case 'maximize':  tone({ freq: 300, freqEnd: 720, type: 'triangle', duration: 0.13, gain: 0.09 }); break;
        case 'snap':      tone({ freq: 820, type: 'square', duration: 0.05, gain: 0.08 }); break;
        case 'notify':
          tone({ freq: 880, type: 'sine', duration: 0.10, gain: 0.13 });
          tone({ freq: 1320, type: 'sine', duration: 0.16, gain: 0.11, delay: 0.10 });
          break;
        case 'success':
          tone({ freq: 660, type: 'sine', duration: 0.10, gain: 0.12 });
          tone({ freq: 990, type: 'sine', duration: 0.16, gain: 0.10, delay: 0.09 });
          break;
        case 'error':     tone({ freq: 190, freqEnd: 120, type: 'sawtooth', duration: 0.22, gain: 0.10 }); break;
        case 'unlock':
          tone({ freq: 523, type: 'sine', duration: 0.14, gain: 0.12 });
          tone({ freq: 784, type: 'sine', duration: 0.20, gain: 0.11, delay: 0.12 });
          break;
        case 'power':
          tone({ freq: 392, type: 'sine', duration: 0.25, gain: 0.10 });
          tone({ freq: 523, type: 'sine', duration: 0.25, gain: 0.10, delay: 0.16 });
          tone({ freq: 659, type: 'sine', duration: 0.45, gain: 0.11, delay: 0.32 });
          break;
        case 'boot':
          tone({ freq: 523, type: 'sine', duration: 0.35, gain: 0.10 });
          tone({ freq: 659, type: 'sine', duration: 0.35, gain: 0.10, delay: 0.12 });
          tone({ freq: 784, type: 'sine', duration: 0.35, gain: 0.10, delay: 0.24 });
          tone({ freq: 1046, type: 'sine', duration: 0.60, gain: 0.12, delay: 0.40 });
          break;
      }
    } catch { /* noop */ }
  }
};
