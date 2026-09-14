# 🏆 Gains Ranked

A gamified fitness app: it generates you a workout every day and ranks you on a
Dota 2-style competitive ladder — **Herald → Guardian → Crusader → Archon →
Legend → Ancient → Divine → Immortal**, each tier with 5 stars. Finish
workouts to climb; skip scheduled training days and your rank decays. It's
built to be the "carrot on a stick": fast, visible progress, streaks, and
badges to chase, with a couple of forgiveness mechanics so a bad week doesn't
tank your motivation entirely.

No install, no backend, no login — it's a static site that saves your
progress in your browser.

## Running it

Just open `index.html` in a browser, or serve the folder locally:

```bash
npx http-server fitness-app -p 8080
# then visit http://localhost:8080
```

(It uses ES modules, so it needs to be served over `http://`/`https://` rather
than opened directly as a `file://` URL in some browsers due to CORS rules on
module scripts.)

## How the game works

**Daily match** — Every day you get an auto-generated workout based on your
settings (equipment, session length, training days/week) and a rotating split
(Push / Pull / Legs / Cardio / Core / Full Body, with rest or active-recovery
days built in). Workouts get harder — more sets, more reps/seconds — as your
rank climbs.

**Ranked points** — Completing a workout earns points based on how many
exercises you fully finished, your self-rated effort (RPE), your current
streak, and a bonus for a full clear. Enough points fills a star; 5 stars
promotes you to the next tier, just like ranked MMR.

**Rank decay** — Skip a scheduled training day and you lose points off your
current star (and your streak resets) — unless you have a streak-freeze token
banked (you earn one every 7 days, up to 2), which auto-protects your first
miss. If you're away for a long stretch, the penalty is capped rather than
burying you completely — the app wants you to come back, not give up.

**Streaks & achievements** — A visible streak counter, a 7-day calendar strip,
a Dota-style match history (Victory/Missed + point delta), and a badge board
(`First Blood`, `Rampage`, `Godlike`, rank-milestone badges, etc.) for extra
dopamine hits along the way.

## Project structure

```
fitness-app/
├── index.html          # screens/markup
├── styles.css          # dark, ranked-ladder-styled theme
└── js/
    ├── rank.js          # tier/star math, promotion & decay
    ├── exercises.js     # exercise library by category/equipment
    ├── workout.js        # turns (date, settings, rank) into a workout
    ├── scoring.js        # points-per-workout formula
    ├── achievements.js   # badge definitions + unlock checks
    ├── storage.js         # localStorage persistence, streak/decay processing
    ├── ui.js              # HTML rendering for each screen
    └── main.js            # app init, routing, event wiring
```

All state lives in `localStorage` under the key `gr_fitness_state_v1` — there's
a "Reset All Progress" button in Settings if you want to start a fresh season.
