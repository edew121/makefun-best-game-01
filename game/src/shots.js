// Deterministic screenshot scenes for Simmerdown: Dinner Rush.
// The game renders a fixed scene for ?shot=title|play|shop|win&seed=N:
// a seeded generator builds the same state every time, the renderer draws
// one frame, and the page sets window.__shotReady so a headless browser
// knows the shot is done. These are real renders of the game's own code.

import { Game } from './game.js';
import { makeTicket } from './orders.js';
import { makeRng } from './rng.js';

export function buildShotScene(name, seed) {
  const rng = makeRng(seed);
  const game = new Game();
  game.rng = rng;

  if (name === 'title') {
    game.state = 'title';
    game.best = 320;
    game.player.reset(200, 480);
    game.player.facing = 'right';
    game.tickets = [
      makeTicket('classic', 38, rng),
      makeTicket('garden', 26, rng),
    ];
    game.grill[0] = { item: 'patty_raw', t: 4.2, dur: 6, done: false, burn: 0 };
    game.plateOnCounter = { items: ['bun', 'lettuce'] };
    return game;
  }

  if (name === 'play') {
    game.state = 'playing';
    game.rushIndex = 1;
    game.rushTimeLeft = 62;
    game.coins = 84;
    game.rushCoins = 84;
    game.hearts = 2;
    game.maxHearts = 3;
    game.combo = 3;
    game.bestCombo = 3;
    game.serves = 9;
    game.tickets = [
      makeTicket('cheese', 42, rng),
      makeTicket('classic', 42, rng),
      makeTicket('double', 42, rng),
    ];
    game.tickets[0].patience = 8;
    game.tickets[1].patience = 25;
    game.tickets[2].patience = 38;
    game.grill[0] = { item: 'patty_raw', t: 4.2, dur: 6, done: false, burn: 0 };
    game.board[0] = { item: 'tomato', raw: 'tomato_raw', t: 3, dur: 3, done: true };
    game.plateOnCounter = { items: ['bun', 'lettuce'] };
    game.player.reset(640, 240);
    game.player.carrying = { kind: 'plate', items: ['bun', 'patty', 'cheese'] };
    game.player.facing = 'up';
    game.particles.burst(640, 60, '#ffd94d', 10, 120);
    game.particles.steam(1224, 140);
    game.particles.steam(1224, 150);
    return game;
  }

  if (name === 'shop') {
    game.state = 'shop';
    game.rushIndex = 0;
    game.coins = 96;
    game.rushCoins = 64;
    game.upgradesOwned = new Set(['shoes']);
    game.serves = 7;
    return game;
  }

  if (name === 'win') {
    game.state = 'win';
    game.rushIndex = 2;
    game.coins = 268;
    game.serves = 21;
    game.tipsEarned = 74;
    game.bestCombo = 5;
    game.walkouts = 0;
    game.stars = 3;
    game.best = 268;
    return game;
  }

  return game;
}
