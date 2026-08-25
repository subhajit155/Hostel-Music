import React, { useState } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { useMusicContext } from '../context/MusicContext';

const VolumeControl = () => {
  const { volume, setVolume } = useMusicContext();
  const [prevVolume, setPrevVolume] = useState(80);

  const handleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume || 80);
    }
  };

  const Icon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  const fillStyle = {
    background: `linear-gradient(90deg, #D72638 ${volume}%, #272727 ${volume}%)`,
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-[160px]">
      <button
        id="btn-mute"
        onClick={handleMute}
        aria-label={volume === 0 ? 'Unmute' : 'Mute'}
        className="text-white/50 hover:text-white transition-colors flex-shrink-0"
      >
        <Icon className="w-4 h-4" />
      </button>
      <input
        id="volume-slider"
        type="range"
        min={0}
        max={100}
        step={1}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        aria-label="Volume"
        className="flex-1 h-1 rounded-full cursor-pointer"
        style={fillStyle}
      />
    </div>
  );
};

export default VolumeControl;
