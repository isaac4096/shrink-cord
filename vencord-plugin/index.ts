/*
 * ShrinkCord - Vencord Plugin
 * Automatically squeezes or cuts oversized media on Discord Desktop under the 20MB limit.
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    targetMB: {
        type: OptionType.SELECT,
        description: "Target file size limit",
        options: [
            { label: "19 MB (Discord Free Limit)", value: 19.0, default: true },
            { label: "48 MB (Nitro Basic Limit)", value: 48.0 },
            { label: "8 MB (Compact Size)", value: 8.0 }
        ]
    },
    defaultMode: {
        type: OptionType.SELECT,
        description: "Default action for oversized media",
        options: [
            { label: "Squeeze (Compress into 1 file)", value: "compress", default: true },
            { label: "Cut into Parts (Preserve 100% quality)", value: "split" }
        ]
    },
    defaultFormat: {
        type: OptionType.SELECT,
        description: "Output video format",
        options: [
            { label: "MP4 (Universal — best compatibility)", value: "mp4", default: true },
            { label: "WebM", value: "webm" }
        ]
    },
    fps: {
        type: OptionType.SELECT,
        description: "Video framerate",
        options: [
            { label: "30 FPS (Standard & Efficient)", value: 30, default: true },
            { label: "60 FPS (Smooth Gaming Clips)", value: 60 }
        ]
    },
    spoilerByDefault: {
        type: OptionType.BOOLEAN,
        description: "Mark compressed media as spoiler by default",
        default: false
    }
});

const VIDEO_EXT_RE = /\.(mp4|mov|mkv|webm|avi|flv|wmv|m4v|3gp|m4p|mpg|mpeg)$/i;
const AUDIO_EXT_RE = /\.(mp3|wav|flac|m4a|aac|ogg|opus|wma|aiff|alac|oga)$/i;
const generatedFiles = new WeakSet<File>();

function isVideoFile(file: File): boolean {
    return (file.type && file.type.startsWith("video/")) || VIDEO_EXT_RE.test(file.name);
}

function isAudioFile(file: File): boolean {
    return (file.type && file.type.startsWith("audio/")) || AUDIO_EXT_RE.test(file.name);
}

function isMediaFile(file: File): boolean {
    return isVideoFile(file) || isAudioFile(file);
}

function calculateNumParts(fileSize: number, targetMB: number): number {
    const targetBytes = (targetMB || 19.0) * 1024 * 1024 * 0.94;
    return Math.max(2, Math.ceil((fileSize || 0) / targetBytes));
}

function formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
}

function formatDuration(seconds: number): string {
    if (!seconds || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
}

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bitDepth = 16;
    const blockAlign = numChannels * (bitDepth / 8);
    const numFrames = buffer.length;
    const dataSize = numFrames * blockAlign;
    const totalSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(arrayBuffer);

    function writeString(offset: number, str: string) {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    }

    writeString(0, "RIFF");
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, "data");
    view.setUint32(40, dataSize, true);

    let offset = 44;
    const channels: Float32Array[] = [];
    for (let c = 0; c < numChannels; c++) {
        channels.push(buffer.getChannelData(c));
    }

    for (let i = 0; i < numFrames; i++) {
        for (let c = 0; c < numChannels; c++) {
            const sample = Math.max(-1, Math.min(1, channels[c][i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
            offset += 2;
        }
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
}

function compressVideoSlice(
    file: File,
    targetMB: number,
    fps: number,
    startTime: number,
    endTime: number,
    format: string,
    onProgress: (pct: number) => void
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const videoEl = document.createElement("video");
        videoEl.preload = "auto";
        videoEl.crossOrigin = "anonymous";
        videoEl.muted = false;
        videoEl.style.cssText = "position: fixed; opacity: 0; pointer-events: none;";
        document.body.appendChild(videoEl);

        const fileUrl = URL.createObjectURL(file);
        videoEl.src = fileUrl;

        let recorder: MediaRecorder | null = null;
        let animId: number | null = null;
        let isStopped = false;

        function cleanup() {
            if (isStopped) return;
            isStopped = true;
            if (animId) cancelAnimationFrame(animId);
            if (recorder && recorder.state !== "inactive") {
                try { recorder.stop(); } catch (e) {}
            }
            videoEl.pause();
            videoEl.removeAttribute("src");
            videoEl.load();
            videoEl.remove();
            URL.revokeObjectURL(fileUrl);
        }

        videoEl.onloadedmetadata = () => {
            const rawDur = Number.isFinite(videoEl.duration) ? videoEl.duration : 60;
            const sliceEnd = (endTime > 0 && endTime <= rawDur) ? endTime : rawDur;
            const sliceStart = Math.min(startTime, sliceEnd - 0.5);
            const duration = Math.max(0.5, sliceEnd - sliceStart);

            const targetTotalBits = targetMB * 8 * 1024 * 1024 * 0.92;
            const totalAvailableBps = Math.floor(targetTotalBits / duration);
            const audioBps = Math.min(96000, Math.max(48000, Math.floor(totalAvailableBps * 0.15)));
            const videoBps = Math.max(100000, totalAvailableBps - audioBps);

            let width = videoEl.videoWidth || 1280;
            let height = videoEl.videoHeight || 720;
            width = Math.max(2, width & ~1);
            height = Math.max(2, height & ~1);

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d", { alpha: false });
            if (!ctx) {
                cleanup();
                return reject(new Error("Unable to create canvas context"));
            }

            const canvasStream = canvas.captureStream(fps);
            const tracks: MediaStreamTrack[] = [canvasStream.getVideoTracks()[0]];

            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            let audioCtx: AudioContext | null = null;
            if (AudioCtx) {
                try {
                    audioCtx = new AudioCtx();
                    const src = audioCtx.createMediaElementSource(videoEl);
                    const dest = audioCtx.createMediaStreamDestination();
                    src.connect(dest);
                    const muteGain = audioCtx.createGain();
                    muteGain.gain.value = 0;
                    src.connect(muteGain);
                    muteGain.connect(audioCtx.destination);
                    const aTrack = dest.stream.getAudioTracks()[0];
                    if (aTrack) tracks.push(aTrack);
                } catch (e) {}
            }

            const mimeType = format === "mp4" && MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
                ? "video/mp4;codecs=avc1"
                : "video/webm;codecs=vp9,opus";

            try {
                recorder = new MediaRecorder(new MediaStream(tracks), {
                    mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : "video/webm",
                    videoBitsPerSecond: videoBps,
                    audioBitsPerSecond: audioBps
                });
            } catch (err: any) {
                cleanup();
                return reject(err);
            }

            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) chunks.push(e.data);
            };

            function finish() {
                if (isStopped) return;
                cleanup();
                if (chunks.length > 0) {
                    resolve(new Blob(chunks, { type: mimeType.split(";")[0] }));
                } else {
                    reject(new Error("Empty video output"));
                }
            }

            recorder.onstop = finish;
            recorder.onerror = () => finish();

            function draw() {
                if (isStopped || videoEl.paused || videoEl.ended) return;
                if (videoEl.currentTime >= sliceEnd || videoEl.ended) {
                    recorder?.stop();
                    return;
                }
                ctx!.drawImage(videoEl, 0, 0, width, height);
                const elapsed = Math.max(0, videoEl.currentTime - sliceStart);
                onProgress(Math.min(99, Math.round((elapsed / duration) * 100)));
                animId = requestAnimationFrame(draw);
            }

            videoEl.currentTime = sliceStart;
            videoEl.addEventListener("seeked", () => {
                videoEl.play().then(() => {
                    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
                    recorder?.start(100);
                    draw();
                }).catch((e) => {
                    cleanup();
                    reject(e);
                });
            }, { once: true });
        };

        videoEl.onerror = () => {
            cleanup();
            reject(new Error("Failed to load video file"));
        };
    });
}

function attachFilesToDiscord(files: File[]) {
    const dataTransfer = new DataTransfer();
    files.forEach((f) => {
        generatedFiles.add(f);
        dataTransfer.items.add(f);
    });

    const fileInput = document.querySelector<HTMLInputElement>(
        'input.file-input[type="file"], form input[type="file"], input[type="file"][multiple]'
    );
    if (fileInput) {
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event("change", { bubbles: true }));
        fileInput.dispatchEvent(new Event("input", { bubbles: true }));
        return;
    }

    const chatBox = document.querySelector<HTMLElement>(
        '[role="textbox"], [data-slate-editor="true"], [contenteditable="true"]'
    );
    if (chatBox) {
        chatBox.focus?.();
        try {
            const pasteEvt = new ClipboardEvent("paste", {
                bubbles: true,
                cancelable: true,
                clipboardData: dataTransfer
            });
            chatBox.dispatchEvent(pasteEvt);
            if (pasteEvt.defaultPrevented) return;
        } catch (e) {}

        chatBox.dispatchEvent(new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer
        }));
    }
}

export default definePlugin({
    name: "ShrinkCord",
    description: "Silently catches oversized media (>20MB) and compresses or cuts them locally to fit Discord limits without Nitro.",
    authors: [{ name: "Isaac4096", id: 0n }],
    settings,

    start() {
        const interceptHandler = async (e: DragEvent | ClipboardEvent | Event) => {
            let files: FileList | null = null;
            if ("dataTransfer" in e && e.dataTransfer?.files?.length) {
                files = e.dataTransfer.files;
            } else if ("clipboardData" in e && e.clipboardData?.files?.length) {
                files = e.clipboardData.files;
            } else if ("target" in e && (e.target as HTMLInputElement)?.type === "file") {
                files = (e.target as HTMLInputElement).files;
            }

            if (!files || files.length === 0) return;

            const limitBytes = (settings.store.targetMB || 19.0) * 1024 * 1024;
            const oversized: File[] = [];

            for (let i = 0; i < files.length; i++) {
                const f = files[i];
                if (!generatedFiles.has(f) && isMediaFile(f) && f.size > limitBytes) {
                    oversized.push(f);
                }
            }

            if (oversized.length === 0) return;

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            for (const file of oversized) {
                const isAudio = isAudioFile(file);
                const mode = settings.store.defaultMode || "compress";
                const targetMB = settings.store.targetMB || 19.0;
                const format = settings.store.defaultFormat || "mp4";
                const fps = settings.store.fps || 30;
                const isSpoiler = settings.store.spoilerByDefault;

                if (!isAudio) {
                    if (mode === "split") {
                        const numParts = calculateNumParts(file.size, targetMB);
                        const dur = 60; // Estimated until metadata
                        const partDur = dur / numParts;
                        const outputFiles: File[] = [];

                        for (let p = 0; p < numParts; p++) {
                            const blob = await compressVideoSlice(file, targetMB, fps, p * partDur, (p + 1) * partDur, format, () => {});
                            const name = `${file.name.replace(/\.[^/.]+$/, "")}-part${p + 1}.${format}`;
                            outputFiles.push(new File([blob], isSpoiler ? `SPOILER_${name}` : name, { type: `video/${format}` }));
                        }
                        attachFilesToDiscord(outputFiles);
                    } else {
                        const blob = await compressVideoSlice(file, targetMB, fps, 0, 0, format, () => {});
                        const name = `${file.name.replace(/\.[^/.]+$/, "")}-compressed.${format}`;
                        attachFilesToDiscord([new File([blob], isSpoiler ? `SPOILER_${name}` : name, { type: `video/${format}` })]);
                    }
                }
            }
        };

        window.addEventListener("drop", interceptHandler, { capture: true, passive: false });
        window.addEventListener("paste", interceptHandler, { capture: true, passive: false });

        (this as any)._cleanup = () => {
            window.removeEventListener("drop", interceptHandler, { capture: true });
            window.removeEventListener("paste", interceptHandler, { capture: true });
        };
    },

    stop() {
        if ((this as any)._cleanup) {
            (this as any)._cleanup();
        }
    }
});
