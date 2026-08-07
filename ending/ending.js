const startPanel = document.getElementById('startPanel');
const stage = document.getElementById('stage');
const startButton = document.getElementById('startButton');
const audio = document.getElementById('endingAudio');

const titleScene = document.getElementById('titleScene');
const songCardScene = document.getElementById('songCardScene');
const posterScene = document.getElementById('posterScene');
const photoScene = document.getElementById('photoScene');
const finScene = document.getElementById('finScene');

const posterGrid = document.getElementById('posterGrid');
const photoStage = document.getElementById('photoStage');
const posterCounter = document.getElementById('posterCounter');
const photoCounter = document.getElementById('photoCounter');

const lyricOverlay = document.getElementById('lyricOverlay');
const lyricLine = document.getElementById('lyricLine');

const TITLE_AT_MS = 0;
const SONG_CARD_AT_MS = 17000;
const POSTER_AT_MS = 32000;
const PHOTO_AT_MS = 130000;
const FIN_AT_MS = 154000;
const AUDIO_STOP_MS = 168000;
const FADE_MS = 850;

const POSTER_COUNT = 33;
const PHOTO_COUNT = 3;
const POSTER_GROUP_SIZE = 3;

const posterSwitchTimes = [32, 40, 48, 56, 64, 71, 80, 88, 98, 106, 114];
const photoSwitchTimes = [130, 137, 146];

const lyrics = [
  { time: 0.0, text: '' },
  { time: 32.0, text: '旭台に　朝ひらけ' },
  { time: 40.0, text: '白き峰より　風は来る' },
  { time: 48.0, text: '酪農の野に　牛は立ち' },
  { time: 56.0, text: '学びの鐘は　今日も鳴る' },
  { time: 64.0, text: '重き日々にも　灯をかかげ' },
  { time: 71.0, text: '知恵をたずねて　道を行く' },
  { time: 80.0, text: '過ぎしカコクを　越えながら' },
  { time: 88.0, text: '明日の丘へ　歩み出す' },
  { time: 98.0, text: 'ああ　金沢国際酪農大学' },
  { time: 106.0, text: '旭台キャンパス' },
  { time: 114.0, text: 'われらは進む　ラク大へ' },
  { time: 130.0, text: 'ラク大へ　いま一歩' },
  { time: 137.0, text: 'ラク大へ　いま一歩' },
  { time: 146.0, text: 'ラク大へ　いま一歩' },
  { time: 159.0, text: '' }
];

let currentLyricIndex = -1;
let lyricRafId = null;

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

function showScene(scene) {
  [titleScene, songCardScene, posterScene, photoScene, finScene].forEach(item => {
    item.classList.remove('active');
    if (item !== scene) item.hidden = true;
  });

  scene.hidden = false;
  requestAnimationFrame(() => scene.classList.add('active'));
}

function addMissingMessage(container, path) {
  container.classList.add('missing');
  container.textContent = `${path}
画像を配置してください`;
}

function renderPosterSlide(index) {
  const paths = posterSlides[index] || [];
  posterGrid.innerHTML = '';
  posterCounter.textContent = `${index + 1} / ${posterSlides.length}`;

  paths.forEach((path, slotIndex) => {
    const slot = document.createElement('div');
    slot.className = 'image-slot';
    slot.style.setProperty('--delay', `${slotIndex * 0.12}s`);

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
          if (lyrics[currentLyricIndex].text === '') {
            lyricOverlay.hidden = true;
          }
        }, 450);
      } else {
        lyricOverlay.hidden = false;
        lyricLine.textContent = nextText;
        lyricOverlay.classList.add('show');
      }
    }, 120);
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
  showScene(titleScene);

  setTimeout(() => showScene(songCardScene), SONG_CARD_AT_MS);

  setTimeout(() => {
    showScene(posterScene);
    renderPosterSlide(0);
  }, POSTER_AT_MS);

  posterSwitchTimes.forEach((time, index) => {
    if (index === 0) return;
    setTimeout(() => {
      showScene(posterScene);
      fadeAndRun(posterGrid, () => renderPosterSlide(index));
    }, time * 1000);
  });

  setTimeout(() => {
    showScene(photoScene);
    renderPhoto(0);
  }, PHOTO_AT_MS);

  photoSwitchTimes.forEach((time, index) => {
    if (index === 0) return;
    setTimeout(() => {
      showScene(photoScene);
      fadeAndRun(photoStage, () => renderPhoto(index));
    }, time * 1000);
  });

  setTimeout(() => {
    showScene(finScene);
  }, FIN_AT_MS);

  setTimeout(() => {
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
