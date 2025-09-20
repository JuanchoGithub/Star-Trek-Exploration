import type { GameState, Ship, Shuttle } from '../../../types';
import { FactionAI, AIActions } from '../FactionAI';
import { findClosestTarget, moveOneStep } from '../../utils/ai';
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

    getDesperationMove(ship: Ship, gameState: GameState): Ship['desperationMove'] {
        return { type: 'evacuate' };
    }
}
