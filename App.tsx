
import React from 'react';
import type { GameState, Entity, Ship } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import SectorView from './components/SectorView';
import PlayerHUD from './components/PlayerHUD';
import LogPanel from './components/LogPanel';
import QuadrantView from './components/QuadrantView';

const App: React.FC = () => {
  const {
    gameState,
    gameLog,
    selectedTargetId,
    selectedSubsystem,
    currentView,
    handleSelectTarget,
    handleSelectSubsystem,
    handleEndTurn,
    handleEnergyChange,
    handleFirePhasers,
    handleLaunchTorpedo,
    handleRestart,
    handleCycleTargets,
    handleEvasiveManeuvers,
    handleSetNavigationTarget,
    handleSetView,
    handleWarpToSector,
  } = useGameLogic();

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <p className="text-2xl text-cyan-400 animate-pulse">Loading Starship Systems...</p>
      </div>
    );
  }

  const playerShip = gameState.player.ship;
  const targetEntity = gameState.currentSector.entities.find(e => e.id === selectedTargetId);
  const gameOver = playerShip.hull <= 0 || (gameState.currentSector.entities.every(e => e.type !== 'ship' || e.faction === 'Federation') && gameState.quadrantMap.flat().every(s => s.visited));


  return (
    <div className="h-screen bg-gray-900 text-gray-200 flex flex-col p-4 font-mono">
      <header className="flex justify-between items-center border-b-2 border-cyan-400 pb-2 mb-4">
        <h1 className="text-2xl font-bold text-cyan-400">U.S.S. Endeavour - Bridge Command</h1>
        <div className="text-right">
          <p>Stardate: 47634.4</p>
          <p>Turn: <span className="text-orange-400 font-bold">{gameState.turn}</span></p>
        </div>
      </header>

      <main className="flex-grow flex gap-4 min-h-0">
        <div className="flex-[3] grid grid-rows-[auto_1fr] gap-4">
            {currentView === 'sector' ? (
                <SectorView
                    entities={gameState.currentSector.entities}
                    playerShip={playerShip}
                    selectedTargetId={selectedTargetId}
                    onSelectTarget={handleSelectTarget}
                    navigationTarget={gameState.navigationTarget}
                    onSetNavigationTarget={handleSetNavigationTarget}
                    // FIX: Removed incorrect type assertion. `targetEntity` is of type `Entity` and should be passed as such.
                    targetEntity={targetEntity}
                    selectedSubsystem={selectedSubsystem}
                    onSelectSubsystem={handleSelectSubsystem}
                />
            ) : (
                <QuadrantView 
                    quadrantMap={gameState.quadrantMap}
                    playerPosition={gameState.player.quadrantPosition}
                    onWarp={handleWarpToSector}
                />
            )}
          <LogPanel logs={gameLog} />
        </div>
        <div className="flex-1">
           <PlayerHUD
            gameState={gameState}
            onEnergyChange={handleEnergyChange}
            onEndTurn={handleEndTurn}
            onFirePhasers={handleFirePhasers}
            onLaunchTorpedo={handleLaunchTorpedo}
            onCycleTargets={handleCycleTargets}
            onEvasiveManeuvers={handleEvasiveManeuvers}
            target={targetEntity}
            currentView={currentView}
            onSetView={handleSetView}
          />
        </div>
      </main>
      
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
           {playerShip.hull <= 0 ? (
            <h2 className="text-5xl font-bold text-red-500 mb-4">MISSION FAILED</h2>
           ) : (
            <h2 className="text-5xl font-bold text-green-400 mb-4">MISSION ACCOMPLISHED</h2>
           )}
           <p className="text-xl mb-8">
            {playerShip.hull <= 0 ? "The Endeavour has been destroyed." : "All hostile targets neutralized and the quadrant is explored."}
            </p>
           <button 
             onClick={handleRestart}
             className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-2xl transition-all"
           >
             New Mission
           </button>
        </div>
      )}
    </div>
  );
};

export default App;
