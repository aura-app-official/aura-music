// services/data.service.js — AURA Music | Guaranteed Data Layer
// ─────────────────────────────────────────────────────────────────────────────
// CONTRACTS:
//   1. Every load function ALWAYS dispatches result OR error — never hangs.
//   2. Deduplication: parallel calls for same resource share one promise.
//   3. No UI logic here. No DOM. Only store.dispatch and api calls.
// ─────────────────────────────────────────────────────────────────────────────

import { dispatch } from '../store.js';
import {
  getTrendingTracks,
  getHomeSections,
  searchTracks,
} from '../api.js';
import { ACTION, ERROR_MSG } from '../constants.js';

// ─── Inflight deduplicator ────────────────────────────────────────────────────

const _inflight = new Map();

function dedup(key, factory) {
  if (_inflight.has(key)) return _inflight.get(key);
  const promise = factory().finally(() => _inflight.delete(key));
  _inflight.set(key, promise);
  return promise;
}

// ─── Home ─────────────────────────────────────────────────────────────────────

/**
 * Load all home screen data. GUARANTEES store is updated on success or failure.
 * @returns {Promise<void>}
 */
export function loadHomeData() {
  return dedup('home', async () => {
    dispatch({ type: ACTION.SET_LOADING, payload: true });
    dispatch({ type: ACTION.SET_ERROR,   payload: null });

    try {
      const [trendingResult, sectionsResult] = await Promise.allSettled([
        getTrendingTracks(12),
        getHomeSections(),
      ]);

      const trending = trendingResult.status === 'fulfilled' ? trendingResult.value : [];
      const sections = sectionsResult.status === 'fulfilled' ? sectionsResult.value : [];

      dispatch({ type: ACTION.SET_FEATURED_TRACKS, payload: trending });
      dispatch({ type: ACTION.SET_HOME_SECTIONS,   payload: sections });

      if (!trending.length && !sections.length) {
        dispatch({ type: ACTION.SET_ERROR, payload: ERROR_MSG.NETWORK });
      }

      if (trendingResult.status === 'rejected') {
        console.warn('[DataService] Trending failed:', trendingResult.reason?.message);
      }
      if (sectionsResult.status === 'rejected') {
        console.warn('[DataService] Sections failed:', sectionsResult.reason?.message);
      }
    } catch (err) {
      console.error('[DataService] Home load catastrophic failure:', err);
      dispatch({ type: ACTION.SET_ERROR, payload: ERROR_MSG.NETWORK });
    } finally {
      dispatch({ type: ACTION.SET_LOADING, payload: false });
    }
  });
}

/**
 * Force refresh (bypass dedup).
 */
export function refreshHomeData() {
  _inflight.delete('home');
  return loadHomeData();
}

// ─── Search ───────────────────────────────────────────────────────────────────

/**
 * Execute search with full lifecycle management.
 * @param {string} query
 * @returns {Promise<Track[]>}
 */
export async function executeSearch(query) {
  const trimmed = query?.trim() ?? '';
  if (trimmed.length < 2) {
    dispatch({ type: ACTION.SET_SEARCH_RESULTS, payload: [] });
    return [];
  }

  const key = `search:${trimmed.toLowerCase()}`;

  return dedup(key, async () => {
    dispatch({ type: ACTION.SET_SEARCHING, payload: true });
    try {
      const results = await searchTracks(trimmed, { limit: 30 });
      dispatch({ type: ACTION.SET_SEARCH_RESULTS, payload: results });
      return results;
    } catch (err) {
      dispatch({ type: ACTION.SET_SEARCH_RESULTS, payload: [] });
      dispatch({
        type: ACTION.SHOW_TOAST,
        payload: { message: err.message || ERROR_MSG.NETWORK, type: 'error' }
      });
      return [];
    } finally {
      dispatch({ type: ACTION.SET_SEARCHING, payload: false });
    }
  });
}
