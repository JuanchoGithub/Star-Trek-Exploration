import type { GameState, Ship } from '../../../types';
import { AIActions, FactionAI } from '../FactionAI';
import { processCommonTurn } from './common';

export class RomulanAI extends FactionAI {
    processTurn(ship: Ship, gameState: GameState, actions: AIActions): void {
        processCommonTurn(ship, gameState.player.ship, gameState, actions.applyPhaserDamage, actions.addLog);
    }

    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
        if (Math.random() < 0.7) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" attempts an unstable warp jump to escape... but the core breaches! The ship is destroyed!` });
            ship.hull = 0;
        } else {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" attempts an unstable warp jump... and vanishes! They've escaped!` });
            // Directly mutating the entities list during iteration is handled by the processor loop.
            // By filtering here, we ensure the ship is gone for subsequent AI turns within the same game turn.
            gameState.currentSector.entities = gameState.currentSector.entities.filter(e => e.id !== ship.id);
        }
    }
}
