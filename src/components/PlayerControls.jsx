import React from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1
} from 'lucide-react';
import { useMusicContext } from '../context/MusicContext';

const PlayerControls = ({ large = false }) => {
  const { isPlaying, shuffle, repeat, togglePlay, playNext, playPrev, dispatch } = useMusicContext();

  const btnSize = large ? 'w-7 h-7' : 'w-5 h-5';
  const playSize = large ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div className="flex items-center justify-center gap-3 md:gap-4">

      {/* Shuffle */}
      <button
        id="btn-shuffle"
        onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
        aria-label="Shuffle"
        className={`transition-all duration-200 rounded-full p-2 
          ${shuffle
            ? 'text-gold drop-shadow-[0_0_6px_rgba(255,179,0,0.6)]'
            : 'text-white/50 hover:text-white'
          }`}
      >
        <Shuffle className={btnSize} />
      </button>

      {/* Previous */}
      <button
        id="btn-prev"
        onClick={playPrev}
        aria-label="Previous"
        className="text-white/70 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10 active:scale-90"
      >
        <SkipBack className={btnSize} />
      </button>

      {/* Play / Pause — main button */}
      <button
        id="btn-play-pause"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className={`
          relative flex items-center justify-center rounded-full transition-all duration-200
          active:scale-90
          ${large
            ? 'w-16 h-16 md:w-20 md:h-20 bg-truck-red hover:bg-highway-orange shadow-glow-red hover:shadow-[0_0_30px_rgba(244,81,30,0.6)]'
            : 'w-12 h-12 bg-truck-red hover:bg-highway-orange shadow-glow-red'
          }
        `}
      >
        {isPlaying
          ? <Pause className={playSize} fill="white" stroke="white" />
          : <Play  className={playSize} fill="white" stroke="white" style={{ marginLeft: '2px' }} />
        }
        {/* Ripple ring when playing */}
        {isPlaying && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-truck-red" />
        )}
      </button>

      {/* Next */}
      <button
        id="btn-next"
        onClick={playNext}
        aria-label="Next"
        className="text-white/70 hover:text-white transition-colors rounded-full p-2 hover:bg-white/10 active:scale-90"
      >
        <SkipForward className={btnSize} />
      </button>

      {/* Repeat */}
      <button
        id="btn-repeat"
        onClick={() => dispatch({ type: 'TOGGLE_REPEAT' })}
        aria-label="Repeat"
        className={`transition-all duration-200 rounded-full p-2 
          ${repeat
            ? 'text-gold drop-shadow-[0_0_6px_rgba(255,179,0,0.6)]'
            : 'text-white/50 hover:text-white'
          }`}
      >
        {repeat ? <Repeat1 className={btnSize} /> : <Repeat className={btnSize} />}
      </button>
    </div>
  );
};

export default PlayerControls;
