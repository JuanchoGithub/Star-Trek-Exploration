import type { GameState, Ship } from '../../types';
import { AIDirector } from '../ai/AIDirector';
import type { AIActions } from '../ai/FactionAI';
import { canShipSeeEntity } from '../utils/visibility';
import '../ai/factions/index'; // This import ensures the registration script runs
import { findClosestTarget, calculateDistance } from '../utils/ai';
import { isCommBlackout } from '../utils/sector';
import { SECTOR_WIDTH } from '../../assets/configs/gameConstants';
import { generateSquadronTargetingLog, SquadronTargetingScore } from './aiLogger';


// --- NEW: Module-level state for Target Persistence ---
const persistenceBonuses = new Map<Required<Ship>['allegiance'], { targetId: string; bonus: number }>();
const PERSISTENCE_BONUS_INITIAL = 150;
const PERSISTENCE_BONUS_DECAY = 50;

/**
 * Determines the highest-priority target for a squadron of ships.
 * @param squadron The list of allied ships.
 * @param potentialTargets The list of visible enemy ships.
 * @param gameState The current game state.
 * @param persistenceBonus The current bonus for sticking to a target.
 * @returns An object containing the ID of the highest-priority target and the detailed scoring for all potential targets.
 */
function determineSquadronPriorityTarget(
    squadron: Ship[],
    potentialTargets: Ship[],
    gameState: GameState,
    persistenceBonus: { targetId: string; bonus: number } | undefined
): { priorityTargetId: string | null; scoringDetails: SquadronTargetingScore[] } {
    if (potentialTargets.length === 0 || squadron.length === 0) {
        return { priorityTargetId: null, scoringDetails: [] };
    }

    const targetScores: SquadronTargetingScore[] = potentialTargets.map(target => {
        const totalDistance = squadron.reduce((sum, s) => sum + calculateDistance(s.position, target.position), 0);
        const avgDistance = totalDistance > 0 ? totalDistance / squadron.length : 0;

        const components = {
            damage: (1 - (target.hull / target.maxHull)) * 200,
            vulnerability: target.shields <= 0 ? 150 : 0,
            threat: (target.maxHull * 0.5) + (target.id === 'player' ? 150 : 0),
            proximity: (1 - (avgDistance / SECTOR_WIDTH)) * 50,
            persistence: (persistenceBonus && target.id === persistenceBonus.targetId) ? persistenceBonus.bonus : 0,
        };
        const totalScore = Object.values(components).reduce((sum, val) => sum + val, 0);

        return {
            targetId: target.id,
            totalScore,
            components
        };
    });

    if (targetScores.length === 0) {
        return { priorityTargetId: null, scoringDetails: [] };
    }

    targetScores.sort((a, b) => b.totalScore - a.totalScore);
    
    return { priorityTargetId: targetScores[0].targetId, scoringDetails: targetScores };
}


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

    // Group ships by allegiance for squadron logic
    const allegianceGroups = new Map<Required<Ship>['allegiance'], Ship[]>();
    sortedAiShips.forEach(ship => {
        if (ship.allegiance) {
            const group = allegianceGroups.get(ship.allegiance) || [];
            group.push(ship);
            allegianceGroups.set(ship.allegiance, group);
        }
    });

    // --- NEW: Decay and manage persistence bonuses before making decisions ---
    for (const [allegiance, bonusInfo] of persistenceBonuses.entries()) {
        const targetExistsAndVisible = allShipsInSector.some(s => s.id === bonusInfo.targetId && s.hull > 0);
        if (!targetExistsAndVisible) {
            persistenceBonuses.delete(allegiance);
            continue;
        }
        
        const newBonus = bonusInfo.bonus - PERSISTENCE_BONUS_DECAY;
        if (newBonus <= 0) {
            persistenceBonuses.delete(allegiance);
        } else {
            persistenceBonuses.set(allegiance, { ...bonusInfo, bonus: newBonus });
        }
    }

    const loggedSquadronTargets = new Set<Required<Ship>['allegiance']>();

    // Determine squadron priority target for each allegiance group
    const priorityTargetsByAllegiance = new Map<Required<Ship>['allegiance'], string | null>();
    allegianceGroups.forEach((squadron, allegiance) => {
        if (allegiance === 'neutral' || squadron.length < 2) return; // No coordination for neutrals or solo ships

        let opponents: Ship[] = [];
        if (allegiance === 'enemy') {
            opponents = allShipsInSector.filter(s => (s.allegiance === 'player' || s.allegiance === 'ally') && s.hull > 0);
        } else if (allegiance === 'ally') {
            opponents = allShipsInSector.filter(s => s.allegiance === 'enemy' && s.hull > 0);
        }

        const communicableSquadron = squadron.filter(s => !isCommBlackout(s.position, gameState.currentSector));
        if (communicableSquadron.length < 1) return; // No one can communicate

        const visibleOpponents = opponents.filter(target => {
            if (target.cloakState === 'cloaked' || target.cloakState === 'cloaking') return false;
            return communicableSquadron.some(s => canShipSeeEntity(target, s, gameState.currentSector));
        });
        
        const currentBonus = persistenceBonuses.get(allegiance);
        const { priorityTargetId, scoringDetails } = determineSquadronPriorityTarget(communicableSquadron, visibleOpponents, gameState, currentBonus);
        
        // --- NEW: Update/Refresh persistence bonus after decision ---
        if (priorityTargetId) {
            if (currentBonus && priorityTargetId === currentBonus.targetId) {
                // If we stuck with the target, refresh the bonus
                persistenceBonuses.set(allegiance, { targetId: priorityTargetId, bonus: PERSISTENCE_BONUS_INITIAL });
            } else {
                // If we switched, or chose a new target, apply a fresh bonus
                persistenceBonuses.set(allegiance, { targetId: priorityTargetId, bonus: PERSISTENCE_BONUS_INITIAL });
            }

            if (!loggedSquadronTargets.has(allegiance)) {
                const logMessage = generateSquadronTargetingLog(
                    squadron,
                    allegiance,
                    visibleOpponents,
                    scoringDetails
                );
                actions.addLog({
                    sourceId: 'system',
                    sourceName: 'Tactical Analysis',
                    sourceFaction: squadron[0].faction,
                    message: logMessage,
                    isPlayerSource: false,
                    color: 'border-yellow-600',
                    category: 'targeting'
                });
                loggedSquadronTargets.add(allegiance);
            }
        } else {
            // If no target was chosen, clear any existing bonus
            persistenceBonuses.delete(allegiance);
        }

        priorityTargetsByAllegiance.set(allegiance, priorityTargetId);
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

        const allies = allShipsInSector.filter(s => s.id !== ship.id && s.allegiance === ship.allegiance && s.hull > 0);
        const isShipInBlackout = isCommBlackout(ship.position, gameState.currentSector);
        const communicableAllies = isShipInBlackout ? [] : allies.filter(ally => !isCommBlackout(ally.position, gameState.currentSector));

        const potentialTargets = allPossibleOpponents.filter(target => {
            if (target.cloakState === 'cloaked' || target.cloakState === 'cloaking') return false;

            // Check if viewer ship can see it
            if (canShipSeeEntity(target, ship, gameState.currentSector)) {
                return true;
            }

            // If not, check if any communicable allies can see it
            for (const ally of communicableAllies) {
                if (canShipSeeEntity(target, ally, gameState.currentSector)) {
                    return true;
                }
            }

            return false;
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

        const priorityTargetId = ship.allegiance ? priorityTargetsByAllegiance.get(ship.allegiance) || null : null;

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
                factionAI.processTurn(ship, gameState, actions, potentialTargets, claimedCellsThisTurn, allShipsInSector, priorityTargetId);
            }

        } else {
            factionAI.processTurn(ship, gameState, actions, potentialTargets, claimedCellsThisTurn, allShipsInSector, priorityTargetId);
        }
    }
}