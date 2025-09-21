
import type { GameState, Ship } from '../../../types';
import { AIActions, FactionAI } from '../FactionAI';
import { processCommonTurn, tryCaptureDerelict } from './common';
import { findClosestTarget } from '../../utils/ai';

export class KlingonAI extends FactionAI {
    processTurn(ship: Ship, gameState: GameState, actions: AIActions): void {
        if (tryCaptureDerelict(ship, gameState, actions)) {
            return; // Turn spent capturing
        }
        processCommonTurn(ship, gameState.player.ship, gameState, actions);
    }

    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
        const allShips = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
        const enemyShips = allShips.filter(s => s.faction !== ship.faction);
        const target = findClosestTarget(ship, enemyShips);

        if (target) {
            actions.triggerDesperationAnimation({ source: ship, target, type: 'ram' });

            const shieldPercent = target.maxShields > 0 ? target.shields / target.maxShields : 0;
            const shieldDamageMultiplier = shieldPercent < 0.2 ? 1.0 : 0.8;
            const hullDamageMultiplier = shieldPercent < 0.2 ? 0.8 : 0.4;
            const shieldDamage = target.maxShields * shieldDamageMultiplier;
            const hullDamage = target.maxHull * hullDamageMultiplier;

            target.shields = Math.max(0, target.shields - shieldDamage);
            target.hull = Math.max(0, target.hull - hullDamage);

            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" makes a final glorious charge, ramming the "${target.name}"!\n--> Target takes ${Math.round(shieldDamage)} shield and ${Math.round(hullDamage)} hull damage!` });
            ship.hull = 0;
        } else {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `With no target to ram, the "${ship.name}" overloads its core in a final, defiant act!` });
            ship.hull = 0;
        }
    }
}
