const tools = [
    {
        "title": "AI Subtitle Generator",
        "desc": "Upload a video to generate subtitles instantly using Whisper AI.",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./subtitles/index.html",
        "tags": "utility, AI Subtitle Generator, video"
    },
    {
        "title": "Batch Video Rotator",
        "desc": "Rotate and convert multiple videos locally.",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "edit",
        "link": "./rotate/index.html",
        "tags": "edit, Batch Video Rotator, video"
    },
    {
        "title": "Frame Grabber Pro",
        "desc": "Drag & drop or tap to browse",
        "icon": "fa-tools",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./frame-grabber/index.html",
        "tags": "utility, Frame Grabber Pro, video"
    },
    {
        "title": "Fusion Studio - Mobile Optimized",
        "desc": "No clips added",
        "icon": "fa-tools",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./merge/index.html",
        "tags": "utility, Fusion Studio   Mobile Optimized, video"
    },
    {
        "title": "Metadata Scrubber | Privacy Tool",
        "desc": "No description available.",
        "icon": "fa-tools",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "analysis",
        "link": "./MetadataScrubber/index.html",
        "tags": "analysis, Metadata Scrubber   Privacy Tool, video"
    },
    {
        "title": "PrivacyBlur Ultimate - Pro Video Privacy Tool",
        "desc": "Drop video file here or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "security",
        "link": "./bluring/index.html",
        "tags": "security, PrivacyBlur Ultimate   Pro Video Privacy Tool, video"
    },
    {
        "title": "Redactor | Blur Tool",
        "desc": "Upload video to auto-detect and blur sensitive regions.",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "security",
        "link": "./Redactor/index.html",
        "tags": "security, Redactor   Blur Tool, video"
    },
    {
        "title": "Secure Cam | RAM Record",
        "desc": "No description available.",
        "icon": "fa-lock",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "record",
        "link": "./SecureCam/index.html",
        "tags": "record, Secure Cam   RAM Record, video"
    },
    {
        "title": "Secure Encoder | Shadow Video",
        "desc": "Support for MP4, WebM, MOV",
        "icon": "fa-code",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./VideoEncoder/index.html",
        "tags": "utility, Secure Encoder   Shadow Video, video"
    },
    {
        "title": "Shadow Vault | Encrypted Storage",
        "desc": "FOLDER EMPTY",
        "icon": "fa-folder",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "security",
        "link": "./VideoVault/index.html",
        "tags": "security, Shadow Vault   Encrypted Storage, video"
    },
    {
        "title": "Shadow Video - Audio Swap",
        "desc": "No description available.",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "convert",
        "link": "./Audio Replacer/index.html",
        "tags": "convert, Shadow Video   Audio Swap, video"
    },
    {
        "title": "Shadow Video - Bitrate Calc",
        "desc": "No description available.",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "analysis",
        "link": "./Bitrate Calculator/index.html",
        "tags": "analysis, Shadow Video   Bitrate Calc, video"
    },
    {
        "title": "Shadow Video - Chroma Key",
        "desc": "Drag & drop or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./Chroma Key/index.html",
        "tags": "utility, Shadow Video   Chroma Key, video"
    },
    {
        "title": "Shadow Video - Filters",
        "desc": "No description available.",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./Video Filters/index.html",
        "tags": "utility, Shadow Video   Filters, video"
    },
    {
        "title": "Shadow Video - GIF to Video",
        "desc": "Drag & drop or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "convert",
        "link": "./GIF to Video/index.html",
        "tags": "convert, Shadow Video   GIF to Video, video"
    },
    {
        "title": "Shadow Video - Loop",
        "desc": "Drag & drop or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "edit",
        "link": "./Loop Video/index.html",
        "tags": "edit, Shadow Video   Loop, video"
    },
    {
        "title": "Shadow Video - Metadata",
        "desc": "Drag & drop or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "analysis",
        "link": "./Metadata Viewer/index.html",
        "tags": "analysis, Shadow Video   Metadata, video"
    },
    {
        "title": "Shadow Video - Mute",
        "desc": "Drag & drop or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./Mute Video/index.html",
        "tags": "utility, Shadow Video   Mute, video"
    },
    {
        "title": "Shadow Video - PIP",
        "desc": "Drag & drop or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./PIP Enabler/index.html",
        "tags": "utility, Shadow Video   PIP, video"
    },
    {
        "title": "Shadow Video - Professional Cropper",
        "desc": "No description available.",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "edit",
        "link": "./Video Cropper/index.html",
        "tags": "edit, Shadow Video   Professional Cropper, video"
    },
    {
        "title": "Shadow Video - Resizer",
        "desc": "No description available.",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./Video Resizer/index.html",
        "tags": "utility, Shadow Video   Resizer, video"
    },
    {
        "title": "Shadow Video - Screen Recorder",
        "desc": "Click \"Start Recording\" to choose a screen",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "record",
        "link": "./Screen Recorder/index.html",
        "tags": "record, Shadow Video   Screen Recorder, video"
    },
    {
        "title": "Shadow Video - Sync",
        "desc": "Drag & drop or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./Video Sync/index.html",
        "tags": "utility, Shadow Video   Sync, video"
    },
    {
        "title": "Shadow Video - Teleprompter",
        "desc": "No description available.",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./Teleprompter/index.html",
        "tags": "utility, Shadow Video   Teleprompter, video"
    },
    {
        "title": "Shadow Video - Thumbnails",
        "desc": "Drag & drop or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./Thumbnail Generator/index.html",
        "tags": "utility, Shadow Video   Thumbnails, video"
    },
    {
        "title": "Shadow Video - Video Flip",
        "desc": "Drag & drop or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "edit",
        "link": "./Video Flip/index.html",
        "tags": "edit, Shadow Video   Video Flip, video"
    },
    {
        "title": "Shadow Video - Video Reverse",
        "desc": "Drag & drop or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "edit",
        "link": "./Video Reverse/index.html",
        "tags": "edit, Shadow Video   Video Reverse, video"
    },
    {
        "title": "Shadow Video - Video to GIF",
        "desc": "Drag & drop or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "convert",
        "link": "./Video to GIF/index.html",
        "tags": "convert, Shadow Video   Video to GIF, video"
    },
    {
        "title": "Shadow Video - Volume Booster",
        "desc": "Drag & drop or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "edit",
        "link": "./Volume Booster/index.html",
        "tags": "edit, Shadow Video   Volume Booster, video"
    },
    {
        "title": "Shadow Video - Watermark",
        "desc": "Drag & drop or click to browse",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "security",
        "link": "./Video Watermark/index.html",
        "tags": "security, Shadow Video   Watermark, video"
    },
    {
        "title": "Shadow Video - Webcam Recorder",
        "desc": "Click \"Activate Camera\" to enable input",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "record",
        "link": "./Webcam Recorder/index.html",
        "tags": "record, Shadow Video   Webcam Recorder, video"
    },
    {
        "title": "SonicExtract Pro - Batch Audio Tool",
        "desc": "Drag & drop multiple files",
        "icon": "fa-music",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "convert",
        "link": "./audio-extractor/index.html",
        "tags": "convert, SonicExtract Pro   Batch Audio Tool, video"
    },
    {
        "title": "SpeedControl Studio",
        "desc": "Do not close this window or switch tabs.",
        "icon": "fa-tachometer-alt",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "edit",
        "link": "./Video Speed Controller/index.html",
        "tags": "edit, SpeedControl Studio, video"
    },
    {
        "title": "SplitStream Pro - Batch Video Splitter",
        "desc": "Local Batch Video Processor",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "edit",
        "link": "./split/index.html",
        "tags": "edit, SplitStream Pro   Batch Video Splitter, video"
    },
    {
        "title": "Steganography | Hidden Data",
        "desc": "Hide text or files inside a video container.",
        "icon": "fa-font",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "security",
        "link": "./Steganography/index.html",
        "tags": "security, Steganography   Hidden Data, video"
    },
    {
        "title": "VidCompress.io - Pro Video Tools",
        "desc": "No description available.",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "utility",
        "link": "./converter/index.html",
        "tags": "utility, VidCompress io   Pro Video Tools, video"
    },
    {
        "title": "Video Compressor (Backend Edition)",
        "desc": "High-speed server-side processing.",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "edit",
        "link": "./compressor/index.html",
        "tags": "edit, Video Compressor  Backend Edition , video"
    },
    {
        "title": "Video Decoder | Deep Analysis",
        "desc": "Load file to analyze structure",
        "icon": "fa-code",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "analysis",
        "link": "./videodecoder/index.html",
        "tags": "analysis, Video Decoder   Deep Analysis, video"
    },
    {
        "title": "Video Hasher | Integrity",
        "desc": "No description available.",
        "icon": "fa-video",
        "color": "text-blue-400",
        "bg": "bg-blue-500/10",
        "category": "security",
        "link": "./VideoHasher/index.html",
        "tags": "security, Video Hasher   Integrity, video"
    }
];