
import type { GameState, PlayerTurnActions, Ship, LogEntry, TorpedoProjectile, ShipSubsystems, CombatEffect, Position } from '../../types';
import { AIActions, AIStance } from '../ai/FactionAI';
import { applyTorpedoDamage, applyPhaserDamage } from '../utils/combat';
import { calculateDistance, moveOneStep, uniqueId, findClosestTarget } from '../utils/ai';
import { AIDirector } from '../ai/AIDirector';
import { SECTOR_HEIGHT, SECTOR_WIDTH } from '../../assets/configs/gameConstants';
import { processPlayerTurn } from './player';
import { canShipSeeEntity } from '../utils/visibility';
import { isCommBlackout } from '../utils/sector';
import { handleBoardingTurn } from '../actions/boarding';
import { handleShipEndOfTurnSystems } from '../utils/energy';

export interface TurnStep {
    updatedState: GameState;
    newNavigationTarget?: { x: number; y: number } | null;
    newSelectedTargetId?: string | null;
    delay: number;
}

interface TurnConfig {
    mode: 'game' | 'dogfight' | 'spectate';
    playerTurnActions: PlayerTurnActions;
    navigationTarget: { x: number; y: number } | null;
    selectedTargetId: string | null;
}

const getShipsInTurnOrder = (state: GameState, mode: 'game' | 'dogfight' | 'spectate'): Ship[] => {
    const allShips = (mode === 'game')
        ? [state.player.ship, ...state.currentSector.entities.filter(e => e.type === 'ship')] as Ship[]
        : state.currentSector.entities.filter(e => e.type === 'ship') as Ship[];

    return [...allShips].sort((a, b) => {
        const allegianceOrder: Record<Required<Ship>['allegiance'], number> = { player: 0, ally: 1, neutral: 2, enemy: 3 };
        const aAllegiance = a.id === 'player' ? 'player' : a.allegiance;
        const bAllegiance = b.id === 'player' ? 'player' : b.allegiance;
        return allegianceOrder[aAllegiance!] - allegianceOrder[bAllegiance!];
    });
};

export const generatePhasedTurn = (
    initialState: GameState,
    config: TurnConfig,
): TurnStep[] => {
    const steps: TurnStep[] = [];
    let currentState: GameState = JSON.parse(JSON.stringify(initialState));
    let logQueue: Omit<LogEntry, 'id' | 'turn'>[] = [];
    
    let currentNavTarget = config.navigationTarget;
    let currentSelectedId = config.selectedTargetId;

    const addLog = (logData: Omit<LogEntry, 'id' | 'turn'>) => logQueue.push(logData);

    const addStep = (delay: number) => {
        if (steps.length === 0) {
            currentState.turn++;
        }
        
        logQueue.forEach(log => {
            currentState.logs.push({
                id: uniqueId(),
                turn: currentState.turn,
                ...log
            });
        });
        logQueue = [];

        steps.push({
            updatedState: JSON.parse(JSON.stringify(currentState)),
            delay: delay,
            newNavigationTarget: currentNavTarget,
            newSelectedTargetId: currentSelectedId,
        });
    };

    const actions: AIActions = {
        addLog: (log) => addLog({ ...log, isPlayerSource: false, color: log.color || 'border-gray-500' }),
        applyPhaserDamage,
        triggerDesperationAnimation: (animation) => {
            currentState.desperationMoveAnimations.push(animation);
        }
    };

    const shipsInOrder = getShipsInTurnOrder(currentState, config.mode);
    const allShipsInSector = () => (config.mode === 'game')
        ? [currentState.player.ship, ...currentState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[]
        : currentState.currentSector.entities.filter(e => e.type === 'ship') as Ship[];
    
    // --- PLAYER TURN ---
    if (config.mode === 'game') {
        const playerResult = processPlayerTurn(currentState, config.playerTurnActions, currentNavTarget, currentSelectedId, addLog);
        currentNavTarget = playerResult.newNavigationTarget;
        currentSelectedId = playerResult.newSelectedTargetId;
    }
    addStep(0); // Add step after player actions resolve

    // --- AI TURNS ---
    for (const ship of shipsInOrder) {
        if (ship.id === 'player') continue; // Player already acted

        let shipInState = allShipsInSector().find(s => s.id === ship.id);
        if (!shipInState || shipInState.hull <= 0 || shipInState.isDerelict || shipInState.captureInfo) continue;
        
        const factionAI = AIDirector.getAIForFaction(shipInState.faction);
        
        let allPossibleOpponents: Ship[] = [];
        if (shipInState.allegiance === 'enemy') {
            allPossibleOpponents = allShipsInSector().filter(s => (s.allegiance === 'player' || s.allegiance === 'ally') && s.hull > 0);
        } else if (shipInState.allegiance === 'player' || shipInState.allegiance === 'ally') {
            allPossibleOpponents = allShipsInSector().filter(s => s.allegiance === 'enemy' && s.hull > 0);
        } else if (shipInState.allegiance === 'neutral') {
            allPossibleOpponents = allShipsInSector().filter(s => (s.allegiance === 'enemy' || s.allegiance === 'player' || s.allegiance === 'ally') && s.hull > 0);
        }

        const alliesWithComms = allShipsInSector().filter(s => 
            s.allegiance === shipInState!.allegiance && 
            s.hull > 0 &&
            (s.id === shipInState!.id || !isCommBlackout(s.position, currentState.currentSector))
        );

        const potentialTargets = allPossibleOpponents.filter(target => {
            if (target.cloakState === 'cloaked' || target.cloakState === 'cloaking') return false;

            const isVisibleToAnyAlly = alliesWithComms.some(ally => 
                canShipSeeEntity(target, ally, currentState.currentSector)
            );

            return isVisibleToAnyAlly;
        });

        factionAI.processTurn(shipInState, currentState, actions, potentialTargets);
        addStep(0);
    }
    
    // --- POINT DEFENSE PHASE ---
    _handlePointDefense(currentState, allShipsInSector(), addLog);
    addStep(300);

    // --- PROJECTILE MOVEMENT PHASE ---
    _handleProjectileMovement(currentState, allShipsInSector(), addLog);
    addStep(750);

    // --- END OF TURN PHASE ---
    _handleEndOfTurn(currentState, allShipsInSector(), addLog);
    addStep(0);
    
    return steps;
};


// Helper Functions

function _handlePointDefense(state: GameState, allShips: Ship[], addLog: Function) {
    const shipsWithPD = allShips.filter(s => s.pointDefenseEnabled && s.subsystems.pointDefense.health > 0 && s.hull > 0);
    if (shipsWithPD.length === 0) return;

    let allTorpedoes = state.currentSector.entities.filter(e => e.type === 'torpedo_projectile') as TorpedoProjectile[];
    if (allTorpedoes.length === 0) return;
    
    const torpedoesDestroyedThisTurn = new Set<string>();

    for (const ship of shipsWithPD) {
        const hostileTorpedoes = allTorpedoes.filter(t => {
            if (torpedoesDestroyedThisTurn.has(t.id)) return false;
            const source = allShips.find(s => s.id === t.sourceId);
            const sourceAllegiance = source?.id === 'player' ? 'player' : source?.allegiance;
            const shipAllegiance = ship.id === 'player' ? 'player' : ship.allegiance;
            return sourceAllegiance !== shipAllegiance;
        });

        const nearbyTorpedoes = hostileTorpedoes.filter(t => calculateDistance(ship.position, t.position) <= 1);
        if (nearbyTorpedoes.length === 0) continue;

        nearbyTorpedoes.sort((a, b) => b.damage - a.damage); // Prioritize most dangerous
        const targetTorpedo = nearbyTorpedoes[0];
        
        const hitChance = ship.subsystems.pointDefense.health / ship.subsystems.pointDefense.maxHealth;
        const isPlayerSource = ship.id === 'player';

        state.combatEffects.push({ type: 'point_defense', sourceId: ship.id, targetPosition: targetTorpedo.position, faction: ship.faction, delay: 0 });
        
        let logMessage = `Point-defense grid fires at an incoming ${targetTorpedo.name}! (Hit Chance: ${Math.round(hitChance * 100)}%)...`;

        if (Math.random() < hitChance) {
            torpedoesDestroyedThisTurn.add(targetTorpedo.id);
            logMessage += " >> HIT! << Projectile destroyed.";
            addLog({ sourceId: ship.id, sourceName: ship.name, message: logMessage, isPlayerSource, color: 'border-green-400' });
        } else {
            logMessage += " >> MISS! <<";
            addLog({ sourceId: ship.id, sourceName: ship.name, message: logMessage, isPlayerSource, color: 'border-yellow-400' });
        }
    }
    
    if (torpedoesDestroyedThisTurn.size > 0) {
        state.currentSector.entities = state.currentSector.entities.filter(e => !torpedoesDestroyedThisTurn.has(e.id));
    }
}


function _handleProjectileMovement(state: GameState, allShips: Ship[], addLog: Function) {
    const torpedoes = state.currentSector.entities.filter(e => e.type === 'torpedo_projectile') as TorpedoProjectile[];
    if (torpedoes.length === 0) return;

    const entitiesToKeep = state.currentSector.entities.filter(e => e.type !== 'torpedo_projectile');
    const newTorpedoes: TorpedoProjectile[] = [];

    for (const torpedo of torpedoes) {
        const target = allShips.find(e => e.id === torpedo.targetId);

        if (!target || target.hull <= 0 || target.cloakState === 'cloaked' || target.cloakState === 'cloaking') {
            if (target && (target.cloakState === 'cloaked' || target.cloakState === 'cloaking')) {
                addLog({ 
                    sourceId: torpedo.sourceId, 
                    sourceName: torpedo.name, 
                    message: `The ${torpedo.name} loses its lock as the ${target.name} enters a cloaking field! The projectile continues into deep space.`, 
                    isPlayerSource: torpedo.sourceId === 'player', 
                    color: 'border-yellow-400'
                });
            }
            continue; // Skips the torpedo, effectively removing it.
        }

        let keepTorpedo = true;
        for (let i = 0; i < torpedo.speed; i++) {
            if (calculateDistance(torpedo.position, target.position) <= 0) {
                const sourceShip = allShips.find(s => s.id === torpedo.sourceId);
                const damageLogs = applyTorpedoDamage(target, torpedo, sourceShip?.position || null);
                damageLogs.forEach(message => addLog({ sourceId: torpedo.sourceId, sourceName: torpedo.name, message, isPlayerSource: torpedo.sourceId === 'player', color: 'border-orange-400'}));
                state.combatEffects.push({ type: 'torpedo_hit', position: target.position, delay: i * (750 / torpedo.speed), torpedoType: torpedo.torpedoType });
                keepTorpedo = false;
                break;
            }
            torpedo.position = moveOneStep(torpedo.position, target.position);
            torpedo.path.push({ ...torpedo.position });
        }
        if (keepTorpedo) {
            newTorpedoes.push(torpedo);
        }
    }
    state.currentSector.entities = [...entitiesToKeep, ...newTorpedoes];
}

function _handleEndOfTurn(state: GameState, allShips: Ship[], addLog: (log: Omit<LogEntry, 'id' | 'turn'>) => void) {
    allShips.forEach(ship => {
        if (ship.hull <= 0) return;

        // Boarding / Capture Logic must run before other system checks
        if (ship.captureInfo?.turnsToRepair) {
            const result = handleBoardingTurn(ship, state);
            if (result.logs.length > 0) {
                const captor = allShips.find(s => s.id === ship.captureInfo?.captorId);
                const isPlayerCapture = captor ? (captor.id === 'player' || captor.allegiance === 'ally') : (ship.captureInfo?.captorId === 'player');
                
                result.logs.forEach(logInfo => {
                     addLog({
                        sourceId: captor?.id || 'system',
                        sourceName: captor?.name || 'Salvage Team',
                        message: logInfo.message,
                        isPlayerSource: isPlayerCapture,
                        color: logInfo.color,
                    });
                });
            }
            // If the ship is still under repair, skip all other end-of-turn logic for it
            if (!result.isComplete) {
                return;
            }
        }

        // Handle all other end-of-turn system processes (repairs, energy, effects, etc.)
        const systemLogs = handleShipEndOfTurnSystems(ship, state);
        systemLogs.forEach(log => addLog(log));
    });
}
