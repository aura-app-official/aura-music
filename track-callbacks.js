// ui/track-callbacks.js — AURA Music | Shared Track Interaction Callbacks
// Single source of truth for what happens when a user interacts with any track card.
// Used by: home.screen, search.screen, library.screen.

import { dispatch, getState } from '../store.js';
import audioPlayer from '../player.js';
import { showTrackOptionsModal } from '../components/modal.js';
import { showToast } from './toast.js';
import { logPlayEvent } from '../api.js';
import { truncate, haptic } from '../utils.js';
import { ACTION, SCREEN, HAPTIC } from '../constants.js';

/**
 * Factory — returns a fresh callbacks object for one render cycle.
 * @returns {TrackCallbacks}
 */
export function getTrackCallbacks() {
  return {
    onPlay(track) {
      const { featuredTracks, searchResults, library } = getState();
      // Active queue priority: search > featured > library
      const queue = searchResults.length
        ? searchResults
        : featuredTracks.length
        ? featuredTracks
        : library;
      const idx = Math.max(0, queue.findIndex(t => t.id === track.id));
      audioPlayer.play(track, queue, idx);
      logPlayEvent(track);
    },

    onLike(track) {
      const { likedTrackIds } = getState();
      haptic(likedTrackIds.has(track.id) ? HAPTIC.LIGHT : HAPTIC.SUCCESS);
      dispatch({ type: ACTION.TOGGLE_LIKED, payload: { trackId: track.id, track } });
    },

    onAddToQueue(track) {
      audioPlayer.addToQueueNext(track);
      showToast(`"${truncate(track.name, 22)}" added to queue`, 'success');
    },

    onMoreOptions(track) {
      showTrackOptionsModal(track, {
        onAddToQueue(t) {
          audioPlayer.addToQueueNext(t);
          showToast(`"${truncate(t.name, 22)}" added to queue`, 'success');
        },
        onAddToLibrary(t) {
          dispatch({ type: ACTION.ADD_TO_LIBRARY, payload: t });
          showToast('Saved to library', 'success');
        },
        onViewArtist(t) {
          dispatch({ type: ACTION.SET_SEARCH_QUERY, payload: t.artist_name });
          dispatch({ type: ACTION.SET_SCREEN, payload: SCREEN.SEARCH });
          setTimeout(() => {
            const input = document.getElementById('search-input');
            if (input) {
              input.value = t.artist_name;
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }, 180);
        },
      });
    },
  };
}
