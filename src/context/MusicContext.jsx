import React, { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react';
import { SONGS } from '../data/songs';
import { useLocalStorage } from '../hooks/useLocalStorage';

// ── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  currentSong: SONGS[0],
  isPlaying: false,
  volume: 80,
  progress: 0,       // 0-100
  duration: 0,       // seconds
  currentTime: 0,    // seconds
  shuffle: false,
  repeat: false,     // 'none' | 'one' — using boolean for simplicity
  selectedCategory: 'all',
  searchQuery: '',
  playlist: SONGS,
};

// ── Reducer ──────────────────────────────────────────────────────────────────
const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_SONG':
      return { ...state, currentSong: action.song, progress: 0, currentTime: 0, duration: 0, isPlaying: true };
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.value };
    case 'SET_VOLUME':
      return { ...state, volume: action.value };
    case 'SET_PROGRESS':
      return { ...state, progress: action.value };
    case 'SET_DURATION':
      return { ...state, duration: action.value };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.value };
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle };
    case 'TOGGLE_REPEAT':
      return { ...state, repeat: !state.repeat };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.value, searchQuery: '' };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.value };
    case 'SET_PLAYLIST':
      return { ...state, playlist: action.songs };
    default:
      return state;
  }
};

// ── Context ──────────────────────────────────────────────────────────────────
const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const playerRef = useRef(null);
  const progressTimer = useRef(null);
  const [favorites, setFavorites] = useLocalStorage('tdm_favorites', []);
  const [recentlyPlayed, setRecentlyPlayed] = useLocalStorage('tdm_recent', []);

  // ── Track progress ─────────────────────────────────────────────────────────
  const startProgressTimer = useCallback(() => {
    clearInterval(progressTimer.current);
    progressTimer.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      try {
        const ct = player.getCurrentTime() || 0;
        const dur = player.getDuration() || 0;
        dispatch({ type: 'SET_CURRENT_TIME', value: ct });
        dispatch({ type: 'SET_DURATION', value: dur });
        dispatch({ type: 'SET_PROGRESS', value: dur > 0 ? (ct / dur) * 100 : 0 });
      } catch {
        /* player not ready */
      }
    }, 500);
  }, []);

  const stopProgressTimer = useCallback(() => {
    clearInterval(progressTimer.current);
  }, []);

  useEffect(() => {
    if (state.isPlaying) {
      startProgressTimer();
    } else {
      stopProgressTimer();
    }
    return stopProgressTimer;
  }, [state.isPlaying, startProgressTimer, stopProgressTimer]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getFilteredPlaylist = useCallback(() => {
    let songs = state.selectedCategory === 'all'
      ? SONGS
      : SONGS.filter(s => s.category === state.selectedCategory);
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      songs = songs.filter(
        s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
      );
    }
    return songs;
  }, [state.selectedCategory, state.searchQuery]);

  const getCurrentIndex = useCallback(() => {
    const list = getFilteredPlaylist();
    return list.findIndex(s => s.id === state.currentSong?.id);
  }, [state.currentSong, getFilteredPlaylist]);

  const playSong = useCallback((song) => {
    dispatch({ type: 'SET_SONG', song });
    // Track recently played
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 20);
    });
  }, [setRecentlyPlayed]);

  const playNext = useCallback(() => {
    const list = getFilteredPlaylist();
    if (!list.length) return;
    let idx = getCurrentIndex();
    if (state.shuffle) {
      idx = Math.floor(Math.random() * list.length);
    } else {
      idx = (idx + 1) % list.length;
    }
    playSong(list[idx]);
  }, [getFilteredPlaylist, getCurrentIndex, state.shuffle, playSong]);

  const playPrev = useCallback(() => {
    const list = getFilteredPlaylist();
    if (!list.length) return;
    let idx = getCurrentIndex();
    idx = (idx - 1 + list.length) % list.length;
    playSong(list[idx]);
  }, [getFilteredPlaylist, getCurrentIndex, playSong]);

  const seek = useCallback((percent) => {
    const player = playerRef.current;
    if (!player) return;
    const dur = player.getDuration() || 0;
    if (dur > 0) {
      player.seekTo((percent / 100) * dur, true);
      dispatch({ type: 'SET_PROGRESS', value: percent });
    }
  }, []);

  const setVolume = useCallback((vol) => {
    dispatch({ type: 'SET_VOLUME', value: vol });
    playerRef.current?.setVolume(vol);
  }, []);

  const toggleFavorite = useCallback((song) => {
    setFavorites(prev => {
      const exists = prev.some(s => s.id === song.id);
      return exists ? prev.filter(s => s.id !== song.id) : [...prev, song];
    });
  }, [setFavorites]);

  const isFavorite = useCallback((songId) => {
    return favorites.some(s => s.id === songId);
  }, [favorites]);

  const onPlayerReady = useCallback((event) => {
    playerRef.current = event.target;
    event.target.setVolume(state.volume);
    if (state.isPlaying) {
      event.target.playVideo();
    }
  }, [state.volume, state.isPlaying]);

  const onPlayerStateChange = useCallback((event) => {
    // YT.PlayerState: ENDED=0, PLAYING=1, PAUSED=2
    if (event.data === 0) {
      // Song ended
      if (state.repeat) {
        playerRef.current?.seekTo(0, true);
        playerRef.current?.playVideo();
      } else {
        playNext();
      }
    } else if (event.data === 1) {
      dispatch({ type: 'SET_PLAYING', value: true });
    } else if (event.data === 2) {
      dispatch({ type: 'SET_PLAYING', value: false });
    }
  }, [state.repeat, playNext]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (state.isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    dispatch({ type: 'TOGGLE_PLAY' });
  }, [state.isPlaying]);

  const value = {
    ...state,
    playerRef,
    favorites,
    recentlyPlayed,
    filteredPlaylist: getFilteredPlaylist(),
    playSong,
    playNext,
    playPrev,
    togglePlay,
    seek,
    setVolume,
    toggleFavorite,
    isFavorite,
    onPlayerReady,
    onPlayerStateChange,
    dispatch,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusicContext = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusicContext must be inside MusicProvider');
  return ctx;
};
