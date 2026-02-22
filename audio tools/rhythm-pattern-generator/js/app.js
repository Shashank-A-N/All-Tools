/**
 * Rhythm Pattern Generator - Main Entry
 */
import { AudioEngine } from './AudioEngine.js';
import { Sequencer } from './Sequencer.js';
import { UI } from './UI.js';
import { CloudStorage } from './Firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Modules
    const engine = new AudioEngine();
    const cloud = new CloudStorage(); // Initialize Firebase

    const ui = new UI(engine, null); // Pass sequencer later

    const sequencer = new Sequencer(engine, (step) => {
        // UI Update Callback (Sync with beat)
        requestAnimationFrame(() => ui.highlightStep(step));
    });

    // Link Circular Dependency
    ui.sequencer = sequencer;
    ui.renderGrid();
    ui.selectInstrument('kick');

    // --- CLOUD EVENTS ---

    document.addEventListener('save-pattern', async (e) => {
        const name = e.detail;
        if (!name) return;

        try {
            await cloud.savePattern(
                name,
                sequencer.grid,
                sequencer.tempo,
                sequencer.swing,
                engine.mixer
            );
            alert('Pattern Saved to Cloud!');
        } catch (err) {
            alert('Error saving pattern: ' + err.message);
        }
    });

    document.addEventListener('load-pattern-request', async () => {
        try {
            const patterns = await cloud.loadPatterns();
            ui.showLoadModal(patterns);
        } catch (err) {
            alert('Error fetching patterns: ' + err.message);
        }
    });

    document.addEventListener('load-pattern-select', async (e) => {
        const id = e.detail;
        const patterns = await cloud.loadPatterns(); // Cache this ideally, but okay for now
        const pattern = patterns.find(p => p.id === id);

        if (pattern) {
            sequencer.grid = JSON.parse(pattern.grid);
            sequencer.tempo = pattern.tempo;
            sequencer.swing = pattern.swing;
            ui.bpmInput.value = pattern.tempo;

            // Restore Mixer
            if (pattern.mixer) {
                const mixerState = JSON.parse(pattern.mixer);
                // Deep merge or overwrite
                Object.keys(mixerState).forEach(k => {
                    if (engine.mixer[k]) engine.mixer[k] = mixerState[k];
                });
            }

            ui.renderGrid();
            ui.renderMixer();
            ui.renderSynthControls();
        }
    });

    // --- EXPORT ---

    document.addEventListener('export-wav', async () => {
        ui.playBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        try {
            const blob = await engine.exportToWav(sequencer);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'shadow-beat.wav';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 100);
        } catch (err) {
            console.error(err);
            alert('Export failed');
        }
        ui.playBtn.innerHTML = '<i class="fas fa-play"></i>'; // Reset state (assuming it was stopped or playing logic handles it)
        // If it was playing, it might show stop. Ideally check state.
        if (sequencer.isPlaying) ui.playBtn.innerHTML = '<i class="fas fa-stop"></i>';
    });

    // Global Init
    await engine.init();

    console.log("Shadow Audio Engine Initialized");
});
