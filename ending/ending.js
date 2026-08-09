const startPanel = document.getElementById('startPanel');
const stage = document.getElementById('stage');
const startButton = document.getElementById('startButton');
const audio = document.getElementById('endingAudio');

const posterScene = document.getElementById('posterScene');
const photoScene = document.getElementById('photoScene');
const finScene = document.getElementById('finScene');

const posterGrid = document.getElementById('posterGrid');
const photoStage = document.getElementById('photoStage');
const posterCounter = document.getElementById('posterCounter');
const photoCounter = document.getElementById('photoCounter');

const lyricOverlay = document.getElementById('lyricOverlay');
const lyricLine = document.getElementById('lyricLine');

const FADE_MS = 700;
const POSTER_COUNT = 30;
const PHOTO_COUNT = 3;
const POSTER_GROUP_SIZE = 6;

const posterSwitchTimes = [0, 6, 12, 18, 24];
const photoSwitchTimes = [30, 36, 42];
const FIN_AT_MS = 48000;
const AUDIO_STOP_MS = 52000;

const lyrics = [
  { time: 0.0, text: '' },
  { time: 1.2, text: '旭台に　朝ひらけ' },
  { time: 4.2, text: '白き峰より　風は来る' },
  { time: 8.5, text: '酪農の野に　牛は立ち' },
  { time: 12.0, text: '学びの鐘は　今日も鳴る' },
  { time: 16.5, text: '重き日々にも　灯をかかげ' },
  { time: 20.0, text: '知恵をたずねて　道を行く' },
  { time: 24.0, text: '過ぎしカコクを　越えながら' },
  { time: 27.0, text: '明日の丘へ　歩み出す' },
  { time: 31.0, text: 'ああ　金沢国際酪農大学　旭台キャンパス' },
  { time: 37.0, text: 'われらは進む　ラク大へ' },
  { time: 40.0, text: 'ラク大へ　いま一歩' },
  { time: 42.0, text: 'ラク大へ　いま一歩' },
  { time: 44.0, text: 'ラク大へ　いま一歩' },
  { time: 51.0, text: '' }
];

let currentLyricIndex = -1;
let lyricRafId = null;
let scheduledTimers = [];

function makePaths(folder, count) {
  return Array.from({ length: count }, (_, index) => {
    const num = String(index + 1).padStart(2, '0');
    return `ending/images/${folder}/${num}.png`;
  });
}

const posterPaths = makePaths('posters', POSTER_COUNT);
const photoPaths = makePaths('photos', PHOTO_COUNT);

const posterSlides = [];
for (let i = 0; i < posterPaths.length; i += POSTER_GROUP_SIZE) {
  posterSlides.push(posterPaths.slice(i, i + POSTER_GROUP_SIZE));
}

function setTimer(callback, delay) {
  const id = setTimeout(callback, delay);
  scheduledTimers.push(id);
  return id;
}

function clearTimers() {
  scheduledTimers.forEach(clearTimeout);
  scheduledTimers = [];
}

function showScene(scene) {
  [posterScene, photoScene, finScene].forEach(item => {
    item.classList.remove('active');
    if (item !== scene) item.hidden = true;
  });

  scene.hidden = false;
  requestAnimationFrame(() => scene.classList.add('active'));
}

function addMissingMessage(container, path) {
  container.classList.add('missing');
  container.textContent = `${path}\n画像を配置してください`;
}

function renderPosterSlide(index) {
  const paths = posterSlides[index] || [];
  posterGrid.innerHTML = '';
  posterCounter.textContent = `${index + 1} / ${posterSlides.length}`;

  paths.forEach((path, slotIndex) => {
    const slot = document.createElement('div');
    slot.className = 'image-slot';
    slot.style.setProperty('--delay', `${slotIndex * 0.08}s`);

    const img = document.createElement('img');
    img.src = path;
    img.alt = `MISSION 2 提出画像 ${index * POSTER_GROUP_SIZE + slotIndex + 1}`;
    img.onerror = () => {
      addMissingMessage(slot, path);
      img.remove();
    };

    slot.appendChild(img);
    posterGrid.appendChild(slot);
  });
}

function renderPhoto(index) {
  const path = photoPaths[index];
  photoStage.innerHTML = '';
  photoCounter.textContent = `${index + 1} / ${photoPaths.length}`;

  const slot = document.createElement('div');
  slot.className = 'photo-slot';

  const img = document.createElement('img');
  img.src = path;
  img.alt = `研修中の様子 ${index + 1}`;
  img.onerror = () => {
    addMissingMessage(slot, path);
    img.remove();
  };

  slot.appendChild(img);
  photoStage.appendChild(slot);
}

function fadeAndRun(target, callback) {
  target.classList.add('is-fading');
  setTimeout(() => {
    callback();
    requestAnimationFrame(() => target.classList.remove('is-fading'));
  }, FADE_MS);
}

function updateLyrics() {
  if (!audio || !lyricOverlay || !lyricLine) return;

  const now = audio.currentTime;
  let nextIndex = lyrics.length - 1;

  for (let i = 0; i < lyrics.length; i += 1) {
    if (now < lyrics[i].time) {
      nextIndex = Math.max(0, i - 1);
      break;
    }
  }

  if (nextIndex !== currentLyricIndex) {
    currentLyricIndex = nextIndex;
    lyricOverlay.classList.remove('show');

    setTimeout(() => {
      const nextText = lyrics[currentLyricIndex].text;
      if (nextText === '') {
        lyricOverlay.classList.remove('show');
        lyricLine.textContent = '';
        setTimeout(() => {
          if (lyrics[currentLyricIndex].text === '') lyricOverlay.hidden = true;
        }, 450);
      } else {
        lyricOverlay.hidden = false;
        lyricLine.textContent = nextText;
        lyricOverlay.classList.add('show');
      }
    }, 90);
  }

  lyricRafId = requestAnimationFrame(updateLyrics);
}

function startLyrics() {
  currentLyricIndex = -1;
  if (lyricRafId) cancelAnimationFrame(lyricRafId);
  lyricLine.textContent = '';
  lyricOverlay.hidden = true;
  lyricOverlay.classList.remove('show');
  updateLyrics();
}

function stopLyrics() {
  if (lyricRafId) {
    cancelAnimationFrame(lyricRafId);
    lyricRafId = null;
  }
  lyricOverlay.classList.remove('show');
  setTimeout(() => {
    lyricOverlay.hidden = true;
    lyricLine.textContent = '';
  }, 450);
}

function scheduleEnding() {
  clearTimers();

  showScene(posterScene);
  renderPosterSlide(0);

  posterSwitchTimes.forEach((time, index) => {
    if (index === 0) return;
    setTimer(() => {
      showScene(posterScene);
      fadeAndRun(posterGrid, () => renderPosterSlide(index));
    }, time * 1000);
  });

  photoSwitchTimes.forEach((time, index) => {
    setTimer(() => {
      showScene(photoScene);
      if (index === 0) {
        renderPhoto(index);
      } else {
        fadeAndRun(photoStage, () => renderPhoto(index));
      }
    }, time * 1000);
  });

  setTimer(() => {
    showScene(finScene);
  }, FIN_AT_MS);

  setTimer(() => {
    stopLyrics();
    if (!audio.paused) audio.pause();
  }, AUDIO_STOP_MS + 800);
}

startButton.addEventListener('click', async () => {
  startPanel.hidden = true;
  stage.hidden = false;

  try {
    audio.currentTime = 0;
    await audio.play();
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }

  startLyrics();
  scheduleEnding();
});
