// ui/navigation.js — AURA Music | Navigation Controller
// Owns: .nav DOM, screen visibility, active nav state.
// The ONLY place where screen show/hide logic lives.

import { select, dispatch, getState, selectors } from '../store.js';
import { qsa, qs, haptic } from '../utils.js';
import { ripple } from '../animations.js';
import { ACTION, SCREEN, HAPTIC } from '../constants.js';

// ─── State ────────────────────────────────────────────────────────────────────

const SCREENS = {};   // id → HTMLElement
const NAV_BTNS = [];
let _onLibraryShow = null;
let _onSearchShow  = null;

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initNavigation(options = {}) {
  _onLibraryShow = options.onLibraryShow;
  _onSearchShow  = options.onSearchShow;

  // Cache screen elements
  SCREENS[SCREEN.HOME]    = qs('#screen-home');
  SCREENS[SCREEN.SEARCH]  = qs('#screen-search');
  SCREENS[SCREEN.LIBRARY] = qs('#screen-library');

  // Nav buttons
  const btns = qsa('.nav__btn');
  NAV_BTNS.push(...btns);

  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const screen = btn.dataset.screen;
      if (!screen) return;
      haptic(HAPTIC.SELECT);
      ripple(btn, e, 'rgba(255,255,255,0.15)');
      dispatch({ type: ACTION.SET_SCREEN, payload: screen });
    });
  });

  // React to store screen changes
  select(selectors.screen, showScreen);

  // Show current screen immediately (don't wait for dispatch, store already has HOME)
  showScreen(getState().screen);
}

// ─── Public ───────────────────────────────────────────────────────────────────

export function showScreen(screen) {
  // Activate / deactivate screen elements
  Object.entries(SCREENS).forEach(([key, el]) => {
    if (!el) return;
    const active = key === screen;
    el.classList.toggle('screen--active', active);
    el.setAttribute('aria-hidden', String(!active));
  });

  // Update nav button active state
  NAV_BTNS.forEach(btn => {
    btn.classList.toggle('nav__btn--active', btn.dataset.screen === screen);
  });

  // Side-effects per screen
  if (screen === SCREEN.SEARCH) _onSearchShow?.();
  if (screen === SCREEN.LIBRARY) _onLibraryShow?.();
}
