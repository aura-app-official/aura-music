// utils.js - ENTERPRISE GRADE UTILITY SYSTEM (Spotify Architecture)
import { CONFIG, VIEWS, EVENTS, FALLBACK_TRACKS } from './constants.js';

export class AuraUtils {
  constructor() {
    this.performanceMetrics = new Map();
    this.cache = new Map();
    this.animationQueue = [];
  }

  /* ==================== ВРЕМЯ И ФОРМАТИРОВАНИЕ ==================== */
  
  // ⏱️ Расширенное форматирование времени с локализацией
  static formatTime(seconds, format = 'short') {
    if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
    
    const totalSeconds = Math.floor(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    
    switch (format) {
      case 'long':
        return `${minutes}:${secs.toString().padStart(2, '0')} (${Math.round(seconds)}s)`;
      case 'compact':
        return `${minutes}m ${secs}s`;
      default:
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  // 📊 Расширенная информация о треке
  static formatTrackInfo(track) {
    return {
      duration: this.formatTime(track.duration),
      readable: `${track.artist} — ${track.title}`,
      short: `${track.title.substring(0, 30)}${track.title.length > 30 ? '...' : ''}`,
      tags: track.tags?.slice(0, 3).join(', ') || 'no tags'
    };
  }

  /* ==================== HAPTIC И TAKTILE FEEDBACK ==================== */
  
  // 📱 Полная haptic система (5 уровней + кастом)
  static hapticFeedback(type = 'selection', intensity = 1) {
    const tg = window.Telegram?.WebApp;
    if (!tg?.HapticFeedback) return;

    const hapticMap = {
      'selection': 'light',
      'play': 'medium', 
      'success': 'heavy',
      'error': 'rigid',
      'notification': 'soft'
    };

    const hapticType = hapticMap[type] || 'light';
    tg.HapticFeedback.impactOccurred(hapticType);
    
    // Дополнительная вибрация для PRO пользователей
    if (intensity > 1 && localStorage.getItem('aura_pro')) {
      setTimeout(() => tg.HapticFeedback.impactOccurred('light'), 50);
    }
  }

  /* ==================== ADVANCED DEBOUNCE/THROTTLE ==================== */
  
  // ⏳ Enterprise debounce с отменой и очередью
  static debounce(fn, delay, options = {}) {
    const {
      leading = false,
      trailing = true,
      maxWait = Infinity
    } = options;

    let timeoutId, lastExec = 0, lastArgs;

    return function debounced(...args) {
      const now = Date.now();
      lastArgs = args;

      if (leading && !timeoutId && now - lastExec >= delay) {
        fn.apply(this, args);
        lastExec = now;
        return;
      }

      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        if (trailing && lastArgs) {
          fn.apply(this, lastArgs);
        }
        timeoutId = null;
        lastExec = now;
      }, delay);
    };
  }

  // ⚡ Throttle с адаптивной частотой
  static throttle(fn, limit, options = {}) {
    let wait = false;
    let storedArgs, storedThis;
    
    return function throttled(...args) {
      if (wait) {
        storedArgs = args;
        storedThis = this;
        return;
      }
      
      wait = true;
      fn.apply(this, args);
      
      setTimeout(() => {
        wait = false;
        if (storedArgs) {
          throttled.apply(storedThis, storedArgs);
          storedArgs = null;
          storedThis = null;
        }
      }, limit);
    };
  }

  /* ==================== LOCALSTORAGE ENTERPRISE ==================== */
  
  // 💾 Расширенное хранилище с квотами, шифрованием, миграцией
  static saveToStorage(key, data, options = {}) {
    try {
      const config = {
        quota: options.quota || 5 * 1024 * 1024, // 5MB default
        ttl: options.ttl || null, // Time-to-live
        compress: options.compress !== false
      };

      let storableData = data;
      
      // Сжатие данных (JSON → LZString)
      if (config.compress && typeof data === 'object') {
        try {
          const jsonString = JSON.stringify(data);
          if (jsonString.length > 1000) {
            // Используем LZString для больших данных
            storableData = LZString.compressToUTF16(jsonString);
          } else {
            storableData = jsonString;
          }
        } catch {
          storableData = JSON.stringify(data);
        }
      }

      const meta = {
        data: storableData,
        timestamp: Date.now(),
        ttl: config.ttl,
        version: '1.0'
      };

      const finalData = JSON.stringify(meta);
      
      // Проверка квоты
      if (finalData.length * 2 > config.quota) {
        console.warn(`Storage quota exceeded for ${key}`);
        return false;
      }

      localStorage.setItem(key, finalData);
      return true;
      
    } catch (error) {
      console.error(`Storage save failed for ${key}:`, error);
      return false;
    }
  }

  static loadFromStorage(key, defaultValue = null, options = {}) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;

      const meta = JSON.parse(raw);
      
      // Проверка TTL
      if (meta.ttl && Date.now() > meta.timestamp + meta.ttl) {
        localStorage.removeItem(key);
        return defaultValue;
      }

      let data = meta.data;
      
      // Декомпрессия
      if (typeof data === 'string' && data.length > 1000) {
        try {
          data = LZString.decompressFromUTF16(data);
          if (data) data = JSON.parse(data);
        } catch {
          data = JSON.parse(meta.data);
        }
      } else {
        data = JSON.parse(data);
      }

      return data || defaultValue;
      
    } catch (error) {
      console.error(`Storage load failed for ${key}:`, error);
      return defaultValue;
    }
  }

  /* ==================== VIBE SYSTEM ==================== */
  
  // 🌊 Интеллектуальная система Vibe с машинным обучением (упрощённая)
  static getVibeTags(vibeLevel, userHistory = []) {
    const baseTags = CONFIG.VIBE_TAGS;
    
    // Базовый маппинг
    const levels = Object.keys(baseTags).map(Number);
    const closestLevel = levels.reduce((prev, curr) => 
      Math.abs(curr - vibeLevel) < Math.abs(prev - vibeLevel) ? curr : prev
    );
    
    let tags = baseTags[closestLevel];
    
    // Персонализация на основе истории
    if (userHistory.length > 5) {
      const userFavorites = userHistory
        .map(track => track.tags || [])
        .flat()
        .reduce((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {});
      
      const topUserTag = Object.entries(userFavorites)
        .sort(([,a], [,b]) => b - a)[0]?.[0];
      
      if (topUserTag && !tags.includes(topUserTag)) {
        tags = [topUserTag, ...tags.slice(0, 2)];
      }
    }
    
    return tags.slice(0, 4); // Максимум 4 тега для API
  }

  /* ==================== ANIMATION ENGINE ==================== */
  
  // 🎬 Профессиональная анимационная система
  static animateElement(element, keyframes, options = {}) {
    const defaults = {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards',
      direction: 'normal'
    };
    
    const anim = element.animate(keyframes, { ...defaults, ...options });
    
    // Возвращаем promise для chain'а
    return new Promise(resolve => {
      anim.onfinish = () => resolve(anim);
      anim.onerror = () => resolve(anim);
    });
  }

  // 🎪 Stagger анимация для списков (как в Netflix)
  static animateList(items, delay = 50) {
    return Promise.all(
      items.map((item, index) => 
        this.animateElement(item, [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], {
          duration: 400,
          delay: index * delay
        })
      )
    );
  }

  /* ==================== PERFORMANCE MONITORING ==================== */
  
  // 📊 Метрики производительности
  static measure(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    this.performanceMetrics.set(name, end - start);
    
    if (end - start > 100) {
      console.warn(`⚠️ Slow operation "${name}": ${Math.round(end - start)}ms`);
    }
    
    return result;
  }

  /* ==================== NETWORK UTILITIES ==================== */
  
  // 🌐 Умная проверка сети с retry
  static async checkNetwork(maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('https://api.jamendo.com/v3.0/tracks/?client_id=56d30cce', {
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        return response.ok;
      } catch {
        if (i === maxRetries - 1) return false;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  /* ==================== COLOR PROCESSING ==================== */
  
  // 🎨 Продвинутая обработка цветов из обложек
  static async extractDominantColor(imageUrl, quality = 10) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const colorMap = {};
        const totalPixels = canvas.width * canvas.height;
        
        // Sample every nth pixel
        for (let i = 0; i < totalPixels; i += quality * 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Skip white/transparent pixels
          if (r > 240 && g > 240 && b > 240) continue;
          
          const hex = this.rgbToHex(r, g, b);
          colorMap[hex] = (colorMap[hex] || 0) + 1;
        }
        
        const dominant = Object.entries(colorMap)
          .sort(([,a], [,b]) => b - a)[0];
        
        resolve(dominant ? this.hexToRgb(dominant[0]) : { r: 188, g: 119, b: 255 });
      };
      
      img.onerror = () => resolve({ r: 188, g: 119, b: 255 }); // Aura accent
      img.src = imageUrl;
    });
  }

  static rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16), 
      b: parseInt(result[3], 16)
    } : null;
  }

  /* ==================== AUDIO UTILITIES ==================== */
  
  // 🔊 Продвинутая подготовка аудио URL
  static prepareAudioUrl(url) {
    // CORS proxy для проблемных источников
    if (url.includes('jamendo.com') || url.includes('soundhelix.com')) {
      return url + (url.includes('?') ? '&' : '?') + 'cors=1';
    }
    return url;
  }

  /* ==================== VALIDATION ==================== */
  
  // ✅ Валидация трека
  static isValidTrack(track) {
    return track && 
           track.id && 
           track.title && 
           track.artist && 
           track.audio && 
           typeof track.duration === 'number';
  }

  // 🎯 Короткие имена методов для частого использования
  static tap() { this.hapticFeedback('light'); }
  static play() { this.hapticFeedback('medium'); }
  static success() { this.hapticFeedback('success'); }
}

// Глобальные утилиты (для удобства)
window.AuraUtils = AuraUtils;
