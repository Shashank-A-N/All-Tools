import os
import io
import base64
import json
from html import escape
from flask import Flask, request, render_template_string, jsonify, send_file
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from datetime import datetime

app = Flask(__name__)

# --- UI TEMPLATE (Dark Mode + Smart Scroll + Fully Responsive) ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Smart Invoice Hub</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <style>
        :root {
            /* Dark Mode Palette */
            --primary: #818cf8;       /* Indigo 400 */
            --primary-hover: #a5b4fc; /* Indigo 300 */
            --primary-bg: #312e81;    /* Indigo 900 */
            
            --bg-grad-start: #0f172a; /* Slate 900 */
            --bg-grad-end: #1e293b;   /* Slate 800 */
            
            --surface: #1e293b;       /* Slate 800 */
            --surface-hover: #334155; /* Slate 700 */
            
            --text-main: #f8fafc;     /* Slate 50 */
            --text-sub: #94a3b8;      /* Slate 400 */
            --border: #334155;        /* Slate 700 */
            
            --success-bg: #064e3b;    /* Emerald 900 */
            --success-text: #34d399;  /* Emerald 400 */
            
            --danger-bg: #450a0a;     /* Red 900 */
            --danger-text: #f87171;   /* Red 400 */

            --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5);
            
            /* Responsive Font Sizes */
            --h1-size: clamp(1.2rem, 4vw, 1.5rem);
            --body-size: clamp(0.875rem, 2vw, 1rem);
        }

        * { box-sizing: border-box; }

        /* --- Global Scrollbar Styling (Smart Scroll) --- */
        * {
            scrollbar-width: thin;
            scrollbar-color: var(--border) transparent;
        }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
            background-color: var(--border);
            border-radius: 20px;
            border: 2px solid transparent; 
            background-clip: content-box;
            transition: background-color 0.2s ease;
        }
        ::-webkit-scrollbar-thumb:hover { background-color: var(--text-sub); }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: linear-gradient(135deg, var(--bg-grad-start) 0%, var(--bg-grad-end) 100%);
            color: var(--text-main);
            height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            font-size: var(--body-size);
        }

        /* --- Main Dashboard Card --- */
        .dashboard-card {
            background: var(--surface);
            width: 100%;
            max-width: 900px;
            height: 85vh;
            max-height: 800px;
            border-radius: 1.5rem;
            box-shadow: var(--shadow-lg);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
            border: 1px solid var(--border);
            transition: all 0.3s ease;
        }

        /* Header */
        .card-header {
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(30, 41, 59, 0.95);
            backdrop-filter: blur(8px);
            z-index: 10;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .brand-icon {
            width: 40px; height: 40px;
            background: var(--primary-bg);
            color: var(--primary);
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.25rem;
            box-shadow: 0 0 10px rgba(129, 140, 248, 0.2);
            flex-shrink: 0;
        }

        .brand-text h1 { margin: 0; font-size: var(--h1-size); font-weight: 700; color: var(--text-main); }
        .brand-text p { margin: 0; font-size: 0.85rem; color: var(--text-sub); }

        .header-actions a {
            font-size: 0.85rem; color: var(--text-sub); text-decoration: none; 
            padding: 0.5rem 1rem; border-radius: 0.5rem; transition: 0.2s;
            border: 1px solid var(--border);
            background: var(--surface-hover);
            white-space: nowrap;
        }
        .header-actions a:hover { 
            background: var(--primary-bg); 
            color: var(--primary); 
            border-color: var(--primary); 
        }

        /* Content Area with Smooth Scroll */
        .card-body {
            flex: 1;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            position: relative;
            overflow-y: auto;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch; 
            overscroll-behavior: contain; 
            will-change: scroll-position;
        }

        /* Steps Animation */
        .step-view {
            display: flex; flex-direction: column; height: 100%;
            animation: fadeIn 0.4s ease-out;
        }
        .hidden { display: none !important; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* --- Upload Zone --- */
        .upload-zone {
            border: 2px dashed var(--border);
            border-radius: 1rem;
            padding: 3rem;
            text-align: center;
            transition: all 0.2s ease;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.02);
            position: relative;
            flex-shrink: 0;
        }

        .upload-zone:hover, .upload-zone.drag-active {
            border-color: var(--primary);
            background: rgba(129, 140, 248, 0.05);
            transform: translateY(-2px);
        }

        .upload-icon-large { font-size: 2.5rem; margin-bottom: 1rem; display: block; animation: bounce 3s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        /* --- File List --- */
        .list-container {
            flex: 1;
            border: 1px solid var(--border);
            border-radius: 1rem;
            padding: 0.5rem;
            margin-bottom: 1rem;
            min-height: 150px;
            background: rgba(0,0,0,0.2);
            overflow-y: auto;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
            will-change: scroll-position;
        }

        .list-empty-state {
            height: 100%; display: flex; flex-direction: column; 
            align-items: center; justify-content: center; color: var(--text-sub); gap: 1rem; text-align: center;
        }

        .file-row {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            background: transparent;
            border-bottom: 1px solid var(--border);
            transition: background 0.2s;
            gap: 1rem;
        }
        .file-row:last-child { border-bottom: none; }
        .file-row:hover { background: var(--surface-hover); }

        .file-details {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 1rem;
            min-width: 0; 
        }

        .file-icon {
            width: 32px; height: 32px;
            background: var(--primary-bg);
            color: var(--primary);
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }

        .file-meta {
            display: flex;
            flex-direction: column;
            min-width: 0;
        }

        .file-name {
            font-weight: 600;
            font-size: 0.9rem;
            color: var(--text-main);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .file-size {
            font-size: 0.75rem;
            color: var(--text-sub);
        }

        /* Badges */
        .badge {
            font-size: 0.75rem;
            padding: 0.25rem 0.75rem;
            border-radius: 2rem;
            font-weight: 600;
            flex-shrink: 0;
            white-space: nowrap;
        }
        .badge-queue { background: var(--surface-hover); color: var(--text-sub); border: 1px solid var(--border); }
        .badge-ready { background: var(--success-bg); color: var(--success-text); border: 1px solid var(--success-bg); }

        /* Actions */
        .row-action {
            width: 32px; height: 32px;
            border-radius: 8px;
            border: none;
            background: transparent;
            color: var(--text-sub);
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: 0.2s;
            flex-shrink: 0;
        }
        .row-action:hover { background: var(--danger-bg); color: var(--danger-text); }
        .row-action.download:hover { background: var(--primary-bg); color: var(--primary); }

        /* Footer */
        .card-footer {
            padding: 1.5rem 2rem;
            border-top: 1px solid var(--border);
            background: var(--surface);
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            flex-shrink: 0;
        }

        /* Buttons */
        .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 0.95rem;
            border: none;
            cursor: pointer;
            transition: all 0.2s;
            display: flex; align-items: center; justify-content: center; gap: 0.5rem;
            white-space: nowrap;
        }

        .btn-primary {
            background: var(--primary);
            color: #111827; 
            box-shadow: 0 0 15px rgba(129, 140, 248, 0.4);
        }
        .btn-primary:hover:not(:disabled) { 
            background: var(--primary-hover); 
            transform: translateY(-2px); 
            box-shadow: 0 0 20px rgba(129, 140, 248, 0.6);
        }
        .btn-primary:disabled { background: var(--border); color: var(--text-sub); cursor: not-allowed; box-shadow: none; }

        .btn-ghost { background: transparent; color: var(--text-sub); }
        .btn-ghost:hover { background: var(--surface-hover); color: var(--text-main); }

        /* Responsive Text Toggles */
        .desktop-text { display: inline; }
        .mobile-text { display: none; }

        /* Checkbox Custom */
        .checkbox-custom { width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer; filter: grayscale(1) brightness(1.5); }

        /* Loader */
        .loader-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(5px);
            z-index: 50;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        
        .infinity-loader {
            width: 60px; height: 30px;
            position: relative;
        }
        .infinity-loader:before, .infinity-loader:after {
            content: "";
            position: absolute; top: 0;
            width: 30px; height: 30px;
            border: 4px solid var(--primary);
            border-radius: 50% 50% 0 50%;
            transform: rotate(-45deg);
            animation: infinity 2s infinite linear;
        }
        .infinity-loader:after {
            left: auto; right: 0;
            border-radius: 50% 50% 50% 0;
            transform: rotate(45deg);
            border-color: var(--primary-hover);
            animation-delay: -1s;
        }
        @keyframes infinity {
            0% { transform: rotate(-45deg); }
            50% { transform: rotate(-225deg); }
            100% { transform: rotate(-45deg); }
        }

        /* --- RESPONSIVE MEDIA QUERIES --- */
        
        /* Tablet & Mobile Breakpoint */
        @media (max-width: 768px) {
            .dashboard-card {
                height: 100vh;
                max-height: none;
                border-radius: 0;
                border: none;
                box-shadow: none;
            }
            .card-header, .card-footer {
                padding: 1rem;
            }
            .card-body {
                padding: 1rem;
                gap: 1rem;
            }
            .upload-zone {
                padding: 1.5rem;
            }
            .upload-icon-large { font-size: 2rem; margin-bottom: 0.5rem; }
            h3 { font-size: 1.1rem; }
            
            /* Hide non-essential elements to save space */
            .brand-text p, .file-size { 
                display: none; 
            }
            
            /* Make actions easier to tap */
            .row-action { width: 36px; height: 36px; }
        }

        /* Mobile specific adjustments */
        @media (max-width: 480px) {
            .brand-text h1 { font-size: 1.1rem; }
            .header-actions a { padding: 0.4rem 0.8rem; font-size: 0.75rem; }
            
            /* Switch to Icons for Buttons */
            .desktop-text { display: none; }
            .mobile-text { display: inline; }
            
            .btn { padding: 0.6rem 1rem; }
            
            .file-details { gap: 0.75rem; }
            .file-icon { width: 28px; height: 28px; font-size: 0.9rem; }
            
            /* Adjust badges */
            .badge { padding: 0.2rem 0.5rem; font-size: 0.7rem; }
            
            .card-footer { justify-content: space-between; }
            .card-footer > div { width: 100%; justify-content: space-between; }
        }

    </style>
</head>
<body>

    <div class="dashboard-card">
        <!-- Header -->
        <div class="card-header">
            <div class="brand">
                <div class="brand-icon">⚡</div>
                <div class="brand-text">
                    <h1>Smart Invoice</h1>
                    <p>Dark Edition</p>
                </div>
            </div>
            <div class="header-actions">
                <a href="/sample" target="_blank">
                    <span class="desktop-text">Download Template</span>
                    <span class="mobile-text">Template</span>
                </a>
            </div>
        </div>

        <!-- Body -->
        <div class="card-body">
            
            <!-- VIEW 1: Upload -->
            <div id="view-upload" class="step-view">
                <div class="upload-zone" id="drop-zone">
                    <span class="upload-icon-large" style="filter: drop-shadow(0 0 10px rgba(129, 140, 248, 0.5));">☁️</span>
                    <h3 style="margin: 0; color: var(--text-main);">Drop Excel Files</h3>
                    <p class="desktop-text" style="margin: 0.5rem 0 0; color: var(--text-sub); font-size: 0.9rem;">or click to browse (.xlsx)</p>
                    <input type="file" id="file-input" accept=".xlsx" multiple style="position: absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer;">
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin: 1.5rem 0 0.5rem;">
                    <h4 style="margin: 0; font-weight: 600; color: var(--text-main);">Queue</h4>
                    <span id="queue-count" style="font-size: 0.8rem; color: var(--text-sub);">0 files</span>
                </div>

                <div class="list-container" id="queue-list">
                    <div class="list-empty-state">
                        <span>Waiting for files...</span>
                    </div>
                </div>
            </div>

            <!-- VIEW 2: Results -->
            <div id="view-results" class="step-view hidden">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                        <h2 style="margin: 0; font-size: 1.5rem; color: var(--text-main);">Complete</h2>
                        <p class="desktop-text" style="margin: 0; color: var(--text-sub);">Select files to download.</p>
                    </div>
                    <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; cursor: pointer; user-select: none; color: var(--text-main);">
                        <input type="checkbox" id="select-all" class="checkbox-custom" checked onchange="toggleSelectAll()">
                        Select All
                    </label>
                </div>

                <div class="list-container" id="results-list"></div>
            </div>

        </div>

        <!-- Footer -->
        <div class="card-footer">
            <div id="footer-upload" style="display: flex; width: 100%; justify-content: flex-end; gap: 1rem;">
                <button class="btn btn-ghost" onclick="clearQueue()" id="btn-clear" style="display: none;">
                    <span class="desktop-text">Clear All</span>
                    <span class="mobile-text">✕</span>
                </button>
                <button class="btn btn-primary" id="btn-generate" disabled onclick="submitFiles()">
                    <span class="desktop-text">Generate Invoices</span>
                    <span class="mobile-text">⚡ Generate</span>
                </button>
            </div>

            <div id="footer-results" class="hidden" style="display: flex; width: 100%; justify-content: flex-end; gap: 1rem;">
                <button class="btn btn-ghost" onclick="resetApp()">
                    <span class="desktop-text">Start Over</span>
                    <span class="mobile-text">↺</span>
                </button>
                <button class="btn btn-primary" id="btn-download-batch" onclick="downloadSelectedZip()">
                    <span class="desktop-text">Download ZIP</span>
                    <span class="mobile-text">⬇ ZIP</span>
                </button>
            </div>
        </div>

        <!-- Loader -->
        <div id="loader" class="loader-overlay hidden">
            <div class="infinity-loader"></div>
            <h3 style="margin-top: 2rem; color: var(--primary);">Crunching Data...</h3>
        </div>

    </div>

    <script>
        // State
        let queue = [];
        let results = [];

        // Elements
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        const queueList = document.getElementById('queue-list');
        const resultsList = document.getElementById('results-list');
        const loader = document.getElementById('loader');
        
        // Views
        const viewUpload = document.getElementById('view-upload');
        const viewResults = document.getElementById('view-results');
        const footerUpload = document.getElementById('footer-upload');
        const footerResults = document.getElementById('footer-results');

        // Buttons
        const btnGenerate = document.getElementById('btn-generate');
        const btnClear = document.getElementById('btn-clear');
        const btnDownloadBatch = document.getElementById('btn-download-batch');

        // --- Drag & Drop ---
        ['dragenter', 'dragover'].forEach(e => dropZone.addEventListener(e, (ev) => { 
            ev.preventDefault(); dropZone.classList.add('drag-active'); 
        }));
        ['dragleave', 'drop'].forEach(e => dropZone.addEventListener(e, (ev) => { 
            ev.preventDefault(); dropZone.classList.remove('drag-active'); 
        }));
        dropZone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

        // --- Logic ---

        function handleFiles(files) {
            Array.from(files).forEach(file => {
                if(file.name.endsWith('.xlsx') && !queue.some(f => f.name === file.name)) {
                    queue.push(file);
                }
            });
            renderQueue();
            fileInput.value = '';
        }

        function removeFile(index) {
            queue.splice(index, 1);
            renderQueue();
        }

        function clearQueue() {
            queue = [];
            renderQueue();
        }

        function renderQueue() {
            document.getElementById('queue-count').innerText = `${queue.length} files`;
            
            if(queue.length === 0) {
                queueList.innerHTML = '<div class="list-empty-state"><span>Waiting for files...</span></div>';
                btnGenerate.disabled = true;
                btnGenerate.innerHTML = '<span class="desktop-text">Generate Invoices</span><span class="mobile-text">⚡ Generate</span>';
                btnClear.style.display = 'none';
                return;
            }

            btnClear.style.display = 'block';
            btnGenerate.disabled = false;
            // Update button text logic for responsive
            btnGenerate.innerHTML = `
                <span class="desktop-text">Generate ${queue.length} Documents</span>
                <span class="mobile-text">⚡ Generate (${queue.length})</span>
            `;

            queueList.innerHTML = queue.map((file, i) => `
                <div class="file-row" style="animation: fadeIn 0.3s ease-out forwards; animation-delay: ${i*0.05}s">
                    <div class="file-details">
                        <div class="file-icon">📄</div>
                        <div class="file-meta">
                            <span class="file-name" title="${file.name}">${file.name}</span>
                            <span class="file-size">${(file.size/1024).toFixed(1)} KB</span>
                        </div>
                    </div>
                    <span class="badge badge-queue desktop-text">Queued</span>
                    <button class="row-action" onclick="removeFile(${i})">✕</button>
                </div>
            `).join('');
            
            queueList.scrollTop = queueList.scrollHeight;
        }

        async function submitFiles() {
            loader.classList.remove('hidden');
            const formData = new FormData();
            queue.forEach(f => formData.append('file', f));

            try {
                const res = await fetch('/generate', { method: 'POST', body: formData });
                const data = await res.json();
                
                if(!res.ok) throw new Error(data.error);
                
                results = data.files.map(f => ({...f, selected: true}));
                
                setTimeout(() => {
                    renderResults();
                    switchView('results');
                    loader.classList.add('hidden');
                }, 800);

            } catch (e) {
                alert(e.message);
                loader.classList.add('hidden');
            }
        }

        function switchView(viewName) {
            if(viewName === 'results') {
                viewUpload.classList.add('hidden');
                viewResults.classList.remove('hidden');
                footerUpload.classList.add('hidden');
                footerResults.classList.remove('hidden');
            } else {
                viewUpload.classList.remove('hidden');
                viewResults.classList.add('hidden');
                footerUpload.classList.remove('hidden');
                footerResults.classList.add('hidden');
            }
        }

        function renderResults() {
            resultsList.innerHTML = results.map((file, i) => `
                <div class="file-row">
                    <input type="checkbox" class="checkbox-custom" 
                           ${file.selected ? 'checked' : ''} 
                           onchange="toggleFile(${i})">
                    <div class="file-details">
                        <div class="file-icon" style="background:var(--success-bg); color:var(--success-text)">✓</div>
                        <div class="file-meta">
                            <span class="file-name" title="${file.name}">${file.name}</span>
                            <span class="badge badge-ready desktop-text">Ready</span>
                        </div>
                    </div>
                    <button class="row-action download" onclick="downloadSingle(${i})">⬇</button>
                </div>
            `).join('');
            updateDownloadBtn();
        }

        function toggleFile(index) {
            results[index].selected = !results[index].selected;
            updateDownloadBtn();
            
            const allSelected = results.every(f => f.selected);
            const noneSelected = results.every(f => !f.selected);
            const selectAll = document.getElementById('select-all');
            
            selectAll.checked = allSelected;
            selectAll.indeterminate = !allSelected && !noneSelected;
        }

        function toggleSelectAll() {
            const state = document.getElementById('select-all').checked;
            results.forEach(f => f.selected = state);
            renderResults();
        }

        function updateDownloadBtn() {
            const count = results.filter(f => f.selected).length;
            btnDownloadBatch.disabled = count === 0;
            
            btnDownloadBatch.innerHTML = count === 0 
                ? '<span class="desktop-text">Select Files</span><span class="mobile-text">Select</span>'
                : `<span class="desktop-text">Download ${count} (ZIP)</span><span class="mobile-text">⬇ ZIP (${count})</span>`;
        }

        // --- Download Helpers ---
        function base64ToBlob(b64) {
            const bin = atob(b64);
            const len = bin.length;
            const arr = new Uint8Array(len);
            for(let i=0; i<len; i++) arr[i] = bin.charCodeAt(i);
            return new Blob([arr], {type: 'application/pdf'});
        }

        function downloadSingle(index) {
            const file = results[index];
            const link = document.createElement('a');
            link.href = URL.createObjectURL(base64ToBlob(file.data));
            link.download = file.name;
            link.click();
        }

        async function downloadSelectedZip() {
            const selected = results.filter(f => f.selected);
            if(selected.length === 0) return;

            const zip = new JSZip();
            selected.forEach(f => zip.file(f.name, f.data, {base64:true}));
            
            const content = await zip.generateAsync({type:"blob"});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `Invoices_Batch_${new Date().getTime()}.zip`;
            link.click();
        }

        function resetApp() {
            queue = [];
            results = [];
            renderQueue();
            switchView('upload');
        }
    </script>
</body>
</html>
"""

# --- BACKEND LOGIC ---

@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE)

@app.route('/sample')
def download_sample():
    # Robust Sample Data
    data = {
        'Invoice ID': [f'INV-{1001+i}' for i in range(20)],
        'Date': [datetime.now().strftime('%Y-%m-%d')] * 20,
        'Client Name': [f'Client {chr(65+i)} Corp' for i in range(20)],
        'Service Description': [
            'IT Consulting Services' if i % 2 == 0 else 'Annual Maintenance Contract' for i in range(20)
        ],
        'Hours': [10, 25, 5, 40] * 5,
        'Rate': [100.00, 150.50, 80.00, 120.00] * 5,
        'Total Amount': [1000.00, 3762.50, 400.00, 4800.00] * 5
    }
    df = pd.DataFrame(data)
    
    # Create Excel in memory
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Invoices')
        
        # Auto-adjust column widths (basic estimation)
        worksheet = writer.sheets['Invoices']
        for idx, col in enumerate(df.columns):
            series = df[col]
            max_len = max((
                series.astype(str).map(len).max(),
                len(str(col))
            )) + 2 
            worksheet.column_dimensions[chr(65 + idx)].width = max_len

    output.seek(0)
    
    return send_file(
        output, 
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True, 
        download_name='Smart_Invoice_Template.xlsx'
    )

def create_pdf_bytes(file_storage):
    try:
        df = pd.read_excel(file_storage)
        headers = df.columns.tolist()
        num_cols = len(headers)

        if num_cols == 0: return None

        page_size = landscape(letter) if num_cols > 6 else letter
        page_width = page_size[0]

        base_font_size = 10
        if num_cols > 15: base_font_size = 6
        elif num_cols > 10: base_font_size = 8
            
        styles = getSampleStyleSheet()
        cell_style = ParagraphStyle('CellStyle', parent=styles['Normal'], fontSize=base_font_size, leading=base_font_size + 2)
        header_style = ParagraphStyle('HeaderStyle', parent=styles['Normal'], fontSize=base_font_size, leading=base_font_size + 2, textColor=colors.whitesmoke, fontName='Helvetica-Bold', alignment=1)

        table_data = []
        table_data.append([Paragraph(escape(str(h)), header_style) for h in headers])
        
        for row in df.itertuples(index=False):
            row_cells = []
            for cell in row:
                if pd.notna(cell):
                    clean_text = escape(str(cell))
                    row_cells.append(Paragraph(clean_text, cell_style))
                else:
                    row_cells.append(Paragraph("", cell_style))
            table_data.append(row_cells)

        margin = 30
        available_width = page_width - (margin * 2)
        col_width = available_width / num_cols
        
        t = Table(table_data, colWidths=[col_width] * num_cols, repeatRows=1)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#4338ca')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
        ]))

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=page_size, leftMargin=margin, rightMargin=margin, topMargin=margin, bottomMargin=margin)
        doc.build([Paragraph(f"Batch Report: {escape(file_storage.filename)}", styles['Heading3']), Spacer(1, 10), t])
        buffer.seek(0)
        return buffer.read()
        
    except Exception as e:
        print(f"Error processing {file_storage.filename}: {e}")
        return None

@app.route('/generate', methods=['POST'])
def generate_batch():
    files = request.files.getlist('file')
    if not files or files[0].filename == '':
        return jsonify({"error": "No files uploaded"}), 400

    processed_files = []
    for f in files:
        if f.filename.endswith('.xlsx'):
            pdf_bytes = create_pdf_bytes(f)
            if pdf_bytes:
                name = os.path.splitext(f.filename)[0] + ".pdf"
                b64_data = base64.b64encode(pdf_bytes).decode('utf-8')
                processed_files.append({"name": name, "data": b64_data})

    if not processed_files:
        return jsonify({"error": "No valid Excel files processed."}), 400

    return jsonify({"files": processed_files})

if __name__ == "__main__":
    app.run(debug=True)