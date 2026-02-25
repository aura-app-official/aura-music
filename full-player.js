// ui/player/full-player.js — AURA Music | Full Player Controller
// Spring physics expand/collapse, swipe gesture, all playback controls.

import { select, dispatch, getState, selectors } from '../../store.js';
import audioPlayer from '../../player.js';
import { showProModal } from '../../components/modal.js';
import {
  springExpandPlayer,
  springCollapsePlayer,
  setAlbumArtRotation,
} from '../../animations.js';
import { qs, formatTime, truncate, haptic } from '../../utils.js';
import {
  ACTION, PLAYER_STATE, PLAYER_SIZE, REPEAT_MODE, HAPTIC,
} from '../../constants.js';

const D = {};

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initFullPlayer() {
  D.player       = qs('#full-player');
  D.cover        = qs('#full-cover');
  D.title        = qs('#full-title');
  D.artist       = qs('#full-artist');
  D.album        = qs('#full-album');
  D.playBtn      = qs('#full-play-btn');
  D.prevBtn      = qs('#full-prev-btn');
  D.nextBtn      = qs('#full-next-btn');
  D.shuffleBtn   = qs('#full-shuffle-btn');
  D.repeatBtn    = qs('#full-repeat-btn');
  D.likeBtn      = qs('#full-like-btn');
  D.progressBar  = qs('#full-progress-bar');
  D.progressFill = qs('#full-progress-fill');
  D.currentTime  = qs('#full-current-time');
  D.durationEl   = qs('#full-duration');
  D.volumeSlider = qs('#full-volume');
  D.collapseBtn  = qs('#full-collapse-btn');
  D.proBtn       = qs('#full-pro-btn');

  if (!D.player) return;

  _bindEvents();
  _subscribeToStore();
}

// ─── Public: Expand / Collapse ────────────────────────────────────────────────

export function expandPlayer() {
  if (!D.player) return;
  dispatch({ type: ACTION.SET_PLAYER_SIZE, payload: PLAYER_SIZE.FULL });
  D.player.style.display = 'flex';
  D.player.style.pointerEvents = 'auto';
  springExpandPlayer(D.player);
  haptic(HAPTIC.LIGHT);
}

export function collapsePlayer() {
  if (!D.player) return;
  dispatch({ type: ACTION.SET_PLAYER_SIZE, payload: PLAYER_SIZE.MINI });
  const anim = springCollapsePlayer(D.player);
  anim?.addEventListener('finish', () => {
    D.player.style.display = 'none';
    D.player.style.transform = '';
  });
  haptic(HAPTIC.LIGHT);
}

// ─── Events ───────────────────────────────────────────────────────────────────

function _bindEvents() {
  D.collapseBtn?.addEventListener('click', () => { haptic(HAPTIC.LIGHT); collapsePlayer(); });

  // Swipe-down to close (spring rubber-band)
  let startY = 0;
  D.player.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
  D.player.addEventListener('touchmove', e => {
    const delta = e.touches[0].clientY - startY;
    if (delta > 0 && delta < 300) {
      D.player.style.transform = `translateY(${Math.pow(delta, 0.8)}px)`;
    }
  }, { passive: true });
  D.player.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientY - startY;
    if (delta > 80) {
      collapsePlayer();
    } else {
      D.player.animate(
        [{ transform: D.player.style.transform }, { transform: 'translateY(0)' }],
        { duration: 340, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
      );
    }
  });

  D.playBtn?.addEventListener('click', () => { haptic(HAPTIC.MEDIUM); audioPlayer.toggle(); });
  D.prevBtn?.addEventListener('click', () => { haptic(HAPTIC.MEDIUM); audioPlayer.prev(); });
  D.nextBtn?.addEventListener('click', () => { haptic(HAPTIC.MEDIUM); audioPlayer.next(); });

  // Seek — click
  D.progressBar?.addEventListener('click', e => {
    const rect = D.progressBar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioPlayer.seek(pct * getState().duration);
    haptic(HAPTIC.SELECT);
  });

  // Seek — touch scrub
  let scrubbing = false;
  D.progressBar?.addEventListener('touchstart', () => { scrubbing = true; }, { passive: true });
  D.progressBar?.addEventListener('touchmove', e => {
    if (!scrubbing) return;
    const rect = D.progressBar.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.touches[0].clientX - rect.left) / rect.width));
    if (D.progressFill) D.progressFill.style.width = `${pct * 100}%`;
    if (D.currentTime)  D.currentTime.textContent  = formatTime(pct * getState().duration);
  }, { passive: true });
  D.progressBar?.addEventListener('touchend', e => {
    if (!scrubbing) return;
    scrubbing = false;
    const rect = D.progressBar.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.changedTouches[0].clientX - rect.left) / rect.width));
    audioPlayer.seek(pct * getState().duration);
    haptic(HAPTIC.SELECT);
  });

  D.volumeSlider?.addEventListener('input', e => audioPlayer.setVolume(parseFloat(e.target.value)));

  D.shuffleBtn?.addEventListener('click', () => {
    haptic(HAPTIC.MEDIUM);
    dispatch({ type: ACTION.TOGGLE_SHUFFLE });
  });

  D.repeatBtn?.addEventListener('click', () => {
    haptic(HAPTIC.MEDIUM);
    const modes = [REPEAT_MODE.NONE, REPEAT_MODE.ALL, REPEAT_MODE.ONE];
    const curr = getState().repeatMode;
    dispatch({ type: ACTION.SET_REPEAT_MODE, payload: modes[(modes.indexOf(curr) + 1) % modes.length] });
  });

  D.likeBtn?.addEventListener('click', () => {
    const { currentTrack, likedTrackIds } = getState();
    if (!currentTrack) return;
    haptic(likedTrackIds.has(currentTrack.id) ? HAPTIC.LIGHT : HAPTIC.SUCCESS);
    dispatch({ type: ACTION.TOGGLE_LIKED, payload: { trackId: currentTrack.id, track: currentTrack } });
  });

  D.proBtn?.addEventListener('click', () => {
    haptic(HAPTIC.MEDIUM);
    showProModal({ onPurchaseComplete: () => dispatch({ type: ACTION.SET_PRO_STATUS, payload: true }) });
  });
}

// ─── Store subscriptions ──────────────────────────────────────────────────────

function _subscribeToStore() {
  select(selectors.currentTrack, track => {
    if (track) _renderTrackInfo(track);
  });

  select(selectors.playerState, state => {
    _updatePlayBtn(state);
    setAlbumArtRotation(D.cover, state === PLAYER_STATE.PLAYING);
  });

  select(selectors.progress, progress => {
    const { duration } = getState();
    if (D.progressFill && duration > 0) {
      D.progressFill.style.width = `${Math.min(100, (progress / duration) * 100)}%`;
    }
    if (D.currentTime) D.currentTime.textContent = formatTime(progress);
  });

  select(selectors.duration, dur => {
    if (D.durationEl) D.durationEl.textContent = formatTime(dur);
  });

  select(selectors.likedTrackIds, ids => {
    const { currentTrack } = getState();
    if (currentTrack) _updateLike(currentTrack.id, ids);
  });

  select(selectors.isShuffle, shuffle => {
    D.shuffleBtn?.classList.toggle('full-player__ctrl--active', shuffle);
  });

  select(selectors.repeatMode, mode => {
    if (!D.repeatBtn) return;
    D.repeatBtn.innerHTML = _repeatSvg(mode);
    D.repeatBtn.classList.toggle('full-player__ctrl--active', mode !== REPEAT_MODE.NONE);
  });

  select(selectors.volume, vol => {
    if (D.volumeSlider) D.volumeSlider.value = String(vol);
  });

  select(selectors.isPro, isPro => {
    if (D.proBtn) D.proBtn.style.display = isPro ? 'none' : 'flex';
    document.body.classList.toggle('is-pro', isPro);
  });
}

// ─── Render helpers ───────────────────────────────────────────────────────────

function _renderTrackInfo(track) {
  if (D.cover && D.cover.src !== track.image) { D.cover.src = track.image || ''; D.cover.alt = track.name || ''; }
  if (D.title)  D.title.textContent  = track.name || '';
  if (D.artist) D.artist.textContent = track.artist_name || '';
  if (D.album)  D.album.textContent  = track.album_name || '';
  _updateLike(track.id, getState().likedTrackIds);
}

function _updatePlayBtn(playerState) {
  if (!D.playBtn) return;
  const active = playerState === PLAYER_STATE.PLAYING || playerState === PLAYER_STATE.BUFFERING;
  D.playBtn.innerHTML = active ? _pauseSvg() : _playSvg();
  D.playBtn.classList.toggle('full-player__play--buffering', playerState === PLAYER_STATE.BUFFERING);
}

function _updateLike(trackId, likedIds) {
  if (!D.likeBtn) return;
  const liked = likedIds.has(trackId);
  D.likeBtn.classList.toggle('full-player__like--active', liked);
  D.likeBtn.innerHTML = liked ? _heartFilled() : _heartOutline();
  D.likeBtn.setAttribute('aria-pressed', String(liked));
}

// ─── SVG icons ────────────────────────────────────────────────────────────────
const _playSvg    = () => `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M8 5v14l11-7z"/></svg>`;
const _pauseSvg   = () => `<svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
const _heartFilled = () => `<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
const _heartOutline = () => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
function _repeatSvg(mode) {
  if (mode === REPEAT_MODE.ONE) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><line x1="11" y1="12" x2="13" y2="12" stroke-width="2.5"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>`;
}
