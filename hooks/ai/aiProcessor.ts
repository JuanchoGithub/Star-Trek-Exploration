
import type { GameState, Ship } from '../../types';
import { AIDirector } from './AIDirector';
import type { AIActions } from './FactionAI';
// FIX: Changed import to be more explicit to avoid potential file casing issues.
import './factionAI/index'; // This import ensures the registration script runs

export function processAITurns(
    gameState: GameState,
    actions: AIActions
) {
    const aiShips = gameState.currentSector.entities.filter((e): e is Ship => e.type === 'ship' && e.id !== 'player');

    for (const ship of aiShips) {
        if (ship.hull <= 0) continue;

        const factionAI = AIDirector.getAIForFaction(ship.faction);

        if (ship.hull / ship.maxHull <= 0.05) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `The ${ship.name}'s hull is critical! They're making a desperate move!`, color: 'border-orange-400' });
            factionAI.processDesperationMove(ship, gameState, actions);
            // The turn manager will clean up the destroyed ship later.
            // If the ship escaped, it will be removed from the entities list.
        } else {
            factionAI.processTurn(ship, gameState, actions);
        }
    }
}
