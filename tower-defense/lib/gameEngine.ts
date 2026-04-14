export type PlayerId = 'player1' | 'player2';

export interface Enemy {
  id: string;
  type: string;
  ownerId: PlayerId;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  reward: number;
}

export interface Tower {
  id: string;
  ownerId: PlayerId;
  x: number;
  y: number;
  range: number;
  damage: number;
  cooldown: number; // in frames or ms
  lastFired: number;
}

export interface GameState {
  player1: {
    health: number;
    gold: number;
  };
  player2: {
    health: number;
    gold: number;
  };
  enemies: Enemy[];
  towers: Tower[];
}

export const INITIAL_STATE: GameState = {
  player1: { health: 100, gold: 100 },
  player2: { health: 100, gold: 100 },
  enemies: [],
  towers: [],
};

// Simplified path for a top-down duel game
// e.g. player1 enemies move left-to-right, player2 enemies move right-to-left
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export function updateGameState(state: GameState, deltaTime: number): GameState {
  // Deep clone for immutability-lite
  const newState = JSON.parse(JSON.stringify(state)) as GameState;

  const currentMs = Date.now();

  // Move enemies
  for (let i = newState.enemies.length - 1; i >= 0; i--) {
    const enemy = newState.enemies[i];
    
    // player1's enemies attack player2 (move right)
    // player2's enemies attack player1 (move left)
    if (enemy.ownerId === 'player1') {
      enemy.x += enemy.speed * deltaTime;
      if (enemy.x > GAME_WIDTH) {
        newState.player2.health = Math.max(0, newState.player2.health - 10);
        newState.enemies.splice(i, 1);
        continue;
      }
    } else {
      enemy.x -= enemy.speed * deltaTime;
      if (enemy.x < 0) {
        newState.player1.health = Math.max(0, newState.player1.health - 10);
        newState.enemies.splice(i, 1);
        continue;
      }
    }
  }

  // Towers attack
  for (const tower of newState.towers) {
    if (currentMs - tower.lastFired > tower.cooldown) {
      // Find target
      const target = newState.enemies.find((e) => {
        // Towers should only attack enemies matching the *other* player
        if (e.ownerId === tower.ownerId) return false;

        const dist = Math.sqrt(Math.pow(e.x - tower.x, 2) + Math.pow(e.y - tower.y, 2));
        return dist <= tower.range;
      });

      if (target) {
        target.health -= tower.damage;
        tower.lastFired = currentMs;
        if (target.health <= 0) {
           // Provide gold reward
           if (tower.ownerId === 'player1') newState.player1.gold += target.reward;
           else newState.player2.gold += target.reward;
           
           // Remove enemy
           newState.enemies = newState.enemies.filter(e => e.id !== target.id);
        }
      }
    }
  }

  return newState;
}
