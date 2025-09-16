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
import ShipStatus from './components/ShipStatus';
import EventDialog from './components/EventDialog';
import WarpAnimation from './components/WarpAnimation';
import CombatFXLayer from './components/CombatFXLayer';

interface GameMenuProps {
    onSaveGame: () => void;
    onLoadGame: () => void;
    onExportSave: () => void;
    onImportSave: (jsonString: string) => void;
    onClose: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ onSaveGame, onLoadGame, onExportSave, onImportSave, onClose }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                onImportSave(text);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-gray-800 border-2 border-blue-400 p-6 rounded-md w-full max-w-sm">
                <h3 className="text-xl font-bold text-blue-300 mb-4 text-center">Game Menu</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onSaveGame} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded">Save Game</button>
                    <button onClick={onLoadGame} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded">Load Game</button>
                    <button onClick={onExportSave} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded">Export Save</button>
                    <button onClick={handleImportClick} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded">Import Save</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </div>
                <div className="mt-6 text-center">
                     <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded">Close</button>
                </div>
            </div>
        </div>
    );
};

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
    playerTurnActions,
    activeEvent,
    isWarping,
    onEnergyChange,
    onEndTurn,
    onFirePhasers,
    onLaunchTorpedo,
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
    onChooseEventOption,
    saveGame,
    loadGame,
    exportSave,
    importSave,
    onDistributeEvenly,
  } = useGameLogic();

  const [showLogPanel, setShowLogPanel] = useState(false);
  const [isGameMenuOpen, setGameMenuOpen] = useState(false);

  const target = gameState.currentSector.entities.find(e => e.id === selectedTargetId);

  return (
    <main className={`bg-gray-900 text-gray-100 h-screen p-4 font-sans flex flex-col ${gameState.redAlert ? 'red-alert-pulse' : ''}`}>
      <div className="flex-grow grid grid-cols-[3fr_1fr] gap-4 min-h-0">
          {/* Left Column: Map/HUD */}
          <div className="flex flex-col min-h-0">
              {/* Top Section: Tabs + Map */}
              <div className="flex flex-grow min-h-0">
                  {/* Vertical Tabs */}
                  <div className="flex flex-col w-10 flex-shrink-0">
                      <button onClick={() => onSetView('sector')} className={`w-full flex-grow flex items-center justify-center font-bold text-sm transition-colors rounded-none rounded-tl-md ${currentView === 'sector' ? 'bg-cyan-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                          <span className="transform -rotate-90 block whitespace-nowrap tracking-widest uppercase text-xs">Sector View</span>
                      </button>
                      <button onClick={() => onSetView('quadrant')} className={`w-full flex-grow flex items-center justify-center font-bold text-sm transition-colors rounded-none rounded-bl-md ${currentView === 'quadrant' ? 'bg-cyan-500 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                          <span className="transform -rotate-90 block whitespace-nowrap tracking-widest uppercase text-xs">Quadrant Map</span>
                      </button>
                  </div>
                  {/* Map Container */}
                  <div className="flex-grow min-h-0 relative">
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
                      {isWarping && <WarpAnimation />}
                      {currentView === 'sector' && gameState.combatEffects.length > 0 && (
                          <CombatFXLayer
                              effects={gameState.combatEffects}
                              entities={[...gameState.currentSector.entities, gameState.player.ship]}
                          />
                      )}
                  </div>
              </div>
              {/* Bottom Section: HUD */}
              <div className="flex-shrink-0 pt-4">
                <PlayerHUD
                    gameState={gameState}
                    onEndTurn={onEndTurn}
                    onFirePhasers={onFirePhasers}
                    onLaunchTorpedo={onLaunchTorpedo}
                    onEvasiveManeuvers={onEvasiveManeuvers}
                    target={target}
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
                    playerTurnActions={playerTurnActions}
                    navigationTarget={navigationTarget}
                  />
              </div>
          </div>
          
          {/* Right Column: Ship Status */}
          <div className="flex flex-col">
              <ShipStatus 
                  gameState={gameState} 
                  onEnergyChange={onEnergyChange} 
                  onDistributeEvenly={onDistributeEvenly}
              />
          </div>
      </div>
      
      <div className="flex-shrink-0 pt-4">
           <StatusLine 
            latestLog={gameState.logs[0] || "Welcome to the U.S.S. Endeavour."}
            onToggleLog={() => setShowLogPanel(true)}
            onOpenGameMenu={() => setGameMenuOpen(true)}
          />
      </div>

      {activeAwayMission && <AwayMissionDialog mission={activeAwayMission} onChoose={onChooseAwayMissionOption} />}
      {activeHail && target && <HailDialog hailData={activeHail} target={target} onClose={onCloseHail} />}
      {officerCounsel && <OfficerCounselDialog counselSession={officerCounsel} onProceed={onProceedFromCounsel} onAbort={onCloseOfficerCounsel} />}
      {activeEvent && <EventDialog event={activeEvent.template} onChoose={onChooseEventOption} />}

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
      {isGameMenuOpen && (
          <GameMenu 
              onSaveGame={saveGame}
              onLoadGame={loadGame}
              onExportSave={exportSave}
              onImportSave={importSave}
              onClose={() => setGameMenuOpen(false)}
          />
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