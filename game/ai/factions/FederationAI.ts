
import type { GameState, Ship, Shuttle, ShipSubsystems } from '../../../types';
// FIX: Added AIStance to import.
import { FactionAI, AIActions, AIStance } from '../FactionAI';
// FIX: Consolidated uniqueId import into the correct path.
import { findClosestTarget, moveOneStep, uniqueId } from '../../utils/ai';
// FIX: Corrected import path for shipRoleStats from shipClassStats.ts to shipRoleStats.ts.
import { shipRoleStats } from '../../../assets/ships/configs/shipRoleStats';

export class FederationAI extends FactionAI {
    // FIX: Corrected method signature to match the abstract class. The 'playerShip' parameter was changed to 'potentialTargets'.
    determineStance(ship: Ship, potentialTargets: Ship[]): AIStance {
        return 'Balanced'; // Friendly ships are always balanced.
    }

    // FIX: Implemented missing abstract method 'determineSubsystemTarget' to satisfy the FactionAI interface.
    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        return null; // Federation AI is non-hostile
    }

    // FIX: Corrected method signature to match the abstract class.
    processTurn(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[]): void {
        const { currentSector } = gameState;
        const shuttles = currentSector.entities.filter(e => e.type === 'shuttle' && e.faction === 'Federation');

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
