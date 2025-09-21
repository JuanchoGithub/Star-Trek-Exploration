import type { GameState, Ship } from '../../../types';
import { AIActions, FactionAI } from '../FactionAI';
import { processCommonTurn, tryCaptureDerelict } from './common';

export class RomulanAI extends FactionAI {
    processTurn(ship: Ship, gameState: GameState, actions: AIActions): void {
        if (tryCaptureDerelict(ship, gameState, actions)) {
            return; // Turn spent capturing
        }
        processCommonTurn(ship, gameState.player.ship, gameState, actions.applyPhaserDamage, actions.addLog);
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
            
            // The ship is removed from the current sector's entities list.
            gameState.currentSector.entities = gameState.currentSector.entities.filter(e => e.id !== ship.id);
        }
    }
}