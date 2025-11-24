
import React, { useState } from 'react';
import SectorView from './SectorView';
import QuadrantView from './QuadrantView';
import WarpAnimation from './WarpAnimation';
import CombatFXLayer from './CombatFXLayer';
import CommandConsole from './CommandConsole';
import TargetInfo from './TargetInfo';
import ShipStatus from './ShipStatus';
import LogPanel from './LogPanel';
import StatusLine from './StatusLine';
import ThemeSwitcher from './ThemeSwitcher';
import DesperationMoveAnimation from './DesperationMoveAnimation';
import LcarsDecoration from './LcarsDecoration';
import { ScienceIcon, EngineeringIcon, LogIcon, StarfleetLogoIcon, WeaponIcon } from '../assets/ui/icons';
import { useGameState } from '../contexts/GameStateContext';
import { useUIState } from '../contexts/UIStateContext';
import { useGameActions } from '../contexts/GameActionsContext';

type Tab = 'weapons' | 'sensors' | 'engineering' | 'logs';

const GameUI: React.FC = () => {
    const { gameState, isWarping, desperationMoveAnimation, playerTurnActions, navigationTarget, isTurnResolving } = useGameState();
    const { themeName, setTheme, currentView, entityRefs } = useUIState();
    const { onSetView, onWarp, onScanQuadrant, onEndTurn } = useGameActions();
    const [activeTab, setActiveTab] = useState<Tab>('weapons');

    if (!gameState) return null;

    const { player, currentSector: sector, redAlert, quadrantMap, logs } = gameState;
    const computerHealthPercent = (player.ship.subsystems.computer.health / player.ship.subsystems.computer.maxHealth) * 100;

    const TabButton: React.FC<{ id: Tab; label: string; icon: React.ReactNode }> = ({ id, label, icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 px-1 text-xs md:text-sm font-bold uppercase tracking-wider transition-all
                ${activeTab === id 
                    ? 'bg-secondary-main text-secondary-text shadow-[inset_0_-4px_0_0_rgba(0,0,0,0.3)]' 
                    : 'bg-bg-paper hover:bg-bg-paper-lighter text-text-secondary border-b-4 border-transparent'
                }`}
        >
            {icon}
            <span className="hidden md:inline">{label}</span>
        </button>
    );

    const isRetreating = player.ship.retreatingTurn !== null && player.ship.retreatingTurn >= gameState.turn;
    const turnsToRetreat = isRetreating ? player.ship.retreatingTurn! - gameState.turn : 0;
    
    const getEndTurnButtonText = () => {
        if (player.ship.isStunned) return "Systems Stunned";
        if (isTurnResolving) return "Resolving...";
        if (isRetreating && turnsToRetreat === 0) return "Engage Warp";
        
        const isMoving = navigationTarget && (player.ship.position.x !== navigationTarget.x || player.ship.position.y !== navigationTarget.y);
        const isFiring = !!playerTurnActions.firedWeaponId;

        if (isMoving && player.ship.subsystems.engines.health < player.ship.subsystems.engines.maxHealth * 0.5) {
            return "Engines Offline";
        }

        if (isFiring && isMoving) return "Fire & Move";
        if (isFiring) return "Fire";
        if (isMoving) return "Engage Engines";

        return "End Turn";
    }

    return (
        <div className="h-full w-full flex flex-col bg-bg-default relative z-10 overflow-hidden">
            
            {/* Main Content Area: Map + Sidebar */}
            <div className="flex-grow flex flex-col md:flex-row min-h-0">
                
                {/* Left: Tactical Map (Always Visible) */}
                <div className="flex-grow relative bg-black border-r-2 border-border-dark">
                    {/* Decorative Overlays */}
                    {themeName === 'federation' && (
                        <>
                            <LcarsDecoration type="label" label="TACTICAL-VIEW" className="top-2 right-2 z-20" seed={101} />
                            <LcarsDecoration type="numbers" className="bottom-4 left-2 z-20" seed={102} />
                        </>
                    )}
                    
                    {/* Large View Switcher Buttons */}
                    <div className="absolute left-4 top-4 z-20 flex flex-col gap-2">
                        <button
                            onClick={() => onSetView('sector')}
                            className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg border-2 font-bold text-xs shadow-lg transition-transform active:scale-95 ${currentView === 'sector' ? 'bg-secondary-main border-secondary-light text-secondary-text' : 'bg-black/80 border-border-dark text-text-disabled hover:border-secondary-light hover:text-secondary-light'}`}
                            title="Sector View"
                        >
                            <span className="text-xl">SEC</span>
                            <span className="text-[10px]">TACTICAL</span>
                        </button>
                        <button
                            onClick={() => onSetView('quadrant')}
                            className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg border-2 font-bold text-xs shadow-lg transition-transform active:scale-95 ${currentView === 'quadrant' ? 'bg-primary-main border-primary-light text-primary-text' : 'bg-black/80 border-border-dark text-text-disabled hover:border-primary-light hover:text-primary-light'}`}
                            disabled={computerHealthPercent < 100}
                            title={computerHealthPercent < 100 ? "Quadrant Map offline" : "Quadrant Map"}
                        >
                             <span className="text-xl">QAD</span>
                             <span className="text-[10px]">STRATEGIC</span>
                        </button>
                    </div>

                    {/* The Actual View */}
                    <div className="w-full h-full relative">
                        {isWarping && <WarpAnimation />}
                        {currentView === 'sector' ? (
                            <>
                                <CombatFXLayer effects={gameState.combatEffects} entities={[player.ship, ...sector.entities]} entityRefs={entityRefs} />
                                <SectorView isResizing={false} />
                                {desperationMoveAnimation && <DesperationMoveAnimation animation={desperationMoveAnimation} />}
                            </>
                        ) : (
                            <QuadrantView
                                quadrantMap={quadrantMap}
                                currentSector={sector}
                                playerPosition={player.position}
                                playerShip={player.ship}
                                onWarp={onWarp}
                                onScanQuadrant={onScanQuadrant}
                                isInCombat={redAlert}
                                themeName={themeName}
                            />
                        )}
                    </div>
                </div>

                {/* Right: Sidebar with Tabs */}
                <div className="flex-shrink-0 w-full md:w-[400px] flex flex-col border-l-2 border-border-dark bg-bg-paper">
                    <nav className="flex-shrink-0 flex border-b-2 border-border-dark bg-bg-paper-lighter">
                        <TabButton id="weapons" label="Weapons" icon={<WeaponIcon className="w-5 h-5" />} />
                        <TabButton id="sensors" label="Sensors" icon={<ScienceIcon className="w-5 h-5" />} />
                        <TabButton id="engineering" label="Eng" icon={<EngineeringIcon className="w-5 h-5" />} />
                        <TabButton id="logs" label="Log" icon={<LogIcon className="w-5 h-5" />} />
                    </nav>

                    <div className="flex-grow overflow-hidden relative">
                         {activeTab === 'weapons' && (
                            <div className="h-full overflow-y-auto p-2">
                                <CommandConsole showEndTurnButton={false} />
                            </div>
                        )}
                        {activeTab === 'sensors' && (
                            <div className="h-full overflow-y-auto p-0">
                                <TargetInfo className="border-none" />
                            </div>
                        )}
                        {activeTab === 'engineering' && (
                            <div className="h-full overflow-y-auto p-0">
                                <ShipStatus className="border-none" />
                            </div>
                        )}
                        {activeTab === 'logs' && (
                            <div className="h-full p-0">
                                <LogPanel logs={logs} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Persistent Footer */}
            <footer className="flex-shrink-0 h-16 bg-bg-paper border-t-2 border-border-dark flex items-center px-4 gap-4 z-30">
                 <div className="flex-grow min-w-0 h-full py-2">
                    <StatusLine>
                        <ThemeSwitcher themeName={themeName} setTheme={setTheme} />
                    </StatusLine>
                 </div>
                 <div className="flex-shrink-0 h-full py-2">
                    <button
                        onClick={() => onEndTurn()}
                        disabled={isTurnResolving || (!!navigationTarget && player.ship.subsystems.engines.health < player.ship.subsystems.engines.maxHealth * 0.5) || player.ship.isStunned}
                        className="btn btn-primary h-full px-8 text-lg uppercase tracking-widest shadow-lg flex items-center justify-center"
                    >
                        {getEndTurnButtonText()}
                    </button>
                 </div>
            </footer>
        </div>
    );
};

export default GameUI;