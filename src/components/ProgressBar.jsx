import React, { useCallback } from 'react';
import { useMusicContext } from '../context/MusicContext';
import { formatTime } from '../utils/formatTime';

const ProgressBar = () => {
  const { progress, currentTime, duration, seek } = useMusicContext();

  const handleChange = useCallback(
    (e) => seek(Number(e.target.value)),
    [seek]
  );

  // Build a CSS background so the filled portion appears in truck-red
  const fillStyle = {
    background: `linear-gradient(90deg, #D72638 ${progress}%, #272727 ${progress}%)`,
  };

  return (
    <div className="w-full space-y-1">
      <div className="relative flex items-center">
        <input
          id="progress-bar"
          type="range"
          min={0}
          max={100}
          step={0.1}
          value={progress}
          onChange={handleChange}
          aria-label="Song progress"
          className="w-full h-1 rounded-full cursor-pointer"
          style={fillStyle}
        />
      </div>
      <div className="flex justify-between text-[11px] text-white/40 font-mono select-none">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
