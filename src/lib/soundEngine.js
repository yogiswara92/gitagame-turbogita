/**
 * soundEngine.js – Web Audio API-based synthesised sound effects.
 * No external audio files required; everything is generated procedurally.
 */

let ctx = null;

/** Lazily initialise AudioContext on first user gesture */
function getCtx() {
    if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
    return ctx;
}

/** Play a short synthesised tone */
function playTone({ type = 'sine', freq = 440, freq2 = null, duration = 0.15, volume = 0.3, attack = 0.01, decay = 0.1 }) {
    try {
        const ac = getCtx();
        const osc = ac.createOscillator();
        const gain = ac.createGain();

        osc.connect(gain);
        gain.connect(ac.destination);

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ac.currentTime);
        if (freq2 !== null) {
            osc.frequency.linearRampToValueAtTime(freq2, ac.currentTime + duration);
        }

        gain.gain.setValueAtTime(0, ac.currentTime);
        gain.gain.linearRampToValueAtTime(volume, ac.currentTime + attack);
        gain.gain.linearRampToValueAtTime(0, ac.currentTime + attack + decay);

        osc.start(ac.currentTime);
        osc.stop(ac.currentTime + duration);
    } catch (e) {
        // Silently fail – audio is not critical
    }
}

/** White-noise burst for collision / explosion */
function playNoise({ duration = 0.2, volume = 0.4 }) {
    try {
        const ac = getCtx();
        const bufferSize = ac.sampleRate * duration;
        const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }

        const source = ac.createBufferSource();
        source.buffer = buffer;

        const gain = ac.createGain();
        gain.gain.setValueAtTime(volume, ac.currentTime);
        gain.gain.linearRampToValueAtTime(0, ac.currentTime + duration);

        const filter = ac.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);

        source.start();
        source.stop(ac.currentTime + duration);
    } catch (e) { }
}

// ── Public SFX API ──────────────────────────────────────────

// Shared engine state
let engineOsc = null;
let engineGain = null;

export const SFX = {
    /** Engine hum – called each frame with current speed ratio 0-1 */
    engine: (speedRatio) => {
        try {
            const ac = getCtx();
            if (!engineOsc) {
                engineOsc = ac.createOscillator();
                engineGain = ac.createGain();
                engineOsc.type = 'sawtooth';
                engineOsc.connect(engineGain);
                engineGain.connect(ac.destination);
                engineGain.gain.value = 0;
                engineOsc.start();
            }
            const minFreq = 80, maxFreq = 260;
            engineOsc.frequency.setTargetAtTime(minFreq + speedRatio * (maxFreq - minFreq), ac.currentTime, 0.1);
            engineGain.gain.setTargetAtTime(speedRatio * 0.06, ac.currentTime, 0.05);
        } catch (e) { }
    },

    stopEngine: () => {
        try {
            const ac = getCtx();
            if (engineGain) {
                // Stop engine by setting gain to 0 immediately
                engineGain.gain.setValueAtTime(0, ac.currentTime);
            }
        } catch (e) { }
    },

    /** Collision */
    crash: () => {
        playNoise({ duration: 0.35, volume: 0.5 });
        playTone({ type: 'sawtooth', freq: 120, freq2: 40, duration: 0.3, volume: 0.3, attack: 0.001, decay: 0.29 });
    },

    /** Score milestone */
    score: () => {
        playTone({ type: 'triangle', freq: 660, freq2: 880, duration: 0.12, volume: 0.2, attack: 0.01, decay: 0.1 });
    },

    /** Game start countdown beep */
    beep: (hi = false) => {
        playTone({ type: 'square', freq: hi ? 880 : 440, duration: 0.08, volume: 0.15, attack: 0.005, decay: 0.07 });
    },

    /** Near-miss swoosh */
    swoosh: () => {
        playTone({ type: 'sine', freq: 300, freq2: 100, duration: 0.18, volume: 0.1, attack: 0.005, decay: 0.17 });
    },
};
