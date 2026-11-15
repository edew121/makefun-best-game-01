// The kitchen floor of Simmerdown: Dinner Rush.
// One fixed room, 1280x720. Stations sit along the walls, the chef walks the
// open middle. Every station is a rectangle with a kind, a label and a
// colour; the player collides with them as solid blocks.

export const VIEW_W = 1280;
export const VIEW_H = 720;

// Item ids. A cooked patty is 'patty', a chopped tomato 'tomato', and so on:
// the raw form only ever exists in the chef's hands or on a work station.
export const ITEMS = {
  bun: { name: 'Bun', color: '#e8b25c', raw: false },
  patty_raw: { name: 'Raw Patty', color: '#c25b6b', raw: true },
  patty: { name: 'Patty', color: '#8a4a2b', raw: false },
  tomato_raw: { name: 'Tomato', color: '#d94f3d', raw: true },
  tomato: { name: 'Tomato', color: '#e85d4a', raw: false },
  lettuce_raw: { name: 'Lettuce', color: '#5da24a', raw: true },
  lettuce: { name: 'Lettuce', color: '#7cc46a', raw: false },
  cheese: { name: 'Cheese', color: '#f2c531', raw: false },
  burnt: { name: 'Burnt!', color: '#2b2b2b', raw: false },
};

export const STATIONS = [
  // Serving window, top centre: where finished plates go out.
  { id: 'window', kind: 'window', label: 'SERVE', x: 520, y: 6, w: 240, h: 58, color: '#3f6fb5' },
  // Ingredient bins, left wall.
  { id: 'bin-bun', kind: 'bin', item: 'bun', label: 'BUNS', x: 8, y: 120, w: 96, h: 76, color: '#e8b25c' },
  { id: 'bin-patty', kind: 'bin', item: 'patty_raw', label: 'PATTY', x: 8, y: 208, w: 96, h: 76, color: '#c25b6b' },
  { id: 'bin-tomato', kind: 'bin', item: 'tomato_raw', label: 'TOMATO', x: 8, y: 296, w: 96, h: 76, color: '#d94f3d' },
  { id: 'bin-lettuce', kind: 'bin', item: 'lettuce_raw', label: 'LETTUCE', x: 8, y: 384, w: 96, h: 76, color: '#5da24a' },
  { id: 'bin-cheese', kind: 'bin', item: 'cheese', label: 'CHEESE', x: 8, y: 472, w: 96, h: 76, color: '#f2c531' },
  // Grill (two slots) and chopping board (two slots), right wall.
  { id: 'grill-0', kind: 'grill', slot: 0, label: 'GRILL', x: 1176, y: 120, w: 96, h: 76, color: '#4a4a52' },
  { id: 'grill-1', kind: 'grill', slot: 1, label: 'GRILL', x: 1176, y: 208, w: 96, h: 76, color: '#4a4a52' },
  { id: 'board-0', kind: 'board', slot: 0, label: 'CHOP', x: 1176, y: 296, w: 96, h: 76, color: '#a9713f' },
  { id: 'board-1', kind: 'board', slot: 1, label: 'CHOP', x: 1176, y: 384, w: 96, h: 76, color: '#a9713f' },
  // Plating counter, bottom centre: where dishes are assembled.
  { id: 'plate', kind: 'plate', label: 'PLATE', x: 480, y: 648, w: 320, h: 64, color: '#e9e2d0' },
  // Trash, bottom right.
  { id: 'trash', kind: 'trash', label: 'TRASH', x: 1120, y: 648, w: 120, h: 64, color: '#6b6b6b' },
  // Central island: a prep table that blocks movement.
  { id: 'island', kind: 'island', label: '', x: 520, y: 320, w: 240, h: 80, color: '#7a5230' },
];

export function stationById(id) {
  return STATIONS.find((station) => station.id === id);
}

// Solid rectangles the chef cannot walk through: every station plus the
// outer walls. The serving window is on the wall, so it blocks too.
export function solids() {
  const list = STATIONS.map(({ x, y, w, h }) => ({ x, y, w, h }));
  return list;
}

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

// The nearest station whose edge is within reach of the chef.
export function nearestStation(x, y, reach) {
  let best = null;
  let bestDistance = Infinity;
  for (const station of STATIONS) {
    if (station.kind === 'island') continue;
    const cx = Math.max(station.x, Math.min(x, station.x + station.w));
    const cy = Math.max(station.y, Math.min(y, station.y + station.h));
    const distance = Math.hypot(x - cx, y - cy);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = station;
    }
  }
  return bestDistance <= reach ? best : null;
}
