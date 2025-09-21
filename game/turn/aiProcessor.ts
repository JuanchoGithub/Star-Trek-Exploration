
import type { GameState, Ship } from '../../types';
import { AIDirector } from '../ai/AIDirector';
import type { AIActions } from '../ai/FactionAI';

export function processAITurns(
    gameState: GameState,
    actions: AIActions,
    actedShipIds: Set<string>
) {
    const aiShips = gameState.currentSector.entities.filter((e): e is Ship => e.type === 'ship' && e.id !== 'player');

    for (const ship of aiShips) {
        if (actedShipIds.has(ship.id)) continue;
        if (ship.hull <= 0 || ship.isDerelict || ship.captureInfo) continue;

        const factionAI = AIDirector.getAIForFaction(ship.faction);

        if (ship.hull / ship.maxHull <= 0.05) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `The ${ship.name}'s hull is critical! They're making a desperate move!`, color: 'border-orange-400' });
            factionAI.processDesperationMove(ship, gameState, actions);
        } else {
            factionAI.processTurn(ship, gameState, actions);
        }
    }
}
