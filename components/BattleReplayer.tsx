import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, Entity } from '../types';
import { ThemeName } from '../hooks/useTheme';
import SectorView from './SectorView';
import CombatFXLayer from './CombatFXLayer';
import ReplayStatusPanel from './ReplayStatusPanel';
import ReplayShipDetailPanel from './ReplayShipDetailPanel';
import LogPanel from './LogPanel';

interface BattleReplayerProps {
    history: GameState[];
    onClose: () => void;
    themeName: ThemeName;
}

const BattleReplayer: React.FC<BattleReplayerProps> = ({ history, onClose, themeName }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [isLogExpanded, setIsLogExpanded] = useState(false);

    const currentGameState = history[currentIndex];

    useEffect(() => {
        if (isPlaying) {
            const timer = setTimeout(() => {
                setCurrentIndex(prev => Math.min(prev + 1, history.length - 1));
            }, 1000);
            if (currentIndex === history.length - 1) {
                setIsPlaying(false);
            }
            return () => clearTimeout(timer);
        }
    }, [isPlaying, currentIndex, history.length]);

    const handleSelectTarget = useCallback((id: string | null) => {
        setSelectedEntityId(id);
    }, []);

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

    const currentTurnForDisplay = currentGameState.turn > 0 ? currentGameState.turn - 1 : 0;
    const turnToFilter = Math.max(1, currentTurnForDisplay);

    const playerShip = currentGameState.player.ship;
    const allEntities = [...currentGameState.currentSector.entities, playerShip];
    const selectedEntity = allEntities.find(e => e.id === selectedEntityId) || null;
    const logsForCurrentTurn = currentGameState.logs.filter(log => log.turn === turnToFilter);

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
                             <CombatFXLayer effects={currentGameState.combatEffects} entities={allEntities} />
                             <SectorView 
                                entities={currentGameState.currentSector.entities} 
                                playerShip={playerShip}
                                selectedTargetId={selectedEntityId}
                                onSelectTarget={handleSelectTarget}
                                navigationTarget={null}
                                onSetNavigationTarget={() => {}}
                                sector={currentGameState.currentSector}
                                themeName={themeName}
                                spectatorMode={true}
                            />
                        </div>
                        <div className="panel-style p-3 flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setIsPlaying(p => !p)} className="btn btn-primary w-24">{isPlaying ? 'Pause' : 'Play'}</button>
                                <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} className="btn btn-secondary">Prev</button>
                                <input 
                                    type="range"
                                    min="0"
                                    max={history.length - 1}
                                    value={currentIndex}
                                    onChange={e => setCurrentIndex(Number(e.target.value))}
                                    className="flex-grow"
                                />
                                <button onClick={() => setCurrentIndex(p => Math.min(history.length - 1, p + 1))} className="btn btn-secondary">Next</button>
                                <span className="font-bold text-lg">Turn: {turnToFilter}</span>
                            </div>
                        </div>
                    </div>
                    <aside className="relative flex flex-col gap-2 min-h-0">
                       <div className="flex-grow min-h-0 overflow-y-auto space-y-2 pr-2">
                            <ReplayStatusPanel gameState={currentGameState} themeName={themeName} />
                            <ReplayShipDetailPanel selectedEntity={selectedEntity} themeName={themeName} turn={turnToFilter} gameState={currentGameState} />
                        </div>
                       <div className="flex-shrink-0 panel-style p-2">
                            <button onClick={() => setIsLogExpanded(true)} className="btn btn-primary w-full">
                                Show Full Log for Turn {turnToFilter}
                            </button>
                        </div>
                        {isLogExpanded && (
                            <div className="absolute inset-0 bg-bg-paper z-10 panel-style p-2 flex flex-col">
                                <div className="flex justify-between items-center mb-2 flex-shrink-0">
                                    <h2 className="text-xl font-bold text-secondary-light">Full Log: Turn {turnToFilter}</h2>
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