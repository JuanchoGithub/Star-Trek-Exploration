import React, { useState, useCallback, useEffect } from 'react';
import { useScenarioLogic } from '../hooks/useScenarioLogic';
import type { Ship, ShipModel, SectorState, LogEntry, SectorTemplate, Entity } from '../types';
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
import { createSectorFromTemplate } from '../game/state/initialization';
import { uniqueId } from '../game/utils/ai';
import { planetNames } from '../assets/planets/configs/planetNames';
import { shipNames } from '../assets/ships/configs/shipNames';
import SimulatorShipDetailPanel from './SimulatorShipDetailPanel';
import CombatFXLayer from './CombatFXLayer';
import DesperationMoveAnimation from './DesperationMoveAnimation';
import PlaybackControls from './PlaybackControls';

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
    const newShip: Ship = {
        id: uniqueId(), name, type: 'ship', shipModel: faction,
        shipClass: shipClass.name, shipRole: shipClass.role, faction: faction, position, hull: shipClass.maxHull,
        maxHull: shipClass.maxHull, shields: 0, maxShields: shipClass.maxShields,
        energy: { current: shipClass.energy.max, max: shipClass.energy.max },
        energyAllocation: { weapons: 34, shields: 33, engines: 33 },
        torpedoes: { current: shipClass.torpedoes.max, max: shipClass.torpedoes.max },
        subsystems: JSON.parse(JSON.stringify(shipClass.subsystems)),
        securityTeams: { current: shipClass.securityTeams.max, max: shipClass.securityTeams.max },
        dilithium: { current: shipClass.dilithium.max, max: shipClass.dilithium.max }, scanned: true, evasive: false, retreatingTurn: null,
        crewMorale: { current: 100, max: 100 }, repairTarget: null, logColor: 'border-gray-400',
        lifeSupportReserves: { current: 100, max: 100 }, cloakState: 'visible', cloakCooldown: 0,
        isStunned: false, engineFailureTurn: null, lifeSupportFailureTurn: null,
        isDerelict: false, captureInfo: null, pointDefenseEnabled: false, statusEffects: [],
        allegiance, cloakingCapable: shipClass.cloakingCapable,
        energyModifier: shipClass.energyModifier,
        shieldReactivationTurn: null,
        cloakInstability: 0,
        cloakDestabilizedThisTurn: false,
        cloakTransitionTurnsRemaining: null,
        lastAttackerPosition: null,
    };
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
    const [availableNames, setAvailableNames] = useState<Record<ShipModel, string[]>>(() => JSON.parse(JSON.stringify(shipNames)));
    
    useEffect(() => {
        if (mode === 'setup') {
            const newSector = createSectorForSim(setupState.sectorTemplateId, setupState.seed);
            setSetupState(prev => ({ ...prev, sector: newSector }));
        }
    }, [mode, setupState.sectorTemplateId, setupState.seed]);

    const {
        gameState, selectedTargetId, navigationTarget, playerTurnActions, isTurnResolving, desperationMoveAnimation,
        onEnergyChange, onEndTurn, onFirePhasers, onLaunchTorpedo, onSelectTarget, onSetNavigationTarget,
        onSelectSubsystem, onToggleCloak, onTogglePointDefense, targetEntity,
        isRunning, togglePause, endSimulation, setGameState,
        onEvasiveManeuvers, onSelectRepairTarget, onToggleRedAlert,
        replayHistory, historyIndex, goToHistoryTurn, resumeFromHistory,
    } = useScenarioLogic(setupState.ships, setupState.sector, mode);

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

        } else if (tool?.type === 'remove_ship') {
            if (existingShipAtPos) {
                setSetupState(prev => ({ ...prev, ships: prev.ships.filter(s => s.id !== existingShipAtPos.id) }));
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
    
    const handleRefreshSeed = useCallback(() => {
        setSetupState(prev => ({ ...prev, seed: `sim_${Date.now()}` }));
    }, []);

    const handleStart = (simMode: 'spectate' | 'dogfight') => {
        setMode(simMode);
    };
    
    useEffect(() => {
        if (mode === 'spectate' && isRunning && historyIndex === replayHistory.length - 1) {
            const interval = setInterval(() => {
                if (!isTurnResolving) {
                    onEndTurn();
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [mode, isRunning, onEndTurn, historyIndex, replayHistory.length, isTurnResolving]);

    const resetToSetup = () => {
        endSimulation();
        setGameState(null);
        setMode('setup');
        // Reset available names for a fresh setup
        setAvailableNames(JSON.parse(JSON.stringify(shipNames)));
    };

    const handleStep = useCallback((direction: number) => {
        // When stepping, ensure the simulation is paused.
        if (isRunning) {
            togglePause();
        }

        const newIndex = historyIndex + direction;
        
        // If we are at the end of history and stepping forward, generate a new turn.
        if (direction > 0 && newIndex >= replayHistory.length) {
            if (!isTurnResolving) {
                onEndTurn();
            }
        } 
        // Otherwise, just navigate through existing history.
        else if (newIndex >= 0 && newIndex < replayHistory.length) {
            goToHistoryTurn(newIndex);
        }
    }, [isRunning, togglePause, historyIndex, replayHistory, isTurnResolving, onEndTurn, goToHistoryTurn]);

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
                             <h2 className="text-lg font-bold text-secondary-light mb-2">Deployed Ships ({setupState.ships.length})</h2>
                              <div className="max-h-32 overflow-y-auto text-sm">
                                {setupState.ships.map(s => (
                                    <div key={s.id} className="flex justify-between items-center">
                                        <span className="truncate">{s.name} ({s.allegiance})</span>
                                        <button onClick={() => setSetupState(p => ({...p, ships: p.ships.filter(ship => ship.id !== s.id)}))} className="text-red-500 font-bold ml-2">X</button>
                                    </div>
                                ))}
                            </div>
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
    
    if (!gameState) {
        return <div>Loading Simulation...</div>;
    }

    const playerShip = gameState.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;
    const allEntities = gameState.currentSector.entities;
    const isViewingHistory = historyIndex < replayHistory.length - 1;

    const handleStepSpectate = (direction: number) => {
        const newIndex = historyIndex + direction;
        if (newIndex >= 0 && newIndex < replayHistory.length) {
            goToHistoryTurn(newIndex);
        } else if (direction > 0 && newIndex >= replayHistory.length && !isTurnResolving) {
            onEndTurn();
        }
    };

    return (
        <div className="h-screen w-screen bg-bg-default text-text-primary p-4 flex flex-col gap-4">
             <header className="flex-shrink-0 flex justify-between items-center panel-style p-2">
                <h1 className="text-2xl font-bold text-secondary-light">Simulation Running: {mode.toUpperCase()}</h1>
                <div className="flex items-center gap-4">
                    {mode === 'spectate' && <span className="font-bold text-lg">Turn: {gameState.turn}</span>}
                    <button onClick={resetToSetup} className="btn btn-tertiary">End Simulation</button>
                </div>
            </header>
            <main className="flex-grow grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 min-h-0">
                {mode === 'dogfight' && playerShip ? (
                     <>
                        <div className="grid grid-rows-[1fr_auto] gap-4 min-h-0">
                             <div className="relative flex-grow flex justify-center items-center min-h-0">
                                <div className="w-full h-full aspect-[11/10] relative">
                                    <CombatFXLayer effects={gameState.combatEffects} entities={allEntities} />
                                    {desperationMoveAnimation && <DesperationMoveAnimation animation={desperationMoveAnimation} />}
                                    <SectorView
                                        sector={gameState.currentSector}
                                        entities={gameState.currentSector.entities.filter(e => e.id !== playerShip.id)}
                                        playerShip={playerShip}
                                        selectedTargetId={selectedTargetId}
                                        onSelectTarget={onSelectTarget}
                                        navigationTarget={navigationTarget}
                                        onSetNavigationTarget={onSetNavigationTarget}
                                        themeName={themeName}
                                    />
                                </div>
                            </div>
                            <PlayerHUD
                                gameState={{...gameState, player: {...gameState.player, ship: playerShip}}}
                                onEndTurn={onEndTurn}
                                onFirePhasers={() => selectedTargetId && onFirePhasers(selectedTargetId)}
                                onLaunchTorpedo={() => selectedTargetId && onLaunchTorpedo(selectedTargetId)}
                                target={targetEntity} isDocked={false} onDockWithStarbase={() => {}} onUndock={() => {}}
                                onScanTarget={() => {}} onInitiateRetreat={() => {}} onCancelRetreat={() => {}} onStartAwayMission={() => {}} onHailTarget={() => {}}
                                playerTurnActions={playerTurnActions} navigationTarget={navigationTarget} isTurnResolving={isTurnResolving} onSendAwayTeam={() => {}} themeName={themeName}
                                desperationMoveAnimation={desperationMoveAnimation} selectedSubsystem={null} onSelectSubsystem={onSelectSubsystem} onEnterOrbit={() => {}}
                                orbitingPlanetId={null} onToggleCloak={onToggleCloak}
                                isViewingHistory={isViewingHistory}
                                historyIndex={historyIndex}
                                onGoToPreviousTurn={() => goToHistoryTurn(historyIndex - 1)}
                                onResumeFromHistory={resumeFromHistory}
                            />
                        </div>
                        <aside className="w-80 flex flex-col gap-2 min-h-0">
                            <div className="flex-grow min-h-0 flex flex-col gap-2">
                                <div className="basis-1/2 flex-shrink min-h-0">
                                    <ShipStatus
                                        gameState={{...gameState, player: {...gameState.player, ship: playerShip}}}
                                        onEnergyChange={onEnergyChange} onToggleRedAlert={onToggleRedAlert} onEvasiveManeuvers={onEvasiveManeuvers} onSelectRepairTarget={onSelectRepairTarget as any}
                                        onToggleCloak={onToggleCloak} onTogglePointDefense={onTogglePointDefense} themeName={themeName}
                                    />
                                </div>
                                <div className="basis-1/2 flex-shrink min-h-0">
                                    <SimulatorShipDetailPanel selectedEntity={targetEntity} themeName={themeName} turn={gameState.turn} gameState={gameState} />
                                </div>
                            </div>
                            <div className="flex-shrink-0 panel-style p-2">
                                <button onClick={() => setShowLogModal(true)} className="btn btn-primary w-full">Show Log</button>
                            </div>
                            {showLogModal && (
                                <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col z-50 p-4" onClick={() => setShowLogModal(false)}>
                                    <div className="panel-style p-4 w-full max-w-4xl mx-auto flex-grow min-h-0 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                                        <LogPanel logs={gameState.logs} onClose={() => setShowLogModal(false)} />
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
                                    <CombatFXLayer effects={gameState.combatEffects} entities={allEntities} />
                                    {desperationMoveAnimation && <DesperationMoveAnimation animation={desperationMoveAnimation} />}
                                    <SectorView
                                        sector={gameState.currentSector}
                                        entities={gameState.currentSector.entities}
                                        playerShip={null as any}
                                        selectedTargetId={selectedTargetId}
                                        onSelectTarget={onSelectTarget}
                                        navigationTarget={null}
                                        onSetNavigationTarget={() => {}}
                                        themeName={themeName}
                                        spectatorMode={true}
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
                                onSliderChange={goToHistoryTurn}
                                allowStepPastEnd={true}
                            />
                        </div>
                        <aside className="flex flex-col gap-2 min-h-0">
                             {targetEntity ? (
                                <>
                                    <div className="basis-1/2 flex-shrink min-h-0">
                                        <SimulatorShipDetailPanel selectedEntity={targetEntity} themeName={themeName} turn={gameState.turn} gameState={gameState} />
                                    </div>
                                    <div className="basis-1/2 flex-shrink min-h-0">
                                        <LogPanel logs={gameState.logs} />
                                    </div>
                                </>
                            ) : (
                                <div className="flex-grow min-h-0">
                                    <LogPanel logs={gameState.logs} />
                                </div>
                            )}
                        </aside>
                    </>
                )}
            </main>
        </div>
    );
};

export default ScenarioSimulator;