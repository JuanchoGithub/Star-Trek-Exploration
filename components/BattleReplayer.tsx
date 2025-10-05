import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Entity } from '../types';
import SectorView from './SectorView';
import CombatFXLayer from './CombatFXLayer';
import ReplayStatusPanel from './ReplayStatusPanel';
import SimulatorShipDetailPanel from './SimulatorShipDetailPanel';
import LogPanel from './LogPanel';
import PlaybackControls from './PlaybackControls';
import { useGameState } from '../contexts/GameStateContext';
import { useUIState } from '../contexts/UIStateContext';

const BattleReplayer: React.FC = () => {
    const { gameState } = useGameState();
    const { setShowReplayer, themeName, entityRefs } = useUIState();
    
    // The history is now part of the main game state
    const history = gameState?.replayHistory || [];
    const onClose = () => setShowReplayer(false);

    const [currentIndex, setCurrentIndex] = useState(history.length > 0 ? history.length - 1 : 0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [isLogExpanded, setIsLogExpanded] = useState(false);

    const currentGameState = history[currentIndex];

    useEffect(() => {
        if (isPlaying) {
            const timer = setTimeout(() => {
                if (currentIndex < history.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                } else {
                    setIsPlaying(false);
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isPlaying, currentIndex, history.length]);

    const handleSelectTarget = useCallback((id: string | null) => {
        setSelectedEntityId(id);
    }, []);
    
    const handleStep = useCallback((direction: number) => {
        setCurrentIndex(prev => Math.max(0, Math.min(history.length - 1, prev + direction)));
    }, [history.length]);

    if (!currentGameState) {
        return (
             <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
                <div className="panel-style p-4 h-full w-full max-w-7xl flex flex-col gap-2">
                    <p>No replay data available.</p>
                    <button onClick={onClose} className="btn btn-tertiary">Close</button>
                </div>
            </div>
        );
    }

    const currentTurnForDisplay = currentGameState.turn;
    const logsForCurrentTurn = currentGameState.logs.filter(log => log.turn === currentTurnForDisplay);

    const playerShip = currentGameState.player.ship;
    const allEntities = [...currentGameState.currentSector.entities, playerShip];
    const selectedEntity = allEntities.find(e => e.id === selectedEntityId) || null;

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="panel-style p-4 h-full w-full max-w-7xl flex flex-col gap-2">
                <header className="flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-secondary-light">Battle Replayer</h2>
                    <button onClick={onClose} className="btn btn-tertiary">Close</button>
                </header>
                <main className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow min-h-0">
                    <div className="md:col-span-2 flex flex-col gap-2">
                        <div className="relative flex-grow">
                             <CombatFXLayer effects={currentGameState.combatEffects} entities={allEntities} entityRefs={entityRefs} />
                             <SectorView 
                                spectatorMode={true}
                                isResizing={false}
                            />
                        </div>
                        <PlaybackControls
                            currentIndex={currentIndex}
                            maxIndex={history.length - 1}
                            isPlaying={isPlaying}
                            onTogglePlay={() => setIsPlaying(p => !p)}
                            onStep={handleStep}
                            onSliderChange={setCurrentIndex}
                        />
                    </div>
                    <aside className="relative flex flex-col gap-2 min-h-0">
                       <div className="flex-grow min-h-0 overflow-y-auto space-y-2 pr-2">
                            <ReplayStatusPanel gameState={currentGameState} themeName={themeName} />
                            <SimulatorShipDetailPanel selectedEntity={selectedEntity} themeName={themeName} turn={currentTurnForDisplay} gameState={currentGameState} />
                        </div>
                       <div className="flex-shrink-0 panel-style p-2">
                            <button onClick={() => setIsLogExpanded(true)} className="btn btn-primary w-full">
                                Show Full Log for Turn {currentTurnForDisplay}
                            </button>
                        </div>
                        {isLogExpanded && (
                            <div className="absolute inset-0 bg-bg-paper z-10 panel-style p-2 flex flex-col">
                                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                                    <h2 className="text-xl font-bold text-secondary-light">Full Log: Turn {currentTurnForDisplay}</h2>
                                    <button onClick={() => setIsLogExpanded(false)} className="btn btn-tertiary">Close</button>
                                </div>
                                <div className="flex-grow min-h-0">
                                    <LogPanel logs={logsForCurrentTurn} />
                                </div>
                            </div>
                        )}
                    </aside>
                </main>
            </div>
        </div>
    );
};

export default BattleReplayer;
