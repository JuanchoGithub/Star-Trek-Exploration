
import type { GameState, Ship, ShipSubsystems } from '../../../types';
// FIX: Added AIStance to import
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { processCommonTurn, tryCaptureDerelict } from './common';
import { calculateDistance, findClosestTarget } from '../../utils/ai';

export class PirateAI extends FactionAI {
    // FIX: Corrected method signature to match the abstract class and updated logic to use potentialTargets.
    determineStance(ship: Ship, potentialTargets: Ship[]): AIStance {
        const target = findClosestTarget(ship, potentialTargets);
        if (!target) {
            return 'Balanced';
        }

        // Pirates are opportunistic cowards.
        const shipHealth = ship.hull / ship.maxHull;
        const playerHealth = target.hull / target.maxHull;

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

        const target = findClosestTarget(ship, potentialTargets);
        if (target) {
            const stance = this.determineStance(ship, potentialTargets);
            const subsystemTarget = this.determineSubsystemTarget(ship, target);
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
                case 'Balanced':
                    if (ship.energyAllocation.weapons !== 50) {
                        ship.energyAllocation = { weapons: 50, shields: 50, engines: 0 };
                        stanceChanged = true;
                    }
                    break;
            }
            
            if (stanceChanged) {
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Re-routing power to take a ${stance.toLowerCase()} stance.`, isPlayerSource: false });
            }
            
            // FIX: Added the missing 'stance' argument to the processCommonTurn call to resolve the "Expected 6 arguments, but got 5" error.
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
