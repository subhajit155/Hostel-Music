import React from 'react';
import { Music2, ExternalLink, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-border-muted bg-surface/60 backdrop-blur-md">
      <div className="hostel-divider" />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-truck-red flex items-center justify-center shadow-glow-red">
                <span className="text-white font-black text-sm tracking-tight leading-none">RBC</span>
              </div>
              <div>
                <p className="font-hindi text-lg font-bold text-white leading-none">हॉस्टल म्यूज़िक</p>
                <p className="text-xs text-gold tracking-widest uppercase font-medium">Hostel Music</p>
              </div>
            </div>
            <p className="text-sm text-white/40 max-w-xs leading-relaxed">
              Made BY Subhajit
            </p>
            <p className="text-xs text-white/20">
              Music streamed via YouTube. All rights belong to respective artists & labels.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-2 text-sm">
            <a href="#player"
               className="text-white/50 hover:text-white transition-colors">
              🎵 Player
            </a>
            <a href="#playlist"
               className="text-white/50 hover:text-white transition-colors">
              📋 Playlist
            </a>
            <a href="#"
               className="text-white/50 hover:text-white transition-colors">
              📖 About
            </a>
            <a href="#"
               className="text-white/50 hover:text-white transition-colors">
              🔒 Privacy
            </a>
            <a href="#"
               className="text-white/50 hover:text-white transition-colors">
              📬 Contact
            </a>
            <a
              href="https://music.youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-truck-red hover:text-highway-orange transition-colors font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" /> YouTube Music
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border-muted flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/20">
          <p>© {new Date().getFullYear()} Hostel Music. Made with <Heart className="w-3 h-3 inline text-truck-red" /> for music lovers.</p>
          <p className="font-hindi text-sm text-white/30">KEORA 🇮🇳</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
