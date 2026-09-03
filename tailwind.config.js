/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'truck-red':    '#D72638',
        'truck-dark':   '#A01020',
        'highway-orange': '#F4511E',
        'gold':         '#FFB300',
        'gold-light':   '#FFD54F',
        'desi-green':   '#2E7D32',
        'charcoal':     '#0D0D0D',
        'charcoal-card':'#161616',
        'surface':      '#161616',
        'surface-2':    '#1E1E1E',
        'surface-3':    '#272727',
        'border-muted': '#2A2A2A',
      },
      fontFamily: {
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
        sans:  ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'highway-gradient':
          'radial-gradient(ellipse at top, #1a0505 0%, #0D0D0D 60%)',
        'card-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
        'player-gradient':
          'linear-gradient(160deg, #1a0a00 0%, #0f0000 40%, #0D0D0D 100%)',
        'truck-shine':
          'linear-gradient(180deg, rgba(215,38,56,0.15) 0%, transparent 100%)',
      },
      boxShadow: {
        'truck':     '0 0 40px rgba(215,38,56,0.2), 0 4px 20px rgba(0,0,0,0.8)',
        'card-hover':'0 8px 32px rgba(215,38,56,0.15), 0 2px 8px rgba(0,0,0,0.5)',
        'glow-red':  '0 0 20px rgba(215,38,56,0.5)',
        'glow-gold': '0 0 20px rgba(255,179,0,0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 8s linear infinite',
        'bounce-subtle': 'bounce-subtle 1s ease-in-out infinite',
        'fadeIn':     'fadeIn 0.3s ease-out',
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'bar1':       'barAnim 0.8s ease-in-out infinite alternate',
        'bar2':       'barAnim 1.1s ease-in-out infinite alternate 0.2s',
        'bar3':       'barAnim 0.9s ease-in-out infinite alternate 0.4s',
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to:   { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        barAnim: {
          '0%':   { height: '20%' },
          '100%': { height: '100%' },
        },
      },
    },
  },
  plugins: [],
};
