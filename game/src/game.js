// The game itself for Simmerdown: Dinner Rush.
// One state machine (title, playing, shop, win, game over), three rushes
// with escalating orders, an upgrade shop between rushes, and the win and
// lose conditions. The simulation runs on a fixed 1/60 s step.

import { stationById } from './kitchen.js';
import { RECIPES, makeTicket, plateMatchesTicket, serveValue } from './orders.js';
import { Player } from './player.js';
import { Particles } from './particles.js';
import { makeRng } from './rng.js';
import { sfx } from './audio.js';

export const RUSHES = [
  {
    name: 'Lunch Rush',
    target: 60,
    duration: 90,
    interval: 14,
    recipes: ['classic', 'garden'],
    maxTickets: 3,
    patience: 45,
  },
  {
    name: 'Dinner Rush',
    target: 120,
    duration: 110,
    interval: 11,
    recipes: ['classic', 'garden', 'cheese', 'double'],
    maxTickets: 3,
    patience: 42,
  },
  {
    name: 'Late Night',
    target: 200,
    duration: 130,
    interval: 9,
    recipes: ['classic', 'garden', 'cheese', 'double', 'deluxe'],
    maxTickets: 4,
    patience: 40,
  },
];

export const UPGRADES = [
  { id: 'shoes', name: 'Runner Shoes', desc: '+18% move speed', cost: 40 },
  { id: 'grill', name: 'Hot Grill', desc: 'Grill cooks 30% faster', cost: 50 },
  { id: 'calm', name: 'Calm Customers', desc: '+25% order patience', cost: 45 },
  { id: 'heart', name: 'Extra Heart', desc: '+1 walk-out allowed', cost: 60 },
  { id: 'tips', name: 'Golden Spatula', desc: '+25% tips', cost: 55 },
];

export const BEST_KEY = 'simmerdown_best';

export class Game {
  constructor() {
    this.rng = makeRng((Math.random() * 1e9) | 0);
    this.player = new Player();
    this.particles = new Particles();
    this.state = 'title';
    this.paused = false;
    this.rushIndex = 0;
    this.rushTimeLeft = 0;
    this.coins = 0;
    this.rushCoins = 0;
    this.hearts = 3;
    this.maxHearts = 3;
    this.combo = 0;
    this.bestCombo = 0;
    this.serves = 0;
    this.walkouts = 0;
    this.tipsEarned = 0;
    this.tickets = [];
    this.grill = [null, null];
    this.board = [null, null];
    this.plateOnCounter = null;
    this.spawnTimer = 0;
    this.time = 0;
    this.upgradesOwned = new Set();
    this.grillTimeMult = 1;
    this.patienceMult = 1;
    this.tipMult = 1;
    this.loseReason = '';
    this.stars = 0;
    this.best = 0;
    try {
      this.best = Number(window.localStorage.getItem(BEST_KEY) ?? 0) || 0;
    } catch {
      this.best = 0;
    }
  }

  get rush() {
    return RUSHES[this.rushIndex];
  }

  get grillTime() {
    return 6 * this.grillTimeMult;
  }

  get chopTime() {
    return 3;
  }

  get burnTime() {
    return 8;
  }

  startGame() {
    this.rng = makeRng((Math.random() * 1e9) | 0);
    this.player.reset(640, 560);
    this.coins = 0;
    this.rushCoins = 0;
    this.hearts = 3;
    this.maxHearts = 3;
    this.combo = 0;
    this.bestCombo = 0;
    this.serves = 0;
    this.walkouts = 0;
    this.tipsEarned = 0;
    this.tickets = [];
    this.grill = [null, null];
    this.board = [null, null];
    this.plateOnCounter = null;
    this.upgradesOwned = new Set();
    this.grillTimeMult = 1;
    this.patienceMult = 1;
    this.tipMult = 1;
    this.loseReason = '';
    this.stars = 0;
    this.startRush(0);
  }

  startRush(index) {
    this.rushIndex = index;
    this.rushTimeLeft = this.rush.duration;
    this.rushCoins = 0;
    this.tickets = [];
    this.grill = [null, null];
    this.board = [null, null];
    this.plateOnCounter = null;
    this.player.carrying = null;
    this.spawnTimer = 2;
    this.state = 'playing';
    this.paused = false;
    sfx.rushStart();
  }

  openShop() {
    this.state = 'shop';
    sfx.coin();
  }

  buyUpgrade(id) {
    const upgrade = UPGRADES.find((entry) => entry.id === id);
    if (!upgrade || this.upgradesOwned.has(id)) return false;
    if (this.coins < upgrade.cost) return false;
    this.coins -= upgrade.cost;
    this.upgradesOwned.add(id);
    if (id === 'shoes') this.player.speed *= 1.18;
    if (id === 'grill') this.grillTimeMult = 0.7;
    if (id === 'calm') this.patienceMult = 1.25;
    if (id === 'heart') {
      this.maxHearts += 1;
      this.hearts += 1;
    }
    if (id === 'tips') this.tipMult = 1.25;
    sfx.coin();
    return true;
  }

  endRush() {
    if (this.rushCoins >= this.rush.target) {
      if (this.rushIndex >= RUSHES.length - 1) this.winGame();
      else this.openShop();
    } else {
      this.loseGame('target');
    }
  }

  winGame() {
    this.state = 'win';
    const clean = this.walkouts === 0;
    const rich = this.coins >= 320;
    this.stars = 1 + (clean ? 1 : 0) + (rich ? 1 : 0);
    if (this.coins > this.best) {
      this.best = this.coins;
      try {
        window.localStorage.setItem(BEST_KEY, String(this.best));
      } catch {
        // Best score is a nicety, not a requirement.
      }
    }
    sfx.win();
  }

  loseGame(reason) {
    this.state = 'gameover';
    this.loseReason = reason;
    if (this.coins > this.best) {
      this.best = this.coins;
      try {
        window.localStorage.setItem(BEST_KEY, String(this.best));
      } catch {
        // Best score is a nicety, not a requirement.
      }
    }
    sfx.lose();
  }

  spawnTicket() {
    const recipe = this.rng.pick(this.rush.recipes);
    const patience = this.rush.patience * this.patienceMult;
    this.tickets.push(makeTicket(recipe, patience, this.rng));
  }

  update(dt, input) {
    this.time += dt;
    this.particles.update(dt);
    if (this.state !== 'playing' || this.paused) return;

    this.rushTimeLeft -= dt;
    if (this.rushTimeLeft <= 0) {
      this.rushTimeLeft = 0;
      this.endRush();
      return;
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && this.tickets.length < this.rush.maxTickets) {
      this.spawnTicket();
      this.spawnTimer = this.rush.interval * (0.9 + this.rng.next() * 0.2);
    }

    for (const ticket of [...this.tickets]) {
      ticket.patience -= dt;
      if (ticket.patience <= 0) this.walkout(ticket);
    }

    for (let i = 0; i < this.grill.length; i++) {
      const slot = this.grill[i];
      if (!slot) continue;
      slot.t += dt;
      if (!slot.done && slot.t >= slot.dur) {
        slot.done = true;
        slot.burn = 0;
        slot.item = 'patty';
        sfx.ding();
      } else if (slot.done) {
        slot.burn += dt;
        if (slot.burn >= this.burnTime) slot.item = 'burnt';
      }
      if (Math.random() < dt * 2) {
        const station = stationById(`grill-${i}`);
        this.particles.steam(station.x + station.w / 2, station.y + 10);
      }
    }
    for (let i = 0; i < this.board.length; i++) {
      const slot = this.board[i];
      if (!slot) continue;
      slot.t += dt;
      if (!slot.done && slot.t >= slot.dur) {
        slot.done = true;
        slot.item = slot.raw === 'tomato_raw' ? 'tomato' : 'lettuce';
        sfx.ding();
      }
    }

    const arrivedStation = this.player.update(dt, input);
    if (arrivedStation) this.interact(arrivedStation);
  }

  walkout(ticket) {
    this.tickets = this.tickets.filter((entry) => entry.id !== ticket.id);
    this.walkouts += 1;
    this.combo = 0;
    this.hearts -= 1;
    this.particles.shake(9, 0.4);
    this.particles.floatText(640, 120, 'Walked out!', '#ff6b5e');
    sfx.walkout();
    if (this.hearts <= 0) this.loseGame('walkouts');
  }

  serveTicket(ticket) {
    const value = serveValue(ticket, this.combo, this.tipMult);
    const tip = value - RECIPES[ticket.recipe].price - Math.min(this.combo, 5);
    this.coins += value;
    this.rushCoins += value;
    this.tipsEarned += Math.max(0, tip);
    this.serves += 1;
    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.tickets = this.tickets.filter((entry) => entry.id !== ticket.id);
    this.particles.burst(640, 40, '#ffd94d', 18, 200);
    this.particles.floatText(640, 90, `+$${value}`, '#ffd94d');
    if (this.combo >= 2) {
      this.particles.floatText(640, 120, `Combo x${this.combo}`, '#7cc46a');
    }
    sfx.serve();
  }

  interact(stationId) {
    if (this.state !== 'playing' || this.paused) return;
    const station = stationId ? stationById(stationId) : this.player.stationInReach();
    if (!station) return;
    const hands = this.player.carrying;
    this.player.interactFlash = 0.15;

    if (station.kind === 'bin') {
      if (hands && hands.kind === 'plate') {
        if (hands.items.length < 5) {
          hands.items.push(station.item);
          sfx.place();
        }
        return;
      }
      if (!hands) {
        this.player.carrying = { kind: 'item', id: station.item };
        sfx.pickup();
      }
      return;
    }

    if (station.kind === 'grill') {
      const slot = this.grill[station.slot];
      if (slot && !hands) {
        this.player.carrying = { kind: 'item', id: slot.item };
        this.grill[station.slot] = null;
        sfx.pickup();
        return;
      }
      if (!slot && hands && hands.kind === 'item' && hands.id === 'patty_raw') {
        this.grill[station.slot] = { item: 'patty_raw', t: 0, dur: this.grillTime, done: false, burn: 0 };
        this.player.carrying = null;
        sfx.place();
      }
      return;
    }

    if (station.kind === 'board') {
      const slot = this.board[station.slot];
      if (slot && slot.done && !hands) {
        this.player.carrying = { kind: 'item', id: slot.item };
        this.board[station.slot] = null;
        sfx.pickup();
        return;
      }
      if (!slot && hands && hands.kind === 'item' && (hands.id === 'tomato_raw' || hands.id === 'lettuce_raw')) {
        this.board[station.slot] = { item: hands.id, raw: hands.id, t: 0, dur: this.chopTime, done: false };
        this.player.carrying = null;
        sfx.place();
        sfx.chop();
      }
      return;
    }

    if (station.kind === 'plate') {
      // Carrying an ingredient: start a plate here if there is none, then
      // add the ingredient to it.
      if (hands && hands.kind === 'item') {
        if (!this.plateOnCounter) this.plateOnCounter = { items: [] };
        if (this.plateOnCounter.items.length < 5) {
          this.plateOnCounter.items.push(hands.id);
          this.player.carrying = null;
          sfx.place();
        }
        return;
      }
      // Carrying a plate: put it back down on the counter.
      if (hands && hands.kind === 'plate') {
        this.plateOnCounter = hands;
        this.player.carrying = null;
        sfx.place();
        return;
      }
      // Empty hands: no plate yet, lay out a fresh empty one.
      if (!this.plateOnCounter) {
        this.plateOnCounter = { items: [] };
        sfx.place();
        return;
      }
      // Empty hands and a plated dish: pick it up to serve it.
      if (this.plateOnCounter.items.length > 0) {
        this.player.carrying = { kind: 'plate', items: this.plateOnCounter.items };
        this.plateOnCounter = null;
        sfx.pickup();
      }
      return;
    }

    if (station.kind === 'window') {
      if (hands && hands.kind === 'plate' && hands.items.length > 0) {
        const ticket = this.tickets.find((entry) => plateMatchesTicket(hands.items, entry.recipe));
        if (ticket) {
          this.serveTicket(ticket);
          this.player.carrying = null;
        } else {
          sfx.wrong();
          this.particles.floatText(640, 90, 'Wrong dish!', '#ff6b5e');
        }
      }
      return;
    }

    if (station.kind === 'trash') {
      if (hands) {
        this.player.carrying = null;
        sfx.place();
      }
    }
  }
}
