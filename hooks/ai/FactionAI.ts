import type { GameState, Ship } from '../../types';

// Defines a set of actions the AI can perform that will mutate the game state.
export interface AIActions {
    addLog: (log: any) => void;
    applyPhaserDamage: (target: Ship, damage: number, subsystem: any, source: Ship, state: GameState) => string[];
}

// Abstract base class for all faction-specific AI.
export abstract class FactionAI {
    // Defines the standard turn logic for a ship of this faction.
    abstract processTurn(ship: Ship, gameState: GameState, actions: AIActions): void;
    
    // This method will execute the desperation move.
    abstract processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void;
}
