import type { GameState, Ship, ShipSubsystems } from '../../../types';
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { findClosestTarget, moveOneStep } from '../../utils/ai';
import { processRecoveryTurn } from './common';
import { SECTOR_WIDTH, SECTOR_HEIGHT } from '../../../assets/configs/gameConstants';

export class IndependentAI extends FactionAI {
    determineStance(ship: Ship, potentialTargets: Ship[]): { stance: AIStance, reason: string } {
        const enemyTargets = potentialTargets.filter(t => t.allegiance === 'enemy');
        const primaryThreats = enemyTargets.length > 0 ? enemyTargets : potentialTargets;
        
        const closestTarget = findClosestTarget(ship, primaryThreats);

        if (!closestTarget) {
            return { stance: 'Recovery', reason: `No threats nearby. Resuming normal operations.` };
        }
        return { stance: 'Defensive', reason: `Threat detected (${closestTarget.name}). Attempting to flee.` };
    }

    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        return 'engines'; // Target engines to aid escape
    }

    processTurn(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[]): void {
        const { stance } = this.determineStance(ship, potentialTargets);
        
        if (stance === 'Recovery') {
            processRecoveryTurn(ship, actions);
            return;
        }

        const enemyTargets = potentialTargets.filter(t => t.allegiance === 'enemy');
        const primaryThreats = enemyTargets.length > 0 ? enemyTargets : potentialTargets;
        const target = findClosestTarget(ship, primaryThreats);

        if (!target) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position, broadcasting distress signals.`, isPlayerSource: false, color: 'border-gray-400' });
            return;
        }

        // Fleeing logic
        const originalPosition = { ...ship.position };
        let finalLogMessage = `Stance analysis: Threat detected (${target.name} at ${target.position.x},${target.position.y}). Attempting to flee away from it`;

        const fleeTarget = {
            x: ship.position.x + (ship.position.x - target.position.x),
            y: ship.position.y + (ship.position.y - target.position.y),
        };

        let fleePosition = moveOneStep(ship.position, fleeTarget);
        
        // Bounds check
        fleePosition.x = Math.max(0, Math.min(SECTOR_WIDTH - 1, fleePosition.x));
        fleePosition.y = Math.max(0, Math.min(SECTOR_HEIGHT - 1, fleePosition.y));
        
        const allShipsInSector = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
        const isBlocked = allShipsInSector.some(s => s.id !== ship.id && s.position.x === fleePosition.x && s.position.y === fleePosition.y);

        if (isBlocked) {
            finalLogMessage += `, but path to ${fleePosition.x},${fleePosition.y} is blocked. Holding position at ${originalPosition.x},${originalPosition.y}, broadcasting distress signals.`;
        } else if (fleePosition.x === originalPosition.x && fleePosition.y === originalPosition.y) {
            finalLogMessage += `, cannot move further away. Staying at ${originalPosition.x},${originalPosition.y}, broadcasting distress signals.`;
        } else {
            ship.position = fleePosition;
            finalLogMessage += `, moving to ${fleePosition.x},${fleePosition.y}, broadcasting distress signals.`;
        }
        
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: finalLogMessage, isPlayerSource: false, color: 'border-yellow-400' });
    }

    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
         actions.triggerDesperationAnimation({ source: ship, type: 'escape', outcome: 'success' });
         actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" makes an emergency jump to escape!`, isPlayerSource: false, color: 'border-yellow-400' });
         gameState.currentSector.entities = gameState.currentSector.entities.filter(e => e.id !== ship.id);
    }
}