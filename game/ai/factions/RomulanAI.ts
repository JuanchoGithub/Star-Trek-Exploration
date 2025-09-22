
import type { GameState, Ship, ShipSubsystems } from '../../../types';
import { AIActions, FactionAI, AIStance } from '../FactionAI';
import { processCommonTurn, tryCaptureDerelict } from './common';
import { findClosestTarget } from '../../utils/ai';

export class RomulanAI extends FactionAI {
    determineStance(ship: Ship, playerShip: Ship): AIStance {
        // Romulans are tactical and cautious.
        const shipHealth = ship.hull / ship.maxHull;

        if (shipHealth < 0.5) {
            return 'Defensive'; // Preserve the ship if significantly damaged.
        }
        if (playerShip.shields <= 0) {
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
        
        const target = findClosestTarget(ship, potentialTargets);
        if (target) {
            const stance = this.determineStance(ship, target);
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
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Adjusting power distribution for a ${stance.toLowerCase()} posture.`, isPlayerSource: false });
            }
            
            processCommonTurn(ship, potentialTargets, gameState, actions, subsystemTarget);
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
