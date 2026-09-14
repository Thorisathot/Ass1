// storage.js — state persistence, date helpers, streak/decay ("rank stress") processing.

import { freshRank, removePoints } from './rank.js';
import { categoryFor } from './workout.js';

const STORAGE_KEY = 'gr_fitness_state_v1';
const DECAY_AMOUNT = 40;      // points lost per missed scheduled workout
const MAX_FREEZES = 2;        // streak-freeze tokens you can bank
const FREEZE_REFILL_DAYS = 7; // earn a new freeze token every N days
const MAX_BACKFILL_DAYS = 10; // don't punish someone forever for a long absence

export function todayStr(d = new Date()) {
  return dateStr(d);
}

export function dateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(str, n) {
  const d = new Date(str + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return dateStr(d);
}

function isScheduledTrainingDay(dStr, daysPerWeek) {
  const d = new Date(dStr + 'T00:00:00');
  const cat = categoryFor(d, daysPerWeek);
  return cat !== 'rest' && cat !== 'recovery';
}

export function defaultState() {
  return {
    onboarded: false,
    profile: { name: '' },
    settings: { daysPerWeek: 5, equipment: ['none'], sessionLength: 30 },
    rank: freshRank(),
    streak: { current: 0, longest: 0 },
    freezes: { count: 1, lastRefillDate: todayStr() },
    lastProcessedDate: todayStr(),
    history: [],
    achievements: { unlocked: [] },
    todayWorkout: null,
    lastEvent: null, // transient info for the UI: { type, ... }
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    // shallow-merge with defaults so new fields added in updates don't crash old saves
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile || {}) },
      settings: { ...base.settings, ...(parsed.settings || {}) },
      rank: { ...base.rank, ...(parsed.rank || {}) },
      streak: { ...base.streak, ...(parsed.streak || {}) },
      freezes: { ...base.freezes, ...(parsed.freezes || {}) },
      achievements: { ...base.achievements, ...(parsed.achievements || {}) },
    };
  } catch (e) {
    console.warn('Could not load saved state, starting fresh.', e);
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Walk forward from state.lastProcessedDate to yesterday, applying rank decay for
 * any missed scheduled training day, refilling streak-freeze tokens over time, and
 * resetting the current streak when a day is missed unprotected.
 * Returns a summary the UI can use to show a "while you were away" toast.
 */
export function processElapsedTime(state) {
  const today = todayStr();
  if (state.lastProcessedDate >= today) return { missedDays: 0, decayed: 0, protectedDays: 0 };

  let cursor = state.lastProcessedDate;
  let daysWalked = 0;
  let decayed = 0;
  let protectedDays = 0;
  let missedDays = 0;
  let cappedOff = false;

  while (cursor < today) {
    daysWalked++;
    if (daysWalked > MAX_BACKFILL_DAYS) {
      cappedOff = true;
      break;
    }

    // Refill streak freezes periodically.
    const daysSinceRefill = (new Date(cursor) - new Date(state.freezes.lastRefillDate)) / 86400000;
    if (daysSinceRefill >= FREEZE_REFILL_DAYS && state.freezes.count < MAX_FREEZES) {
      state.freezes.count += 1;
      state.freezes.lastRefillDate = cursor;
    }

    const hasEntry = state.history.some((h) => h.date === cursor);
    if (!hasEntry && isScheduledTrainingDay(cursor, state.settings.daysPerWeek)) {
      missedDays++;
      if (state.freezes.count > 0) {
        state.freezes.count -= 1;
        protectedDays++;
        state.history.push({
          date: cursor, category: 'missed', isRest: false,
          completed: false, protectedByFreeze: true, pointsDelta: 0,
        });
      } else {
        removePoints(state.rank, DECAY_AMOUNT);
        decayed++;
        state.streak.current = 0;
        state.history.push({
          date: cursor, category: 'missed', isRest: false,
          completed: false, protectedByFreeze: false, pointsDelta: -DECAY_AMOUNT,
        });
      }
    }
    cursor = addDays(cursor, 1);
  }

  state.lastProcessedDate = cappedOff ? addDays(today, -1) : cursor;
  return { missedDays, decayed, protectedDays, cappedOff };
}

export { DECAY_AMOUNT, isScheduledTrainingDay };
