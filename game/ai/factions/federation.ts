import type { GameState, Ship, Shuttle, ShipSubsystems } from '../../../types';
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { findClosestTarget, moveOneStep, uniqueId, calculateDistance } from '../../utils/ai';
import { shipRoleStats } from '../../../assets/ships/configs/shipRoleStats';
import { processCommonTurn, processRecoveryTurn } from './common';

export class FederationAI extends FactionAI {
    determineStance(ship: Ship, potentialTargets: Ship[]): AIStance {
        const closestTarget = findClosestTarget(ship, potentialTargets);
        if (!closestTarget || calculateDistance(ship.position, closestTarget.position) > 10) {
            if (ship.hull < ship.maxHull || Object.values(ship.subsystems).some(s => s.health < s.maxHealth) || ship.energy.current < ship.energy.max * 0.9) {
                return 'Recovery';
            }
            return 'Balanced';
        }

        // Federation ships fight with a balanced approach but will go defensive if damaged.
        if (ship.hull / ship.maxHull < 0.4) {
            return 'Defensive';
        }
        return 'Balanced';
    }

    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        // A logical Federation captain would target the most significant threat.
        if (playerShip.subsystems.weapons.health / playerShip.subsystems.weapons.maxHealth > 0) {
            return 'weapons';
        }
        // If weapons are down, target engines to prevent escape.
        if (playerShip.subsystems.engines.health / playerShip.subsystems.engines.maxHealth > 0) {
            return 'engines';
        }
        return null;
    }

    processTurn(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[]): void {
        // If there are potential targets, engage in combat logic.
        if (potentialTargets.length > 0) {
            const stance = this.determineStance(ship, potentialTargets);

            if (stance === 'Recovery') {
                processRecoveryTurn(ship, actions);
                return;
            }

            if (ship.repairTarget) {
                ship.repairTarget = null;
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Hostiles detected. Halting repairs to engage.` });
            }

            const target = findClosestTarget(ship, potentialTargets);
            if (target) {
                const subsystemTarget = this.determineSubsystemTarget(ship, target);
                let stanceChanged = false;

                switch (stance) {
                    case 'Defensive':
                        if (ship.energyAllocation.shields !== 60) {
                            ship.energyAllocation = { weapons: 20, shields: 60, engines: 20 };
                            stanceChanged = true;
                        }
                        break;
                    case 'Balanced':
                    default:
                        if (ship.energyAllocation.weapons !== 34) {
                            ship.energyAllocation = { weapons: 34, shields: 33, engines: 33 };
                            stanceChanged = true;
                        }
                        break;
                }
                
                if (stanceChanged) {
                     actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Adjusting power levels for a ${stance.toLowerCase()} posture.`, isPlayerSource: false });
                }

                processCommonTurn(ship, potentialTargets, gameState, actions, subsystemTarget, stance);
            } else {
                 actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position, no targets in sight.`, isPlayerSource: false });
            }
        } else { // Original non-hostile (ally/neutral) logic
            const { currentSector } = gameState;
            const shuttles = currentSector.entities.filter(e => e.type === 'shuttle' && e.faction === 'Federation');

            if (shuttles.length > 0) {
                const closestShuttle = findClosestTarget(ship, shuttles as any);
                if (closestShuttle) {
                    ship.position = moveOneStep(ship.position, closestShuttle.position);
                    actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Moving to rescue escape shuttles.`, isPlayerSource: false });
                    return;
                }
            } else if (ship.hull < ship.maxHull || Object.values(ship.subsystems).some(s => s.health < s.maxHealth)) {
                processRecoveryTurn(ship, actions);
            } else {
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position.`, isPlayerSource: false });
            }
        }
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
        
        ship.isDerelict = true;
        ship.hull = 1; 
    }
}
