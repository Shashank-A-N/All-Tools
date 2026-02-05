/**
 * Shadow Audio - Shared Utilities
 * Handles AudioContext, basic visualizations, and common format helpers.
 */

class AudioEngine {
    constructor() {
        this.context = null;
        this.analyser = null;
        this.dataArray = null;
        this.frameId = null;
    }

    init() {
        if (!this.context) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
        return this.context;
    }

    createAnalyser(sourceNode, fftSize = 2048) {
        if (!this.context) this.init();
        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = fftSize;
        sourceNode.connect(this.analyser);
        this.analyser.connect(this.context.destination);
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        return this.analyser;
    }

    drawVisualizer(canvasId, type = 'frequency', color = '#a855f7') {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const draw = () => {
            if (!this.analyser) return;
            this.frameId = requestAnimationFrame(draw);

            if (type === 'frequency') {
                this.analyser.getByteFrequencyData(this.dataArray);
            } else {
                this.analyser.getByteTimeDomainData(this.dataArray);
            }

            ctx.clearRect(0, 0, width, height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;
            ctx.beginPath();

            const sliceWidth = width * 1.0 / this.dataArray.length;
            let x = 0;

            for (let i = 0; i < this.dataArray.length; i++) {
                const v = this.dataArray[i] / 128.0;
                const y = v * height / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();
        };

        draw();
    }

    stop() {
        if (this.frameId) cancelAnimationFrame(this.frameId);
        if (this.context) this.context.close().then(() => { this.context = null; });
    }
}

export const audioEngine = new AudioEngine();
