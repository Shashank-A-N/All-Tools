/**
 * UI Module
 * Handles DOM manipulation, event listeners, and Canvas rendering.
 */

export class UI {
    constructor(audioEngine, sequencer) {
        this.engine = audioEngine;
        this.sequencer = sequencer;

        // DOM Elements
        this.gridContainer = document.getElementById('sequencer-grid');
        this.visualizerCanvas = document.getElementById('visualizer');
        this.canvasCtx = this.visualizerCanvas ? this.visualizerCanvas.getContext('2d') : null;

        this.playBtn = document.getElementById('play-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.bpmInput = document.getElementById('bpm-input');

        // Modal elements
        this.saveBtn = document.getElementById('save-pattern-btn');
        this.loadBtn = document.getElementById('load-pattern-btn');

        // State
        this.selectedInstrument = 'kick'; // For synth panel

        this.init();
    }

    init() {
        this.bindControls();
        this.startVisualizer();
        this.renderMixer();
        this.renderSynthControls();

        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
    }

    // --- GRID ---

    renderGrid() {
        this.gridContainer.innerHTML = '';

        this.engine.instruments.forEach(inst => {
            const row = document.createElement('div');
            row.className = 'grid grid-cols-[80px_repeat(16,1fr)] gap-1 mb-2 items-center';

            // Label
            const label = document.createElement('div');
            label.className = `text-xs font-bold uppercase tracking-wider ${inst === this.selectedInstrument ? 'text-amber-500' : 'text-slate-400'} cursor-pointer hover:text-white transition-colors`;
            label.innerText = inst;
            label.onclick = () => this.selectInstrument(inst);
            row.appendChild(label);

            // Steps
            for (let i = 0; i < 16; i++) {
                const btn = document.createElement('button');
                btn.className = `h-8 rounded bg-slate-800/50 hover:bg-slate-700 transition-all border border-white/5 step-btn ${i % 4 === 0 ? 'border-l-white/10' : ''}`;
                btn.dataset.inst = inst;
                btn.dataset.step = i;

                btn.onclick = () => {
                    const active = this.sequencer.toggleStep(inst, i);
                    btn.classList.toggle('bg-amber-500', active);
                    btn.classList.toggle('shadow-[0_0_10px_#f59e0b]', active);
                };

                // Apply initial state
                if (this.sequencer.grid[inst][i]) {
                    btn.classList.add('bg-amber-500', 'shadow-[0_0_10px_#f59e0b]');
                }

                row.appendChild(btn);
            }

            this.gridContainer.appendChild(row);
        });
    }

    highlightStep(step) {
        // Clear previous highlights
        document.querySelectorAll('.step-highlight').forEach(el => el.classList.remove('step-highlight', 'brightness-150'));

        // Add highlight to current column
        const rows = this.gridContainer.children;
        for (let row of rows) {
            if (row.children[step + 1]) {
                row.children[step + 1].classList.add('step-highlight', 'brightness-150');
            }
        }
    }

    // --- CONTROLS ---

    bindControls() {
        if (this.playBtn) {
            this.playBtn.onclick = () => {
                if (this.sequencer.isPlaying) {
                    this.sequencer.stop();
                    this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                } else {
                    this.sequencer.start();
                    this.playBtn.innerHTML = '<i class="fas fa-stop"></i>';
                }
            };
        }

        if (this.stopBtn) {
            this.stopBtn.onclick = () => {
                this.sequencer.stop();
                this.playBtn.innerHTML = '<i class="fas fa-play"></i>';

                // Reset Visuals
                document.querySelectorAll('.step-highlight').forEach(el => el.classList.remove('step-highlight', 'brightness-150'));
            };
        }

        if (this.bpmInput) {
            this.bpmInput.onchange = (e) => {
                let val = parseInt(e.target.value);
                if (val < 30) val = 30;
                if (val > 300) val = 300;
                e.target.value = val;
                this.sequencer.setTempo(val);
            };
        }

        // Listen for internal events
        document.addEventListener('randomize', () => {
            this.sequencer.randomize();
            this.renderGrid();
        });

        // Save/Load Events
        if (this.saveBtn) {
            this.saveBtn.onclick = () => {
                const name = prompt("Enter pattern name:");
                if (name) {
                    const event = new CustomEvent('save-pattern', { detail: name });
                    document.dispatchEvent(event);
                }
            };
        }

        if (this.loadBtn) {
            this.loadBtn.onclick = () => {
                const event = new CustomEvent('load-pattern-request');
                document.dispatchEvent(event);
            };
        }
    }

    showLoadModal(patterns) {
        // Simple prompt-based selector for now, or a dynamic overlay
        // Let's build a quick overlay
        let modal = document.getElementById('load-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'load-modal';
            modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
            document.body.appendChild(modal);
        }

        // Content
        let html = `
        <div class="bg-slate-900 border border-purple-500/30 p-6 rounded-xl w-96 max-h-[80vh] overflow-y-auto glass-panel">
            <h3 class="text-xl font-orbitron text-purple-400 mb-4">LOAD PATTERN</h3>
            <div class="space-y-2">
        `;

        patterns.forEach(p => {
            html += `
            <div class="p-3 bg-white/5 hover:bg-white/10 rounded cursor-pointer flex justify-between items-center transition-colors group" onclick="document.dispatchEvent(new CustomEvent('load-pattern-select', {detail: '${p.id}'}))">
                <div>
                    <div class="font-bold text-sm text-slate-200 group-hover:text-amber-500">${p.name}</div>
                    <div class="text-[10px] text-slate-500">${new Date(p.timestamp?.seconds * 1000).toLocaleDateString()}</div>
                </div>
                <i class="fas fa-play text-xs text-slate-600 group-hover:text-white"></i>
            </div>`;
        });

        html += `
            </div>
            <button class="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-400" onclick="document.getElementById('load-modal').remove()">CANCEL</button>
        </div>`;

        modal.innerHTML = html;

        // Listener to close modal on selection is handled by the onclick dispatching event + removing modal manually in app or here
        // Actually, let's attach the close logic to the event listeners in app.js or handling it here via global delegation
        // Simpler: The onclicks dispatch event. App.js listens to event. App.js triggers load.
        // We need to close modal when clicked.
        const items = modal.querySelectorAll('.group');
        items.forEach(item => {
            item.addEventListener('click', () => modal.remove());
        });
    }

    selectInstrument(inst) {
        this.selectedInstrument = inst;
        this.renderGrid(); // Re-render to update label color
        this.renderSynthControls();
    }

    // --- VISUALIZER ---

    resizeCanvas() {
        if (!this.visualizerCanvas) return;
        const parent = this.visualizerCanvas.parentElement;
        this.visualizerCanvas.width = parent.offsetWidth;
        this.visualizerCanvas.height = parent.offsetHeight;
    }

    startVisualizer() {
        if (!this.canvasCtx) return;

        const draw = () => {
            requestAnimationFrame(draw);

            const width = this.visualizerCanvas.width;
            const height = this.visualizerCanvas.height;
            const data = this.engine.getAnalyserData('frequency');

            this.canvasCtx.clearRect(0, 0, width, height);

            // Draw Bars
            const barWidth = (width / data.length) * 2.5;
            let x = 0;

            for (let i = 0; i < data.length; i++) {
                const barHeight = (data[i] / 255) * height;

                const hue = i * 2 + 180; // Cyan to purple
                this.canvasCtx.fillStyle = `hsla(${hue}, 100%, 50%, 0.8)`;

                this.canvasCtx.fillRect(x, height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };
        draw();
    }

    // --- MIXER & SYNTH UI ---

    renderMixer() {
        const container = document.getElementById('mixer-controls');
        if (!container) return;
        container.innerHTML = '';

        this.engine.instruments.forEach(inst => {
            const strip = document.createElement('div');
            // More compact strip: narrower padding, smaller gap
            strip.className = 'flex flex-col items-center gap-1 bg-slate-900/50 p-1 rounded border border-white/5 min-w-[30px]';

            // Volume Fader (vertical input range hack or just standard)
            const vol = document.createElement('input');
            vol.type = 'range';
            vol.min = 0; vol.max = 1; vol.step = 0.01;
            vol.value = this.engine.mixer[inst].volume;
            // Smaller width for fader
            vol.className = 'accent-amber-500 h-20 w-1.5 appearance-none bg-slate-700 rounded-full vertical-range';
            vol.style.writingMode = 'bt-lr'; // Firefox specific, need CSS for others
            vol.oninput = (e) => this.engine.mixer[inst].volume = parseFloat(e.target.value);

            // Mute Btn (smaller)
            const mute = document.createElement('button');
            mute.className = `w-5 h-5 rounded text-[8px] flex items-center justify-center ${this.engine.mixer[inst].mute ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'}`;
            mute.innerText = 'M';
            mute.onclick = () => {
                this.engine.mixer[inst].mute = !this.engine.mixer[inst].mute;
                this.renderMixer(); // Re-render to update state visualization
            };

            const label = document.createElement('span');
            label.className = 'text-[8px] uppercase font-mono text-slate-500 truncate max-w-full';
            label.innerText = inst.substring(0, 3);

            strip.appendChild(mute);
            strip.appendChild(vol);
            strip.appendChild(label);
            container.appendChild(strip);
        });
    }

    renderSynthControls() {
        const container = document.getElementById('synth-controls');
        if (!container) return;
        container.innerHTML = '';

        const params = this.engine.getDefaultParams(this.selectedInstrument);
        if (!params) return;

        // Use a grid for synth controls to save vertical space and allow side-by-side on wider small screens
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-2 gap-2';

        Object.keys(params).forEach(key => {
            const wrap = document.createElement('div');
            wrap.className = 'mb-1';

            const label = document.createElement('label');
            label.className = 'text-[10px] text-slate-400 block mb-0.5 capitalize';
            label.innerText = key;

            const input = document.createElement('input');
            input.type = 'range';
            input.className = 'w-full accent-purple-500 bg-slate-700 rounded h-1';

            // Scaling logic (simple for now)
            if (key === 'freq' || key === 'pitch') { input.min = 50; input.max = 1000; input.value = params[key]; }
            else if (key === 'decay') { input.min = 0.1; input.max = 2.0; input.step = 0.1; input.value = params[key]; }
            else { input.min = 0; input.max = 1; input.step = 0.01; input.value = params[key]; }

            input.oninput = (e) => {
                this.engine.mixer[this.selectedInstrument].params[key] = parseFloat(e.target.value);
            };

            wrap.appendChild(label);
            wrap.appendChild(input);
            grid.appendChild(wrap);
        });

        container.appendChild(grid);
    }
}
