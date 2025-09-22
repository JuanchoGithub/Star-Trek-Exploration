

import type { GameState, Ship, ShipSubsystems } from '../../../types';
// FIX: Added AIStance to import
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { processCommonTurn, tryCaptureDerelict } from './common';
import { findClosestTarget } from '../../utils/ai';

export class KlingonAI extends FactionAI {
    // FIX: Implemented missing abstract member 'determineStance'.
    determineStance(ship: Ship, playerShip: Ship): AIStance {
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

    processTurn(ship: Ship, gameState: GameState, actions: AIActions): void {
        if (tryCaptureDerelict(ship, gameState, actions)) {
            return; // Turn spent capturing
        }
        
        // FIX: Implemented stance-based energy allocation.
        const stance = this.determineStance(ship, gameState.player.ship);
        // FIX: Implemented subsystem targeting.
        const subsystemTarget = this.determineSubsystemTarget(ship, gameState.player.ship);
        let stanceChanged = false;

        switch (stance) {
            case 'Aggressive':
                if (ship.energyAllocation.weapons !== 70) {
                    ship.energyAllocation = { weapons: 70, shields: 30, engines: 0 };
                    stanceChanged = true;
                }
                break;
            case 'Defensive':
                if (ship.energyAllocation.shields !== 80) {
                    ship.energyAllocation = { weapons: 20, shields: 80, engines: 0 };
                    stanceChanged = true;
                }
                break;
        }

        if (stanceChanged) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Diverting power to a more ${stance.toLowerCase()} footing.`, isPlayerSource: false });
        }
        
        // FIX: Added the missing 'subsystemTarget' argument to the function call.
        processCommonTurn(ship, gameState.player.ship, gameState, actions, subsystemTarget);
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
