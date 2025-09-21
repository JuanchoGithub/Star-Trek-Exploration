
import type { GameState, Ship } from '../../../types';
// FIX: Added AIStance to import
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { processCommonTurn, tryCaptureDerelict } from './common';
import { calculateDistance } from '../../utils/ai';

export class PirateAI extends FactionAI {
    // FIX: Implemented missing abstract member 'determineStance'.
    determineStance(ship: Ship, playerShip: Ship): AIStance {
        // Pirates are opportunistic cowards.
        const shipHealth = ship.hull / ship.maxHull;
        const playerHealth = playerShip.hull / playerShip.maxHull;

        if (shipHealth < 0.6) {
            return 'Defensive'; // Prioritize self-preservation above all.
        }
        if (playerHealth < 0.4) {
            return 'Aggressive'; // Press the advantage against a weakened foe.
        }
        return 'Balanced';
    }

    processTurn(ship: Ship, gameState: GameState, actions: AIActions): void {
        if (tryCaptureDerelict(ship, gameState, actions)) {
            return; // Turn spent capturing
        }

        // FIX: Implemented stance-based energy allocation.
        const stance = this.determineStance(ship, gameState.player.ship);
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
        
        // FIX: Added missing `gameState.player.ship` argument to the function call.
        processCommonTurn(ship, gameState.player.ship, gameState, actions);
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
