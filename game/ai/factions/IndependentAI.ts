import type { GameState, Ship, ShipSubsystems } from '../../../types';
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { findClosestTarget } from '../../utils/ai';
import { calculateDistance } from '../../utils/ai';

export class IndependentAI extends FactionAI {
    determineStance(ship: Ship, playerShip: Ship): AIStance {
        return 'Defensive'; // Always defensive
    }

    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        return 'engines'; // Target engines to aid escape
    }

    processTurn(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[]): void {
        const target = findClosestTarget(ship, potentialTargets);
        if (target) {
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
        }
         actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position, broadcasting distress signals.`, isPlayerSource: false, color: 'border-gray-400' });
    }

    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
         actions.triggerDesperationAnimation({ source: ship, type: 'escape', outcome: 'success' });
         actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" makes an emergency jump to escape!`, isPlayerSource: false, color: 'border-yellow-400' });
         gameState.currentSector.entities = gameState.currentSector.entities.filter(e => e.id !== ship.id);
    }
}
