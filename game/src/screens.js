// Title, shop, results and game-over screens for Simmerdown: Dinner Rush.
// Each screen is a panel over the kitchen; each returns the buttons it drew
// so the game can route mouse clicks to them.

import { VIEW_W, VIEW_H } from './kitchen.js';
import { roundRect, PALETTE } from './render.js';
import { UPGRADES, RUSHES } from './game.js';

function panel(ctx, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(43,26,18,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#fff8e6';
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#b4552d';
  ctx.stroke();
  ctx.restore();
}

function button(ctx, x, y, w, h, label, enabled = true, highlight = false) {
  ctx.save();
  ctx.fillStyle = !enabled ? '#9a9a9a' : highlight ? '#d94f3d' : '#3f6fb5';
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(43,26,18,0.5)';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + 7);
  ctx.restore();
  return { x, y, w, h, label, enabled };
}

function titleText(ctx, text, x, y, size, color, align = 'center') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawTitle(ctx, game) {
  panel(ctx, 290, 110, 700, 500);
  titleText(ctx, 'SIMMERDOWN', 640, 190, 56, '#b4552d');
  titleText(ctx, 'DINNER RUSH', 640, 232, 30, '#3f6fb5');
  titleText(ctx, 'Run the bistro. Keep every order moving.', 640, 282, 19, PALETTE.ink);
  titleText(ctx, 'Grab ingredients, grill, chop, plate and serve', 640, 310, 19, PALETTE.ink);
  titleText(ctx, 'before the ticket runs out. Three walk-outs', 640, 338, 19, PALETTE.ink);
  titleText(ctx, 'and the night is over.', 640, 366, 19, PALETTE.ink);
  titleText(ctx, 'Move: WASD / arrows  ·  Interact: Space / E', 640, 412, 17, '#6b5a48');
  titleText(ctx, 'Click a station to walk to it  ·  P / Esc pauses', 640, 438, 17, '#6b5a48');
  if (game.best > 0) {
    titleText(ctx, `Best night: $${game.best}`, 640, 478, 18, '#8a6d1f');
  }
  const start = button(ctx, 490, 510, 300, 56, 'START COOKING', true, true);
  return { start };
}

export function drawShop(ctx, game) {
  const nextRush = RUSHES[game.rushIndex + 1];
  panel(ctx, 240, 80, 800, 560);
  titleText(ctx, 'RUSH CLEARED!', 640, 140, 40, '#5da24a');
  titleText(ctx, `Next up: ${nextRush.name} — target $${nextRush.target}`, 640, 182, 20, PALETTE.ink);
  titleText(ctx, `Your coins: $${game.coins}`, 640, 216, 22, '#8a6d1f');
  const buttons = [];
  UPGRADES.forEach((upgrade, i) => {
    const y = 250 + i * 62;
    const owned = game.upgradesOwned.has(upgrade.id);
    const afford = game.coins >= upgrade.cost;
    ctx.save();
    ctx.fillStyle = owned ? '#e2f2dc' : '#f5ecd7';
    roundRect(ctx, 290, y, 700, 50, 10);
    ctx.fill();
    ctx.strokeStyle = owned ? '#5da24a' : '#d8c9a8';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = PALETTE.ink;
    ctx.font = 'bold 19px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(upgrade.name, 310, y + 31);
    ctx.font = '17px system-ui, sans-serif';
    ctx.fillStyle = '#6b5a48';
    ctx.fillText(upgrade.desc, 560, y + 30);
    ctx.restore();
    const label = owned ? 'OWNED' : `$${upgrade.cost}`;
    buttons.push({
      ...button(ctx, 860, y + 7, 110, 36, label, !owned && afford, false),
      upgrade: upgrade.id,
    });
  });
  const next = button(ctx, 490, 580, 300, 52, `START ${nextRush.name.toUpperCase()}`, true, true);
  return { upgrades: buttons, next };
}

export function drawWin(ctx, game) {
  panel(ctx, 290, 110, 700, 500);
  titleText(ctx, 'SERVICE COMPLETE!', 640, 190, 44, '#5da24a');
  titleText(ctx, 'Every rush cleared. The bistro survives the night.', 640, 236, 19, PALETTE.ink);
  const stars = '★'.repeat(game.stars) + '☆'.repeat(3 - game.stars);
  titleText(ctx, stars, 640, 300, 44, '#e8a13c');
  titleText(ctx, `Coins earned: $${game.coins}`, 640, 360, 22, PALETTE.ink);
  titleText(ctx, `Dishes served: ${game.serves}  ·  Tips: $${game.tipsEarned}`, 640, 394, 20, PALETTE.ink);
  titleText(ctx, `Best combo: x${game.bestCombo}  ·  Walk-outs: ${game.walkouts}`, 640, 424, 20, PALETTE.ink);
  if (game.coins >= game.best && game.coins > 0) {
    titleText(ctx, 'New best night!', 640, 462, 20, '#8a6d1f');
  }
  const again = button(ctx, 490, 510, 300, 56, 'PLAY AGAIN', true, true);
  return { again };
}

export function drawGameOver(ctx, game) {
  panel(ctx, 290, 110, 700, 500);
  titleText(ctx, 'NIGHT OVER', 640, 190, 48, '#d94f3d');
  const reason =
    game.loseReason === 'walkouts'
      ? 'Too many customers walked out.'
      : 'The rush target was not reached.';
  titleText(ctx, reason, 640, 240, 20, PALETTE.ink);
  titleText(ctx, `Coins earned: $${game.coins}`, 640, 300, 22, PALETTE.ink);
  titleText(ctx, `Dishes served: ${game.serves}  ·  Best combo: x${game.bestCombo}`, 640, 336, 20, PALETTE.ink);
  titleText(ctx, `Rush reached: ${RUSHES[game.rushIndex].name}`, 640, 370, 20, PALETTE.ink);
  titleText(ctx, 'Tip: grill the patty first — it takes the longest.', 640, 420, 17, '#6b5a48');
  titleText(ctx, 'Chop while it cooks, and serve the oldest ticket first.', 640, 446, 17, '#6b5a48');
  const again = button(ctx, 490, 510, 300, 56, 'TRY AGAIN', true, true);
  return { again };
}

export function drawPause(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(43,26,18,0.6)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  titleText(ctx, 'PAUSED', 640, 340, 48, '#fff3d6');
  titleText(ctx, 'Press P or Esc to continue', 640, 388, 20, '#fff3d6');
  ctx.restore();
}

export function pointInButton(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}
