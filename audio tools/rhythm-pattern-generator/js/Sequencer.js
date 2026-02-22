/**
 * Sequencer Logic
 * Handles grid state, timing (Lookahead scheduler), and pattern management.
 */

export class Sequencer {
    constructor(audioEngine, updateUICallback) {
        this.engine = audioEngine;
        this.updateUI = updateUICallback;

        this.isPlaying = false;
        this.tempo = 120;
        this.steps = 16;
        this.currentStep = 0;
        this.nextNoteTime = 0;
        this.lookahead = 25.0; // ms
        this.scheduleAheadTime = 0.1; // s
        this.timerID = null;

        this.tracks = this.engine.instruments;
        this.grid = this.createEmptyGrid();

        this.swing = 0; // 0 to 1
    }

    createEmptyGrid() {
        const grid = {};
        this.tracks.forEach(track => {
            grid[track] = new Array(this.steps).fill(false);
        });
        return grid;
    }

    toggleStep(track, step) {
        if (this.grid[track]) {
            this.grid[track][step] = !this.grid[track][step];
            return this.grid[track][step];
        }
    }

    // --- SCHEDULING ---

    nextNote() {
        const secondsPerBeat = 60.0 / this.tempo;
        // 16th notes = 0.25 beats
        let nextTime = 0.25 * secondsPerBeat;

        // Swing Logic (delay every second 16th note)
        if (this.currentStep % 2 === 1) {
            // No swing apply to current, used in previous
        } else {
            // Apply swing to next step if it's an even step (0, 2, 4...) -> set next note time
        }

        this.nextNoteTime += nextTime;
        this.currentStep = (this.currentStep + 1) % this.steps;
    }

    scheduleNote(beatNumber, time) {
        // Push UI update to queue (requestAnimationFrame handles it)
        this.updateUI(beatNumber);

        // Audio Logic
        this.tracks.forEach(track => {
            if (this.grid[track][beatNumber]) {
                let playTime = time;

                // Swing implementation: delay even steps
                if (beatNumber % 2 === 1) {
                    playTime += ((60 / this.tempo) * 0.25) * this.swing * 0.33;
                }

                this.engine.play(track, playTime);
            }
        });
    }

    scheduler() {
        // While there are notes that will need to play before the next interval,
        // schedule them and advance the pointer.
        while (this.nextNoteTime < this.engine.ctx.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentStep, this.nextNoteTime);
            this.nextNote();
        }

        if (this.isPlaying) {
            this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
        }
    }

    start() {
        if (this.isPlaying) return;

        if (this.engine.ctx.state === 'suspended') {
            this.engine.ctx.resume();
        }

        this.isPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = this.engine.ctx.currentTime;
        this.scheduler();
    }

    stop() {
        this.isPlaying = false;
        clearTimeout(this.timerID);
        this.currentStep = 0; // Reset
    }

    // --- PATTERN MANAGEMENT ---

    clear() {
        this.grid = this.createEmptyGrid();
    }

    randomize() {
        this.tracks.forEach(track => {
            // Euclidean-ish random distribution
            const density = Math.random();
            for (let i = 0; i < this.steps; i++) {
                this.grid[track][i] = Math.random() > (1 - density * 0.3); // 30% max fill

                // Always accent the downbeat for Kick
                if (track === 'kick' && i % 4 === 0 && Math.random() > 0.2) {
                    this.grid[track][i] = true;
                }
            }
        });
    }

    setTempo(bpm) {
        this.tempo = bpm;
    }

    setSwing(amount) {
        this.swing = amount;
    }

    // --- EXPORT ---
    // Placeholder for implementing offline rendering if needed
}
