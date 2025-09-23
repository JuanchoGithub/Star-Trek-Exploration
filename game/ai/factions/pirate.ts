import type { GameState, Ship, ShipSubsystems } from '../../../types';
// FIX: Added AIStance to import
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { processCommonTurn, tryCaptureDerelict, processRecoveryTurn } from './common';
import { calculateDistance, findClosestTarget } from '../../utils/ai';

export class PirateAI extends FactionAI {
    // FIX: Implemented missing abstract member 'determineStance'.
    determineStance(ship: Ship, potentialTargets: Ship[]): AIStance {
        const closestTarget = findClosestTarget(ship, potentialTargets);
        if (!closestTarget || calculateDistance(ship.position, closestTarget.position) > 10) {
            if (ship.hull < ship.maxHull || Object.values(ship.subsystems).some(s => s.health < s.maxHealth) || ship.energy.current < ship.energy.max * 0.9) {
                return 'Recovery';
            }
            return 'Balanced';
        }

        // Pirates are opportunistic cowards.
        const shipHealth = ship.hull / ship.maxHull;
        const playerHealth = closestTarget.hull / closestTarget.maxHull;

        if (shipHealth < 0.6) {
            return 'Defensive'; // Prioritize self-preservation above all.
        }
        if (playerHealth < 0.4) {
            return 'Aggressive'; // Press the advantage against a weakened foe.
        }
        return 'Balanced';
    }

    // FIX: Implemented missing abstract method 'determineSubsystemTarget' to satisfy FactionAI.
    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        // Pirates target transporters to prevent boarding parties, which might capture their loot.
        if (playerShip.subsystems.transporter.health > 0) {
            return 'transporter';
        }
        // Fallback to weapons if transporter is down.
        if (playerShip.subsystems.weapons.health > 0) {
            return 'weapons';
        }
        return null; // Target hull as a last resort.
    }

    // FIX: Corrected processTurn to accept potentialTargets and pass them to processCommonTurn.
    processTurn(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[]): void {
        if (tryCaptureDerelict(ship, gameState, actions)) {
            return; // Turn spent capturing
        }

        const stance = this.determineStance(ship, potentialTargets);

        if (stance === 'Recovery') {
            processRecoveryTurn(ship, actions);
            return;
        }

        if (ship.repairTarget) {
            ship.repairTarget = null;
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `An easy prize! Halting repairs to attack.` });
        }
        
        const target = findClosestTarget(ship, potentialTargets);
        if (target) {
            const subsystemTarget = this.determineSubsystemTarget(ship, target);
            let stanceChanged = false;

            switch (stance) {
                case 'Aggressive':
                    if (ship.energyAllocation.weapons !== 60) {
                        ship.energyAllocation = { weapons: 60, shields: 20, engines: 20 };
                        stanceChanged = true;
                    }
                    break;
                case 'Defensive':
                    if (ship.energyAllocation.shields !== 60) {
                        ship.energyAllocation = { weapons: 20, shields: 60, engines: 20 };
                        stanceChanged = true;
                    }
                    break;
                case 'Balanced':
                    if (ship.energyAllocation.weapons !== 34) {
                        ship.energyAllocation = { weapons: 34, shields: 33, engines: 33 };
                        stanceChanged = true;
                    }
                    break;
            }
            
            if (stanceChanged) {
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Re-routing power to take a ${stance.toLowerCase()} stance.`, isPlayerSource: false });
            }
            
            // FIX: Added the missing 'stance' argument to the processCommonTurn call.
            processCommonTurn(ship, potentialTargets, gameState, actions, subsystemTarget, stance);
        } else {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position, no targets in sight.`, isPlayerSource: false });
        }
    }

    // FIX: Replaced `getDesperationMove` with `processDesperationMove` and implemented the self-destruct logic.
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