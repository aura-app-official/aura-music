/* Search Styles */
.search-container {
  margin-bottom: var(--space-2xl);
}

.search-input-wrapper {
  position: relative;
  margin-bottom: var(--space-xl);
}

.search-icon {
  position: absolute;
  left: var(--space-xl);
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: var(--color-text-secondary);
}

.search-input {
  width: 100%;
  padding: var(--space-xl) var(--space-xl) var(--space-xl) var(--space-3xl);
  background: var(--color-glass-bg);
  backdrop-filter: blur(32px);
  border: 1px solid var(--color-border-glass);
  border-radius: var(--radius-xl);
  font-size: 16px;
  color: var(--color-text-primary);
  outline: none;
  transition: all var(--transition-fast);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

.search-input:focus {
  border-color: var(--color-accent-primary);
  box-shadow: 
    0 0 0 3px rgba(188, 119, 255, 0.15),
    var(--shadow-glow);
}

.search-chips {
  display: flex;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.chip {
  padding: var(--space-md) var(--space-lg);
  background: var(--color-glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--color-border-glass);
  border-radius: 25px;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.chip:hover,
.chip.active {
  background: rgba(188, 119, 255, 0.15);
  border-color: var(--color-accent-primary);
  color: var(--color-text-primary);
  box-shadow: 0 4px 16px rgba(188, 119, 255, 0.2);
}

.chip:active {
  transform: scale(0.98);
}

/* Tracks List */
.tracks-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tracks-list-item {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-lg) 0;
  border-bottom: 1px solid var(--color-border-glass);
  cursor: pointer;
  transition: all var(--transition-fast);
  opacity: 0;
  transform: translateX(20px);
  animation: listSlideIn 0.4s ease-out forwards;
}

@keyframes listSlideIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.list-art {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
}

.list-info {
  flex: 1;
  min-width: 0;
}

.list-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: var(--space-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-artist {
  font-size: 14px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-duration {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Empty States */
.empty-state {
  display: none;
  text-align: center;
  padding: 80px 40px;
  color: var(--color-text-secondary);
}

.empty-state.active {
  display: block;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--space-lg);
}

.empty-state h3 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: var(--space-md);
  color: var(--color-text-primary);
}

.empty-state p {
  font-size: 16px;
  line-height: 1.6;
}

/* Navigation */
.nav-bar {
  display: flex;
  padding: var(--space-lg) var(--space-2xl);
  background: rgba(5, 5, 5, 0.9);
  backdrop-filter: blur(40px);
  border-top: 1px solid var(--color-border-glass);
  gap: var(--space-xl);
}

.nav-item {
  flex: 1;
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background: transparent;
  border: 1px solid transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  font-weight: 600;
  font-size: 12px;
}

.nav-item svg {
  width: 24px;
  height: 24px;
}

.nav-item.active {
  background: rgba(188, 119, 255, 0.15);
  border-color: var(--color-accent-primary);
  color: var(--color-text-primary);
  box-shadow: 0 8px 24px rgba(188, 119, 255, 0.2);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 2px;
  background: var(--color-accent-primary);
  box-shadow: 0 0 12px var(--color-glow-primary);
}

/* Mini Player */
.mini-player {
  position: fixed;
  bottom: 0;
  left: 20px;
  right: 20px;
  margin-bottom: env(safe-area-inset-bottom);
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(40px);
  border: 1px solid var(--color-border-glass);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  display: none;
  align-items: center;
  gap: var(--space-lg);
  z-index: 500;
  transform: translateY(100%);
  transition: all var(--transition-smooth);
}

.mini-player.active {
  display: flex;
  transform: translateY(0);
}

.mini-artwork {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  background-size: cover;
  flex-shrink: 0;
}

.mini-info {
  flex: 1;
  min-width: 0;
}

.mini-title {
  font-weight: 700;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: var(--space-xs);
}

.mini-artist {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-progress {
  height: 3px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  margin: var(--space-sm) 0;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent-primary), var(--color-accent-secondary));
  width: 0%;
  transition: width 0.1s linear;
  border-radius: 2px;
  box-shadow: 0 0 8px var(--color-glow-primary);
}

.mini-times {
  display: flex;
  gap: var(--space-sm);
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.mini-controls {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.mini-play-btn,
.mini-expand-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-glass-bg);
  border: 1px solid var(--color-border-glass);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-secondary);
}

.mini-play-btn:hover,
.mini-expand-btn:hover {
  background: rgba(188, 119, 255, 0.2);
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
  transform: scale(1.05);
}

.mini-play-btn.active {
  background: var(--color-accent-primary);
  color: #000;
}

/* Full Player Overlay */
.full-player-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.98);
  backdrop-filter: blur(60px);
  z-index: 1000;
  display: none;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-smooth);
}

.full-player-overlay.active {
  display: flex;
  opacity: 1;
}

.full-player-container {
  width: 100%;
  max-width: 400px;
  height: 80%;
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(60px);
  border: 1px solid var(--color-border-glass);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.full-player-artwork {
  width: 100%;
  height: 40%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.full-player-artwork::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(transparent 0%, rgba(0,0,0,0.8) 100%);
}

.full-player-content {
  padding: var(--space-2xl);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.full-player-title {
  font-size: 28px;
  font-weight: 900;
  margin-bottom: var(--space-sm);
}

.full-player-artist {
  font-size: 18px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2xl);
}

.full-player-progress {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  margin-bottom: var(--space-lg);
  overflow: hidden;
  cursor: pointer;
}

.full-player-progress-fill {
  height: 100%;
  background: var(--color-accent-primary);
  width: 0%;
  transition: width 0.1s linear;
}

.full-player-times {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3xl);
  font-variant-numeric: tabular-nums;
}

.full-player-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xl);
}

.full-player-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-accent-primary);
  border: none;
  color: #000;
  font-size: 24px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  box-shadow: 0 12px 32px rgba(188, 119, 255, 0.4);
}

.full-player-btn:active {
  transform: scale(0.95);
}

.full-player-close {
  position: absolute;
  top: var(--space-xl);
  right: var(--space-xl);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--color-border-glass);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.full-player-close:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-text-primary);
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* Responsive */
@media (max-width: 450px) {
  .app-shell {
    border-radius: 0;
  }
  
  .nav-bar {
    padding: var(--space-lg) var(--space-lg);
  }
}
