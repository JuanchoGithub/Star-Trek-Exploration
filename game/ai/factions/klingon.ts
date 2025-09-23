import type { GameState, Ship, ShipSubsystems } from '../../../types';
// FIX: Added AIStance to import
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { processCommonTurn, tryCaptureDerelict, processRecoveryTurn } from './common';
import { findClosestTarget, calculateDistance } from '../../utils/ai';

export class KlingonAI extends FactionAI {
    // FIX: Implemented missing abstract member 'determineStance'.
    determineStance(ship: Ship, potentialTargets: Ship[]): AIStance {
        const closestTarget = findClosestTarget(ship, potentialTargets);
        if (!closestTarget || calculateDistance(ship.position, closestTarget.position) > 10) {
            if (ship.hull < ship.maxHull || Object.values(ship.subsystems).some(s => s.health < s.maxHealth) || ship.energy.current < ship.energy.max * 0.9) {
                return 'Recovery';
            }
            return 'Balanced';
        }

        // Klingons are honorable warriors. They will fight aggressively until their ship is nearly destroyed.
        if (ship.hull / ship.maxHull < 0.25) {
            return 'Defensive'; // A tactical retreat to repair is not dishonorable.
        }
        return 'Aggressive';
    }

    // FIX: Implemented missing abstract method 'determineSubsystemTarget' to satisfy FactionAI.
    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        // Klingons target weapons to force a close, honorable fight.
        if (playerShip.subsystems.weapons.health > 0) {
            return 'weapons';
        }
        return null; // Target hull if weapons are already destroyed.
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
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Hostiles detected. Halting repairs to engage.` });
        }

        const target = findClosestTarget(ship, potentialTargets);

        if (target) {
            const subsystemTarget = this.determineSubsystemTarget(ship, target);
            let stanceChanged = false;

            switch (stance) {
                case 'Aggressive':
                    if (ship.energyAllocation.weapons !== 74) {
                        ship.energyAllocation = { weapons: 74, shields: 13, engines: 13 };
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
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Diverting power to a more ${stance.toLowerCase()} footing.` });
            }
            
            // FIX: Added the missing 'stance' argument to the processCommonTurn call.
            processCommonTurn(ship, potentialTargets, gameState, actions, subsystemTarget, stance);
        } else {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position, no targets in sight.`, isPlayerSource: false });
        }
    }

    // FIX: Replaced `getDesperationMove` with `processDesperationMove` and implemented the ramming logic.
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