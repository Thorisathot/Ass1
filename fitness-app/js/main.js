// main.js — app init, routing between screens, and all event wiring.

import { loadState, saveState, resetState, processElapsedTime, todayStr } from './storage.js';
import { addPoints } from './rank.js';
import { generateWorkout } from './workout.js';
import { computeWorkoutPoints } from './scoring.js';
import { checkAchievements } from './achievements.js';
import {
  renderDashboard, renderHistory, renderAchievements, renderSettings,
  renderWorkoutScreen, renderResultModal,
} from './ui.js';

let state = loadState();

const el = (id) => document.getElementById(id);

function ensureTodayWorkout() {
  const today = todayStr();
  if (!state.todayWorkout || state.todayWorkout.date !== today) {
    state.todayWorkout = generateWorkout(today, state.settings, state.rank.tierIndex);
  }
}

function showToast(msg) {
  const t = el('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => { t.hidden = true; }, 6000);
}

function goScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
  const target = el(`screen-${name}`);
  if (target) target.classList.add('active');
  const tab = document.querySelector(`.tab[data-screen="${name}"]`);
  if (tab) tab.classList.add('active');
  renderCurrentScreen(name);
}

function currentScreenName() {
  const active = document.querySelector('.screen.active');
  return active ? active.id.replace('screen-', '') : 'dashboard';
}

function renderCurrentScreen(name = currentScreenName()) {
  if (name === 'dashboard') el('screen-dashboard').innerHTML = renderDashboard(state);
  if (name === 'history') el('screen-history').innerHTML = renderHistory(state);
  if (name === 'achievements') el('screen-achievements').innerHTML = renderAchievements(state);
  if (name === 'settings') el('screen-settings').innerHTML = renderSettings(state);
  if (name === 'workout') el('screen-workout').innerHTML = renderWorkoutScreen(state);
}

function refreshAll() {
  renderCurrentScreen();
}

// ---------- onboarding ----------
function initOnboarding() {
  const groups = { equipment: new Set(['none']), days: 5, length: 30 };

  function wireChipGroup(containerId, onChange, multi) {
    const container = el(containerId);
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      if (multi) {
        const val = btn.dataset.value;
        if (val === 'none') return; // bodyweight baseline always on
        btn.classList.toggle('active');
      } else {
        container.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
        btn.classList.add('active');
      }
      onChange(container);
    });
  }

  wireChipGroup('ob-equipment', (c) => {
    groups.equipment = new Set(['none', ...[...c.querySelectorAll('.chip.active')].map((b) => b.dataset.value)]);
  }, true);
  wireChipGroup('ob-days', (c) => { groups.days = Number(c.querySelector('.chip.active').dataset.value); });
  wireChipGroup('ob-length', (c) => { groups.length = Number(c.querySelector('.chip.active').dataset.value); });

  el('ob-submit').addEventListener('click', () => {
    const name = el('ob-name').value.trim();
    state.profile.name = name || 'Athlete';
    state.settings.equipment = Array.from(groups.equipment);
    state.settings.daysPerWeek = groups.days;
    state.settings.sessionLength = groups.length;
    state.onboarded = true;
    ensureTodayWorkout();
    saveState(state);
    el('onboarding').hidden = true;
    el('app').hidden = false;
    goScreen('dashboard');
  });
}

// ---------- workout screen interactions ----------
function wireWorkoutScreenEvents() {
  const container = el('screen-workout');
  container.addEventListener('click', (e) => {
    const dot = e.target.closest('.set-dot');
    if (dot && !state.todayWorkout.submitted) {
      const exIdx = Number(dot.dataset.ex);
      const setIdx = Number(dot.dataset.set);
      const ex = state.todayWorkout.exercises[exIdx];
      ex.completedSets = ex.completedSets > setIdx ? setIdx : setIdx + 1;
      saveState(state);
      renderCurrentScreen('workout');
      return;
    }
    if (e.target.id === 'back-to-dashboard') { goScreen('dashboard'); return; }
    if (e.target.id === 'submit-workout') { submitWorkout(); return; }
  });
  container.addEventListener('input', (e) => {
    if (e.target.id === 'rpe-slider') {
      el('rpe-value').textContent = e.target.value;
    }
  });
}

function submitWorkout() {
  const w = state.todayWorkout;
  if (!w || w.submitted) return;
  const rpeSlider = el('rpe-slider');
  const rpe = rpeSlider ? Number(rpeSlider.value) : 5;
  const exercisesTotal = w.exercises.length;
  const exercisesCompleted = w.exercises.filter((ex) => ex.completedSets >= ex.sets).length;

  if (exercisesCompleted === 0) {
    openResultModal({ points: 0, promoted: false, newAch: [], perfect: false, isRest: w.isRest });
    return;
  }

  const wasBrokenStreak = state.streak.current === 0 && state.streak.longest > 0;
  const points = computeWorkoutPoints({
    exercisesTotal, exercisesCompleted, rpe, streakDays: state.streak.current, isRest: w.isRest,
  });
  const { promoted } = addPoints(state.rank, points);
  if (!w.isRest) {
    state.streak.current += 1;
    state.streak.longest = Math.max(state.streak.longest, state.streak.current);
  }
  const perfect = exercisesCompleted === exercisesTotal && exercisesTotal > 0;
  state.history.push({
    date: w.date, category: w.category, isRest: w.isRest, completed: true,
    pointsDelta: points, rpe, exercisesTotal, exercisesCompleted, perfect,
    comeback: wasBrokenStreak && !w.isRest,
  });
  w.submitted = true;
  const newAch = checkAchievements(state);
  saveState(state);
  openResultModal({ points, promoted, newAch, perfect, isRest: w.isRest });
}

function openResultModal(data) {
  el('result-card-content').innerHTML = renderResultModal(data);
  el('result-modal').hidden = false;
}

function wireResultModal() {
  el('result-modal').addEventListener('click', (e) => {
    if (e.target.id === 'close-result' || e.target.id === 'result-modal') {
      el('result-modal').hidden = true;
      refreshAll();
    }
  });
}

// ---------- dashboard ----------
function wireDashboardEvents() {
  el('screen-dashboard').addEventListener('click', (e) => {
    if (e.target.id === 'go-to-workout') {
      goScreen('workout');
    }
  });
}

// ---------- settings ----------
function wireSettingsEvents() {
  const container = el('screen-settings');
  container.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip) {
      const group = chip.closest('.chip-row');
      if (group.id === 'set-equipment') {
        if (chip.dataset.value !== 'none') chip.classList.toggle('active');
      } else {
        group.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
      }
      return;
    }
    if (e.target.id === 'save-settings') {
      const name = el('set-name').value.trim();
      const equipment = ['none', ...[...document.querySelectorAll('#set-equipment .chip.active')].map((b) => b.dataset.value).filter((v) => v !== 'none')];
      const days = Number(document.querySelector('#set-days .chip.active').dataset.value);
      const length = Number(document.querySelector('#set-length .chip.active').dataset.value);
      state.profile.name = name || state.profile.name;
      state.settings.equipment = Array.from(new Set(equipment));
      state.settings.daysPerWeek = days;
      state.settings.sessionLength = length;
      saveState(state);
      showToast('Settings saved.');
      return;
    }
    if (e.target.id === 'reset-progress') {
      if (confirm('This will permanently erase your rank, streak, and history. Continue?')) {
        resetState();
        state = loadState();
        ensureTodayWorkout();
        saveState(state);
        goScreen('dashboard');
        showToast('Progress reset. Fresh start!');
      }
    }
  });
}

// ---------- nav ----------
function wireNav() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => goScreen(tab.dataset.screen));
  });
}

// ---------- init ----------
function init() {
  wireNav();
  wireDashboardEvents();
  wireWorkoutScreenEvents();
  wireResultModal();
  wireSettingsEvents();

  if (!state.onboarded) {
    initOnboarding();
    el('onboarding').hidden = false;
    return;
  }

  const summary = processElapsedTime(state);
  ensureTodayWorkout();
  saveState(state);

  el('app').hidden = false;
  goScreen('dashboard');

  if (summary.decayed > 0 || summary.protectedDays > 0 || summary.cappedOff) {
    const bits = [];
    if (summary.protectedDays) bits.push(`${summary.protectedDays} miss protected by a streak freeze`);
    if (summary.decayed) bits.push(`${summary.decayed} missed day(s) cost you rank points`);
    if (summary.cappedOff) bits.push(`welcome back — we capped the penalty so you're not buried`);
    showToast('While you were away: ' + bits.join('; ') + '.');
  }
}

init();
