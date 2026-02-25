// ui/screens/library.screen.js — AURA Music | Library Screen Controller

import { select, getState, selectors } from '../../store.js';
import { createTrackList } from '../../components/track-card.js';
import { getTrackCallbacks } from '../track-callbacks.js';
import { qs } from '../../utils.js';

const D = {};

export function initLibraryScreen() {
  D.screen = qs('#screen-library');
  D.list   = qs('#library-list');
  D.empty  = qs('#library-empty');

  if (!D.screen) return;

  // Reactively re-render when library changes
  select(selectors.library, () => renderLibrary());
}

export function renderLibrary() {
  if (!D.list) return;
  const { library, likedTrackIds, currentTrack } = getState();
  D.list.innerHTML = '';

  if (!library.length) {
    if (D.empty) D.empty.style.display = 'flex';
    return;
  }

  if (D.empty) D.empty.style.display = 'none';
  const list = createTrackList(library, getTrackCallbacks(), likedTrackIds, currentTrack?.id);
  D.list.appendChild(list);
}
