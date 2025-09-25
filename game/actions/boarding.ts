import type { Ship, GameState } from '../../types';
import { uniqueId } from '../utils/ai';

export function initiateBoardingProcess(
    playerShip: Ship, 
    targetShip: Ship, 
    turn: number
): { success: boolean, logs: string[] } {
    const logs: string[] = [];

    if (playerShip.dilithium.current < 5) {
        logs.push('Cannot dispatch salvage team: 5 dilithium is required to power their equipment.');
        return { success: false, logs };
    }
    if (playerShip.securityTeams.current <= 0) {
        logs.push('No security teams available to dispatch.');
        return { success: false, logs };
    }

    // Deduct resources from player
    playerShip.dilithium.current -= 5;
    playerShip.securityTeams.current--;

    // Set capture info on the target, carrying the dilithium with the mission
    targetShip.captureInfo = {
        captorId: playerShip.id,
        repairTurn: turn,
        turnsToRepair: 4,
        dilithiumToTransfer: 5,
    };
    
    logs.push(`Boarding party dispatched to the derelict ${targetShip.name}. They will require 4 turns to restore minimal function. Consumed 5 dilithium and 1 security team.`);
    return { success: true, logs };
}


export function handleBoardingTurn(
    ship: Ship, 
    gameState: GameState,
): { logs: { message: string, color: string }[], isComplete: boolean } {
    const resultLogs: { message: string, color: string }[] = [];
    if (!ship.captureInfo || !ship.captureInfo.turnsToRepair) {
        return { logs: resultLogs, isComplete: false };
    }

    const turnsPassed = gameState.turn - ship.captureInfo.repairTurn;
    const turnsRemaining = ship.captureInfo.turnsToRepair - turnsPassed;

    if (turnsRemaining > 0) {
        resultLogs.push({ message: `Repair team on the ${ship.name} reports progress. ${turnsRemaining} turn(s) until operational.`, color: 'border-yellow-400'});
        return { logs: resultLogs, isComplete: false };
    }

    // Capture is complete
    const allShips = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
    const captor = allShips.find(s => s.id === ship.captureInfo!.captorId);
    
    ship.isDerelict = false;
    ship.lifeSupportFailureTurn = null;
    ship.isRestored = true;
    ship.allegiance = (captor?.id === 'player' || captor?.allegiance === 'ally') ? 'ally' : 'enemy';
    ship.faction = captor?.faction || 'Federation';
    ship.logColor = captor?.logColor || 'border-cyan-400';
    
    // Repair systems to 30%
    ship.hull = Math.max(ship.hull, ship.maxHull * 0.3);
    Object.keys(ship.subsystems).forEach(key => {
        const system = ship.subsystems[key as keyof typeof ship.subsystems];
        if (system && system.maxHealth > 0) {
            system.health = Math.max(system.health, system.maxHealth * 0.3);
        }
    });

    // THE FIX: Transfer the dilithium to the newly restored ship
    if (ship.captureInfo.dilithiumToTransfer) {
        ship.dilithium.current = Math.min(ship.dilithium.max, ship.dilithium.current + ship.captureInfo.dilithiumToTransfer);
    }
    
    resultLogs.push({ message: `Success! The ${ship.name} is now operational under our command, running on minimal power. Its dilithium reserves have been topped up by the salvage team.`, color: 'border-green-400' });
    ship.captureInfo = null; // Clear the capture info
    
    return { logs: resultLogs, isComplete: true };
}
