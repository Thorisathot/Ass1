// achievements.js — badges unlocked by stats. check(stats) returns true/false.

export const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood', emoji: '🩸',
    desc: 'Complete your very first workout.',
    check: (s) => s.totalCompleted >= 1 },

  { id: 'triple_kill', name: 'Triple Kill', emoji: '🔥',
    desc: 'Reach a 3-day streak.',
    check: (s) => s.longestStreak >= 3 },

  { id: 'rampage', name: 'Rampage', emoji: '💥',
    desc: 'Reach a 5-day streak.',
    check: (s) => s.longestStreak >= 5 },

  { id: 'godlike', name: 'Godlike', emoji: '👑',
    desc: 'Reach a 10-day streak.',
    check: (s) => s.longestStreak >= 10 },

  { id: 'unstoppable', name: 'Unstoppable', emoji: '🚀',
    desc: 'Reach a 21-day streak.',
    check: (s) => s.longestStreak >= 21 },

  { id: 'comeback_king', name: 'Comeback King', emoji: '🔁',
    desc: 'Bounce back with a workout after breaking a streak.',
    check: (s) => s.comebacks >= 1 },

  { id: 'perfectionist', name: 'Perfectionist', emoji: '✨',
    desc: 'Complete every set of a workout.',
    check: (s) => s.perfectWorkouts >= 1 },

  { id: 'centurion', name: 'Centurion', emoji: '🛡️',
    desc: 'Log 100 total workouts.',
    check: (s) => s.totalCompleted >= 100 },

  { id: 'rank_guardian', name: 'Climbing: Guardian', emoji: '🟢',
    desc: 'Reach Guardian rank.',
    check: (s) => s.tierIndex >= 1 },

  { id: 'rank_crusader', name: 'Climbing: Crusader', emoji: '🔵',
    desc: 'Reach Crusader rank.',
    check: (s) => s.tierIndex >= 2 },

  { id: 'rank_archon', name: 'Climbing: Archon', emoji: '🟣',
    desc: 'Reach Archon rank.',
    check: (s) => s.tierIndex >= 3 },

  { id: 'rank_legend', name: 'Climbing: Legend', emoji: '🟪',
    desc: 'Reach Legend rank.',
    check: (s) => s.tierIndex >= 4 },

  { id: 'rank_ancient', name: 'Climbing: Ancient', emoji: '🌸',
    desc: 'Reach Ancient rank.',
    check: (s) => s.tierIndex >= 5 },

  { id: 'rank_divine', name: 'Climbing: Divine', emoji: '🟡',
    desc: 'Reach Divine rank.',
    check: (s) => s.tierIndex >= 6 },

  { id: 'rank_immortal', name: 'Ascended: Immortal', emoji: '🏆',
    desc: 'Reach the Immortal rank.',
    check: (s) => s.tierIndex >= 7 },
];

/**
 * Compute derived stats from state, check every locked achievement, and return
 * the list of newly-unlocked achievement objects (also mutates state.achievements.unlocked).
 */
export function checkAchievements(state) {
  const stats = {
    totalCompleted: state.history.filter((h) => h.completed).length,
    longestStreak: state.streak.longest,
    comebacks: state.history.filter((h) => h.comeback).length,
    perfectWorkouts: state.history.filter((h) => h.perfect).length,
    tierIndex: state.rank.tierIndex,
  };

  const unlockedSet = new Set(state.achievements.unlocked);
  const newlyUnlocked = [];
  for (const ach of ACHIEVEMENTS) {
    if (!unlockedSet.has(ach.id) && ach.check(stats)) {
      unlockedSet.add(ach.id);
      newlyUnlocked.push(ach);
    }
  }
  state.achievements.unlocked = Array.from(unlockedSet);
  return newlyUnlocked;
}
