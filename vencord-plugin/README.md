# ⚡ ShrinkCord for Vencord (Desktop Discord)

> **Run ShrinkCord directly inside the Discord Desktop client via Vencord!**  
> *Compress oversized videos or auto-split them into parts locally without Discord Nitro.*

---

## 🚀 Features in Vencord
- **Client-Side Transcoding:** Runs in your local Discord client renderer — zero cloud servers, zero bot tokens.
- **Auto-Split Mode:** Option to automatically cut oversized videos into parts (e.g., Part 1, Part 2) to preserve **100% original visual quality**.
- **Compression Mode:** Automatically squeezes clips under 19MB (Free safe limit) or 48MB (Nitro Basic).
- **Universal MP4 & WebM Support:** Seamless cross-platform playback.
- **Configurable Settings:** Customize target size, default mode, framerate (30 / 60 FPS), and spoiler tags in Vencord Settings.

---

## 🛠️ Installation Instructions

### Option 1: Vencord UserPlugins (Recommended)
1. Clone or download this folder (`vencord-plugin/`).
2. Copy `index.ts` into your Vencord source directory under:
   ```bash
   src/userplugins/shrinkcord/index.ts
   ```
3. Build and patch your Discord client:
   ```bash
   pnpm build
   pnpm inject
   ```
4. Open Discord Settings ➔ Plugins ➔ Enable **ShrinkCord**!

---

## ⚙️ Configuration
In Discord Desktop, go to **User Settings ➔ Vencord ➔ Plugins ➔ ShrinkCord Settings**:
- **Target File Size:** 19 MB (Free), 48 MB (Nitro Basic), or 8 MB (Compact).
- **Default Action:** `Squeeze (Compress into 1 file)` or `Cut into Parts (Preserve 100% quality)`.
- **Output Video Format:** `MP4` or `WebM`.
- **Video Framerate:** `30 FPS` or `60 FPS`.
- **Spoiler by Default:** Toggle automatic `SPOILER_` wrapping.
