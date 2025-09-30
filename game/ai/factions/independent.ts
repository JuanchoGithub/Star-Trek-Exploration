
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
            return { turnEndingAction: false, defenseActionTaken: 'Activating point-defense grid.' };
        }
        return { turnEndingAction: false, defenseActionTaken: null };
    }

    executeMainTurnLogic(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[], defenseActionTaken: string | null): void {
        const { stance, reason } = this.determineStance(ship, potentialTargets);
        
        if (stance === 'Recovery') {
            processRecoveryTurn(ship, actions, gameState.turn);
            return;
        }

        const enemyTargets = potentialTargets.filter(t => t.allegiance === 'enemy');
        const primaryThreats = enemyTargets.length > 0 ? enemyTargets : potentialTargets;
        const target = findClosestTarget(ship, primaryThreats);

        if (!target) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position, broadcasting distress signals.`, isPlayerSource: false, color: 'border-gray-400' });
            return;
        }
        
        if (ship.energyAllocation.engines !== 100) {
            ship.energyAllocation = { weapons: 0, shields: 0, engines: 100 };
        }

        // Fleeing logic
        const originalPosition = { ...ship.position };
        const fleeTarget = {
            x: ship.position.x + (ship.position.x - target.position.x),
            y: ship.position.y + (ship.position.y - target.position.y),
        };

        let fleePosition = moveOneStep(ship.position, fleeTarget);
        
        // Bounds check
        fleePosition.x = Math.max(0, Math.min(SECTOR_WIDTH - 1, fleePosition.x));
        fleePosition.y = Math.max(0, Math.min(SECTOR_HEIGHT - 1, fleePosition.y));
        
        const allShipsInSector = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
        const isBlocked = allShipsInSector.some(s => s.id !== ship.id && s.position.x === fleePosition.x && s.position.y === fleePosition.y);
        const didMove = !isBlocked && (fleePosition.x !== originalPosition.x || fleePosition.y !== originalPosition.y);
        
        const moveAction = didMove ? 'MOVING' : 'HOLDING';
        let moveRationale: string;

        if (isBlocked) {
            moveRationale = 'Path blocked by another vessel.';
        } else if (!didMove) {
            moveRationale = 'Cannot move further away from threat.';
        } else {
            ship.position = fleePosition;
            moveRationale = 'Maximizing distance from threat.';
        }

        const shipsTargetingMe = allShipsInSector.filter(s => s.currentTargetId === ship.id);

        const logMessage = generateFleeLog({
            ship, stance, analysisReason: reason, target, shipsTargetingMe, moveAction, originalPosition, moveRationale, turn: gameState.turn, defenseAction: defenseActionTaken
        });
        
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: logMessage, isPlayerSource: false, color: 'border-yellow-400', category: 'stance' });
    }

    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
         actions.triggerDesperationAnimation({ source: ship, type: 'escape', outcome: 'success' });
         actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" makes an emergency jump to escape!`, isPlayerSource: false, color: 'border-yellow-400' });
         gameState.currentSector.entities = gameState.currentSector.entities.filter(e => e.id !== ship.id);
    }
}
