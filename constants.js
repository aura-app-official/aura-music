// constants.js — AURA Music | All application-wide constants
// No imports. Pure data. Imported by everyone.

export const APP_NAME = 'AURA Music';
export const APP_VERSION = '1.0.0';

// ─── Jamendo API ────────────────────────────────────────────────────────────
export const JAMENDO_CLIENT_ID = '3a6b6b89'; // Public demo key — replace with your own
export const JAMENDO_BASE_URL = 'https://api.jamendo.com/v3.0';
export const JAMENDO_ENDPOINTS = {
  TRACKS: '/tracks',
  SEARCH: '/tracks',
  ALBUMS: '/albums',
  ARTISTS: '/artists',
  AUTOCOMPLETE: '/autocomplete',
};

export const JAMENDO_DEFAULT_PARAMS = {
  format: 'json',
  limit: 20,
  include: 'musicinfo',
  audioformat: 'mp32',
  imagesize: 500,
};

// ─── Debounce / Timing ───────────────────────────────────────────────────────
export const DEBOUNCE_SEARCH_MS = 380;
export const DEBOUNCE_RESIZE_MS = 120;
export const CROSSFADE_DURATION_S = 2.5;
export const SKIP_FORWARD_SEC = 10;
export const SKIP_BACKWARD_SEC = 10;

// ─── Spring Physics ──────────────────────────────────────────────────────────
// Inspired by react-spring / WWDC motion guidelines
export const SPRING_CONFIG = {
  // Default spring — snappy UI
  DEFAULT: { stiffness: 280, damping: 26, mass: 1 },
  // Gentle spring — player expand/collapse
  GENTLE: { stiffness: 180, damping: 22, mass: 1.1 },
  // Bouncy spring — like/add actions
  BOUNCY: { stiffness: 400, damping: 20, mass: 0.8 },
  // Slow cinematic — background color transitions
  CINEMATIC: { stiffness: 80, damping: 18, mass: 1.5 },
  // Wobbly — error shake
  WOBBLY: { stiffness: 500, damping: 15, mass: 0.9 },
};

// ─── Animation Durations (ms) ────────────────────────────────────────────────
export const ANIM = {
  PLAYER_EXPAND: 520,
  PLAYER_COLLAPSE: 420,
  TRACK_FADE_IN: 280,
  TRACK_STAGGER: 60,
  MODAL_OPEN: 380,
  MODAL_CLOSE: 300,
  COLOR_TRANSITION: 900,
  RIPPLE: 550,
  SKELETON_PULSE: 1400,
  HAPTIC_VISUAL_PULSE: 180,
  CROSSFADE_VISUAL: 600,
  TOAST_ENTER: 320,
  TOAST_EXIT: 260,
  TOAST_DURATION: 3000,
};

// ─── Color Extraction ────────────────────────────────────────────────────────
export const COLOR_EXTRACTION = {
  CANVAS_SIZE: 64,         // Downscale to 64x64 for speed
  SATURATION_WEIGHT: 1.8,  // Boost vibrant colors
  BRIGHTNESS_MIN: 40,      // Ignore near-black
  BRIGHTNESS_MAX: 220,     // Ignore near-white
  CLUSTER_COUNT: 5,        // K-means clusters
  DOMINANT_THRESHOLD: 0.15,
};

// ─── Player States ───────────────────────────────────────────────────────────
export const PLAYER_STATE = {
  IDLE: 'idle',
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  BUFFERING: 'buffering',
  ERROR: 'error',
  ENDED: 'ended',
};

// ─── Player Modes ────────────────────────────────────────────────────────────
export const REPEAT_MODE = {
  NONE: 'none',
  ALL: 'all',
  ONE: 'one',
};

// ─── UI States ───────────────────────────────────────────────────────────────
export const PLAYER_SIZE = {
  MINI: 'mini',
  FULL: 'full',
};

export const SCREEN = {
  HOME: 'home',
  SEARCH: 'search',
  LIBRARY: 'library',
  PROFILE: 'profile',
};

// ─── Store Action Types ──────────────────────────────────────────────────────
export const ACTION = {
  // Player
  SET_CURRENT_TRACK: 'SET_CURRENT_TRACK',
  SET_PLAYER_STATE: 'SET_PLAYER_STATE',
  SET_PROGRESS: 'SET_PROGRESS',
  SET_DURATION: 'SET_DURATION',
  SET_VOLUME: 'SET_VOLUME',
  SET_QUEUE: 'SET_QUEUE',
  SET_QUEUE_INDEX: 'SET_QUEUE_INDEX',
  SET_REPEAT_MODE: 'SET_REPEAT_MODE',
  TOGGLE_SHUFFLE: 'TOGGLE_SHUFFLE',
  SET_PLAYER_SIZE: 'SET_PLAYER_SIZE',
  SET_CROSSFADING: 'SET_CROSSFADING',

  // UI
  SET_SCREEN: 'SET_SCREEN',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  SET_FEATURED_TRACKS: 'SET_FEATURED_TRACKS',
  SET_HOME_SECTIONS: 'SET_HOME_SECTIONS',    // ← новый
  SET_LOADING: 'SET_LOADING',
  SET_SEARCHING: 'SET_SEARCHING',            // ← новый
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_DOMINANT_COLOR: 'SET_DOMINANT_COLOR',
  TOGGLE_LIKED: 'TOGGLE_LIKED',
  ADD_TO_LIBRARY: 'ADD_TO_LIBRARY',
  REMOVE_FROM_LIBRARY: 'REMOVE_FROM_LIBRARY',
  SHOW_TOAST: 'SHOW_TOAST',
  HIDE_TOAST: 'HIDE_TOAST',

  // Pro
  SET_PRO_STATUS: 'SET_PRO_STATUS',
  SET_PRO_LOADING: 'SET_PRO_LOADING',
};

// ─── Pro / Monetization ──────────────────────────────────────────────────────
export const PRO = {
  PRICE_USD: 2.99,
  PRICE_TON: 0.5,
  PRICE_STARS: 150,
  FEATURES: [
    'Unlimited skips',
    'Lossless audio (FLAC)',
    'Offline downloads',
    'No ads',
    'Equalizer',
    'Crossfade control',
    'Discord Rich Presence',
  ],
  CRYPTOBOT_URL: 'https://t.me/CryptoBot',
  BOT_USERNAME: '@AuraMusicBot', // replace with your bot
};

// ─── Haptic Patterns ─────────────────────────────────────────────────────────
export const HAPTIC = {
  LIGHT: 'light',
  MEDIUM: 'medium',
  HEAVY: 'heavy',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  SELECT: 'selection_change',
};

// ─── Cache ───────────────────────────────────────────────────────────────────
export const CACHE = {
  METADATA_TTL_MS: 5 * 60 * 1000,   // 5 minutes
  SEARCH_TTL_MS: 2 * 60 * 1000,     // 2 minutes
  COLOR_TTL_MS: 30 * 60 * 1000,     // 30 minutes
  MAX_ENTRIES: 200,
};

// ─── localStorage keys ───────────────────────────────────────────────────────
export const STORAGE_KEY = {
  LIBRARY: 'aura_library',
  LIKED: 'aura_liked',
  VOLUME: 'aura_volume',
  REPEAT: 'aura_repeat',
  SHUFFLE: 'aura_shuffle',
  PRO: 'aura_pro',
  RECENT: 'aura_recent',
  THEME: 'aura_theme',
};

// ─── Gradients (fallback before color extraction) ────────────────────────────
export const DEFAULT_GRADIENT = {
  from: '#1a1a2e',
  via: '#16213e',
  to: '#0f3460',
};

export const ACCENT_COLOR = '#e94560';

// ─── Typography Scale ─────────────────────────────────────────────────────────
export const FONT = {
  DISPLAY: "'Clash Display', 'DM Sans', sans-serif",
  BODY: "'DM Sans', 'Inter', sans-serif",
  MONO: "'JetBrains Mono', monospace",
};

// ─── Z-index Layers ───────────────────────────────────────────────────────────
export const Z = {
  BACKGROUND: 0,
  CONTENT: 10,
  MINI_PLAYER: 100,
  FULL_PLAYER: 200,
  MODAL: 300,
  TOAST: 400,
  OVERLAY: 500,
};

// ─── Breakpoints ──────────────────────────────────────────────────────────────
export const BP = {
  SM: 375,
  MD: 768,
  LG: 1024,
};

// ─── Error Messages ───────────────────────────────────────────────────────────
export const ERROR_MSG = {
  NETWORK: 'Network error. Check your connection.',
  API_LIMIT: 'API limit reached. Please try again later.',
  NOT_FOUND: 'No tracks found for your search.',
  PLAYBACK: 'Playback error. Skipping to next track.',
  PRO_REQUIRED: 'This feature requires AURA Pro.',
  GENERIC: 'Something went wrong. Please try again.',
};

// ─── Featured Genres (home screen discovery) ─────────────────────────────────
export const FEATURED_TAGS = [
  'lofi', 'ambient', 'electronic', 'jazz', 'classical',
  'hiphop', 'pop', 'rock', 'acoustic', 'chillout',
];

// ─── Audio constraints ────────────────────────────────────────────────────────
export const AUDIO = {
  DEFAULT_VOLUME: 0.85,
  FADE_STEP: 0.05,
  FADE_INTERVAL_MS: 50,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1500,
  PRELOAD_NEXT_AT_PERCENT: 0.85, // Preload next track when 85% through
};
