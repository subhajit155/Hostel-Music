import React, { createContext, useContext, useReducer, useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { SONGS, getThumbnail } from '../data/songs';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useRemoteControl } from '../hooks/useRemoteControl';

// ── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  currentSong: SONGS[0],
  isPlaying: false,
  volume: 80,
  progress: 0,       // 0-100
  duration: 0,       // seconds
  currentTime: 0,    // seconds
  shuffle: false,
  repeat: false,     // 'none' | 'one'
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
  const playNextRef = useRef(null);
  const playPrevRef = useRef(null);
  const silentAudioRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const sleepIntervalRef = useRef(null);

  const [favorites, setFavorites] = useLocalStorage('tdm_favorites', []);
  const [recentlyPlayed, setRecentlyPlayed] = useLocalStorage('tdm_recent', []);
  const [queue, setQueue] = useState([]);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [partyMode, setPartyMode] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null);
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState(null);
  const [liveReactions, setLiveReactions] = useState([]);
  const [djShoutout, setDjShoutout] = useState(null);

  // ── Background Audio Keep-Alive for Screen Off / Lock Screen ──────────────
  useEffect(() => {
    const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
    silentAudio.loop = true;
    silentAudioRef.current = silentAudio;

    return () => {
      silentAudio.pause();
    };
  }, []);

  useEffect(() => {
    if (state.isPlaying) {
      silentAudioRef.current?.play().catch(() => {});
    } else {
      silentAudioRef.current?.pause();
    }
  }, [state.isPlaying]);

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
    if (playerRef.current) {
      playerRef.current.loadVideoById(song.youtubeId);
      try {
        playerRef.current.setPlaybackRate(playbackRate);
      } catch {
        /* ignore */
      }
    }
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 20);
    });
  }, [setRecentlyPlayed, playbackRate]);

  const playNext = useCallback(() => {
    // If there is an item in the queue, play it first!
    if (queue.length > 0) {
      const [nextQueued, ...remainingQueue] = queue;
      setQueue(remainingQueue);
      playSong(nextQueued);
      return;
    }

    const list = getFilteredPlaylist();
    if (!list.length) return;
    let idx = getCurrentIndex();
    if (state.shuffle) {
      idx = Math.floor(Math.random() * list.length);
    } else {
      idx = (idx + 1) % list.length;
    }
    playSong(list[idx]);
  }, [queue, getFilteredPlaylist, getCurrentIndex, state.shuffle, playSong]);

  const playPrev = useCallback(() => {
    const list = getFilteredPlaylist();
    if (!list.length) return;
    let idx = getCurrentIndex();
    idx = (idx - 1 + list.length) % list.length;
    playSong(list[idx]);
  }, [getFilteredPlaylist, getCurrentIndex, playSong]);

  useEffect(() => {
    playNextRef.current = playNext;
    playPrevRef.current = playPrev;
  }, [playNext, playPrev]);

  // ── Media Session API ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!('mediaSession' in navigator) || !state.currentSong) return;

    const song = state.currentSong;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: 'Hostel Music',
      artwork: [
        { src: getThumbnail(song.youtubeId), sizes: '512x512', type: 'image/jpeg' },
      ],
    });

    navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
  }, [state.currentSong, state.isPlaying]);

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

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => togglePlay());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNextRef.current?.());
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrevRef.current?.());
    } catch {
      /* mediaSession action unsupported */
    }

    return () => {
      try {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
      } catch {
        /* cleanup */
      }
    };
  }, [togglePlay]);

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

  const changePlaybackRate = useCallback((rate) => {
    setPlaybackRate(rate);
    try {
      playerRef.current?.setPlaybackRate(rate);
    } catch {
      /* ignore */
    }
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

  // ── Sleep Timer ────────────────────────────────────────────────────────────
  const handleSetSleepTimer = useCallback((minutes) => {
    clearTimeout(sleepTimerRef.current);
    clearInterval(sleepIntervalRef.current);

    if (!minutes || minutes <= 0) {
      setSleepTimerMinutes(null);
      setSleepTimerSecondsLeft(null);
      return;
    }

    setSleepTimerMinutes(minutes);
    let seconds = minutes * 60;
    setSleepTimerSecondsLeft(seconds);

    sleepIntervalRef.current = setInterval(() => {
      seconds -= 1;
      setSleepTimerSecondsLeft(seconds);
      if (seconds <= 0) {
        clearInterval(sleepIntervalRef.current);
      }
    }, 1000);

    sleepTimerRef.current = setTimeout(() => {
      if (playerRef.current) {
        playerRef.current.pauseVideo();
        dispatch({ type: 'SET_PLAYING', value: false });
      }
      setSleepTimerMinutes(null);
      setSleepTimerSecondsLeft(null);
    }, minutes * 60 * 1000);
  }, []);

  // ── Live Floating Reaction Emojis & DJ Shoutouts ───────────────────────────
  const triggerReaction = useCallback((emoji) => {
    const reactionId = `react-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const xPos = Math.floor(10 + Math.random() * 80); // random percent across screen
    setLiveReactions(prev => [...prev, { id: reactionId, emoji, x: xPos }]);

    setTimeout(() => {
      setLiveReactions(prev => prev.filter(r => r.id !== reactionId));
    }, 3000);
  }, []);

  const triggerShoutout = useCallback((message) => {
    if (!message || !message.trim()) return;
    const shoutoutObj = {
      id: `shout-${Date.now()}`,
      message: message.trim(),
      timestamp: Date.now(),
    };
    setDjShoutout(shoutoutObj);

    setTimeout(() => {
      setDjShoutout(prev => (prev?.id === shoutoutObj.id ? null : prev));
    }, 6000);
  }, []);

  const onPlayerReady = useCallback((event) => {
    playerRef.current = event.target;
    event.target.setVolume(state.volume);
    try {
      event.target.setPlaybackRate(playbackRate);
    } catch {
      /* ignore */
    }
    if (state.isPlaying) {
      event.target.playVideo();
    }
  }, [state.volume, state.isPlaying, playbackRate]);

  const onPlayerStateChange = useCallback((event) => {
    if (event.data === 0) {
      if (state.repeat) {
        playerRef.current?.seekTo(0, true);
        playerRef.current?.playVideo();
      } else {
        playNextRef.current?.();
      }
    } else if (event.data === 1) {
      dispatch({ type: 'SET_PLAYING', value: true });
    } else if (event.data === 2) {
      dispatch({ type: 'SET_PLAYING', value: false });
    }
  }, [state.repeat]);

  // ── Remote Control Sync (Host Mode) ───────────────────────────────────────
  const hostStateSnapshot = useMemo(() => ({
    currentSong: state.currentSong,
    isPlaying: state.isPlaying,
    volume: state.volume,
    progress: state.progress,
    currentTime: state.currentTime,
    duration: state.duration,
    shuffle: state.shuffle,
    repeat: state.repeat,
    selectedCategory: state.selectedCategory,
    searchQuery: state.searchQuery,
    playbackRate,
    cinemaMode,
    partyMode,
    sleepTimerMinutes,
    sleepTimerSecondsLeft,
    queue,
    favorites,
    recentlyPlayed,
  }), [
    state.currentSong,
    state.isPlaying,
    state.volume,
    state.progress,
    state.currentTime,
    state.duration,
    state.shuffle,
    state.repeat,
    state.selectedCategory,
    state.searchQuery,
    playbackRate,
    cinemaMode,
    partyMode,
    sleepTimerMinutes,
    sleepTimerSecondsLeft,
    queue,
    favorites,
    recentlyPlayed,
  ]);

  const handleRemoteCommand = useCallback((cmd) => {
    if (!cmd || !cmd.type) return;

    switch (cmd.type) {
      case 'CMD_TOGGLE_PLAY':
        togglePlay();
        break;
      case 'CMD_PLAY':
        if (!state.isPlaying) togglePlay();
        break;
      case 'CMD_PAUSE':
        if (state.isPlaying) togglePlay();
        break;
      case 'CMD_NEXT':
        playNextRef.current?.();
        break;
      case 'CMD_PREV':
        playPrevRef.current?.();
        break;
      case 'CMD_SEEK':
        if (typeof cmd.percent === 'number') {
          seek(cmd.percent);
        }
        break;
      case 'CMD_SET_VOLUME':
        if (typeof cmd.volume === 'number') {
          setVolume(cmd.volume);
        }
        break;
      case 'CMD_SELECT_SONG': {
        const found = SONGS.find(s => s.id === cmd.songId);
        if (found) playSong(found);
        break;
      }
      case 'CMD_PLAY_CUSTOM_YT': {
        if (cmd.youtubeId) {
          const customSong = {
            id: `yt-${cmd.youtubeId}-${Date.now()}`,
            title: cmd.title || 'Custom Video Track',
            artist: cmd.artist || 'YouTube Stream',
            youtubeId: cmd.youtubeId,
            duration: cmd.duration || 240,
            category: 'all',
          };
          playSong(customSong);
        }
        break;
      }
      case 'CMD_TOGGLE_SHUFFLE':
        dispatch({ type: 'TOGGLE_SHUFFLE' });
        break;
      case 'CMD_TOGGLE_REPEAT':
        dispatch({ type: 'TOGGLE_REPEAT' });
        break;
      case 'CMD_SET_CATEGORY':
        if (typeof cmd.category === 'string') {
          dispatch({ type: 'SET_CATEGORY', value: cmd.category });
        }
        break;
      case 'CMD_SET_SEARCH':
        if (typeof cmd.query === 'string') {
          dispatch({ type: 'SET_SEARCH', value: cmd.query });
        }
        break;
      case 'CMD_SET_SPEED':
        if (typeof cmd.rate === 'number') {
          changePlaybackRate(cmd.rate);
        }
        break;
      case 'CMD_SET_CINEMA_MODE':
        setCinemaMode(typeof cmd.value === 'boolean' ? cmd.value : prev => !prev);
        break;
      case 'CMD_SET_PARTY_MODE':
        setPartyMode(typeof cmd.value === 'boolean' ? cmd.value : prev => !prev);
        break;
      case 'CMD_SET_SLEEP_TIMER':
        handleSetSleepTimer(cmd.minutes);
        break;
      case 'CMD_SEND_REACTION':
        if (cmd.emoji) {
          triggerReaction(cmd.emoji);
        }
        break;
      case 'CMD_SEND_SHOUTOUT':
        if (cmd.message) {
          triggerShoutout(cmd.message);
        }
        break;
      case 'CMD_SCROLL_LAPTOP':
        if (typeof window !== 'undefined') {
          if (cmd.target === 'player') {
            document.getElementById('player')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else if (cmd.target === 'playlist') {
            document.getElementById('playlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (cmd.target === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else if (cmd.target === 'bottom') {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
          }
        }
        break;
      case 'CMD_ADD_TO_QUEUE': {
        const found = SONGS.find(s => s.id === cmd.songId) || cmd.song;
        if (found) {
          setQueue(prev => [...prev, found]);
        }
        break;
      }
      case 'CMD_REMOVE_FROM_QUEUE':
        if (typeof cmd.index === 'number') {
          setQueue(prev => prev.filter((_, idx) => idx !== cmd.index));
        }
        break;
      case 'CMD_CLEAR_QUEUE':
        setQueue([]);
        break;
      case 'CMD_TOGGLE_FAVORITE': {
        const target = SONGS.find(s => s.id === cmd.songId);
        if (target) toggleFavorite(target);
        break;
      }
      default:
        break;
    }
  }, [
    togglePlay,
    state.isPlaying,
    seek,
    setVolume,
    playSong,
    changePlaybackRate,
    handleSetSleepTimer,
    triggerReaction,
    triggerShoutout,
    toggleFavorite,
  ]);

  const hostRemote = useRemoteControl({
    isHost: true,
    onCommandReceived: handleRemoteCommand,
    currentState: hostStateSnapshot,
  });

  // Automatically start host peer listener on mount
  useEffect(() => {
    hostRemote.initHost();
  }, []);

  // Broadcast state updates to all connected phones
  useEffect(() => {
    hostRemote.broadcastState(hostStateSnapshot);
  }, [hostStateSnapshot, hostRemote.broadcastState]);

  const value = {
    ...state,
    playerRef,
    favorites,
    recentlyPlayed,
    queue,
    playbackRate,
    cinemaMode,
    partyMode,
    sleepTimerMinutes,
    sleepTimerSecondsLeft,
    liveReactions,
    djShoutout,
    filteredPlaylist: getFilteredPlaylist(),
    remoteControl: hostRemote,
    playSong,
    playNext,
    playPrev,
    togglePlay,
    seek,
    setVolume,
    setPlaybackRate: changePlaybackRate,
    setCinemaMode,
    setPartyMode,
    setSleepTimer: handleSetSleepTimer,
    triggerReaction,
    triggerShoutout,
    setQueue,
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
