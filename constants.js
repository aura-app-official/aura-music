// constants.js - Конфигурация AURA Music (Файл №3)
export const CONFIG = {
  // 🎵 API ключи и URL
  JAMENDO_API: 'https://api.jamendo.com/v3.0',
  JAMENDO_CLIENT_ID: '56d30cce',
  
  // 🌊 Vibe теги по уровням энергии (0-100%)
  VIBE_TAGS: {
    0: ['lofi', 'chill', 'ambient', 'relax', 'dreamy'],
    25: ['acoustic', 'indie', 'folk', 'soft', 'ballad'],
    50: ['pop', 'rock', 'alternative', 'indie', 'rnb'],
    75: ['dance', 'house', 'electronic', 'funk', 'disco'],
    100: ['techno', 'phonk', 'edm', 'hardstyle', 'trance']
  },
  
  // 🔊 Аудио настройки
  AUDIO_CONFIG: {
    PRELOAD: 'metadata',
    VOLUME_DEFAULT: 0.8,
    CROSS_ORIGIN: 'anonymous',
    LOOP: false
  },
  
  // 💾 LocalStorage ключи
  STORAGE_KEYS: {
    LIKED_TRACKS: 'aura_music_liked',
    RECENT_TRACKS: 'aura_music_recent', 
    PLAYER_STATE: 'aura_music_player',
    VIBE_LEVEL: 'aura_music_vibe',
    PRO_STATUS: 'aura_music_pro',
    USER_SETTINGS: 'aura_music_settings'
  },
  
  // ⚡ UI/UX тайминги (мс)
  UI_TIMINGS: {
    DEBOUNCE_SEARCH: 300,
    SKELETON_SHOW: 1500,
    TRANSITION_FAST: 160,
    TRANSITION_SMOOTH: 280,
    ANIMATION_STAGGER: 100
  }
};

// 📱 Навигация (вьюхи)
export const VIEWS = {
  HOME: 'home',
  SEARCH: 'search',
  LIBRARY: 'library'
};

// 🎪 События приложения
export const EVENTS = {
  TRACK_PLAY: 'aura:track:play',
  TRACK_PAUSE: 'aura:track:pause',
  TRACK_LIKE: 'aura:track:like',
  VIBE_CHANGE: 'aura:vibe:change',
  VIEW_SWITCH: 'aura:view:switch',
  PLAYER_EXPAND: 'aura:player:expand'
};

// 🎵 Fallback треки (если Jamendo не работает)
export const FALLBACK_TRACKS = [
  {
    id: 'fallback_1',
    title: 'Deep Space',
    artist: 'Lunar Echoes', 
    duration: 234,
    artwork: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    tags: ['ambient', 'chill']
  },
  {
    id: 'fallback_2',
    title: 'Night Drift',
    artist: 'Cosmic Waves',
    duration: 198,
    artwork: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300',
    audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    tags: ['chill', 'dreamy']
  }
];
