import type { GameState, Ship, ShipSubsystems, TorpedoProjectile } from '../../../types';
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { processCommonTurn, tryCaptureDerelict, determineGeneralStance, processRecoveryTurn, processPreparingTurn, processSeekingTurn, processProwlingTurn } from './common';
import { calculateDistance, findClosestTarget } from '../../utils/ai';

export class PirateAI extends FactionAI {
    determineStance(ship: Ship, potentialTargets: Ship[]): { stance: AIStance, reason: string } {
        const closestTarget = findClosestTarget(ship, potentialTargets);
        if (closestTarget && closestTarget.shields <= 0) {
            // Only go aggressive if not too damaged yourself
            if (ship.hull / ship.maxHull > 0.4) {
                return { stance: 'Aggressive', reason: `Target is a vulnerable prize. Moving to disable engines.` };
            }
        }

        const generalStance = determineGeneralStance(ship, potentialTargets);
        // Pirate Specific override: give up easily
        if (generalStance.stance === 'Seeking' && ship.hiddenEnemies && ship.hiddenEnemies.length > 2) {
             if (Math.random() < 0.5) { // 50% chance to just give up if there are too many to hunt
                ship.hiddenEnemies = [];
                ship.seekingTarget = null;
                ship.prowling = false;
                return { stance: 'Recovery', reason: `This hunt is no longer profitable. Abandoning search.` };
             }
        }

        if (generalStance.stance !== 'Balanced') {
            return generalStance;
        }

        const target = closestTarget; // Already found it
        if (!target) {
            return { stance: 'Balanced', reason: 'No targets detected.' };
        }

        const shipHealth = ship.hull / ship.maxHull;
        const targetHealth = target.hull / target.maxHull;

        if (shipHealth < 0.6) {
            return { stance: 'Defensive', reason: `Own hull is below 60% (${Math.round(shipHealth * 100)}%).` };
        }
        if (targetHealth < 0.4) {
            return { stance: 'Aggressive', reason: `Target hull is weak (${Math.round(targetHealth * 100)}% < 40%). Pressing the attack!` };
        }

        return { stance: 'Balanced', reason: generalStance.reason + ' Maintaining balanced attack pattern.' };
    }

    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        // Per manual: If shields are down, target Engines to prevent escape.
        if (playerShip.shields <= 0) {
            if (playerShip.subsystems.engines.health > 0) {
                return 'engines';
            }
            // Fallback: If engines are destroyed, target weapons.
            if (playerShip.subsystems.weapons.health > 0) {
                return 'weapons';
            }
        } 
        // Per manual: Otherwise (shields up), target Transporter Systems.
        else {
            if (playerShip.subsystems.transporter.health > 0) {
                return 'transporter';
            }
            // Fallback: If transporters are destroyed, target weapons.
            if (playerShip.subsystems.weapons.health > 0) {
                return 'weapons';
            }
        }

        // If the primary and fallback for the situation are both destroyed, target the hull.
        return null;
    }

    handleTorpedoThreat(ship: Ship, gameState: GameState, actions: AIActions, incomingTorpedoes: TorpedoProjectile[]): { turnEndingAction: boolean, defenseActionTaken: string | null } {
        // Pirates with an unstable cloak will gamble
        if (ship.cloakingCapable && ship.cloakState === 'visible' && ship.cloakCooldown <= 0) {
            ship.cloakState = 'cloaking';
            ship.cloakTransitionTurnsRemaining = 2;
            return { turnEndingAction: true, defenseActionTaken: 'Engaging makeshift cloaking device.' };
        }
        
        // Fallback to point defense
        if (ship.subsystems.pointDefense.health > 0 && !ship.pointDefenseEnabled) {
            ship.pointDefenseEnabled = true;
            return { turnEndingAction: false, defenseActionTaken: 'Cloak unavailable. Activating point-defense.' };
        }
        return { turnEndingAction: false, defenseActionTaken: null };
    }

    executeMainTurnLogic(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[], defenseActionTaken: string | null, claimedCellsThisTurn: Set<string>, allShipsInSector: Ship[], priorityTargetId: string | null): void {
        if (tryCaptureDerelict(ship, gameState, actions)) {
            claimedCellsThisTurn.add(`${ship.position.x},${ship.position.y}`);
            return; // Turn spent capturing
        }
        
        const { stance, reason } = this.determineStance(ship, potentialTargets);

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

        const target = findClosestTarget(ship, potentialTargets);
        if (target) {
            const subsystemTarget = this.determineSubsystemTarget(ship, target);

            switch (stance) {
                case 'Aggressive':
                    if (ship.energyAllocation.weapons !== 70) {
                        ship.energyAllocation = { weapons: 70, shields: 30, engines: 0 };
                    }
                    break;
                case 'Defensive':
                    if (ship.energyAllocation.shields !== 80) {
                        ship.energyAllocation = { weapons: 20, shields: 80, engines: 0 };
                    }
                    break;
                case 'Balanced':
                    if (ship.energyAllocation.weapons !== 50) {
                        ship.energyAllocation = { weapons: 50, shields: 50, engines: 0 };
                    }
                    break;
            }
            
            processCommonTurn(ship, potentialTargets, gameState, actions, subsystemTarget, stance, reason, defenseActionTaken, claimedCellsThisTurn, allShipsInSector, priorityTargetId);
        } else {
            claimedCellsThisTurn.add(`${ship.position.x},${ship.position.y}`);
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position, no targets in sight.`, isPlayerSource: false });
        }
    }

    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
        const allShips = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
        const adjacentShips = allShips.filter(s => s.id !== ship.id && calculateDistance(ship.position, s.position) <= 1);
        
        actions.triggerDesperationAnimation({ source: ship, type: 'self_destruct' });

        let logMessage = `"${ship.name}" overloads its reactor! The ship explodes violently!`;
        
        adjacentShips.forEach(target => {
            const shieldPercent = target.maxShields > 0 ? target.shields / target.maxShields : 0;
            const shieldDamageMultiplier = shieldPercent < 0.2 ? 1.0 : 0.8;
            const hullDamageMultiplier = shieldPercent < 0.2 ? 0.4 : 0.2;
            const shieldDamage = target.maxShields * shieldDamageMultiplier;
            const hullDamage = target.maxHull * hullDamageMultiplier;
            
            target.shields = Math.max(0, target.shields - shieldDamage);
            target.hull = Math.max(0, target.hull - hullDamage);
            logMessage += `\n--> "${target.name}" is caught in the blast!`;
        });
        
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: logMessage });
        ship.hull = 0;
    }
}