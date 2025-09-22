import type { GameState, Ship, Shuttle, ShipSubsystems } from '../../../types';
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { findClosestTarget, moveOneStep } from '../../utils/ai';
import { shipRoleStats } from '../../../assets/ships/configs/shipRoleStats';
import { uniqueId } from '../../utils/helpers';
import { processCommonTurn } from './common';

export class FederationAI extends FactionAI {
    determineStance(ship: Ship, playerShip: Ship): AIStance {
         if (ship.hull / ship.maxHull < 0.4) {
            return 'Defensive';
        }
        return 'Balanced';
    }

    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        if (playerShip.shields / playerShip.maxShields > 0.5 && playerShip.subsystems.shields.health > 0) {
            return 'shields';
        }
        if (playerShip.subsystems.weapons.health > 0) {
            return 'weapons';
        }
        return null;
    }

    processTurn(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[]): void {
        // If there are enemies, engage in combat
        if (potentialTargets.length > 0) {
            const target = findClosestTarget(ship, potentialTargets);
            if (target) {
                const stance = this.determineStance(ship, target);
                const subsystemTarget = this.determineSubsystemTarget(ship, target);
                // FIX: Added the missing 'stance' argument to the processCommonTurn call.
                processCommonTurn(ship, potentialTargets, gameState, actions, subsystemTarget, stance);
                return;
            }
        }

        // Default non-combat behavior
        const { currentSector } = gameState;
        const shuttles = currentSector.entities.filter(e => e.type === 'shuttle' && e.faction === 'Federation');

        if (shuttles.length > 0) {
            const closestShuttle = findClosestTarget(ship, shuttles as any);
            if (closestShuttle) {
                ship.position = moveOneStep(ship.position, closestShuttle.position);
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Moving to rescue escape shuttles.`, isPlayerSource: false, color: 'border-blue-300' });
                return;
            }
        }
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position.`, isPlayerSource: false, color: 'border-gray-400' });
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
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" is abandoning ship! ${shuttleCount} escape shuttles have launched.`, isPlayerSource: false, color: 'border-yellow-400' });
        
        ship.isDerelict = true;
        ship.hull = 1; 
    }
}