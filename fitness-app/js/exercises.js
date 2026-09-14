// exercises.js — exercise library, grouped by category and required equipment tier.
// type: 'reps' (sets x reps) or 'time' (sets x seconds)

export const CATEGORIES = {
  push:     { label: 'Push Day',        emoji: '💪' },
  pull:     { label: 'Pull Day',        emoji: '🏋️' },
  legs:     { label: 'Leg Day',         emoji: '🦵' },
  core:     { label: 'Core Day',        emoji: '🔥' },
  cardio:   { label: 'Cardio / HIIT',   emoji: '🏃' },
  fullbody: { label: 'Full Body',       emoji: '⚡' },
  recovery: { label: 'Active Recovery', emoji: '🧘' },
};

// equipment: 'none' | 'dumbbells' | 'gym'  — an exercise tagged 'dumbbells' or 'gym'
// only appears if the player has that equipment available.
const LIB = {
  push: [
    { name: 'Push-ups',              type: 'reps', sets: 3, reps: 10, equipment: 'none' },
    { name: 'Incline Push-ups',      type: 'reps', sets: 3, reps: 12, equipment: 'none' },
    { name: 'Diamond Push-ups',      type: 'reps', sets: 3, reps: 8,  equipment: 'none' },
    { name: 'Pike Push-ups',         type: 'reps', sets: 3, reps: 8,  equipment: 'none' },
    { name: 'Wall/Floor Dips',       type: 'reps', sets: 3, reps: 10, equipment: 'none' },
    { name: 'Shoulder Taps',         type: 'reps', sets: 3, reps: 16, equipment: 'none' },
    { name: 'Dumbbell Bench Press',  type: 'reps', sets: 3, reps: 10, equipment: 'dumbbells' },
    { name: 'Dumbbell Shoulder Press', type: 'reps', sets: 3, reps: 10, equipment: 'dumbbells' },
    { name: 'Dumbbell Flyes',        type: 'reps', sets: 3, reps: 12, equipment: 'dumbbells' },
    { name: 'Barbell Bench Press',   type: 'reps', sets: 4, reps: 8,  equipment: 'gym' },
    { name: 'Cable Chest Fly',       type: 'reps', sets: 3, reps: 12, equipment: 'gym' },
    { name: 'Tricep Pushdown',       type: 'reps', sets: 3, reps: 12, equipment: 'gym' },
  ],
  pull: [
    { name: 'Superman Holds',        type: 'time', sets: 3, seconds: 25, equipment: 'none' },
    { name: 'Doorway Rows',          type: 'reps', sets: 3, reps: 12, equipment: 'none' },
    { name: 'Reverse Snow Angels',   type: 'reps', sets: 3, reps: 15, equipment: 'none' },
    { name: 'Towel Face Pulls',      type: 'reps', sets: 3, reps: 15, equipment: 'none' },
    { name: 'Pull-ups',              type: 'reps', sets: 3, reps: 6,  equipment: 'none' },
    { name: 'Dumbbell Rows',         type: 'reps', sets: 3, reps: 10, equipment: 'dumbbells' },
    { name: 'Dumbbell Deadlifts',    type: 'reps', sets: 3, reps: 10, equipment: 'dumbbells' },
    { name: 'Dumbbell Bicep Curls',  type: 'reps', sets: 3, reps: 12, equipment: 'dumbbells' },
    { name: 'Barbell Rows',          type: 'reps', sets: 4, reps: 8,  equipment: 'gym' },
    { name: 'Lat Pulldown',          type: 'reps', sets: 3, reps: 10, equipment: 'gym' },
    { name: 'Seated Cable Row',      type: 'reps', sets: 3, reps: 12, equipment: 'gym' },
  ],
  legs: [
    { name: 'Bodyweight Squats',     type: 'reps', sets: 3, reps: 15, equipment: 'none' },
    { name: 'Walking Lunges',        type: 'reps', sets: 3, reps: 12, equipment: 'none' },
    { name: 'Glute Bridges',         type: 'reps', sets: 3, reps: 15, equipment: 'none' },
    { name: 'Bulgarian Split Squats',type: 'reps', sets: 3, reps: 10, equipment: 'none' },
    { name: 'Wall Sit',              type: 'time', sets: 3, seconds: 40, equipment: 'none' },
    { name: 'Calf Raises',           type: 'reps', sets: 3, reps: 20, equipment: 'none' },
    { name: 'Jump Squats',           type: 'reps', sets: 3, reps: 12, equipment: 'none' },
    { name: 'Dumbbell Goblet Squats',type: 'reps', sets: 3, reps: 12, equipment: 'dumbbells' },
    { name: 'Dumbbell Lunges',       type: 'reps', sets: 3, reps: 10, equipment: 'dumbbells' },
    { name: 'Barbell Squats',        type: 'reps', sets: 4, reps: 8,  equipment: 'gym' },
    { name: 'Leg Press',             type: 'reps', sets: 3, reps: 10, equipment: 'gym' },
    { name: 'Leg Curl Machine',      type: 'reps', sets: 3, reps: 12, equipment: 'gym' },
  ],
  core: [
    { name: 'Plank',                 type: 'time', sets: 3, seconds: 35, equipment: 'none' },
    { name: 'Bicycle Crunches',      type: 'reps', sets: 3, reps: 20, equipment: 'none' },
    { name: 'Mountain Climbers',     type: 'time', sets: 3, seconds: 30, equipment: 'none' },
    { name: 'Russian Twists',        type: 'reps', sets: 3, reps: 20, equipment: 'none' },
    { name: 'Leg Raises',            type: 'reps', sets: 3, reps: 12, equipment: 'none' },
    { name: 'Side Plank (each side)',type: 'time', sets: 2, seconds: 25, equipment: 'none' },
    { name: 'Flutter Kicks',         type: 'time', sets: 3, seconds: 30, equipment: 'none' },
    { name: 'Hollow Body Hold',      type: 'time', sets: 3, seconds: 20, equipment: 'none' },
    { name: 'Cable Woodchoppers',    type: 'reps', sets: 3, reps: 12, equipment: 'gym' },
    { name: 'Weighted Sit-ups',      type: 'reps', sets: 3, reps: 15, equipment: 'dumbbells' },
  ],
  cardio: [
    { name: 'Jumping Jacks',         type: 'time', sets: 4, seconds: 30, equipment: 'none' },
    { name: 'High Knees',            type: 'time', sets: 4, seconds: 30, equipment: 'none' },
    { name: 'Burpees',               type: 'reps', sets: 4, reps: 10, equipment: 'none' },
    { name: 'Butt Kicks',            type: 'time', sets: 4, seconds: 30, equipment: 'none' },
    { name: 'Skater Hops',           type: 'time', sets: 3, seconds: 30, equipment: 'none' },
    { name: 'Shadow Boxing',         type: 'time', sets: 3, seconds: 45, equipment: 'none' },
    { name: 'Jump Rope (or mimed)',  type: 'time', sets: 4, seconds: 45, equipment: 'none' },
    { name: 'Sprint Intervals',      type: 'time', sets: 5, seconds: 20, equipment: 'none' },
    { name: 'Stair/Step Climbs',     type: 'time', sets: 4, seconds: 40, equipment: 'none' },
  ],
  fullbody: [
    { name: 'Burpees',               type: 'reps', sets: 3, reps: 10, equipment: 'none' },
    { name: 'Squat to Press (air)',  type: 'reps', sets: 3, reps: 12, equipment: 'none' },
    { name: 'Bear Crawl',            type: 'time', sets: 3, seconds: 30, equipment: 'none' },
    { name: 'Mountain Climbers',     type: 'time', sets: 3, seconds: 30, equipment: 'none' },
    { name: 'Plank to Push-up',      type: 'reps', sets: 3, reps: 10, equipment: 'none' },
    { name: 'Jump Lunges',           type: 'reps', sets: 3, reps: 12, equipment: 'none' },
    { name: 'Dumbbell Thrusters',    type: 'reps', sets: 3, reps: 10, equipment: 'dumbbells' },
    { name: 'Dumbbell Snatch',       type: 'reps', sets: 3, reps: 8,  equipment: 'dumbbells' },
    { name: 'Kettlebell/DB Swings',  type: 'reps', sets: 3, reps: 15, equipment: 'dumbbells' },
    { name: 'Barbell Clean & Press', type: 'reps', sets: 3, reps: 6,  equipment: 'gym' },
    { name: 'Battle Ropes',          type: 'time', sets: 4, seconds: 30, equipment: 'gym' },
  ],
  recovery: [
    { name: 'Cat-Cow Stretch',       type: 'time', sets: 2, seconds: 30, equipment: 'none' },
    { name: "World's Greatest Stretch", type: 'reps', sets: 2, reps: 6, equipment: 'none' },
    { name: 'Child\'s Pose',         type: 'time', sets: 2, seconds: 40, equipment: 'none' },
    { name: 'Hip Flexor Stretch',    type: 'time', sets: 2, seconds: 30, equipment: 'none' },
    { name: 'Neck & Shoulder Rolls', type: 'time', sets: 2, seconds: 30, equipment: 'none' },
    { name: 'Standing Quad Stretch', type: 'time', sets: 2, seconds: 30, equipment: 'none' },
    { name: 'Deep Breathing Walk',   type: 'time', sets: 1, seconds: 120, equipment: 'none' },
    { name: 'Foam Rolling / Self Massage', type: 'time', sets: 1, seconds: 120, equipment: 'none' },
  ],
};

const EQUIPMENT_RANK = { none: 0, dumbbells: 1, gym: 2 };

export function poolFor(category, ownedEquipment) {
  const ownedMax = ownedEquipment.reduce((m, e) => Math.max(m, EQUIPMENT_RANK[e] ?? 0), 0);
  return LIB[category].filter((ex) => (EQUIPMENT_RANK[ex.equipment] ?? 0) <= ownedMax);
}
