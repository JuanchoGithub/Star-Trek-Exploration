import type { GameState, Ship, Shuttle, ShipSubsystems, TorpedoProjectile } from '../../../types';
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { findClosestTarget, moveOneStep, uniqueId, calculateDistance } from '../../utils/ai';
import { shipRoleStats } from '../../../assets/ships/configs/shipRoleStats';
import { determineGeneralStance, processCommonTurn, processRecoveryTurn } from './common';

export class FederationAI extends FactionAI {
    determineStance(ship: Ship, potentialTargets: Ship[]): { stance: AIStance, reason: string } {
        const generalStance = determineGeneralStance(ship, potentialTargets);
        if (generalStance.stance !== 'Balanced') {
            return generalStance;
        }

        const shipHealth = ship.hull / ship.maxHull;
        if (shipHealth < 0.5) {
            return { stance: 'Defensive', reason: `Hull below 50% (${Math.round(shipHealth * 100)}%).` };
        }
        return { stance: 'Balanced', reason: generalStance.reason + ` Adopting standard Federation balanced doctrine.` };
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

    handleTorpedoThreat(ship: Ship, gameState: GameState, actions: AIActions, incomingTorpedoes: TorpedoProjectile[]): boolean {
        if (ship.subsystems.pointDefense.health > 0 && !ship.pointDefenseEnabled) {
            ship.pointDefenseEnabled = true;
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Detects incoming torpedoes! Activating point-defense grid.` });
        }
        return false; // Point-defense is not a turn-ending action.
    }

    executeMainTurnLogic(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[]): void {
        const { stance, reason } = this.determineStance(ship, potentialTargets);
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Stance analysis: ${reason}` });

        if (stance === 'Recovery') {
            processRecoveryTurn(ship, actions);
            return;
        }

        if (ship.repairTarget) {
            ship.repairTarget = null;
        }

        if (potentialTargets.length > 0) {
            const target = findClosestTarget(ship, potentialTargets);
            if (target) {
                const subsystemTarget = this.determineSubsystemTarget(ship, target);

                switch (stance) {
                    case 'Defensive':
                        if (ship.energyAllocation.shields !== 60) {
                            ship.energyAllocation = { weapons: 20, shields: 60, engines: 20 };
                        }
                        break;
                    case 'Balanced':
                    default:
                        if (ship.energyAllocation.weapons !== 34) {
                            ship.energyAllocation = { weapons: 34, shields: 33, engines: 33 };
                        }
                        break;
                }
                
                processCommonTurn(ship, potentialTargets, gameState, actions, subsystemTarget, stance);
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
