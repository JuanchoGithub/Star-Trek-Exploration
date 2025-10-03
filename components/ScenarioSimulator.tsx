
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useScenarioLogic } from '../hooks/useScenarioLogic';
import type { Ship, ShipModel, SectorState, LogEntry, SectorTemplate, Entity, AmmoType, CombatEffect, TorpedoProjectile, BeamWeapon } from '../types';
import { shipClasses, ShipClassStats } from '../assets/ships/configs/shipClassStats';
import { sectorTemplates } from '../assets/galaxy/sectorTemplates';
import SectorView from './SectorView';
import LogPanel from './LogPanel';
import PlayerHUD from './PlayerHUD';
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
import { WEAPON_PHASER_TYPE_IV, WEAPON_PHASER_TYPE_V, WEAPON_PHASER_TYPE_VI, WEAPON_PHASER_TYPE_VII, WEAPON_PHASER_TYPE_VIII, WEAPON_PHASER_TYPE_IX, WEAPON_PHASER_TYPE_X } from '../assets/weapons/weaponRegistry';

type Tool = {
    type: 'add_ship';
    shipClass: ShipClassStats;
    faction: ShipModel;
    allegiance: Ship['allegiance'];
} | {
    type: 'remove_ship';
} | null;

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
    const launchMatch = event.match(/^LAUNCH TORPEDO: \[(.+?)\] '(.+?)' ->/);
    if (launchMatch) {
        return { type: 'LAUNCH_TORPEDO', torpedoId: launchMatch[1], shipName: launchMatch[2] };
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
    const { themeName } = useTheme();
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
    const [showLogModal, setShowLogModal] = useState(false);
    const [logViewMode, setLogViewMode] = useState<'log' | 'order'>('log');
    const [playOrderIndex, setPlayOrderIndex] = useState(-1);
    const [isDeployedShipsCollapsed, setIsDeployedShipsCollapsed] = useState(true);
    const [availableNames, setAvailableNames] = useState<Record<ShipModel, string[]>>(() => JSON.parse(JSON.stringify(shipNames)));
    const entityRefs = useRef<Record<string, HTMLDivElement | null>>({});
    
    const {
        gameState, selectedTargetId, navigationTarget, playerTurnActions, isTurnResolving, desperationMoveAnimation,
        isRunning, setIsRunning, togglePause, endSimulation, setGameState,
        onEvasiveManeuvers, onSelectRepairTarget, onToggleRedAlert,
        replayHistory, historyIndex, goToHistoryTurn, resumeFromHistory, onFireWeapon, onSelectSubsystem, onToggleCloak, onTogglePointDefense, targetEntity, onEnergyChange, onEndTurn, onSelectTarget, onSetNavigationTarget
    } = useScenarioLogic(setupState.ships, setupState.sector, mode);
    
    const isSteppingThroughEvents = mode === 'spectate' && !isTurnResolving;

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
                const nextTurnTimer = setTimeout(() => {
                    if (!isTurnResolving) {
                        setPlayOrderIndex(-1);
                        onEndTurn();
                    }
                }, 500);
                return () => clearTimeout(nextTurnTimer);
            }

            const nextEventIndex = playOrderIndex + 1;
            const nextEvent = gameState.turnEvents?.[nextEventIndex];
            let delay = 300;
            if (nextEvent && (nextEvent.startsWith('REGEN:') || nextEvent.startsWith('ENERGY:'))) {
                delay = 30;
            }

            const timer = setTimeout(() => {
                setPlayOrderIndex(prev => prev + 1);
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [mode, isRunning, isTurnResolving, gameState, playOrderIndex, onEndTurn]);
    
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
    }, [mode, tool, setupState.ships, availableNames]);

    const handleMoveShip = useCallback((shipId: string, newPos: { x: number, y: number }) => {
        setSetupState(prev => {
            const isOccupied = prev.ships.some(s => s.id !== shipId && s.position.x === newPos.x && s.position.y === newPos.y);
            if (isOccupied) {
                return prev;
            }
            const updatedShips = prev.ships.map(ship => 
                ship.id === shipId ? { ...ship, position: newPos } : ship
            );
            return { ...prev, ships: updatedShips };
        });
    }, []);
    
    const handleRemoveShip = useCallback((shipId: string) => {
        const shipToRemove = setupState.ships.find(s => s.id === shipId);
        if (!shipToRemove) return;

        setSetupState(p => ({...p, ships: p.ships.filter(s => s.id !== shipId)}));

        // Add name back to pool if it's a pre-defined one
        const originalNameList = shipNames[shipToRemove.shipModel];
        if (originalNameList && originalNameList.includes(shipToRemove.name)) {
            setAvailableNames(prev => ({
                ...prev,
                [shipToRemove.shipModel]: [...(prev[shipToRemove.shipModel] || []), shipToRemove.name]
            }));
        }
    }, [setupState.ships]);
    
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
    
    const handleStep = useCallback((direction: number) => {
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
    }, [historyIndex, replayHistory.length, isTurnResolving, onEndTurn, goToHistoryTurn]);

    const handleSliderChange = useCallback((index: number) => {
        setIsRunning(false);
        setPlayOrderIndex(-1);
        goToHistoryTurn(index);
    }, [goToHistoryTurn]);

    const currentGameState = historyIndex >= 0 && historyIndex < replayHistory.length ? replayHistory[historyIndex] : null;

    const { entitiesForDisplay, effectsForDisplay } = useMemo(() => {
        if (!currentGameState) { return { entitiesForDisplay: [], effectsForDisplay: [] }; }

        if (isTurnResolving) {
            const previousState = replayHistory[historyIndex - 1];
            if (previousState) {
                return { entitiesForDisplay: [...previousState.currentSector.entities], effectsForDisplay: [] };
            }
            return { entitiesForDisplay: [...setupState.ships, ...currentGameState.currentSector.entities.filter(e => e.type !== 'ship')], effectsForDisplay: [] };
        }
    
        const isReconstructing = isSteppingThroughEvents && playOrderIndex > -1;

        if (isSteppingThroughEvents && playOrderIndex === -1) {
            const baseState = historyIndex > 0 ? replayHistory[historyIndex - 1] : { ...currentGameState, currentSector: { ...currentGameState.currentSector, entities: setupState.ships }};
            return { entitiesForDisplay: [...baseState.currentSector.entities], effectsForDisplay: [] };
        }
    
        if (isReconstructing) {
            const baseState = historyIndex > 0 ? replayHistory[historyIndex - 1] : { ...currentGameState, currentSector: { ...currentGameState.currentSector, entities: setupState.ships }};
            const turnEvents = currentGameState.turnEvents || [];
            
            const finalEntities = new Map(currentGameState.currentSector.entities.map(e => [e.id, e]));
            if (currentGameState.player.ship.id) {
                finalEntities.set(currentGameState.player.ship.id, currentGameState.player.ship);
            }
    
            const entityMap: Map<string, Entity> = new Map(baseState.currentSector.entities.map(e => [e.id, JSON.parse(JSON.stringify(e))]));
            if (baseState.player.ship.id) {
                entityMap.set(baseState.player.ship.id, JSON.parse(JSON.stringify(baseState.player.ship)));
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
                } else if (parsed?.type === 'LAUNCH_TORPEDO' && parsed.shipName) {
                    const torpedoEntityFromFinalState = finalEntities.get(parsed.torpedoId) as TorpedoProjectile | undefined;
                    const launchingShipId = shipNameToIdMap.get(parsed.shipName);

                    if (torpedoEntityFromFinalState && launchingShipId) {
                        const launchingShip = entityMap.get(launchingShipId) as Ship | undefined;
                        if (launchingShip) {
                            const newTorpedo: TorpedoProjectile = {
                                ...JSON.parse(JSON.stringify(torpedoEntityFromFinalState)),
                                position: { ...launchingShip.position },
                                path: [{ ...launchingShip.position }],
                            };
                            entityMap.set(parsed.torpedoId, newTorpedo);
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
    
        return { entitiesForDisplay: [...currentGameState.currentSector.entities], effectsForDisplay: currentGameState.combatEffects };
    }, [isSteppingThroughEvents, playOrderIndex, currentGameState, historyIndex, replayHistory, setupState.ships, isTurnResolving]);


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
                             <div className="w-full h-full aspect-[11/10] relative">
                                <SectorView
                                    sector={setupState.sector}
                                    entities={setupState.ships}
                                    playerShip={null as any}
                                    selectedTargetId={null}
                                    onSelectTarget={() => {}}
                                    navigationTarget={null}
                                    onSetNavigationTarget={() => {}}
                                    themeName={themeName}
                                    onCellClick={handleCellClick}
                                    onMoveShip={handleMoveShip}
                                    spectatorMode={true}
                                    entityRefs={entityRefs}
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

    const playerShip = currentGameState.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;
    const isViewingHistory = historyIndex < replayHistory.length - 1;

    return (
        <div className="h-screen w-screen bg-bg-default text-text-primary p-4 flex flex-col gap-4">
             <header className="flex-shrink-0 flex justify-between items-center panel-style p-2">
                <h1 className="text-2xl font-bold text-secondary-light">Simulation Running: {mode.toUpperCase()}</h1>
                <div className="flex items-center gap-4">
                    {mode === 'spectate' && <span className="font-bold text-lg">Turn: {currentGameState.turn}</span>}
                    <button onClick={resetToSetup} className="btn btn-tertiary">End Simulation</button>
                </div>
            </header>
            <main className="flex-grow grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 min-h-0">
                {mode === 'dogfight' && playerShip ? (
                     <>
                        <div className="grid grid-rows-[1fr_auto] gap-4 min-h-0">
                             <div className="relative flex-grow flex justify-center items-center min-h-0">
                                <div className="w-full h-full aspect-[11/10] relative">
                                    <CombatFXLayer effects={effectsForDisplay} entities={entitiesForDisplay} entityRefs={entityRefs} />
                                    {desperationMoveAnimation && <DesperationMoveAnimation animation={desperationMoveAnimation} />}
                                    <SectorView
                                        sector={currentGameState.currentSector}
                                        entities={entitiesForDisplay.filter(e => e.id !== playerShip.id)}
                                        playerShip={playerShip}
                                        selectedTargetId={selectedTargetId}
                                        onSelectTarget={onSelectTarget}
                                        navigationTarget={navigationTarget}
                                        onSetNavigationTarget={onSetNavigationTarget}
                                        themeName={themeName}
                                        entityRefs={entityRefs}
                                        showTacticalOverlay={true}
                                    />
                                </div>
                            </div>
                            <PlayerHUD
                                gameState={{...currentGameState, player: {...currentGameState.player, ship: playerShip}}}
                                onEndTurn={onEndTurn}
                                onFireWeapon={onFireWeapon}
                                target={targetEntity} isDocked={false} onDockWithStarbase={() => {}} onUndock={() => {}}
                                onScanTarget={() => {}} onInitiateRetreat={() => {}} onCancelRetreat={() => {}} onStartAwayMission={() => {}} onHailTarget={() => {}}
                                playerTurnActions={playerTurnActions} navigationTarget={navigationTarget} isTurnResolving={isTurnResolving} onSendAwayTeam={() => {}} themeName={themeName}
                                desperationMoveAnimation={desperationMoveAnimation} selectedSubsystem={null} onSelectSubsystem={onSelectSubsystem} onEnterOrbit={() => {}}
                                orbitingPlanetId={null} onToggleCloak={onToggleCloak}
                                isViewingHistory={isViewingHistory}
                                historyIndex={historyIndex}
                                onResumeFromHistory={resumeFromHistory}
                                onStepHistory={handleStep}
                            />
                        </div>
                        <aside className="w-80 flex flex-col gap-2 min-h-0">
                            <div className="flex-grow min-h-0 flex flex-col gap-2">
                                <div className="basis-1/2 flex-shrink min-h-0">
                                    <ShipStatus
                                        gameState={{...currentGameState, player: {...currentGameState.player, ship: playerShip}}}
                                        onEnergyChange={onEnergyChange} onToggleRedAlert={onToggleRedAlert} onEvasiveManeuvers={onEvasiveManeuvers} onSelectRepairTarget={onSelectRepairTarget as any}
                                        onToggleCloak={onToggleCloak} onTogglePointDefense={onTogglePointDefense} themeName={themeName}
                                    />
                                </div>
                                <div className="basis-1/2 flex-shrink min-h-0">
                                    <SimulatorShipDetailPanel selectedEntity={targetEntity} themeName={themeName} turn={currentGameState.turn} gameState={currentGameState} />
                                </div>
                            </div>
                            <div className="flex-shrink-0 panel-style p-2">
                                <button onClick={() => setShowLogModal(true)} className="btn btn-primary w-full">Show Log</button>
                            </div>
                            {showLogModal && (
                                <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col z-50 p-4" onClick={() => setShowLogModal(false)}>
                                    <div className="panel-style p-4 w-full max-w-4xl mx-auto flex-grow min-h-0 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                                        <LogPanel logs={currentGameState.logs} onClose={() => setShowLogModal(false)} />
                                    </div>
                                </div>
                            )}
                        </aside>
                    </>
                ) : ( // Spectate mode
                    <>
                        <div className="flex flex-col gap-4 min-h-0">
                            <div className="relative flex-grow flex justify-center items-center min-h-0">
                                <div className="w-full h-full aspect-[11/10] relative">
                                    <CombatFXLayer effects={effectsForDisplay} entities={entitiesForDisplay} entityRefs={entityRefs} />
                                    {desperationMoveAnimation && <DesperationMoveAnimation animation={desperationMoveAnimation} />}
                                    <SectorView
                                        sector={currentGameState.currentSector}
                                        entities={entitiesForDisplay}
                                        playerShip={null as any}
                                        selectedTargetId={selectedTargetId}
                                        onSelectTarget={onSelectTarget}
                                        navigationTarget={null}
                                        onSetNavigationTarget={() => {}}
                                        themeName={themeName}
                                        spectatorMode={true}
                                        entityRefs={entityRefs}
                                        showTacticalOverlay={true}
                                    />
                                </div>
                            </div>
                             <PlaybackControls
                                currentIndex={historyIndex}
                                maxIndex={replayHistory.length - 1}
                                isPlaying={isRunning}
                                isTurnResolving={isTurnResolving}
                                onTogglePlay={togglePause}
                                onStep={handleStep}
                                onSliderChange={handleSliderChange}
                                allowStepPastEnd={true}
                            />
                        </div>
                        <aside className="flex flex-col gap-2 min-h-0">
                             {targetEntity ? (
                                <div className="basis-1/2 flex-shrink min-h-0">
                                    <SimulatorShipDetailPanel selectedEntity={targetEntity} themeName={themeName} turn={currentGameState.turn} gameState={currentGameState} />
                                </div>
                            ) : null}
                            <div className={`flex-grow min-h-0 ${targetEntity ? 'basis-1/2' : ''}`}>
                                <LogPanel
                                    logs={logViewMode === 'log' ? currentGameState.logs : []}
                                    allShips={currentGameState.currentSector.entities.filter(e => e.type === 'ship') as Ship[]}
                                    isSpectateMode={true}
                                    turn={currentGameState.turn}
                                    playOrderEvents={logViewMode === 'order' ? (currentGameState.turnEvents || []) : undefined}
                                    playOrderIndex={playOrderIndex}
                                />
                            </div>
                            <div className="flex-shrink-0 panel-style p-2">
                                <button onClick={() => setLogViewMode(prev => prev === 'log' ? 'order' : 'log')} className="btn btn-primary w-full">
                                    {logViewMode === 'log' ? `Show Execution Order (Turn ${currentGameState.turn})` : 'Show Full Combat Log'}
                                </button>
                            </div>
                        </aside>
                    </>
                )}
            </main>
        </div>
    );
};

export default ScenarioSimulator;
