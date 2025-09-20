import type { GameState, Ship } from '../../../types';
import { FactionAI, AIActions } from '../FactionAI';
import { processCommonTurn } from './common';
import { findClosestTarget } from '../../utils/ai';

export class KlingonAI extends FactionAI {
    processTurn(ship: Ship, gameState: GameState, actions: AIActions): void {
        // Klingons use aggressive common tactics.
        processCommonTurn(ship, gameState, actions);
    }

    getDesperationMove(ship: Ship, gameState: GameState): Ship['desperationMove'] {
        const allShips = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
        const enemyShips = allShips.filter(s => s.faction !== ship.faction);
        const target = findClosestTarget(ship, enemyShips);
        
        return { type: 'ram', targetId: target?.id };
    }
}
