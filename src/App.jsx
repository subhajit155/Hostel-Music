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

// ── Background decoration ────────────────────────────────────────────────────
const BackgroundDecor = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
    {/* Main highway gradient */}
    <div className="absolute inset-0 bg-highway-gradient" />

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

// ── Main App Content ─────────────────────────────────────────────────────────
const MainContent = ({ isRemoteClientMode, clientRemote, onExitRemote, onEnterRemoteMode }) => {
  const { remoteControl } = useMusicContext();
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
      <BackgroundDecor />

      <div className="min-h-dvh flex flex-col">
        <Header onOpenRemoteModal={() => setIsPairModalOpen(true)} />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 pb-28 md:pb-12">
          {/* ── Hero Player ─────────────────────────────────────── */}
          <section className="flex justify-center mb-12">
            <HeroPlayer />
          </section>

          {/* ── Playlist Section ─────────────────────────────────── */}
          <section className="space-y-5">
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
