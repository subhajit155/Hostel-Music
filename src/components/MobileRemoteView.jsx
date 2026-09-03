import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Smartphone,
  Laptop,
  Search,
  Music,
  Heart,
  RotateCcw,
  RotateCw,
  LogOut,
  Wifi,
  WifiOff,
  Radio,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SONGS, CATEGORIES, getThumbnail } from '../data/songs';
import { formatTime } from '../utils/formatTime';

const MobileRemoteView = ({
  remoteControl,
  onExitRemote,
}) => {
  const {
    roomPin,
    isConnected,
    connectionStatus,
    errorMessage,
    remoteState,
    connectToHost,
    sendCommand,
  } = remoteControl;

  const [activeTab, setActiveTab] = useState('remote'); // 'remote' | 'library'
  const [pinInput, setPinInput] = useState(roomPin || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [localVolume, setLocalVolume] = useState(80);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync local volume when host broadcasts volume
  useEffect(() => {
    if (remoteState && typeof remoteState.volume === 'number') {
      setLocalVolume(remoteState.volume);
    }
  }, [remoteState?.volume]);

  // Show a temporary toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleConnect = (e) => {
    e?.preventDefault();
    if (pinInput.trim().length >= 4) {
      connectToHost(pinInput.trim());
    }
  };

  const handleTogglePlay = () => {
    sendCommand({ type: 'CMD_TOGGLE_PLAY' });
  };

  const handleNext = () => {
    sendCommand({ type: 'CMD_NEXT' });
    showToast('Next Track ⏭️');
  };

  const handlePrev = () => {
    sendCommand({ type: 'CMD_PREV' });
    showToast('Previous Track ⏮️');
  };

  const handleSeek = (e) => {
    const val = Number(e.target.value);
    setSeekValue(val);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    sendCommand({ type: 'CMD_SEEK', percent: seekValue });
  };

  const handleSkipSeconds = (seconds) => {
    if (!remoteState) return;
    const dur = remoteState.duration || 1;
    const current = remoteState.currentTime || 0;
    const nextTime = Math.max(0, Math.min(dur, current + seconds));
    const percent = (nextTime / dur) * 100;
    sendCommand({ type: 'CMD_SEEK', percent });
    showToast(`${seconds > 0 ? '+10s' : '-10s'}`);
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    setLocalVolume(val);
    sendCommand({ type: 'CMD_SET_VOLUME', volume: val });
  };

  const handleToggleMute = () => {
    const nextVol = localVolume === 0 ? 80 : 0;
    setLocalVolume(nextVol);
    sendCommand({ type: 'CMD_SET_VOLUME', volume: nextVol });
    showToast(nextVol === 0 ? 'Muted 🔇' : 'Unmuted 🔊');
  };

  const handleToggleShuffle = () => {
    sendCommand({ type: 'CMD_TOGGLE_SHUFFLE' });
    showToast(!remoteState?.shuffle ? 'Shuffle On 🔀' : 'Shuffle Off ➡️');
  };

  const handleToggleRepeat = () => {
    sendCommand({ type: 'CMD_TOGGLE_REPEAT' });
    showToast(!remoteState?.repeat ? 'Repeat 1 Song 🔂' : 'Repeat Off ➡️');
  };

  const handleSelectSong = (song) => {
    sendCommand({ type: 'CMD_SELECT_SONG', songId: song.id });
    showToast(`Playing "${song.title}" 🎶`);
    setActiveTab('remote');
  };

  const handleToggleFavorite = (songId) => {
    sendCommand({ type: 'CMD_TOGGLE_FAVORITE', songId });
  };

  // Filtered song list for the library tab
  const filteredSongs = useMemo(() => {
    let list = selectedCategory === 'all'
      ? SONGS
      : SONGS.filter((s) => s.category === selectedCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  const currentSong = remoteState?.currentSong || SONGS[0];
  const isPlaying = remoteState?.isPlaying || false;
  const progress = isSeeking ? seekValue : (remoteState?.progress || 0);
  const currentTime = remoteState?.currentTime || 0;
  const duration = remoteState?.duration || currentSong.duration || 0;
  const shuffle = remoteState?.shuffle || false;
  const repeat = remoteState?.repeat || false;
  const favorites = remoteState?.favorites || [];

  // ── Connection Screen (if disconnected or pin not entered) ───────────────────
  if (!isConnected && connectionStatus !== 'connected') {
    return (
      <div className="min-h-dvh bg-charcoal flex flex-col justify-between p-6 text-white max-w-md mx-auto relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-truck-red/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-truck-red flex items-center justify-center shadow-glow-red">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-wide">Mobile Remote</span>
          </div>
          <button
            onClick={onExitRemote}
            className="text-xs text-white/50 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 border border-white/10"
          >
            Web Player
          </button>
        </div>

        {/* Center Card */}
        <div className="my-auto py-8 z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-gold shadow-glow-gold">
              <Laptop className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Connect to Laptop
            </h1>
            <p className="text-xs text-white/60 mt-1 max-w-xs mx-auto">
              Enter the 6-digit room code shown on your laptop screen to start controlling playback.
            </p>
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1.5 text-center">
                6-Digit Room Code
              </label>
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 482910"
                className="w-full text-center text-3xl font-mono font-bold tracking-widest py-3 px-4 rounded-xl bg-charcoal-card border border-white/20 text-gold placeholder-white/20 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all shadow-inner"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-truck-red/20 border border-truck-red/40 text-xs text-red-200 text-center flex items-center justify-center gap-2">
                <WifiOff className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={connectionStatus === 'connecting' || pinInput.length < 4}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-truck-red via-highway-orange to-gold text-white font-bold text-sm tracking-wide shadow-glow-red hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {connectionStatus === 'connecting' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connecting to Laptop...</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Connect Remote</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-white/40 z-10">
          Tip: You can also scan the QR code on your laptop screen with your phone camera!
        </div>
      </div>
    );
  }

  // ── Connected Remote Controller View ─────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-charcoal text-white flex flex-col max-w-md mx-auto select-none relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-truck-red/15 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-highway-orange/10 rounded-full blur-[100px]" />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-charcoal-card/95 border border-gold/40 text-gold text-xs font-semibold shadow-2xl backdrop-blur-md animate-fadeIn flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-charcoal/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Laptop Connected</span>
              <span className="text-[10px] font-mono text-gold bg-gold/10 px-1.5 py-0.2 rounded border border-gold/20">
                #{roomPin}
              </span>
            </span>
            <span className="text-[10px] text-white/40">Hostel Music Remote</span>
          </div>
        </div>

        <button
          onClick={onExitRemote}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 text-xs flex items-center gap-1 transition-colors"
          title="Exit remote mode"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="text-[11px]">Exit</span>
        </button>
      </header>

      {/* ── Main Content Area ───────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-4 pb-24 overflow-y-auto">
        {activeTab === 'remote' ? (
          <div className="space-y-6 animate-fadeIn">
            {/* ── Now Playing Card ────────────────────────────────────────── */}
            <div className="relative flex flex-col items-center text-center pt-2">
              {/* Cover Art with Glow */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/15 group">
                <img
                  src={getThumbnail(currentSong.youtubeId)}
                  alt={currentSong.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent" />

                {/* Animated Equalizer Bars */}
                {isPlaying && (
                  <div className="absolute bottom-3 right-3 flex items-end gap-1 h-5 px-2 py-1 rounded bg-black/60 backdrop-blur-sm">
                    <div className="w-1 bg-gold rounded-full animate-bar1" style={{ height: '60%' }} />
                    <div className="w-1 bg-gold rounded-full animate-bar2" style={{ height: '100%' }} />
                    <div className="w-1 bg-gold rounded-full animate-bar3" style={{ height: '40%' }} />
                    <div className="w-1 bg-gold rounded-full animate-bar2" style={{ height: '80%' }} />
                  </div>
                )}
              </div>

              {/* Title & Artist */}
              <div className="mt-4 px-2 w-full max-w-xs">
                <h2 className="text-xl font-bold text-white truncate tracking-tight">
                  {currentSong.title}
                </h2>
                <p className="text-xs text-white/60 font-medium truncate mt-0.5">
                  {currentSong.artist}
                </p>
              </div>
            </div>

            {/* ── Progress Bar / Scrubber ─────────────────────────────────── */}
            <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm space-y-1.5">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={handleSeek}
                onMouseDown={handleSeekStart}
                onTouchStart={handleSeekStart}
                onMouseUp={handleSeekEnd}
                onTouchEnd={handleSeekEnd}
                className="w-full h-2 rounded-lg bg-white/15 accent-gold cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-white/50 px-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* ── Playback Controls Deck ──────────────────────────────────── */}
            <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                {/* Shuffle */}
                <button
                  onClick={handleToggleShuffle}
                  className={`p-2.5 rounded-full transition-all active:scale-90 ${
                    shuffle
                      ? 'text-gold bg-gold/15 shadow-glow-gold'
                      : 'text-white/40 hover:text-white'
                  }`}
                  aria-label="Toggle shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                {/* Skip -10s */}
                <button
                  onClick={() => handleSkipSeconds(-10)}
                  className="p-2 text-white/60 hover:text-white active:scale-90 transition-transform"
                  aria-label="Skip back 10 seconds"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Previous */}
                <button
                  onClick={handlePrev}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/15 text-white active:scale-90 transition-transform border border-white/10"
                  aria-label="Previous track"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                {/* Play / Pause - Large Hero Button */}
                <button
                  onClick={handleTogglePlay}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-truck-red via-highway-orange to-gold flex items-center justify-center text-white shadow-glow-red active:scale-95 transition-all"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current translate-x-0.5" />
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={handleNext}
                  className="p-3 rounded-full bg-white/5 hover:bg-white/15 text-white active:scale-90 transition-transform border border-white/10"
                  aria-label="Next track"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                {/* Skip +10s */}
                <button
                  onClick={() => handleSkipSeconds(10)}
                  className="p-2 text-white/60 hover:text-white active:scale-90 transition-transform"
                  aria-label="Skip forward 10 seconds"
                >
                  <RotateCw className="w-5 h-5" />
                </button>

                {/* Repeat */}
                <button
                  onClick={handleToggleRepeat}
                  className={`p-2.5 rounded-full transition-all active:scale-90 ${
                    repeat
                      ? 'text-gold bg-gold/15 shadow-glow-gold'
                      : 'text-white/40 hover:text-white'
                  }`}
                  aria-label="Toggle repeat"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Laptop Master Volume Deck ───────────────────────────────── */}
            <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm flex items-center gap-3">
              <button
                onClick={handleToggleMute}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                aria-label="Toggle mute"
              >
                {localVolume === 0 ? (
                  <VolumeX className="w-5 h-5 text-truck-red" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gold" />
                )}
              </button>

              <div className="flex-1 flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={localVolume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 rounded-lg bg-white/15 accent-gold cursor-pointer"
                />
              </div>

              <span className="text-xs font-mono font-semibold text-white/60 w-8 text-right">
                {localVolume}%
              </span>
            </div>
          </div>
        ) : (
          /* ── Song Library Tab ────────────────────────────────────────────── */
          <div className="space-y-4 animate-fadeIn">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search songs or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-card border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-gold transition-colors"
              />
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-truck-red to-highway-orange text-white shadow-glow-red'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Songs List */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40 px-1">
                {filteredSongs.length} Songs Available
              </div>

              {filteredSongs.map((song) => {
                const isThisPlaying = currentSong?.id === song.id;
                const isFav = favorites.some((s) => s.id === song.id);

                return (
                  <div
                    key={song.id}
                    onClick={() => handleSelectSong(song)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer active:scale-[0.99] ${
                      isThisPlaying
                        ? 'bg-truck-red/15 border-truck-red/50 shadow-glow-red'
                        : 'bg-charcoal-card/60 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10">
                      <img
                        src={getThumbnail(song.youtubeId)}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                      {isThisPlaying && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          {isPlaying ? (
                            <div className="flex items-end gap-0.5 h-3">
                              <div className="w-0.5 bg-gold rounded-full animate-bar1 h-full" />
                              <div className="w-0.5 bg-gold rounded-full animate-bar2 h-full" />
                              <div className="w-0.5 bg-gold rounded-full animate-bar3 h-full" />
                            </div>
                          ) : (
                            <Play className="w-4 h-4 text-gold fill-current" />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-xs font-bold truncate ${
                          isThisPlaying ? 'text-gold' : 'text-white'
                        }`}
                      >
                        {song.title}
                      </h4>
                      <p className="text-[11px] text-white/50 truncate">
                        {song.artist}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(song.id);
                        }}
                        className="p-2 text-white/30 hover:text-truck-red transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFav ? 'text-truck-red fill-current' : ''
                          }`}
                        />
                      </button>

                      <div className="text-[10px] font-mono text-white/40">
                        {formatTime(song.duration)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ── Bottom Navigation Tabs ─────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-charcoal-card/95 backdrop-blur-md border-t border-white/10 px-6 py-2.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('remote')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'remote'
              ? 'text-gold font-bold'
              : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span>Now Playing</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            activeTab === 'library'
              ? 'text-gold font-bold'
              : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Music className="w-5 h-5" />
          <span>Browse Library</span>
        </button>
      </nav>
    </div>
  );
};

export default MobileRemoteView;
