// Boot, input and the game loop for Simmerdown: Dinner Rush.
// The simulation runs on a fixed 1/60 s step; rendering happens every
// animation frame. With ?shot=<scene>&seed=<n> the page renders one
// deterministic scene instead, for screenshots.

import { Game } from './game.js';
import { drawKitchen, PALETTE } from './render.js';
import { VIEW_W, VIEW_H } from './kitchen.js';
import { drawTitle, drawShop, drawWin, drawGameOver, drawPause, pointInButton } from './screens.js';
import { unlockAudio } from './audio.js';
import { buildShotScene } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const shotSeed = Number(params.get('seed') ?? 7);

// Palette variants for screenshot comparison (?palette=cool|contrast).
// The shipped game always uses the warm default; these only recolour a
// single page load so variants can be judged side by side.
const paletteName = params.get('palette');
if (paletteName === 'cool') {
  Object.assign(PALETTE, {
    floorA: '#a9c9d8',
    floorB: '#97b7c8',
    wall: '#2e4a5a',
    wallTrim: '#40606e',
    wood: '#5d6d75',
    woodDark: '#47545c',
    cream: '#eef6f8',
  });
} else if (paletteName === 'contrast') {
  Object.assign(PALETTE, {
    floorA: '#f2d8a0',
    floorB: '#c08a3e',
    wall: '#3a1a0c',
    wallTrim: '#5a2a14',
    wood: '#6a3a18',
    woodDark: '#4a2810',
  });
}

const game = shotName ? buildShotScene(shotName, shotSeed) : new Game();
let screenButtons = null;

const input = { left: false, right: false, up: false, down: false };

function toCanvasCoords(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * VIEW_W,
    y: ((event.clientY - rect.top) / rect.height) * VIEW_H,
  };
}

function handleClick(x, y) {
  unlockAudio();
  if (game.state === 'title' && screenButtons?.start && pointInButton(x, y, screenButtons.start)) {
    game.startGame();
    return;
  }
  if (game.state === 'shop' && screenButtons) {
    for (const entry of screenButtons.upgrades ?? []) {
      if (pointInButton(x, y, entry)) {
        game.buyUpgrade(entry.upgrade);
        return;
      }
    }
    if (screenButtons.next && pointInButton(x, y, screenButtons.next)) {
      game.startRush(game.rushIndex + 1);
    }
    return;
  }
  if ((game.state === 'win' || game.state === 'gameover') && screenButtons?.again) {
    if (pointInButton(x, y, screenButtons.again)) game.startGame();
    return;
  }
  if (game.state === 'playing' && !game.paused) {
    const station = game.player.stationInReach();
    if (station) {
      const { x: sx, y: sy, w, h } = station;
      if (x >= sx - 10 && x <= sx + w + 10 && y >= sy - 10 && y <= sy + h + 10) {
        game.interact(station.id);
        return;
      }
    }
    game.player.setWalkTarget(x, y);
  }
}

canvas.addEventListener('click', (event) => {
  const point = toCanvasCoords(event);
  handleClick(point.x, point.y);
});

window.addEventListener('keydown', (event) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
    event.preventDefault();
  }
  unlockAudio();
  switch (event.code) {
    case 'ArrowLeft':
    case 'KeyA':
      input.left = true;
      break;
    case 'ArrowRight':
    case 'KeyD':
      input.right = true;
      break;
    case 'ArrowUp':
    case 'KeyW':
      input.up = true;
      break;
    case 'ArrowDown':
    case 'KeyS':
      input.down = true;
      break;
    case 'Space':
    case 'KeyE':
      if (!event.repeat) game.interact();
      break;
    case 'KeyP':
    case 'Escape':
      if (game.state === 'playing') game.paused = !game.paused;
      break;
    case 'KeyR':
      if (game.state === 'win' || game.state === 'gameover') game.startGame();
      break;
    case 'Enter':
      if (game.state === 'title') game.startGame();
      else if (game.state === 'win' || game.state === 'gameover') game.startGame();
      else if (game.state === 'shop') game.startRush(game.rushIndex + 1);
      break;
    case 'KeyM':
      import('./audio.js').then(({ setMuted }) => setMuted(true));
      break;
    default:
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'ArrowLeft':
    case 'KeyA':
      input.left = false;
      break;
    case 'ArrowRight':
    case 'KeyD':
      input.right = false;
      break;
    case 'ArrowUp':
    case 'KeyW':
      input.up = false;
      break;
    case 'ArrowDown':
    case 'KeyS':
      input.down = false;
      break;
    default:
      break;
  }
});

function render() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawKitchen(ctx, game);
  screenButtons = null;
  if (game.state === 'title') screenButtons = drawTitle(ctx, game);
  else if (game.state === 'shop') screenButtons = drawShop(ctx, game);
  else if (game.state === 'win') screenButtons = drawWin(ctx, game);
  else if (game.state === 'gameover') screenButtons = drawGameOver(ctx, game);
  else if (game.paused) drawPause(ctx);
}

if (shotName) {
  render();
  window.__shotReady = true;
} else {
  const STEP = 1 / 60;
  let last = performance.now();
  let accumulator = 0;
  function frame(now) {
    const elapsed = Math.min(0.25, (now - last) / 1000);
    last = now;
    accumulator += elapsed;
    let steps = 0;
    while (accumulator >= STEP && steps < 5) {
      game.update(STEP, input);
      accumulator -= STEP;
      steps += 1;
    }
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
