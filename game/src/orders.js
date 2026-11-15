// Orders, recipes and tickets for Simmerdown: Dinner Rush.
// A ticket is a recipe plus a patience timer. Serve the exact dish before
// the timer runs out: coins scale with the patience left, and every serve in
// a row without a walk-out raises the combo.

export const RECIPES = {
  classic: {
    name: 'Classic Burger',
    needs: ['bun', 'patty', 'lettuce'],
    price: 12,
    color: '#e8b25c',
  },
  garden: {
    name: 'Garden Burger',
    needs: ['bun', 'tomato', 'lettuce'],
    price: 10,
    color: '#7cc46a',
  },
  cheese: {
    name: 'Cheese Burger',
    needs: ['bun', 'patty', 'cheese'],
    price: 14,
    color: '#f2c531',
  },
  double: {
    name: 'Double Stack',
    needs: ['bun', 'patty', 'patty', 'cheese'],
    price: 18,
    color: '#c25b6b',
  },
  deluxe: {
    name: 'Deluxe Stack',
    needs: ['bun', 'patty', 'tomato', 'lettuce', 'cheese'],
    price: 22,
    color: '#b565d8',
  },
};

export const RECIPE_IDS = Object.keys(RECIPES);

// A plate matches a ticket when its items, sorted, equal the recipe's
// needs, sorted. Order on the plate does not matter.
export function plateMatchesTicket(plateItems, recipeId) {
  const wanted = [...RECIPES[recipeId].needs].sort();
  const served = [...plateItems].sort();
  if (wanted.length !== served.length) return false;
  return wanted.every((item, i) => item === served[i]);
}

let ticketCounter = 0;

export function makeTicket(recipeId, patienceSeconds, rng) {
  ticketCounter += 1;
  return {
    id: ticketCounter,
    recipe: recipeId,
    patience: patienceSeconds,
    maxPatience: patienceSeconds,
    // A small wobble so tickets do not all expire on the same frame.
    wobble: rng ? rng.next() * 2 : 0,
    state: 'waiting',
  };
}

// Coins for a serve: base price plus a tip that shrinks as patience runs
// out, times the tip multiplier from upgrades.
export function serveValue(ticket, combo, tipMultiplier) {
  const recipe = RECIPES[ticket.recipe];
  const patienceFraction = Math.max(0, ticket.patience / ticket.maxPatience);
  const tip = Math.round(8 * patienceFraction * tipMultiplier);
  const comboBonus = Math.min(combo, 5);
  return recipe.price + tip + comboBonus;
}
