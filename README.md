# 🎵 Hostel Music

**हॉस्टल म्यूज़िक — Hostel Music**

> *Tune in, vibe out* 🎵

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-hostel--music.vercel.app-black?style=for-the-badge&logo=vercel)](https://hostel-music.vercel.app)

A modern, responsive Indian music player built with **React 19 + Vite + Tailwind CSS v3**.  
Streams Punjabi, Hindi, and 90s Bollywood classics via the YouTube IFrame API.

---

## ✨ Features

- 🎧 **Full Music Player** — Play/Pause, Previous, Next, Seek bar, Volume control
- 🔀 **Shuffle & Repeat** — Toggle shuffle and repeat modes
- 📂 **6 Song Categories** — Hostel Special, Hindi Songs, My Playlist, 90s Bollywood, Highway Special, Old Songs
- 🔍 **Search** — Filter songs in real-time by title or artist
- ❤️ **Favourites** — Heart any song; persisted in `localStorage`
- 🕓 **Recently Played** — Listening history tracked in `localStorage`
- ⏭️ **Auto-advance** — Automatically plays the next song when the current one ends
- 📱 **Mobile Sticky Player** — Bottom bar with large, touch-friendly controls
- ⚠️ **Error Handling** — Friendly message when a YouTube video is unavailable
- 🌙 **Dark Theme** — Charcoal + red + gold palette

---

## 🛠 Tech Stack

| Layer        | Technology                                    |
|--------------|-----------------------------------------------|
| Framework    | React 19 + Vite 8                             |
| Styling      | Tailwind CSS v3                               |
| Music Source | YouTube IFrame API via `react-youtube`        |
| Icons        | Lucide React                                  |
| Fonts        | Poppins + Noto Sans Devanagari (Google Fonts) |
| State        | React Context + `useReducer`                  |
| Storage      | `localStorage` (favourites, recently played)  |
| Linting      | OxLint                                        |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

---

## 📁 Project Structure

```
Hostel Music/
├── public/
│   ├── favicon.svg              # App favicon
│   └── icons.svg                # SVG icon sprites
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Sticky top header with branding
│   │   ├── HeroPlayer.jsx       # Main music player card
│   │   ├── PlayerControls.jsx   # Play/Pause/Prev/Next/Shuffle/Repeat
│   │   ├── ProgressBar.jsx      # Seek bar + timestamps
│   │   ├── VolumeControl.jsx    # Volume slider + mute
│   │   ├── CategoryTabs.jsx     # Horizontal category tab bar
│   │   ├── SearchBar.jsx        # Real-time search input
│   │   ├── SongCard.jsx         # Individual song card
│   │   ├── PlaylistSection.jsx  # Song grid layout
│   │   ├── StickyMobilePlayer.jsx # Mobile bottom bar
│   │   └── Footer.jsx           # Footer with links
│   ├── context/
│   │   └── MusicContext.jsx     # Global state (useReducer + Context API)
│   ├── data/
│   │   └── songs.js             # Curated songs with YouTube IDs & categories
│   ├── hooks/
│   │   └── useLocalStorage.js   # localStorage persistence hook
│   ├── utils/
│   │   └── formatTime.js        # seconds → mm:ss formatter
│   ├── App.jsx                  # Root component
│   ├── main.jsx                 # App entry point
│   ├── index.css                # Global styles + Tailwind base
│   └── App.css                  # Component-level styles
├── index.html                   # HTML shell + SEO meta tags
├── tailwind.config.js           # Tailwind design tokens
├── vite.config.js               # Vite build config
└── package.json
```

---

## 🎶 Song Categories

| Category        | Emoji | Description                        |
|-----------------|-------|------------------------------------|
| All Songs       | 🎵    | Full combined playlist              |
| Hostel Special  | 🏠    | Punjabi hostel anthems              |
| Hindi Songs     | 🎸    | Popular Hindi tracks                |
| My Playlist     | 📝    | Hand-picked personal favourites     |
| 90s Bollywood   | 📼    | Retro Bollywood classics            |
| Highway Special | 🛣️    | Long-drive road trip hits           |
| Old Songs       | 🎙️    | Timeless old-school gems            |

---

## 🌐 Deployment

### GitHub Pages

```bash
# 1. Build the project
npm run build

# 2. Install gh-pages (if not already)
npm install -D gh-pages

# 3. Add to package.json scripts:
#    "deploy": "gh-pages -d dist"
npm run deploy
```

### Other Platforms

| Platform | Live URL / Method |
|----------|-------------------|
| **Vercel** | 🌐 **[hostel-music.vercel.app](https://hostel-music.vercel.app)** |
| Netlify  | Drag & drop the `dist/` folder |

---

## 📝 Notes

- Music is streamed via the YouTube IFrame API — no music is downloaded or hosted illegally.
- All songs use real YouTube video IDs of publicly available content.
- Some videos may be unavailable in certain regions due to YouTube geo-restrictions; the error state handles this gracefully.

---

## 🇮🇳 Made with ❤️ for music lovers

*Hostel Special • Hindi Songs • My Playlist • 90s Bollywood • Highway Special • Old Songs*

© 2026 **Hostel Music** — Made with ❤️ for music lovers.

**KEORA** 🇮🇳
