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

const createShipForSim = (shipClass: ShipClassStats, faction: Ship['shipModel'], allegiance: Ship['allegiance'], position: {x:number, y:number}): Ship => {
    const newShip: Ship = {
        id: uniqueId(), name: `${faction} ${shipClass.role}`, type: 'ship', shipModel: faction,
        shipClass: shipClass.name, shipRole: shipClass.role, faction: faction, position, hull: shipClass.maxHull,
        maxHull: shipClass.maxHull, shields: 0, maxShields: shipClass.maxShields,
        energy: { current: shipClass.energy.max, max: shipClass.energy.max },
        energyAllocation: { weapons: 50, shields: 50, engines: 0 },
        torpedoes: { current: shipClass.torpedoes.max, max: shipClass.torpedoes.max },
        subsystems: JSON.parse(JSON.stringify(shipClass.subsystems)),
        securityTeams: { current: shipClass.securityTeams.max, max: shipClass.securityTeams.max },
        dilithium: { current: 0, max: 0 }, scanned: true, evasive: false, retreatingTurn: null,
        crewMorale: { current: 100, max: 100 }, repairTarget: null, logColor: 'border-gray-400',
        lifeSupportReserves: { current: 100, max: 100 }, cloakState: 'visible', cloakCooldown: 0,
        isStunned: false, engineFailureTurn: null, lifeSupportFailureTurn: null,
        isDerelict: false, captureInfo: null, pointDefenseEnabled: false, statusEffects: [],
        allegiance, cloakingCapable: shipClass.cloakingCapable,
        energyModifier: shipClass.energyModifier,
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


const ScenarioSimulator: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const { themeName } = useTheme();
    const [mode, setMode] = useState<'setup' | 'spectate' | 'dogfight'>('setup');
    const [setupState, setSetupState] = useState<{ ships: Ship[], sectorTemplateId: string, seed: string, sector: SectorState | null }>({
        ships: [],
        sectorTemplateId: 'common-empty-space',
        seed: `sim_${Date.now()}`,
        sector: null,
    });
    const [tool, setTool] = useState<Tool>(null);
    const [showSectorSelector, setShowSectorSelector] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    
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
        isRunning, togglePause, endSimulation, setGameState, setLogs, onEvasiveManeuvers, onSelectRepairTarget, onToggleRedAlert
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

            const newShip = createShipForSim(tool.shipClass, tool.faction, tool.allegiance, pos);
            setSetupState(prev => ({ ...prev, ships: [...prev.ships, newShip] }));
        } else if (tool?.type === 'remove_ship') {
            if (existingShipAtPos) {
                setSetupState(prev => ({ ...prev, ships: prev.ships.filter(s => s.id !== existingShipAtPos.id) }));
            }
        }
    }, [mode, tool, setupState.ships]);
    
    const handleRefreshSeed = useCallback(() => {
        setSetupState(prev => ({ ...prev, seed: `sim_${Date.now()}` }));
    }, []);

    const handleStart = (simMode: 'spectate' | 'dogfight') => {
        setMode(simMode);
    };
    
    useEffect(() => {
        if (mode === 'spectate' && isRunning) {
            const interval = setInterval(() => {
                onEndTurn();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [mode, isRunning, onEndTurn]);

    const resetToSetup = () => {
        endSimulation();
        setLogs([]);
        setGameState(null);
        setMode('setup');
    };

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
                             <div className="w-full h-full aspect-[12/10] relative">
                                <SectorView
                                    sector={setupState.sector}
                                    entities={[...setupState.ships, ...setupState.sector.entities]}
                                    playerShip={null as any}
                                    selectedTargetId={null}
                                    onSelectTarget={() => {}}
                                    navigationTarget={null}
                                    onSetNavigationTarget={() => {}}
                                    themeName={themeName}
                                    onCellClick={handleCellClick}
                                />
                            </div>
                        </div>
                    </div>
                    <aside className="flex flex-col gap-4 min-h-0">
                        <div className="panel-style p-3">
                            <h2 className="text-lg font-bold text-secondary-light mb-2">Set Allegiance</h2>
                             <div className="grid grid-cols-2 gap-2">
                                {allegiances.map(a => (
                                    <button 
                                        key={a}
                                        onClick={() => setTool(prev => (prev?.type === 'add_ship' ? {...prev, allegiance: a} : prev))}
                                        className={`w-full btn text-sm capitalize ${allegianceColors[a]} ${tool?.type === 'add_ship' && tool.allegiance === a ? 'ring-2 ring-white' : ''}`}
                                    >
                                        {a}
                                    </button>
                                ))}
                                 <button
                                    onClick={() => setTool({ type: 'remove_ship'})}
                                    className={`w-full btn btn-tertiary col-span-2 ${tool?.type === 'remove_ship' ? 'ring-2 ring-white' : ''}`}
                                >
                                    Remove Ship
                                </button>
                             </div>
                        </div>
                        <div className="panel-style p-3 flex-grow min-h-0 overflow-y-auto">
                            <h2 className="text-lg font-bold text-secondary-light mb-2">Ship Registry</h2>
                            {factionModels.map(faction => (
                                <div key={faction}>
                                    <h3 className="font-bold text-primary-light mt-2">{faction}</h3>
                                    {Object.values(shipClasses[faction]).map(shipClass => {
                                        const visualConfig = shipVisuals[faction]?.classes[shipClass.name];
                                        const Icon = visualConfig?.icon;
                                        return (
                                        <button 
                                            key={shipClass.name}
                                            onClick={() => setTool({ type: 'add_ship', shipClass, faction, allegiance: tool?.type === 'add_ship' ? tool.allegiance : 'enemy' })}
                                            className={`w-full text-left p-1 rounded hover:bg-bg-paper-lighter flex items-center gap-2 ${tool?.type === 'add_ship' && tool.shipClass.name === shipClass.name ? 'bg-bg-paper-lighter' : ''}`}
                                        >
                                            {Icon && <Icon className="w-6 h-6 flex-shrink-0" />}
                                            <span className="truncate">{shipClass.name}</span>
                                        </button>
                                    )})}
                                </div>
                            ))}
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

    return (
        <div className="h-screen w-screen bg-bg-default text-text-primary p-4 flex flex-col gap-4">
             <header className="flex-shrink-0 flex justify-between items-center panel-style p-2">
                <h1 className="text-2xl font-bold text-secondary-light">Simulation Running: {mode.toUpperCase()}</h1>
                <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">Turn: {gameState.turn}</span>
                    {mode === 'spectate' && (
                         <button onClick={togglePause} className="btn btn-secondary w-28">
                            {isRunning ? 'Pause' : 'Play'}
                        </button>
                    )}
                    <button onClick={resetToSetup} className="btn btn-tertiary">End Simulation</button>
                </div>
            </header>
            <main className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr] gap-4 min-h-0">
                <div className="flex flex-col gap-4 min-h-0">
                    <div className="relative flex-grow flex justify-center items-center min-h-0">
                        <div className="w-full h-full aspect-[12/10] relative">
                             <SectorView
                                sector={gameState.currentSector}
                                entities={gameState.currentSector.entities.filter(e => e.id !== playerShip?.id)}
                                playerShip={playerShip as any}
                                selectedTargetId={selectedTargetId}
                                onSelectTarget={onSelectTarget}
                                navigationTarget={navigationTarget}
                                onSetNavigationTarget={onSetNavigationTarget}
                                themeName={themeName}
                            />
                        </div>
                    </div>
                     {mode === 'dogfight' && playerShip && (
                        <PlayerHUD
                            gameState={{...gameState, player: {...gameState.player, ship: playerShip}}}
                            onEndTurn={onEndTurn}
                            onFirePhasers={() => selectedTargetId && onFirePhasers(selectedTargetId)}
                            onLaunchTorpedo={() => selectedTargetId && onLaunchTorpedo(selectedTargetId)}
                            target={targetEntity}
                            isDocked={false}
                            onDockWithStarbase={() => {}}
                            onRechargeDilithium={() => {}}
                            onResupplyTorpedoes={() => {}}
                            onStarbaseRepairs={() => {}}
                            onScanTarget={() => {}}
                            onInitiateRetreat={() => {}}
                            onCancelRetreat={() => {}}
                            onStartAwayMission={() => {}}
                            onHailTarget={() => {}}
                            playerTurnActions={playerTurnActions}
                            navigationTarget={navigationTarget}
                            isTurnResolving={isTurnResolving}
                            onSendAwayTeam={() => {}}
                            themeName={themeName}
                            desperationMoveAnimation={desperationMoveAnimation}
                            selectedSubsystem={null}
                            onSelectSubsystem={onSelectSubsystem}
                            onEnterOrbit={() => {}}
                            orbitingPlanetId={null}
                            onToggleCloak={onToggleCloak}
                            onTogglePointDefense={onTogglePointDefense}
                        />
                    )}
                </div>
                {mode === 'dogfight' ? (
                    <aside className="flex flex-col gap-2 min-h-0">
                        {playerShip && (
                             <ShipStatus
                                gameState={{...gameState, player: {...gameState.player, ship: playerShip}}}
                                onEnergyChange={onEnergyChange}
                                onToggleRedAlert={onToggleRedAlert}
                                onEvasiveManeuvers={onEvasiveManeuvers}
                                onSelectRepairTarget={onSelectRepairTarget as any}
                                onToggleCloak={onToggleCloak}
                                onTogglePointDefense={onTogglePointDefense}
                                themeName={themeName}
                            />
                        )}
                         <div className="mt-auto panel-style p-2">
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
                ) : (
                    <div className="flex-grow min-h-0">
                        <LogPanel logs={gameState.logs} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default ScenarioSimulator;