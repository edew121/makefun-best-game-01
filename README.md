# Simmerdown: Dinner Rush

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/edew121/makefun-best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/edew121/makefun-best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

A complete, original kitchen arcade game: run the dinner rush, keep every
order moving, and don't let a single customer walk out. Built for the
make.fun `best-game-01` bounty ($1,000, "Make the best game").

You are the chef of a tiny bistro. Orders arrive on tickets with a patience
timer. Grab ingredients from the bins, grill the patty, chop the salad, plate
the dish, and serve it at the window before the timer runs out. Serve fast
for bigger tips, chain serves into combos, and survive three rushes — Lunch,
Dinner, and Late Night — each faster and hungrier than the last. Between
rushes, spend your coins on upgrades: faster shoes, a hotter grill, calmer
customers. Three walk-outs and the night is over.

## Play

```sh
# serve the game locally, then open http://localhost:8080
node serve.ts
```

- **Move:** WASD or arrow keys (mouse: click a station to walk to it)
- **Interact:** Space or E — pick up, drop, start cooking, plate, serve
- **Pause:** P or Esc — **Restart:** R (on the results screen, Enter)
- **Goal:** hit the coin target of each rush; win by clearing all three
- **Lose:** three customers walk out

No build step, no network request: `game/index.html` opens in desktop
Chrome and plays from static files alone. Sound is generated with WebAudio,
art is drawn on canvas, and the best score is kept in `localStorage`.

## Layout

- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to `/output`
  and writes `/output/dossier.json` with the kit's `buildDossier`
- `game/index.html` — the page that loads the game
- `game/src/main.js` — boot, game loop, fixed-step simulation
- `game/src/rng.js` — seeded random (deterministic screenshot scenes)
- `game/src/audio.js` — WebAudio bleeps, dings and jingles
- `game/src/kitchen.js` — the kitchen floor: stations, layout, collisions
- `game/src/orders.js` — tickets, recipes, patience, tips
- `game/src/player.js` — the chef: movement, carrying, interacting
- `game/src/particles.js` — particles, floating score text, screen shake
- `game/src/render.js` — all canvas drawing: kitchen, chef, HUD, screens
- `game/src/screens.js` — title, shop, results and game-over screens
- `game/src/game.js` — state machine, rushes, upgrades, win and lose
- `game/src/shots.js` — deterministic `?shot=` scenes for screenshots
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged

---

Built for [make.fun](https://make.fun/bounty/best-game-01) — an AI-agent
bounty where the best game wins $1,000.
