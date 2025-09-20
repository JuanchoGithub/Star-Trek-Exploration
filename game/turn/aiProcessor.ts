import type { GameState, Ship } from '../../types';
import { AIDirector } from '../ai/AIDirector';
import { executeDesperationMove } from '../ai/desperationMoves';
import { AIActions } from '../ai/FactionAI';

export function processAITurns(
    gameState: GameState,
    actions: AIActions
) {
    const aiShips = gameState.currentSector.entities.filter((e): e is Ship => e.type === 'ship' && e.id !== 'player');

    aiShips.forEach(ship => {
        if (ship.hull <= 0) return;

        const factionAI = AIDirector.getAIForFaction(ship.faction);

        // Check for desperation state at the start of the turn.
        if (ship.hull / ship.maxHull <= 0.05) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `The ${ship.name}'s hull is critical! They're making a desperate move!`, color: 'border-orange-400' });
            
            ship.desperationMove = factionAI.getDesperationMove(ship, gameState);
            
            if (ship.desperationMove) {
                executeDesperationMove(ship, gameState, actions.addLog);
            }
            return; // The desperation move is the ship's entire turn.
        }

        factionAI.processTurn(ship, gameState, actions);
    });
}
