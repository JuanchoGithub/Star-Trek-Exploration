
import type { GameState, Ship } from '../../types';
import { AIDirector } from '../ai/AIDirector';
import type { AIActions } from '../ai/FactionAI';
import { canShipSeeEntity } from '../utils/visibility';
import '../ai/factions/index'; // This import ensures the registration script runs
import { findClosestTarget, calculateDistance } from '../utils/ai';

export function processAITurns(
    gameState: GameState,
    initialState: GameState, // Pass the state before any mutations this turn
    actions: AIActions,
    actedShipIds: Set<string>,
    allShipsInSector: Ship[],
    mode: 'game' | 'dogfight' | 'spectate',
    claimedCellsThisTurn: Set<string>
) {
    const aiShips = (mode === 'spectate')
        ? allShipsInSector
        : (mode === 'game')
            ? allShipsInSector.filter(s => s.id !== 'player')
            : allShipsInSector.filter(s => s.allegiance !== 'player'); // dogfight

    const allegianceOrder: Record<Required<Ship>['allegiance'], number> = { player: 0, ally: 1, neutral: 2, enemy: 3 };
    const sortedAiShips = aiShips.sort((a, b) => {
        const aAllegiance = a.allegiance || 'neutral';
        const bAllegiance = b.allegiance || 'neutral';
        return allegianceOrder[aAllegiance] - allegianceOrder[bAllegiance];
    });

    for (const ship of sortedAiShips) {
        if (actedShipIds.has(ship.id)) continue;
        if (ship.hull <= 0 || ship.isDerelict || ship.captureInfo) {
            // If a ship is destroyed or captured, it cannot move, so its position is now claimed.
            claimedCellsThisTurn.add(`${ship.position.x},${ship.position.y}`);
            continue;
        }


        const factionAI = AIDirector.getAIForFaction(ship.faction);

        let allPossibleOpponents: Ship[] = [];
        // Determine targets based on allegiance
        if (ship.allegiance === 'enemy') {
            // Enemies target players and allies
            allPossibleOpponents = allShipsInSector.filter(s => (s.allegiance === 'player' || s.allegiance === 'ally') && s.hull > 0);
        } else if (ship.allegiance === 'player' || ship.allegiance === 'ally') {
            // Players and allies target enemies
            allPossibleOpponents = allShipsInSector.filter(s => s.allegiance === 'enemy' && s.hull > 0);
        } else if (ship.allegiance === 'neutral') {
            // Neutrals see everyone as a potential threat to flee from, but do not engage.
            allPossibleOpponents = allShipsInSector.filter(s => (s.allegiance === 'enemy' || s.allegiance === 'player' || s.allegiance === 'ally') && s.hull > 0);
        }
        
        const shipInInitialState = (initialState.currentSector.entities.find(e => e.id === ship.id) || initialState.player.ship) as Ship;
        const previousTargetId = shipInInitialState?.currentTargetId;

        const potentialTargets = allPossibleOpponents.filter(target => {
            if (target.cloakState === 'cloaked' || target.cloakState === 'cloaking') return false;
            return canShipSeeEntity(target, ship, gameState.currentSector);
        });

        // Check if the previous target is now hidden
        if (previousTargetId) {
            const isTargetNowHidden = !potentialTargets.some(t => t.id === previousTargetId);
            if (isTargetNowHidden) {
                const hiddenEnemy = allShipsInSector.find(s => s.id === previousTargetId);
                if (hiddenEnemy) {
                    if (!ship.hiddenEnemies) ship.hiddenEnemies = [];
                    // Avoid adding duplicates
                    if (!ship.hiddenEnemies.some(he => he.shipId === hiddenEnemy.id)) {
                        ship.hiddenEnemies.push({ shipId: hiddenEnemy.id, lastKnownPosition: { ...hiddenEnemy.position } });
                        actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `Lost sensor lock on ${hiddenEnemy.name}. Logging last known coordinates.`, isPlayerSource: false, color: ship.logColor, category: 'info' });
                    }
                }
            }
        }


        const isDistressed = ship.hull / ship.maxHull < 0.3; // Distress at < 30% hull
        const closestEnemy = findClosestTarget(ship, potentialTargets);
        const isEnemyClose = closestEnemy && calculateDistance(ship.position, closestEnemy.position) <= 3;

        if (isDistressed && isEnemyClose) {
            actions.addLog({
                sourceId: ship.id,
                sourceName: ship.name,
                message: `The ${ship.name} is heavily damaged and cornered! The captain is considering a desperate maneuver!`,
                color: 'border-orange-400',
                isPlayerSource: false
            });

            const hullPercentage = ship.hull / ship.maxHull;
            // Chance increases linearly from 0% at 30% hull to 100% at 0% hull.
            const desperationChance = (0.3 - hullPercentage) / 0.3;

            if (Math.random() < desperationChance) {
                 actions.addLog({
                    sourceId: ship.id,
                    sourceName: ship.name,
                    message: `With no other options, the ${ship.name} commits to its final action!`,
                    color: 'border-red-600',
                    isPlayerSource: false
                });
                factionAI.processDesperationMove(ship, gameState, actions);
            } else {
                factionAI.processTurn(ship, gameState, actions, potentialTargets, claimedCellsThisTurn, allShipsInSector);
            }

        } else {
            factionAI.processTurn(ship, gameState, actions, potentialTargets, claimedCellsThisTurn, allShipsInSector);
        }
    }
}
