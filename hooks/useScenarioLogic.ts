import { useState, useCallback, useEffect, useMemo } from 'react';
import type { GameState, Ship, LogEntry, ScenarioMode, PlayerTurnActions, Position, Entity, ShipSubsystems, TorpedoProjectile, SectorState } from '../types';
import { shipClasses } from '../assets/ships/configs/shipClassStats';
import { uniqueId } from '../game/utils/ai';
import { generatePhasedTurn, TurnStep } from '../game/turn/turnManager';
import { torpedoStats } from '../assets/projectiles/configs/torpedoTypes';

export const useScenarioLogic = (initialShips: Ship[], initialSector: SectorState | null, scenarioMode: ScenarioMode) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [isRunning, setIsRunning] = useState(scenarioMode !== 'spectate');
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
    const [navigationTarget, setNavigationTarget] = useState<Position | null>(null);
    const [playerTurnActions, setPlayerTurnActions] = useState<PlayerTurnActions>({});
    const [isTurnResolving, setIsTurnResolving] = useState(false);
    
    // New state for history management
    const [replayHistory, setReplayHistory] = useState<GameState[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);

    useEffect(() => {
        if (scenarioMode === 'setup' || !initialSector || gameState) return;

        const newSector: SectorState = JSON.parse(JSON.stringify(initialSector));
        const playerShip = initialShips.find(s => s.allegiance === 'player');
        
        const simShips = initialShips.map(s => {
            const ship = JSON.parse(JSON.stringify(s));
            ship.energy.current = ship.energy.max;
            if (ship.allegiance === 'enemy' || ship.allegiance === 'ally' || (playerShip && ship.allegiance === 'player')) {
                ship.shields = ship.maxShields;
            }
            return ship;
        });

        newSector.entities.push(...simShips);
        
        const initialState: GameState = {
            player: {
                ship: playerShip || ({} as Ship),
                position: { qx: 0, qy: 0 },
                crew: [],
            },
            quadrantMap: [[newSector]],
            currentSector: newSector,
            turn: 1,
            logs: [{ id: uniqueId(), turn: 1, sourceId: 'system', sourceName: 'Simulator', message: 'Scenario initialized.', color: 'border-gray-500', isPlayerSource: false }],
            gameOver: false,
            gameWon: false,
            redAlert: true,
            combatEffects: [],
            isRetreatingWarp: false,
            usedAwayMissionSeeds: [],
            desperationMoveAnimations: [],
            orbitingPlanetId: null,
            isDocked: false,
            replayHistory: [],
            usedAwayMissionTemplateIds: [],
        };
        setGameState(initialState);
        setReplayHistory([initialState]);
        setHistoryIndex(0);
    }, [scenarioMode, initialShips, initialSector, gameState]);

    useEffect(() => {
        if (gameState && gameState.combatEffects.length > 0) {
            const maxDelay = Math.max(0, ...gameState.combatEffects.map(e => e.delay));
            const totalAnimationTime = maxDelay + 500;
            const timer = setTimeout(() => {
                setGameState(prev => prev ? { ...prev, combatEffects: [] } : null);
            }, totalAnimationTime);
            return () => clearTimeout(timer);
        }
    }, [gameState]);

    const addLog = useCallback((logData: Omit<LogEntry, 'id' | 'turn'>) => {
        setGameState(prev => {
            if (!prev) return null;
            const newLog: LogEntry = {
                id: `log_${Date.now()}_${Math.random()}`,
                turn: prev.turn,
                ...logData
            };
            const nextLogs = [...prev.logs, newLog];
            if (nextLogs.length > 200) {
                return { ...prev, logs: nextLogs.slice(nextLogs.length - 200) };
            }
            return { ...prev, logs: nextLogs };
        });
    }, []);

    const onEndTurn = useCallback(async () => {
        if (isTurnResolving || !gameState) return;
        setIsTurnResolving(true);
        
        const currentHistory = replayHistory.slice(0, historyIndex + 1);
        const stateForTurn = currentHistory[currentHistory.length - 1];

        const turnSteps: TurnStep[] = generatePhasedTurn(stateForTurn, {
            mode: scenarioMode as 'spectate' | 'dogfight',
            playerTurnActions,
            navigationTarget,
            selectedTargetId
        });

        let tempState = gameState;
        for (const step of turnSteps) {
            tempState = step.updatedState;
            setGameState(tempState);
            if (step.newNavigationTarget !== undefined) setNavigationTarget(step.newNavigationTarget);
            if (step.newSelectedTargetId !== undefined) setSelectedTargetId(step.newSelectedTargetId);
            if (scenarioMode === 'spectate') await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        const finalState = tempState;
        const newHistory = [...currentHistory, finalState];
        if (newHistory.length > 101) newHistory.shift();

        setReplayHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);

        setPlayerTurnActions({});
        setIsTurnResolving(false);
    }, [isTurnResolving, gameState, playerTurnActions, navigationTarget, selectedTargetId, scenarioMode, replayHistory, historyIndex]);
    
    const onSelectTarget = useCallback((id: string | null) => setSelectedTargetId(id), []);
    const onSetNavigationTarget = useCallback((pos: Position | null) => setNavigationTarget(pos), []);
    
    const onFirePhasers = useCallback((targetId: string) => {
        if (isTurnResolving || playerTurnActions.phaserTargetId) return;
        setPlayerTurnActions(prev => ({ ...prev, phaserTargetId: targetId }));
        const playerShip = gameState?.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;
        const target = gameState?.currentSector.entities.find(e => e.id === targetId);
        if (playerShip && target) {
            addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: `Targeting ${target.name} with phasers.`, isPlayerSource: true, color: 'border-blue-400' });
        }
    }, [isTurnResolving, playerTurnActions, gameState, addLog]);

    const onLaunchTorpedo = useCallback((targetId: string) => {
        if (isTurnResolving || playerTurnActions.torpedoTargetId) return;
    
        const playerShip = gameState?.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;
        if (!playerShip) return;

        const shipStats = shipClasses[playerShip.shipModel][playerShip.shipClass];
        if (shipStats.torpedoType === 'None') return;
    
        const torpedoData = torpedoStats[shipStats.torpedoType];
    
        if (playerShip.torpedoes.current <= 0) {
            addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: `Cannot launch ${torpedoData.name}: All tubes are empty.`, isPlayerSource: true, color: 'border-blue-400' });
            return;
        }
    
        const target = gameState?.currentSector.entities.find(e => e.id === targetId);
        if (!target || target.type !== 'ship') {
            addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: `Cannot launch torpedo: Invalid target.`, isPlayerSource: true, color: 'border-blue-400' });
            return;
        }

        setPlayerTurnActions(prev => ({ ...prev, torpedoTargetId: targetId }));
        addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: `Acquiring torpedo lock on ${target.name}.`, isPlayerSource: true, color: 'border-blue-400' });
    }, [isTurnResolving, playerTurnActions, gameState, addLog]);

    const onSelectSubsystem = (subsystem: keyof ShipSubsystems | null) => {};
    
    const onEnergyChange = useCallback((changedKey: 'weapons' | 'shields' | 'engines', value: number) => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const playerShip = next.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;
            if (!playerShip) return prev;
            
            const oldAlloc = playerShip.energyAllocation;
            if (oldAlloc[changedKey] === value) return prev;
            
            const newAlloc = { ...oldAlloc }; const oldValue = oldAlloc[changedKey];
            const clampedNewValue = Math.max(0, Math.min(100, value));
            const [key1, key2] = (['weapons', 'shields', 'engines'] as const).filter(k => k !== changedKey);
            const val1 = oldAlloc[key1]; const val2 = oldAlloc[key2];
            const totalOtherVal = val1 + val2;
            const intendedDiff = clampedNewValue - oldValue;
            let actualDiff = intendedDiff;
            if (intendedDiff > 0) actualDiff = Math.min(intendedDiff, totalOtherVal);
            const finalNewValue = oldValue + actualDiff; newAlloc[changedKey] = finalNewValue;
            const toDistribute = -actualDiff;
            if (totalOtherVal > 0) {
                newAlloc[key1] = val1 + Math.round(toDistribute * (val1 / totalOtherVal));
                newAlloc[key2] = val2 + Math.round(toDistribute * (val2 / totalOtherVal));
            } else {
                newAlloc[key1] = val1 + Math.floor(toDistribute / 2); newAlloc[key2] = val2 + Math.ceil(toDistribute / 2);
            }
            const sum = newAlloc.weapons + newAlloc.shields + newAlloc.engines;
            if (sum !== 100) newAlloc[changedKey] += (100 - sum);
            
            playerShip.energyAllocation = newAlloc;
            return next;
        });
    }, [gameState]);


    const onToggleCloak = useCallback(() => {
        if (!gameState) return;
        setGameState(prev => {
             if (!prev) return null;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const playerShip = next.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;
            if (!playerShip) return prev;
            
            if (playerShip.cloakState === 'cloaked') {
                playerShip.cloakState = 'visible';
                playerShip.cloakCooldown = 2; 
                addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: "Cloaking device disengaged.", isPlayerSource: true, color: 'border-blue-400' });
            } else if (playerShip.cloakState === 'visible') {
                if (playerShip.cloakCooldown > 0) return prev;
                playerShip.cloakState = 'cloaking';
                addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: `Initiating cloaking sequence.`, isPlayerSource: true, color: 'border-blue-400' });
            }
            return next;
        });
    }, [gameState, addLog]);

    const onTogglePointDefense = useCallback(() => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const playerShip = next.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;
            if (!playerShip) return prev;

            playerShip.pointDefenseEnabled = !playerShip.pointDefenseEnabled;
            addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: `Point-defense system ${playerShip.pointDefenseEnabled ? 'activated' : 'deactivated'}.`, isPlayerSource: true, color: 'border-blue-400' });

            return next;
        });
    }, [gameState, addLog]);

    const onEvasiveManeuvers = useCallback(() => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const playerShip = next.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;

            if (!playerShip || !next.redAlert || playerShip.subsystems.engines.health <= 0) {
                return prev;
            }

            playerShip.evasive = !playerShip.evasive;
            addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: `Evasive maneuvers ${playerShip.evasive ? 'engaged' : 'disengaged'}.`, isPlayerSource: true, color: 'border-blue-400' });
            return next;
        });
    }, [gameState, addLog]);

    const onSelectRepairTarget = useCallback((subsystem: 'hull' | keyof ShipSubsystems | null) => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const playerShip = next.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;
            if (!playerShip) return prev;

            if (playerShip.repairTarget === subsystem) {
                playerShip.repairTarget = null;
                addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: `Damage control team standing by.`, isPlayerSource: true, color: 'border-blue-400' });
            } else {
                playerShip.repairTarget = subsystem;
                addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: `Damage control team assigned to repair ${subsystem}.`, isPlayerSource: true, color: 'border-blue-400' });
            }
            return next;
        });
    }, [gameState, addLog]);

    const onToggleRedAlert = useCallback(() => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const playerShip = next.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;
            if (!playerShip) return prev;
            
            next.redAlert = !next.redAlert;
            if (next.redAlert) {
                playerShip.shields = playerShip.maxShields;
                addLog({ sourceId: 'system', sourceName: 'Simulator', message: 'Red Alert! Shields up!', isPlayerSource: false, color: 'border-red-600' });
            } else {
                playerShip.shields = 0;
                playerShip.evasive = false;
                addLog({ sourceId: 'system', sourceName: 'Simulator', message: 'Standing down from Red Alert. Shields offline.', isPlayerSource: false, color: 'border-gray-500' });
            }
            return next;
        });
    }, [gameState, addLog]);

    const goToHistoryTurn = useCallback((index: number) => {
        if (index >= 0 && index < replayHistory.length) {
            setHistoryIndex(index);
            setGameState(replayHistory[index]);
        }
    }, [replayHistory]);

    const resumeFromHistory = useCallback(() => {
        if (historyIndex < replayHistory.length - 1) {
            const newHistory = replayHistory.slice(0, historyIndex + 1);
            setReplayHistory(newHistory);
        }
    }, [replayHistory, historyIndex]);

    return {
        gameState,
        isRunning,
        togglePause: () => setIsRunning(prev => !prev),
        endSimulation: () => setGameState(null),
        setGameState,
        onEndTurn,
        selectedTargetId, onSelectTarget,
        navigationTarget, onSetNavigationTarget,
        playerTurnActions,
        isTurnResolving,
        desperationMoveAnimation: gameState?.desperationMoveAnimations[0] || null,
        targetEntity: gameState?.currentSector.entities.find(e => e.id === selectedTargetId),
        onFirePhasers, onLaunchTorpedo,
        onSelectSubsystem, onEnergyChange, onToggleCloak, onTogglePointDefense,
        onEvasiveManeuvers, onSelectRepairTarget, onToggleRedAlert,
        replayHistory,
        historyIndex,
        goToHistoryTurn,
        resumeFromHistory,
    };
};