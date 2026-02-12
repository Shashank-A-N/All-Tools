const tools = [
    {
        "title": "10-Band Equalizer - Shadow Audio",
        "desc": "Fine-tune frequencies across the spectrum.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./audio-equalizer/index.html",
        "tags": "effect, 10 Band Equalizer   Shadow Audio, audio"
    },
    {
        "title": "8D Converter - AudioForge",
        "desc": "No description available.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "convert",
        "link": "./8D Converter/index.html",
        "tags": "convert, 8D Converter   AudioForge, audio"
    },
    {
        "title": "Audio Delay - AudioForge",
        "desc": "No description available.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./Audio Delay/index.html",
        "tags": "effect, Audio Delay   AudioForge, audio"
    },
    {
        "title": "Audio Distortion - Shadow Audio",
        "desc": "Add grit, fuzz, and harmonic saturation.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./audio-distortion/index.html",
        "tags": "effect, Audio Distortion   Shadow Audio, audio"
    },
    {
        "title": "Audio Joiner - AudioForge",
        "desc": "Select multiple files to merge",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "editing",
        "link": "./Audio Joiner/index.html",
        "tags": "editing, Audio Joiner   AudioForge, audio"
    },
    {
        "title": "Audio Joiner - Shadow Audio",
        "desc": "Merge multiple audio files into a single track.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "editing",
        "link": "./audio-joiner/index.html",
        "tags": "editing, Audio Joiner   Shadow Audio, audio"
    },
    {
        "title": "Audio Mixer - Shadow Audio",
        "desc": "Mix levels of multiple tracks.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "editing",
        "link": "./audio-mixer/index.html",
        "tags": "editing, Audio Mixer   Shadow Audio, audio"
    },
    {
        "title": "Audio Normalizer - Shadow Audio",
        "desc": "Automatically adjust volume to the highest peak without clipping.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./audio-normalizer/index.html",
        "tags": "utility, Audio Normalizer   Shadow Audio, audio"
    },
    {
        "title": "Audio Panner - Shadow Audio",
        "desc": "Control Left/Right channel balance.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./audio-panner/index.html",
        "tags": "effect, Audio Panner   Shadow Audio, audio"
    },
    {
        "title": "Audio Recorder - AudioForge",
        "desc": "Recording_001.webm",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./Audio Recorder/index.html",
        "tags": "utility, Audio Recorder   AudioForge, audio"
    },
    {
        "title": "Audio Splitter - Shadow Audio",
        "desc": "Split long audio files into equal parts.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "editing",
        "link": "./audio-splitter/index.html",
        "tags": "editing, Audio Splitter   Shadow Audio, audio"
    },
    {
        "title": "Audio Trimmer - Shadow Audio",
        "desc": "Select and keep only the best parts.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "editing",
        "link": "./audio-trimmer/index.html",
        "tags": "editing, Audio Trimmer   Shadow Audio, audio"
    },
    {
        "title": "AudioForge - Universal Audio Tools",
        "desc": "Convert audio files between WAV, MP3, FLAC, and OGG formats.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "convert",
        "link": "./Format & Encoding Tools/index.html",
        "tags": "convert, AudioForge   Universal Audio Tools, audio"
    },
    {
        "title": "AudioForge Pro - Synth Edition",
        "desc": "Supports MP3, WAV, OGG, FLAC",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./Basic-Manipulation-Tool/index.html",
        "tags": "utility, AudioForge Pro   Synth Edition, audio"
    },
    {
        "title": "Bass Booster - Shadow Audio",
        "desc": "Enhance low-end frequencies for deep, punchy sound.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./bass-booster/index.html",
        "tags": "effect, Bass Booster   Shadow Audio, audio"
    },
    {
        "title": "Binaural Beat Generator - Shadow Audio",
        "desc": "No description available.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "generator",
        "link": "./binaural-beats/index.html",
        "tags": "generator, Binaural Beat Generator   Shadow Audio, audio"
    },
    {
        "title": "BPM Finder - Shadow Audio",
        "desc": "Analyze tempo or use Tap Tempo manually.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "analysis",
        "link": "./bpm-finder/index.html",
        "tags": "analysis, BPM Finder   Shadow Audio, audio"
    },
    {
        "title": "BPM Tapper - AudioForge",
        "desc": "Calculated Tempo",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "analysis",
        "link": "./BPM Tapper/index.html",
        "tags": "analysis, BPM Tapper   AudioForge, audio"
    },
    {
        "title": "Chord Generator - Shadow Audio",
        "desc": "Generate chords and visualize intervals.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "generator",
        "link": "./chord-generator/index.html",
        "tags": "generator, Chord Generator   Shadow Audio, audio"
    },
    {
        "title": "Chorus Effect - Shadow Audio",
        "desc": "Add wideness and depth to your audio.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./audio-chorus/index.html",
        "tags": "effect, Chorus Effect   Shadow Audio, audio"
    },
    {
        "title": "Decibel Meter - Shadow Audio",
        "desc": "Measure ambient noise levels using your microphone.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "analysis",
        "link": "./decibel-meter/index.html",
        "tags": "analysis, Decibel Meter   Shadow Audio, audio"
    },
    {
        "title": "DTMF Generator - Shadow Audio",
        "desc": "Dual-Tone Multi-Frequency signaling emulator.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "generator",
        "link": "./dtmf-generator/index.html",
        "tags": "generator, DTMF Generator   Shadow Audio, audio"
    },
    {
        "title": "Fade In/Out - Shadow Audio",
        "desc": "Apply smooth Fade In and Fade Out effects.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./fade-in-out/index.html",
        "tags": "effect, Fade In Out   Shadow Audio, audio"
    },
    {
        "title": "Flanger Effect - Shadow Audio",
        "desc": "Add a sweeping jet-plane effect.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./audio-flanger/index.html",
        "tags": "effect, Flanger Effect   Shadow Audio, audio"
    },
    {
        "title": "Key Detector - Shadow Audio",
        "desc": "Analyze harmonic content to find the musical key.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "analysis",
        "link": "./key-detector/index.html",
        "tags": "analysis, Key Detector   Shadow Audio, audio"
    },
    {
        "title": "Lo-Fi Focus",
        "desc": "FM SYNTHESIS • TAPE SATURATION",
        "icon": "fa-tools",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./Lo-Fi Noise Generator/index.html",
        "tags": "utility, Lo Fi Focus, audio"
    },
    {
        "title": "Metronome - AudioForge",
        "desc": "No description available.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./Metronome/index.html",
        "tags": "utility, Metronome   AudioForge, audio"
    },
    {
        "title": "Mono to Stereo - Shadow Audio",
        "desc": "Convert mono tracks to dual-channel stereo.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "convert",
        "link": "./mono-to-stereo/index.html",
        "tags": "convert, Mono to Stereo   Shadow Audio, audio"
    },
    {
        "title": "Noise Generator - AudioForge",
        "desc": "Select a noise color to block distractions.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "generator",
        "link": "./Noise Generator/index.html",
        "tags": "generator, Noise Generator   AudioForge, audio"
    },
    {
        "title": "Oscilloscope - Shadow Audio",
        "desc": "Real-time waveform visualization.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "analysis",
        "link": "./oscilloscope-viewer/index.html",
        "tags": "analysis, Oscilloscope   Shadow Audio, audio"
    },
    {
        "title": "Phase Meter - Shadow Audio",
        "desc": "Visualize stereo width and phase correlation (Lissajous).",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "analysis",
        "link": "./stereo-phase-meter/index.html",
        "tags": "analysis, Phase Meter   Shadow Audio, audio"
    },
    {
        "title": "Phaser Effect - Shadow Audio",
        "desc": "Create swirling, psychedelic phase-shift effects.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "analysis",
        "link": "./audio-phaser/index.html",
        "tags": "analysis, Phaser Effect   Shadow Audio, audio"
    },
    {
        "title": "Pitch Shifter - Shadow Audio",
        "desc": "Drop Audio File Here",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./pitch-shifter/index.html",
        "tags": "effect, Pitch Shifter   Shadow Audio, audio"
    },
    {
        "title": "Remove Silence - Shadow Audio",
        "desc": "Automatically trim silence from the beginning and end.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "editing",
        "link": "./remove-silence/index.html",
        "tags": "editing, Remove Silence   Shadow Audio, audio"
    },
    {
        "title": "Reverb Studio - Shadow Audio",
        "desc": "Add spatial ambience using convolution reverb.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./audio-reverb/index.html",
        "tags": "effect, Reverb Studio   Shadow Audio, audio"
    },
    {
        "title": "Reverse Audio - AudioForge",
        "desc": "No description available.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./Reverse Audio/index.html",
        "tags": "effect, Reverse Audio   AudioForge, audio"
    },
    {
        "title": "Reverse Audio - Shadow Audio",
        "desc": "Play tracks backwards for creative effects.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./audio-reverse/index.html",
        "tags": "effect, Reverse Audio   Shadow Audio, audio"
    },
    {
        "title": "Rhythm Pattern Generator - Shadow Audio",
        "desc": "Design rhythm patterns.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "generator",
        "link": "./rhythm-pattern-generator/index.html",
        "tags": "generator, Rhythm Pattern Generator   Shadow Audio, audio"
    },
    {
        "title": "SonicCore - Advanced Audio Engine",
        "desc": "Tap or Drop File Here",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./Audio Analysis Tool/index.html",
        "tags": "utility, SonicCore   Advanced Audio Engine, audio"
    },
    {
        "title": "SonicMind | AI Audio Tools Suite",
        "desc": "Next-Gen Audio Intelligence Suite",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./AI & Intelligent Audio Tools/index.html",
        "tags": "utility, SonicMind   AI Audio Tools Suite, audio"
    },
    {
        "title": "Spectrogram - Shadow Audio",
        "desc": "Visualize audio frequencies over time.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "analysis",
        "link": "./spectrogram-viewer/index.html",
        "tags": "analysis, Spectrogram   Shadow Audio, audio"
    },
    {
        "title": "Speed Changer - Shadow Audio",
        "desc": "Adjust playback speed.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./speed-changer/index.html",
        "tags": "effect, Speed Changer   Shadow Audio, audio"
    },
    {
        "title": "Stereo to Mono - Shadow Audio",
        "desc": "Mixdown stereo tracks into a single channel.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "editing",
        "link": "./stereo-to-mono/index.html",
        "tags": "editing, Stereo to Mono   Shadow Audio, audio"
    },
    {
        "title": "Text to Speech - Shadow Audio",
        "desc": "No description available.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "generator",
        "link": "./text-to-speech-gen/index.html",
        "tags": "generator, Text to Speech   Shadow Audio, audio"
    },
    {
        "title": "Tone Generator - AudioForge",
        "desc": "No description available.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "generator",
        "link": "./Tone Generator/index.html",
        "tags": "generator, Tone Generator   AudioForge, audio"
    },
    {
        "title": "Treble Booster - Shadow Audio",
        "desc": "Enhance high frequencies for clarity and brightness.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./treble-booster/index.html",
        "tags": "effect, Treble Booster   Shadow Audio, audio"
    },
    {
        "title": "Vocal Remover - AudioForge",
        "desc": "No description available.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "editing",
        "link": "./Vocal Remover/index.html",
        "tags": "editing, Vocal Remover   AudioForge, audio"
    },
    {
        "title": "Voice Changer - Shadow Audio",
        "desc": "Transform your voice into different characters.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./voice-changer/index.html",
        "tags": "effect, Voice Changer   Shadow Audio, audio"
    },
    {
        "title": "Volume Booster - Shadow Audio",
        "desc": "Amplify quiet audio files up to 200%.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "effect",
        "link": "./volume-booster/index.html",
        "tags": "effect, Volume Booster   Shadow Audio, audio"
    }
];