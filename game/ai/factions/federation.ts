

import type { GameState, Ship, Shuttle, ShipSubsystems } from '../../../types';
// FIX: Added missing imports and corrected FactionAI import.
import { FactionAI, AIActions, AIStance } from '../FactionAI';
// FIX: Corrected import paths for utilities.
import { findClosestTarget, moveOneStep, uniqueId } from '../../utils/ai';
import { shipRoleStats } from '../../../assets/ships/configs/shipRoleStats';

export class FederationAI extends FactionAI {
    // FIX: Implemented missing abstract member 'determineStance' to satisfy the FactionAI interface.
    determineStance(ship: Ship, playerShip: Ship): AIStance {
        return 'Balanced'; // Friendly ships are always balanced.
    }

    // FIX: Implemented missing abstract member 'determineSubsystemTarget' to satisfy the FactionAI interface.
    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        return null; // Federation AI is non-hostile.
    }

    // FIX: Corrected method signature to match the abstract class definition.
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
        
        // Instead of being destroyed, the ship becomes a derelict hulk
        ship.isDerelict = true;
        ship.hull = 1; // Keep it on the map
    }
}