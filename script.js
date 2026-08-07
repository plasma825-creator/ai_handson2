
const missionCards = [...document.querySelectorAll('.mission-card[data-card="m1"], .mission-card[data-card="m2"], .mission-card[data-card="m3"]')];
const allToggleCards = [...document.querySelectorAll('.mission-card')];
const finalMission = document.getElementById('finalMission');
const successScreen = document.getElementById('successScreen');
const escapeKeyword = document.getElementById('escapeKeyword');
const escapeButton = document.getElementById('escapeButton');
const escapeError = document.getElementById('escapeError');
const closeSuccess = document.getElementById('closeSuccess');
const resetProgress = document.getElementById('resetProgress');
const storyCheck = document.getElementById('storyCheck');
const openingStory = document.getElementById('openingStory');

function storageKey(cardId) {
  return `kakoku2_v2_done_${cardId}`;
}

function b64ToUtf8(base64) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

function normalizeKeyword(value) {
  return (value || '')
    .trim()
    .replace(/[\s\u3000]/g, '')
    .replace(/[、。,.]/g, '')
    .toLowerCase();
}

function isDone(cardId) {
  return localStorage.getItem(storageKey(cardId)) === '1';
}

function setDone(cardId) {
  localStorage.setItem(storageKey(cardId), '1');
}

function clearDone(cardId) {
  localStorage.removeItem(storageKey(cardId));
}

function setOpen(card, open) {
  if (!card) return;
  card.classList.toggle('open', open);
  const toggle = card.querySelector('.card-toggle');
  if (toggle) toggle.setAttribute('aria-expanded', String(open));
}

function cardById(cardId) {
  return document.querySelector(`.mission-card[data-card="${cardId}"]`);
}

function updateUnlocks() {
  const storyDone = isDone('story');
  const m1 = cardById('m1');
  const m2 = cardById('m2');
  const m3 = cardById('m3');

  if (openingStory) openingStory.classList.toggle('completed', storyDone);
  if (storyCheck) storyCheck.checked = storyDone;

  if (m1) m1.hidden = !storyDone;
  if (m2) m2.hidden = !isDone('m1');
  if (m3) m3.hidden = !isDone('m2');
  if (finalMission) finalMission.hidden = !isDone('m1') || !isDone('m2') || !isDone('m3');

  missionCards.forEach(card => {
    const id = card.dataset.card;
    const done = isDone(id);
    card.classList.toggle('completed', done);
    const ok = document.getElementById(`${id}Ok`);
    if (ok) ok.hidden = !done;
  });

  if (m1 && m1.hidden) setOpen(m1, false);
  if (m2 && m2.hidden) setOpen(m2, false);
  if (m3 && m3.hidden) setOpen(m3, false);
  if (finalMission && finalMission.hidden) setOpen(finalMission, false);
}

function checkMissionKeyword(cardId) {
  const input = document.getElementById(`${cardId}Keyword`);
  const error = document.getElementById(`${cardId}Error`);
  const keywords = window.KAKOKU_MISSION_KEYWORDS_B64 || {};
  const correct = normalizeKeyword(b64ToUtf8(keywords[cardId] || ''));
  const value = normalizeKeyword(input ? input.value : '');
  if (value && value === correct) {
    if (error) error.hidden = true;
    setDone(cardId);
    updateUnlocks();
    const nextMap = { m1: 'm2', m2: 'm3', m3: 'final' };
    const nextId = nextMap[cardId];
    const nextCard = nextId === 'final' ? finalMission : cardById(nextId);
    if (nextCard) {
      setTimeout(() => {
        nextCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setOpen(nextCard, true);
      }, 220);
    }
  } else {
    if (error) error.hidden = false;
    if (input) input.focus();
  }
}

allToggleCards.forEach(card => {
  const toggle = card.querySelector('.card-toggle');
  if (toggle && !toggle.disabled) {
    toggle.addEventListener('click', () => {
      const open = card.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
});

if (storyCheck) {
  storyCheck.addEventListener('change', () => {
    if (storyCheck.checked) {
      setDone('story');
      updateUnlocks();
      const m1 = cardById('m1');
      if (m1) {
        setTimeout(() => {
          m1.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setOpen(m1, true);
        }, 180);
      }
    } else {
      clearDone('story');
      ['m1','m2','m3'].forEach(clearDone);
      updateUnlocks();
    }
  });
}

['m1','m2','m3'].forEach(id => {
  const btn = document.getElementById(`${id}Button`);
  const input = document.getElementById(`${id}Keyword`);
  if (btn) btn.addEventListener('click', () => checkMissionKeyword(id));
  if (input) input.addEventListener('keydown', event => {
    if (event.key === 'Enter') checkMissionKeyword(id);
  });
});

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const code = btn.parentElement.querySelector('code');
    const text = code ? code.innerText.trim() : '';
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'コピー済';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'コピー';
        btn.classList.remove('copied');
      }, 1600);
    } catch (e) {
      btn.textContent = '失敗';
      setTimeout(() => btn.textContent = 'コピー', 1600);
    }
  });
});

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function scrollToTopSmooth(duration = 900) {
  const startY = window.scrollY || document.documentElement.scrollTop;
  if (startY === 0) return Promise.resolve();
  return new Promise(resolve => {
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startY * (1 - eased));
      if (progress < 1) requestAnimationFrame(step);
      else { window.scrollTo(0, 0); resolve(); }
    }
    requestAnimationFrame(step);
  });
}

function showSuccessCard() {
  successScreen.hidden = false;
  successScreen.classList.remove('show');
  document.body.classList.add('escape-complete');
  requestAnimationFrame(() => successScreen.classList.add('show'));
}

function hideSuccessCard() {
  successScreen.classList.remove('show');
  document.body.classList.remove('escape-complete');
  setTimeout(() => { successScreen.hidden = true; }, 180);
}

async function tryEscape() {
  const keywords = window.KAKOKU_MISSION_KEYWORDS_B64 || {};
  const correctKeyword = b64ToUtf8(keywords.final || '');
  const input = normalizeKeyword(escapeKeyword.value);
  const correct = normalizeKeyword(correctKeyword);
  if (input === correct) {
    escapeError.hidden = true;
    await scrollToTopSmooth(950);
    showSuccessCard();
  } else {
    escapeError.hidden = false;
    escapeKeyword.focus();
  }
}

if (escapeButton) escapeButton.addEventListener('click', tryEscape);
if (escapeKeyword) escapeKeyword.addEventListener('keydown', event => {
  if (event.key === 'Enter') tryEscape();
});
if (closeSuccess) closeSuccess.addEventListener('click', hideSuccessCard);
if (successScreen) successScreen.addEventListener('click', event => {
  if (event.target === successScreen) hideSuccessCard();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && successScreen && !successScreen.hidden) hideSuccessCard();
});

if (resetProgress) {
  resetProgress.addEventListener('click', () => {
    ['story','m1','m2','m3'].forEach(clearDone);
    document.querySelectorAll('.keyword-error').forEach(el => el.hidden = true);
    document.querySelectorAll('.keyword-ok').forEach(el => el.hidden = true);
    document.querySelectorAll('.keyword-row input').forEach(input => input.value = '');
    updateUnlocks();
    if (openingStory) {
      openingStory.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setOpen(openingStory, true);
    }
  });
}

updateUnlocks();
