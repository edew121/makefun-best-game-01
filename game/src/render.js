// All canvas drawing for Simmerdown: Dinner Rush.
// Warm bistro palette, vector art only — no image assets. The kitchen, the
// chef, the tickets, the HUD and the particles are all drawn here, so the
// screenshots show exactly what the player sees.

import { VIEW_W, VIEW_H, STATIONS, ITEMS } from './kitchen.js';
import { RECIPES } from './orders.js';

export const PALETTE = {
  floorA: '#e9c88f',
  floorB: '#dfb978',
  wall: '#5d3a22',
  wallTrim: '#7a4c2c',
  wood: '#8a5a32',
  woodDark: '#6b4223',
  cream: '#fff3d6',
  ink: '#2b1a12',
  gold: '#ffd94d',
  red: '#d94f3d',
  green: '#5da24a',
  amber: '#e8a13c',
};

export function roundRect(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawHeart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-11, -4, -6, -12, 0, -6);
  ctx.bezierCurveTo(6, -12, 11, -4, 0, 6);
  ctx.closePath();
  ctx.fillStyle = filled ? '#d94f3d' : 'rgba(255,255,255,0.25)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#2b1a12';
  ctx.stroke();
  ctx.restore();
}

export function drawItemIcon(ctx, itemId, x, y, size) {
  const item = ITEMS[itemId];
  const s = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (itemId === 'bun') {
    ctx.fillStyle = '#e8b25c';
    ctx.beginPath();
    ctx.arc(0, 2, s, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#d89a3e';
    ctx.fillRect(-s, 2, s * 2, 3);
    ctx.fillStyle = '#fff3d6';
    ctx.fillRect(-s * 0.5, -s * 0.45, 3, 2);
    ctx.fillRect(0, -s * 0.6, 3, 2);
    ctx.fillRect(s * 0.45, -s * 0.4, 3, 2);
  } else if (itemId === 'patty_raw') {
    ctx.fillStyle = '#c25b6b';
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a84a58';
    ctx.beginPath();
    ctx.ellipse(0, 2, s * 0.7, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId === 'patty') {
    ctx.fillStyle = '#8a4a2b';
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6b3517';
    ctx.beginPath();
    ctx.ellipse(-s * 0.3, -1, s * 0.3, s * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.35, 1, s * 0.25, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId === 'tomato_raw' || itemId === 'tomato') {
    ctx.fillStyle = itemId === 'tomato' ? '#e85d4a' : '#d94f3d';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5da24a';
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.9);
    ctx.lineTo(-s * 0.35, -s * 0.4);
    ctx.lineTo(s * 0.35, -s * 0.4);
    ctx.closePath();
    ctx.fill();
  } else if (itemId === 'lettuce_raw' || itemId === 'lettuce') {
    ctx.fillStyle = itemId === 'lettuce' ? '#7cc46a' : '#5da24a';
    ctx.beginPath();
    ctx.arc(-s * 0.4, 0, s * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.4, 0, s * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, -s * 0.25, s * 0.6, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId === 'cheese') {
    ctx.fillStyle = '#f2c531';
    ctx.beginPath();
    ctx.moveTo(-s, s * 0.6);
    ctx.lineTo(s, s * 0.6);
    ctx.lineTo(s, -s * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d8a91f';
    ctx.beginPath();
    ctx.arc(-s * 0.3, s * 0.2, 2, 0, Math.PI * 2);
    ctx.arc(s * 0.3, s * 0.3, 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (itemId === 'burnt') {
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, -s * 0.7);
    ctx.quadraticCurveTo(-s * 0.5, -s * 1.3, -s * 0.2, -s * 1.5);
    ctx.stroke();
  }
  ctx.restore();
  void item;
}

function drawPoster(ctx, x, y, w, h, title, lines) {
  ctx.save();
  ctx.fillStyle = '#fff8e6';
  roundRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.strokeStyle = '#b4552d';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#b4552d';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, x + w / 2, y + 14);
  ctx.fillStyle = '#6b5a48';
  ctx.font = '11px system-ui, sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, x + w / 2, y + 28 + i * 11));
  ctx.restore();
}

function drawStation(ctx, station, game) {
  const { x, y, w, h } = station;
  ctx.save();
  if (station.kind === 'island') {
    ctx.fillStyle = PALETTE.wood;
    roundRect(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#5da24a';
    ctx.beginPath();
    ctx.arc(x + 40, y + h / 2, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e9e2d0';
    ctx.beginPath();
    ctx.ellipse(x + w - 50, y + h / 2, 26, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  ctx.fillStyle = station.color;
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(43,26,18,0.6)';
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,243,214,0.95)';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(station.label, x + w / 2, y + 16);

  if (station.kind === 'bin') {
    drawItemIcon(ctx, station.item, x + w / 2, y + h / 2 + 10, 40);
  }
  if (station.kind === 'grill') {
    const slot = game.grill[station.slot];
    if (slot) {
      if (!slot.done) {
        const progress = Math.min(1, slot.t / slot.dur);
        ctx.fillStyle = '#ff9a3c';
        ctx.beginPath();
        ctx.arc(x + w / 2, y + h / 2 + 8, 20, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.lineTo(x + w / 2, y + h / 2 + 8);
        ctx.fill();
      }
      drawItemIcon(ctx, slot.item, x + w / 2, y + h / 2 + 8, 34);
      if (slot.done && slot.item !== 'burnt') {
        ctx.fillStyle = '#7cc46a';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText('READY', x + w / 2, y + h - 6);
      }
      if (slot.item === 'burnt') {
        ctx.fillStyle = '#ff6b5e';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText('BURNT!', x + w / 2, y + h - 6);
      }
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText('empty', x + w / 2, y + h / 2 + 12);
    }
  }
  if (station.kind === 'board') {
    const slot = game.board[station.slot];
    if (slot) {
      if (!slot.done) {
        const progress = Math.min(1, slot.t / slot.dur);
        ctx.fillStyle = '#7cc46a';
        ctx.fillRect(x + 10, y + h - 14, (w - 20) * progress, 6);
      }
      drawItemIcon(ctx, slot.item, x + w / 2, y + h / 2 + 8, 34);
      if (slot.done) {
        ctx.fillStyle = '#7cc46a';
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillText('READY', x + w / 2, y + h - 6);
      }
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText('empty', x + w / 2, y + h / 2 + 12);
    }
  }
  if (station.kind === 'plate') {
    const plate = game.plateOnCounter;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2 + 8, 52, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9c2ae';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (plate) {
      plate.items.forEach((itemId, i) => {
        const offsetX = (i - (plate.items.length - 1) / 2) * 26;
        drawItemIcon(ctx, itemId, x + w / 2 + offsetX, y + h / 2 + 2, 24);
      });
    }
  }
  if (station.kind === 'trash') {
    ctx.fillStyle = '#3a3a3a';
    roundRect(ctx, x + w / 2 - 18, y + 26, 36, 28, 4);
    ctx.fill();
  }
  if (station.kind === 'window') {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(x + 10, y + 30, w - 20, 6);
  }
  ctx.restore();
}

function drawTickets(ctx, game) {
  const tickets = game.tickets;
  const cardW = 150;
  const cardH = 78;
  const gap = 12;
  const totalW = tickets.length * cardW + (tickets.length - 1) * gap;
  let x = (VIEW_W - totalW) / 2;
  const y = 70;
  for (const ticket of tickets) {
    const recipe = RECIPES[ticket.recipe];
    const fraction = Math.max(0, ticket.patience / ticket.maxPatience);
    const urgent = ticket.patience < 10;
    ctx.save();
    if (urgent && Math.floor(game.time * 4) % 2 === 0) {
      ctx.shadowColor = '#d94f3d';
      ctx.shadowBlur = 18;
    }
    ctx.fillStyle = '#fffdf5';
    roundRect(ctx, x, y, cardW, cardH, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = recipe.color;
    ctx.stroke();
    ctx.fillStyle = PALETTE.ink;
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(recipe.name, x + 10, y + 18);
    recipe.needs.forEach((itemId, i) => {
      drawItemIcon(ctx, itemId, x + 22 + i * 26, y + 38, 22);
    });
    ctx.fillStyle = '#e5ddc8';
    roundRect(ctx, x + 10, y + 58, cardW - 20, 8, 4);
    ctx.fill();
    ctx.fillStyle = fraction > 0.5 ? PALETTE.green : fraction > 0.25 ? PALETTE.amber : PALETTE.red;
    roundRect(ctx, x + 10, y + 58, (cardW - 20) * fraction, 8, 4);
    ctx.fill();
    ctx.fillStyle = '#8a7a5c';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`$${recipe.price}`, x + cardW - 10, y + 18);
    ctx.restore();
    x += cardW + gap;
  }
}

function drawChef(ctx, game) {
  const player = game.player;
  const bob = player.moving ? Math.sin(player.walkPhase) * 2 : 0;
  const x = player.x;
  const y = player.y + bob;
  ctx.save();
  if (player.interactFlash > 0) {
    ctx.shadowColor = '#ffd94d';
    ctx.shadowBlur = 16;
  }
  // Body and apron.
  ctx.fillStyle = '#3f6fb5';
  ctx.beginPath();
  ctx.arc(x, y, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, x - 13, y - 6, 26, 22, 6);
  ctx.fill();
  // Head.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(x, y - 27, 14, 0, Math.PI * 2);
  ctx.fill();
  // Chef hat.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x - 8, y - 38, 9, 0, Math.PI * 2);
  ctx.arc(x + 8, y - 38, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 14, y - 40, 28, 9);
  // Eyes look where the chef faces.
  const lookX = player.facing === 'left' ? -4 : player.facing === 'right' ? 4 : 0;
  const lookY = player.facing === 'up' ? -3 : player.facing === 'down' ? 2 : 0;
  ctx.fillStyle = '#2b1a12';
  ctx.beginPath();
  ctx.arc(x - 5 + lookX, y - 28 + lookY, 2, 0, Math.PI * 2);
  ctx.arc(x + 5 + lookX, y - 28 + lookY, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // What the chef carries, held overhead.
  const carrying = player.carrying;
  if (carrying) {
    if (carrying.kind === 'item') {
      drawItemIcon(ctx, carrying.id, x, y - 62, 30);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(x, y - 58, 30, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9c2ae';
      ctx.lineWidth = 2;
      ctx.stroke();
      carrying.items.forEach((itemId, i) => {
        const offsetX = (i - (carrying.items.length - 1) / 2) * 20;
        drawItemIcon(ctx, itemId, x + offsetX, y - 62, 18);
      });
    }
  }
}

function drawHud(ctx, game) {
  ctx.save();
  // Hearts, top left.
  for (let i = 0; i < game.maxHearts; i++) {
    drawHeart(ctx, 130 + i * 34, 34, 26, i < game.hearts);
  }
  // Coins and target, top right.
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.arc(1010, 32, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a6d1f';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('$', 1010, 37);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${game.coins} / ${game.rush.target}`, 1032, 40);
  // Rush name and timer, bottom left.
  const minutes = Math.floor(game.rushTimeLeft / 60);
  const seconds = Math.floor(game.rushTimeLeft % 60).toString().padStart(2, '0');
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 18px system-ui, sans-serif';
  ctx.fillText(`${game.rush.name.toUpperCase()}  ·  ${minutes}:${seconds}`, 16, 678);
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = '#ffd94d';
  ctx.fillText(`RUSH ${game.rushIndex + 1}/3`, 16, 700);
  if (game.combo >= 2) {
    ctx.fillStyle = '#7cc46a';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText(`COMBO x${game.combo}`, 300, 688);
  }
  ctx.restore();
}

export function drawKitchen(ctx, game) {
  ctx.save();
  const shake = game.particles.offset();
  ctx.translate(shake.x, shake.y);

  // Floor checker.
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 16; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(col * 80, row * 80, 80, 80);
    }
  }
  // Rug under the island table, to warm up the open floor.
  ctx.fillStyle = 'rgba(180,85,45,0.4)';
  roundRect(ctx, 470, 290, 340, 140, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(180,85,45,0.55)';
  ctx.lineWidth = 3;
  roundRect(ctx, 484, 302, 312, 116, 14);
  ctx.stroke();
  // Top wall band with two menu posters.
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, VIEW_W, 64);
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(0, 64, VIEW_W, 6);
  drawPoster(ctx, 300, 8, 160, 48, 'MENU', ['Burger $12', 'Garden $10', 'Deluxe $22']);
  drawPoster(ctx, 820, 8, 160, 48, 'SPECIAL', ['Double $18', 'Cheese $14', 'Fresh daily']);

  for (const station of STATIONS) drawStation(ctx, station, game);
  drawTickets(ctx, game);
  drawChef(ctx, game);
  game.particles.draw(ctx);
  ctx.restore();

  // The HUD only makes sense while a rush is running; on the title, shop
  // and end screens the kitchen is just a backdrop.
  if (game.state === 'playing') drawHud(ctx, game);
}
