// ui/theme.js — AURA Music | Dynamic Theme Engine
// Extracts dominant colors from album art → transitions CSS variables on :root.
// Isolated: no DOM except documentElement CSS vars.

import { dispatch } from '../store.js';
import { extractColors } from '../utils.js';
import { transitionGradient } from '../animations.js';
import { ACTION, ANIM } from '../constants.js';

let _lastImageUrl = '';
let _currentPalette = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  accent: '#e94560',
};

/**
 * Update app theme from a track's album art URL.
 * No-op if URL hasn't changed. Gracefully degrades on CORS or canvas errors.
 * @param {Track} track
 */
export async function updateThemeFromTrack(track) {
  if (!track?.image || track.image === _lastImageUrl) return;
  _lastImageUrl = track.image;

  try {
    const palette = await extractColors(track.image);
    if (!palette?.primary) return;

    dispatch({ type: ACTION.SET_DOMINANT_COLOR, payload: palette });

    transitionGradient(
      document.documentElement,
      _currentPalette,
      palette,
      ANIM.COLOR_TRANSITION
    );

    _currentPalette = { ...palette };
  } catch {
    // Non-fatal — keep previous theme
  }
}

/**
 * Reset to default dark theme.
 */
export function resetTheme() {
  const defaults = { primary: '#1a1a2e', secondary: '#16213e', accent: '#e94560' };
  transitionGradient(document.documentElement, _currentPalette, defaults, ANIM.COLOR_TRANSITION);
  _currentPalette = { ...defaults };
  _lastImageUrl = '';
}
