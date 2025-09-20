import type { GameState, Ship } from '../../../types';
import { FactionAI, AIActions } from '../FactionAI';
import { processCommonTurn } from './common';

export class PirateAI extends FactionAI {
    processTurn(ship: Ship, gameState: GameState, actions: AIActions): void {
        // Pirates use aggressive common tactics.
        processCommonTurn(ship, gameState, actions);
    }

    getDesperationMove(ship: Ship, gameState: GameState): Ship['desperationMove'] {
        return { type: 'self_destruct' };
    }
}
