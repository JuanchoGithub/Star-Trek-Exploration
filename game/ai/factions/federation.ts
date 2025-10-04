import type { GameState, Ship, Shuttle, ShipSubsystems, TorpedoProjectile } from '../../../types';
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { findClosestTarget, moveOneStep, uniqueId, calculateDistance, calculateOptimalEngagementRange } from '../../utils/ai';
// FIX: Corrected import path for shipRoleStats.
import { shipRoleStats } from '../../../assets/ships/configs/shipRoleStats';
import { determineGeneralStance, processCommonTurn, processRecoveryTurn, processPreparingTurn, processSeekingTurn, processProwlingTurn, tryCaptureDerelict } from './common';

export class FederationAI extends FactionAI {
    determineStance(ship: Ship, potentialTargets: Ship[]): { stance: AIStance, reason: string } {
        const closestTarget = findClosestTarget(ship, potentialTargets);

        // Federation specific override for Preparing
        if (ship.repairTarget === null) { // only check to switch if not actively repairing something specific
            const healthPercent = ship.hull / ship.maxHull;
            if (healthPercent >= 0.8) {
                 const generalStance = determineGeneralStance(ship, potentialTargets);
                 if(generalStance.stance === 'Preparing') {
                     return { stance: 'Seeking', reason: `Repairs complete. Commencing search.` };
                 }
            }
        }
        
        if (closestTarget && closestTarget.shields <= 0) {
            // Only go aggressive if not critically damaged yourself
            if (ship.hull / ship.maxHull > 0.3) {
                return { stance: 'Aggressive', reason: `Target is unshielded. Moving to disable key systems.` };
            }
        }
        
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

    handleTorpedoThreat(ship: Ship, gameState: GameState, actions: AIActions, incomingTorpedoes: TorpedoProjectile[]): { turnEndingAction: boolean, defenseActionTaken: string | null } {
        if (ship.subsystems.pointDefense.health > 0 && !ship.pointDefenseEnabled) {
            ship.pointDefenseEnabled = true;
            return { turnEndingAction: false, defenseActionTaken: 'Activating point-defense grid.' };
        }
        return { turnEndingAction: false, defenseActionTaken: null };
    }

    executeMainTurnLogic(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[], defenseActionTaken: string | null, claimedCellsThisTurn: Set<string>, allShipsInSector: Ship[]): void {
        const { stance, reason } = this.determineStance(ship, potentialTargets);

        if (stance === 'Balanced') {
            if (Math.random() < 0.3) {
                if (tryCaptureDerelict(ship, gameState, actions)) {
                    claimedCellsThisTurn.add(`${ship.position.x},${ship.position.y}`);
                    return; // Turn spent capturing
                }
            }
        }

        if (stance === 'Recovery') {
            processRecoveryTurn(ship, actions, gameState.turn, claimedCellsThisTurn);
            return;
        }
        if (stance === 'Preparing') {
            processPreparingTurn(ship, actions, gameState.turn, claimedCellsThisTurn);
            return;
        }
        if (stance === 'Seeking') {
            processSeekingTurn(ship, gameState, actions, claimedCellsThisTurn, allShipsInSector);
            return;
        }
        if (stance === 'Prowling') {
            processProwlingTurn(ship, gameState, actions, claimedCellsThisTurn, allShipsInSector);
            return;
        }

        if (ship.repairTarget) {
            ship.repairTarget = null;
        }
        
        const target = findClosestTarget(ship, potentialTargets);
        if (target) {
            const subsystemTarget = this.determineSubsystemTarget(ship, target);
            const optimalRange = calculateOptimalEngagementRange(ship, target);

            switch (stance) {
                case 'Aggressive':
                    if (ship.energyAllocation.weapons !== 50) {
                            ship.energyAllocation = { weapons: 50, shields: 25, engines: 25 };
                    }
                    break;
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
            
            processCommonTurn(ship, potentialTargets, gameState, actions, subsystemTarget, stance, reason, defenseActionTaken, claimedCellsThisTurn, allShipsInSector, optimalRange);
        } else {
             // This case handles when a stance is aggressive but no targets are currently visible (e.g. they cloaked)
            if (ship.hiddenEnemies && ship.hiddenEnemies.length > 0) {
                processSeekingTurn(ship, gameState, actions, claimedCellsThisTurn, allShipsInSector);
            } else {
                // Fallback to original non-hostile logic if no enemies were ever detected
                const { currentSector } = gameState;
                const shuttles = currentSector.entities.filter(e => e.type === 'shuttle' && e.faction === 'Federation');

                if (shuttles.length > 0) {
                    const closestShuttle = findClosestTarget(ship, shuttles as any);
                    if (closestShuttle) {
                        const nextPosition = moveOneStep(ship.position, closestShuttle.position);
                        const posKey = `${nextPosition.x},${nextPosition.y}`;
                        if (!claimedCellsThisTurn.has(posKey)) {
                            ship.position = nextPosition;
                            claimedCellsThisTurn.add(posKey);
                            actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `Moving to rescue escape shuttles.`, isPlayerSource: false, category: 'movement' });
                        } else {
                            claimedCellsThisTurn.add(`${ship.position.x},${ship.position.y}`);
                            actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `Path to shuttles is blocked. Holding position.`, isPlayerSource: false, category: 'movement' });
                        }
                        return;
                    }
                }
                claimedCellsThisTurn.add(`${ship.position.x},${ship.position.y}`);
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `Holding position.`, isPlayerSource: false, category: 'movement' });
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
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `"${ship.name}" is abandoning ship! ${shuttleCount} escape shuttles have launched.`, category: 'special' });
        
        ship.isDerelict = true;
        ship.hull = 1; 
    }
}