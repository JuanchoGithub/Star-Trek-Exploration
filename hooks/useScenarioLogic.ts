import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { GameState, Ship, LogEntry, ScenarioMode, PlayerTurnActions, Position, Entity, ShipSubsystems, TorpedoProjectile, SectorState, ProjectileWeapon } from '../types';
import { shipClasses } from '../assets/ships/configs/shipClassStats';
import { uniqueId } from '../game/utils/ai';
import { generatePhasedTurn, TurnStep } from '../game/turn/turnManager';
import { torpedoStats } from '../assets/projectiles/configs/torpedoTypes';
import { canTargetEntity } from '../game/utils/combat';
// FIX: Import AI factions to register them with the AIDirector for use in the simulator.
import '../game/ai/factions'; // This import ensures the registration script runs

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
        if (scenarioMode === 'setup' || !initialSector) return;

        const newSector: SectorState = JSON.parse(JSON.stringify(initialSector));
        
        // Create deep copies of ships and reset their state for the simulation
        const simShips = initialShips.map(s => {
            const ship = JSON.parse(JSON.stringify(s));
            ship.energy.current = ship.energy.max;
            // Always give shields at start of sim if combatant
            if (ship.allegiance === 'enemy' || ship.allegiance === 'ally' || ship.allegiance === 'player') {
                ship.shields = ship.maxShields;
            }
            return ship;
        });

        // FIX: The player ship should only exist in `player.ship` to have a single source of truth.
        // It should be removed from the entities list to prevent a duplicate, stale object from being used by the AI and renderer.
        const playerShipForState = simShips.find(s => s.allegiance === 'player');
        const nonPlayerShips = simShips.filter(s => s.allegiance !== 'player');
        
        newSector.entities = initialSector.entities.filter(e => e.type !== 'ship').concat(nonPlayerShips);
        
        const initialState: GameState = {
            player: {
                ship: playerShipForState || ({} as Ship),
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
    }, [scenarioMode, initialShips, initialSector]); // FIX: Removed gameState from dependency array to prevent re-initialization loops.

    useEffect(() => {
        if (gameState && gameState.combatEffects.length > 0) {
            const maxDelay = Math.max(0, ...gameState.combatEffects.map(e => e.delay));
            const totalAnimationTime = maxDelay + 750;
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
                const newState = { ...prev, logs: nextLogs.slice(nextLogs.length - 200) };
                return newState;
            }
            const newState = { ...prev, logs: nextLogs };
            return newState;
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
        
        if (scenarioMode === 'spectate') {
            const finalState = turnSteps.length > 0 ? turnSteps[turnSteps.length - 1].updatedState : stateForTurn;
            const newHistory = [...currentHistory, finalState];
            if (newHistory.length > 101) newHistory.shift();

            setReplayHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
            setGameState(finalState);
        } else {
            let tempState = gameState;
            for (const step of turnSteps) {
                tempState = step.updatedState;
                setGameState(tempState);
                if (step.newNavigationTarget !== undefined) setNavigationTarget(step.newNavigationTarget);
                if (step.newSelectedTargetId !== undefined) setSelectedTargetId(step.newSelectedTargetId);
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            const finalState = tempState;
            const newHistory = [...currentHistory, finalState];
            if (newHistory.length > 101) newHistory.shift();
            setReplayHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        }

        setPlayerTurnActions({});
        setIsTurnResolving(false);
    }, [isTurnResolving, gameState, replayHistory, historyIndex, scenarioMode, playerTurnActions, navigationTarget, selectedTargetId]);
    
    const onSelectTarget = useCallback((id: string | null) => setSelectedTargetId(id), []);
    const onSetNavigationTarget = useCallback((pos: Position | null) => setNavigationTarget(pos), []);
    
    const onFireWeapon = useCallback((weaponId: string, targetId: string) => {
        if (!gameState || isTurnResolving || playerTurnActions.hasTakenMajorAction) return;

        const playerShip = gameState.player.ship;
        if (!playerShip || playerShip.isStunned) return;

        const weapon = playerShip.weapons.find(w => w.id === weaponId);
        if (!weapon) return;

        const target = gameState.currentSector.entities.find(e => e.id === targetId);
        if (!target) return;

        const targetingCheck = canTargetEntity(playerShip, target, gameState.currentSector, gameState.turn);
        if (!targetingCheck.canTarget) {
            addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: `Cannot fire: ${targetingCheck.reason}`, isPlayerSource: true, color: 'border-blue-400', category: 'combat' });
            return;
        }

        if (weapon.type === 'projectile') {
            const projectileWeapon = weapon as ProjectileWeapon;
            const ammo = playerShip.ammo[projectileWeapon.ammoType];
            if (!ammo || ammo.current <= 0) {
                addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: `Cannot fire ${weapon.name}: No ammunition remaining.`, isPlayerSource: true, color: 'border-blue-400', category: 'combat' });
                return;
            }
        }

        setPlayerTurnActions(prev => ({ ...prev, firedWeaponId: weaponId, weaponTargetId: targetId, hasTakenMajorAction: true }));
        addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: `Targeting ${target.name} with ${weapon.name}.`, isPlayerSource: true, color: 'border-blue-400', category: 'combat' });

    }, [gameState, isTurnResolving, playerTurnActions, addLog]);

    const onSelectSubsystem = useCallback((subsystem: keyof ShipSubsystems | null) => {
        setGameState(prev => {
            if (!prev) return null;
            const targetEntity = prev.currentSector.entities.find(e => e.id === selectedTargetId) ?? prev.player.ship;
            if (!targetEntity) return prev;

            const next = JSON.parse(JSON.stringify(prev));
            const playerShip = next.player.ship;
            if (!playerShip || !selectedTargetId) return prev;

            if (!playerShip.targeting || playerShip.targeting.entityId !== selectedTargetId) {
                playerShip.targeting = { entityId: selectedTargetId, subsystem: subsystem, consecutiveTurns: 1 };
            } else {
                const oldSubsystem = playerShip.targeting.subsystem;
                playerShip.targeting.subsystem = subsystem;
                if (oldSubsystem !== subsystem) {
                    playerShip.targeting.consecutiveTurns = 1;
                }
            }
            
            const logMessage = subsystem ? `Targeting computer locked on ${targetEntity.name}'s ${subsystem} system.` : `Targeting computer locked on ${targetEntity.name}'s hull.`;
            const newLog: LogEntry = {
                id: uniqueId(), turn: next.turn, sourceId: playerShip.id, sourceName: playerShip.name, message: logMessage,
                isPlayerSource: true, color: 'border-blue-400', category: 'targeting'
            };
            next.logs.push(newLog);

            return next;
        });
    }, [selectedTargetId]);
    
    const onEnergyChange = useCallback((changedKey: 'weapons' | 'shields' | 'engines', value: number) => {
        if (!gameState) return;
        setGameState(prev => {
            if (!prev) return null;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const playerShip = next.player.ship;
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
        setGameState(prev => {
             if (!prev) return null;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const playerShip = next.player.ship;
            if (!playerShip) return prev;
            
            let logMessage = '';
            if (playerShip.cloakState === 'cloaked') {
                playerShip.cloakState = 'visible';
                playerShip.cloakCooldown = 2; 
                logMessage = "Cloaking device disengaged.";
            } else if (playerShip.cloakState === 'visible') {
                if (playerShip.cloakCooldown > 0) return prev;
                playerShip.cloakState = 'cloaking';
                logMessage = `Initiating cloaking sequence.`;
            }
            if(logMessage){
                 next.logs.push({ id: uniqueId(), turn: next.turn, sourceId: playerShip.id, sourceName: playerShip.name, message: logMessage, isPlayerSource: true, color: 'border-blue-400' });
            }
            return next;
        });
    }, []);

    const onTogglePointDefense = useCallback(() => {
        setGameState(prev => {
            if (!prev) return null;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const playerShip = next.player.ship;
            if (!playerShip) return prev;

            playerShip.pointDefenseEnabled = !playerShip.pointDefenseEnabled;
            const newLog: LogEntry = {
                id: uniqueId(), turn: next.turn, sourceId: playerShip.id, sourceName: playerShip.name, 
                message: `Point-defense system ${playerShip.pointDefenseEnabled ? 'activated' : 'deactivated'}.`, 
                isPlayerSource: true, color: 'border-blue-400'
            };
            next.logs.push(newLog);

            return next;
        });
    }, []);

    const onEvasiveManeuvers = useCallback(() => {
        setGameState(prev => {
            if (!prev) return null;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const playerShip = next.player.ship;

            if (!playerShip || !next.redAlert || playerShip.subsystems.engines.health <= 0) {
                return prev;
            }

            playerShip.evasive = !playerShip.evasive;
            const newLog: LogEntry = {
                id: uniqueId(), turn: next.turn, sourceId: playerShip.id, sourceName: playerShip.name,
                message: `Evasive maneuvers ${playerShip.evasive ? 'engaged' : 'disengaged'}.`,
                isPlayerSource: true, color: 'border-blue-400'
            };
            next.logs.push(newLog);
            return next;
        });
    }, []);

    const onSelectRepairTarget = useCallback((subsystem: 'hull' | keyof ShipSubsystems | null) => {
        setGameState(prev => {
            if (!prev) return null;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const playerShip = next.player.ship;
            if (!playerShip) return prev;

            const newTarget = playerShip.repairTarget === subsystem ? null : subsystem;
            playerShip.repairTarget = newTarget;
            const newLog: LogEntry = {
                id: uniqueId(), turn: next.turn, sourceId: playerShip.id, sourceName: playerShip.name,
                message: newTarget ? `Damage control team assigned to repair ${newTarget}.` : `Damage control team standing by.`,
                isPlayerSource: true, color: 'border-blue-400'
            };
            next.logs.push(newLog);
            return next;
        });
    }, []);

    const onToggleRedAlert = useCallback(() => {
        setGameState(prev => {
            if (!prev) return null;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const playerShip = next.player.ship;
            if (!playerShip) return prev;
            
            next.redAlert = !next.redAlert;
            let logMessage = '';
            if (next.redAlert) {
                playerShip.shields = playerShip.maxShields;
                logMessage = 'Red Alert! Shields up!';
            } else {
                playerShip.shields = 0;
                playerShip.evasive = false;
                logMessage = 'Standing down from Red Alert. Shields offline.';
            }

            const newLog: LogEntry = {
                id: uniqueId(), turn: next.turn, sourceId: 'system', sourceName: 'Simulator',
                message: logMessage, isPlayerSource: false, color: next.redAlert ? 'border-red-600' : 'border-gray-500'
            };
            next.logs.push(newLog);
            return next;
        });
    }, []);

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

    const endSimulation = useCallback(() => {
        setIsRunning(false);
        setGameState(null);
        setReplayHistory([]);
        setHistoryIndex(0);
        setSelectedTargetId(null);
        setNavigationTarget(null);
        setPlayerTurnActions({});
        setIsTurnResolving(false);
    }, []);

    const targetEntity = useMemo(() => {
        if (!gameState || !selectedTargetId) {
            return undefined;
        }
        // Check player ship first
        if (gameState.player.ship && gameState.player.ship.id === selectedTargetId) {
            return gameState.player.ship;
        }
        // Then check other entities
        return gameState.currentSector.entities.find(e => e.id === selectedTargetId);
    }, [gameState, selectedTargetId]);

    return {
        gameState,
        isRunning,
        // FIX: Export setIsRunning to allow the simulator to directly control the playback state.
        setIsRunning,
        togglePause: () => setIsRunning(prev => !prev),
        endSimulation,
        setGameState,
        onEndTurn,
        selectedTargetId, onSelectTarget,
        navigationTarget, onSetNavigationTarget,
        playerTurnActions,
        isTurnResolving,
        desperationMoveAnimation: gameState?.desperationMoveAnimations[0] || null,
        targetEntity,
        onFireWeapon,
        onSelectSubsystem, onEnergyChange, onToggleCloak, onTogglePointDefense,
        onEvasiveManeuvers, onSelectRepairTarget, onToggleRedAlert,
        replayHistory,
        historyIndex,
        goToHistoryTurn,
        resumeFromHistory,
    };
};
