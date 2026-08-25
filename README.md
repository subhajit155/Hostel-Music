# 🚛 Truck Driver Music

**ट्रक ड्राइवर — Truck Driver Music**

> *बुरी नज़र वाले तेरा मुँह काला* 🚛

A modern, responsive Indian highway music player built with React + Vite + Tailwind CSS. Streams Punjabi, Hindi, Bhojpuri, and 90s Bollywood music via the YouTube IFrame API.

---

## 🎵 Features

- **Full Music Player** — Play/Pause, Prev, Next, Seek bar, Volume control
- **Shuffle & Repeat** modes
- **6 Song Categories** — Punjabi Hits, Hindi Songs, Bhojpuri Songs, 90s Bollywood, Highway Special, Truck Driver Favorites
- **Search** — Filter songs by title or artist
- **Favorites** — Heart any song; persists in localStorage
- **Recently Played** — Tracks listening history in localStorage
- **Auto-advance** — Moves to the next song when the current one ends
- **Mobile sticky player** — Bottom bar with large touch-friendly controls
- **Error state** — Shows friendly message when a video is unavailable
- **Dark theme** — Charcoal + truck-red + gold palette

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Music Source | YouTube IFrame API via `react-youtube` |
| Icons | Lucide React |
| Fonts | Poppins + Noto Sans Devanagari (Google Fonts) |
| State | React Context + useReducer |
| Storage | localStorage (favorites, recently played) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install and Run

```bash
# 1. Navigate to the project folder
cd "Truck Bala"

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
```

The production bundle will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.jsx           # Sticky top header with branding
│   ├── HeroPlayer.jsx       # Main music player card
│   ├── PlayerControls.jsx   # Play/Pause/Prev/Next/Shuffle/Repeat
│   ├── ProgressBar.jsx      # Seek bar + timestamps
│   ├── VolumeControl.jsx    # Volume slider + mute
│   ├── CategoryTabs.jsx     # Horizontal category tab bar
│   ├── SearchBar.jsx        # Search input
│   ├── SongCard.jsx         # Individual song card
│   ├── PlaylistSection.jsx  # Song grid
│   ├── StickyMobilePlayer.jsx # Mobile bottom bar
│   └── Footer.jsx           # Footer with links
├── context/
│   └── MusicContext.jsx     # Global state (useReducer + Context)
├── data/
│   └── songs.js             # 30 curated songs with YouTube IDs
├── hooks/
│   └── useLocalStorage.js   # localStorage persistence hook
├── utils/
│   └── formatTime.js        # seconds → mm:ss formatter
├── App.jsx                  # Root component
├── main.jsx                 # Entry point
└── index.css                # Global styles + Tailwind
```

---

## 🌐 Deploying to GitHub Pages

```bash
# 1. Build the project
npm run build

# 2. Install gh-pages (if not already)
npm install -D gh-pages

# 3. Deploy (add to package.json scripts: "deploy": "gh-pages -d dist")
npm run deploy
```

Or deploy the `dist/` folder to **Vercel**, **Netlify**, or any static hosting:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop `dist/` folder

---

## 📝 Notes

- Music is streamed via YouTube IFrame API — no music is downloaded or hosted illegally.
- All songs use real YouTube video IDs of publicly available content.
- Some songs may be unavailable in certain regions due to YouTube's geo-restrictions; the error state handles this gracefully.

---

## 🇮🇳 Made for highway warriors

*Punjabi • Hindi • Bhojpuri • 90s Bollywood • Highway Songs*

**जय हिंद** 🇮🇳
