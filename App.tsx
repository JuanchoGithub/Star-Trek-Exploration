import React, { useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import PlayerHUD from './components/PlayerHUD';
import LogPanel from './components/LogPanel';
import SectorView from './components/SectorView';
import QuadrantView from './components/QuadrantView';
import AwayMissionDialog from './components/AwayMissionDialog';
import HailDialog from './components/HailDialog';
import StatusLine from './components/StatusLine';
import ShipStatus from './components/ShipStatus';
import EventDialog from './components/EventDialog';
import WarpAnimation from './components/WarpAnimation';
import CombatFXLayer from './components/CombatFXLayer';
import AwayMissionResultDialog from './components/AwayMissionResultDialog';
import { useTheme } from './hooks/useTheme';
import ThemeSwitcher from './components/ThemeSwitcher';
import PlayerManual from './components/PlayerManual';
import EventResultDialog from './components/EventResultDialog';

interface GameMenuProps {
    onSaveGame: () => void;
    onLoadGame: () => void;
    onExportSave: () => void;
    onImportSave: (jsonString: string) => void;
    onOpenManual: () => void;
    onClose: () => void;
}

const GameMenu: React.FC<GameMenuProps> = ({ onSaveGame, onLoadGame, onExportSave, onImportSave, onOpenManual, onClose }) => {
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
            <div className="panel-style p-6 w-full max-w-sm">
                <h3 className="text-xl font-bold text-secondary-light mb-4 text-center">Game Menu</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onSaveGame} className="w-full btn btn-primary">Save Game</button>
                    <button onClick={onLoadGame} className="w-full btn btn-primary">Load Game</button>
                    <button onClick={onExportSave} className="w-full btn btn-accent green text-white">Export Save</button>
                    <button onClick={handleImportClick} className="w-full btn btn-accent green text-white">Import Save</button>
                    <button onClick={onOpenManual} className="w-full btn btn-secondary col-span-2">Player's Manual</button>
                </div>
                <div className="mt-6 text-center">
                     <button onClick={onClose} className="btn btn-tertiary px-6">Close</button>
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
    activeAwayMission,
    activeHail,
    targetEntity,
    playerTurnActions,
    activeEvent,
    isWarping,
    isTurnResolving,
    awayMissionResult,
    eventResult,
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
    onStarbaseRepairs,
    onSelectRepairTarget,
    onScanTarget,
    onInitiateRetreat,
    onCancelRetreat,
    onStartAwayMission,
    onChooseAwayMissionOption,
    onHailTarget,
    onCloseHail,
    onSelectSubsystem,
    onChooseEventOption,
    saveGame,
    loadGame,
    exportSave,
    importSave,
    onDistributeEvenly,
    onSendAwayTeam,
    onToggleRedAlert,
    onCloseAwayMissionResult,
    onCloseEventResult,
    onScanQuadrant,
  } = useGameLogic();

  const { theme, themeName, setTheme } = useTheme();
  const [showLogPanel, setShowLogPanel] = useState(false);
  const [isGameMenuOpen, setGameMenuOpen] = useState(false);
  const [isManualOpen, setManualOpen] = useState(false);

  const target = gameState.currentSector.entities.find(e => e.id === selectedTargetId);
  const selectedSubsystem = gameState.player.targeting?.entityId === selectedTargetId ? gameState.player.targeting.subsystem : null;
  const latestLogEntry = gameState.logs.length > 0 ? gameState.logs[gameState.logs.length - 1] : null;
  const isRetreating = gameState.player.ship.retreatingTurn !== null && gameState.player.ship.retreatingTurn > gameState.turn;

  return (
    <main className={`bg-bg-default text-text-primary h-screen p-4 ${theme.font} ${theme.className} flex flex-col ${gameState.redAlert ? 'red-alert-pulse' : ''}`}>
      <div className="flex-grow grid grid-cols-[3fr_1fr] gap-4 min-h-0">
          {/* Left Column: Map/HUD */}
          <div className="flex flex-col min-h-0">
              {/* Top Section: Tabs + Map */}
              <div className="flex flex-grow min-h-0">
                  {/* Vertical Tabs */}
                  <div className="flex flex-col w-10 flex-shrink-0">
                      <button onClick={() => onSetView('sector')} className={`w-full flex-grow flex items-center justify-center font-bold text-sm transition-colors rounded-none rounded-tl-md ${currentView === 'sector' ? 'bg-secondary-main text-secondary-text' : 'bg-bg-paper-lighter text-text-secondary hover:bg-bg-paper'}`}>
                          <span className="transform -rotate-90 block whitespace-nowrap tracking-widest uppercase text-xs">Sector View</span>
                      </button>
                      <button 
                        onClick={() => onSetView('quadrant')} 
                        disabled={isRetreating}
                        title={isRetreating ? "Cannot access Quadrant Map while retreating" : "Switch to Quadrant Map"}
                        className={`w-full flex-grow flex items-center justify-center font-bold text-sm transition-colors rounded-none rounded-bl-md ${currentView === 'quadrant' ? 'bg-secondary-main text-secondary-text' : 'bg-bg-paper-lighter text-text-secondary hover:bg-bg-paper'} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-bg-paper-lighter`}>
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
                          onScanQuadrant={onScanQuadrant}
                          isInCombat={gameState.redAlert}
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
                    target={target}
                    isDocked={isDocked}
                    onDockWithStarbase={onDockWithStarbase}
                    onRechargeDilithium={onRechargeDilithium}
                    onResupplyTorpedoes={onResupplyTorpedoes}
                    onStarbaseRepairs={onStarbaseRepairs}
                    onScanTarget={onScanTarget}
                    onInitiateRetreat={onInitiateRetreat}
                    onCancelRetreat={onCancelRetreat}
                    onStartAwayMission={onStartAwayMission}
                    onHailTarget={onHailTarget}
                    playerTurnActions={playerTurnActions}
                    navigationTarget={navigationTarget}
                    isTurnResolving={isTurnResolving}
                    onSendAwayTeam={onSendAwayTeam}
                    themeName={themeName}
                  />
              </div>
          </div>
          
          {/* Right Column: Ship Status */}
          <div className="flex flex-col">
              <ShipStatus 
                  gameState={gameState} 
                  onEnergyChange={onEnergyChange} 
                  onDistributeEvenly={onDistributeEvenly}
                  onToggleRedAlert={onToggleRedAlert}
                  onEvasiveManeuvers={onEvasiveManeuvers}
                  onSelectRepairTarget={onSelectRepairTarget}
                  themeName={themeName}
              />
          </div>
      </div>
      
      <div className="flex-shrink-0 pt-4">
           <StatusLine 
            latestLog={latestLogEntry}
            onToggleLog={() => setShowLogPanel(true)}
            onOpenGameMenu={() => setGameMenuOpen(true)}
          >
            <ThemeSwitcher themeName={themeName} setTheme={setTheme} />
          </StatusLine>
      </div>

      {activeAwayMission && <AwayMissionDialog mission={activeAwayMission} onChoose={onChooseAwayMissionOption} themeName={themeName} />}
      {awayMissionResult && <AwayMissionResultDialog result={awayMissionResult} onClose={onCloseAwayMissionResult} />}
      {activeHail && target && <HailDialog hailData={activeHail} target={target} onClose={onCloseHail} />}
      {activeEvent && <EventDialog event={activeEvent.template} onChoose={onChooseEventOption} />}
      {eventResult && <EventResultDialog result={eventResult} onClose={onCloseEventResult} />}

      {showLogPanel && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-8">
            <div className="h-3/4 w-4/5 max-w-4xl flex flex-col">
                 <LogPanel logs={gameState.logs} />
                 <button 
                    onClick={() => setShowLogPanel(false)} 
                    className="mt-4 btn btn-primary self-center flex-shrink-0"
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
              onOpenManual={() => { setGameMenuOpen(false); setManualOpen(true); }}
              onClose={() => setGameMenuOpen(false)}
          />
      )}
      {isManualOpen && (
        <PlayerManual onClose={() => setManualOpen(false)} themeName={themeName} />
      )}
      {gameState.gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-8 text-center">
              <h2 className="text-6xl font-bold text-accent-red mb-4">GAME OVER</h2>
              <p className="text-2xl text-text-secondary">{latestLogEntry?.message ?? ''}</p>
          </div>
      )}
    </main>
  );
};

export default App;