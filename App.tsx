import React, { useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import PlayerHUD from './components/PlayerHUD';
import LogPanel from './components/LogPanel';
import SectorView from './components/SectorView';
import QuadrantView from './components/QuadrantView';
import AwayMissionDialog from './components/AwayMissionDialog';
import HailDialog from './components/HailDialog';
import OfficerCounselDialog from './components/OfficerCounselDialog';
import StatusLine from './components/StatusLine';

const App: React.FC = () => {
  const {
    gameState,
    selectedTargetId,
    navigationTarget,
    currentView,
    isDocked,
    isRepairMode,
    activeAwayMission,
    activeHail,
    officerCounsel,
    targetEntity,
    selectedSubsystem,
    onEnergyChange,
    onEndTurn,
    onFirePhasers,
    onLaunchTorpedo,
    onCycleTargets,
    onEvasiveManeuvers,
    onSelectTarget,
    onSetNavigationTarget,
    onSetView,
    onWarp,
    onDockWithStarbase,
    onRechargeDilithium,
    onResupplyTorpedoes,
    onInitiateDamageControl,
    onSelectRepairTarget,
    onScanTarget,
    onInitiateRetreat,
    onStartAwayMission,
    onChooseAwayMissionOption,
    onHailTarget,
    onCloseHail,
    onCloseOfficerCounsel,
    onProceedFromCounsel,
    onSelectSubsystem,
  } = useGameLogic();

  const [showLogPanel, setShowLogPanel] = useState(false);

  const target = gameState.currentSector.entities.find(e => e.id === selectedTargetId);

  return (
    <main className="bg-gray-900 text-gray-100 min-h-screen p-4 font-sans flex flex-col">
      <header className="mb-4 text-center">
        <h1 className="text-4xl font-bold text-cyan-300 tracking-wider">Starship Endeavour</h1>
      </header>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
        <div className="md:col-span-2 min-h-0">
          {currentView === 'sector' ? (
            <SectorView
              sector={gameState.currentSector}
              entities={gameState.currentSector.entities}
              playerShip={gameState.player.ship}
              selectedTargetId={selectedTargetId}
              onSelectTarget={onSelectTarget}
              navigationTarget={navigationTarget}
              onSetNavigationTarget={onSetNavigationTarget}
              targetEntity={targetEntity}
              selectedSubsystem={selectedSubsystem}
              onSelectSubsystem={onSelectSubsystem}
            />
          ) : (
            <QuadrantView 
              quadrantMap={gameState.quadrantMap}
              playerPosition={gameState.player.position}
              onWarp={onWarp}
            />
          )}
        </div>
        <div className="min-h-0">
          <PlayerHUD
            gameState={gameState}
            onEnergyChange={onEnergyChange}
            onEndTurn={onEndTurn}
            onFirePhasers={onFirePhasers}
            onLaunchTorpedo={onLaunchTorpedo}
            onCycleTargets={onCycleTargets}
            onEvasiveManeuvers={onEvasiveManeuvers}
            target={target}
            currentView={currentView}
            onSetView={onSetView}
            isDocked={isDocked}
            onDockWithStarbase={onDockWithStarbase}
            onRechargeDilithium={onRechargeDilithium}
            onResupplyTorpedoes={onResupplyTorpedoes}
            isRepairMode={isRepairMode}
            onInitiateDamageControl={onInitiateDamageControl}
            onSelectRepairTarget={onSelectRepairTarget}
            onScanTarget={onScanTarget}
            onInitiateRetreat={onInitiateRetreat}
            onStartAwayMission={onStartAwayMission}
            onHailTarget={onHailTarget}
          />
        </div>
        <div className="md:col-span-3 min-h-0">
           <StatusLine 
            ship={gameState.player.ship}
            latestLog={gameState.logs[0] || "Welcome to the U.S.S. Endeavour."}
            onToggleLog={() => setShowLogPanel(true)}
          />
        </div>
      </div>
      {activeAwayMission && <AwayMissionDialog mission={activeAwayMission} onChoose={onChooseAwayMissionOption} />}
      {activeHail && target && <HailDialog hailData={activeHail} target={target} onClose={onCloseHail} />}
      {officerCounsel && <OfficerCounselDialog counselSession={officerCounsel} onProceed={onProceedFromCounsel} onAbort={onCloseOfficerCounsel} />}
      {showLogPanel && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-8">
            <div className="bg-gray-900 border-2 border-blue-400 rounded-md h-3/4 w-4/5 max-w-4xl flex flex-col p-4">
                 <LogPanel logs={gameState.logs} />
                 <button 
                    onClick={() => setShowLogPanel(false)} 
                    className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all self-center flex-shrink-0"
                >
                    Close Log
                </button>
            </div>
        </div>
      )}
      {gameState.gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-8 text-center">
              <h2 className="text-6xl font-bold text-red-500 mb-4">GAME OVER</h2>
              <p className="text-2xl text-gray-300">{gameState.logs[0]}</p>
          </div>
      )}
    </main>
  );
};

export default App;