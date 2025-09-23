import type { GameState, Ship, Shuttle, ShipSubsystems } from '../../../types';
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { findClosestTarget, moveOneStep, uniqueId } from '../../utils/ai';
import { shipRoleStats } from '../../../assets/ships/configs/shipRoleStats';
import { processCommonTurn } from './common';

export class FederationAI extends FactionAI {
    determineStance(ship: Ship, playerShip: Ship): AIStance {
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
        // If allegiance is 'enemy', behave like a hostile combatant.
        if (ship.allegiance === 'enemy') {
            const target = findClosestTarget(ship, potentialTargets);
            if (target) {
                const stance = this.determineStance(ship, target);
                const subsystemTarget = this.determineSubsystemTarget(ship, target);
                let stanceChanged = false;

                switch (stance) {
                    case 'Defensive':
                        if (ship.energyAllocation.shields !== 80) {
                            ship.energyAllocation = { weapons: 20, shields: 80, engines: 0 };
                            stanceChanged = true;
                        }
                        break;
                    case 'Balanced':
                    default:
                        if (ship.energyAllocation.weapons !== 50) {
                            ship.energyAllocation = { weapons: 50, shields: 50, engines: 0 };
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
            }
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position.`, isPlayerSource: false });
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