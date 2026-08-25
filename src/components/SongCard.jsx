import React, { useState } from 'react';
import { Play, Heart, Clock } from 'lucide-react';
import { useMusicContext } from '../context/MusicContext';
import { getThumbnail } from '../data/songs';
import { formatTime } from '../utils/formatTime';

const SongCard = ({ song }) => {
  const { currentSong, isPlaying, playSong, isFavorite, toggleFavorite } = useMusicContext();
  const [imgError, setImgError] = useState(false);

  const isActive = currentSong?.id === song.id;
  const fav = isFavorite(song.id);
  const thumb = getThumbnail(song.youtubeId);

  return (
    <article
      id={`song-${song.id}`}
      className={`
        group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer
        transition-all duration-200 select-none
        ${isActive
          ? 'bg-truck-red/20 border border-truck-red/40 shadow-card-hover'
          : 'glass-card hover:bg-white/8 hover:border-white/15 hover:shadow-card-hover border border-transparent'
        }
      `}
      onClick={() => playSong(song)}
      role="button"
      aria-label={`Play ${song.title} by ${song.artist}`}
    >
      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden">
        {!imgError ? (
          <img
            src={thumb}
            alt={song.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-surface-3 flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
        )}

        {/* Active indicator overlay */}
        {isActive && (
          <div className="absolute inset-0 bg-truck-red/30 flex items-center justify-center">
            {isPlaying ? (
              <div className="flex items-end gap-[2px] h-4">
                {[1,2,3,4].map(i => (
                  <span key={i} className="music-bar" style={{ height: `${6 + i * 3}px` }} />
                ))}
              </div>
            ) : (
              <Play className="w-5 h-5 text-white" fill="white" />
            )}
          </div>
        )}

        {/* Play overlay on hover (non-active) */}
        {!isActive && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Play className="w-5 h-5 text-white" fill="white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm line-clamp-1 ${isActive ? 'text-truck-red' : 'text-white group-hover:text-gold'} transition-colors`}>
          {song.title}
        </p>
        <p className="text-xs text-white/50 line-clamp-1 mt-0.5">{song.artist}</p>
      </div>

      {/* Right section: duration + favorite */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="flex items-center gap-1 text-[11px] text-white/40 font-mono">
          <Clock className="w-3 h-3" />
          {formatTime(song.duration)}
        </span>
        <button
          id={`btn-fav-${song.id}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(song); }}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          className={`transition-all duration-200 ${fav ? 'text-truck-red scale-110' : 'text-white/30 hover:text-truck-red'}`}
        >
          <Heart className="w-4 h-4" fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  );
};

export default SongCard;
