// workout.js — turns (settings + rank + date) into today's "match" (workout).

import { poolFor } from './exercises.js';

// For a given number of training days/week, which weekday (0=Sun..6=Sat) gets which category.
// Anything not listed is a rest day.
const SCHEDULES = {
  3: { 1: 'fullbody', 3: 'fullbody', 5: 'fullbody' },
  4: { 1: 'push', 2: 'legs', 4: 'pull', 6: 'fullbody' },
  5: { 1: 'push', 2: 'pull', 3: 'legs', 4: 'cardio', 5: 'core' },
  6: { 1: 'push', 2: 'pull', 3: 'legs', 4: 'cardio', 5: 'core', 6: 'fullbody' },
  7: { 0: 'recovery', 1: 'push', 2: 'pull', 3: 'legs', 4: 'cardio', 5: 'core', 6: 'fullbody' },
};

const LENGTH_TO_COUNT = { 15: 4, 30: 6, 45: 8, 60: 10 };

export function categoryFor(dateObj, daysPerWeek) {
  const schedule = SCHEDULES[daysPerWeek] || SCHEDULES[4];
  return schedule[dateObj.getDay()] || 'rest';
}

// Tiny deterministic PRNG so "today's" workout doesn't reshuffle on every page reload,
// but still looks different from yesterday.
function seededRandom(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function scale(exercise, tierIndex) {
  const mult = 1 + tierIndex * 0.07;
  const out = { ...exercise, completedSets: 0 };
  out.sets = exercise.sets + Math.floor(tierIndex / 2);
  if (exercise.type === 'reps') {
    out.reps = Math.round(exercise.reps * mult);
  } else {
    out.seconds = Math.round(exercise.seconds * mult);
  }
  return out;
}

/**
 * Generate (deterministically, for the given date) today's workout.
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {object} settings { daysPerWeek, equipment: string[], sessionLength }
 * @param {number} tierIndex current rank tier, used to scale difficulty
 */
export function generateWorkout(dateStr, settings, tierIndex) {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const category = categoryFor(dateObj, settings.daysPerWeek);
  const isRest = category === 'rest' || category === 'recovery';
  const count = LENGTH_TO_COUNT[settings.sessionLength] || 6;
  const effectiveCategory = category === 'rest' ? 'recovery' : category;

  const pool = poolFor(effectiveCategory, settings.equipment);
  const rand = seededRandom(dateStr + effectiveCategory);
  const picked = [];
  const shuffled = shuffle(pool, rand);
  let idx = 0;
  const targetCount = category === 'rest' ? Math.min(3, count) : count;
  while (picked.length < targetCount && shuffled.length > 0) {
    picked.push(scale(shuffled[idx % shuffled.length], category === 'rest' ? 0 : tierIndex));
    idx++;
    if (idx > targetCount * 3) break; // safety valve
  }

  return {
    date: dateStr,
    category: effectiveCategory,
    isRest: category === 'rest',
    exercises: picked,
    estimatedMinutes: category === 'rest' ? 10 : settings.sessionLength,
  };
}
