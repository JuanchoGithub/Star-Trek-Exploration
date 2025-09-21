
import type { GameState, Ship, Shuttle } from '../../../types';
// FIX: Added AIStance to import.
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { findClosestTarget, moveOneStep } from '../../utils/ai';
import { shipRoleStats } from '../../../assets/ships/configs/shipRoleStats';
import { uniqueId } from '../../utils/helpers';

export class FederationAI extends FactionAI {
    // FIX: Implemented missing abstract member 'determineStance'.
    determineStance(ship: Ship, playerShip: Ship): AIStance {
        return 'Balanced'; // Friendly ships are always balanced.
    }

    processTurn(ship: Ship, gameState: GameState, actions: AIActions): void {
        const { currentSector } = gameState;
        const shuttles = currentSector.entities.filter(e => e.type === 'shuttle');

        // Priority 1: Rescue shuttles
        if (shuttles.length > 0) {
            // Type assertion, as findClosestTarget expects Ships
            const closestShuttle = findClosestTarget(ship, shuttles as any);
            if (closestShuttle) {
                ship.position = moveOneStep(ship.position, closestShuttle.position);
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Moving to rescue escape shuttles.`, isPlayerSource: false });
                return;
            }
        }
        // Default friendly behavior is to hold position.
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position.`, isPlayerSource: false });
    }

    // FIX: Replaced `getDesperationMove` with the required `processDesperationMove` method to satisfy the abstract class.
    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
        const shuttleCount = shipRoleStats[ship.shipRole]?.shuttleCount || 1;

        actions.triggerDesperationAnimation({ source: ship, type: 'evacuate' });
        
        for (let i = 0; i < shuttleCount; i++) {
            const shuttle: Shuttle = {
                id: uniqueId(),
                name: "Escape Shuttle",
                type: 'shuttle',
                faction: ship.faction,
                position: { ...ship.position },
                scanned: true,
                crewCount: 5 + Math.floor(Math.random() * 10),
            };
            gameState.currentSector.entities.push(shuttle);
        }
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" is abandoning ship! ${shuttleCount} escape shuttles have launched.` });
        
        ship.isDerelict = true;
        ship.hull = 1; 
    }
}
