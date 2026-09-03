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
  Gauge,
  Moon,
  Tv,
  PartyPopper,
  Flame,
  Send,
  Plus,
  Trash2,
  ListOrdered,
  ArrowUp,
  Video,
  Layers,
} from 'lucide-react';
import { SONGS, CATEGORIES, getThumbnail } from '../data/songs';
import { formatTime } from '../utils/formatTime';

const SPEED_PRESETS = [0.75, 1, 1.25, 1.5, 2];
const SLEEP_PRESETS = [
  { label: 'Off', minutes: 0 },
  { label: '15m', minutes: 15 },
  { label: '30m', minutes: 30 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
];

const REACTION_EMOJIS = ['🔥', '💃', '🍺', '🎸', '❤️', '🔊', '🎉', '🚀'];

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

  const [activeTab, setActiveTab] = useState('remote'); // 'remote' | 'screen' | 'library' | 'queue'
  const [pinInput, setPinInput] = useState(roomPin || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [localVolume, setLocalVolume] = useState(80);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Laptop search & DJ shoutout states
  const [laptopSearchQuery, setLaptopSearchQuery] = useState('');
  const [shoutoutText, setShoutoutText] = useState('');

  // Custom YouTube play modal states
  const [isCustomYtOpen, setIsCustomYtOpen] = useState(false);
  const [customYtUrl, setCustomYtUrl] = useState('');
  const [customYtTitle, setCustomYtTitle] = useState('');
  const [customYtArtist, setCustomYtArtist] = useState('');

  // Sync volume when host broadcasts
  useEffect(() => {
    if (remoteState && typeof remoteState.volume === 'number') {
      setLocalVolume(remoteState.volume);
    }
  }, [remoteState?.volume]);

  // Sync search when host updates
  useEffect(() => {
    if (remoteState && typeof remoteState.searchQuery === 'string') {
      setLaptopSearchQuery(remoteState.searchQuery);
    }
  }, [remoteState?.searchQuery]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleConnect = (e) => {
    e?.preventDefault();
    if (pinInput.trim().length >= 4) {
      connectToHost(pinInput.trim());
    }
  };

  // ── Playback Commands ──────────────────────────────────────────────────────
  const handleTogglePlay = () => sendCommand({ type: 'CMD_TOGGLE_PLAY' });
  const handleNext = () => {
    sendCommand({ type: 'CMD_NEXT' });
    showToast('Next Track ⏭️');
  };
  const handlePrev = () => {
    sendCommand({ type: 'CMD_PREV' });
    showToast('Previous Track ⏮️');
  };

  const handleSeek = (e) => setSeekValue(Number(e.target.value));
  const handleSeekStart = () => setIsSeeking(true);
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
    showToast(!remoteState?.repeat ? 'Repeat 1 Track 🔂' : 'Repeat Off ➡️');
  };

  const handleSpeedChange = (rate) => {
    sendCommand({ type: 'CMD_SET_SPEED', rate });
    showToast(`Speed set to ${rate}x`);
  };

  const handleSleepTimer = (minutes) => {
    sendCommand({ type: 'CMD_SET_SLEEP_TIMER', minutes });
    showToast(minutes > 0 ? `Sleep timer: ${minutes} mins 🌙` : 'Sleep timer cancelled');
  };

  // ── Laptop Screen & Party Commands ─────────────────────────────────────────
  const handleSetLaptopCategory = (categoryId) => {
    sendCommand({ type: 'CMD_SET_CATEGORY', category: categoryId });
    showToast(`Category switched on Laptop 📺`);
  };

  const handleLaptopSearch = (query) => {
    setLaptopSearchQuery(query);
    sendCommand({ type: 'CMD_SET_SEARCH', query });
  };

  const handleScrollLaptop = (target) => {
    sendCommand({ type: 'CMD_SCROLL_LAPTOP', target });
    showToast(`Scrolled laptop to ${target} 📜`);
  };

  const handleToggleCinemaMode = () => {
    const next = !remoteState?.cinemaMode;
    sendCommand({ type: 'CMD_SET_CINEMA_MODE', value: next });
    showToast(next ? 'Cinema Spotlight On 🎬' : 'Cinema Mode Off');
  };

  const handleTogglePartyMode = () => {
    const next = !remoteState?.partyMode;
    sendCommand({ type: 'CMD_SET_PARTY_MODE', value: next });
    showToast(next ? 'Party Disco Lights ON! 🪩' : 'Party Lights Off');
  };

  const handleSendReaction = (emoji) => {
    sendCommand({ type: 'CMD_SEND_REACTION', emoji });
    showToast(`Sent ${emoji} to laptop screen!`);
  };

  const handleSendShoutout = (e) => {
    e?.preventDefault();
    if (!shoutoutText.trim()) return;
    sendCommand({ type: 'CMD_SEND_SHOUTOUT', message: shoutoutText.trim() });
    showToast('DJ Shoutout Broadcasted! 📢');
    setShoutoutText('');
  };

  // ── Library & Custom YouTube Commands ──────────────────────────────────────
  const handleSelectSong = (song) => {
    sendCommand({ type: 'CMD_SELECT_SONG', songId: song.id });
    showToast(`Playing "${song.title}" 🎶`);
    setActiveTab('remote');
  };

  const handleAddToQueue = (song, e) => {
    e?.stopPropagation();
    sendCommand({ type: 'CMD_ADD_TO_QUEUE', songId: song.id, song });
    showToast(`Added "${song.title}" to Queue 📋`);
  };

  const handleRemoveFromQueue = (index) => {
    sendCommand({ type: 'CMD_REMOVE_FROM_QUEUE', index });
    showToast('Removed from Queue');
  };

  const handleClearQueue = () => {
    sendCommand({ type: 'CMD_CLEAR_QUEUE' });
    showToast('Queue Cleared');
  };

  const handleToggleFavorite = (songId) => {
    sendCommand({ type: 'CMD_TOGGLE_FAVORITE', songId });
  };

  // Helper to extract YouTube video ID from links or raw IDs
  const extractYoutubeId = (urlOrId) => {
    if (!urlOrId) return '';
    const clean = urlOrId.trim();
    if (clean.length === 11 && !clean.includes('/') && !clean.includes('?')) {
      return clean;
    }
    const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : '';
  };

  const handlePlayCustomYt = (e) => {
    e?.preventDefault();
    const vidId = extractYoutubeId(customYtUrl);
    if (!vidId) {
      showToast('⚠️ Invalid YouTube Link / ID');
      return;
    }
    sendCommand({
      type: 'CMD_PLAY_CUSTOM_YT',
      youtubeId: vidId,
      title: customYtTitle.trim() || 'Custom YouTube Track',
      artist: customYtArtist.trim() || 'YouTube Audio',
    });
    showToast('Playing Custom Video on Laptop! 🎬');
    setIsCustomYtOpen(false);
    setCustomYtUrl('');
    setCustomYtTitle('');
    setCustomYtArtist('');
    setActiveTab('remote');
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
  const queue = remoteState?.queue || [];
  const playbackRate = remoteState?.playbackRate || 1;
  const sleepTimerMinutes = remoteState?.sleepTimerMinutes || null;
  const sleepTimerSecondsLeft = remoteState?.sleepTimerSecondsLeft || null;
  const cinemaMode = remoteState?.cinemaMode || false;
  const partyMode = remoteState?.partyMode || false;
  const laptopSelectedCategory = remoteState?.selectedCategory || 'all';

  // ── Connection Screen (if disconnected or pin not entered) ───────────────────
  if (!isConnected && connectionStatus !== 'connected') {
    return (
      <div className="min-h-dvh bg-charcoal flex flex-col justify-between p-6 text-white max-w-md mx-auto relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-truck-red/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold/15 rounded-full blur-3xl pointer-events-none" />

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

        <div className="my-auto py-8 z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 text-gold shadow-glow-gold">
              <Laptop className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Connect to Laptop
            </h1>
            <p className="text-xs text-white/60 mt-1 max-w-xs mx-auto">
              Enter the 6-digit room code shown on your laptop screen to gain full remote control.
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
                  <span>Connect Full Remote</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-white/40 z-10">
          Tip: You can also scan the QR code on your laptop screen with your camera!
        </div>
      </div>
    );
  }

  // ── Connected Full Remote Controller View ────────────────────────────────────
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
              <span>Laptop Master Control</span>
              <span className="text-[10px] font-mono text-gold bg-gold/10 px-1.5 py-0.2 rounded border border-gold/20">
                #{roomPin}
              </span>
            </span>
            <span className="text-[10px] text-white/40">Total Site Remote</span>
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
      <main className="flex-1 px-4 py-4 pb-24 overflow-y-auto space-y-4">
        {/* ── TAB 1: NOW PLAYING & AUDIO CONTROLS ───────────────────────────── */}
        {activeTab === 'remote' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Now Playing Card */}
            <div className="relative flex flex-col items-center text-center pt-2">
              <div className="relative w-52 h-52 rounded-2xl overflow-hidden shadow-2xl border border-white/15">
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

              <div className="mt-3 px-2 w-full max-w-xs">
                <h2 className="text-lg font-bold text-white truncate tracking-tight">
                  {currentSong.title}
                </h2>
                <p className="text-xs text-white/60 font-medium truncate mt-0.5">
                  {currentSong.artist}
                </p>
              </div>
            </div>

            {/* Progress Scrubber */}
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

            {/* Playback Controls Deck */}
            <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleToggleShuffle}
                  className={`p-2.5 rounded-full transition-all active:scale-90 ${
                    shuffle ? 'text-gold bg-gold/15 shadow-glow-gold' : 'text-white/40 hover:text-white'
                  }`}
                  title="Toggle Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSkipSeconds(-10)}
                  className="p-2 text-white/60 hover:text-white active:scale-90 transition-transform"
                  title="Rewind 10s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white active:scale-90 transition-transform border border-white/10"
                  title="Previous Track"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={handleTogglePlay}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-truck-red via-highway-orange to-gold flex items-center justify-center text-white shadow-glow-red active:scale-95 transition-all"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-full bg-white/5 hover:bg-white/15 text-white active:scale-90 transition-transform border border-white/10"
                  title="Next Track"
                >
                  <SkipForward className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleSkipSeconds(10)}
                  className="p-2 text-white/60 hover:text-white active:scale-90 transition-transform"
                  title="Skip 10s"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleRepeat}
                  className={`p-2.5 rounded-full transition-all active:scale-90 ${
                    repeat ? 'text-gold bg-gold/15 shadow-glow-gold' : 'text-white/40 hover:text-white'
                  }`}
                  title="Toggle Repeat"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Laptop Master Volume */}
            <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-3.5 shadow-lg backdrop-blur-sm flex items-center gap-3">
              <button
                onClick={handleToggleMute}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
                title="Toggle Mute"
              >
                {localVolume === 0 ? (
                  <VolumeX className="w-5 h-5 text-truck-red" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gold" />
                )}
              </button>

              <div className="flex-1">
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

            {/* Playback Speed & Sleep Timer Bar */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Speed presets */}
              <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-3 shadow-lg">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/50 mb-2 uppercase tracking-wider">
                  <Gauge className="w-3.5 h-3.5 text-gold" />
                  <span>Playback Speed</span>
                </div>
                <div className="flex gap-1">
                  {SPEED_PRESETS.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        playbackRate === rate
                          ? 'bg-gold text-black shadow-glow-gold'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Sleep timer presets */}
              <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-3 shadow-lg">
                <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 mb-2 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-gold" />
                    <span>Sleep Timer</span>
                  </div>
                  {sleepTimerSecondsLeft && (
                    <span className="text-[10px] text-gold font-mono">
                      {Math.ceil(sleepTimerSecondsLeft / 60)}m
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  {SLEEP_PRESETS.map((p) => (
                    <button
                      key={p.minutes}
                      onClick={() => handleSleepTimer(p.minutes)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        (sleepTimerMinutes === p.minutes || (!sleepTimerMinutes && p.minutes === 0))
                          ? 'bg-truck-red text-white shadow-glow-red'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: LAPTOP SCREEN & PARTY DECK ─────────────────────────────── */}
        {activeTab === 'screen' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Visual Mode Toggles */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleTogglePartyMode}
                className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 ${
                  partyMode
                    ? 'bg-gradient-to-tr from-truck-red via-highway-orange to-gold border-gold text-white shadow-glow-red'
                    : 'bg-charcoal-card border-white/10 text-white/70 hover:bg-white/5'
                }`}
              >
                <PartyPopper className="w-5 h-5" />
                <span className="text-xs font-bold">Party Disco Lights</span>
                <span className="text-[10px] opacity-70">
                  {partyMode ? 'ON (Pulsing RGB)' : 'OFF'}
                </span>
              </button>

              <button
                onClick={handleToggleCinemaMode}
                className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all active:scale-95 ${
                  cinemaMode
                    ? 'bg-gradient-to-tr from-purple-900 to-indigo-900 border-purple-500 text-white shadow-lg'
                    : 'bg-charcoal-card border-white/10 text-white/70 hover:bg-white/5'
                }`}
              >
                <Tv className="w-5 h-5" />
                <span className="text-xs font-bold">Cinema Spotlight</span>
                <span className="text-[10px] opacity-70">
                  {cinemaMode ? 'ON (Dimmed)' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Laptop Live Category Sync */}
            <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-gold" />
                  <span>Switch Category on Laptop Screen</span>
                </span>
                <span className="text-[10px] text-gold uppercase font-mono">Live</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSetLaptopCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all active:scale-95 ${
                      laptopSelectedCategory === cat.id
                        ? 'bg-gradient-to-r from-truck-red to-highway-orange text-white font-bold shadow-glow-red'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Search on Laptop */}
            <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm space-y-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Search className="w-4 h-4 text-gold" />
                <span>Type to Filter Songs on Laptop</span>
              </span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter songs live on laptop..."
                  value={laptopSearchQuery}
                  onChange={(e) => handleLaptopSearch(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 rounded-xl bg-charcoal border border-white/15 text-white text-xs placeholder-white/30 focus:outline-none focus:border-gold"
                />
                {laptopSearchQuery && (
                  <button
                    onClick={() => handleLaptopSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Scroll Laptop Screen Controls */}
            <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm space-y-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ArrowUp className="w-4 h-4 text-gold" />
                <span>Scroll Laptop Viewport</span>
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleScrollLaptop('player')}
                  className="py-2 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium border border-white/5 active:scale-95 transition-all"
                >
                  📺 To Player
                </button>
                <button
                  onClick={() => handleScrollLaptop('playlist')}
                  className="py-2 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium border border-white/5 active:scale-95 transition-all"
                >
                  📋 To Songs
                </button>
                <button
                  onClick={() => handleScrollLaptop('top')}
                  className="py-2 px-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium border border-white/5 active:scale-95 transition-all"
                >
                  ⬆️ To Top
                </button>
              </div>
            </div>

            {/* Live Floating Reaction Emoji Pad */}
            <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm space-y-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-gold" />
                <span>Send Floating Reactions to Laptop</span>
              </span>
              <div className="grid grid-cols-4 gap-2">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSendReaction(emoji)}
                    className="h-12 rounded-xl bg-white/5 hover:bg-white/15 text-2xl flex items-center justify-center active:scale-90 transition-transform border border-white/5"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* DJ Shoutout Banner Broadcast */}
            <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm space-y-2.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Broadcast DJ Shoutout Banner</span>
              </span>
              <form onSubmit={handleSendShoutout} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Room 211 DJ Night Started!"
                  value={shoutoutText}
                  onChange={(e) => setShoutoutText(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-charcoal border border-white/15 text-white text-xs placeholder-white/30 focus:outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  disabled={!shoutoutText.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-truck-red to-highway-orange text-white text-xs font-bold flex items-center gap-1 shadow-glow-red disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 3: SONG CATALOG & CUSTOM YOUTUBE ─────────────────────────── */}
        {activeTab === 'library' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Custom YouTube Play Launcher Button */}
            <button
              onClick={() => setIsCustomYtOpen(true)}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-red-700 via-truck-red to-highway-orange text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow-red hover:brightness-110 active:scale-[0.99] transition-all"
            >
              <Video className="w-4 h-4" />
              <span>Play Any YouTube Video / URL on Laptop</span>
            </button>

            {/* Search Library */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search songs or artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-card border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-gold"
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
                      <h4 className={`text-xs font-bold truncate ${isThisPlaying ? 'text-gold' : 'text-white'}`}>
                        {song.title}
                      </h4>
                      <p className="text-[11px] text-white/50 truncate">
                        {song.artist}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleAddToQueue(song, e)}
                        className="p-1.5 text-white/40 hover:text-gold transition-colors rounded-lg bg-white/5"
                        title="Add to queue"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(song.id);
                        }}
                        className="p-1.5 text-white/30 hover:text-truck-red transition-colors"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-truck-red fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 4: QUEUE & FAVORITES ─────────────────────────────────────── */}
        {activeTab === 'queue' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Up Next Queue */}
            <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ListOrdered className="w-4 h-4 text-gold" />
                  <span>Up Next Queue ({queue.length})</span>
                </span>
                {queue.length > 0 && (
                  <button
                    onClick={handleClearQueue}
                    className="text-[11px] text-truck-red hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {queue.length === 0 ? (
                <div className="text-center py-6 text-xs text-white/40">
                  Queue is empty. Tap the <Plus className="w-3 h-3 inline text-gold" /> button on any song in the library to add it here.
                </div>
              ) : (
                <div className="space-y-2">
                  {queue.map((qSong, idx) => (
                    <div
                      key={`${qSong.id}-${idx}`}
                      className="flex items-center justify-between p-2 rounded-xl bg-charcoal border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-[11px] font-mono text-white/30">{idx + 1}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{qSong.title}</p>
                          <p className="text-[10px] text-white/50 truncate">{qSong.artist}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromQueue(idx)}
                        className="p-1 text-white/40 hover:text-truck-red"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite Songs Quick Access */}
            <div className="bg-charcoal-card/80 border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-sm space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-truck-red fill-current" />
                <span>Favorites ({favorites.length})</span>
              </span>

              {favorites.length === 0 ? (
                <div className="text-center py-4 text-xs text-white/40">
                  No favorite songs saved yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      onClick={() => handleSelectSong(fav)}
                      className="flex items-center justify-between p-2 rounded-xl bg-charcoal border border-white/5 text-xs cursor-pointer hover:bg-white/5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white truncate">{fav.title}</p>
                        <p className="text-[10px] text-white/50 truncate">{fav.artist}</p>
                      </div>
                      <Play className="w-3.5 h-3.5 text-gold" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Custom YouTube Modal ────────────────────────────────────────────── */}
      {isCustomYtOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-charcoal-card border border-white/15 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                <h3 className="text-sm font-bold text-white">Play Any YouTube Video</h3>
              </div>
              <button
                onClick={() => setIsCustomYtOpen(false)}
                className="text-white/50 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePlayCustomYt} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-white/60 mb-1">
                  YouTube Link or Video ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://youtube.com/watch?v=..."
                  value={customYtUrl}
                  onChange={(e) => setCustomYtUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal border border-white/15 text-white text-xs placeholder-white/30 focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/60 mb-1">
                  Custom Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Favorite Song"
                  value={customYtTitle}
                  onChange={(e) => setCustomYtTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal border border-white/15 text-white text-xs placeholder-white/30 focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-white/60 mb-1">
                  Artist Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arijit Singh"
                  value={customYtArtist}
                  onChange={(e) => setCustomYtArtist(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-charcoal border border-white/15 text-white text-xs placeholder-white/30 focus:outline-none focus:border-gold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-truck-red to-highway-orange text-white font-bold text-xs shadow-glow-red hover:brightness-110 active:scale-[0.98] transition-all"
              >
                ▶️ Play Now on Laptop
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Bottom Navigation Tabs (4 Tabs) ─────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-charcoal-card/95 backdrop-blur-md border-t border-white/10 px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('remote')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'remote' ? 'text-gold font-bold' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Player</span>
        </button>

        <button
          onClick={() => setActiveTab('screen')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'screen' ? 'text-gold font-bold' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Laptop UI</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'library' ? 'text-gold font-bold' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Library</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            activeTab === 'queue' ? 'text-gold font-bold' : 'text-white/40 hover:text-white/80'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Queue ({queue.length})</span>
        </button>
      </nav>
    </div>
  );
};

export default MobileRemoteView;
