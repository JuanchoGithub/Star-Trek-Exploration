
import type { GameState, Ship } from '../../types';
import { AIDirector } from '../ai/AIDirector';
import type { AIActions } from '../ai/FactionAI';
import '../ai/factions/index'; // This import ensures the registration script runs

export function processAITurns(
    gameState: GameState,
    actions: AIActions,
    actedShipIds: Set<string>,
    allShipsInSector: Ship[],
    mode: 'game' | 'dogfight' | 'spectate'
) {
    const aiShips = (mode === 'spectate')
        ? allShipsInSector
        : (mode === 'game')
            ? allShipsInSector.filter(s => s.id !== 'player')
            : allShipsInSector.filter(s => s.allegiance !== 'player'); // dogfight

    for (const ship of aiShips) {
        if (actedShipIds.has(ship.id)) continue;
        if (ship.hull <= 0 || ship.isDerelict || ship.captureInfo) continue;

        const factionAI = AIDirector.getAIForFaction(ship.faction);

        let potentialTargets: Ship[] = [];
        // Determine targets based on allegiance
        if (ship.allegiance === 'enemy') {
            // Enemies target players and allies
            potentialTargets = allShipsInSector.filter(s => (s.allegiance === 'player' || s.allegiance === 'ally') && s.hull > 0);
        } else if (ship.allegiance === 'player' || ship.allegiance === 'ally') {
            // Players and allies target enemies
            potentialTargets = allShipsInSector.filter(s => s.allegiance === 'enemy' && s.hull > 0);
        } else if (ship.allegiance === 'neutral') {
            // Neutrals see everyone as a potential threat to flee from, but do not engage.
            potentialTargets = allShipsInSector.filter(s => (s.allegiance === 'enemy' || s.allegiance === 'player' || s.allegiance === 'ally') && s.hull > 0);
        }

        if (ship.hull / ship.maxHull <= 0.05) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `The ${ship.name}'s hull is critical! They're making a desperate move!`, color: 'border-orange-400', isPlayerSource: false });
            factionAI.processDesperationMove(ship, gameState, actions);
        } else {
            factionAI.processTurn(ship, gameState, actions, potentialTargets);
        }
    }
}
