// scoring.js — converts a finished workout into MMR-style points.

export function computeWorkoutPoints({ exercisesTotal, exercisesCompleted, rpe, streakDays, isRest }) {
  if (isRest) {
    return exercisesCompleted > 0 ? 30 : 0;
  }
  const fullyCompleted = exercisesTotal > 0 && exercisesCompleted >= exercisesTotal;
  let points = 60;
  points += 6 * exercisesCompleted;
  points += 2 * (rpe || 0);
  points += Math.min(streakDays, 15) * 3;
  if (fullyCompleted) points += 20;
  return Math.round(points);
}
