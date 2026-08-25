import React from 'react';
import { Play, Pause } from 'lucide-react';
import { useMusicContext } from '../context/MusicContext';
import { getThumbnail } from '../data/songs';

/**
 * Sticky bottom player bar — shown only on mobile (md:hidden).
 */
const StickyMobilePlayer = () => {
  const { currentSong, isPlaying, togglePlay, playNext, progress } = useMusicContext();

  if (!currentSong) return null;

  const thumb = getThumbnail(currentSong.youtubeId);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-slide-up">
      {/* Progress micro-bar */}
      <div className="w-full h-0.5 bg-surface-2">
        <div
          className="h-full bg-truck-red transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-surface/95 backdrop-blur-xl border-t border-border-muted px-4 py-3 flex items-center gap-3">
        {/* Thumb */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 shadow-truck">
          <img src={thumb} alt={currentSong.title} className="w-full h-full object-cover" />
        </div>

        {/* Song info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white line-clamp-1">{currentSong.title}</p>
          <p className="text-xs text-white/50 line-clamp-1">{currentSong.artist}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          {/* Play/Pause big touch target */}
          <button
            id="mobile-btn-play-pause"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-12 h-12 rounded-full bg-truck-red flex items-center justify-center shadow-glow-red active:scale-90 transition-transform"
          >
            {isPlaying
              ? <Pause className="w-5 h-5 text-white" fill="white" />
              : <Play  className="w-5 h-5 text-white" fill="white" style={{ marginLeft: '2px' }} />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyMobilePlayer;
