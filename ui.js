// ui.js — AURA Music | UI Orchestrator (thin coordinator)
// Initialises all UI sub-modules in correct order.
// Exports only what app.js needs.

import { initNavigation }    from './ui/navigation.js';
import { initMiniPlayer }    from './ui/player/mini-player.js';
import { initFullPlayer, expandPlayer, collapsePlayer } from './ui/player/full-player.js';
import { initHomeScreen }    from './ui/screens/home.screen.js';
import { initSearchScreen, focusSearchInput } from './ui/screens/search.screen.js';
import { initLibraryScreen, renderLibrary } from './ui/screens/library.screen.js';
import { initToast, showToast } from './ui/toast.js';
import { select, selectors } from './store.js';
import { updateThemeFromTrack } from './ui/theme.js';
import { syncActiveTrackCards, syncLikeStates } from './ui/sync.js';

// ─── Entry point ──────────────────────────────────────────────────────────────

export function initUI() {
  // 1. Navigation first — establishes which screen is visible
  initNavigation({
    onSearchShow:  focusSearchInput,
    onLibraryShow: renderLibrary,
  });

  // 2. Players
  initMiniPlayer({ onExpand: expandPlayer });
  initFullPlayer();

  // 3. Screen controllers (bind their own store subscriptions)
  initHomeScreen();
  initSearchScreen();
  initLibraryScreen();

  // 4. Global singletons
  initToast();

  // 5. Global reactions: theme + card sync
  select(selectors.currentTrack, (track) => {
    syncActiveTrackCards(track?.id);
    if (track) updateThemeFromTrack(track);
  });

  select(selectors.likedTrackIds, () => syncLikeStates());
}

// ─── Re-exports for app.js ────────────────────────────────────────────────────
export { expandPlayer, collapsePlayer, showToast };
