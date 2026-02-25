// animations.js — AURA Music | Animation Engine
// Web Animations API + Spring Physics + Dynamic Blur
// No audio logic. No store dispatch. Pure visual layer.

import { SPRING_CONFIG, ANIM, Z } from './constants.js';
import { clamp } from './utils.js';

// ─── Spring Simulation ────────────────────────────────────────────────────────

/**
 * Simulate spring physics and return an array of position keyframes.
 * Based on Runge-Kutta 4th order integration.
 *
 * @param {number} from - start value
 * @param {number} to - end value
 * @param {object} config - { stiffness, damping, mass }
 * @param {number} fps - simulation frames per second
 * @returns {number[]} - array of interpolated values
 */
function simulateSpring(from, to, config = SPRING_CONFIG.DEFAULT, fps = 60) {
  const { stiffness, damping, mass } = config;
  const dt = 1 / fps;
  const frames = [];

  let position = from;
  let velocity = 0;
  const target = to;
  const TOLERANCE = 0.001;
  const MAX_FRAMES = fps * 3; // max 3 seconds

  for (let i = 0; i < MAX_FRAMES; i++) {
    const force = -stiffness * (position - target) - damping * velocity;
    const acceleration = force / mass;
    velocity += acceleration * dt;
    position += velocity * dt;
    frames.push(position);

    // Convergence check
    if (Math.abs(position - target) < TOLERANCE && Math.abs(velocity) < TOLERANCE) {
      frames.push(target);
      break;
    }
  }

  return frames;
}

/**
 * Map spring frames to a Web Animations API keyframes array.
 * @param {number[]} frames - position values
 * @param {string} property - CSS property name (e.g., 'transform', 'opacity')
 * @param {Function} mapper - (value) => CSS string
 * @returns {Keyframe[]}
 */
function framesToKeyframes(frames, property, mapper) {
  return frames.map((val, i) => ({
    [property]: mapper(val),
    offset: i / (frames.length - 1),
  }));
}

// ─── Player Expand / Collapse (Spring) ───────────────────────────────────────

/**
 * Animate player expanding from mini bar to full screen.
 * Uses spring physics for the translate-Y and scale transforms.
 * @param {HTMLElement} element - full player panel element
 * @returns {Animation}
 */
export function springExpandPlayer(element) {
  if (!element) return null;

  const frames = simulateSpring(100, 0, SPRING_CONFIG.GENTLE);
  const scaleFrames = simulateSpring(0.92, 1, SPRING_CONFIG.GENTLE);
  const opacityFrames = simulateSpring(0, 1, SPRING_CONFIG.DEFAULT);

  const totalFrames = frames.length;

  const keyframes = frames.map((translateY, i) => {
    const idx = Math.min(i, totalFrames - 1);
    return {
      transform: `translateY(${translateY}%) scale(${scaleFrames[idx] ?? 1})`,
      opacity: opacityFrames[idx] ?? 1,
      offset: i / (totalFrames - 1),
      backdropFilter: `blur(${lerp(0, 24, (i / (totalFrames - 1)))}px)`,
      WebkitBackdropFilter: `blur(${lerp(0, 24, (i / (totalFrames - 1)))}px)`,
    };
  });

  const duration = Math.round((frames.length / 60) * 1000);

  const anim = element.animate(keyframes, {
    duration: clamp(duration, ANIM.PLAYER_EXPAND - 100, ANIM.PLAYER_EXPAND + 200),
    easing: 'linear',
    fill: 'forwards',
  });

  return anim;
}

/**
 * Animate player collapsing back to mini bar.
 * @param {HTMLElement} element
 * @returns {Animation}
 */
export function springCollapsePlayer(element) {
  if (!element) return null;

  const frames = simulateSpring(0, 100, SPRING_CONFIG.GENTLE);
  const scaleFrames = simulateSpring(1, 0.92, SPRING_CONFIG.GENTLE);
  const opacityFrames = simulateSpring(1, 0, SPRING_CONFIG.DEFAULT);
  const totalFrames = frames.length;

  const keyframes = frames.map((translateY, i) => ({
    transform: `translateY(${translateY}%) scale(${scaleFrames[Math.min(i, totalFrames - 1)] ?? 0.92})`,
    opacity: opacityFrames[Math.min(i, totalFrames - 1)] ?? 0,
    offset: i / (totalFrames - 1),
    backdropFilter: `blur(${lerp(24, 0, i / (totalFrames - 1))}px)`,
    WebkitBackdropFilter: `blur(${lerp(24, 0, i / (totalFrames - 1))}px)`,
  }));

  const duration = Math.round((frames.length / 60) * 1000);

  return element.animate(keyframes, {
    duration: clamp(duration, ANIM.PLAYER_COLLAPSE - 80, ANIM.PLAYER_COLLAPSE + 150),
    easing: 'linear',
    fill: 'forwards',
  });
}

// ─── Track Card Animations ────────────────────────────────────────────────────

/**
 * Staggered fade-in + slide-up for track cards.
 * @param {HTMLElement[]} elements
 * @param {number} baseDelay - ms before first element
 */
export function staggerFadeIn(elements, baseDelay = 0) {
  elements.forEach((el, i) => {
    el.animate(
      [
        { opacity: 0, transform: 'translateY(20px)', filter: 'blur(4px)' },
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
      ],
      {
        duration: ANIM.TRACK_FADE_IN + 40,
        delay: baseDelay + i * ANIM.TRACK_STAGGER,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both',
      }
    );
  });
}

/**
 * Spring bounce animation for like button.
 * @param {HTMLElement} element
 */
export function springLikeBounce(element) {
  if (!element) return;

  const scaleFrames = simulateSpring(1, 1, SPRING_CONFIG.BOUNCY);
  // Create a heart-pump: 1 → 1.4 → 1
  const keyframes = [
    { transform: 'scale(1)' },
    { transform: 'scale(1.45)', offset: 0.3 },
    { transform: 'scale(0.9)', offset: 0.6 },
    { transform: 'scale(1.1)', offset: 0.8 },
    { transform: 'scale(1)', offset: 1 },
  ];

  element.animate(keyframes, {
    duration: 480,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    fill: 'none',
  });
}

/**
 * Error shake animation.
 * @param {HTMLElement} element
 */
export function shakeError(element) {
  if (!element) return;

  const frames = simulateSpring(0, 0, SPRING_CONFIG.WOBBLY).slice(0, 20);
  const keyframes = [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-12px)', offset: 0.1 },
    { transform: 'translateX(12px)', offset: 0.2 },
    { transform: 'translateX(-10px)', offset: 0.3 },
    { transform: 'translateX(10px)', offset: 0.4 },
    { transform: 'translateX(-6px)', offset: 0.5 },
    { transform: 'translateX(6px)', offset: 0.6 },
    { transform: 'translateX(-3px)', offset: 0.7 },
    { transform: 'translateX(3px)', offset: 0.8 },
    { transform: 'translateX(0)' },
  ];

  element.animate(keyframes, {
    duration: 520,
    easing: 'ease-out',
  });
}

// ─── Ripple Effect ────────────────────────────────────────────────────────────

/**
 * Creates a ripple effect at click/touch position on an element.
 * @param {HTMLElement} element
 * @param {MouseEvent|TouchEvent} event
 * @param {string} color - rgba color for ripple
 */
export function ripple(element, event, color = 'rgba(255,255,255,0.25)') {
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const size = Math.max(rect.width, rect.height) * 2;

  const rippleEl = document.createElement('div');
  rippleEl.style.cssText = `
    position: absolute;
    left: ${x - size / 2}px;
    top: ${y - size / 2}px;
    width: ${size}px;
    height: ${size}px;
    background: ${color};
    border-radius: 50%;
    pointer-events: none;
    z-index: 999;
  `;

  // Ensure parent is position: relative
  const prevPosition = getComputedStyle(element).position;
  if (prevPosition === 'static') element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(rippleEl);

  rippleEl.animate(
    [
      { transform: 'scale(0)', opacity: 1 },
      { transform: 'scale(1)', opacity: 0 },
    ],
    {
      duration: ANIM.RIPPLE,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  ).addEventListener('finish', () => {
    rippleEl.remove();
  });
}

// ─── Gradient / Color Transition ──────────────────────────────────────────────

/**
 * Smoothly transition CSS custom properties for the dynamic gradient.
 * @param {HTMLElement} element - usually document.documentElement
 * @param {object} fromColors - { primary, secondary, accent }
 * @param {object} toColors   - { primary, secondary, accent }
 * @param {number} duration
 */
export function transitionGradient(element, fromColors, toColors, duration = ANIM.COLOR_TRANSITION) {
  if (!element) return;

  // We use a JS animation loop to interpolate CSS variables
  const start = performance.now();

  const fromRgb = {
    primary: hexToRgbArr(fromColors.primary),
    secondary: hexToRgbArr(fromColors.secondary),
    accent: hexToRgbArr(fromColors.accent),
  };
  const toRgb = {
    primary: hexToRgbArr(toColors.primary),
    secondary: hexToRgbArr(toColors.secondary),
    accent: hexToRgbArr(toColors.accent),
  };

  const animate = (now) => {
    const elapsed = now - start;
    const t = clamp(elapsed / duration, 0, 1);
    const eased = easeInOutSine(t);

    const p = interpolateRgb(fromRgb.primary, toRgb.primary, eased);
    const s = interpolateRgb(fromRgb.secondary, toRgb.secondary, eased);
    const a = interpolateRgb(fromRgb.accent, toRgb.accent, eased);

    element.style.setProperty('--color-primary', `rgb(${p})`);
    element.style.setProperty('--color-secondary', `rgb(${s})`);
    element.style.setProperty('--color-accent', `rgb(${a})`);
    element.style.setProperty('--gradient-opacity', String(eased));

    if (t < 1) requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
}

// ─── Skeleton Shimmer ─────────────────────────────────────────────────────────

/**
 * Start shimmer animation on skeleton elements.
 * @param {HTMLElement[]} elements
 */
export function startSkeletonShimmer(elements) {
  return elements.map(el =>
    el.animate(
      [
        { backgroundPosition: '-200% 0' },
        { backgroundPosition: '200% 0' },
      ],
      {
        duration: ANIM.SKELETON_PULSE,
        iterations: Infinity,
        easing: 'ease-in-out',
      }
    )
  );
}

// ─── Toast Animations ─────────────────────────────────────────────────────────

/**
 * Animate toast notification entering from bottom.
 * @param {HTMLElement} element
 */
export function toastEnter(element) {
  if (!element) return;

  const frames = simulateSpring(-80, 0, SPRING_CONFIG.DEFAULT);
  const opacityFrames = simulateSpring(0, 1, SPRING_CONFIG.DEFAULT);
  const totalFrames = frames.length;

  return element.animate(
    frames.map((translateY, i) => ({
      transform: `translateY(${translateY}px) translateX(-50%)`,
      opacity: opacityFrames[Math.min(i, totalFrames - 1)] ?? 1,
      offset: i / (totalFrames - 1),
    })),
    {
      duration: ANIM.TOAST_ENTER,
      easing: 'linear',
      fill: 'forwards',
    }
  );
}

/**
 * Animate toast notification exiting downward.
 * @param {HTMLElement} element
 * @returns {Promise} resolves when animation finishes
 */
export function toastExit(element) {
  if (!element) return Promise.resolve();

  return new Promise(resolve => {
    const anim = element.animate(
      [
        { transform: 'translateY(0) translateX(-50%)', opacity: 1 },
        { transform: 'translateY(80px) translateX(-50%)', opacity: 0 },
      ],
      {
        duration: ANIM.TOAST_EXIT,
        easing: 'cubic-bezier(0.4, 0, 1, 1)',
        fill: 'forwards',
      }
    );
    anim.addEventListener('finish', resolve);
  });
}

// ─── Modal Animations ─────────────────────────────────────────────────────────

/**
 * Open modal with spring scale + blur background.
 * @param {HTMLElement} modalEl
 * @param {HTMLElement} backdropEl
 */
export function openModal(modalEl, backdropEl) {
  if (backdropEl) {
    backdropEl.animate(
      [{ opacity: 0, backdropFilter: 'blur(0px)' }, { opacity: 1, backdropFilter: 'blur(16px)' }],
      { duration: ANIM.MODAL_OPEN, easing: 'ease-out', fill: 'forwards' }
    );
  }

  if (modalEl) {
    const frames = simulateSpring(0.85, 1, SPRING_CONFIG.GENTLE);
    const opacityFrames = simulateSpring(0, 1, SPRING_CONFIG.DEFAULT);
    const totalFrames = frames.length;

    modalEl.animate(
      frames.map((scale, i) => ({
        transform: `scale(${scale}) translateY(${lerp(30, 0, i / (totalFrames - 1))}px)`,
        opacity: opacityFrames[Math.min(i, totalFrames - 1)] ?? 1,
        offset: i / (totalFrames - 1),
      })),
      { duration: ANIM.MODAL_OPEN, easing: 'linear', fill: 'forwards' }
    );
  }
}

/**
 * Close modal.
 * @param {HTMLElement} modalEl
 * @param {HTMLElement} backdropEl
 * @returns {Promise}
 */
export function closeModal(modalEl, backdropEl) {
  const animations = [];

  if (backdropEl) {
    animations.push(
      backdropEl.animate(
        [{ opacity: 1, backdropFilter: 'blur(16px)' }, { opacity: 0, backdropFilter: 'blur(0px)' }],
        { duration: ANIM.MODAL_CLOSE, easing: 'ease-in', fill: 'forwards' }
      ).finished
    );
  }

  if (modalEl) {
    animations.push(
      modalEl.animate(
        [
          { transform: 'scale(1) translateY(0)', opacity: 1 },
          { transform: 'scale(0.88) translateY(20px)', opacity: 0 },
        ],
        { duration: ANIM.MODAL_CLOSE, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }
      ).finished
    );
  }

  return Promise.all(animations);
}

// ─── Cover Art Rotation ───────────────────────────────────────────────────────

/**
 * Start/stop the slow rotation of album art when playing.
 * @param {HTMLElement} imgEl
 * @param {boolean} isPlaying
 * @returns {Animation|null}
 */
let _rotationAnim = null;
export function setAlbumArtRotation(imgEl, isPlaying) {
  if (!imgEl) return;

  if (!isPlaying) {
    if (_rotationAnim) {
      _rotationAnim.pause();
    }
    return;
  }

  if (_rotationAnim && _rotationAnim.playState === 'paused') {
    _rotationAnim.play();
    return;
  }

  _rotationAnim = imgEl.animate(
    [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
    {
      duration: 24000,
      iterations: Infinity,
      easing: 'linear',
    }
  );

  return _rotationAnim;
}

// ─── Parallax Blur on Scroll ──────────────────────────────────────────────────

/**
 * Apply a dynamic blur to an element based on scroll velocity.
 * @param {HTMLElement} element
 * @param {number} velocity - scroll velocity in px/frame
 */
export function applyScrollBlur(element, velocity) {
  if (!element) return;
  const blurAmount = clamp(Math.abs(velocity) * 0.08, 0, 6);
  element.style.filter = blurAmount > 0.5 ? `blur(${blurAmount.toFixed(1)}px)` : '';
}

// ─── Number indicator pop ─────────────────────────────────────────────────────

export function popIn(element) {
  if (!element) return;
  element.animate(
    [
      { transform: 'scale(0) rotate(-15deg)', opacity: 0 },
      { transform: 'scale(1.2) rotate(5deg)', offset: 0.6, opacity: 1 },
      { transform: 'scale(1) rotate(0)', opacity: 1 },
    ],
    { duration: 360, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', fill: 'forwards' }
  );
}

// ─── Utility Functions ────────────────────────────────────────────────────────

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeInOutSine(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function hexToRgbArr(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '#1a1a2e');
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [26, 26, 46];
}

function interpolateRgb(from, to, t) {
  return [
    Math.round(lerp(from[0], to[0], t)),
    Math.round(lerp(from[1], to[1], t)),
    Math.round(lerp(from[2], to[2], t)),
  ].join(', ');
}
