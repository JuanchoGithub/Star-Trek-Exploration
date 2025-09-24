import type { GameState, Ship, ShipSubsystems } from '../../../types';
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { findClosestTarget } from '../../utils/ai';
import { calculateDistance } from '../../utils/ai';
import { processRecoveryTurn } from './common';

export class IndependentAI extends FactionAI {
    determineStance(ship: Ship, potentialTargets: Ship[]): { stance: AIStance, reason: string } {
        const closestTarget = findClosestTarget(ship, potentialTargets);
        if (!closestTarget) {
            return { stance: 'Recovery', reason: `No threats nearby. Resuming normal operations.` };
        }
        return { stance: 'Defensive', reason: `Threat detected (${closestTarget.name}). Attempting to flee.` };
    }

    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        return 'engines'; // Target engines to aid escape
    }

    processTurn(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[]): void {
        const { stance, reason } = this.determineStance(ship, potentialTargets);
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Stance analysis: ${reason}` });
        
        if (stance === 'Recovery') {
            processRecoveryTurn(ship, actions);
            return;
        }

        const target = findClosestTarget(ship, potentialTargets);
        if (!target) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position, broadcasting distress signals.`, isPlayerSource: false, color: 'border-gray-400' });
            return;
        }

        // Fleeing logic
        const distance = calculateDistance(ship.position, target.position);
        if (distance < 5) {
            const fleeVector = {
                x: ship.position.x - target.position.x,
                y: ship.position.y - target.position.y,
            };

            let fleePosition = { ...ship.position };
            if (Math.abs(fleeVector.x) > Math.abs(fleeVector.y)) {
                fleePosition.x += Math.sign(fleeVector.x);
            } else if (fleeVector.y !== 0) {
                fleePosition.y += Math.sign(fleeVector.y);
            } else if (fleeVector.x !== 0) {
                fleePosition.x += Math.sign(fleeVector.x);
            }
            
            // A simple bounds check
            if (fleePosition.x >= 0 && fleePosition.x < 12 && fleePosition.y >= 0 && fleePosition.y < 10) {
                    ship.position = fleePosition;
                    actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Is attempting to flee from combat!`, isPlayerSource: false, color: 'border-yellow-400' });
                    return;
            }
        }
         actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position, broadcasting distress signals.`, isPlayerSource: false, color: 'border-gray-400' });
    }

    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
         actions.triggerDesperationAnimation({ source: ship, type: 'escape', outcome: 'success' });
         actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" makes an emergency jump to escape!`, isPlayerSource: false, color: 'border-yellow-400' });
         gameState.currentSector.entities = gameState.currentSector.entities.filter(e => e.id !== ship.id);
    }
}