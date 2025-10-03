
import type { GameState, Ship, ShipSubsystems, TorpedoProjectile } from '../../../types';
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { determineGeneralStance, processCommonTurn, tryCaptureDerelict, processRecoveryTurn, processPreparingTurn, processSeekingTurn, processProwlingTurn } from './common';
import { findClosestTarget } from '../../utils/ai';

export class KlingonAI extends FactionAI {
    determineStance(ship: Ship, potentialTargets: Ship[]): { stance: AIStance, reason: string } {
        const closestTarget = findClosestTarget(ship, potentialTargets);
        if (closestTarget && closestTarget.shields <= 0) {
            return { stance: 'Aggressive', reason: `Target is unshielded! A glorious kill awaits!` };
        }
        
        const generalStance = determineGeneralStance(ship, potentialTargets);
        // Klingon Specific override for Preparing
        if (generalStance.stance === 'Preparing') {
            const healthPercent = ship.hull / ship.maxHull;
            if (healthPercent >= 0.5) { // Klingons are impatient, start seeking at 50% health
                return { stance: 'Seeking', reason: `Repairs are sufficient. The hunt begins!` };
            }
        }
        if (generalStance.stance !== 'Balanced') {
            return generalStance;
        }
        
        return { stance: 'Aggressive', reason: generalStance.reason + ` Defaulting to honorable aggression.` };
    }

    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        // If the target is unshielded, a Klingon goes for the kill. Target the hull.
        if (playerShip.shields <= 0) {
            return null;
        }
        
        // Otherwise, they target weapons to force a close, honorable fight.
        if (playerShip.subsystems.weapons.health > 0) {
            return 'weapons';
        }
        return null; // Target hull if weapons are already destroyed.
    }

    handleTorpedoThreat(ship: Ship, gameState: GameState, actions: AIActions, incomingTorpedoes: TorpedoProjectile[]): { turnEndingAction: boolean, defenseActionTaken: string | null } {
        // Klingons prefer to shoot down torpedoes rather than flee.
        if (ship.subsystems.pointDefense.health > 0 && !ship.pointDefenseEnabled) {
            ship.pointDefenseEnabled = true;
            return { turnEndingAction: false, defenseActionTaken: 'Activating point-defense grid.' };
        }
        return { turnEndingAction: false, defenseActionTaken: null };
    }

    executeMainTurnLogic(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[], defenseActionTaken: string | null, claimedCellsThisTurn: Set<string>, allShipsInSector: Ship[]): void {
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

        if (ship.repairTarget) {
            ship.repairTarget = null;
        }

        const target = findClosestTarget(ship, potentialTargets);

        if (target) {
            const subsystemTarget = this.determineSubsystemTarget(ship, target);

            switch (stance) {
                case 'Aggressive':
                    if (ship.energyAllocation.weapons !== 74) {
                        ship.energyAllocation = { weapons: 74, shields: 13, engines: 13 };
                    }
                    break;
                case 'Defensive':
                    if (ship.energyAllocation.shields !== 60) {
                        ship.energyAllocation = { weapons: 20, shields: 60, engines: 20 };
                    }
                    break;
                case 'Balanced':
                    if (ship.energyAllocation.weapons !== 34) {
                        ship.energyAllocation = { weapons: 34, shields: 33, engines: 33 };
                    }
                    break;
            }
            
            processCommonTurn(ship, potentialTargets, gameState, actions, subsystemTarget, stance, reason, defenseActionTaken, claimedCellsThisTurn, allShipsInSector);
        } else {
            claimedCellsThisTurn.add(`${ship.position.x},${ship.position.y}`);
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position, no targets in sight.`, isPlayerSource: false });
        }
    }

    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
        const allShips = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
        const enemyShips = allShips.filter(s => s.faction !== ship.faction);
        const target = findClosestTarget(ship, enemyShips);

        if (target) {
            actions.triggerDesperationAnimation({ source: ship, target, type: 'ram' });

            const shieldPercent = target.maxShields > 0 ? target.shields / target.maxShields : 0;
            const shieldDamageMultiplier = shieldPercent < 0.2 ? 1.0 : 0.8;
            const hullDamageMultiplier = shieldPercent < 0.2 ? 0.8 : 0.4;
            const shieldDamage = target.maxShields * shieldDamageMultiplier;
            const hullDamage = target.maxHull * hullDamageMultiplier;

            target.shields = Math.max(0, target.shields - shieldDamage);
            target.hull = Math.max(0, target.hull - hullDamage);

            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" makes a final glorious charge, ramming the "${target.name}"!\n--> Target takes ${Math.round(shieldDamage)} shield and ${Math.round(hullDamage)} hull damage!` });
            ship.hull = 0;
        } else {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `With no target to ram, the "${ship.name}" overloads its core in a final, defiant act!` });
            ship.hull = 0;
        }
    }
}
