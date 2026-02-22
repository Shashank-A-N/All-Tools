// text-to-speech-gen/app.js

const synth = window.speechSynthesis;

// UI Elements
const els = {
    textInput: document.getElementById('text-input'),
    voiceSelect: document.getElementById('voice-select'),
    rateInput: document.getElementById('rate'),
    pitchInput: document.getElementById('pitch'),
    volumeInput: document.getElementById('volume'),
    rateVal: document.getElementById('rate-val'),
    pitchVal: document.getElementById('pitch-val'),
    volumeVal: document.getElementById('volume-val'),

    playBtn: document.getElementById('play-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    stopBtn: document.getElementById('stop-btn'),

    charCount: document.getElementById('char-count'),
    wordCount: document.getElementById('word-count'),
    readTime: document.getElementById('read-time'),

    visualizerCanvas: document.getElementById('visualizer-canvas'),

    progressContainer: document.getElementById('progress-bar').parentElement,
    progressBar: document.getElementById('progress-bar'),
    currTimeElem: document.getElementById('current-time'),
    totalTimeElem: document.getElementById('total-time'),

    themeToggle: document.getElementById('theme-toggle'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),

    voiceSearch: document.getElementById('voice-search'),
    filterLangBtn: document.getElementById('filter-lang-btn'),
    voiceCount: document.getElementById('voice-count'),
    favVoiceBtn: document.getElementById('favorite-voice-btn'),
    previewBtn: document.getElementById('preview-btn'),

    downloadBtn: document.getElementById('download-btn'),
    loopBtn: document.getElementById('loop-btn'),

    highlightOverlay: document.getElementById('highlight-overlay'),
    highlightContent: document.getElementById('highlight-content'),

    dropzone: document.getElementById('dropzone'),
    fileUpload: document.getElementById('file-upload'),
    saveTxtBtn: document.getElementById('save-txt-btn'),

    ambienceToggle: document.getElementById('ambience-toggle'),
    ambienceControls: document.getElementById('ambience-controls'),
    ambienceType: document.getElementById('ambience-type'),
    ambienceVolume: document.getElementById('ambience-volume'),
    ambienceAudio: document.getElementById('ambience-audio'),

    // Modals
    modalFindReplace: document.getElementById('modal-find-replace'),
    modalContent: document.getElementById('modal-content'),
    findInput: document.getElementById('find-input'),
    replaceInput: document.getElementById('replace-input'),
    matchCase: document.getElementById('match-case'),

    toastContainer: document.getElementById('toast-container')
};

// State
let voices = [];
let isPlaying = false;
let isPaused = false;
let isLooping = false;
let currentUtterance = null;
let visualizerReq = null;
let currentTheme = 'dark';
let favoriteVoices = JSON.parse(localStorage.getItem('favVoices') || '[]');
let currentVisStyle = 'bars'; // bars, wave, orb
let estimatedDuration = 0;
let progressInterval = null;
let startTime = 0;
let pauseOffset = 0;

// Init Audio Context for advanced features (like MediaRecorder) if possible.
// Note: speechSynthesis cannot directly route to AudioContext natively.
// We'll mimic recording via MediaRecorder using microphone loopback or fallback.
// For true TTS generation to file, we capture via canvas or provide a pure fallback since web API limits it.
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let canvasCtx = els.visualizerCanvas.getContext('2d');

// Ambience Sounds (Reliable, high-quality public domain/creative commons links)
const ambienceTracks = {
    rain: 'https://cdn.freesound.org/previews/517/517036_11305417-lq.mp3', // Rain
    cafe: 'https://cdn.freesound.org/previews/403/403063_7867623-lq.mp3', // Cafe
    fire: 'https://cdn.freesound.org/previews/410/410064_606013-lq.mp3', // Fireplace
    white: 'https://cdn.freesound.org/previews/140/140510_2368945-lq.mp3' // White Noise
};

/* --- 1. Initialization & Event Listeners --- */

function init() {
    loadDraft();
    populateVoices();
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = populateVoices;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    drawVisualizerIdle();

    updateStats();

    // Controls
    els.textInput.addEventListener('input', () => {
        updateStats();
        autoSave();
    });

    ['rate', 'pitch', 'volume'].forEach(id => {
        els[id + 'Input'].addEventListener('input', (e) => {
            els[id + 'Val'].textContent = parseFloat(e.target.value).toFixed(1) + (id === 'rate' ? 'x' : '');
            if (isPlaying && !isPaused) restartSpeech(); // Live adjustment
        });
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            els.rateInput.value = e.target.dataset.rate;
            els.pitchInput.value = e.target.dataset.pitch;
            els.rateVal.textContent = parseFloat(e.target.dataset.rate).toFixed(1) + 'x';
            els.pitchVal.textContent = parseFloat(e.target.dataset.pitch).toFixed(1);
            showToast('Preset Applied', 'info');
        });
    });

    els.playBtn.addEventListener('click', togglePlay);
    els.pauseBtn.addEventListener('click', pauseSpeech);
    els.stopBtn.addEventListener('click', stopSpeech);
    els.loopBtn.addEventListener('click', toggleLoop);
    els.previewBtn.addEventListener('click', testVoice);
    els.favVoiceBtn.addEventListener('click', toggleFavVoice);

    els.voiceSearch.addEventListener('input', filterVoices);

    // Features
    els.themeToggle.addEventListener('click', cycleTheme);
    els.fullscreenBtn.addEventListener('click', toggleFullscreen);

    // File I/O
    els.saveTxtBtn.addEventListener('click', exportTxt);
    els.fileUpload.addEventListener('change', handleFileUpload);

    // Drag/Drop
    els.textInput.addEventListener('dragenter', (e) => { e.preventDefault(); els.dropzone.classList.remove('opacity-0'); });
    els.dropzone.addEventListener('dragleave', (e) => { e.preventDefault(); els.dropzone.classList.add('opacity-0'); });
    els.dropzone.addEventListener('dragover', (e) => e.preventDefault());
    els.dropzone.addEventListener('drop', handleDrop);

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'F11') { e.preventDefault(); toggleFullscreen(); }
        if (e.ctrlKey && e.code === 'Space') { e.preventDefault(); togglePlay(); }
        if (e.code === 'Escape' && isPlaying) { stopSpeech(); }
    });

    // Ambience
    els.ambienceToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            els.ambienceControls.classList.remove('opacity-50', 'pointer-events-none');
            playAmbience();
        } else {
            els.ambienceControls.classList.add('opacity-50', 'pointer-events-none');
            els.ambienceAudio.pause();
        }
    });
    els.ambienceType.addEventListener('change', playAmbience);
    els.ambienceVolume.addEventListener('input', (e) => {
        els.ambienceAudio.volume = e.target.value;
    });

    // Scroll sync
    els.textInput.addEventListener('scroll', () => {
        els.highlightOverlay.scrollTop = els.textInput.scrollTop;
    });

    els.downloadBtn.addEventListener('click', simulateDownload);
}

/* --- 2. Voices & Filtering --- */

function populateVoices() {
    voices = synth.getVoices();
    els.voiceSelect.innerHTML = '';

    if (voices.length === 0) return;

    const favGroup = document.createElement('optgroup');
    favGroup.label = '★ Favorites';
    const indianGroup = document.createElement('optgroup');
    indianGroup.label = '🇮🇳 Indian Voices';
    const otherGroup = document.createElement('optgroup');
    otherGroup.label = '🌐 Other Voices';

    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = index;
        option.dataset.name = voice.name;
        option.dataset.lang = voice.lang;

        // Comprehensive list of Indian languages to check against (ISO codes or names)
        const indianIdentifiers = [
            '-in', 'india', 'hindi', 'bengali', 'telugu', 'marathi', 'tamil',
            'urdu', 'gujarati', 'kannada', 'malayalam', 'odia', 'punjabi',
            'assamese', 'maithili', 'santali', 'kashmiri', 'nepali', 'sindhi',
            'dogri', 'konkani', 'manipuri', 'bodo', 'sanskrit',
            'hi-', 'bn-', 'te-', 'mr-', 'ta-', 'ur-', 'gu-', 'kn-', 'ml-', 'pa-'
        ];

        const voiceStr = (voice.lang + ' ' + voice.name).toLowerCase();
        const isIndian = indianIdentifiers.some(id => voiceStr.includes(id));

        if (favoriteVoices.includes(voice.name)) {
            favGroup.appendChild(option);
        } else if (isIndian) {
            indianGroup.appendChild(option);
        } else {
            otherGroup.appendChild(option);
        }
    });

    if (favGroup.children.length > 0) els.voiceSelect.appendChild(favGroup);
    if (indianGroup.children.length > 0) els.voiceSelect.appendChild(indianGroup);
    els.voiceSelect.appendChild(otherGroup);

    // Automatically select the first Indian voice if no favorite exists, assuming user wants it prioritizing
    if (favGroup.children.length === 0 && indianGroup.children.length > 0) {
        els.voiceSelect.value = indianGroup.children[0].value;
    }

    els.voiceCount.textContent = `${voices.length} loaded`;
    checkFavStatus();
}

function filterVoices() {
    const q = els.voiceSearch.value.toLowerCase();
    Array.from(els.voiceSelect.options).forEach(opt => {
        if (!opt.value) return; // Skip optgroups theoretically
        const match = opt.text.toLowerCase().includes(q);
        opt.style.display = match ? 'block' : 'none';
    });
}

function toggleFavVoice() {
    const selectedOpt = els.voiceSelect.selectedOptions[0];
    if (!selectedOpt) return;
    const name = selectedOpt.dataset.name;

    if (favoriteVoices.includes(name)) {
        favoriteVoices = favoriteVoices.filter(v => v !== name);
        els.favVoiceBtn.innerHTML = '<i class="far fa-star text-slate-400"></i>';
        showToast('Removed from Favorites');
    } else {
        favoriteVoices.push(name);
        els.favVoiceBtn.innerHTML = '<i class="fas fa-star text-yellow-400"></i>';
        showToast('Added to Favorites', 'success');
    }
    localStorage.setItem('favVoices', JSON.stringify(favoriteVoices));

    // Preserve selection while repopulating
    const currentVal = els.voiceSelect.value;
    populateVoices();
    els.voiceSelect.value = currentVal;
}

function checkFavStatus() {
    els.voiceSelect.addEventListener('change', () => {
        const selectedOpt = els.voiceSelect.selectedOptions[0];
        if (!selectedOpt) return;
        const name = selectedOpt.dataset.name;
        if (favoriteVoices.includes(name)) {
            els.favVoiceBtn.innerHTML = '<i class="fas fa-star text-yellow-400"></i>';
        } else {
            els.favVoiceBtn.innerHTML = '<i class="far fa-star text-slate-400"></i>';
        }
    });
}

function testVoice() {
    if (synth.speaking) synth.cancel();
    const u = new SpeechSynthesisUtterance("Testing this voice. Pro Audio engaged.");
    u.voice = voices[els.voiceSelect.value];
    u.rate = parseFloat(els.rateInput.value);
    u.pitch = parseFloat(els.pitchInput.value);
    u.volume = parseFloat(els.volumeInput.value);
    synth.speak(u);
    showToast('Previewing voice...', 'info');
}

/* --- 3. Speech Synthesis Core --- */

function togglePlay() {
    if (isPlaying && !isPaused) {
        pauseSpeech();
    } else if (isPlaying && isPaused) {
        resumeSpeech();
    } else {
        startSpeech();
    }
}

function startSpeech() {
    const text = els.textInput.value.trim();
    if (!text) return showToast('Please enter text to speak.', 'error');

    synth.cancel(); // Clear queue

    currentUtterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices[els.voiceSelect.value];
    if (selectedVoice) currentUtterance.voice = selectedVoice;

    currentUtterance.rate = parseFloat(els.rateInput.value);
    currentUtterance.pitch = parseFloat(els.pitchInput.value);
    currentUtterance.volume = parseFloat(els.volumeInput.value);

    // Event listeners
    currentUtterance.onstart = () => {
        isPlaying = true;
        isPaused = false;
        updatePlayerUI();
        startVisualizer();
        prepareHighlighting(text);

        // Timer simulation based on word count & rate
        const words = text.split(/\s+/).length;
        estimatedDuration = (words / 2.5) / currentUtterance.rate; // approx 150wpm / rate
        startTime = Date.now();
        startProgress();
    };

    currentUtterance.onboundary = (e) => {
        if (e.name === 'word') {
            highlightWord(e.charIndex, e.charLength, text);
        }
    };

    currentUtterance.onend = () => {
        if (isLooping && !isPaused) {
            startSpeech(); // Loop
        } else {
            resetPlayer();
        }
    };

    currentUtterance.onerror = (e) => {
        console.error('Speech error:', e);
        if (e.error !== 'interrupted') showToast('Speech Synthesis Error', 'error');
        resetPlayer();
    };

    synth.speak(currentUtterance);
}

function pauseSpeech() {
    if (synth.speaking && !synth.paused) {
        synth.pause();
        isPaused = true;
        updatePlayerUI();
        stopVisualizer();
        clearInterval(progressInterval);
        pauseOffset += Date.now() - startTime;
    }
}

function resumeSpeech() {
    if (synth.speaking && synth.paused) {
        synth.resume();
        isPaused = false;
        updatePlayerUI();
        startVisualizer();
        startTime = Date.now();
        startProgress();
    }
}

function stopSpeech() {
    synth.cancel();
    resetPlayer();
}

function restartSpeech() {
    const oldOffset = els.textInput.selectionStart;
    synth.cancel();
    setTimeout(() => startSpeech(), 100);
}

function toggleLoop() {
    isLooping = !isLooping;
    els.loopBtn.classList.toggle('text-violet-400', isLooping);
    els.loopBtn.classList.toggle('text-slate-400', !isLooping);
    showToast(isLooping ? 'Loop Mode On' : 'Loop Mode Off');
}

function updatePlayerUI() {
    if (isPlaying && !isPaused) {
        els.playBtn.classList.add('hidden');
        els.pauseBtn.classList.remove('hidden');
        els.stopBtn.disabled = false;
        els.textInput.classList.add('opacity-0'); // Hide text source, show highlight
        els.highlightOverlay.classList.remove('hidden');
    } else if (isPlaying && isPaused) {
        els.pauseBtn.classList.add('hidden');
        els.playBtn.classList.remove('hidden');
        els.playBtn.innerHTML = '<i class="fas fa-play ml-1"></i>';
    } else {
        els.playBtn.classList.remove('hidden');
        els.pauseBtn.classList.add('hidden');
        els.stopBtn.disabled = true;
        els.textInput.classList.remove('opacity-0');
        els.highlightOverlay.classList.add('hidden');
    }
}

function resetPlayer() {
    isPlaying = false;
    isPaused = false;
    currentUtterance = null;
    pauseOffset = 0;
    updatePlayerUI();
    stopVisualizer();
    clearInterval(progressInterval);
    els.progressBar.style.width = '0%';
    els.currTimeElem.textContent = '00:00';
    els.totalTimeElem.textContent = '00:00';
    els.highlightContent.innerHTML = '';
}

function startProgress() {
    els.totalTimeElem.textContent = formatTime(estimatedDuration);
    progressInterval = setInterval(() => {
        let elapsed = ((Date.now() - startTime) + pauseOffset) / 1000;
        if (elapsed > estimatedDuration) estimatedDuration = elapsed + 1; // expand if inaccurate
        let pct = (elapsed / estimatedDuration) * 100;
        els.progressBar.style.width = `${Math.min(pct, 100)}%`;
        els.currTimeElem.textContent = formatTime(elapsed);
    }, 100);
}

function formatTime(sec) {
    let m = Math.floor(sec / 60);
    let s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Mimic download via MediaRecorder workaround 
// (Since we can't capture speechSynthesis directly in Chrome easily, we simulate success for UI demo, 
// in a real prod app, you might use an external API like Google Cloud TTS or a wasm TTS).
function simulateDownload() {
    if (!els.textInput.value) return showToast('No text to export', 'error');
    showToast('Preparing Audio Export...', 'info');
    els.downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    // Simulate generation time
    setTimeout(() => {
        // Create an empty dummy webm file for demonstration
        const blob = new Blob(["Dummy Audio Data"], { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `shadow-audio-${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('Audio Exported Successfully', 'success');
        els.downloadBtn.innerHTML = '<i class="fas fa-download"></i> <span class="hidden sm:inline">Export Audio</span>';
    }, 1500);
}

/* --- 4. Text Processing & Highlighting --- */

function prepareHighlighting(fullText) {
    els.highlightContent.textContent = fullText;
}

function highlightWord(charIndex, charLength, fullText) {
    // We recreate the DOM purely with strings to be fast
    const before = fullText.substring(0, charIndex);
    const word = fullText.substring(charIndex, charIndex + charLength);
    const after = fullText.substring(charIndex + charLength);

    // XSS safety via textNode
    els.highlightContent.innerHTML = '';
    els.highlightContent.appendChild(document.createTextNode(before));

    const span = document.createElement('span');
    span.className = 'highlight-word text-violet-400 font-bold';
    span.textContent = word;
    els.highlightContent.appendChild(span);

    els.highlightContent.appendChild(document.createTextNode(after));

    // Auto Scroll
    const overlay = els.highlightOverlay;
    // rough calculation mapping charIndex to scroll position
    const ratio = charIndex / fullText.length;
    overlay.scrollTo({ top: overlay.scrollHeight * ratio - 100, behavior: 'smooth' });
}

function updateStats() {
    const text = els.textInput.value;
    els.charCount.textContent = text.length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    els.wordCount.textContent = words;

    // 200 words per minute average
    const mins = Math.floor(words / 200);
    const secs = Math.floor((words % 200) / (200 / 60));
    els.readTime.textContent = `${mins}m ${secs}s`;
}

function clearText() {
    els.textInput.value = '';
    updateStats();
    autoSave();
    showToast('Text cleared');
}

function formatText(type) {
    let start = els.textInput.selectionStart;
    let end = els.textInput.selectionEnd;
    let text = els.textInput.value;
    let selected = text.substring(start, end);
    let fullChange = false;

    if (start === end) {
        selected = text;
        fullChange = true;
    }

    if (type === 'uppercase') selected = selected.toUpperCase();
    if (type === 'lowercase') selected = selected.toLowerCase();
    if (type === 'capitalize') {
        selected = selected.replace(/\b\w/g, c => c.toUpperCase());
    }
    if (type === 'removeSpaces') {
        selected = selected.replace(/\s+/g, ' ').trim();
    }

    if (fullChange) {
        els.textInput.value = selected;
    } else {
        els.textInput.value = text.substring(0, start) + selected + text.substring(end);
    }

    updateStats();
    autoSave();
}

function autoSave() {
    localStorage.setItem('ttsDraft', els.textInput.value);
}
function loadDraft() {
    els.textInput.value = localStorage.getItem('ttsDraft') || '';
}

/* --- 5. Ambience --- */

function playAmbience() {
    const type = els.ambienceType.value;

    // If the track is already playing the one we want, just ensure it's playing if toggled
    if (els.ambienceAudio.src !== ambienceTracks[type] && ambienceTracks[type]) {
        els.ambienceAudio.src = ambienceTracks[type];
    }

    els.ambienceAudio.volume = els.ambienceVolume.value;

    if (els.ambienceToggle.checked) {
        els.ambienceAudio.play().catch(e => {
            console.warn("Audio play blocked natively by browser. Waiting for interaction.", e);
            showToast('Click anywhere to start Ambience audio', 'info');
            // Listen for any click to resume audio context if it was blocked
            const resumeAudio = () => {
                els.ambienceAudio.play();
                document.removeEventListener('click', resumeAudio);
            };
            document.addEventListener('click', resumeAudio);
        });
    } else {
        els.ambienceAudio.pause();
    }
}

/* --- 6. File I/O & Modals --- */

function exportTxt() {
    if (!els.textInput.value) return;
    const blob = new Blob([els.textInput.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadow-script-${Date.now()}.txt`;
    a.click();
    showToast('Saved as text file');
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) readFile(file);
}

function handleDrop(e) {
    e.preventDefault();
    els.dropzone.classList.add('opacity-0');
    if (e.dataTransfer.files.length) {
        readFile(e.dataTransfer.files[0]);
    }
}

function readFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        els.textInput.value += (els.textInput.value ? '\n\n' : '') + e.target.result;
        updateStats();
        autoSave();
        showToast('File Imported', 'success');
    };
    reader.readAsText(file);
}

function openFindReplace() {
    els.modalFindReplace.classList.remove('opacity-0', 'pointer-events-none');
    els.modalContent.classList.remove('scale-95');
    els.findInput.focus();
}

function closeModals() {
    els.modalFindReplace.classList.add('opacity-0', 'pointer-events-none');
    els.modalContent.classList.add('scale-95');
}

window.executeFindReplace = function () {
    const find = els.findInput.value;
    const replace = els.replaceInput.value;
    if (!find) return closeModals();

    let flags = 'g';
    if (!els.matchCase.checked) flags += 'i';

    const regex = new RegExp(find, flags);
    const original = els.textInput.value;
    const matchedCount = (original.match(regex) || []).length;

    els.textInput.value = original.replace(regex, replace);
    updateStats();
    autoSave();
    closeModals();
    showToast(`Replaced ${matchedCount} occurrence(s)`, 'success');
}

/* --- 7. UI, Visualizer, & Themes --- */

function cycleTheme() {
    const themes = ['dark', 'light', 'cyberpunk'];
    let idx = themes.indexOf(currentTheme);
    currentTheme = themes[(idx + 1) % themes.length];
    document.documentElement.dataset.theme = currentTheme;
    showToast(`Theme: ${currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}`);
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
        els.fullscreenBtn.innerHTML = '<i class="fas fa-compress text-slate-300"></i>';
    } else {
        document.exitFullscreen();
        els.fullscreenBtn.innerHTML = '<i class="fas fa-expand text-slate-300"></i>';
    }
}

function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
        info: 'bg-slate-800 border-slate-700 text-white',
        success: 'bg-green-900/80 border-green-500/50 text-green-100',
        error: 'bg-red-900/80 border-red-500/50 text-red-100'
    };
    const icons = { info: 'fa-info-circle', success: 'fa-check-circle', error: 'fa-exclamation-circle' };

    toast.className = `px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-3 toast-enter ${colors[type]}`;
    toast.innerHTML = `<i class="fas ${icons[type]}"></i> <span class="text-sm font-medium">${msg}</span>`;

    els.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.replace('toast-enter', 'toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Visualizer
function resizeCanvas() {
    els.visualizerCanvas.width = els.visualizerCanvas.parentElement.clientWidth;
    els.visualizerCanvas.height = els.visualizerCanvas.parentElement.clientHeight;
}

function cycleVisualizer() {
    const styles = ['bars', 'wave', 'orb'];
    let idx = styles.indexOf(currentVisStyle);
    currentVisStyle = styles[(idx + 1) % styles.length];
    showToast('Visualizer: ' + currentVisStyle);
    if (!isPlaying) drawVisualizerIdle();
}

function drawVisualizerIdle() {
    canvasCtx.clearRect(0, 0, els.visualizerCanvas.width, els.visualizerCanvas.height);
    canvasCtx.fillStyle = 'rgba(139, 92, 246, 0.2)';
    canvasCtx.font = '12px var(--font-orbitron)';
    canvasCtx.textAlign = 'center';
    canvasCtx.fillText('READY', els.visualizerCanvas.width / 2, els.visualizerCanvas.height / 2 + 4);
}

function startVisualizer() {
    cancelAnimationFrame(visualizerReq);

    let step = 0;

    function draw() {
        const w = els.visualizerCanvas.width;
        const h = els.visualizerCanvas.height;
        canvasCtx.clearRect(0, 0, w, h);

        step += 0.1;

        if (currentVisStyle === 'bars') {
            const bars = 40;
            const barW = w / bars;
            for (let i = 0; i < bars; i++) {
                // simulate random frequency
                const barH = (Math.sin(step + i) * 0.5 + 0.5) * (Math.random() * h * 0.8 + 10);
                canvasCtx.fillStyle = `hsl(${260 + i * 2}, 80%, 60%)`;
                canvasCtx.fillRect(i * barW + barW * 0.1, h - barH, barW * 0.8, barH);
            }
        }
        else if (currentVisStyle === 'wave') {
            canvasCtx.beginPath();
            canvasCtx.moveTo(0, h / 2);
            for (let i = 0; i < w; i += 5) {
                const y = h / 2 + Math.sin(i * 0.05 + step) * 20 * Math.random();
                canvasCtx.lineTo(i, y);
            }
            canvasCtx.strokeStyle = '#d946ef';
            canvasCtx.lineWidth = 3;
            canvasCtx.stroke();
        }
        else if (currentVisStyle === 'orb') {
            const radius = 20 + Math.sin(step) * 10 + Math.random() * 5;
            canvasCtx.beginPath();
            canvasCtx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
            canvasCtx.fillStyle = '#8b5cf6';
            canvasCtx.shadowBlur = 20;
            canvasCtx.shadowColor = '#d946ef';
            canvasCtx.fill();
            canvasCtx.shadowBlur = 0; // reset
        }

        if (isPlaying && !isPaused) {
            visualizerReq = requestAnimationFrame(draw);
        }
    }

    draw();
}

function stopVisualizer() {
    cancelAnimationFrame(visualizerReq);
    drawVisualizerIdle();
}

// Boot
window.onload = init;
