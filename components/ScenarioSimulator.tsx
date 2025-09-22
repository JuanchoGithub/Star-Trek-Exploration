import React, { useState, useCallback, useEffect } from 'react';
import { useScenarioLogic } from '../hooks/useScenarioLogic';
import type { Ship, ShipModel, SectorState, LogEntry } from '../types';
import { shipClasses, ShipClassStats } from '../assets/ships/configs/shipClassStats';
import { sectorTemplates } from '../assets/galaxy/sectorTemplates';
import SectorView from './SectorView';
import LogPanel from './LogPanel';
import PlayerHUD from './PlayerHUD';
import { useTheme } from '../hooks/useTheme';

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

const ScenarioSimulator: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const { themeName } = useTheme();
    const [mode, setMode] = useState<'setup' | 'spectate' | 'dogfight'>('setup');
    const [setupState, setSetupState] = useState<{ ships: Ship[], sectorTemplateId: string }>({
        ships: [],
        sectorTemplateId: 'common-empty-space',
    });
    const [tool, setTool] = useState<Tool>(null);

    const {
        gameState, selectedTargetId, navigationTarget, playerTurnActions, isTurnResolving, desperationMoveAnimation,
        onEnergyChange, onEndTurn, onFirePhasers, onLaunchTorpedo, onSelectTarget, onSetNavigationTarget,
        onSelectSubsystem, onToggleCloak, onTogglePointDefense, targetEntity,
        isRunning, togglePause, endSimulation, setGameState, setLogs
    } = useScenarioLogic(setupState.ships, setupState.sectorTemplateId, mode);

    const handleCellClick = useCallback((pos: { x: number; y: number }) => {
        if (mode !== 'setup') return;
        
        const existingShipAtPos = setupState.ships.find(s => s.position.x === pos.x && s.position.y === pos.y);

        if (tool?.type === 'add_ship') {
            if (existingShipAtPos) return; // Can't place on top of another ship

            if (tool.allegiance === 'player' && setupState.ships.some(s => s.allegiance === 'player')) {
                alert("Only one player ship can be added.");
                return;
            }

            // FIX: Cast window to any to access scenario property.
            const newShip = (window as any).scenario.createShip(tool.shipClass, tool.faction, tool.allegiance, pos);
            setSetupState(prev => ({ ...prev, ships: [...prev.ships, newShip] }));
        } else if (tool?.type === 'remove_ship') {
            if (existingShipAtPos) {
                setSetupState(prev => ({ ...prev, ships: prev.ships.filter(s => s.id !== existingShipAtPos.id) }));
            }
        }
    }, [mode, tool, setupState.ships]);

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
        return (
            <div className="h-screen w-screen bg-bg-default text-text-primary p-4 flex flex-col gap-4">
                <header className="flex-shrink-0 flex justify-between items-center panel-style p-2">
                    <h1 className="text-2xl font-bold text-secondary-light">Scenario Simulator Setup</h1>
                    <button onClick={onExit} className="btn btn-tertiary">Exit to Main Menu</button>
                </header>
                <main className="flex-grow grid grid-cols-[3fr_1fr] gap-4 min-h-0">
                    <div className="flex flex-col gap-4">
                        <div className="panel-style p-2 flex gap-4 items-center">
                            <label className="font-bold">Sector Type:</label>
                            <select
                                value={setupState.sectorTemplateId}
                                onChange={e => setSetupState(prev => ({ ...prev, sectorTemplateId: e.target.value }))}
                                className="bg-bg-paper-lighter border border-border-dark rounded p-2 flex-grow"
                            >
                                {sectorTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="flex-grow relative">
                             <SectorView
                                // FIX: Cast window to any to access scenario property.
                                sector={(window as any).scenario.createSector(setupState.sectorTemplateId)}
                                entities={setupState.ships}
                                playerShip={null as any} // No player ship in setup
                                selectedTargetId={null}
                                onSelectTarget={() => {}}
                                navigationTarget={null}
                                onSetNavigationTarget={() => {}}
                                themeName={themeName}
                                onCellClick={handleCellClick}
                            />
                        </div>
                    </div>
                    <aside className="flex flex-col gap-4">
                        <div className="panel-style p-3">
                            <h2 className="text-lg font-bold text-secondary-light mb-2">Tools</h2>
                             <div className="space-y-2">
                                {allegiances.map(a => (
                                    <button 
                                        key={a}
                                        onClick={() => setTool(prev => (prev?.type === 'add_ship' ? {...prev, allegiance: a} : prev))}
                                        className={`w-full btn text-sm ${allegianceColors[a]} ${tool?.type === 'add_ship' && tool.allegiance === a ? 'ring-2 ring-white' : ''}`}
                                    >
                                        Set Allegiance: {a.toUpperCase()}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setTool({ type: 'remove_ship'})}
                                    className={`w-full btn btn-tertiary ${tool?.type === 'remove_ship' ? 'ring-2 ring-white' : ''}`}
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
                                    {Object.values(shipClasses[faction]).map(shipClass => (
                                        <button 
                                            key={shipClass.name}
                                            onClick={() => setTool({ type: 'add_ship', shipClass, faction, allegiance: tool?.type === 'add_ship' ? tool.allegiance : 'enemy' })}
                                            className={`w-full text-left p-1 rounded hover:bg-bg-paper-lighter ${tool?.type === 'add_ship' && tool.shipClass.name === shipClass.name ? 'bg-bg-paper-lighter' : ''}`}
                                        >
                                            {shipClass.name}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className="panel-style p-3 flex-shrink-0">
                             <h2 className="text-lg font-bold text-secondary-light mb-2">Deployed Ships ({setupState.ships.length})</h2>
                              <div className="max-h-32 overflow-y-auto text-sm">
                                {setupState.ships.map(s => (
                                    <div key={s.id} className="flex justify-between items-center">
                                        <span>{s.name} ({s.allegiance})</span>
                                        <button onClick={() => setSetupState(p => ({...p, ships: p.ships.filter(ship => ship.id !== s.id)}))} className="text-red-500 font-bold">X</button>
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
    
    // Simulation View
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
            <main className="flex-grow grid grid-cols-[2fr_1fr] gap-4 min-h-0">
                <div className="flex flex-col gap-4">
                    <div className="relative flex-grow">
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
                     {mode === 'dogfight' && playerShip && (
                        <PlayerHUD
                            gameState={{...gameState, player: {...gameState.player, ship: playerShip}}}
                            onEndTurn={onEndTurn}
                            onFirePhasers={onFirePhasers}
                            onLaunchTorpedo={onLaunchTorpedo}
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
                        />
                    )}
                </div>
                <div className="flex-grow">
                    <LogPanel logs={gameState.logs} />
                </div>
            </main>
        </div>
    );
};

export default ScenarioSimulator;