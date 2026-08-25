import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { useMusicContext } from '../context/MusicContext';
import { getThumbnail } from '../data/songs';
import PlayerControls from './PlayerControls';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import { AlertCircle, SkipForward } from 'lucide-react';

const HeroPlayer = () => {
  const {
    currentSong,
    isPlaying,
    onPlayerReady,
    onPlayerStateChange,
    playNext,
    volume,
  } = useMusicContext();

  const [playerError, setPlayerError] = useState(false);
  const [imgError, setImgError]       = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(null);
  const skipTimer  = useRef(null);
  const countTimer = useRef(null);

  const thumb = currentSong ? getThumbnail(currentSong.youtubeId) : null;

  // Auto-skip: when error fires, count down 3 s then play next song
  const handleError = () => {
    setPlayerError(true);
    setSkipCountdown(3);

    // Countdown ticker
    let remaining = 3;
    countTimer.current = setInterval(() => {
      remaining -= 1;
      setSkipCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(countTimer.current);
      }
    }, 1000);

    // Auto-skip after 3 s
    skipTimer.current = setTimeout(() => {
      setPlayerError(false);
      setSkipCountdown(null);
      playNext();
    }, 3000);
  };

  // Clear timers on song change
  useEffect(() => {
    setPlayerError(false);
    setImgError(false);
    setSkipCountdown(null);
    clearTimeout(skipTimer.current);
    clearInterval(countTimer.current);
  }, [currentSong?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(skipTimer.current);
      clearInterval(countTimer.current);
    };
  }, []);

  const ytOpts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
    },
  };


  return (
    <section
      id="player"
      aria-label="Music Player"
      className="relative w-full max-w-lg mx-auto rounded-3xl overflow-hidden bg-player-gradient border border-white/10 shadow-truck"
    >
      {/* Decorative glow rings */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-truck-red/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-highway-orange/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 md:p-8 space-y-5">

        {/* Tagline */}
        <div className="text-center">
          <p className="font-hindi text-sm md:text-base text-gold/80 tracking-wide leading-relaxed">
            Room No - 211
          </p>
        </div>

        {/* Album Art */}
        <div className="relative mx-auto w-52 h-52 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-truck group">
          {thumb && !imgError ? (
            <img
              src={thumb}
              alt={currentSong?.title || 'Album art'}
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-surface-3 flex items-center justify-center">
              <span className="text-6xl">🎵</span>
            </div>
          )}

          {/* Playing shimmer overlay */}
          {isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-t from-truck-red/20 to-transparent pointer-events-none" />
          )}

          {/* Spinning vinyl effect */}
          {isPlaying && (
            <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full border-4 border-white/20 border-t-truck-red animate-spin opacity-70" />
          )}
        </div>

        {/* Song info */}
        <div className="text-center space-y-1">
          {currentSong ? (
            <>
              <h2 className="text-white font-bold text-xl md:text-2xl line-clamp-1 leading-tight">
                {currentSong.title}
              </h2>
              <p className="text-white/50 text-sm md:text-base line-clamp-1">
                {currentSong.artist}
              </p>
            </>
          ) : (
            <p className="text-white/40 text-sm">Select a song to play</p>
          )}
        </div>

        {/* Error state — auto-skip with countdown */}
        {playerError && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-truck-red/20 border border-truck-red/30 text-sm">
            <AlertCircle className="w-4 h-4 text-truck-red flex-shrink-0" />
            <span className="text-white/80 flex-1">
              Unavailable — skipping in{' '}
              <span className="text-truck-red font-bold">{skipCountdown}s</span>
            </span>
            <button
              id="btn-skip-now"
              onClick={() => {
                clearTimeout(skipTimer.current);
                clearInterval(countTimer.current);
                setPlayerError(false);
                setSkipCountdown(null);
                playNext();
              }}
              className="flex items-center gap-1 text-xs font-semibold text-gold hover:text-gold-light transition-colors whitespace-nowrap"
            >
              <SkipForward className="w-3.5 h-3.5" /> Skip now
            </button>
          </div>
        )}

        {/* Progress Bar */}
        <ProgressBar />

        {/* Controls */}
        <PlayerControls large />

        {/* Volume */}
        <div className="flex justify-center">
          <VolumeControl />
        </div>

        {/* Hidden YouTube Player */}
        {currentSong && (
          <div className="sr-only" aria-hidden="true">
            <YouTube
              key={currentSong.youtubeId}
              videoId={currentSong.youtubeId}
              opts={ytOpts}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
              onError={handleError}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroPlayer;
