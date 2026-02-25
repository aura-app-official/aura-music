// app.js — AURA Music | Boot Orchestrator
// Single entry point. Strict boot sequence with error isolation.

import { initUI, showToast, collapsePlayer } from './ui.js';
import { loadHomeData }                      from './services/data.service.js';
import { dispatch, getState, select, selectors } from './store.js';
import audioPlayer                           from './player.js';
import { ACTION, SCREEN, HAPTIC, ERROR_MSG } from './constants.js';
import { isTelegram, getTelegramUser, getTelegramTheme, haptic } from './utils.js';

// ─── Boot sequence ────────────────────────────────────────────────────────────

async function boot() {
  try {
    // 1. Telegram integration (sync — safe before any DOM changes)
    _initTelegram();

    // 2. Initialise all UI modules and bind all DOM events
    initUI();

    // 3. Global handlers (keyboard, online/offline, unhandled errors)
    _bindGlobalHandlers();

    // 4. Hide splash — UI framework is ready even if data hasn't arrived
    document.querySelector('#splash')?.classList.add('splash--hidden');
    document.body.classList.add('app--ready');

    // 5. Load home data — async, non-blocking.
    //    DataService dispatches to store → home.screen subscribes → renders.
    //    Even if this fails, the app is functional (shows error state).
    loadHomeData().catch(err => {
      console.warn('[AURA] Initial home load failed:', err?.message);
    });

    console.info('[AURA] 🎵 Boot complete');
  } catch (err) {
    console.error('[AURA] Boot failed:', err);
    _showFatalError(err);
  }
}

// ─── Telegram ─────────────────────────────────────────────────────────────────

function _initTelegram() {
  const tg = window.Telegram?.WebApp;
  if (!tg) {
    console.info('[AURA] Outside Telegram — haptics unavailable');
    return;
  }

  tg.ready();
  tg.expand();

  // Apply Telegram color scheme
  if (getTelegramTheme().colorScheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  // Back button
  tg.BackButton.onClick(() => {
    const { playerSize, screen } = getState();
    if (playerSize === 'full') { collapsePlayer(); return; }
    if (screen !== SCREEN.HOME) { dispatch({ type: ACTION.SET_SCREEN, payload: SCREEN.HOME }); return; }
    tg.close();
  });

  select(selectors.screen, (screen) => {
    if (!isTelegram()) return;
    screen !== SCREEN.HOME ? tg.BackButton.show() : tg.BackButton.hide();
  });

  // Viewport height for notched devices
  const _applyVh = () => {
    if (tg.viewportStableHeight) {
      document.documentElement.style.setProperty('--tg-viewport-height', `${tg.viewportStableHeight}px`);
    }
  };
  _applyVh();
  tg.onEvent('viewportChanged', ({ isStateStable }) => { if (isStateStable) _applyVh(); });

  const user = getTelegramUser();
  if (user) console.info(`[AURA] User: ${user.first_name} (@${user.username || 'N/A'})`);
}

// ─── Global handlers ──────────────────────────────────────────────────────────

function _bindGlobalHandlers() {
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    const { volume } = getState();
    switch (e.key) {
      case ' ': case 'k': e.preventDefault(); audioPlayer.toggle(); haptic(HAPTIC.MEDIUM); break;
      case 'ArrowRight': case 'l': e.preventDefault(); audioPlayer.seekRelative(10); break;
      case 'ArrowLeft':  case 'j': e.preventDefault(); audioPlayer.seekRelative(-10); break;
      case 'ArrowUp':   e.preventDefault(); audioPlayer.setVolume(volume + 0.05); break;
      case 'ArrowDown': e.preventDefault(); audioPlayer.setVolume(volume - 0.05); break;
      case 'n': audioPlayer.next(); break;
      case 'p': audioPlayer.prev(); break;
      case 'm': audioPlayer.setVolume(volume > 0 ? 0 : 0.85); break;
    }
  });

  // Network status
  window.addEventListener('offline', () => {
    dispatch({ type: ACTION.SHOW_TOAST, payload: { message: '📡 You\'re offline', type: 'warning' } });
  });
  window.addEventListener('online', () => {
    dispatch({ type: ACTION.SHOW_TOAST, payload: { message: '✅ Back online', type: 'success' } });
  });

  // Unhandled promise rejections (non-fatal)
  window.addEventListener('unhandledrejection', (e) => {
    const msg = e.reason?.message || '';
    console.error('[AURA] Unhandled rejection:', e.reason);
    if (msg.includes('audio') || msg.includes('API') || msg.includes('network')) {
      dispatch({ type: ACTION.SHOW_TOAST, payload: { message: msg || ERROR_MSG.GENERIC, type: 'error' } });
    }
  });
}

// ─── Fatal error screen ───────────────────────────────────────────────────────

function _showFatalError(err) {
  const line = err?.stack?.split('\n')[1]?.trim() || '';
  document.body.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
      height:100vh;background:#090910;color:#fff;font-family:sans-serif;padding:24px;text-align:center">
      <span style="font-size:48px;margin-bottom:16px">🎵</span>
      <h1 style="font-size:20px;margin-bottom:8px">AURA couldn't start</h1>
      <p style="color:#888;font-size:14px;margin-bottom:4px">${err?.message || 'Unknown error'}</p>
      <p style="color:#555;font-size:11px;font-family:monospace;margin-bottom:24px">${line}</p>
      <button onclick="location.reload()"
        style="background:#e94560;color:#fff;border:none;padding:12px 28px;
          border-radius:999px;font-size:16px;cursor:pointer">Retry</button>
    </div>
  `;
}

// ─── Launch ───────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
