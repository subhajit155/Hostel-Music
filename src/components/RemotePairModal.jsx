import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Radio,
  Wifi,
  Volume2,
  ListMusic,
  ExternalLink,
} from 'lucide-react';

const RemotePairModal = ({
  isOpen,
  onClose,
  roomPin,
  connectedDevicesCount,
  onRegeneratePin,
  onSwitchToRemoteMode,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  if (!isOpen) return null;

  // Build the remote URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const remoteUrl = `${origin}?remote=${roomPin}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(remoteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(roomPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-charcoal-card border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Background decorative glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-truck-red/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-gold/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-truck-red to-highway-orange flex items-center justify-center text-white shadow-glow-red">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              Mobile Remote Control
            </h3>
            <p className="text-xs text-white/60">
              Control playback on this laptop from your phone
            </p>
          </div>
        </div>

        {/* Connection Status Banner */}
        <div
          className={`mb-5 p-3 rounded-xl border flex items-center justify-between text-xs font-medium transition-all ${
            connectedDevicesCount > 0
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
              : 'bg-white/5 border-white/10 text-white/70'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {connectedDevicesCount > 0 ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-highway-orange opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-highway-orange" />
                </>
              )}
            </span>
            <span>
              {connectedDevicesCount > 0
                ? `${connectedDevicesCount} Mobile Device${connectedDevicesCount > 1 ? 's' : ''} Connected`
                : 'Waiting for phone to connect...'}
            </span>
          </div>

          <button
            onClick={onRegeneratePin}
            className="flex items-center gap-1 text-white/40 hover:text-gold transition-colors text-[11px]"
            title="Generate new Room PIN"
          >
            <RefreshCw className="w-3 h-3" />
            <span>New Code</span>
          </button>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner mb-4">
          <QRCodeSVG
            value={remoteUrl}
            size={180}
            level="M"
            includeMargin={false}
            fgColor="#121212"
            bgColor="#ffffff"
          />
          <span className="text-[11px] font-semibold text-charcoal/70 mt-2">
            Scan with your phone camera
          </span>
        </div>

        {/* PIN Code Box */}
        <div className="bg-charcoal/80 border border-white/10 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">
              Or Enter 6-Digit Room Code
            </span>
            <span className="text-xl font-mono font-bold tracking-widest text-gold">
              {roomPin}
            </span>
          </div>
          <button
            onClick={handleCopyPin}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedPin ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Copy Link Button */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-truck-red to-highway-orange hover:brightness-110 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-glow-red transition-all"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Remote URL</span>
              </>
            )}
          </button>

          {onSwitchToRemoteMode ? (
            <button
              onClick={() => {
                onClose();
                onSwitchToRemoteMode(roomPin);
              }}
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Open mobile remote controller on this device"
            >
              <Smartphone className="w-3.5 h-3.5 text-gold" />
              <span>Open Remote</span>
            </button>
          ) : (
            <a
              href={remoteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Test in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Test</span>
            </a>
          )}
        </div>

        {/* Features list */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center text-[11px] text-white/50">
          <div className="flex flex-col items-center gap-1">
            <Radio className="w-4 h-4 text-gold" />
            <span>Play/Pause & Seek</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Volume2 className="w-4 h-4 text-gold" />
            <span>Volume Control</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ListMusic className="w-4 h-4 text-gold" />
            <span>Pick Any Song</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemotePairModal;
