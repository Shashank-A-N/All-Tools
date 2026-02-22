/**
 * Advanced Audio Engine for Rhythm Pattern Generator
 * Features:
 * - Parameterized Synthesis (Kick, Snare, HiHat, Clap, Tom)
 * - Master Effects Chain (Compressor, Overdrive, Reverb)
 * - Mixer functionality (Vol, Pan, Mute/Solo)
 * - WAV Export
 */

export class AudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.compressor = this.ctx.createDynamicsCompressor();
        this.analyser = this.ctx.createAnalyser();

        // Master Chain Connection
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);

        // Analyzer Setup
        this.analyser.fftSize = 2048;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        // Instrument Types
        this.instruments = ['kick', 'snare', 'hihat', 'clap', 'tom', 'ride', 'crash', 'shaker', 'glitch', 'sub'];

        // Mixer State
        this.mixer = {};
        this.instruments.forEach(inst => {
            this.mixer[inst] = {
                volume: 0.8,
                pan: 0,
                mute: false,
                solo: false,
                params: this.getDefaultParams(inst)
            };
        });

        // Effects Bus
        this.reverbNode = this.ctx.createConvolver();
        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 0.3;
        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);

        // Reverb Impulse (generated on init)
        this.reverbBuffer = null;
        this.generateReverbImpulse(2); // 2 seconds tail
    }

    async init() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
        this.generateReverbImpulse(2);
    }

    getDefaultParams(type) {
        switch (type) {
            case 'kick': return { freq: 150, decay: 0.5, tone: 0 };
            case 'snare': return { freq: 200, decay: 0.2, snappy: 1 };
            case 'hihat': return { freq: 5000, decay: 0.1, metallic: 0.5 };
            case 'clap': return { spread: 0.05, decay: 0.2 };
            case 'tom': return { pitch: 100, decay: 0.5, tone: 0.5 };
            case 'ride': return { pitch: 600, decay: 1.5, tone: 0.8 };
            case 'crash': return { pitch: 0, decay: 2.0, tone: 0.5 }; // pitch unused for noise
            case 'shaker': return { pitch: 0, decay: 0.1, tone: 0.9 };
            case 'glitch': return { pitch: 800, decay: 0.2, tone: 0.5, snap: 0.8 };
            case 'sub': return { pitch: 50, decay: 0.8, tone: 0.1 };
            default: return null;
        }
    }

    generateReverbImpulse(duration) {
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.ctx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);

        for (let i = 0; i < length; i++) {
            const decay = Math.pow(1 - i / length, 2);
            left[i] = (Math.random() * 2 - 1) * decay;
            right[i] = (Math.random() * 2 - 1) * decay;
        }
        this.reverbNode.buffer = impulse;
    }

    play(instrument, time) {
        if (this.mixer[instrument].mute) return;

        // Solo Logic
        const soloActive = Object.values(this.mixer).some(ch => ch.solo);
        if (soloActive && !this.mixer[instrument].solo) return;

        const t = time || this.ctx.currentTime;
        const params = this.mixer[instrument].params;

        // Channel Stip
        const sourceGain = this.ctx.createGain();
        const panner = this.ctx.createStereoPanner();

        sourceGain.gain.value = this.mixer[instrument].volume;
        panner.pan.value = this.mixer[instrument].pan;

        sourceGain.connect(panner);
        panner.connect(this.masterGain);

        // Send to Reverb
        sourceGain.connect(this.reverbNode);

        // Synthesis
        switch (instrument) {
            case 'kick': this.synthKick(t, params, sourceGain); break;
            case 'snare': this.synthSnare(t, params, sourceGain); break;
            case 'hihat': this.synthHiHat(t, params, sourceGain); break;
            case 'clap': this.synthClap(t, params, sourceGain); break;
            case 'tom': this.synthTom(t, params, sourceGain); break;
            case 'ride': this.synthRide(t, params, sourceGain); break;
            case 'crash': this.synthCrash(t, params, sourceGain); break;
            case 'shaker': this.synthShaker(t, params, sourceGain); break;
            case 'glitch': this.synthGlitch(t, params, sourceGain); break;
            case 'sub': this.synthSub(t, params, sourceGain); break;
        }
    }

    // --- SYNTHESIS ALGORITHMS ---

    synthKick(t, p, dest) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(p.freq, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + p.decay);

        gain.gain.setValueAtTime(1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + p.decay);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + p.decay);
    }

    synthSnare(t, p, dest) {
        // Tone
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.frequency.setValueAtTime(p.freq, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        oscGain.gain.setValueAtTime(0.5, t);
        oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.connect(oscGain);
        oscGain.connect(dest);

        // Noise (Snappy)
        const noise = this.createNoiseBuffer();
        const noiseFilter = this.ctx.createBiquadFilter();
        const noiseGain = this.ctx.createGain();

        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        noiseGain.gain.setValueAtTime(p.snappy, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + p.decay);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.2);
        noise.start(t);
        noise.stop(t + p.decay);
    }

    synthHiHat(t, p, dest) {
        const ratio = [2, 3, 4.16, 5.43, 6.79, 8.21];
        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = p.freq;

        const highpass = this.ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 7000;

        ratio.forEach(r => {
            const osc = this.ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.value = p.freq * r;
            osc.connect(bandpass);
            osc.start(t);
            osc.stop(t + p.decay);
        });

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(p.metallic, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + p.decay);

        bandpass.connect(highpass);
        highpass.connect(gain);
        gain.connect(dest);
    }

    synthClap(t, p, dest) {
        const noise = this.createNoiseBuffer();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1500;

        const entropy = [0, 0.01, 0.02, 0.03]; // Clap delay spread

        entropy.forEach(offset => {
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.7, t + offset);
            gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.05); // Short burst

            const n = this.createNoiseBuffer();
            n.connect(filter);
            filter.connect(gain);
            gain.connect(dest);
            n.start(t + offset);
            n.stop(t + offset + 0.06);
        });

        // Reverb tail for clap
        const tail = this.createNoiseBuffer();
        const tailGain = this.ctx.createGain();
        tailGain.gain.setValueAtTime(0.5, t);
        tailGain.gain.exponentialRampToValueAtTime(0.01, t + p.decay);

        tail.connect(filter);
        filter.connect(tailGain);
        tailGain.connect(dest);
        tail.start(t);
        tail.stop(t + p.decay);
    }

    synthTom(time, params, dest) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(params.pitch, time);
        osc.frequency.exponentialRampToValueAtTime(params.pitch * 0.5, time + params.decay);

        gain.gain.setValueAtTime(params.tone, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + params.decay);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(time);
        osc.stop(time + params.decay);
    }

    // --- NEW INSTRUMENTS ---

    synthRide(time, params, dest) {
        // Metallic Pulse (Square ratio)
        const ratio = [1, 1.54];
        ratio.forEach(r => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';

            // High pass for metallic ring
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 800 + (params.tone * 4000);

            osc.frequency.value = params.pitch * r;
            gain.gain.setValueAtTime(0.1, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + params.decay);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(dest);
            osc.start(time);
            osc.stop(time + params.decay);
        });
    }

    synthCrash(time, params, dest) {
        // White Noise burst
        const bufferSize = this.ctx.sampleRate * params.decay;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(params.tone * 10000 + 1000, time);
        filter.frequency.linearRampToValueAtTime(1000, time + params.decay);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + params.decay);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(time);
    }

    synthShaker(time, params, dest) {
        // Filtered Noise
        const bufferSize = this.ctx.sampleRate * params.decay;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 5000 + (params.tone * 3000);
        filter.Q.value = 1;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + params.decay);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(time);
    }

    synthGlitch(time, params, dest) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(params.pitch, time);

        // FM Modulation
        const mod = this.ctx.createOscillator();
        mod.frequency.value = params.pitch * (params.snap * 10); // crazy ratio
        const modGain = this.ctx.createGain();
        modGain.gain.value = 1000;

        mod.connect(modGain);
        modGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + params.decay);

        mod.start(time);
        mod.stop(time + params.decay);
        osc.connect(gain);
        gain.connect(dest);
        osc.start(time);
        osc.stop(time + params.decay);
    }

    synthSub(time, params, dest) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(params.pitch + 20, time); // Attack pitch
        osc.frequency.exponentialRampToValueAtTime(params.pitch, time + 0.1);

        // Saturation
        const shaper = this.ctx.createWaveShaper();
        shaper.curve = new Float32Array([-0.5, 0.5]); // Soft clip

        gain.gain.setValueAtTime(0.8, time);
        gain.gain.linearRampToValueAtTime(0.0, time + params.decay);

        osc.connect(shaper);
        shaper.connect(gain);
        gain.connect(dest);

        osc.start(time);
        osc.stop(time + params.decay);
    }

    createNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const node = this.ctx.createBufferSource();
        node.buffer = buffer;
        return node;
    }

    // --- UTILS ---

    getAnalyserData(type = 'frequency') {
        if (type === 'frequency') {
            this.analyser.getByteFrequencyData(this.dataArray);
        } else {
            this.analyser.getByteTimeDomainData(this.dataArray);
        }
        return this.dataArray;
    }
    // --- EXPORT ---

    async exportToWav(sequencer) {
        // Calculate duration: (60 / bpm) * steps / 4 (16th notes)
        const secondsPerBeat = 60 / sequencer.tempo;
        const duration = (secondsPerBeat / 4) * sequencer.steps;

        // Offline Context
        const offlineCtx = new OfflineAudioContext(2, this.ctx.sampleRate * duration, this.ctx.sampleRate);

        // --- Replicate Graph in Offline Context ---

        // Master Bus
        const offMaster = offlineCtx.createGain();
        const offCompressor = offlineCtx.createDynamicsCompressor();
        offMaster.connect(offCompressor);
        offCompressor.connect(offlineCtx.destination);

        // Reverb (Simple convolution for export)
        const offReverb = offlineCtx.createConvolver();
        const offReverbGain = offlineCtx.createGain();
        offReverbGain.gain.value = 0.3;
        offReverb.buffer = this.reverbNode.buffer; // Reuse buffer
        offReverb.connect(offReverbGain);
        offReverbGain.connect(offMaster);

        // Schedule Events
        const grid = sequencer.grid;
        const tracks = this.instruments;

        tracks.forEach(inst => {
            const trackState = this.mixer[inst];
            if (trackState.mute) return;

            for (let i = 0; i < sequencer.steps; i++) {
                if (grid[inst][i]) {
                    let time = i * (secondsPerBeat / 4);

                    // Swing logic (offline)
                    if (i % 2 === 1) {
                        time += (secondsPerBeat / 4) * sequencer.swing * 0.33;
                    }

                    const p = trackState.params;

                    // Channel Strip
                    const srcGain = offlineCtx.createGain();
                    const panner = offlineCtx.createStereoPanner();
                    srcGain.gain.value = trackState.volume;
                    panner.pan.value = trackState.pan;

                    srcGain.connect(panner);
                    panner.connect(offMaster);
                    srcGain.connect(offReverb);

                    // Synthesis (Re-implement synth logic for offline node)
                    // Note: In a real app, I'd refactor synth methods to accept Context as arg.
                    // For now, I'll allow "this.synthKick" to use the passed context if I modify them, 
                    // OR I just duplicate the simple synth logic here for the export scope to avoid refactoring everything.
                    // Refactoring is safer.

                    this.synthOffline(inst, offlineCtx, time, p, srcGain);
                }
            }
        });

        // Render
        const renderedBuffer = await offlineCtx.startRendering();
        return this.bufferToWave(renderedBuffer, renderedBuffer.length);
    }

    // Wrapper to reuse synth logic
    synthOffline(inst, ctx, t, p, dest) {
        // Helper to mock "this.ctx" with "ctx"
        const tempCtx = this.ctx;
        this.ctx = ctx; // Swap context temporarily (Hack but works for sync code)

        switch (inst) {
            case 'kick': this.synthKick(t, p, dest); break;
            case 'snare': this.synthSnare(t, p, dest); break;
            case 'hihat': this.synthHiHat(t, p, dest); break;
            case 'clap': this.synthClap(t, p, dest); break;
            case 'tom': this.synthTom(t, p, dest); break;
            case 'ride': this.synthRide(t, p, dest); break;
            case 'crash': this.synthCrash(t, p, dest); break;
            case 'shaker': this.synthShaker(t, p, dest); break;
            case 'glitch': this.synthGlitch(t, p, dest); break;
            case 'sub': this.synthSub(t, p, dest); break;
        }

        this.ctx = tempCtx; // Restore
    }

    // WAV Encoder
    bufferToWave(abuffer, len) {
        let numOfChan = abuffer.numberOfChannels,
            length = len * numOfChan * 2 + 44,
            buffer = new ArrayBuffer(length),
            view = new DataView(buffer),
            channels = [], i, sample,
            offset = 0,
            pos = 0;

        // write WAVE header
        setUint32(0x46464952);                         // "RIFF"
        setUint32(length - 8);                         // file length - 8
        setUint32(0x45564157);                         // "WAVE"

        setUint32(0x20746d66);                         // "fmt " chunk
        setUint32(16);                                 // length = 16
        setUint16(1);                                  // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2);                      // block-align
        setUint16(16);                                 // 16-bit (hardcoded in this dem)

        setUint32(0x61746164);                         // "data" - chunk
        setUint32(length - pos - 4);                   // chunk length

        // write interleaved data
        for (i = 0; i < abuffer.numberOfChannels; i++)
            channels.push(abuffer.getChannelData(i));

        while (pos < length) {
            for (i = 0; i < numOfChan; i++) {             // interleave channels
                sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
                view.setInt16(pos, sample, true);          // write 16-bit sample
                pos += 2;
            }
            offset++; // next source sample
        }

        // create Blob
        return new Blob([buffer], { type: "audio/wav" });

        function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
        function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }
    }
}
