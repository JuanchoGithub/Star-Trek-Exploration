import type { GameState, Ship } from '../../../types';
import { AIActions, FactionAI } from '../FactionAI';
import { processCommonTurn } from './common';
import { calculateDistance } from '../aiUtilities';

export class PirateAI extends FactionAI {
    processTurn(ship: Ship, gameState: GameState, actions: AIActions): void {
        processCommonTurn(ship, gameState.player.ship, gameState, actions.applyPhaserDamage, actions.addLog);
    }

    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
        const allShips = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
        const adjacentShips = allShips.filter(s => s.id !== ship.id && calculateDistance(ship.position, s.position) <= 1);
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
