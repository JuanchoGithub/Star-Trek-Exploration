import type { GameState, Ship } from '../../types';
import { AIDirector } from '../ai/AIDirector';
import type { AIActions } from '../ai/FactionAI';
import '../ai/factions/index'; // This import ensures the registration script runs

export function processAITurns(
    gameState: GameState,
    actions: AIActions,
    actedShipIds: Set<string>
) {
    const allShips = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
    const aiShips = allShips.filter(s => s.id !== 'player');

    for (const ship of aiShips) {
        if (actedShipIds.has(ship.id)) continue;
        if (ship.hull <= 0 || ship.isDerelict || ship.captureInfo) continue;

        const factionAI = AIDirector.getAIForFaction(ship.faction);

        let potentialTargets: Ship[] = [];
        // Determine targets based on allegiance
        if (ship.allegiance === 'enemy') {
            potentialTargets = allShips.filter(s => (s.allegiance === 'player' || s.allegiance === 'ally') && s.hull > 0);
        } else if (ship.allegiance === 'ally') {
            potentialTargets = allShips.filter(s => s.allegiance === 'enemy' && s.hull > 0);
        }
        // Neutral ships currently don't act in combat.

        if (ship.hull / ship.maxHull <= 0.05) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `The ${ship.name}'s hull is critical! They're making a desperate move!`, color: 'border-orange-400', isPlayerSource: false });
            factionAI.processDesperationMove(ship, gameState, actions);
        } else {
            factionAI.processTurn(ship, gameState, actions, potentialTargets);
        }
    }
}
