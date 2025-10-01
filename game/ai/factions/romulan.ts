import type { GameState, Ship, ShipSubsystems, TorpedoProjectile } from '../../../types';
import { AIActions, FactionAI, AIStance } from '../FactionAI';
import { determineGeneralStance, processCommonTurn, tryCaptureDerelict, processRecoveryTurn } from './common';
import { findClosestTarget } from '../../utils/ai';

export class RomulanAI extends FactionAI {
    determineStance(ship: Ship, potentialTargets: Ship[]): { stance: AIStance, reason: string } {
        const generalStance = determineGeneralStance(ship, potentialTargets);
        if (generalStance.stance !== 'Balanced') {
            return generalStance;
        }

        const closestTarget = findClosestTarget(ship, potentialTargets);
        if (!closestTarget) return { stance: 'Balanced', reason: 'No targets detected.' };

        // Romulans are tactical and cautious.
        if (closestTarget.shields <= 0) {
            // Only go aggressive if not too damaged yourself
            if (ship.hull / ship.maxHull > 0.4) {
                return { stance: 'Aggressive', reason: `Target is exposed. Moving to disable key systems for intelligence.` };
            }
        }
        return { stance: 'Balanced', reason: generalStance.reason + ' Adopting standard Romulan balanced doctrine.' };
    }

    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        // Romulans target engines to disable and control the engagement.
        if (playerShip.subsystems.engines.health > 0) {
            return 'engines';
        }
        return null; // Target hull if engines are already destroyed.
    }

    handleTorpedoThreat(ship: Ship, gameState: GameState, actions: AIActions, incomingTorpedoes: TorpedoProjectile[]): { turnEndingAction: boolean, defenseActionTaken: string | null } {
        if (ship.cloakingCapable && ship.cloakState === 'visible' && ship.cloakCooldown <= 0) {
             ship.cloakState = 'cloaking';
             ship.cloakTransitionTurnsRemaining = 2;
             return { turnEndingAction: true, defenseActionTaken: 'Evading via cloaking device.' };
        }
    
        // Fallback to point defense if cloak is not available
        if (ship.subsystems.pointDefense.health > 0 && !ship.pointDefenseEnabled) {
            ship.pointDefenseEnabled = true;
            return { turnEndingAction: false, defenseActionTaken: 'Cloak unavailable. Activating point-defense.' };
        }
        return { turnEndingAction: false, defenseActionTaken: null };
    }

    executeMainTurnLogic(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[], defenseActionTaken: string | null): void {
        if (tryCaptureDerelict(ship, gameState, actions)) {
            return; // Turn spent capturing
        }
        
        const { stance, reason } = this.determineStance(ship, potentialTargets);

        if (stance === 'Recovery') {
            processRecoveryTurn(ship, actions, gameState.turn);
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
            
            processCommonTurn(ship, potentialTargets, gameState, actions, subsystemTarget, stance, reason, defenseActionTaken);
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
