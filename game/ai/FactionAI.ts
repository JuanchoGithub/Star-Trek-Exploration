
import type { GameState, Ship, ShipSubsystems } from '../../types';

// Defines a set of actions the AI can perform that will mutate the game state.
export interface AIActions {
    addLog: (log: any) => void;
    applyPhaserDamage: (target: Ship, damage: number, subsystem: any, source: Ship, state: GameState) => string[];
    triggerDesperationAnimation: (animation: { source: Ship; target?: Ship; type: string; outcome?: 'success' | 'failure' }) => void;
}

export type AIStance = 'Aggressive' | 'Defensive' | 'Balanced';

// Abstract base class for all faction-specific AI.
export abstract class FactionAI {
    // Determines the ship's combat stance for the current turn.
    abstract determineStance(ship: Ship, playerShip: Ship): AIStance;

    // Determines which subsystem to target, if any.
    abstract determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null;

    // Defines the standard turn logic for a ship of this faction.
    abstract processTurn(ship: Ship, gameState: GameState, actions: AIActions): void;
    
    // This method will execute the desperation move.
    abstract processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void;
}
