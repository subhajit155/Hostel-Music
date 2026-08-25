import React from 'react';
import { Search, X } from 'lucide-react';
import { useMusicContext } from '../context/MusicContext';

const SearchBar = () => {
  const { searchQuery, dispatch } = useMusicContext();

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      <input
        id="search-input"
        type="text"
        placeholder="Search songs or artists…"
        value={searchQuery}
        onChange={(e) => dispatch({ type: 'SET_SEARCH', value: e.target.value })}
        aria-label="Search songs"
        className="
          w-full bg-surface-2 border border-border-muted rounded-full
          pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/30
          outline-none focus:border-truck-red/60 focus:shadow-[0_0_0_2px_rgba(215,38,56,0.15)]
          transition-all duration-200
        "
      />
      {searchQuery && (
        <button
          id="btn-search-clear"
          onClick={() => dispatch({ type: 'SET_SEARCH', value: '' })}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
