

import type { GameState, Ship, ShipSubsystems, TorpedoProjectile } from '../../../types';
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { findClosestTarget, moveOneStep } from '../../utils/ai';
import { processRecoveryTurn } from './common';
import { SECTOR_WIDTH, SECTOR_HEIGHT } from '../../../assets/configs/gameConstants';
import { generateFleeLog } from '../aiLogger';

export class IndependentAI extends FactionAI {
    determineStance(ship: Ship, potentialTargets: Ship[]): { stance: AIStance, reason: string } {
        const enemyTargets = potentialTargets.filter(t => t.allegiance === 'enemy');
        const primaryThreats = enemyTargets.length > 0 ? enemyTargets : potentialTargets;
        
        const closestTarget = findClosestTarget(ship, primaryThreats);

        if (!closestTarget) {
            // If there's a memory of a threat, continue to be defensive
            if (ship.hiddenEnemies && ship.hiddenEnemies.length > 0) {
                return { stance: 'Defensive', reason: 'Threat no longer visible, but maintaining evasive posture based on last known contact.' };
            }
            return { stance: 'Recovery', reason: `No threats nearby. Resuming normal operations.` };
        }
        return { stance: 'Defensive', reason: `Threat detected (${closestTarget.name}). Attempting to flee.` };
    }

    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        return 'engines'; // Target engines to aid escape
    }

    handleTorpedoThreat(ship: Ship, gameState: GameState, actions: AIActions, incomingTorpedoes: TorpedoProjectile[]): { turnEndingAction: boolean, defenseActionTaken: string | null } {
        if (ship.subsystems.pointDefense.health > 0 && !ship.pointDefenseEnabled) {
            ship.pointDefenseEnabled = true;
            actions.addLog({ 
                sourceId: ship.id, 
                sourceName: ship.name, 
                sourceFaction: ship.faction,
                message: `Detects incoming torpedoes while attempting to flee! Activating point-defense!`,
                isPlayerSource: false,
                color: ship.logColor,
                category: 'system'
            });
            return { turnEndingAction: false, defenseActionTaken: 'Activating point-defense.' };
        }
        return { turnEndingAction: false, defenseActionTaken: null };
    }

    executeMainTurnLogic(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[], defenseActionTaken: string | null, claimedCellsThisTurn: Set<string>, allShipsInSector: Ship[]): void {
        const { stance, reason } = this.determineStance(ship, potentialTargets);
        
        if (stance === 'Recovery') {
            ship.hiddenEnemies = []; // Clear threat memory when recovering
            // FIX: Added the missing 'claimedCellsThisTurn' argument.
            processRecoveryTurn(ship, actions, gameState.turn, claimedCellsThisTurn);
            return;
        }

        const enemyTargets = potentialTargets.filter(t => t.allegiance === 'enemy');
        const primaryThreats = enemyTargets.length > 0 ? enemyTargets : potentialTargets;
        let target = findClosestTarget(ship, primaryThreats);
        let threatPosition = target?.position;

        // If no visible target, but we remember a hidden one, flee from its last known position
        if (!target && ship.hiddenEnemies && ship.hiddenEnemies.length > 0) {
            // Find the closest last known position to flee from
            let closestHiddenDist = Infinity;
            for (const hidden of ship.hiddenEnemies) {
                const dist = Math.hypot(ship.position.x - hidden.lastKnownPosition.x, ship.position.y - hidden.lastKnownPosition.y);
                if (dist < closestHiddenDist) {
                    closestHiddenDist = dist;
                    threatPosition = hidden.lastKnownPosition;
                }
            }
        }

        if (!threatPosition) {
            claimedCellsThisTurn.add(`${ship.position.x},${ship.position.y}`);
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `Holding position, broadcasting distress signals.`, isPlayerSource: false, color: 'border-gray-400' });
            return;
        }
        
        if (ship.energyAllocation.engines !== 100) {
            ship.energyAllocation = { weapons: 0, shields: 0, engines: 100 };
        }

        // Fleeing logic
        const originalPosition = { ...ship.position };
        const fleeTarget = {
            x: ship.position.x + (ship.position.x - threatPosition.x),
            y: ship.position.y + (ship.position.y - threatPosition.y),
        };

        let fleePosition = moveOneStep(ship.position, fleeTarget);
        
        // Bounds check
        fleePosition.x = Math.max(0, Math.min(SECTOR_WIDTH - 1, fleePosition.x));
        fleePosition.y = Math.max(0, Math.min(SECTOR_HEIGHT - 1, fleePosition.y));
        
        const posKey = `${fleePosition.x},${fleePosition.y}`;
        const isBlocked = claimedCellsThisTurn.has(posKey);
        
        let didMove = false;
        let moveRationale: string;

        if (isBlocked) {
            moveRationale = 'Path blocked by another vessel.';
        } else {
            ship.position = fleePosition;
            didMove = (fleePosition.x !== originalPosition.x || fleePosition.y !== originalPosition.y);
            moveRationale = 'Maximizing distance from threat.';
        }

        claimedCellsThisTurn.add(`${ship.position.x},${ship.position.y}`);

        const moveAction = didMove ? 'MOVING' : 'HOLDING';
        const shipsTargetingMe = allShipsInSector.filter(s => s.currentTargetId === ship.id);

        const logMessage = generateFleeLog({
            ship, stance, analysisReason: reason, target, shipsTargetingMe, moveAction, originalPosition, moveRationale, turn: gameState.turn, defenseAction: defenseActionTaken
        });
        
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: logMessage, isPlayerSource: false, color: 'border-yellow-400', category: 'stance' });
    }

    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
         actions.triggerDesperationAnimation({ source: ship, type: 'escape', outcome: 'success' });
         actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `"${ship.name}" makes an emergency jump to escape!`, isPlayerSource: false, color: 'border-yellow-400' });
         gameState.currentSector.entities = gameState.currentSector.entities.filter(e => e.id !== ship.id);
    }
}