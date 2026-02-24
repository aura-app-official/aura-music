// Инициализация Telegram WebApp 
const tg = window.Telegram?.WebApp; 
if (tg) { 
 tg.expand(); 
 tg.setHeaderColor('#000000'); 
 tg.setBackgroundColor('#000000'); 
}
 
// Глобальные переменные состояния 
const audio = new Audio(); 
let currentPlaylist = []; 
let currentTrackIndex = -1; 
let isPlaying = false; 
 
// DOM Элементы 
const searchInput = document.getElementById('searchInput'); 
const trackListEl = document.getElementById('track-list'); 
const loader = document.getElementById('loader'); 
 
const miniPlayer = document.getElementById('mini-player'); 
const fullPlayer = document.getElementById('full-player'); 
 
// SVG Иконки для кнопок 
const iconPlay = `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M8 5v14l11-7z"/></svg>`; 
const iconPause = `<svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`; 
 
// --- ЛОГИКА ПОИСКА (Jamendo API) --- 
let searchTimeout; 
searchInput.addEventListener('input', (e) => { 
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    if (query.length < 2) return;
 
    // Задержка, чтобы не отправлять запрос на каждую букву
    searchTimeout = setTimeout(() => fetchMusic(query), 500);
});
 
async function fetchMusic(query) {
    loader.style.display = 'block';
    trackListEl.innerHTML = '';
 
    // Реальный запрос к базе
    const client_id = '56d30cce';
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${client_id}&format=jsonpost&limit=30&search=${encodeURIComponent(query)}&include=musicinfo`;
 
    try {
        const res = await fetch(url);
        const data = await res.json();
        currentPlaylist = data.results.filter(track => track.audio); // Берем только те, где есть аудио
        renderTracks();
    } catch (err) {
        trackListEl.innerHTML = '<p style="text-align:center; color:gray;">Ошибка загрузки. Проверьте интернет.</p>';
    } finally {
        loader.style.display = 'none';
    }
}
 
function renderTracks() {
    if (currentPlaylist.length === 0) {
        trackListEl.innerHTML = '<p style="text-align:center; color:gray;">Ничего не найдено</p>';
        return;
    }
 
    trackListEl.innerHTML = currentPlaylist.map((track, index) => `
        <div class="track-item" onclick="loadTrack(${index})">
            <img src="${track.image}" class="track-cover" loading="lazy">
            <div class="track-details">
                <h3 class="track-title">${track.name}</h3>
                <p class="track-artist">${track.artist_name}</p>
            </div>
            <div style="color: var(--text-secondary);">⋮</div>
        </div>
    `).join('');
}
 
// --- УПРАВЛЕНИЕ ПЛЕЕРОМ ---
function loadTrack(index) {
    if (index < 0 || index >= currentPlaylist.length) return;
 
    currentTrackIndex = index;
    const track = currentPlaylist[index];
 
    // Загрузка аудио
    audio.src = track.audio;
    audio.play();
    isPlaying = true;
 
    // Обновление UI
    document.getElementById('mini-title').innerText = track.name;
    document.getElementById('mini-artist').innerText = track.artist_name;
    document.getElementById('mini-cover').src = track.image;
 
    document.getElementById('full-title').innerText = track.name;
    document.getElementById('full-artist').innerText = track.artist_name;
    document.getElementById('full-cover').src = track.image;
 
    updatePlayButtons();
    miniPlayer.style.display = 'flex'; // Показываем мини-плеер
 
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}
 
function togglePlay() {
    if (!audio.src) return;
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
    isPlaying = !isPlaying;
    updatePlayButtons();
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}
 
function playNext() { loadTrack(currentTrackIndex + 1); }
function playPrevious() { loadTrack(currentTrackIndex - 1); }
 
function updatePlayButtons() {
    const playBtnMini = document.getElementById('mini-play-btn');
    const playBtnFull = document.getElementById('full-play-btn');
 
    playBtnMini.innerHTML = isPlaying ? iconPause : iconPlay;
    playBtnFull.innerHTML = isPlaying ? iconPause : iconPlay;
}
 
// --- ПРОГРЕСС БАР И ВРЕМЯ ---
audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
 
    // Обновляем обе полоски
    document.getElementById('progress-bar').style.width = `${percent}%`;
    document.getElementById('mini-progress').style.width = `${percent}%`;
 
    // Обновляем текст времени
    document.getElementById('time-current').innerText = formatTime(audio.currentTime);
});
 
audio.addEventListener('loadedmetadata', () => {
    document.getElementById('time-total').innerText = formatTime(audio.duration);
});
 
audio.addEventListener('ended', playNext); // Автоматически следующий трек
 
function seekTrack(event) {
    const container = event.currentTarget;
    const clickX = event.offsetX;
    const width = container.clientWidth;
    const percent = clickX / width;
    audio.currentTime = percent * audio.duration;
}
 
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}
 
// --- АНИМАЦИИ ПОЛНОЭКРАННОГО ПЛЕЕРА ---
function openFullScreenPlayer() {
    fullPlayer.classList.add('active');
    // Небольшой эффект пульсации обложки при открытии
    document.getElementById('full-cover').style.transform = 'scale(1.05)';
    setTimeout(() => { document.getElementById('full-cover').style.transform = 'scale(1)'; }, 300);
}
 
function closeFullScreenPlayer() {
    fullPlayer.classList.remove('active');
}
 
// --- ОПЛАТА PRO (CryptoBot) ---
function openPayment() {
    if (tg?.showConfirm) {
        tg.showConfirm("Активировать PRO за 1 USDT?\n\nОплата через Crypto Pay. Вы сможете использовать любую карту РФ через P2P.", (confirmed) => {
            if(confirmed) {
                // Сюда ты потом вставишь реальную ссылку из своего CryptoBot API
                tg.openLink('https://t.me/CryptoBot?start=pay'); 
            }
        });
    } else {
        alert("Оплата доступна только внутри Telegram");
    }
}
