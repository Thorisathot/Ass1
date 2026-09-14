// ui.js — pure(ish) rendering: state in, HTML strings out. main.js wires up events.

import { TIERS, IMMORTAL_INDEX, progressPct, rankLabel, starThreshold } from './rank.js';
import { CATEGORIES } from './exercises.js';
import { ACHIEVEMENTS } from './achievements.js';
import { todayStr, addDays } from './storage.js';
import { categoryFor } from './workout.js';

export function renderMedal(rank) {
  const tier = TIERS[rank.tierIndex];
  const isImmortal = rank.tierIndex === IMMORTAL_INDEX;
  const cls = isImmortal ? 'medal immortal' : 'medal';
  const style = isImmortal ? '' : `style="--medal-color:${tier.color}"`;
  return `<div class="${cls}" ${style}>${tier.short}</div>`;
}

export function renderStars(rank) {
  if (rank.tierIndex === IMMORTAL_INDEX) {
    return `<div class="rank-sub">Leaderboard Score: <strong>${rank.immortalScore}</strong></div>`;
  }
  let stars = '<div class="stars">';
  for (let i = 1; i <= 5; i++) {
    stars += `<span class="star ${i <= rank.star ? 'filled' : ''}">★</span>`;
  }
  stars += '</div>';
  return stars;
}

export function renderRankCard(state) {
  const tier = TIERS[state.rank.tierIndex];
  const isImmortal = state.rank.tierIndex === IMMORTAL_INDEX;
  const pct = progressPct(state.rank);
  return `
  <div class="card rank-card">
    ${renderMedal(state.rank)}
    <div class="rank-info">
      <div class="rank-name">${rankLabel(state.rank)}</div>
      ${renderStars(state.rank)}
      ${!isImmortal ? `
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="rank-sub" style="margin-top:6px;">${state.rank.points} / ${starThreshold(state.rank.tierIndex)} pts to next star</div>
      ` : ''}
      <div class="stat-row">
        <div class="stat-pill">🔥 ${state.streak.current}-day streak</div>
        <div class="stat-pill">🏅 Best: ${state.streak.longest}</div>
        <div class="stat-pill">🧊 Freezes: ${state.freezes.count}</div>
      </div>
      <div class="freeze-note">A streak freeze auto-protects your rank the first time you miss a scheduled day. You bank one every 7 days (max 2).</div>
    </div>
  </div>`;
}

export function renderWeekStrip(state) {
  const today = todayStr();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    days.push(addDays(today, -i));
  }
  const cells = days.map((d) => {
    const dow = new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' })[0];
    const entry = state.history.find((h) => h.date === d);
    let cls = '';
    let icon = '·';
    if (d === today) {
      cls = 'today';
      icon = '⏳';
    } else if (entry && entry.completed) {
      cls = 'win'; icon = '🏆';
    } else if (entry && !entry.completed) {
      cls = entry.protectedByFreeze ? '' : 'loss';
      icon = entry.protectedByFreeze ? '🧊' : '✖';
    } else {
      const cat = categoryFor(new Date(d + 'T00:00:00'), state.settings.daysPerWeek);
      icon = (cat === 'rest' || cat === 'recovery') ? '💤' : '·';
    }
    return `<div class="day-cell ${cls}"><span class="dow">${dow}</span>${icon}</div>`;
  }).join('');
  return `<div class="week-strip">${cells}</div>`;
}

function exerciseDetail(ex) {
  if (ex.type === 'time') return `${ex.sets} × ${ex.seconds}s`;
  return `${ex.sets} × ${ex.reps} reps`;
}

export function renderWorkoutScreen(state) {
  const w = state.todayWorkout;
  if (!w) return `<div class="card">No workout generated yet.</div>`;
  const cat = CATEGORIES[w.category] || { label: w.category, emoji: '🏋️' };
  const submitted = !!w.submitted;

  const exerciseRows = w.exercises.map((ex, exIdx) => {
    const done = ex.completedSets >= ex.sets;
    const dots = Array.from({ length: ex.sets }).map((_, i) => {
      const filled = i < ex.completedSets;
      return `<div class="set-dot ${filled ? 'done' : ''}" data-ex="${exIdx}" data-set="${i}">${filled ? '✓' : i + 1}</div>`;
    }).join('');
    return `
    <li class="exercise-item ${done ? 'done' : ''}">
      <div>
        <div class="ex-name">${ex.name}</div>
        <div class="ex-detail">${exerciseDetail(ex)}</div>
      </div>
      <div class="set-dots">${dots}</div>
    </li>`;
  }).join('');

  return `
  <div class="card">
    <button class="btn" id="back-to-dashboard">← Back</button>
  </div>
  <div class="card">
    <div class="match-header">
      <div>
        <span class="match-badge">${cat.emoji} ${cat.label}</span>
        <h2 style="margin-top:8px;">${w.isRest ? "Today's Recovery Quest" : "Today's Match"}</h2>
      </div>
      <div class="rank-sub">~${w.estimatedMinutes} min</div>
    </div>
    <p>Tap a numbered dot on each exercise as you finish that set. ${w.isRest ? 'This one is optional — light bonus points, no penalty for skipping.' : 'Full completion + a high effort rating = max points.'}</p>
    <ul class="exercise-list">${exerciseRows}</ul>

    <div class="rpe-row">
      <label>Effort (RPE): <span id="rpe-value">5</span>/10
        <input type="range" min="1" max="10" value="5" id="rpe-slider" ${submitted ? 'disabled' : ''} />
      </label>
    </div>

    <div class="btn-row">
      <button class="btn btn-primary" id="submit-workout" ${submitted ? 'disabled' : ''}>
        ${submitted ? 'Match Submitted ✅' : 'Submit Match Result'}
      </button>
    </div>
  </div>`;
}

export function renderDashboard(state) {
  const w = state.todayWorkout;
  const cat = w ? (CATEGORIES[w.category] || { label: w.category, emoji: '🏋️' }) : null;
  return `
    ${renderRankCard(state)}
    <div class="card">
      <div class="section-title"><h3>This Week</h3></div>
      ${renderWeekStrip(state)}
    </div>
    <div class="card">
      <div class="match-header">
        <div>
          <span class="match-badge">${cat ? cat.emoji + ' ' + cat.label : ''}</span>
          <h2 style="margin-top:8px;">${w && w.isRest ? "Today's Recovery Quest" : "Today's Match"}</h2>
        </div>
        <div class="rank-sub">${w ? '~' + w.estimatedMinutes + ' min' : ''}</div>
      </div>
      <p>${w && w.submitted ? "You've already logged today's match. Nice work — see you tomorrow." : 'Complete it to bank points toward your next star.'}</p>
      <button class="btn btn-primary" id="go-to-workout" ${w && w.submitted ? 'disabled' : ''}>
        ${w && w.submitted ? 'Completed ✅' : (w && w.isRest ? 'Open Recovery Quest' : 'Start Today\'s Match →')}
      </button>
    </div>`;
}

export function renderHistory(state) {
  const rows = state.history.slice().reverse().slice(0, 60).map((h) => {
    let tag = 'missed', label = 'Missed';
    if (h.completed) { tag = 'victory'; label = h.isRest ? 'Recovery' : 'Victory'; }
    else if (h.protectedByFreeze) { tag = 'rest'; label = 'Protected'; }
    const delta = h.pointsDelta || 0;
    const catLabel = (CATEGORIES[h.category] || { label: h.category === 'missed' ? 'Missed Day' : h.category }).label;
    return `
    <div class="history-row">
      <div>
        <strong>${h.date}</strong>
        <div class="rank-sub" style="margin:0;">${catLabel}</div>
      </div>
      <span class="result-tag ${tag}">${label}</span>
      <span class="delta ${delta >= 0 ? 'pos' : 'neg'}">${delta >= 0 ? '+' : ''}${delta}</span>
    </div>`;
  }).join('');
  return `<div class="card"><h2>Match History</h2>${rows || '<div class="empty-note">No matches yet — go complete today\'s workout!</div>'}</div>`;
}

export function renderAchievements(state) {
  const unlocked = new Set(state.achievements.unlocked);
  const cards = ACHIEVEMENTS.map((a) => {
    const isUnlocked = unlocked.has(a.id);
    return `
    <div class="ach-card ${isUnlocked ? '' : 'locked'}">
      <div class="ach-emoji">${a.emoji}</div>
      <div>
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
      </div>
    </div>`;
  }).join('');
  return `<div class="card"><h2>Achievements (${unlocked.size}/${ACHIEVEMENTS.length})</h2><div class="ach-grid">${cards}</div></div>`;
}

export function renderSettings(state) {
  const eq = state.settings.equipment;
  return `
  <div class="card">
    <h2>Settings</h2>
    <label>Display name
      <input type="text" id="set-name" value="${state.profile.name || ''}" maxlength="20" />
    </label>
    <label>Equipment you have access to
      <div class="chip-row" id="set-equipment">
        <button type="button" class="chip ${eq.includes('none') ? 'active' : ''}" data-value="none">Bodyweight only</button>
        <button type="button" class="chip ${eq.includes('dumbbells') ? 'active' : ''}" data-value="dumbbells">+ Dumbbells</button>
        <button type="button" class="chip ${eq.includes('gym') ? 'active' : ''}" data-value="gym">+ Full gym</button>
      </div>
    </label>
    <label>Training days per week
      <div class="chip-row" id="set-days">
        ${[3,4,5,6,7].map((n) => `<button type="button" class="chip ${state.settings.daysPerWeek === n ? 'active' : ''}" data-value="${n}">${n}</button>`).join('')}
      </div>
    </label>
    <label>Session length
      <div class="chip-row" id="set-length">
        ${[15,30,45,60].map((n) => `<button type="button" class="chip ${state.settings.sessionLength === n ? 'active' : ''}" data-value="${n}">${n} min</button>`).join('')}
      </div>
    </label>
    <p class="rank-sub">Changing your schedule takes effect for tomorrow's match onward.</p>
    <button class="btn btn-primary" id="save-settings">Save Settings</button>
  </div>
  <div class="card">
    <h3>Danger Zone</h3>
    <p>This wipes your rank, streak, and history. There is no undo.</p>
    <button class="btn btn-danger" id="reset-progress">Reset All Progress</button>
  </div>`;
}

export function renderResultModal({ points, promoted, newAch, perfect, isRest }) {
  const title = points > 0 ? (isRest ? 'Recovery Complete' : 'Victory!') : 'No Points Earned';
  return `
    <div class="result-title ${points > 0 ? 'victory' : ''}">${title}</div>
    ${points > 0 ? `<div class="result-points">+${points}</div>` : '<p>Log at least one completed exercise to bank points.</p>'}
    ${perfect ? '<p>✨ Perfect clear — every set completed!</p>' : ''}
    ${promoted ? `<div class="result-rankup">🎉 RANK UP! You've been promoted.</div>` : ''}
    ${newAch && newAch.length ? `<div class="result-rankup">${newAch.map((a) => `${a.emoji} New badge: <strong>${a.name}</strong>`).join('<br/>')}</div>` : ''}
    <button class="btn btn-primary btn-block" id="close-result" style="margin-top:16px;">Nice</button>
  `;
}
