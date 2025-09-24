import type { GameState, Ship, ShipSubsystems } from '../../../types';
import { AIActions, FactionAI, AIStance } from '../FactionAI';
import { determineGeneralStance, processCommonTurn, tryCaptureDerelict, processRecoveryTurn } from './common';
import { findClosestTarget } from '../../utils/ai';

export class RomulanAI extends FactionAI {
    determineStance(ship: Ship, potentialTargets: Ship[]): AIStance {
        const generalStance = determineGeneralStance(ship, potentialTargets);
        if (generalStance !== 'Balanced') {
            return generalStance;
        }

        const closestTarget = findClosestTarget(ship, potentialTargets);
        if (!closestTarget) return 'Balanced';

        // Romulans are tactical and cautious.
        if (closestTarget.shields <= 0) {
            return 'Aggressive'; // Exploit a critical weakness.
        }
        return 'Balanced';
    }

    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        // Romulans target engines to disable and control the engagement.
        if (playerShip.subsystems.engines.health > 0) {
            return 'engines';
        }
        return null; // Target hull if engines are already destroyed.
    }

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
        }

        const target = findClosestTarget(ship, potentialTargets);
        if (target) {
            const subsystemTarget = this.determineSubsystemTarget(ship, target);

            switch (stance) {
                case 'Aggressive':
                    if (ship.energyAllocation.weapons !== 70) {
                        ship.energyAllocation = { weapons: 70, shields: 20, engines: 10 };
                    }
                    break;
                case 'Defensive':
                    if (ship.energyAllocation.shields !== 70) {
                        ship.energyAllocation = { weapons: 10, shields: 70, engines: 20 };
                    }
                    break;
                case 'Balanced':
                    if (ship.energyAllocation.weapons !== 34) {
                        ship.energyAllocation = { weapons: 34, shields: 33, engines: 33 };
                    }
                    break;
            }
            
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