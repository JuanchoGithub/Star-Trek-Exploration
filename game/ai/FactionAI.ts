import type { GameState, Ship } from '../../types';

/**
 * Defines a set of actions the AI can perform that will mutate the game state.
 * This is passed to the AI to decouple it from direct state management.
 */
export interface AIActions {
    addLog: (log: any) => void;
    applyPhaserDamage: (target: Ship, damage: number, subsystem: any, source: Ship, state: GameState) => string[];
}

/**
 * Abstract base class for all faction-specific AI.
 * Each faction's AI must implement these methods.
 */
export abstract class FactionAI {
    /**
     * Defines the standard turn logic for a ship of this faction.
     * @param ship The ship being processed.
     * @param gameState The current state of the game.
     * @param actions A set of callbacks to enact changes.
     */
    abstract processTurn(ship: Ship, gameState: GameState, actions: AIActions): void;

    /**
     * Determines the ship's desperate, last-ditch effort when critically damaged.
     * @param ship The ship being processed.
     * @param gameState The current state of the game.
     * @returns A description of the move to be executed.
     */
    abstract getDesperationMove(ship: Ship, gameState: GameState): Ship['desperationMove'];
}
