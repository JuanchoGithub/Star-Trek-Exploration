
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useScenarioLogic } from '../hooks/useScenarioLogic';
import type { GameState, Ship, ShipModel, SectorState, LogEntry, SectorTemplate, Entity, CombatEffect, TorpedoProjectile, BeamWeapon, ProjectileWeapon } from '../types';
import { shipClasses, ShipClassStats } from '../assets/ships/configs/shipClassStats';
import { sectorTemplates } from '../assets/galaxy/sectorTemplates';
import SectorView from './SectorView';
import LogPanel from './LogPanel';
import CommandConsole from './CommandConsole';
import { useTheme } from '../hooks/useTheme';
import ShipStatus from './ShipStatus';
import { SampleSector } from './manual/SampleSector';
import { templateInfo } from './manual/templateInfo';
import { shipVisuals } from '../assets/ships/configs/shipVisuals';
import { createSectorFromTemplate, createShip } from '../game/state/initialization';
import { uniqueId } from '../game/utils/ai';
import { planetNames } from '../assets/planets/configs/planetNames';
import { shipNames } from '../assets/ships/configs/shipNames';
import SimulatorShipDetailPanel from './SimulatorShipDetailPanel';
import CombatFXLayer from './CombatFXLayer';
import DesperationMoveAnimation from './DesperationMoveAnimation';
import PlaybackControls from './PlaybackControls';
import { GameStateProvider } from '../contexts/GameStateContext';
import { GameActionsProvider } from '../contexts/GameActionsContext';
import { UIStateProvider } from '../contexts/UIStateContext';
import { torpedoStats } from '../assets/projectiles/configs/torpedoTypes';
import { ScienceIcon, EngineeringIcon, LogIcon, WeaponIcon } from '../assets/ui/icons';
import StatusLine from './StatusLine';
import ThemeSwitcher from './ThemeSwitcher';

type Tool = {
    type: 'add_ship';
    shipClass: ShipClassStats;
    faction: ShipModel;
    allegiance: Ship['allegiance'];
} | {
    type: 'remove_ship';
} | null;

type DogfightTab = 'weapons' | 'sensors' | 'engineering' | 'logs';

const factionModels: ShipModel[] = ['Federation', 'Klingon', 'Romulan', 'Pirate', 'Independent'];
const allegiances: Required<Ship>['allegiance'][] = ['player', 'ally', 'enemy', 'neutral'];

const allegianceColors: Record<Required<Ship>['allegiance'], string> = {
    player: 'btn-accent green',
    ally: 'btn-accent sky',
    enemy: 'btn-accent red',
    neutral: 'btn-accent yellow',
};

const createSectorForSim = (templateId: string, seed: string): SectorState => {
    const template = sectorTemplates.find(t => t.id === templateId) || sectorTemplates[0];
    const availablePlanetNames: Record<string, string[]> = JSON.parse(JSON.stringify(planetNames));
    const availableShipNames: Record<string, string[]> = JSON.parse(JSON.stringify(shipNames));
    const colorIndex = { current: 0 };
    const sector = createSectorFromTemplate(template, 'None', availablePlanetNames, availableShipNames, colorIndex, seed);
    sector.entities = sector.entities.filter(e => e.type !== 'ship');
    return sector;
};

const createShipForSim = (shipClass: ShipClassStats, faction: Ship['shipModel'], allegiance: Ship['allegiance'], position: {x:number, y:number}, name: string): Ship => {
    const newShip = createShip(shipClass, faction, position, allegiance, name);
    newShip.scanned = true;
    if (allegiance === 'player' || allegiance === 'ally') {
        newShip.logColor = 'border-blue-400';
    } else if (allegiance === 'enemy') {
        newShip.logColor = 'border-red-400';
    }
    return newShip;
};

const SectorSelectorModal: React.FC<{
    onClose: () => void;
    onSelect: (templateId: string) => void;
}> = ({ onClose, onSelect }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="panel-style h-full w-full max-w-5xl flex flex-col p-4">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-secondary-light">Select Sector Template</h2>
                    <button onClick={onClose} className="btn btn-tertiary">Close</button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                    {sectorTemplates.sort((a, b) => b.weight - a.weight).map(template => (
                        <div 
                            key={template.id} 
                            className="panel-style p-4 cursor-pointer hover:border-accent-yellow transition-colors" 
                            onClick={() => { onSelect(template.id); onClose(); }}
                        >
                            <div className="grid grid-cols-[2fr_1fr] gap-4">
                                <div>
                                    <h4 className="text-xl font-bold text-primary-light">{template.name}</h4>
                                    <p className="text-sm font-bold text-accent-yellow-dark mb-2">{/* Chance description removed for brevity */}</p>
                                    <p className="text-sm text-text-secondary mb-2"><strong>Description:</strong> {templateInfo[template.id]?.description || 'No description available.'}</p>
                                    <p className="text-sm text-text-secondary"><strong>Intent:</strong> {templateInfo[template.id]?.intent || 'No intent specified.'}</p>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-xs font-bold uppercase tracking-wider text-text-disabled mb-1">Sample Layout</p>
                                    <SampleSector template={template} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
);

const parseEvent = (event: string) => {
    if (!event) return null;
    const moveShipMatch = event.match(/^MOVE: '(.+?)' from \((\d+),(\d+)\) to \((\d+),(\d+)\)/);
    if (moveShipMatch) {
        return { type: 'MOVE_SHIP', shipName: moveShipMatch[1], to: { x: parseInt(moveShipMatch[4], 10), y: parseInt(moveShipMatch[5], 10) } };
    }
    
    const launchMatch = event.match(/^LAUNCH TORPEDO: \[(.+?)\] '(.+?)' -> '(.+?)' \[(.+)\]/);
    if (launchMatch) {
        return { type: 'LAUNCH_TORPEDO', torpedoId: launchMatch[1], shipName: launchMatch[2], targetName: launchMatch[3], torpedoName: launchMatch[4] };
    }

    const moveTorpedoMatch = event.match(/^MOVE TORPEDO: \[(.+?)\] from \((\d+),(\d+)\) to \((\d+),(\d+)\)/);
    if (moveTorpedoMatch) {
        return { type: 'MOVE_TORPEDO', torpedoId: moveTorpedoMatch[1], to: { x: parseInt(moveTorpedoMatch[4], 10), y: parseInt(moveTorpedoMatch[5], 10) } };
    }
    const hitMatch = event.match(/^HIT TORPEDO: \[(.+?)\]/);
    if (hitMatch) {
        return { type: 'HIT_TORPEDO', torpedoId: hitMatch[1] };
    }
    const interceptedMatch = event.match(/^INTERCEPTED: \[(.+?)\]/);
    if (interceptedMatch) {
        return { type: 'INTERCEPT_TORPEDO', torpedoId: interceptedMatch[1] };
    }

    const combatMatch = event.match(/^(FIRE PHASER|PD)/);
    if (combatMatch) {
        return { type: 'COMBAT' };
    }
    return null;
};

const ScenarioSimulator: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    // ==================
    // 1. STATE & CORE LOGIC HOOKS
    // ==================
    const { themeName, setTheme } = useTheme();
    const [mode, setMode] = useState<'setup' | 'spectate' | 'dogfight'>('setup');
    const [setupState, setSetupState] = useState<{ ships: Ship[], sectorTemplateId: string, seed: string, sector: SectorState | null }>({
        ships: [],
        sectorTemplateId: 'common-empty-space',
        seed: `sim_${Date.now()}`,
        sector: null,
    });
    const [tool, setTool] = useState<Tool>({
        type: 'add_ship',
        shipClass: shipClasses.Federation['Sovereign-class'],
        faction: 'Federation',
        allegiance: 'player',
    });
    const [showSectorSelector, setShowSectorSelector] = useState(false);
    const [logViewMode, setLogViewMode] = useState<'log' | 'order'>('log');
    const [playOrderIndex, setPlayOrderIndex] = useState(-1);
    const [isDeployedShipsCollapsed, setIsDeployedShipsCollapsed] = useState(true);
    const [availableNames, setAvailableNames] = useState<Record<ShipModel, string[]>>(() => JSON.parse(JSON.stringify(shipNames)));
    const entityRefs = useRef<Record<string, HTMLDivElement | null>>({});
    
    // New state for dogfight tabs
    const [activeDogfightTab, setActiveDogfightTab] = useState<DogfightTab>('weapons');

    const logic = useScenarioLogic(setupState.ships, setupState.sector, mode);
    const {
        gameState, selectedTargetId, isTurnResolving, replayHistory, historyIndex,
        isRunning, setIsRunning, togglePause, endSimulation,
        goToHistoryTurn, onEndTurn
    } = logic;

    // ==================
    // 2. DERIVED STATE & EFFECTS
    // ==================
    
    const isSteppingThroughEvents = useMemo(() => mode === 'spectate' && !isTurnResolving, [mode, isTurnResolving]);
    const currentGameState = useMemo(() => historyIndex >= 0 && historyIndex < replayHistory.length ? replayHistory[historyIndex] : null, [historyIndex, replayHistory]);

    useEffect(() => {
        if (mode === 'setup' && (!setupState.sector || setupState.sector.seed !== setupState.seed)) {
            const newSector = createSectorForSim(setupState.sectorTemplateId, setupState.seed);
            setSetupState(prev => ({ ...prev, sector: newSector }));
        }
    }, [mode, setupState.sectorTemplateId, setupState.seed, setupState.sector]);

    useEffect(() => {
        if (mode === 'spectate' && isRunning && !isTurnResolving && gameState) {
            const eventCount = gameState.turnEvents?.length || 0;
            if (playOrderIndex >= eventCount - 1) {
                if (logViewMode === 'order') {
                    setIsRunning(false);
                    return;
                }
                const nextTurnTimer = setTimeout(() => {
                    if (!isTurnResolving) {
                        setPlayOrderIndex(-1);
                        onEndTurn();
                    }
                }, 500);
                return () => clearTimeout(nextTurnTimer);
            }
            const nextEventIndex = playOrderIndex + 1;
            const nextEvent = gameState.turnEvents?.length && gameState.turnEvents[nextEventIndex];
            let delay = 300;
            if (nextEvent && (nextEvent.startsWith('REGEN:') || nextEvent.startsWith('ENERGY:'))) {
                delay = 30;
            }
            const timer = setTimeout(() => {
                setPlayOrderIndex(prev => prev + 1);
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [mode, isRunning, isTurnResolving, gameState, playOrderIndex, onEndTurn, logViewMode]);
    
    const handleRemoveShip = useCallback((shipId: string) => {
        const shipToRemove = setupState.ships.find(s => s.id === shipId);
        if (!shipToRemove) return;
        setSetupState(p => ({...p, ships: p.ships.filter(s => s.id !== shipId)}));
        const originalNameList = shipNames[shipToRemove.shipModel];
        if (originalNameList && originalNameList.includes(shipToRemove.name)) {
            setAvailableNames(prev => ({
                ...prev,
                [shipToRemove.shipModel]: [...(prev[shipToRemove.shipModel] || []), shipToRemove.name]
            }));
        }
    }, [setupState.ships]);
    
    const handleCellClick = useCallback((pos: { x: number; y: number }) => {
        if (mode !== 'setup') return;
        const existingShipAtPos = setupState.ships.find(s => s.position.x === pos.x && s.position.y === pos.y);
        if (tool?.type === 'add_ship') {
            if (existingShipAtPos) return;
            if (tool.allegiance === 'player' && setupState.ships.some(s => s.allegiance === 'player')) {
                alert("Only one player ship can be added.");
                return;
            }
            const factionNames = availableNames[tool.faction];
            let newShipName: string;
            const updatedFactionNames = [...factionNames];
            if (factionNames.length > 0) {
                const nameIndex = Math.floor(Math.random() * factionNames.length);
                newShipName = factionNames[nameIndex];
                updatedFactionNames.splice(nameIndex, 1);
            } else {
                newShipName = `${tool.faction} Vessel ${uniqueId().substr(-4)}`;
            }
            const newShip = createShipForSim(tool.shipClass, tool.faction, tool.allegiance, pos, newShipName);
            setSetupState(prev => ({ ...prev, ships: [...prev.ships, newShip] }));
            setAvailableNames(prev => ({ ...prev, [tool.faction]: updatedFactionNames }));
            if (tool.allegiance === 'player') {
                setTool(prevTool => {
                    if (prevTool?.type === 'add_ship') {
                        return { ...prevTool, allegiance: 'enemy' };
                    }
                    return prevTool;
                });
            }
        } else if (tool?.type === 'remove_ship') {
            if (existingShipAtPos) {
                handleRemoveShip(existingShipAtPos.id);
            }
        }
    }, [mode, tool, setupState.ships, availableNames, handleRemoveShip]);

    const handleMoveShip = useCallback((shipId: string, newPos: { x: number, y: number }) => {
        setSetupState(prev => {
            const isOccupied = prev.ships.some(s => s.id !== shipId && s.position.x === newPos.x && s.position.y === newPos.y);
            if (isOccupied) return prev;
            const updatedShips = prev.ships.map(ship => 
                ship.id === shipId ? { ...ship, position: newPos } : ship
            );
            return { ...prev, ships: updatedShips };
        });
    }, []);
    
    const handleRefreshSeed = useCallback(() => {
        setSetupState(prev => ({ ...prev, seed: `sim_${Date.now()}` }));
    }, []);

    const handleStart = (simMode: 'spectate' | 'dogfight') => {
        setMode(simMode);
    };
    
    const resetToSetup = () => {
        endSimulation();
        setMode('setup');
        setAvailableNames(JSON.parse(JSON.stringify(shipNames)));
        setPlayOrderIndex(-1);
    };
    
    const handleStepTurn = useCallback((direction: number) => {
        setIsRunning(false);
        setPlayOrderIndex(-1);
        const atEnd = historyIndex >= replayHistory.length - 1;
        if (direction > 0 && atEnd && !isTurnResolving) {
            onEndTurn();
        } else {
            const newIndex = historyIndex + direction;
            if (newIndex >= 0 && newIndex < replayHistory.length) {
                goToHistoryTurn(newIndex);
            }
        }
    }, [historyIndex, replayHistory.length, isTurnResolving, onEndTurn, goToHistoryTurn, setIsRunning]);

    const handleTurnSliderChange = useCallback((index: number) => {
        setIsRunning(false);
        setPlayOrderIndex(-1);
        goToHistoryTurn(index);
    }, [goToHistoryTurn, setIsRunning]);

    const handleStepEvent = useCallback((direction: number) => {
        setIsRunning(false);
        setPlayOrderIndex(prev => {
            const eventCount = currentGameState?.turnEvents?.length || 0;
            if (eventCount === 0) return -1;
            const newIndex = prev + direction;
            return Math.max(-1, Math.min(eventCount - 1, newIndex));
        });
    }, [currentGameState, setIsRunning]);
    
    const handleEventSliderChange = useCallback((index: number) => {
        setIsRunning(false);
        setPlayOrderIndex(index);
    }, [setIsRunning]);

    const handleToggleEventPlay = useCallback(() => {
        if (isRunning) {
            setIsRunning(false);
        } else {
            if (playOrderIndex >= ((currentGameState?.turnEvents?.length || 0) - 1)) {
                setPlayOrderIndex(-1);
            }
            setIsRunning(true);
        }
    }, [isRunning, playOrderIndex, currentGameState, setIsRunning]);

    const playerShip = useMemo(() => currentGameState?.player.ship, [currentGameState]);

    const { entitiesForDisplay, effectsForDisplay } = useMemo(() => {
        if (!currentGameState) { return { entitiesForDisplay: [], effectsForDisplay: [] }; }
        const getFullEntityList = (state: GameState): Entity[] => {
            const entities = [...state.currentSector.entities];
            if (state.player.ship && state.player.ship.id) {
                if (!entities.some(e => e.id === state.player.ship.id)) {
                    entities.push(state.player.ship);
                }
            }
            return entities;
        };
        if (isTurnResolving) {
            const stateBeforeResolving = replayHistory[historyIndex];
            if (stateBeforeResolving) {
                return { entitiesForDisplay: getFullEntityList(stateBeforeResolving), effectsForDisplay: [] };
            }
            return { entitiesForDisplay: getFullEntityList(currentGameState), effectsForDisplay: [] };
        }
        const isReconstructing = isSteppingThroughEvents && playOrderIndex > -1;
        if (isSteppingThroughEvents && playOrderIndex === -1) {
            const previousState = historyIndex > 0 ? replayHistory[historyIndex - 1] : null;
            if (previousState) {
                return { entitiesForDisplay: getFullEntityList(previousState), effectsForDisplay: [] };
            } else {
                const initialEntities = [
                    ...(setupState.ships || []),
                    ...(currentGameState.currentSector?.entities.filter(e => e.type !== 'ship') || [])
                ];
                return { entitiesForDisplay: initialEntities, effectsForDisplay: [] };
            }
        }
        if (isReconstructing) {
            const baseState = historyIndex > 0 ? replayHistory[historyIndex - 1] : { ...currentGameState, currentSector: { ...currentGameState.currentSector, entities: setupState.ships }};
            const turnEvents = currentGameState.turnEvents || [];
            const finalEntities = new Map(currentGameState.currentSector.entities.map(e => [e.id, e]));
            if (currentGameState.player.ship.id) {
                finalEntities.set(currentGameState.player.ship.id, currentGameState.player.ship);
            }
            const entityMap: Map<string, Entity> = new Map(baseState.currentSector.entities.map(e => [e.id, JSON.parse(JSON.stringify(e))]));
            if (baseState.player.ship && baseState.player.ship.id) {
                if (!entityMap.has(baseState.player.ship.id)) {
                    entityMap.set(baseState.player.ship.id, JSON.parse(JSON.stringify(baseState.player.ship)));
                }
            }
            const shipNameToIdMap = new Map((Array.from(finalEntities.values()) as Entity[]).filter((e): e is Ship => e.type === 'ship').map(s => [s.name, s.id]));
            for (let i = 0; i <= playOrderIndex; i++) {
                const eventStr = turnEvents[i];
                const parsed = parseEvent(eventStr);
                if (parsed?.type === 'MOVE_SHIP') {
                    const shipId = shipNameToIdMap.get(parsed.shipName);
                    if (shipId) {
                        const shipToMove = entityMap.get(shipId);
                        if (shipToMove) shipToMove.position = parsed.to;
                    }
                } else if (parsed?.type === 'LAUNCH_TORPEDO') {
                    const torpedoEntityFromFinalState = finalEntities.get(parsed.torpedoId) as TorpedoProjectile | undefined;
                    const launchingShipId = shipNameToIdMap.get(parsed.shipName);
                    const launchingShip = entityMap.get(launchingShipId) as Ship | undefined;
                    if (torpedoEntityFromFinalState && launchingShip) {
                        const newTorpedo: TorpedoProjectile = {
                            ...JSON.parse(JSON.stringify(torpedoEntityFromFinalState)),
                            position: { ...launchingShip.position },
                            path: [{ ...launchingShip.position }],
                        };
                        entityMap.set(parsed.torpedoId, newTorpedo);
                    } else if (launchingShip) {
                        const { torpedoId, targetName, torpedoName } = parsed;
                        const targetId = shipNameToIdMap.get(targetName);
                        const torpedoType = Object.keys(torpedoStats).find(key => torpedoStats[key as TorpedoProjectile['torpedoType']].name === torpedoName) as TorpedoProjectile['torpedoType'] | undefined;
                        if (torpedoType && targetId) {
                            const torpedoConfig = torpedoStats[torpedoType];
                            const reconstructedTorpedo: TorpedoProjectile = {
                                id: torpedoId, name: torpedoName, type: 'torpedo_projectile', faction: launchingShip.faction,
                                position: { ...launchingShip.position }, path: [{ ...launchingShip.position }],
                                targetId: targetId, sourceId: launchingShip.id,
                                stepsTraveled: 0, speed: torpedoConfig.speed, scanned: true, turnLaunched: currentGameState.turn,
                                hull: 1, maxHull: 1,
                                torpedoType: torpedoType, damage: torpedoConfig.damage, specialDamage: torpedoConfig.specialDamage,
                            };
                            entityMap.set(torpedoId, reconstructedTorpedo);
                        }
                    }
                } else if (parsed?.type === 'MOVE_TORPEDO') {
                    const torpedoToMove = entityMap.get(parsed.torpedoId) as TorpedoProjectile | undefined;
                    if (torpedoToMove) {
                        torpedoToMove.position = parsed.to;
                        torpedoToMove.path.push(parsed.to);
                    }
                } else if (parsed?.type === 'HIT_TORPEDO' || parsed?.type === 'INTERCEPT_TORPEDO') {
                    entityMap.delete(parsed.torpedoId);
                }
            }
            const entities: Entity[] = Array.from(entityMap.values());
            let effects: CombatEffect[] = [];
            let effectSliceStart = 0;
            for (let i = 0; i < playOrderIndex; i++) {
                const eventStr = turnEvents[i];
                if (eventStr.startsWith('FIRE PHASER:')) effectSliceStart += 2;
                else if (eventStr.startsWith('PD:')) effectSliceStart += turnEvents[i + 1]?.startsWith('INTERCEPTED:') ? 2 : 1;
                else if (eventStr.startsWith('HIT TORPEDO:')) effectSliceStart += 1;
            }
            const currentEventStr = turnEvents[playOrderIndex];
            if (currentEventStr) {
                if (currentEventStr.startsWith('FIRE PHASER:')) effects = currentGameState.combatEffects.slice(effectSliceStart, effectSliceStart + 2).map(e => ({ ...e, delay: 0 }));
                else if (currentEventStr.startsWith('PD:')) effects = currentGameState.combatEffects.slice(effectSliceStart, effectSliceStart + (turnEvents[playOrderIndex + 1]?.startsWith('INTERCEPTED:') ? 2 : 1)).map(e => ({ ...e, delay: e.delay || 0 }));
                else if (currentEventStr.startsWith('HIT TORPEDO:')) effects = currentGameState.combatEffects.slice(effectSliceStart, effectSliceStart + 1).map(e => ({ ...e, delay: 0 }));
            }
            return { entitiesForDisplay: entities, effectsForDisplay: effects };
        }
        return { entitiesForDisplay: getFullEntityList(currentGameState), effectsForDisplay: currentGameState.combatEffects };
    }, [isSteppingThroughEvents, playOrderIndex, currentGameState, historyIndex, replayHistory, setupState.ships, setupState.sector, isTurnResolving]);

    const gameStateValue = useMemo(() => ({
        gameState: logic.gameState,
        dispatch: () => {},
        selectedTargetId: logic.selectedTargetId,
        navigationTarget: logic.navigationTarget,
        activeAwayMission: null,
        activeHail: null,
        targetEntity: logic.targetEntity,
        playerTurnActions: logic.playerTurnActions,
        activeEvent: null,
        isWarping: false,
        isTurnResolving: logic.isTurnResolving,
        awayMissionResult: null,
        eventResult: null,
        desperationMoveAnimation: logic.desperationMoveAnimation,
    }), [logic]);

    const gameActionsValue = useMemo(() => ({
        ...logic,
        handleExitToMainMenu: onExit,
        onStartAwayMission: () => {}, onChooseAwayMissionOption: () => {}, onHailTarget: async () => {},
        onCloseHail: () => {}, onChooseEventOption: () => {}, saveGame: () => {}, loadGame: () => {},
        exportSave: () => {}, importSave: () => {}, onDistributeEvenly: () => {}, onSendAwayTeam: () => {},
        onCloseAwayMissionResult: () => {}, onCloseEventResult: () => {}, onScanQuadrant: () => {},
        onEnterOrbit: () => {}, onWarp: () => {}, onDockWithStarbase: () => {}, onUndock: () => {},
        newGame: () => {}, handleNewGame: () => {}, handleLoadGame: () => {}, handleImportSaveFromFile: () => {},
        handleFileChange: () => {}, handleImportClick: () => {}, handleStartSimulator: () => {},
        onSetView: () => {}, onScanTarget: () => {}, onInitiateRetreat: () => {}, onCancelRetreat: () => {},
    }), [logic, onExit]);

    const uiStateValue = useMemo(() => ({
        view: 'game' as const, setView: () => {},
        showGameMenu: false, setShowGameMenu: () => {}, showPlayerManual: false, setShowPlayerManual: () => {},
        showLogModal: false, setShowLogModal: () => {},
        showReplayer: false, setShowReplayer: () => {}, showChangelog: false, setShowChangelog: () => {},
        themeName, setTheme, isTouchDevice: false, isResizing: false, setIsResizing: () => {},
        sidebarWidth: 320, setSidebarWidth: () => {}, bottomPanelHeight: 288, setBottomPanelHeight: () => {},
        fileInputRef: { current: null }, hasSaveGame: false, hasReplay: false,
        entityRefs: entityRefs,
        currentView: 'sector' as const, showMobileSidebar: false, setShowMobileSidebar: () => {},
    }), [themeName]);
    
    const TabButton: React.FC<{ id: DogfightTab; label: string; icon: React.ReactNode }> = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveDogfightTab(id)}
            className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 px-1 text-xs md:text-sm font-bold uppercase tracking-wider transition-all
                ${activeDogfightTab === id 
                    ? 'bg-secondary-main text-secondary-text shadow-[inset_0_-4px_0_0_rgba(0,0,0,0.3)]' 
                    : 'bg-bg-paper hover:bg-bg-paper-lighter text-text-secondary border-b-4 border-transparent'
                }`}
        >
            {icon}
            <span className="hidden md:inline">{label}</span>
        </button>
    );
    
    const getEndTurnButtonText = () => {
        if(!currentGameState || !currentGameState.player.ship.id) return "End Turn";
        const ship = currentGameState.player.ship;
        
        if (ship.isStunned) return "Systems Stunned";
        if (isTurnResolving) return "Resolving...";

        const isMoving = logic.navigationTarget && (ship.position.x !== logic.navigationTarget.x || ship.position.y !== logic.navigationTarget.y);
        const isFiring = !!logic.playerTurnActions.firedWeaponId;

        if (isFiring && isMoving) return "Fire & Move";
        if (isFiring) return "Fire";
        if (isMoving) return "Engage Engines";

        return "End Turn";
    }


    if (mode === 'setup') {
        if (!setupState.sector) return <div>Loading Sector...</div>;
        const currentTemplate = sectorTemplates.find(t => t.id === setupState.sectorTemplateId);
        return (
            <div className="h-screen w-screen bg-bg-default text-text-primary p-4 flex flex-col gap-4">
                {showSectorSelector && <SectorSelectorModal onClose={() => setShowSectorSelector(false)} onSelect={(id) => setSetupState(prev => ({...prev, sectorTemplateId: id}))} />}
                <header className="flex-shrink-0 flex justify-between items-center panel-style p-2">
                    <h1 className="text-2xl font-bold text-secondary-light">Scenario Simulator Setup</h1>
                    <button onClick={onExit} className="btn btn-tertiary">Exit to Main Menu</button>
                </header>
                <main className="flex-grow grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-4 min-h-0">
                    <div className="flex flex-col gap-4 min-h-0">
                        <div className="panel-style p-2 flex gap-4 items-center">
                            <label className="font-bold flex-shrink-0">Sector Type:</label>
                            <button onClick={() => setShowSectorSelector(true)} className="btn btn-secondary flex-grow text-left">
                                {currentTemplate?.name || 'Select Sector'}
                            </button>
                            <button onClick={handleRefreshSeed} className="btn btn-tertiary">
                                Refresh
                            </button>
                        </div>
                        <div className="relative flex-grow flex justify-center items-center min-h-0">
                             <div className="w-full h-full relative">
                                <SectorView
                                    sector={setupState.sector}
                                    entities={[...setupState.ships, ...(setupState.sector?.entities.filter(e => e.type !== 'ship') || [])]}
                                    playerShip={null}
                                    selectedTargetId={null}
                                    onSelectTarget={() => {}}
                                    navigationTarget={null}
                                    onSetNavigationTarget={() => {}}
                                    onCellClick={handleCellClick}
                                    onMoveShip={handleMoveShip}
                                    spectatorMode={true}
                                />
                            </div>
                        </div>
                    </div>
                    <aside className="flex flex-col gap-4 min-h-0">
                        <div className="panel-style p-3">
                            <h2 className="text-lg font-bold text-secondary-light mb-2">Allegiance</h2>
                             <div className="grid grid-cols-2 gap-2">
                                {allegiances.map(a => {
                                    const isActive = tool?.type === 'add_ship' && tool.allegiance === a;
                                    const buttonClasses = `w-full btn text-sm capitalize ${allegianceColors[a]} ${isActive ? 'btn-allegiance-active' : 'btn-allegiance-inactive'}`;
                                    return (
                                        <button 
                                            key={a}
                                            onClick={() => {
                                                setTool(prev => {
                                                    if (prev?.type === 'add_ship') {
                                                        return { ...prev, allegiance: a };
                                                    }
                                                    return {
                                                        type: 'add_ship',
                                                        shipClass: shipClasses.Federation['Sovereign-class'],
                                                        faction: 'Federation',
                                                        allegiance: a,
                                                    };
                                                });
                                            }}
                                            className={buttonClasses}
                                        >
                                            {a}
                                        </button>
                                    );
                                })}
                                 <button
                                    onClick={() => setTool({ type: 'remove_ship'})}
                                    className={`w-full btn text-sm btn-tertiary col-span-2 flex items-center justify-center gap-2 ${tool?.type === 'remove_ship' ? 'btn-allegiance-active' : 'btn-allegiance-inactive'}`}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                    Remove Ship
                                </button>
                             </div>
                        </div>
                        <div className="panel-style p-3 flex-grow min-h-0 flex flex-col">
                            <h2 className="text-lg font-bold text-secondary-light mb-2 flex-shrink-0">Ship Registry</h2>
                            <div className="flex-grow min-h-0 overflow-y-auto pr-2">
                                {factionModels.map(faction => (
                                    <div key={faction}>
                                        <h3 className="font-bold text-primary-light mt-2">{faction}</h3>
                                        {Object.values(shipClasses[faction]).map(shipClass => {
                                            const visualConfig = shipVisuals[faction]?.classes[shipClass.name];
                                            const Icon = visualConfig?.icon;
                                            return (
                                            <button 
                                                key={shipClass.name}
                                                onClick={() => setTool(prev => ({
                                                    type: 'add_ship',
                                                    shipClass,
                                                    faction,
                                                    allegiance: (prev?.type === 'add_ship' ? prev.allegiance : 'enemy')
                                                }))}
                                                className={`w-full text-left p-1 rounded hover:bg-bg-paper-lighter flex items-center gap-2 ${tool?.type === 'add_ship' && tool.shipClass.name === shipClass.name ? 'bg-bg-paper-lighter' : ''}`}
                                            >
                                                {Icon && <Icon className="w-9 h-9 flex-shrink-0" />}
                                                <span className="truncate">{shipClass.name}</span>
                                            </button>
                                        )})}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="panel-style p-3 flex-shrink-0">
                            <button
                                onClick={() => setIsDeployedShipsCollapsed(prev => !prev)}
                                className="w-full flex justify-between items-center text-lg font-bold text-secondary-light"
                                aria-expanded={!isDeployedShipsCollapsed}
                                aria-controls="deployed-ships-list"
                            >
                                <span>Deployed Ships ({setupState.ships.length})</span>
                                <svg className={`w-5 h-5 transition-transform duration-200 ${isDeployedShipsCollapsed ? '-rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {!isDeployedShipsCollapsed && (
                                <div id="deployed-ships-list" className="max-h-32 overflow-y-auto text-sm mt-2 border-t border-border-dark pt-2">
                                    {setupState.ships.length === 0 ? (
                                        <p className="text-text-disabled italic text-center">No ships deployed.</p>
                                    ) : (
                                        setupState.ships.map(s => (
                                            <div key={s.id} className="flex justify-between items-center p-1 hover:bg-bg-paper-lighter rounded">
                                                <span className="truncate">{s.name} ({s.allegiance})</span>
                                                <button
                                                    onClick={() => handleRemoveShip(s.id)}
                                                    className="text-red-500 font-bold ml-2 px-2"
                                                    aria-label={`Remove ${s.name}`}
                                                >
                                                    X
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => handleStart('spectate')} className="w-full btn btn-primary">Start Spectate</button>
                            <button onClick={() => handleStart('dogfight')} className="w-full btn btn-primary" disabled={!setupState.ships.some(s => s.allegiance === 'player')}>Start Dogfight</button>
                        </div>
                    </aside>
                </main>
            </div>
        );
    }
    
    if (!gameState || !currentGameState) {
        return <div>Loading Simulation...</div>;
    }

    return (
        <GameStateProvider value={gameStateValue}>
        <GameActionsProvider value={gameActionsValue}>
        <UIStateProvider value={uiStateValue}>
            <div className="h-screen w-screen bg-bg-default text-text-primary flex flex-col overflow-hidden">
                <header className="flex-shrink-0 flex justify-between items-center panel-style p-2 mx-2 mt-2">
                    <h1 className="text-xl font-bold text-secondary-light">Sim: {mode.toUpperCase()}</h1>
                    <div className="flex items-center gap-4">
                        {mode === 'spectate' && <span className="font-bold">Turn: {currentGameState.turn}</span>}
                        <button onClick={resetToSetup} className="btn btn-tertiary text-sm py-1">End</button>
                    </div>
                </header>
                
                <main className="flex-grow flex flex-col md:flex-row min-h-0 p-2 gap-2">
                    {mode === 'dogfight' && currentGameState.player.ship.id ? (
                        <>
                            {/* Left: Tactical Map (Always Visible) */}
                            <div className="flex-grow relative bg-black border-r-2 border-border-dark min-h-0 flex flex-col">
                                 <div className="flex-grow relative">
                                    <div className="w-full h-full relative">
                                        <CombatFXLayer effects={effectsForDisplay} entities={entitiesForDisplay} entityRefs={entityRefs} />
                                        {logic.desperationMoveAnimation && <DesperationMoveAnimation animation={logic.desperationMoveAnimation} />}
                                        <SectorView showTacticalOverlay={true} />
                                    </div>
                                </div>
                            </div>

                            {/* Right: Sidebar */}
                            <div className="flex-shrink-0 w-full md:w-[400px] flex flex-col border-l-2 border-border-dark bg-bg-paper min-h-0">
                                <nav className="flex-shrink-0 flex border-b-2 border-border-dark bg-bg-paper-lighter">
                                    <TabButton id="weapons" label="Weapons" icon={<WeaponIcon className="w-5 h-5" />} />
                                    <TabButton id="sensors" label="Sensors" icon={<ScienceIcon className="w-5 h-5" />} />
                                    <TabButton id="engineering" label="Eng" icon={<EngineeringIcon className="w-5 h-5" />} />
                                    <TabButton id="logs" label="Log" icon={<LogIcon className="w-5 h-5" />} />
                                </nav>

                                <div className="flex-grow overflow-hidden relative">
                                    {activeDogfightTab === 'weapons' && (
                                        <div className="h-full overflow-y-auto p-2">
                                            <CommandConsole showEndTurnButton={false} />
                                        </div>
                                    )}
                                    {activeDogfightTab === 'sensors' && (
                                        <div className="h-full overflow-y-auto p-0">
                                            <SimulatorShipDetailPanel selectedEntity={logic.targetEntity || null} themeName={themeName} turn={currentGameState.turn} gameState={currentGameState} />
                                        </div>
                                    )}
                                    {activeDogfightTab === 'engineering' && (
                                        <div className="h-full overflow-y-auto p-0">
                                            <ShipStatus className="border-none" />
                                        </div>
                                    )}
                                    {activeDogfightTab === 'logs' && (
                                        <div className="h-full p-0">
                                            <LogPanel logs={currentGameState.logs} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : ( // Spectate mode layout
                         <div className="w-full h-full flex flex-col md:flex-row gap-2">
                            <div className="flex-grow flex flex-col gap-2 min-h-0">
                                <div className="relative flex-grow min-h-0 border border-border-dark">
                                    <div className="w-full h-full relative">
                                        <CombatFXLayer effects={effectsForDisplay} entities={entitiesForDisplay} entityRefs={entityRefs} />
                                        {logic.desperationMoveAnimation && <DesperationMoveAnimation animation={logic.desperationMoveAnimation} />}
                                        <SectorView
                                            sector={currentGameState.currentSector}
                                            entities={entitiesForDisplay}
                                            playerShip={playerShip}
                                            selectedTargetId={selectedTargetId}
                                            onSelectTarget={logic.onSelectTarget}
                                            spectatorMode={true}
                                            showTacticalOverlay={true}
                                        />
                                    </div>
                                </div>
                                {logViewMode !== 'order' && (
                                    <PlaybackControls
                                        currentIndex={historyIndex}
                                        maxIndex={replayHistory.length - 1}
                                        isPlaying={isRunning}
                                        isTurnResolving={isTurnResolving}
                                        onTogglePlay={togglePause}
                                        onStep={handleStepTurn}
                                        onSliderChange={handleTurnSliderChange}
                                        allowStepPastEnd={true}
                                    />
                                )}
                            </div>
                            <aside className="w-full md:w-1/3 flex flex-col gap-2 min-h-0">
                                <div className={`flex-grow min-h-0 ${logic.targetEntity ? 'basis-1/2' : ''}`}>
                                     <LogPanel
                                        logs={currentGameState.logs}
                                        allShips={currentGameState.currentSector.entities.filter(e => e.type === 'ship') as Ship[]}
                                        isSpectateMode={true}
                                        turn={currentGameState.turn}
                                        playOrderEvents={currentGameState.turnEvents || []}
                                        playOrderIndex={playOrderIndex}
                                        onViewModeChange={setLogViewMode}
                                        playbackControls={{
                                            currentIndex: historyIndex,
                                            maxIndex: replayHistory.length - 1,
                                            isPlaying: isRunning,
                                            isTurnResolving: isTurnResolving,
                                            onTogglePlay: togglePause,
                                            onStep: handleStepTurn,
                                            onSliderChange: handleTurnSliderChange,
                                        }}
                                        eventPlaybackControls={{
                                            currentIndex: playOrderIndex,
                                            maxIndex: (currentGameState.turnEvents?.length || 1) - 1,
                                            isPlaying: isRunning,
                                            onTogglePlay: handleToggleEventPlay,
                                            onStep: handleStepEvent,
                                            onSliderChange: handleEventSliderChange,
                                        }}
                                    />
                                </div>
                                {logic.targetEntity ? (
                                    <div className="basis-1/2 flex-shrink min-h-0 overflow-y-auto">
                                        <SimulatorShipDetailPanel selectedEntity={logic.targetEntity} themeName={themeName} turn={currentGameState.turn} gameState={currentGameState} />
                                    </div>
                                ) : null}
                            </aside>
                        </div>
                    )}
                </main>
                
                {mode === 'dogfight' && (
                    <footer className="flex-shrink-0 h-16 bg-bg-paper border-t-2 border-border-dark flex items-center px-4 gap-4 z-30">
                         <div className="flex-grow min-w-0 h-full py-2">
                            <StatusLine>
                                <ThemeSwitcher themeName={themeName} setTheme={setTheme} />
                            </StatusLine>
                         </div>
                         <div className="flex-shrink-0 h-full py-2">
                            <button
                                onClick={() => onEndTurn()}
                                disabled={isTurnResolving || (!!logic.navigationTarget && currentGameState.player.ship.subsystems.engines.health < currentGameState.player.ship.subsystems.engines.maxHealth * 0.5) || currentGameState.player.ship.isStunned}
                                className="btn btn-primary h-full px-8 text-lg uppercase tracking-widest shadow-lg flex items-center justify-center"
                            >
                                {getEndTurnButtonText()}
                            </button>
                         </div>
                    </footer>
                )}
            </div>
        </UIStateProvider>
        </GameActionsProvider>
        </GameStateProvider>
    );
};

export default ScenarioSimulator;