
import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { GameState, QuadrantPosition, ActiveHail, ActiveAwayMission, PlayerTurnActions, EventTemplate, EventTemplateOption, EventBeacon, AwayMissionResult, LogEntry, AwayMissionTemplate, Ship, ShipSubsystems, TorpedoProjectile } from '../types';
import { awayMissionTemplates, hailResponses, counselAdvice, eventTemplates } from '../assets/content';
import { createInitialGameState } from '../game/state/initialization';
import { saveGameToLocalStorage, loadGameFromLocalStorage, exportGameState, importGameState } from '../game/state/saveManager';
import { generatePhasedTurn, TurnStep } from '../game/turn/turnManager';
import { seededRandom, cyrb53 } from '../game/utils/helpers';
import { canTargetEntity, consumeEnergy } from '../game/utils/combat';
import { OfficerAdvice, ActiveAwayMissionOption, Planet } from '../types';
import { shipClasses } from '../assets/ships/configs/shipClassStats';
import { torpedoStats } from '../assets/projectiles/configs/torpedoTypes';
import { initiateBoardingProcess } from '../game/actions/boarding';
import { uniqueId } from '../game/utils/ai';

// Initialize AI and register faction handlers
import '../game/ai/factions'; 

const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

export const useGameLogic = (mode: 'new' | 'load' = 'load') => {
    const [gameState, setGameState] = useState<GameState>(() => {
        if (mode === 'load') {
            // At app start, if a save exists, load it. Otherwise, create a new game.
            return loadGameFromLocalStorage({ createNewIfNotFound: true }) as GameState;
        }
        return createInitialGameState();
    });

    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
    const [navigationTarget, setNavigationTarget] = useState<{ x: number; y: number } | null>(null);
    const [currentView, setCurrentView] = useState<'sector' | 'quadrant'>('sector');
    const [activeAwayMission, setActiveAwayMission] = useState<ActiveAwayMission | null>(null);
    const [activeHail, setActiveHail] = useState<ActiveHail | null>(null);
    const [playerTurnActions, setPlayerTurnActions] = useState<PlayerTurnActions>({});
    const [activeEvent, setActiveEvent] = useState<{ beaconId: string; template: EventTemplate } | null>(null);
    const [isWarping, setIsWarping] = useState(false);
    const [isTurnResolving, setIsTurnResolving] = useState(false);
    const [awayMissionResult, setAwayMissionResult] = useState<AwayMissionResult | null>(null);
    const [eventResult, setEventResult] = useState<string | null>(null);
    const [activeMissionPlanetId, setActiveMissionPlanetId] = useState<string | null>(null);
    const isGameLoaded = useRef(false);
    
    const addLog = useCallback((logData: Omit<LogEntry, 'id' | 'turn'>) => {
        setGameState(prev => {
            const newLog: LogEntry = {
                id: `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`,
                turn: prev.turn,
                ...logData
            };
            return { ...prev, logs: [...prev.logs, newLog] };
        });
    }, []);

    const newGame = useCallback(() => {
        const freshGameState = createInitialGameState();
        setGameState(freshGameState);
        setSelectedTargetId(null);
        setNavigationTarget(null);
        setCurrentView('sector');
        setActiveAwayMission(null);
        setActiveHail(null);
        setPlayerTurnActions({});
        setActiveEvent(null);
        setIsWarping(false);
        setIsTurnResolving(false);
        setAwayMissionResult(null);
        setEventResult(null);
        setActiveMissionPlanetId(null);
        isGameLoaded.current = false; // Reset to allow the 'New Game' log to fire
    }, []);

    useEffect(() => {
        if (!isGameLoaded.current) {
            isGameLoaded.current = true;
            addLog({
                sourceId: 'system',
                sourceName: 'Debug',
                message: `New Game. Sector Type: ${gameState.currentSector.templateId}, Seed: ${gameState.currentSector.seed}`,
                isPlayerSource: false,
                color: 'border-purple-500',
            });
        }
    }, [gameState.currentSector.templateId, gameState.currentSector.seed, addLog]);

    useEffect(() => {
        if (gameState.isDocked) return;
        const starbase = gameState.currentSector.entities.find(e => e.type === 'starbase');
        if (!starbase) {
            setGameState(prev => ({...prev, isDocked: false}));
            return;
        }
        const distance = Math.max(Math.abs(gameState.player.ship.position.x - starbase.position.x), Math.abs(gameState.player.ship.position.y - starbase.position.y));
        if (distance > 1) {
            setGameState(prev => ({...prev, isDocked: false}));
            addLog({ sourceId: 'system', sourceName: 'Ship Computer', message: "Undocked: Moved out of range of the starbase.", isPlayerSource: false, color: 'border-gray-500' });
        }
    }, [gameState.turn, gameState.currentSector.entities, gameState.isDocked, addLog, gameState.player.ship.position]);

    useEffect(() => {
        if (activeEvent) return;
        const beacon = gameState.currentSector.entities.find(e =>
            e.type === 'event_beacon' && !e.isResolved && Math.max(Math.abs(gameState.player.ship.position.x - e.position.x), Math.abs(gameState.player.ship.position.y - e.position.y)) <= 1
        ) as EventBeacon | undefined;

        if (beacon) {
            const templates = eventTemplates[beacon.eventType];
            if (templates && templates.length > 0) {
                const template = templates[Math.floor(Math.random() * templates.length)];
                addLog({ sourceId: 'system', sourceName: 'Sensors', message: `Approaching an ${beacon.name}...`, isPlayerSource: false, color: 'border-gray-500' });
                setActiveEvent({ beaconId: beacon.id, template });
            }
        }
    }, [gameState.player.ship.position, gameState.currentSector.entities, activeEvent, addLog]);
    
    useEffect(() => {
        if (gameState.combatEffects.length > 0) {
            const maxDelay = Math.max(0, ...gameState.combatEffects.map(e => e.delay));
            const totalAnimationTime = maxDelay + 750; // Phaser animation is 750ms
            const timer = setTimeout(() => {
                setGameState(prev => ({ ...prev, combatEffects: [] }));
            }, totalAnimationTime);
            return () => clearTimeout(timer);
        }
    }, [gameState.combatEffects]);

    useEffect(() => {
        if (gameState.desperationMoveAnimations.length > 0) {
            const timer = setTimeout(() => {
                setGameState(prev => ({ ...prev, desperationMoveAnimations: [] }));
            }, 4000); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [gameState.desperationMoveAnimations]);

    useEffect(() => {
        if (gameState.isRetreatingWarp) {
            setIsWarping(true);
            const timer = setTimeout(() => {
                setIsWarping(false);
                setGameState(prev => ({ ...prev, isRetreatingWarp: false, }));
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [gameState.isRetreatingWarp]);

    const saveGame = useCallback(() => {
        const success = saveGameToLocalStorage(gameState);
        if (success) {
            addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Game state saved successfully.', isPlayerSource: false, color: 'border-gray-500' });
        } else {
            addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Error: Could not save game state.', isPlayerSource: false, color: 'border-red-500' });
        }
    }, [gameState, addLog]);

    const loadGame = useCallback(() => {
        const savedState = loadGameFromLocalStorage({ createNewIfNotFound: false });
        if (savedState) {
            setGameState(savedState);
            addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Game state loaded successfully.', isPlayerSource: false, color: 'border-gray-500' });
            addLog({
                sourceId: 'system',
                sourceName: 'Debug',
                message: `Loaded Sector. Type: ${savedState.currentSector.templateId}, Seed: ${savedState.currentSector.seed}`,
                isPlayerSource: false,
                color: 'border-purple-500',
            });
            isGameLoaded.current = true;
        } else {
            addLog({ sourceId: 'system', sourceName: 'Computer', message: 'No saved game found or save file was corrupt.', isPlayerSource: false, color: 'border-red-500' });
        }
    }, [addLog]);

    const exportSave = useCallback(() => {
        const result = exportGameState(gameState);
        if (result.success) {
            addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Save file exported.', isPlayerSource: false, color: 'border-gray-500' });
        } else {
            addLog({ sourceId: 'system', sourceName: 'Computer', message: result.error || 'Error: Could not export save file.', isPlayerSource: false, color: 'border-red-500' });
        }
    }, [gameState, addLog]);

    const importSave = useCallback((jsonString: string) => {
        const result = importGameState(jsonString);
        if (result.success && result.gameState) {
            setGameState(result.gameState);
            addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Game state imported successfully.', isPlayerSource: false, color: 'border-gray-500' });
        } else {
            addLog({ sourceId: 'system', sourceName: 'Computer', message: result.error || 'Error: Could not import save file.', isPlayerSource: false, color: 'border-red-500' });
        }
    }, [addLog]);

    const onEndTurn = useCallback(async (actionsOverride?: PlayerTurnActions) => {
        if (isTurnResolving || !gameState) return;
        setIsTurnResolving(true);
    
        const turnConfig = {
            mode: 'game' as const,
            playerTurnActions: actionsOverride || playerTurnActions,
            navigationTarget,
            selectedTargetId
        };
    
        const turnSteps: TurnStep[] = generatePhasedTurn(gameState, turnConfig);
    
        // Snapshot of the state *before* any turn steps are processed for history
        const stateSnapshot = { ...gameState };
        delete stateSnapshot.replayHistory;
        const history = [...(gameState.replayHistory || [])];
        history.push(JSON.parse(JSON.stringify(stateSnapshot)));
        if (history.length > 100) {
            history.shift();
        }
        
        // The first step should have the updated history
        if(turnSteps.length > 0) {
            turnSteps[0].updatedState.replayHistory = history;
        }

        for (const step of turnSteps) {
            setGameState(step.updatedState);
    
            if (step.newNavigationTarget !== undefined) {
                setNavigationTarget(step.newNavigationTarget);
            }
            if (step.newSelectedTargetId !== undefined) {
                setSelectedTargetId(step.newSelectedTargetId);
            }
    
            if (step.delay > 0) {
                await new Promise(resolve => setTimeout(resolve, step.delay));
            }
        }
    
        setPlayerTurnActions({});
        setIsTurnResolving(false);
    
    }, [isTurnResolving, gameState, playerTurnActions, navigationTarget, selectedTargetId]);
    
    const onEnergyChange = useCallback((changedKey: 'weapons' | 'shields' | 'engines', value: number) => {
        setGameState(prev => {
            const oldAlloc = prev.player.ship.energyAllocation; if (oldAlloc[changedKey] === value) return prev;
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
            return { ...prev, player: { ...prev.player, ship: { ...prev.player.ship, energyAllocation: newAlloc } } };
        });
    }, []);

    const onDistributeEvenly = useCallback(() => {
        setGameState(prev => ({
            ...prev, player: { ...prev.player, ship: { ...prev.player.ship, energyAllocation: { weapons: 34, shields: 33, engines: 33 } } }
        }));
        addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: "Energy allocation reset to default distribution.", isPlayerSource: true, color: 'border-blue-400' });
    }, [addLog, gameState.player.ship.name]);

    const onSelectTarget = useCallback((id: string | null) => {
        setSelectedTargetId(id);
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            next.player.ship.currentTargetId = id;
            if (id) {
                const targetEntity = next.currentSector.entities.find(e => e.id === id);
                const currentTargeting = next.player.targeting;
                if (!currentTargeting || currentTargeting.entityId !== id) {
                    if (targetEntity && (targetEntity.type === 'ship' || targetEntity.type === 'torpedo_projectile')) {
                        next.player.targeting = { entityId: id, subsystem: null, consecutiveTurns: 1 };
                    } else { delete next.player.targeting; }
                }
            } else { delete next.player.targeting; }
            return next;
        });
    }, []);

    const onSetNavigationTarget = useCallback((pos: { x: number; y: number } | null) => {
        setNavigationTarget(pos);
        if (pos) {
            addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: `Navigation target set to (${pos.x}, ${pos.y}).`, isPlayerSource: true, color: 'border-blue-400' });
        } else {
            addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: `Navigation cancelled.`, isPlayerSource: true, color: 'border-blue-400' });
        }
    }, [addLog, gameState.player.ship.name]);

    const onSetView = useCallback((view: 'sector' | 'quadrant') => {
        setCurrentView(view);
    }, []);

    const onWarp = useCallback((pos: QuadrantPosition) => {
        const { ship } = gameState.player;
        const warpEnginesHealth = ship.subsystems.engines.health / ship.subsystems.engines.maxHealth;
        
        if (warpEnginesHealth < 0.50) {
            addLog({ sourceId: 'player', sourceName: ship.name, message: "Cannot initiate warp: Main engines are too damaged.", isPlayerSource: true, color: 'border-blue-400' });
            return;
        }

        if (gameState.redAlert) {
            addLog({ sourceId: 'player', sourceName: ship.name, message: "Cannot initiate warp while on Red Alert.", isPlayerSource: true, color: 'border-blue-400' });
            return;
        }

        const { current: dilithium } = gameState.player.ship.dilithium;
        if (dilithium <= 0) {
            addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: "Cannot warp: No dilithium crystals available.", isPlayerSource: true, color: 'border-blue-400' });
            return;
        }
        
        setIsWarping(true);
        setTimeout(() => {
          let nextState: GameState;
          setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next.quadrantMap[prev.player.position.qy][prev.player.position.qx] = next.currentSector;
            next.player.position = pos;
            const newSector = next.quadrantMap[pos.qy][pos.qx];
            newSector.visited = true;
            next.currentSector = newSector;
            next.player.ship.position = { x: 6, y: 8 };
            next.player.ship.dilithium.current -= 1;
            next.orbitingPlanetId = null;
            next.replayHistory = []; // Clear history on warp
            nextState = next;
            return next;
          });
          setIsWarping(false);
          setCurrentView('sector');
          addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: `Warp successful. Arrived in quadrant (${pos.qx}, ${pos.qy}).`, isPlayerSource: true, color: 'border-blue-400' });
          addLog({
              sourceId: 'system',
              sourceName: 'Debug',
              message: `Entering Sector. Type: ${nextState!.currentSector.templateId}, Seed: ${nextState!.currentSector.seed}`,
              isPlayerSource: false,
              color: 'border-purple-500',
          });
        }, 2000);
    }, [gameState, addLog]);

    const onScanQuadrant = useCallback((pos: QuadrantPosition) => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const { ship } = next.player;
            const energyCost = 5 * ship.energyModifier;
            if(ship.energy.current < energyCost) {
                addLog({ sourceId: 'player', sourceName: ship.name, message: 'Insufficient power for long-range scan.', isPlayerSource: true, color: 'border-blue-400' });
                return prev;
            }
            ship.energy.current -= energyCost;
            next.quadrantMap[pos.qy][pos.qx].isScanned = true;
            addLog({ sourceId: 'player', sourceName: ship.name, message: `Long-range scan of quadrant (${pos.qx}, ${pos.qy}) complete. Consumed ${Math.round(energyCost)} power.`, isPlayerSource: true, color: 'border-blue-400' });
            return next;
        });
    }, [addLog]);

    const onToggleRedAlert = useCallback(() => {
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const { ship } = next.player;
            if (!next.redAlert) { // Activating Red Alert
                 if (ship.cloakState !== 'visible') {
                    addLog({ sourceId: 'player', sourceName: ship.name, message: `Cannot go to Red Alert while cloaking device is active.`, isPlayerSource: true, color: 'border-blue-400' });
                    return prev;
                }
                if (ship.shieldReactivationTurn && next.turn < ship.shieldReactivationTurn) {
                    const turnsRemaining = ship.shieldReactivationTurn - next.turn;
                    addLog({ sourceId: 'player', sourceName: ship.name, message: `Cannot raise shields: Emitters are recalibrating for ${turnsRemaining} more turn(s).`, isPlayerSource: false, color: 'border-orange-400' });
                    return prev;
                }

                const shieldHealthPercent = ship.subsystems.shields.maxHealth > 0 ? ship.subsystems.shields.health / ship.subsystems.shields.maxHealth : 0;
                
                const baseEnergyCost = 15;
                let energyCost = baseEnergyCost * ship.energyModifier;
                
                if (shieldHealthPercent > 0) {
                    const damagePercent = 1 - shieldHealthPercent;
                    const energyCostMultiplier = 1 + (damagePercent / 2);
                    energyCost = (baseEnergyCost * ship.energyModifier) * energyCostMultiplier;
                }

                if (ship.energy.current < energyCost) {
                    addLog({ sourceId: 'system', sourceName: 'Ship Computer', message: `Not enough reserve power to activate Red Alert! (Required: ${Math.round(energyCost)}, Available: ${Math.round(ship.energy.current)})`, isPlayerSource: false, color: 'border-orange-400' });
                    return prev;
                }

                ship.energy.current -= energyCost;
                next.redAlert = true;

                if (shieldHealthPercent < 0.25) {
                    ship.shields = 0;
                    addLog({ sourceId: 'system', sourceName: 'RED ALERT!', message: `Warning: Shield generator is below 25% health! Shields cannot be raised. Consumed ${Math.round(energyCost)} power for alert status.`, isPlayerSource: false, color: 'border-red-600' });
                } else {
                    ship.shields = ship.maxShields;
                    addLog({ sourceId: 'system', sourceName: 'RED ALERT!', message: `Shields up! Consumed ${Math.round(energyCost)} power.`, isPlayerSource: false, color: 'border-red-600' });
                    if (shieldHealthPercent < 1.0) {
                        addLog({ sourceId: 'system', sourceName: 'Engineering', message: `Note: Shield generator at ${Math.round(shieldHealthPercent * 100)}% efficiency. Energy consumption for shield operations is increased.`, isPlayerSource: false, color: 'border-orange-400' });
                    }
                }
            } else { // Deactivating Red Alert
                next.redAlert = false;
                ship.shields = 0;
                ship.evasive = false;
                addLog({ sourceId: 'system', sourceName: 'Stand Down', message: 'Standing down from Red Alert. Shields offline.', isPlayerSource: false, color: 'border-gray-500' });
            }
            return next;
        });
    }, [addLog]);

    const onEvasiveManeuvers = useCallback(() => {
        setGameState(prev => {
            if (!prev.redAlert || prev.player.ship.subsystems.engines.health <= 0) return prev;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            next.player.ship.evasive = !next.player.ship.evasive;
            addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Evasive maneuvers ${next.player.ship.evasive ? 'engaged' : 'disengaged'}.`, isPlayerSource: true, color: 'border-blue-400' });
            return next;
        });
    }, [addLog]);

    const onSelectRepairTarget = useCallback((subsystem: 'hull' | keyof ShipSubsystems | null) => {
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            if (next.player.ship.repairTarget === subsystem) {
                next.player.ship.repairTarget = null;
                addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Damage control team standing by.`, isPlayerSource: true, color: 'border-blue-400' });
            } else {
                next.player.ship.repairTarget = subsystem;
                addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Damage control team assigned to repair ${subsystem}.`, isPlayerSource: true, color: 'border-blue-400' });
            }
            return next;
        });
    }, [addLog]);

    const onFirePhasers = useCallback((targetId: string) => {
        if (gameState.player.ship.isStunned || gameState.player.ship.cloakState === 'cloaked' || playerTurnActions.hasTakenMajorAction) return;
        setPlayerTurnActions(prev => ({ ...prev, phaserTargetId: targetId }));
        const target = gameState.currentSector.entities.find(e => e.id === targetId);
        addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: `Targeting ${target?.name || 'unknown'} with phasers.`, isPlayerSource: true, color: 'border-blue-400' });
    }, [addLog, gameState, playerTurnActions]);

    const onLaunchTorpedo = useCallback((targetId: string) => {
        if (gameState.player.ship.isStunned || playerTurnActions.hasTakenMajorAction || playerTurnActions.torpedoTargetId) return;
        
        const { ship } = gameState.player;
        const shipStats = shipClasses[ship.shipModel][ship.shipClass];
        if (shipStats.torpedoType === 'None') return;

        const torpedoData = torpedoStats[shipStats.torpedoType];
        
        if (ship.torpedoes.current <= 0) {
            addLog({ sourceId: 'player', sourceName: ship.name, message: `Cannot launch ${torpedoData.name}: All tubes are empty.`, isPlayerSource: true, color: 'border-blue-400' });
            return;
        }
        const target = gameState.currentSector.entities.find(e => e.id === targetId);
        if (!target || target.type !== 'ship') {
            addLog({ sourceId: 'player', sourceName: ship.name, message: `Cannot launch torpedo: Invalid target.`, isPlayerSource: true, color: 'border-blue-400' });
            return;
        }

        const targetingCheck = canTargetEntity(gameState.player.ship, target, gameState.currentSector);
        if (!targetingCheck.canTarget) {
            addLog({ sourceId: 'player', sourceName: ship.name, message: `Cannot launch torpedo: ${targetingCheck.reason}`, isPlayerSource: true, color: 'border-blue-400' });
            return;
        }
    
        setPlayerTurnActions(prev => ({ ...prev, torpedoTargetId: targetId }));
        addLog({ sourceId: 'player', sourceName: ship.name, message: `Acquiring torpedo lock on ${target?.name}.`, isPlayerSource: true, color: 'border-blue-400' });
    
    }, [addLog, playerTurnActions, gameState]);

    const onScanTarget = useCallback(() => {
        if (!selectedTargetId || gameState.player.ship.isStunned || gameState.player.ship.cloakState === 'cloaked' || playerTurnActions.hasTakenMajorAction) return;
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const { ship } = next.player;
            const energyCost = 5 * ship.energyModifier;
            const { success, logs } = consumeEnergy(ship, energyCost);
            logs.forEach(log => addLog({ sourceId: 'player', sourceName: ship.name, message: log, isPlayerSource: true, color: 'border-blue-400' }));
            if (!success) return prev;

            const target = next.currentSector.entities.find(e => e.id === selectedTargetId);
            if (target) {
                target.scanned = true;
                addLog({ sourceId: 'player', sourceName: ship.name, message: `Scan complete on ${target.name}.`, isPlayerSource: true, color: 'border-blue-400' });
            }
            return next;
        });
    }, [selectedTargetId, addLog, gameState, playerTurnActions]);

    const onInitiateRetreat = useCallback(() => {
        if (gameState.player.ship.isStunned || gameState.player.ship.cloakState === 'cloaked' || playerTurnActions.hasTakenMajorAction) return;
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            next.player.ship.retreatingTurn = next.turn + 3;
            addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Retreat initiated! Charging warp core. We must survive for 3 turns.`, isPlayerSource: true, color: 'border-orange-400' });
            return next;
        });
    }, [addLog, gameState, playerTurnActions]);

    const onCancelRetreat = useCallback(() => {
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            next.player.ship.retreatingTurn = null;
            addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Retreat cancelled.`, isPlayerSource: true, color: 'border-blue-400' });
            return next;
        });
    }, [addLog]);
    
    const onDockWithStarbase = useCallback(() => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next.isDocked = true;
            return next;
        });
        setNavigationTarget(null);
        addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: 'Docking procedures initiated. Welcome to Starbase.', isPlayerSource: true, color: 'border-blue-400' });
    }, [addLog, gameState.player.ship.name]);

    const onUndock = useCallback(() => {
        if(isTurnResolving) return;
        onEndTurn({ isUndocking: true });
    }, [isTurnResolving, onEndTurn]);


    const onStartAwayMission = useCallback((planetId: string) => {
        if (gameState.player.ship.isStunned || gameState.player.ship.cloakState === 'cloaked' || playerTurnActions.hasTakenMajorAction) return;
        const planet = gameState.currentSector.entities.find((e): e is Planet => e.id === planetId);
        if (!planet) return;
        
        const availableTemplates = awayMissionTemplates.filter(t =>
            t.planetClasses.includes(planet.planetClass) &&
            !gameState.usedAwayMissionTemplateIds?.includes(t.id)
        );
        
        let template: AwayMissionTemplate;
        if (availableTemplates.length > 0) {
            template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
        } else {
            const olderTemplates = awayMissionTemplates.filter(t =>
                t.planetClasses.includes(planet.planetClass) &&
                !gameState.usedAwayMissionTemplateIds?.slice(-5).includes(t.id)
            );
            if (olderTemplates.length > 0) {
                template = olderTemplates[Math.floor(Math.random() * olderTemplates.length)];
            } else {
                const allClassTemplates = awayMissionTemplates.filter(t => t.planetClasses.includes(planet.planetClass));
                template = allClassTemplates[Math.floor(Math.random() * allClassTemplates.length)];
            }
        }

        if (!template) {
            addLog({ sourceId: 'system', sourceName: 'Ship Computer', message: `No suitable away missions available for this planet class.`, isPlayerSource: false, color: 'border-gray-500' });
            return;
        }

        const missionSeed = `${template.id}_${planet.id}_${gameState.turn}`;
        const rand = seededRandom(cyrb53(missionSeed));

        const activeOptions = template.options.map((opt): ActiveAwayMissionOption => ({
            ...opt,
            calculatedSuccessChance: opt.successChanceRange[0] + rand() * (opt.successChanceRange[1] - opt.successChanceRange[0])
        }));
        
        const advice: OfficerAdvice[] = gameState.player.crew.map(officer => {
            const advicePool = counselAdvice[officer.role]?.[officer.personality];
            return {
                officerName: officer.name,
                role: officer.role,
                message: advicePool ? advicePool[Math.floor(rand() * advicePool.length)] : 'I have no specific advice, Captain.'
            };
        });

        setActiveMissionPlanetId(planetId);
        setGameState(prev => ({ ...prev, usedAwayMissionSeeds: [...prev.usedAwayMissionSeeds, missionSeed], usedAwayMissionTemplateIds: [...(prev.usedAwayMissionTemplateIds || []), template.id] }));
        setActiveAwayMission({ ...template, options: activeOptions, advice, seed: missionSeed });
    }, [gameState, addLog, playerTurnActions]);

    const onChooseAwayMissionOption = useCallback((option: ActiveAwayMissionOption) => {
        if (!activeAwayMission) return;
        const rand = seededRandom(cyrb53(activeAwayMission.seed, option.role.length));
        const success = rand() < option.calculatedSuccessChance;

        const outcomePool = success ? option.outcomes.success : option.outcomes.failure;
        const totalWeight = outcomePool.reduce((sum, o) => sum + o.weight, 0);
        let randomWeight = rand() * totalWeight;
        const chosenOutcome = outcomePool.find(o => {
            randomWeight -= o.weight;
            return randomWeight < 0;
        }) || outcomePool[0];

        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const { ship } = next.player;
            const result: AwayMissionResult = { log: chosenOutcome.log, status: success ? 'success' : 'failure', changes: [] };
            
            if ((chosenOutcome.type === 'reward' || chosenOutcome.type === 'damage') && chosenOutcome.resource && chosenOutcome.amount) {
                const amount = (chosenOutcome.type === 'damage' ? -1 : 1) * chosenOutcome.amount;
                // applyResourceChange(ship, chosenOutcome.resource, amount);
                result.changes.push({ resource: chosenOutcome.resource, amount });
            }

            if (activeMissionPlanetId) {
                const planet = next.currentSector.entities.find((e): e is Planet => e.id === activeMissionPlanetId);
                if(planet) planet.awayMissionCompleted = true;
            }

            setAwayMissionResult(result);
            return next;
        });

        setActiveAwayMission(null);
    }, [activeAwayMission, activeMissionPlanetId]);

    const onCloseAwayMissionResult = useCallback(() => {
        setAwayMissionResult(null);
    }, []);

    const onHailTarget = useCallback(async () => {
        if (!selectedTargetId || !ai) {
            addLog({sourceId: 'system', sourceName: 'Comms', message: 'Cannot hail target: AI system offline or no target selected.', isPlayerSource: false, color: 'border-gray-500'});
            return;
        }
        const target = gameState.currentSector.entities.find((e): e is Ship => e.id === selectedTargetId);
        if (!target) return;

        setActiveHail({ targetId: target.id, loading: true, message: '' });

        try {
            const factionResponses = hailResponses[target.faction];
            let baseResponse = factionResponses ? factionResponses.greeting : "No response.";
            
            const isDamaged = target.hull < target.maxHull;
            if(isDamaged) baseResponse = factionResponses.threatened || baseResponse;
            
            const prompt = `You are the captain of a ${target.faction} ${target.shipRole} starship named '${target.name}'. You are being hailed by a Federation starship. Your ship is ${isDamaged ? 'damaged' : 'at full health'}. Your personality is typical for your faction: ${target.faction === 'Klingon' ? 'aggressive and honor-bound' : target.faction === 'Romulan' ? 'suspicious and arrogant' : target.faction === 'Pirate' ? 'greedy and dismissive' : 'neutral'}. Provide a short, in-character hailing response based on this base message: "${baseResponse}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { temperature: 0.8, thinkingConfig: { thinkingBudget: 0 } },
            });

            setActiveHail({ targetId: target.id, loading: false, message: response.text });
        } catch (error) {
            console.error("Gemini API call failed:", error);
            const factionResponses = hailResponses[target.faction];
            const fallbackMessage = factionResponses ? factionResponses.greeting : "Static ... no response.";
            setActiveHail({ targetId: target.id, loading: false, message: fallbackMessage });
        }
    }, [selectedTargetId, gameState.currentSector.entities, addLog]);

    const onCloseHail = useCallback(() => {
        setActiveHail(null);
    }, []);

    const onChooseEventOption = useCallback((option: EventTemplateOption) => {
        if (!activeEvent) return;
        setEventResult(option.outcome.log);
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const { ship } = next.player;

            if ((option.outcome.type === 'reward' || option.outcome.type === 'damage') && option.outcome.resource && option.outcome.amount) {
                const amount = (option.outcome.type === 'damage' ? -1 : 1) * option.outcome.amount;
                // applyResourceChange(ship, option.outcome.resource, amount);
            } else if (option.outcome.type === 'combat') {
                addLog({ sourceId: 'system', sourceName: 'Tactical Alert', message: 'Hostile ships detected!', isPlayerSource: false, color: 'border-red-600' });
                next.redAlert = true;
            }

            const beacon = next.currentSector.entities.find((e): e is EventBeacon => e.id === activeEvent.beaconId);
            if (beacon) beacon.isResolved = true;

            return next;
        });
        setActiveEvent(null);
    }, [activeEvent, addLog]);

    const onCloseEventResult = useCallback(() => {
        setEventResult(null);
    }, []);

    const onSelectSubsystem = useCallback((subsystem: keyof ShipSubsystems | null) => {
        setGameState(prev => {
            if (!prev.player.targeting) return prev;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const currentTarget = next.player.targeting;
            
            const oldSubsystem = currentTarget.subsystem;
            currentTarget.subsystem = subsystem;

            if (oldSubsystem !== subsystem) {
                currentTarget.consecutiveTurns = 1;
            }
            
            return next;
        });
    }, []);

    const onSendAwayTeam = useCallback((targetId: string, type: 'boarding' | 'strike') => {
        if (gameState.player.ship.isStunned || gameState.player.ship.cloakState === 'cloaked' || playerTurnActions.hasTakenMajorAction) return;
        if (playerTurnActions.hasUsedAwayTeam) {
            addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: 'Transporter room is cycling. Only one away team action per turn.', isPlayerSource: true, color: 'border-blue-400' });
            return;
        }
        
        const { ship } = gameState.player;
        if (ship.securityTeams.current <= 0) {
            addLog({ sourceId: 'player', sourceName: ship.name, message: 'No security teams available to transport.', isPlayerSource: true, color: 'border-blue-400' });
            return;
        }
        const target = gameState.currentSector.entities.find((e): e is Ship => e.id === targetId);
        if (!target) return;
    
        if (target.isDerelict && type === 'boarding') {
            setPlayerTurnActions(prev => ({ ...prev, hasUsedAwayTeam: true }));
            setGameState(prev => {
                const next = JSON.parse(JSON.stringify(prev));
                const shipInNext = next.player.ship;
                const targetInNext = next.currentSector.entities.find((e): e is Ship => e.id === targetId);
                if (!targetInNext) return prev;

                const { success, logs } = initiateBoardingProcess(shipInNext, targetInNext, next.turn);

                logs.forEach(log => {
                    const newLog = {
                        id: uniqueId(), turn: next.turn, sourceId: 'player', sourceName: shipInNext.name,
                        message: log, isPlayerSource: true, color: success ? 'border-blue-400' : 'border-red-400'
                    };
                    next.logs.push(newLog);
                });
                return next;
            });
            return;
        }

        setPlayerTurnActions(prev => ({ ...prev, hasUsedAwayTeam: true }));
        
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const shipInNext = next.player.ship;
            const targetInNext = next.currentSector.entities.find((e): e is Ship => e.id === targetId);
    
            if (!targetInNext) return prev;

            shipInNext.securityTeams.current--;
            addLog({ sourceId: 'player', sourceName: shipInNext.name, message: `Sending a security team to ${targetInNext.name}...`, isPlayerSource: true, color: 'border-blue-400' });
            
            let successChance = type === 'boarding' ? 0.5 : 0.8;
            
            const success = Math.random() < successChance;

            if (success) {
                if (type === 'boarding') {
                    targetInNext.faction = 'Federation';
                    targetInNext.logColor = 'border-blue-300';
                    targetInNext.isDerelict = false;
                    targetInNext.captureInfo = { captorId: shipInNext.id, repairTurn: next.turn };
                    const message = `Boarding successful! We have captured the ${targetInNext.name}! An engineering team is being dispatched to stabilize and repair the vessel.`;
                    addLog({ sourceId: 'player', sourceName: shipInNext.name, message: message, isPlayerSource: true, color: 'border-blue-400' });
                } else { // strike
                    const damage = 20 + Math.floor(Math.random() * 10);
                    targetInNext.hull = Math.max(0, targetInNext.hull - damage);
                    addLog({ sourceId: 'player', sourceName: shipInNext.name, message: `Strike team successful! They have sabotaged the enemy hull, dealing ${damage} damage.`, isPlayerSource: true, color: 'border-blue-400' });
                }
            } else {
                shipInNext.crewMorale.current = Math.max(0, shipInNext.crewMorale.current - 10);
                addLog({ sourceId: 'player', sourceName: shipInNext.name, message: `The away team was repelled! We have lost a security team and crew morale has dropped.`, isPlayerSource: true, color: 'border-red-500' });
            }

            return next;
        });
    }, [addLog, gameState, playerTurnActions]);

    const onEnterOrbit = useCallback((planetId: string) => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next.orbitingPlanetId = planetId;
            const planet = next.currentSector.entities.find(e => e.id === planetId);
            addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Entering orbit of ${planet?.name || 'the planet'}.`, isPlayerSource: true, color: 'border-blue-400' });
            return next;
        });
    }, [addLog]);

    const onToggleCloak = useCallback(() => {
        if (playerTurnActions.hasTakenMajorAction) {
            addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: "Cannot perform another action this turn.", isPlayerSource: true, color: 'border-blue-400' });
            return;
        }

        const { ship } = gameState.player;

        if (!ship.cloakingCapable) {
            addLog({ sourceId: 'player', sourceName: ship.name, message: "This ship is not equipped with a cloaking device.", isPlayerSource: true, color: 'border-blue-400' });
            return;
        }

        if (ship.cloakState === 'cloaked') {
            setPlayerTurnActions(prev => ({ ...prev, wantsToDecloak: true, hasTakenMajorAction: true }));
            addLog({ sourceId: 'player', sourceName: ship.name, message: "Initiating decloaking sequence. This will take two turns.", isPlayerSource: true, color: 'border-blue-400' });
        } else if (ship.cloakState === 'visible') {
            if (ship.cloakCooldown > 0) {
                addLog({ sourceId: 'player', sourceName: ship.name, message: `Cannot engage cloak: Device is recharging for ${ship.cloakCooldown} more turn(s).`, isPlayerSource: true, color: 'border-blue-400' });
                return;
            }
            if (gameState.redAlert) {
                addLog({ sourceId: 'player', sourceName: ship.name, message: "Cannot engage cloak while shields are up (Red Alert).", isPlayerSource: true, color: 'border-blue-400' });
                return;
            }
            const stats = shipClasses[ship.shipModel]?.[ship.shipClass];
            const reliability = stats ? (1 - stats.cloakFailureChance) * 100 : 90;
            setPlayerTurnActions(prev => ({ ...prev, wantsToCloak: true, hasTakenMajorAction: true }));
            addLog({
                sourceId: 'player',
                sourceName: ship.name,
                message: `Initiating cloaking sequence. Base reliability: ${reliability.toFixed(0)}%. Ship will be vulnerable this turn.`,
                isPlayerSource: true,
                color: 'border-blue-400'
            });
        }
    }, [addLog, gameState, playerTurnActions]);

    const onTogglePointDefense = useCallback(() => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const { ship } = next.player;
            ship.pointDefenseEnabled = !ship.pointDefenseEnabled;

            if (ship.pointDefenseEnabled) {
                addLog({ 
                    sourceId: 'player', 
                    sourceName: ship.name, 
                    message: `Laser point-defense system activated. Phaser damage and range reduced.`, 
                    isPlayerSource: true, 
                    color: 'border-blue-400' 
                });
            } else {
                addLog({ 
                    sourceId: 'player', 
                    sourceName: ship.name, 
                    message: `Point-defense system deactivated. Phaser output restored to normal.`, 
                    isPlayerSource: true, 
                    color: 'border-blue-400' 
                });
            }
            return next;
        });
    }, [addLog]);

    return {
        gameState, selectedTargetId, navigationTarget, currentView, activeAwayMission, activeHail, targetEntity: gameState.currentSector.entities.find(e => e.id === selectedTargetId),
        playerTurnActions, activeEvent, isWarping, isTurnResolving, awayMissionResult, eventResult,
        desperationMoveAnimation: gameState.desperationMoveAnimations.length > 0 ? gameState.desperationMoveAnimations[0] : null,
        onEnergyChange, onEndTurn, onFirePhasers, onLaunchTorpedo, onEvasiveManeuvers, onSelectTarget, onSetNavigationTarget, onSetView, onWarp, onDockWithStarbase,
        onSelectRepairTarget, onScanTarget, onInitiateRetreat, onCancelRetreat, onStartAwayMission, onChooseAwayMissionOption,
        onHailTarget, onCloseHail, onSelectSubsystem, onChooseEventOption, saveGame, loadGame, exportSave, importSave, onDistributeEvenly, onSendAwayTeam,
        onToggleRedAlert, onCloseAwayMissionResult, onCloseEventResult, onScanQuadrant, onEnterOrbit, onToggleCloak, onTogglePointDefense,
        newGame, onUndock
    };
};
