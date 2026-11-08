/**
 * ShrinkCord - Modern Native Discord UI Component
 * 1:1 Discord Dark Theme modal matching Discord's official rich design system.
 */

(function () {
  "use strict";

  const LOGO_URL = (function () {
    try {
      const extApi = typeof chrome !== "undefined" && chrome?.runtime ? chrome : (typeof browser !== "undefined" ? browser : null);
      return extApi?.runtime?.getURL ? extApi.runtime.getURL("icons/logo.png") : "";
    } catch (e) {
      return "";
    }
  })();
  const STYLE_ID = "dshrink-modal-styles";

  const ICONS = {
    zap: `<svg class="dshrink-btn-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    close: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    file: `<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm0 1.5L18.5 8H14zM6 20V4h6v6h6v10z"/></svg>`,
    warn: `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 10h2v4h-2zm0 6h2v2h-2z"/></svg>`,
    audio: `<svg class="dshrink-file-icon" viewBox="0 0 24 24" fill="none" stroke="#5865f2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    video: `<svg class="dshrink-file-icon" viewBox="0 0 24 24" fill="none" stroke="#5865f2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>`,
    play: `<svg viewBox="0 0 24 24" width="18" height="18"><polygon points="7 4 20 12 7 20 7 4" fill="currentColor"/></svg>`,
    pause: `<svg viewBox="0 0 24 24" width="18" height="18"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>`,
    volume: `<svg viewBox="0 0 24 24" width="13" height="13"><path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`,
    mute: `<svg viewBox="0 0 24 24" width="13" height="13"><path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
    scissors: `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`
  };

  const MODAL_CSS = `
    #dshrink-modal-root {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      pointer-events: auto !important;
      font-family: var(--font-primary, "gg sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif) !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }

    #dshrink-modal-root * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: inherit;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    #dshrink-modal-root .dshrink-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.82);
      backdrop-filter: blur(8px);
      animation: dshrink-fade 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    }

    #dshrink-modal-root .dshrink-modal {
      position: relative;
      background: radial-gradient(ellipse 110% 70% at 50% -10%, #262c66 0%, #202225 65%, #1e1f22 100%);
      color: #dbdee1;
      width: 460px;
      max-width: 92vw;
      border-radius: 16px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08);
      overflow-x: hidden;
      overflow-y: auto;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      animation: dshrink-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 10;
      padding: 22px 22px 18px 22px;
    }

    #dshrink-modal-root .dshrink-editor-card {
      background: #111214;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      overflow: hidden;
      display: none;
      flex-direction: column;
      margin-bottom: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    }

    #dshrink-modal-root .dshrink-player-wrap {
      position: relative;
      width: 100%;
      background: #000000;
    }

    #dshrink-modal-root .dshrink-video-screen {
      position: relative;
      width: 100%;
      height: 185px;
      background: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      overflow: hidden;
    }

    #dshrink-modal-root .dshrink-video-element {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
      pointer-events: none;
    }

    #dshrink-modal-root .dshrink-audio-screen {
      position: relative;
      width: 100%;
      height: 75px;
      background: radial-gradient(circle at center, #1e2029 0%, #111214 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      overflow: hidden;
    }

    #dshrink-modal-root .dshrink-audio-waves {
      display: flex;
      align-items: center;
      gap: 4px;
      height: 36px;
      opacity: 0.85;
    }

    #dshrink-modal-root .dshrink-audio-bar {
      width: 3px;
      background: #5865f2;
      border-radius: 2px;
      transition: height 0.15s ease;
    }

    #dshrink-modal-root .dshrink-player-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.28);
      transition: opacity 0.15s ease;
      pointer-events: none;
      opacity: 1;
    }

    #dshrink-modal-root .dshrink-player-overlay.playing {
      opacity: 0;
    }

    #dshrink-modal-root .dshrink-video-screen:hover .dshrink-player-overlay,
    #dshrink-modal-root .dshrink-audio-screen:hover .dshrink-player-overlay {
      opacity: 1;
    }

    #dshrink-modal-root .dshrink-play-bubble {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(30, 31, 34, 0.9);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
      transition: transform 0.15s ease, background-color 0.15s ease;
    }

    #dshrink-modal-root .dshrink-video-screen:hover .dshrink-play-bubble,
    #dshrink-modal-root .dshrink-audio-screen:hover .dshrink-play-bubble {
      transform: scale(1.08);
      background: #5865f2;
    }

    #dshrink-modal-root .dshrink-player-hud {
      position: absolute;
      bottom: 8px;
      left: 8px;
      right: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      pointer-events: none;
      z-index: 2;
    }

    #dshrink-modal-root .dshrink-hud-time {
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      color: #f2f3f5;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      font-variant-numeric: tabular-nums;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    #dshrink-modal-root .dshrink-hud-btn {
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #dbdee1;
      width: 26px;
      height: 26px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.12s ease;
    }

    #dshrink-modal-root .dshrink-hud-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }

    #dshrink-modal-root .dshrink-timeline-panel {
      background: #18191c;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding: 9px 11px 11px 11px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    #dshrink-modal-root .dshrink-timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
    }

    #dshrink-modal-root .dshrink-timeline-title {
      color: #b5bac1;
      font-weight: 700;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    #dshrink-modal-root .dshrink-timeline-range-badge {
      color: #5865f2;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    #dshrink-modal-root .dshrink-timeline-track {
      position: relative;
      height: 38px;
      background: #111214;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 7px;
      overflow: hidden;
      cursor: pointer;
      touch-action: none;
      user-select: none;
    }

    #dshrink-modal-root .dshrink-timeline-ticks {
      position: absolute;
      inset: 0;
      background-image: repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0px, rgba(255, 255, 255, 0.06) 1px, transparent 1px, transparent 10%);
      pointer-events: none;
    }

    #dshrink-modal-root .dshrink-timeline-dim-left {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 0%;
      background: rgba(0, 0, 0, 0.65);
      pointer-events: none;
    }

    #dshrink-modal-root .dshrink-timeline-dim-right {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      width: 0%;
      background: rgba(0, 0, 0, 0.65);
      pointer-events: none;
    }

    #dshrink-modal-root .dshrink-timeline-highlight {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0%;
      width: 100%;
      background: rgba(88, 101, 242, 0.22);
      border-top: 2px solid #5865f2;
      border-bottom: 2px solid #5865f2;
      pointer-events: none;
    }

    #dshrink-modal-root .dshrink-timeline-handle {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 14px;
      background: #5865f2;
      cursor: ew-resize;
      display: flex;
      align-items: center;
      justify-content: center;
      touch-action: none;
      z-index: 10;
      box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
      transition: background-color 0.12s ease;
    }

    #dshrink-modal-root .dshrink-timeline-handle:hover,
    #dshrink-modal-root .dshrink-timeline-handle.dragging {
      background: #7983f5;
      box-shadow: 0 0 10px rgba(88, 101, 242, 0.8);
    }

    #dshrink-modal-root .dshrink-timeline-handle::after {
      content: "";
      width: 2px;
      height: 14px;
      background: rgba(255, 255, 255, 0.85);
      border-radius: 1px;
    }

    #dshrink-modal-root .dshrink-timeline-handle-start {
      border-radius: 6px 0 0 6px;
      left: 0%;
    }

    #dshrink-modal-root .dshrink-timeline-handle-end {
      border-radius: 0 6px 6px 0;
      left: calc(100% - 14px);
    }

    #dshrink-modal-root .dshrink-timeline-playhead {
      position: absolute;
      top: -2px;
      bottom: -2px;
      left: 0%;
      width: 2px;
      background: #ffffff;
      pointer-events: none;
      z-index: 12;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.8);
    }

    #dshrink-modal-root .dshrink-timeline-playhead::before {
      content: "";
      position: absolute;
      top: 0;
      left: -4px;
      width: 10px;
      height: 10px;
      background: #ffffff;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
    }

    #dshrink-modal-root .dshrink-timeline-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }

    #dshrink-modal-root .dshrink-time-chips {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      color: #949ba4;
      font-variant-numeric: tabular-nums;
    }

    #dshrink-modal-root .dshrink-time-chip {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2px 5px;
      border-radius: 4px;
      color: #dbdee1;
    }

    #dshrink-modal-root .dshrink-time-chip strong {
      color: #ffffff;
    }

    #dshrink-modal-root .dshrink-clip-preset-bar {
      flex-shrink: 0;
    }

    #dshrink-modal-root .dshrink-split-info {
      background: rgba(88, 101, 242, 0.12);
      border: 1px solid rgba(88, 101, 242, 0.35);
      border-radius: 8px;
      padding: 9px 12px;
      font-size: 11.5px;
      color: #dbdee1;
      display: none;
      align-items: flex-start;
      gap: 9px;
      line-height: 1.45;
      margin-top: 6px;
    }

    #dshrink-modal-root .dshrink-split-icon {
      font-size: 13px;
      line-height: 1.2;
      flex-shrink: 0;
    }

    #dshrink-modal-root .dshrink-split-text {
      flex: 1;
      min-width: 0;
    }

    #dshrink-modal-root .dshrink-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(0, 0, 0, 0.38);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #949ba4;
      cursor: pointer;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 20;
    }

    #dshrink-modal-root .dshrink-close-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.2);
      transform: scale(1.05);
    }

    #dshrink-modal-root .dshrink-close-btn:active {
      transform: scale(0.95);
    }

    #dshrink-modal-root .dshrink-close-btn svg {
      width: 14px;
      height: 14px;
      fill: currentColor;
      display: block;
    }

    #dshrink-modal-root .dshrink-hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 12px;
    }

    #dshrink-modal-root .dshrink-hero-logo-box {
      position: relative;
      width: 44px;
      height: 44px;
      margin: 2px auto 8px auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #dshrink-modal-root .dshrink-hero-logo {
      position: relative;
      width: 44px;
      height: 44px;
      object-fit: contain;
      filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45));
    }

    #dshrink-modal-root .dshrink-badge {
      display: inline-block;
      background: #ffffff;
      color: #111214;
      font-family: var(--font-display, "gg sans", "ABC Ginto Normal", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif) !important;
      font-size: 10px;
      font-weight: 700;
      padding: 2.5px 10px;
      border-radius: 999px;
      letter-spacing: 0.6px;
      text-transform: uppercase;
      margin-bottom: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    }

    #dshrink-modal-root .dshrink-title {
      font-family: var(--font-display, "gg sans", "ABC Ginto Normal", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif) !important;
      font-size: 20px;
      font-weight: 800;
      line-height: 24px;
      color: #ffffff;
      margin-bottom: 4px;
      letter-spacing: -0.015em;
    }

    #dshrink-modal-root .dshrink-subtitle {
      font-size: 13px;
      line-height: 17px;
      color: #b5bac1;
      max-width: 390px;
    }

    #dshrink-modal-root .dshrink-file-card {
      background: rgba(17, 18, 20, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 10px;
      padding: 9px 11px;
      display: flex;
      align-items: center;
      gap: 11px;
      margin-bottom: 12px;
    }

    #dshrink-modal-root .dshrink-thumb-box {
      width: 46px;
      height: 46px;
      border-radius: 7px;
      background: #111214;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
    }

    #dshrink-modal-root .dshrink-thumb-cover {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #dshrink-modal-root .dshrink-thumb-cover canvas {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    #dshrink-modal-root .dshrink-file-icon {
      width: 24px;
      height: 24px;
      display: block;
    }

    #dshrink-modal-root .dshrink-file-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      flex: 1;
    }

    #dshrink-modal-root .dshrink-filename-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #f2f3f5;
      font-size: 13px;
      font-weight: 600;
      padding: 3px 7px;
      outline: none;
      transition: border-color 0.15s ease, background-color 0.15s ease;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    #dshrink-modal-root .dshrink-filename-input:focus {
      border-color: #5865f2;
      background: rgba(0, 0, 0, 0.55);
    }

    #dshrink-modal-root .dshrink-filename-input:disabled {
      background: transparent;
      border-color: transparent;
      color: #949ba4;
      padding-left: 0;
    }

    #dshrink-modal-root .dshrink-file-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      color: #949ba4;
      white-space: nowrap;
    }

    #dshrink-modal-root .dshrink-meta-dot {
      color: #4e5058;
    }

    #dshrink-modal-root .dshrink-size-val {
      color: #dbdee1;
      font-weight: 600;
    }

    #dshrink-modal-root .dshrink-overlimit-tag {
      color: #f0b232;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }

    #dshrink-modal-root .dshrink-options-area {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 14px;
    }

    #dshrink-modal-root .dshrink-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    #dshrink-modal-root .dshrink-label {
      font-family: var(--font-display, "gg sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif) !important;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #b5bac1;
    }

    #dshrink-modal-root .dshrink-segment-group {
      position: relative;
      display: flex;
      background: #111214;
      border-radius: 8px;
      padding: 3px;
      gap: 3px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      user-select: none;
    }

    #dshrink-modal-root .dshrink-segment-glider {
      position: absolute;
      top: 3px;
      bottom: 3px;
      left: 3px;
      background: #35373c;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), width 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      z-index: 1;
    }

    #dshrink-modal-root .dshrink-segment-btn {
      position: relative;
      flex: 1;
      background: transparent;
      border: none;
      color: #949ba4;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 4px;
      border-radius: 6px;
      cursor: pointer;
      transition: color 0.15s ease;
      z-index: 2;
      text-align: center;
      white-space: nowrap;
    }

    #dshrink-modal-root .dshrink-segment-btn:hover {
      color: #dbdee1;
    }

    #dshrink-modal-root .dshrink-segment-btn.active {
      color: #ffffff;
      font-weight: 700;
    }

    #dshrink-modal-root .dshrink-toggles-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 3px 2px 0 2px;
    }

    #dshrink-modal-root .dshrink-check-item {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      cursor: pointer;
      user-select: none;
      font-size: 12px;
      color: #949ba4;
      transition: color 0.15s ease;
    }

    #dshrink-modal-root .dshrink-check-item:hover {
      color: #dbdee1;
    }

    #dshrink-modal-root .dshrink-checkbox-hidden {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    #dshrink-modal-root .dshrink-custom-check {
      width: 15px;
      height: 15px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    }

    #dshrink-modal-root .dshrink-checkbox-hidden:checked + .dshrink-custom-check {
      background: #5865f2;
      border-color: #5865f2;
    }

    #dshrink-modal-root .dshrink-checkbox-hidden:checked + .dshrink-custom-check::after {
      content: "";
      display: block;
      width: 3.5px;
      height: 7px;
      border: solid #ffffff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg) translate(-0.5px, -0.5px);
    }

    #dshrink-modal-root .dshrink-progress-card {
      background: rgba(17, 18, 20, 0.85);
      border: 1px solid rgba(88, 101, 242, 0.3);
      border-radius: 10px;
      padding: 14px;
      display: none;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }

    #dshrink-modal-root .dshrink-progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 600;
    }

    #dshrink-modal-root .dshrink-progress-status {
      color: #f2f3f5;
      font-weight: 600;
    }

    #dshrink-modal-root .dshrink-progress-pct {
      color: #5865f2;
      font-weight: 700;
      font-size: 13.5px;
    }

    #dshrink-modal-root .dshrink-progress-track {
      width: 100%;
      height: 6px;
      background: #1e1f22;
      border-radius: 3px;
      overflow: hidden;
    }

    #dshrink-modal-root .dshrink-progress-bar {
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #5865f2, #7983f5);
      border-radius: 3px;
      box-shadow: 0 0 10px rgba(88, 101, 242, 0.55);
      transition: width 0.15s ease;
    }

    #dshrink-modal-root .dshrink-progress-subtext {
      font-size: 12px;
      color: #949ba4;
    }

    #dshrink-modal-root .dshrink-footer {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    #dshrink-modal-root .dshrink-tip-row {
      margin-top: 10px;
      text-align: center;
    }

    #dshrink-modal-root .dshrink-tip-link {
      font-size: 11.5px;
      color: #949ba4;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: color 0.15s ease;
    }

    #dshrink-modal-root .dshrink-tip-link:hover {
      color: #ffdd00;
      text-decoration: underline;
    }

    #dshrink-modal-root .dshrink-btn-cancel {
      flex: 1;
      width: 50%;
      background: #35373c;
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.01em;
      border: none;
      border-radius: 8px;
      height: 44px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.15s ease;
      user-select: none;
    }

    #dshrink-modal-root .dshrink-btn-cancel:hover {
      background: #404249;
    }

    #dshrink-modal-root .dshrink-btn-primary {
      flex: 1;
      width: 50%;
      background: #ffffff;
      color: #060607;
      font-family: var(--font-display, "gg sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif) !important;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.01em;
      border: none;
      border-radius: 8px;
      height: 44px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 0 18px rgba(104, 117, 245, 0.45), 0 0 32px rgba(88, 101, 242, 0.35);
      transition: all 0.16s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
    }

    #dshrink-modal-root .dshrink-btn-primary:hover {
      background: #f2f3f5;
      box-shadow: 0 0 24px rgba(104, 117, 245, 0.65), 0 0 42px rgba(88, 101, 242, 0.5);
      transform: translateY(-1px);
    }

    #dshrink-modal-root .dshrink-btn-primary:active {
      transform: translateY(0);
    }

    #dshrink-modal-root .dshrink-btn-primary:disabled {
      background: #2b2d31 !important;
      color: #80848e !important;
      box-shadow: none !important;
      cursor: not-allowed;
      transform: none !important;
    }

    #dshrink-modal-root .dshrink-btn-icon {
      width: 17px;
      height: 17px;
      flex-shrink: 0;
      fill: currentColor;
      display: block;
    }

    @keyframes dshrink-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes dshrink-scale {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `;

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function ensureStylesInjected() {
    if (!document.getElementById(STYLE_ID)) {
      const styleEl = document.createElement("style");
      styleEl.id = STYLE_ID;
      styleEl.textContent = MODAL_CSS;
      document.head.appendChild(styleEl);
    }
  }

  function getGliderTransform(idx) {
    return `translateX(calc(${idx * 100}% + ${idx * 3}px))`;
  }

  function renderSegments(items, activeVal) {
    const count = items.length;
    let activeIdx = items.findIndex(
      ({ val }) => Number(val) === Number(activeVal) || String(val) === String(activeVal)
    );
    if (activeIdx < 0) activeIdx = 0;

    const gliderStyle = `width: calc((100% - 6px - ${(count - 1) * 3}px) / ${count}); transform: ${getGliderTransform(activeIdx)};`;
    const buttonsHtml = items
      .map(({ val, label, id }, idx) => {
        const isActive = idx === activeIdx;
        return `<button type="button" class="dshrink-segment-btn${isActive ? " active" : ""}" data-val="${val}"${id ? ` id="${id}"` : ""}>${label}</button>`;
      })
      .join("");

    return `<div class="dshrink-segment-glider" style="${gliderStyle}"></div>${buttonsHtml}`;
  }

  function bindSegments(container, onSelect) {
    if (!container) return;
    const buttons = Array.from(container.querySelectorAll(".dshrink-segment-btn"));
    const glider = container.querySelector(".dshrink-segment-glider");
    buttons.forEach((btn, idx) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        if (glider) {
          glider.style.transform = getGliderTransform(idx);
        }
        onSelect(btn.getAttribute("data-val"));
      });
    });
  }

  function openModal(file, callbacks, defaults = {}, queueInfo = null) {
    const Compressor = window.ShrinkCord.Compressor;
    const { PRESETS } = Compressor;
    const isAudio = Compressor.isAudioFile(file);
    const resolved = Compressor.resolveSettings(defaults);

    let selectedSize = resolved.targetMB || 19.0;
    let selectedRes = isAudio ? resolved.audioQuality : resolved.videoQuality;
    let selectedFormat = resolved.format || "mp4";
    let selectedFps = resolved.fps || "30";
    let selectedClip = "full";
    let selectedMode = "compress";
    let trimStart = 0;
    let trimEnd = 0;
    let isAborted = false;
    let isEncoding = false;
    let isCompleted = false;
    let mediaDuration = 0;
    const safeFileName = escapeHtml(file.name || (isAudio ? "audio" : "video"));

    let badgeText = "AUTO-SHRINK";
    if (queueInfo && queueInfo.total > 1) {
      badgeText = `QUEUE (${queueInfo.index} of ${queueInfo.total})`;
    } else if (isAudio) {
      badgeText = "AUDIO AUTO-SHRINK";
    }

    const subtitleText = "The max file size is 20MB. Compress locally to send directly in chat.";

    ensureStylesInjected();

    const existing = document.getElementById("dshrink-modal-root");
    if (existing) existing.remove();

    const root = document.createElement("div");
    root.id = "dshrink-modal-root";

    root.innerHTML = `
      <div class="dshrink-backdrop" id="dshrink-backdrop"></div>
      <div class="dshrink-modal" role="dialog" aria-modal="true">
        <button class="dshrink-close-btn" id="dshrink-close-x" aria-label="Close" title="Close">
          ${ICONS.close}
        </button>

        <div class="dshrink-hero">
          <div class="dshrink-hero-logo-box">
            <img class="dshrink-hero-logo" src="${LOGO_URL}" alt="ShrinkCord Logo" />
          </div>
          <span class="dshrink-badge">${badgeText}</span>
          <h2 class="dshrink-title">Uh oh, this file exceeds the size limit.</h2>
          <p class="dshrink-subtitle">${subtitleText}</p>
        </div>

        <div class="dshrink-file-card">
          <div class="dshrink-thumb-box" id="dshrink-thumb-box">
            <div class="dshrink-thumb-cover" id="dshrink-thumb-cover">
              ${isAudio ? ICONS.audio : ICONS.video}
            </div>
          </div>
          <div class="dshrink-file-details">
            <input type="text" class="dshrink-filename-input" id="dshrink-filename-input" value="${safeFileName}" placeholder="Filename" spellcheck="false" title="Click to rename" />
            <div class="dshrink-file-meta">
              <span class="dshrink-meta-item">
                ${ICONS.clock}
                <span id="dshrink-duration-val">--:--</span>
              </span>
              <span class="dshrink-meta-dot">&bull;</span>
              <span class="dshrink-meta-item">
                ${ICONS.file}
                <strong class="dshrink-size-val">${Compressor.formatBytes(file.size)}</strong>
              </span>
              <span class="dshrink-meta-dot">&bull;</span>
              <span class="dshrink-overlimit-tag">
                ${ICONS.warn}
                <span>Over 20MB</span>
              </span>
            </div>
          </div>
        </div>

        <div class="dshrink-editor-card" id="dshrink-editor-card">
          <div class="dshrink-player-wrap" id="dshrink-player-wrap">
            ${isAudio ? `
              <div class="dshrink-audio-screen" id="dshrink-media-screen" title="Click to play/pause audio">
                <div class="dshrink-audio-waves" id="dshrink-audio-waves">
                  <span class="dshrink-audio-bar" style="height: 14px;"></span>
                  <span class="dshrink-audio-bar" style="height: 24px;"></span>
                  <span class="dshrink-audio-bar" style="height: 18px;"></span>
                  <span class="dshrink-audio-bar" style="height: 32px;"></span>
                  <span class="dshrink-audio-bar" style="height: 20px;"></span>
                  <span class="dshrink-audio-bar" style="height: 16px;"></span>
                  <span class="dshrink-audio-bar" style="height: 28px;"></span>
                  <span class="dshrink-audio-bar" style="height: 22px;"></span>
                  <span class="dshrink-audio-bar" style="height: 30px;"></span>
                  <span class="dshrink-audio-bar" style="height: 14px;"></span>
                  <span class="dshrink-audio-bar" style="height: 26px;"></span>
                  <span class="dshrink-audio-bar" style="height: 18px;"></span>
                </div>
                <div class="dshrink-player-overlay" id="dshrink-player-overlay">
                  <div class="dshrink-play-bubble" id="dshrink-play-bubble">${ICONS.play}</div>
                </div>
                <div class="dshrink-player-hud">
                  <span class="dshrink-hud-time" id="dshrink-hud-time">0:00 / 0:00</span>
                  <button type="button" class="dshrink-hud-btn" id="dshrink-mute-btn" title="Toggle audio sound">${ICONS.volume}</button>
                </div>
              </div>
            ` : `
              <div class="dshrink-video-screen" id="dshrink-media-screen" title="Click to play/pause video">
                <div class="dshrink-player-overlay" id="dshrink-player-overlay">
                  <div class="dshrink-play-bubble" id="dshrink-play-bubble">${ICONS.play}</div>
                </div>
                <div class="dshrink-player-hud">
                  <span class="dshrink-hud-time" id="dshrink-hud-time">0:00 / 0:00</span>
                  <button type="button" class="dshrink-hud-btn" id="dshrink-mute-btn" title="Toggle audio sound">${ICONS.mute}</button>
                </div>
              </div>
            `}
          </div>

          <div class="dshrink-timeline-panel" id="dshrink-timeline-panel">
            <div class="dshrink-timeline-header">
              <span class="dshrink-timeline-title">
                ${ICONS.scissors}
                <span>Clip Trimmer</span>
              </span>
              <span class="dshrink-timeline-range-badge" id="dshrink-range-badge">0:00 - 0:00 (0s)</span>
            </div>

            <div class="dshrink-timeline-track" id="dshrink-timeline-track" title="Click anywhere to jump playhead">
              <div class="dshrink-timeline-ticks"></div>
              <div class="dshrink-timeline-dim-left" id="dshrink-dim-left"></div>
              <div class="dshrink-timeline-highlight" id="dshrink-highlight"></div>
              <div class="dshrink-timeline-dim-right" id="dshrink-dim-right"></div>
              <div class="dshrink-timeline-handle dshrink-timeline-handle-start" id="dshrink-handle-start" title="Drag to trim start"></div>
              <div class="dshrink-timeline-handle dshrink-timeline-handle-end" id="dshrink-handle-end" title="Drag to trim end"></div>
              <div class="dshrink-timeline-playhead" id="dshrink-playhead"></div>
            </div>

            <div class="dshrink-timeline-footer">
              <div class="dshrink-time-chips">
                <span class="dshrink-time-chip">Start: <strong id="dshrink-chip-start">0:00</strong></span>
                <span class="dshrink-time-chip">End: <strong id="dshrink-chip-end">0:00</strong></span>
                <span class="dshrink-time-chip">Length: <strong id="dshrink-chip-dur">0s</strong></span>
              </div>
              <div class="dshrink-segment-group dshrink-clip-preset-bar" id="dshrink-clip-segments">
                ${renderSegments(PRESETS.CLIPS, "full")}
              </div>
            </div>
          </div>
        </div>

        <div class="dshrink-options-area" id="dshrink-options-area">
          <div class="dshrink-group">
            <label class="dshrink-label">Action Mode</label>
            <div class="dshrink-segment-group" id="dshrink-mode-segments">
              ${renderSegments(PRESETS.MODES, selectedMode)}
            </div>
            <div class="dshrink-split-info" id="dshrink-split-info">
              <span class="dshrink-split-icon">✂️</span>
              <span class="dshrink-split-text" id="dshrink-split-text"></span>
            </div>
          </div>
          ${!isAudio ? `
            <div class="dshrink-group">
              <label class="dshrink-label">Output Format</label>
              <div class="dshrink-segment-group" id="dshrink-format-segments">
                ${renderSegments(PRESETS.FORMATS, selectedFormat)}
              </div>
            </div>

            <div class="dshrink-group">
              <label class="dshrink-label">Framerate</label>
              <div class="dshrink-segment-group" id="dshrink-fps-segments">
                ${renderSegments(PRESETS.FPS, selectedFps)}
              </div>
            </div>
          ` : ""}

          <div class="dshrink-group">
            <label class="dshrink-label">Target File Size</label>
            <div class="dshrink-segment-group" id="dshrink-size-segments">
              ${renderSegments(PRESETS.SIZES, selectedSize)}
            </div>
          </div>

          <div class="dshrink-group">
            <label class="dshrink-label">${isAudio ? "Audio Quality" : "Video Quality"}</label>
            <div class="dshrink-segment-group" id="dshrink-res-segments">
              ${renderSegments(isAudio ? PRESETS.AUDIO_QUALITIES : PRESETS.VIDEO_QUALITIES, selectedRes)}
            </div>
          </div>

          <div class="dshrink-toggles-row">
            <label class="dshrink-check-item" title="Wrap media in Discord spoiler blur (SPOILER_)">
              <input type="checkbox" id="dshrink-spoiler-check" class="dshrink-checkbox-hidden" />
              <span class="dshrink-custom-check"></span>
              <span>Mark as Spoiler</span>
            </label>
            ${!isAudio ? `
              <label class="dshrink-check-item" title="Strip audio completely for silent clips & crisper video quality">
                <input type="checkbox" id="dshrink-mute-check" class="dshrink-checkbox-hidden" />
                <span class="dshrink-custom-check"></span>
                <span>Mute Audio (GIF)</span>
              </label>
            ` : ""}
            <label class="dshrink-check-item" title="Boost quiet mic and game volume by 2x (+6dB)">
              <input type="checkbox" id="dshrink-boost-check" class="dshrink-checkbox-hidden" />
              <span class="dshrink-custom-check"></span>
              <span>Boost Audio (2x)</span>
            </label>
          </div>
        </div>
              <span>Boost Audio (2x)</span>
            </label>
          </div>
        </div>

        <div class="dshrink-progress-card" id="dshrink-progress-card">
          <div class="dshrink-progress-header">
            <span class="dshrink-progress-status" id="dshrink-status-text">Encoding media...</span>
            <span class="dshrink-progress-pct" id="dshrink-percentage">0%</span>
          </div>
          <div class="dshrink-progress-track">
            <div class="dshrink-progress-bar" id="dshrink-progress-bar"></div>
          </div>
          <span class="dshrink-progress-subtext" id="dshrink-progress-subtext">Optimizing media stream...</span>
        </div>

        <div class="dshrink-footer">
          <button class="dshrink-btn-cancel" id="dshrink-cancel-btn">Cancel</button>
          <button class="dshrink-btn-primary" id="dshrink-start-btn">
            ${ICONS.zap}
            <span>Compress</span>
          </button>
        </div>

        <div class="dshrink-tip-row">
          <a href="https://www.buymeacoffee.com/isaac4096" target="_blank" rel="noopener noreferrer" class="dshrink-tip-link">
            ☕ Buy me a coffee
          </a>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    const closeBtn = root.querySelector("#dshrink-close-x");
    const cancelBtn = root.querySelector("#dshrink-cancel-btn");
    const backdrop = root.querySelector("#dshrink-backdrop");
    const startBtn = root.querySelector("#dshrink-start-btn");
    const thumbBox = root.querySelector("#dshrink-thumb-box");
    const durationVal = root.querySelector("#dshrink-duration-val");
    const optionsArea = root.querySelector("#dshrink-options-area");
    const progressCard = root.querySelector("#dshrink-progress-card");
    const statusText = root.querySelector("#dshrink-status-text");
    const percentageText = root.querySelector("#dshrink-percentage");
    const progressBar = root.querySelector("#dshrink-progress-bar");
    const subtextEl = root.querySelector("#dshrink-progress-subtext");
    const filenameInput = root.querySelector("#dshrink-filename-input");
    const spoilerCheck = root.querySelector("#dshrink-spoiler-check");
    const muteCheck = root.querySelector("#dshrink-mute-check");
    const boostCheck = root.querySelector("#dshrink-boost-check");

    const editorCard = root.querySelector("#dshrink-editor-card");
    const mediaScreen = root.querySelector("#dshrink-media-screen");
    const playerOverlay = root.querySelector("#dshrink-player-overlay");
    const playBubble = root.querySelector("#dshrink-play-bubble");
    const hudTime = root.querySelector("#dshrink-hud-time");
    const muteBtn = root.querySelector("#dshrink-mute-btn");
    const timelineTrack = root.querySelector("#dshrink-timeline-track");
    const highlight = root.querySelector("#dshrink-highlight");
    const dimLeft = root.querySelector("#dshrink-dim-left");
    const dimRight = root.querySelector("#dshrink-dim-right");
    const handleStart = root.querySelector("#dshrink-handle-start");
    const handleEnd = root.querySelector("#dshrink-handle-end");
    const playhead = root.querySelector("#dshrink-playhead");
    const rangeBadge = root.querySelector("#dshrink-range-badge");
    const chipStart = root.querySelector("#dshrink-chip-start");
    const chipEnd = root.querySelector("#dshrink-chip-end");
    const chipDur = root.querySelector("#dshrink-chip-dur");
    const audioWaves = root.querySelector("#dshrink-audio-waves");

    const metaMedia = document.createElement(isAudio ? "audio" : "video");
    metaMedia.preload = "metadata";
    metaMedia.playsInline = true;
    metaMedia.muted = !isAudio;
    const metaUrl = URL.createObjectURL(file);
    metaMedia.src = metaUrl;

    if (!isAudio && mediaScreen) {
      metaMedia.className = "dshrink-video-element";
      mediaScreen.insertBefore(metaMedia, mediaScreen.firstChild);
    }

    let isDragging = null;
    let waveAnimId = null;

    function updateTimelineUI() {
      if (!Number.isFinite(mediaDuration) || mediaDuration <= 0) return;
      const startPct = Math.max(0, Math.min(100, (trimStart / mediaDuration) * 100));
      const endPct = Math.max(0, Math.min(100, (trimEnd / mediaDuration) * 100));
      const currTime = Math.max(0, Math.min(mediaDuration, metaMedia.currentTime || 0));
      const playPct = Math.max(0, Math.min(100, (currTime / mediaDuration) * 100));
      const dur = Math.max(0.25, trimEnd - trimStart);

      if (handleStart) handleStart.style.left = `${startPct}%`;
      if (handleEnd) handleEnd.style.left = `calc(${endPct}% - 14px)`;
      if (highlight) {
        highlight.style.left = `${startPct}%`;
        highlight.style.width = `${Math.max(0, endPct - startPct)}%`;
      }
      if (dimLeft) dimLeft.style.width = `${startPct}%`;
      if (dimRight) dimRight.style.width = `${Math.max(0, 100 - endPct)}%`;
      if (playhead) playhead.style.left = `${playPct}%`;

      if (rangeBadge) {
        rangeBadge.textContent = `${Compressor.formatDuration(trimStart)} - ${Compressor.formatDuration(trimEnd)} (${Compressor.formatDuration(dur)})`;
      }
      if (chipStart) chipStart.textContent = Compressor.formatDuration(trimStart);
      if (chipEnd) chipEnd.textContent = Compressor.formatDuration(trimEnd);
      if (chipDur) chipDur.textContent = Compressor.formatDuration(dur);
      if (hudTime) {
        hudTime.textContent = `${Compressor.formatDuration(currTime)} / ${Compressor.formatDuration(mediaDuration)}`;
      }
    }

    function setTrimRange(newStart, newEnd, activePreset = "custom") {
      const maxDur = Number.isFinite(mediaDuration) && mediaDuration > 0 ? mediaDuration : 300;
      trimStart = Math.max(0, Math.min(newStart, maxDur - 0.25));
      trimEnd = Math.max(trimStart + 0.25, Math.min(newEnd, maxDur));
      selectedClip = activePreset;

      const clipBtns = root.querySelectorAll("#dshrink-clip-segments .dshrink-segment-btn");
      const glider = root.querySelector("#dshrink-clip-segments .dshrink-segment-glider");
      clipBtns.forEach((b, idx) => {
        const isMatch = b.getAttribute("data-val") === activePreset;
        b.classList.toggle("active", isMatch);
        if (isMatch && glider) {
          glider.style.transform = getGliderTransform(idx);
        }
      });

      updateTimelineUI();
    }

    function bindHandle(handleEl, type) {
      if (!handleEl) return;
      handleEl.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleEl.setPointerCapture(e.pointerId);
        isDragging = type;
        handleEl.classList.add("dragging");
        if (!metaMedia.paused) metaMedia.pause();
      });

      handleEl.addEventListener("pointermove", (e) => {
        if (isDragging !== type || !mediaDuration) return;
        const rect = timelineTrack.getBoundingClientRect();
        if (rect.width <= 0) return;
        const pointerX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const targetSec = (pointerX / rect.width) * mediaDuration;

        if (type === "start") {
          trimStart = Math.max(0, Math.min(targetSec, trimEnd - 0.25));
          metaMedia.currentTime = trimStart;
        } else {
          trimEnd = Math.max(trimStart + 0.25, Math.min(targetSec, mediaDuration));
          metaMedia.currentTime = trimEnd;
        }
        setTrimRange(trimStart, trimEnd, "custom");
      });

      const finishDrag = (e) => {
        if (isDragging === type) {
          try { handleEl.releasePointerCapture(e.pointerId); } catch (err) {}
          handleEl.classList.remove("dragging");
          isDragging = null;
        }
      };
      handleEl.addEventListener("pointerup", finishDrag);
      handleEl.addEventListener("pointercancel", finishDrag);
    }

    bindHandle(handleStart, "start");
    bindHandle(handleEnd, "end");

    if (timelineTrack) {
      timelineTrack.addEventListener("pointerdown", (e) => {
        if (e.target === handleStart || e.target === handleEnd || isDragging) return;
        const rect = timelineTrack.getBoundingClientRect();
        if (rect.width <= 0 || !mediaDuration) return;
        const pointerX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const targetSec = Math.max(0, Math.min((pointerX / rect.width) * mediaDuration, mediaDuration));
        metaMedia.currentTime = targetSec;
        updateTimelineUI();
      });
    }

    function togglePlay() {
      if (metaMedia.paused) {
        if (metaMedia.currentTime >= trimEnd || metaMedia.currentTime < trimStart) {
          metaMedia.currentTime = trimStart;
        }
        metaMedia.play().catch(() => {});
      } else {
        metaMedia.pause();
      }
    }

    if (mediaScreen) {
      mediaScreen.addEventListener("click", (e) => {
        if (e.target.closest("#dshrink-mute-btn")) return;
        togglePlay();
      });
    }

    function animateAudioWaves() {
      if (!audioWaves) return;
      const bars = audioWaves.children;
      for (let i = 0; i < bars.length; i++) {
        bars[i].style.height = `${Math.floor(8 + Math.random() * 26)}px`;
      }
      if (!metaMedia.paused) {
        waveAnimId = requestAnimationFrame(animateAudioWaves);
      }
    }

    metaMedia.addEventListener("play", () => {
      if (playerOverlay) playerOverlay.classList.add("playing");
      if (playBubble) playBubble.innerHTML = ICONS.pause;
      if (isAudio && audioWaves) animateAudioWaves();
    });

    metaMedia.addEventListener("pause", () => {
      if (playerOverlay) playerOverlay.classList.remove("playing");
      if (playBubble) playBubble.innerHTML = ICONS.play;
      if (waveAnimId) cancelAnimationFrame(waveAnimId);
    });

    metaMedia.addEventListener("timeupdate", () => {
      if (!isDragging) {
        if (!metaMedia.paused && metaMedia.currentTime >= trimEnd) {
          metaMedia.currentTime = trimStart;
        }
        updateTimelineUI();
      }
    });

    if (muteBtn) {
      muteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        metaMedia.muted = !metaMedia.muted;
        muteBtn.innerHTML = metaMedia.muted ? ICONS.mute : ICONS.volume;
      });
    }

    function close() {
      if (isAborted) return;
      isAborted = true;
      try { metaMedia.pause(); } catch (e) {}
      if (waveAnimId) cancelAnimationFrame(waveAnimId);
      try { URL.revokeObjectURL(metaUrl); } catch (e) {}
      root.remove();
      callbacks.onCancel();
    }

    closeBtn.addEventListener("click", close);
    cancelBtn.addEventListener("click", close);
    backdrop.addEventListener("click", close);

    const modeSegments = root.querySelector("#dshrink-mode-segments");
    const splitInfo = root.querySelector("#dshrink-split-info");
    const startBtnSpan = startBtn.querySelector("span");
    const resSegmentsGroup = root.querySelector("#dshrink-res-segments")?.closest(".dshrink-group");

    function updateModeUI() {
      if (selectedMode === "split") {
        const numParts = Compressor.calculateNumParts(file.size, selectedSize);
        if (splitInfo) {
          splitInfo.style.display = "flex";
          const splitText = splitInfo.querySelector("#dshrink-split-text");
          if (splitText) {
            splitText.innerHTML = `Will slice into <strong>${numParts} parts</strong> (under ${selectedSize}MB each) preserving full original resolution and audio fidelity.`;
          }
        }
        if (startBtnSpan) startBtnSpan.textContent = `Split into ${numParts} Parts`;
        if (resSegmentsGroup) resSegmentsGroup.style.display = "none";
      } else {
        if (splitInfo) splitInfo.style.display = "none";
        if (startBtnSpan) startBtnSpan.textContent = "Compress";
        if (resSegmentsGroup) resSegmentsGroup.style.display = "flex";
      }
    }

    if (modeSegments) {
      bindSegments(modeSegments, (val) => {
        selectedMode = val;
        updateModeUI();
      });
    }

    bindSegments(root.querySelector("#dshrink-size-segments"), (val) => {
      selectedSize = parseFloat(val);
      updateModeUI();
    });

    const formatSegments = root.querySelector("#dshrink-format-segments");
    if (formatSegments) {
      bindSegments(formatSegments, (val) => {
        selectedFormat = val;
      });
    }

    const fpsSegments = root.querySelector("#dshrink-fps-segments");
    if (fpsSegments) {
      bindSegments(fpsSegments, (val) => {
        selectedFps = val;
      });
    }

    bindSegments(root.querySelector("#dshrink-res-segments"), (val) => {
      selectedRes = val;
    });

    const clipSegments = root.querySelector("#dshrink-clip-segments");
    if (clipSegments) {
      bindSegments(clipSegments, (val) => {
        selectedClip = val;
        if (val === "full") {
          setTrimRange(0, mediaDuration, "full");
          metaMedia.currentTime = 0;
        } else if (val === "60") {
          setTrimRange(0, Math.min(60, mediaDuration), "60");
          metaMedia.currentTime = 0;
        } else if (val === "30") {
          setTrimRange(0, Math.min(30, mediaDuration), "30");
          metaMedia.currentTime = 0;
        }
      });
    }

    metaMedia.onloadedmetadata = () => {
      mediaDuration = metaMedia.duration;
      if (durationVal && Number.isFinite(mediaDuration) && mediaDuration > 0) {
        durationVal.textContent = Compressor.formatDuration(mediaDuration);

        if (editorCard) {
          editorCard.style.display = "flex";
          setTrimRange(0, mediaDuration, "full");
          metaMedia.currentTime = 0;
        }
      }

      if (!isAudio) {
        metaMedia.currentTime = Math.min(1.0, (mediaDuration || 2) / 2);
      }
    };

    if (!isAudio) {
      metaMedia.onseeked = () => {
        try {
          const cvs = document.createElement("canvas");
          cvs.width = 48;
          cvs.height = 48;
          const cx = cvs.getContext("2d");
          cx.drawImage(metaMedia, 0, 0, 48, 48);
          const thumbCover = root.querySelector("#dshrink-thumb-cover");
          if (thumbCover) {
            thumbCover.innerHTML = "";
            thumbCover.appendChild(cvs);
          }
        } catch (e) {}
      };
    }

    startBtn.addEventListener("click", () => {
      if (isEncoding || isCompleted) return;
      isEncoding = true;
      try { metaMedia.pause(); } catch (e) {}
      statusText.style.color = "";
      progressBar.style.width = "0%";
      percentageText.textContent = "0%";
      if (editorCard) editorCard.style.display = "none";
      optionsArea.style.display = "none";
      progressCard.style.display = "flex";
      startBtn.disabled = true;
      if (filenameInput) filenameInput.disabled = true;

      callbacks.onStart({
        mode: selectedMode,
        targetMB: selectedSize,
        quality: selectedRes,
        format: selectedFormat,
        fps: selectedFps,
        clip: selectedClip,
        startTime: trimStart,
        endTime: trimEnd,
        mediaDuration,
        hostElement: thumbBox,
        customName: filenameInput ? filenameInput.value : file.name,
        isSpoiler: Boolean(spoilerCheck && spoilerCheck.checked),
        muteAudio: Boolean(muteCheck && muteCheck.checked),
        audioBoost: Boolean(boostCheck && boostCheck.checked)
      });
    });

    return {
      updateProgress: (percent, status, subtext) => {
        if (isAborted) return;
        progressBar.style.width = `${percent}%`;
        percentageText.textContent = `${percent}%`;
        if (status) statusText.textContent = status;
        if (subtext) subtextEl.textContent = subtext;
      },
      complete: (output, format) => {
        if (isAborted) return;
        isCompleted = true;
        isEncoding = false;
        progressBar.style.width = "100%";
        percentageText.textContent = "100%";
        statusText.textContent = "Done! Processed successfully";
        const isMulti = Array.isArray(output);
        const count = isMulti ? output.length : 1;
        subtextEl.innerHTML = count > 1
          ? `Created <strong>${count} parts</strong> (${format.toUpperCase()}) &bull; Attaching all to Discord...`
          : `Size: ${Compressor.formatBytes((output.blob || output).size)} (${format.toUpperCase()}) &bull; Attaching...`;

        setTimeout(() => {
          if (!isAborted) {
            root.remove();
          }
        }, 500);
      },
      error: (err) => {
        if (isAborted) return;
        isEncoding = false;
        statusText.style.color = "#f23f43";
        statusText.textContent = "Error: " + (err && err.message ? err.message : "Compression failed");
        percentageText.textContent = "!";
        progressBar.style.width = "0%";
        subtextEl.textContent = "Adjust settings above and try again.";
        if (editorCard && mediaDuration > 0) editorCard.style.display = "flex";
        optionsArea.style.display = "flex";
        startBtn.disabled = false;
        if (filenameInput) filenameInput.disabled = false;
      },
      close
    };
  }

  window.ShrinkCord = window.ShrinkCord || {};
  window.ShrinkCord.UI = {
    openModal
  };
})();
