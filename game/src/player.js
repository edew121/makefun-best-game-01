// The chef of Simmerdown: Dinner Rush.
// Moves with WASD or arrows (or by clicking a spot to walk to), collides
// with the kitchen's solid rectangles, and carries one thing at a time:
// a single ingredient, or a plate holding a dish in progress.

import { VIEW_W, VIEW_H, solids, nearestStation, pointInRect, STATIONS } from './kitchen.js';

export const CHEF_RADIUS = 22;
export const REACH = 78;

export class Player {
  constructor() {
    this.x = 640;
    this.y = 560;
    this.speed = 250;
    this.carrying = null;
    this.facing = 'down';
    this.walkPhase = 0;
    this.moving = false;
    this.walkTarget = null;
    this.interactFlash = 0;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.carrying = null;
    this.walkTarget = null;
    this.moving = false;
  }

  // Hands hold either { kind: 'item', id } or { kind: 'plate', items: [] }.
  get handsEmpty() {
    return this.carrying === null;
  }

  get carryingPlate() {
    return this.carrying !== null && this.carrying.kind === 'plate';
  }

  update(dt, input) {
    let dx = 0;
    let dy = 0;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    // A key press cancels a click-to-walk order: the player is steering now.
    if (dx !== 0 || dy !== 0) this.walkTarget = null;
    if (this.walkTarget && dx === 0 && dy === 0) {
      const tx = this.walkTarget.x - this.x;
      const ty = this.walkTarget.y - this.y;
      const distance = Math.hypot(tx, ty);
      // A station's edge point sits on its solid rectangle, and collision
      // stops the chef about a radius short of it: arriving means getting
      // close enough to use it, not touching the exact point.
      const arriveAt = this.walkTarget.useStation ? CHEF_RADIUS + 12 : 6;
      if (distance < arriveAt) {
        const stationId = this.walkTarget.useStation;
        this.walkTarget = null;
        this.moving = false;
        return stationId;
      }
      dx = tx / distance;
      dy = ty / distance;
    }
    const length = Math.hypot(dx, dy);
    this.moving = length > 0;
    if (this.moving) {
      if (Math.abs(dx) > Math.abs(dy)) this.facing = dx > 0 ? 'right' : 'left';
      else this.facing = dy > 0 ? 'down' : 'up';
      this.walkPhase += dt * 10;
      const step = (this.speed * dt) / length;
      this.moveBy(dx * step, 0);
      this.moveBy(0, dy * step);
    }
    if (this.interactFlash > 0) this.interactFlash -= dt;
    return null;
  }

  moveBy(dx, dy) {
    const nextX = this.x + dx;
    const nextY = this.y + dy;
    const r = CHEF_RADIUS;
    const clampedX = Math.max(8 + r, Math.min(VIEW_W - 8 - r, nextX));
    const clampedY = Math.max(72 + r, Math.min(VIEW_H - 8 - r, nextY));
    if (!this.hitsSolid(clampedX, this.y)) this.x = clampedX;
    if (!this.hitsSolid(this.x, clampedY)) this.y = clampedY;
  }

  hitsSolid(x, y) {
    const r = CHEF_RADIUS - 2;
    for (const solid of solids()) {
      if (
        x + r > solid.x &&
        x - r < solid.x + solid.w &&
        y + r > solid.y &&
        y - r < solid.y + solid.h
      ) {
        return true;
      }
    }
    return false;
  }

  // The station the chef can use right now, if any.
  stationInReach() {
    return nearestStation(this.x, this.y, REACH + CHEF_RADIUS);
  }

  setWalkTarget(x, y) {
    const station = STATIONS_AT(x, y);
    if (station) {
      // Walk to a point just outside the station's edge, on the side the
      // chef is coming from. The clicked point itself sits inside the
      // station's solid rectangle, where collision would never let the chef
      // arrive; the offset point is reachable, so the arrival fires.
      const centerX = station.x + station.w / 2;
      const centerY = station.y + station.h / 2;
      const edgeX = Math.max(station.x, Math.min(this.x, station.x + station.w));
      const edgeY = Math.max(station.y, Math.min(this.y, station.y + station.h));
      let dx = this.x - centerX;
      let dy = this.y - centerY;
      const length = Math.hypot(dx, dy) || 1;
      dx /= length;
      dy /= length;
      this.walkTarget = {
        x: edgeX + dx * (CHEF_RADIUS + 6),
        y: edgeY + dy * (CHEF_RADIUS + 6),
        useStation: station.id,
      };
    } else {
      this.walkTarget = { x, y, useStation: null };
    }
  }
}

function STATIONS_AT(x, y) {
  for (const station of STATIONS) {
    if (station.kind === 'island') continue;
    if (pointInRect(x, y, station)) return station;
  }
  return null;
}
