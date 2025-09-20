import type { GameState, Ship, Shuttle } from '../../../types';
import { AIActions, FactionAI } from '../FactionAI';
import { findClosestTarget, moveOneStep, uniqueId } from '../aiUtilities';
import { shipRoleStats } from '../../../assets/ships/configs/shipRoleStats';

export class FederationAI extends FactionAI {
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

    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
        const shuttleCount = shipRoleStats[ship.shipRole]?.shuttleCount || 1;
        for (let i = 0; i < shuttleCount; i++) {
            const shuttle: Shuttle = {
                id: uniqueId(),
                name: "Federation Shuttle",
                type: 'shuttle',
                faction: 'Federation',
                position: { ...ship.position },
                scanned: true,
                crewCount: 5,
            };
            gameState.currentSector.entities.push(shuttle);
        }
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" is abandoning ship! ${shuttleCount} escape shuttles have launched.` });
        ship.hull = 0;
    }
}
