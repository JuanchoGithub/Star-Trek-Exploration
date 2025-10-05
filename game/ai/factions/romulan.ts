import type { GameState, Ship, ShipSubsystems, TorpedoProjectile } from '../../../types';
import { AIActions, FactionAI, AIStance } from '../FactionAI';
import { determineGeneralStance, processCommonTurn, tryCaptureDerelict, processRecoveryTurn, processPreparingTurn, processSeekingTurn, processProwlingTurn } from './common';
import { findClosestTarget, calculateOptimalEngagementRange, calculateDistance } from '../../utils/ai';

export class RomulanAI extends FactionAI {
    determineStance(ship: Ship, potentialTargets: Ship[]): { stance: AIStance, reason: string } {
        const generalStance = determineGeneralStance(ship, potentialTargets);

        // Romulan Specific override for Preparing
        if (generalStance.stance === 'Preparing') {
            const healthPercent = ship.hull / ship.maxHull;
            if (healthPercent < 0.8) {
                // Stay in Preparing state until healthier
                return { stance: 'Preparing', reason: `Hull below optimal levels. Continuing preparations.`};
            } else {
                return { stance: 'Seeking', reason: `Ship is combat ready. Commencing search.`};
            }
        }

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

    executeMainTurnLogic(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[], defenseActionTaken: string | null, claimedCellsThisTurn: Set<string>, allShipsInSector: Ship[], priorityTargetId: string | null): void {
        const allEntities = [...gameState.currentSector.entities, gameState.player.ship];
        const adjacentDerelicts = allEntities.filter((e): e is Ship => 
            e.type === 'ship' &&
            e.isDerelict &&
            !e.captureInfo &&
            calculateDistance(ship.position, e.position) <= 1
        );
    
        if (adjacentDerelicts.length > 0) {
            const derelictTarget = adjacentDerelicts[0];
            // Romulans are cautious and prefer to deny assets. 5% chance to capture for intelligence.
            if (Math.random() < 0.05) {
                if (tryCaptureDerelict(ship, gameState, actions)) {
                    claimedCellsThisTurn.add(`${ship.position.x},${ship.position.y}`);
                    return; // Turn spent capturing
                }
            } else {
                // Destroy the derelict
                const stance = 'Aggressive';
                const reason = `Neutralizing the derelict ${derelictTarget.name} to prevent enemy capture.`;
                const subsystemTarget = null; // Target hull for destruction
    
                if (ship.energyAllocation.weapons !== 70) {
                    ship.energyAllocation = { weapons: 70, shields: 20, engines: 10 };
                }
                processCommonTurn(ship, [derelictTarget], gameState, actions, subsystemTarget, stance, reason, defenseActionTaken, claimedCellsThisTurn, allShipsInSector, derelictTarget.id);
                return;
            }
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
            // Romulan specific: Attempt to cloak while seeking
            if (ship.cloakingCapable && ship.cloakState === 'visible' && ship.cloakCooldown <= 0) {
                ship.cloakState = 'cloaking';
                ship.cloakTransitionTurnsRemaining = 2;
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `Engaging cloak to approach the last known coordinates of the enemy.`, isPlayerSource: false, color: ship.logColor, category: 'special' });
                claimedCellsThisTurn.add(`${ship.position.x},${ship.position.y}`);
                return; // End turn after initiating cloak
            }
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
            const optimalRange = calculateOptimalEngagementRange(ship, target);

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
            
            processCommonTurn(ship, potentialTargets, gameState, actions, subsystemTarget, stance, reason, defenseActionTaken, claimedCellsThisTurn, allShipsInSector, priorityTargetId, optimalRange);
        } else {
             claimedCellsThisTurn.add(`${ship.position.x},${ship.position.y}`);
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