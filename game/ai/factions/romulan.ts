import type { GameState, Ship, ShipSubsystems } from '../../../types';
import { AIActions, FactionAI, AIStance } from '../FactionAI';
import { processCommonTurn, tryCaptureDerelict, processRecoveryTurn } from './common';
import { findClosestTarget, calculateDistance } from '../../utils/ai';

export class RomulanAI extends FactionAI {
    determineStance(ship: Ship, potentialTargets: Ship[]): AIStance {
        const closestTarget = findClosestTarget(ship, potentialTargets);
        if (!closestTarget || calculateDistance(ship.position, closestTarget.position) > 10) {
            if (ship.hull < ship.maxHull || Object.values(ship.subsystems).some(s => s.health < s.maxHealth) || ship.energy.current < ship.energy.max * 0.9) {
                return 'Recovery';
            }
            return 'Balanced';
        }

        // Romulans are tactical and cautious.
        const shipHealth = ship.hull / ship.maxHull;

        if (shipHealth < 0.5) {
            return 'Defensive'; // Preserve the ship if significantly damaged.
        }
        if (closestTarget.shields <= 0) {
            return 'Aggressive'; // Exploit a critical weakness.
        }
        return 'Balanced';
    }

    // FIX: Implemented missing abstract method 'determineSubsystemTarget' to satisfy the FactionAI class and fix compile error.
    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        // Romulans target engines to disable and control the engagement.
        if (playerShip.subsystems.engines.health > 0) {
            return 'engines';
        }
        return null; // Target hull if engines are already destroyed.
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
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Target detected. Aborting repairs.` });
        }

        const target = findClosestTarget(ship, potentialTargets);
        if (target) {
            const subsystemTarget = this.determineSubsystemTarget(ship, target);
            let stanceChanged = false;

            switch (stance) {
                case 'Aggressive':
                    if (ship.energyAllocation.weapons !== 70) {
                        ship.energyAllocation = { weapons: 70, shields: 20, engines: 10 };
                        stanceChanged = true;
                    }
                    break;
                case 'Defensive':
                    if (ship.energyAllocation.shields !== 70) {
                        ship.energyAllocation = { weapons: 10, shields: 70, engines: 20 };
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
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Adjusting power distribution for a ${stance.toLowerCase()} posture.`, isPlayerSource: false });
            }
            
            // FIX: Added the missing 'stance' argument to the processCommonTurn call.
            processCommonTurn(ship, potentialTargets, gameState, actions, subsystemTarget, stance);
        } else {
             actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position, no targets in sight.`, isPlayerSource: false });
        }
    }

    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
        // Romulans try to escape. 30% chance of failure.
        const escapeFails = Math.random() < 0.3;

        if (escapeFails) {
            actions.triggerDesperationAnimation({ source: ship, type: 'escape', outcome: 'failure' });
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" attempts an unstable warp jump to escape... but the core breaches! The ship is destroyed!` });
            ship.hull = 0;
        } else {
            actions.triggerDesperationAnimation({ source: ship, type: 'escape', outcome: 'success' });
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" attempts an unstable warp jump... and vanishes! They've escaped!` });
            
            gameState.currentSector.entities = gameState.currentSector.entities.filter(e => e.id !== ship.id);
        }
    }
}