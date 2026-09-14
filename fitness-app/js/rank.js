// rank.js — the ranked ladder (Herald -> Immortal), MMR-style points, promotion/decay math.

export const IMMORTAL_INDEX = 7;

export const TIERS = [
  { name: 'Herald',   short: 'HRD', color: '#8d99ae' },
  { name: 'Guardian', short: 'GRD', color: '#4caf50' },
  { name: 'Crusader', short: 'CRU', color: '#26c6da' },
  { name: 'Archon',   short: 'ARC', color: '#5c6bc0' },
  { name: 'Legend',   short: 'LEG', color: '#ab47bc' },
  { name: 'Ancient',  short: 'ANC', color: '#ec407a' },
  { name: 'Divine',   short: 'DIV', color: '#ffca28' },
  { name: 'Immortal', short: 'IMM', color: '#ff6b6b' },
];

// Points required to fill one star at a given tier. Gets a little longer as you climb,
// same shape as a real ranked ladder (fast early ranks, grindier at the top).
export function starThreshold(tierIndex) {
  return 200 + tierIndex * 40;
}

export function freshRank() {
  return { tierIndex: 0, star: 1, points: 0, immortalScore: 0 };
}

export function tierOf(rank) {
  return TIERS[rank.tierIndex];
}

export function rankLabel(rank) {
  const tier = tierOf(rank);
  if (rank.tierIndex === IMMORTAL_INDEX) {
    return `Immortal #${Math.max(1, Math.floor(rank.immortalScore / 20) + 1)}`;
  }
  return `${tier.name} ${rank.star}`;
}

export function progressPct(rank) {
  if (rank.tierIndex === IMMORTAL_INDEX) return 100;
  return Math.min(100, Math.round((rank.points / starThreshold(rank.tierIndex)) * 100));
}

/**
 * Add points to the rank (a completed workout). Mutates `rank` in place.
 * Returns { promoted, newTierIndex } so the UI can show a rank-up celebration.
 */
export function addPoints(rank, amount) {
  if (amount <= 0) return { promoted: false };
  if (rank.tierIndex >= IMMORTAL_INDEX) {
    rank.immortalScore += amount;
    return { promoted: false };
  }

  rank.points += amount;
  let promoted = false;

  while (rank.tierIndex < IMMORTAL_INDEX && rank.points >= starThreshold(rank.tierIndex)) {
    rank.points -= starThreshold(rank.tierIndex);
    rank.star += 1;
    if (rank.star > 5) {
      rank.star = 1;
      rank.tierIndex += 1;
      promoted = true;
      if (rank.tierIndex === IMMORTAL_INDEX) {
        rank.immortalScore = Math.max(0, rank.points);
        rank.points = 0;
        rank.star = 0;
        break;
      }
    }
  }
  return { promoted, newTierIndex: rank.tierIndex };
}

/**
 * Remove points from the rank (a missed scheduled workout — rank decay).
 * Mutates `rank` in place. Returns { demoted }.
 */
export function removePoints(rank, amount) {
  if (amount <= 0) return { demoted: false };

  if (rank.tierIndex >= IMMORTAL_INDEX) {
    rank.immortalScore -= amount;
    if (rank.immortalScore < 0) {
      rank.tierIndex = IMMORTAL_INDEX - 1;
      rank.star = 5;
      rank.points = Math.max(0, starThreshold(rank.tierIndex) + rank.immortalScore);
      rank.immortalScore = 0;
      return { demoted: true };
    }
    return { demoted: false };
  }

  rank.points -= amount;
  let demoted = false;
  while (rank.points < 0) {
    if (rank.tierIndex === 0 && rank.star <= 1) {
      rank.points = 0; // floor: can't fall below Herald 1-star
      break;
    }
    rank.star -= 1;
    if (rank.star < 1) {
      rank.tierIndex -= 1;
      rank.star = 5;
      demoted = true;
    }
    rank.points += starThreshold(rank.tierIndex);
  }
  return { demoted };
}
