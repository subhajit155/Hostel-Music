import React, { useState, useEffect, useCallback } from 'react';
import { MusicProvider, useMusicContext } from './context/MusicContext';
import Header from './components/Header';
import HeroPlayer from './components/HeroPlayer';
import CategoryTabs from './components/CategoryTabs';
import SearchBar from './components/SearchBar';
import PlaylistSection from './components/PlaylistSection';
import StickyMobilePlayer from './components/StickyMobilePlayer';
import Footer from './components/Footer';
import RemotePairModal from './components/RemotePairModal';
import MobileRemoteView from './components/MobileRemoteView';
import { useRemoteControl } from './hooks/useRemoteControl';
import { Sparkles, Radio, MessageSquare, Volume2, Moon } from 'lucide-react';

// ── Background decoration ────────────────────────────────────────────────────
const BackgroundDecor = ({ partyMode, cinemaMode }) => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
    {/* Main highway gradient */}
    <div className={`absolute inset-0 bg-highway-gradient transition-opacity duration-700 ${cinemaMode ? 'opacity-30' : 'opacity-100'}`} />

    {/* Disco Party Mode Ambient Lights */}
    {partyMode && (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-truck-red/25 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-gold/25 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-indigo-500/25 rounded-full blur-[100px] animate-bounce-subtle" />
      </div>
    )}

    {/* Headlight beams */}
    <div
      className="absolute bottom-0 left-1/4 w-px h-3/4 opacity-[0.03]"
      style={{ background: 'linear-gradient(to top, #FFB300, transparent)' }}
    />
    <div
      className="absolute bottom-0 right-1/4 w-px h-3/4 opacity-[0.03]"
      style={{ background: 'linear-gradient(to top, #FFB300, transparent)' }}
    />

    {/* Decorative dots — hostel motif */}
    <div className="absolute top-20 left-8 w-2 h-2 rounded-full bg-truck-red/20" />
    <div className="absolute top-40 left-4 w-1 h-1 rounded-full bg-gold/20" />
    <div className="absolute top-28 right-10 w-2 h-2 rounded-full bg-truck-red/15" />
    <div className="absolute top-56 right-6 w-1 h-1 rounded-full bg-highway-orange/20" />

    {/* Large ambient glow */}
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-truck-red/5 blur-[120px]" />
  </div>
);

// ── Floating Live Emoji Reactions ───────────────────────────────────────────
const LiveReactionsOverlay = ({ reactions }) => {
  if (!reactions || !reactions.length) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {reactions.map((r) => (
        <div
          key={r.id}
          className="absolute bottom-10 text-4xl sm:text-5xl animate-floatUp select-none"
          style={{
            left: `${r.x}%`,
            filter: 'drop-shadow(0 0 12px rgba(255,179,0,0.6))',
          }}
        >
          {r.emoji}
        </div>
      ))}
    </div>
  );
};

// ── DJ Shoutout Broadcast Banner ─────────────────────────────────────────────
const DjShoutoutBanner = ({ shoutout }) => {
  if (!shoutout) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-lg p-4 rounded-2xl bg-charcoal-card/95 border-2 border-gold/60 text-white shadow-2xl backdrop-blur-md animate-slideDown flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-truck-red via-highway-orange to-gold flex items-center justify-center text-white shrink-0 shadow-glow-red">
        <Sparkles className="w-5 h-5 animate-spin-slow" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/30">
            DJ Shoutout
          </span>
          <span className="text-[10px] text-white/40">Live from Phone</span>
        </div>
        <p className="text-sm sm:text-base font-bold text-white mt-1 break-words">
          {shoutout.message}
        </p>
      </div>
    </div>
  );
};

// ── Main App Content ─────────────────────────────────────────────────────────
const MainContent = ({ isRemoteClientMode, clientRemote, onExitRemote, onEnterRemoteMode }) => {
  const {
    remoteControl,
    partyMode,
    cinemaMode,
    liveReactions,
    djShoutout,
    sleepTimerSecondsLeft,
  } = useMusicContext();

  const [isPairModalOpen, setIsPairModalOpen] = useState(false);

  // If in remote client mode, render the mobile remote control screen
  if (isRemoteClientMode) {
    return (
      <MobileRemoteView
        remoteControl={clientRemote}
        onExitRemote={onExitRemote}
      />
    );
  }

  return (
    <>
      <BackgroundDecor partyMode={partyMode} cinemaMode={cinemaMode} />
      <LiveReactionsOverlay reactions={liveReactions} />
      <DjShoutoutBanner shoutout={djShoutout} />

      <div className={`min-h-dvh flex flex-col transition-all duration-500 ${cinemaMode ? 'bg-black/85' : ''}`}>
        <Header onOpenRemoteModal={() => setIsPairModalOpen(true)} />

        {/* Active Sleep Timer or Party Mode indicator badge */}
        {(sleepTimerSecondsLeft || partyMode || cinemaMode) && (
          <div className="bg-charcoal-card/90 border-b border-white/10 px-4 py-2 flex items-center justify-center gap-4 text-xs font-semibold text-white/80">
            {sleepTimerSecondsLeft && (
              <div className="flex items-center gap-1.5 text-gold">
                <Moon className="w-3.5 h-3.5" />
                <span>Sleep Timer: {Math.ceil(sleepTimerSecondsLeft / 60)}m left</span>
              </div>
            )}
            {partyMode && (
              <div className="flex items-center gap-1.5 text-truck-red animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Party Disco Lights ON</span>
              </div>
            )}
            {cinemaMode && (
              <div className="flex items-center gap-1.5 text-white/60">
                <span>Cinema Mode Spotlight Active</span>
              </div>
            )}
          </div>
        )}

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 pb-28 md:pb-12">
          {/* ── Hero Player ─────────────────────────────────────── */}
          <section id="player" className="flex justify-center mb-12 scroll-mt-20">
            <HeroPlayer />
          </section>

          {/* ── Playlist Section ─────────────────────────────────── */}
          <section id="playlist" className="space-y-5 scroll-mt-20">
            {/* Section heading */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  🎵 Songs
                </h2>
                <p className="text-sm text-white/40 mt-0.5">Choose your anthem</p>
              </div>
              <SearchBar />
            </div>

            {/* Category Tabs */}
            <CategoryTabs />

            {/* Song List */}
            <PlaylistSection />
          </section>
        </main>

        <Footer />

        {/* Mobile sticky player */}
        <StickyMobilePlayer />

        {/* Desktop Mobile Remote Pairing Modal */}
        <RemotePairModal
          isOpen={isPairModalOpen}
          onClose={() => setIsPairModalOpen(false)}
          roomPin={remoteControl?.roomPin || ''}
          connectedDevicesCount={remoteControl?.connectedDevicesCount || 0}
          onRegeneratePin={() => remoteControl?.initHost()}
          onSwitchToRemoteMode={onEnterRemoteMode}
        />
      </div>
    </>
  );
};

const App = () => {
  const [isRemoteClientMode, setIsRemoteClientMode] = useState(false);
  const [targetPin, setTargetPin] = useState('');

  // Remote client hook instance (used when phone connects to laptop)
  const clientRemote = useRemoteControl({
    isHost: false,
    roomPin: targetPin,
  });

  // Check URL query parameters for ?remote=XXXXXX or ?room=XXXXXX
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const remotePin = urlParams.get('remote') || urlParams.get('room');
    const mode = urlParams.get('mode');

    if (remotePin) {
      setTargetPin(remotePin);
      setIsRemoteClientMode(true);
      clientRemote.connectToHost(remotePin);
    } else if (mode === 'remote') {
      setIsRemoteClientMode(true);
    }
  }, []);

  const handleEnterRemoteMode = useCallback((pin) => {
    setTargetPin(pin || '');
    setIsRemoteClientMode(true);
    if (pin) {
      clientRemote.connectToHost(pin);
    }
  }, [clientRemote]);

  const handleExitRemote = useCallback(() => {
    setIsRemoteClientMode(false);
    if (typeof window !== 'undefined' && window.history.replaceState) {
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  return (
    <MusicProvider>
      <MainContent
        isRemoteClientMode={isRemoteClientMode}
        clientRemote={clientRemote}
        onExitRemote={handleExitRemote}
        onEnterRemoteMode={handleEnterRemoteMode}
      />
    </MusicProvider>
  );
};

export default App;
