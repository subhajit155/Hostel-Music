import React from 'react';
import { useMusicContext } from '../context/MusicContext';
import SongCard from './SongCard';
import { Music } from 'lucide-react';

const PlaylistSection = () => {
  const { filteredPlaylist, searchQuery, selectedCategory } = useMusicContext();

  if (filteredPlaylist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-white/30">
        <Music className="w-12 h-12 mb-4 text-truck-red/40" />
        <p className="text-lg font-semibold">
          {selectedCategory === 'myplaylist' ? 'Your playlist is empty' : 'No songs found'}
        </p>
        {selectedCategory === 'myplaylist'
          ? <p className="text-sm mt-1">Songs you add here will appear in My Playlist</p>
          : searchQuery
            ? <p className="text-sm mt-1">Try a different search term</p>
            : <p className="text-sm mt-1">No songs in this category yet</p>
        }
      </div>
    );
  }

  return (
    <section id="playlist" aria-label="Song playlist" className="animate-fade-in">
      <p className="text-xs text-white/30 mb-3 font-medium tracking-wide uppercase">
        {filteredPlaylist.length} song{filteredPlaylist.length !== 1 ? 's' : ''}
        {searchQuery && ` matching "${searchQuery}"`}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {filteredPlaylist.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </section>
  );
};

export default PlaylistSection;
