import React from 'react';
import { Music2, Smartphone, Radio } from 'lucide-react';
import { useMusicContext } from '../context/MusicContext';

const Header = ({ onOpenRemoteModal }) => {
  const { remoteControl } = useMusicContext();
  const connectedCount = remoteControl?.connectedDevicesCount || 0;

  return (
    <header className="sticky top-0 z-50 w-full bg-charcoal/90 backdrop-blur-md border-b border-border-muted">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-truck-red flex items-center justify-center shadow-glow-red">
              <span className="text-white font-black text-sm md:text-base tracking-tight leading-none">RBC</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold animate-pulse-slow" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-hindi text-lg md:text-xl font-bold text-white leading-none tracking-wide">
              हॉस्टल म्यूज़िक
            </span>
            <span className="text-[10px] md:text-xs font-medium text-gold tracking-[0.15em] uppercase">
              Hostel Music
            </span>
          </div>
        </div>

        {/* Desktop nav + Remote Control Action */}
        <div className="flex items-center gap-3 md:gap-5">
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
            <a href="#player" className="hover:text-gold transition-colors">Player</a>
            <a href="#playlist" className="hover:text-gold transition-colors">Playlist</a>
            <a
              href="https://music.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-truck-red hover:text-highway-orange transition-colors"
            >
              <Music2 className="w-4 h-4" />
              YouTube Music
            </a>
          </nav>

          {/* Mobile Remote Trigger Button */}
          <button
            onClick={onOpenRemoteModal}
            className={`flex items-center gap-2 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-md active:scale-95 ${
              connectedCount > 0
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-gradient-to-r from-truck-red to-highway-orange hover:brightness-110 text-white shadow-glow-red'
            }`}
            title="Control playback from mobile phone"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile Remote</span>
            {connectedCount > 0 ? (
              <span className="flex items-center gap-1 bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                {connectedCount}
              </span>
            ) : (
              <span className="hidden sm:inline-block text-[10px] font-normal opacity-80 bg-black/20 px-1.5 py-0.5 rounded">
                Pair
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;
