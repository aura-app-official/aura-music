// api.js — AURA Music | Jamendo API layer
// All network calls go through here. No UI or audio logic.

import {
  JAMENDO_CLIENT_ID,
  JAMENDO_BASE_URL,
  JAMENDO_ENDPOINTS,
  JAMENDO_DEFAULT_PARAMS,
  FEATURED_TAGS,
  CACHE,
  ERROR_MSG,
} from './constants.js';
import { memoryCache, fetchWithRetry, debounce, randomInt } from './utils.js';

// ─── URL Builder ──────────────────────────────────────────────────────────────

function buildUrl(endpoint, params = {}) {
  const url = new URL(JAMENDO_BASE_URL + endpoint);
  const merged = {
    ...JAMENDO_DEFAULT_PARAMS,
    client_id: JAMENDO_CLIENT_ID,
    ...params,
  };
  for (const [key, val] of Object.entries(merged)) {
    if (val !== undefined && val !== null) {
      url.searchParams.set(key, String(val));
    }
  }
  return url.toString();
}

// ─── Response Parser ──────────────────────────────────────────────────────────

function parseTracks(results = []) {
  return results.map(track => ({
    id: String(track.id),
    name: track.name || 'Unknown Track',
    artist_name: track.artist_name || 'Unknown Artist',
    album_name: track.album_name || '',
    album_id: String(track.album_id || ''),
    artist_id: String(track.artist_id || ''),
    duration: Number(track.duration) || 0,
    image: track.image || track.album_image || generatePlaceholderImage(track.name),
    audio: track.audio || '',
    audiodownload: track.audiodownload || track.audio || '',
    shareurl: track.shareurl || '',
    tags: track.musicinfo?.tags?.genres || [],
    vocalinstrumental: track.musicinfo?.vocalinstrumental || 'instrumental',
    gender: track.musicinfo?.gender || '',
    speed: track.musicinfo?.speed || '',
    // Normalised play count for display
    playcount: Number(track.stats?.rate_love_total || 0),
    license_ccurl: track.license_ccurl || '',
  }));
}

function generatePlaceholderImage(name = '') {
  // Deterministic color from name hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `https://via.placeholder.com/500/${hslToHex(hue, 65, 45).slice(1)}/ffffff?text=${encodeURIComponent(name.slice(0, 2).toUpperCase())}`;
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => { const k = (n + h / 30) % 12; const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); return Math.round(255 * c).toString(16).padStart(2, '0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// ─── Core API Methods ─────────────────────────────────────────────────────────

/**
 * Search tracks by query string.
 * @param {string} query
 * @param {object} options
 * @returns {Promise<Track[]>}
 */
export async function searchTracks(query, options = {}) {
  if (!query || query.trim().length < 2) return [];

  const cacheKey = `search_${query.toLowerCase().trim()}_${JSON.stringify(options)}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  const url = buildUrl(JAMENDO_ENDPOINTS.SEARCH, {
    search: query.trim(),
    limit: options.limit || 20,
    offset: options.offset || 0,
    orderby: options.orderby || 'relevance',
    fuzzytags: 1,
    ...options,
  });

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    if (data.headers?.status === 'error') {
      throw new Error(data.headers.error_message || ERROR_MSG.GENERIC);
    }

    const tracks = parseTracks(data.results || []);
    memoryCache.set(cacheKey, tracks, CACHE.SEARCH_TTL_MS);
    return tracks;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error(ERROR_MSG.NETWORK);
    throw new Error(err.message || ERROR_MSG.GENERIC);
  }
}

/**
 * Debounced search — use this in UI event handlers.
 */
export const debouncedSearch = debounce(searchTracks, 380);

/**
 * Get featured/discovery tracks for the home screen.
 * Rotates through genres randomly for variety.
 * @param {object} options
 * @returns {Promise<Track[]>}
 */
export async function getFeaturedTracks(options = {}) {
  const tag = options.tag || FEATURED_TAGS[randomInt(0, FEATURED_TAGS.length - 1)];
  const cacheKey = `featured_${tag}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  const url = buildUrl(JAMENDO_ENDPOINTS.TRACKS, {
    tags: tag,
    limit: options.limit || 20,
    orderby: options.orderby || 'popularity_week',
    imagesize: 500,
  });

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    if (data.headers?.status === 'error') {
      throw new Error(data.headers.error_message || ERROR_MSG.GENERIC);
    }

    const tracks = parseTracks(data.results || []);
    memoryCache.set(cacheKey, tracks, CACHE.METADATA_TTL_MS);
    return tracks;
  } catch (err) {
    throw new Error(err.message || ERROR_MSG.GENERIC);
  }
}

/**
 * Get multiple genre sections for the home screen in parallel.
 * @returns {Promise<{ genre: string, tracks: Track[] }[]>}
 */
export async function getHomeSections() {
  const genres = ['lofi', 'ambient', 'electronic', 'jazz'];
  const cacheKey = 'home_sections';
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  const results = await Promise.allSettled(
    genres.map(tag => getFeaturedTracks({ tag, limit: 10 }).then(tracks => ({ genre: tag, tracks })))
  );

  const sections = results
    .filter(r => r.status === 'fulfilled' && r.value.tracks.length > 0)
    .map(r => r.value);

  memoryCache.set(cacheKey, sections, CACHE.METADATA_TTL_MS);
  return sections;
}

/**
 * Get a streamable audio URL for a track.
 * Jamendo provides direct URLs in track data; this resolves the best format.
 * @param {Track} track
 * @returns {string} - direct audio URL
 */
export function getTrackStreamUrl(track) {
  // Prefer direct audio URL from API response
  if (track.audio) return track.audio;

  // Fallback: construct stream URL
  return buildUrl(`${JAMENDO_ENDPOINTS.TRACKS}/${track.id}/file`, {
    audioformat: 'mp32',
    from: 'app-aura',
  });
}

/**
 * Get tracks by artist ID.
 * @param {string} artistId
 * @param {number} limit
 * @returns {Promise<Track[]>}
 */
export async function getArtistTracks(artistId, limit = 20) {
  const cacheKey = `artist_${artistId}_${limit}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  const url = buildUrl(JAMENDO_ENDPOINTS.TRACKS, {
    artist_id: artistId,
    limit,
    orderby: 'popularity_total',
  });

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();
    const tracks = parseTracks(data.results || []);
    memoryCache.set(cacheKey, tracks, CACHE.METADATA_TTL_MS);
    return tracks;
  } catch (err) {
    throw new Error(err.message || ERROR_MSG.GENERIC);
  }
}

/**
 * Get tracks from album.
 * @param {string} albumId
 * @returns {Promise<Track[]>}
 */
export async function getAlbumTracks(albumId) {
  const cacheKey = `album_${albumId}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  const url = buildUrl(JAMENDO_ENDPOINTS.TRACKS, {
    album_id: albumId,
    limit: 30,
    orderby: 'track_position',
  });

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();
    const tracks = parseTracks(data.results || []);
    memoryCache.set(cacheKey, tracks, CACHE.METADATA_TTL_MS);
    return tracks;
  } catch (err) {
    throw new Error(err.message || ERROR_MSG.GENERIC);
  }
}

/**
 * Get trending tracks globally (for "Trending" section)
 * @param {number} limit
 * @returns {Promise<Track[]>}
 */
export async function getTrendingTracks(limit = 20) {
  const cacheKey = `trending_${limit}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  const url = buildUrl(JAMENDO_ENDPOINTS.TRACKS, {
    limit,
    orderby: 'popularity_week',
    imagesize: 500,
  });

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();
    const tracks = parseTracks(data.results || []);
    memoryCache.set(cacheKey, tracks, CACHE.METADATA_TTL_MS);
    return tracks;
  } catch (err) {
    throw new Error(err.message || ERROR_MSG.GENERIC);
  }
}

/**
 * Get autocomplete suggestions.
 * @param {string} query
 * @returns {Promise<string[]>}
 */
export async function getAutocompleteSuggestions(query) {
  if (!query || query.length < 2) return [];
  const cacheKey = `autocomplete_${query}`;
  const cached = memoryCache.get(cacheKey);
  if (cached) return cached;

  const url = buildUrl(JAMENDO_ENDPOINTS.AUTOCOMPLETE, {
    prefix: query,
    entity: 'tag',
    limit: 8,
  });

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();
    const suggestions = (data.results || []).map(r => r.name || r).filter(Boolean);
    memoryCache.set(cacheKey, suggestions, CACHE.SEARCH_TTL_MS);
    return suggestions;
  } catch {
    return [];
  }
}

/**
 * Log a play event (for analytics — Jamendo listens).
 * Fire-and-forget, no await needed.
 * @param {Track} track
 */
export function logPlayEvent(track) {
  if (!track?.id) return;
  const url = buildUrl(`${JAMENDO_ENDPOINTS.TRACKS}/${track.id}/listen`, {});
  fetch(url, { method: 'GET', keepalive: true }).catch(() => {});
}
