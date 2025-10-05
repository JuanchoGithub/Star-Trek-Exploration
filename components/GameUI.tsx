import React, { useState } from 'react';
import Resizer from './Resizer';
import SidebarContent from './SidebarContent';
import SectorView from './SectorView';
import QuadrantView from './QuadrantView';
import WarpAnimation from './WarpAnimation';
import CombatFXLayer from './CombatFXLayer';
import PlayerHUD from './PlayerHUD';
import StatusLine from './StatusLine';
import ThemeSwitcher from './ThemeSwitcher';
import { ScienceIcon } from '../assets/ui/icons';
import { GameState, Entity, PlayerTurnActions, Position, ShipSubsystems } from '../types';
import { ThemeName } from '../hooks/useTheme';

interface GameUIProps {
    gameState: GameState;
    themeName: ThemeName;
    setTheme: (name: ThemeName) => void;
    currentView: 'sector' | 'quadrant';
    onSetView: (view: 'sector' | 'quadrant') => void;
    isWarping: boolean;
    entityRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
    selectedTargetId: string | null;
    onSelectTarget: (id: string | null) => void;
    navigationTarget: Position | null;
    onSetNavigationTarget: (pos: Position | null) => void;
    isResizing: boolean;
    onWarp: (pos: { qx: number, qy: number }) => void;
    onScanQuadrant: (pos: { qx: number, qy: number }) => void;
    handleHorizontalResize: (movementY: number) => void;
    handleVerticalResize: (movementX: number) => void;
    setIsResizing: (isResizing: boolean) => void;
    bottomPanelHeight: number;
    sidebarWidth: number;
    targetEntity: Entity | undefined;
    isDocked: boolean;
    playerTurnActions: PlayerTurnActions;
    isTurnResolving: boolean;
    desperationMoveAnimation: GameState['desperationMoveAnimations'][0] | null;
    onEndTurn: () => void;
    onFireWeapon: (weaponId: string, targetId: string) => void;
    onDockWithStarbase: () => void;
    onUndock: () => void;
    onScanTarget: () => void;
    onInitiateRetreat: () => void;
    onCancelRetreat: () => void;
    onStartAwayMission: (planetId: string) => void;
    onHailTarget: () => void;
    onSendAwayTeam: (targetId: string, type: "boarding" | "strike") => void;
    onSelectSubsystem: (subsystem: keyof ShipSubsystems | null) => void;
    onEnterOrbit: (planetId: string) => void;
    orbitingPlanetId: string | null;
    onToggleCloak: () => void;
    onTogglePointDefense: () => void;
    onEnergyChange: (changedKey: "weapons" | "shields" | "engines", value: number) => void;
    onToggleRedAlert: () => void;
    onEvasiveManeuvers: () => void;
    onSelectRepairTarget: (subsystem: "hull" | keyof ShipSubsystems | null) => void;
    setShowLogModal: (show: boolean) => void;
    setShowGameMenu: (show: boolean) => void;
    isTouchDevice: boolean;
}

const GameUI: React.FC<GameUIProps> = (props) => {
    const {
        gameState, themeName, setTheme, currentView, onSetView, isWarping,
        entityRefs, selectedTargetId, onSelectTarget, navigationTarget,
        onSetNavigationTarget, isResizing, onWarp, onScanQuadrant, handleHorizontalResize,
        handleVerticalResize, setIsResizing, bottomPanelHeight, sidebarWidth, targetEntity,
        isDocked, playerTurnActions, isTurnResolving, desperationMoveAnimation, onEndTurn,
        onFireWeapon, onDockWithStarbase, onUndock, onScanTarget, onInitiateRetreat,
        onCancelRetreat, onStartAwayMission, onHailTarget, onSendAwayTeam,
        onSelectSubsystem, onEnterOrbit, orbitingPlanetId, onToggleCloak, onTogglePointDefense,
        onEnergyChange, onToggleRedAlert, onEvasiveManeuvers, onSelectRepairTarget,
        setShowLogModal, setShowGameMenu, isTouchDevice
    } = props;

    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const { player, logs, currentSector: sector, redAlert, quadrantMap } = gameState;
    const computerHealthPercent = (player.ship.subsystems.computer.health / player.ship.subsystems.computer.maxHealth) * 100;

    return (
        <div className="h-full w-full flex flex-col p-2 md:p-4 gap-2 md:gap-0 relative z-10">
            <main className="flex-grow min-h-0">
                <div className="h-full flex flex-col md:flex-row">
                    {/* Main Content Area */}
                    <div className="flex-grow flex flex-col min-w-0 min-h-0">
                        {/* Top Panel (Map) */}
                        <div className="flex-grow min-h-0">
                            <section className="flex flex-row gap-2 h-full">
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => onSetView('sector')}
                                        className={`flex-grow w-12 flex items-center justify-center p-1 rounded-md font-bold transition-colors ${
                                            currentView === 'sector'
                                                ? 'bg-primary-main text-primary-text'
                                                : 'bg-secondary-main text-secondary-text hover:bg-secondary-light'
                                        }`}
                                    >
                                        <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap">Sector View</span>
                                    </button>
                                    <button
                                        onClick={() => onSetView('quadrant')}
                                        className={`flex-grow w-12 flex items-center justify-center p-1 rounded-md font-bold transition-colors ${
                                            currentView === 'quadrant'
                                                ? 'bg-primary-main text-primary-text'
                                                : 'bg-secondary-main text-secondary-text hover:bg-secondary-light'
                                        }`}
                                        disabled={computerHealthPercent < 100}
                                        title={computerHealthPercent < 100 ? "Quadrant Map offline: Computer damaged" : "Quadrant Map"}
                                    >
                                        <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap">Quadrant Map</span>
                                    </button>
                                </div>
                                <div className="relative flex-grow flex justify-center items-center min-h-0">
                                    {isWarping && <WarpAnimation />}
                                    <div className="w-full h-full aspect-[11/10] relative">
                                        {currentView === 'sector' ? (
                                            <>
                                                <CombatFXLayer effects={gameState.combatEffects} entities={[player.ship, ...sector.entities]} entityRefs={entityRefs} />
                                                <SectorView 
                                                    entities={sector.entities} 
                                                    playerShip={player.ship}
                                                    selectedTargetId={selectedTargetId}
                                                    onSelectTarget={onSelectTarget}
                                                    navigationTarget={navigationTarget}
                                                    onSetNavigationTarget={onSetNavigationTarget}
                                                    sector={sector}
                                                    themeName={themeName}
                                                    isResizing={isResizing}
                                                    entityRefs={entityRefs}
                                                />
                                            </>
                                        ) : (
                                            <QuadrantView
                                                quadrantMap={quadrantMap}
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
                            </section>
                        </div>

                         {/* Horizontal Resizer - only on desktop */}
                        <div className="hidden md:block py-2">
                            <Resizer
                                onDrag={handleHorizontalResize}
                                orientation="horizontal"
                                onResizeStart={() => setIsResizing(true)}
                                onResizeEnd={() => setIsResizing(false)}
                            />
                        </div>

                         {/* Bottom Panel (HUD) */}
                        <div className="flex-shrink-0" style={!isTouchDevice ? { height: `${bottomPanelHeight}px` } : {}}>
                            <section className="h-full">
                                <PlayerHUD
                                    gameState={gameState} onEndTurn={onEndTurn} onFireWeapon={onFireWeapon}
                                    target={targetEntity} isDocked={isDocked} onDockWithStarbase={onDockWithStarbase} onUndock={onUndock}
                                    onScanTarget={onScanTarget}
                                    onInitiateRetreat={onInitiateRetreat} onCancelRetreat={onCancelRetreat} onStartAwayMission={onStartAwayMission}
                                    onHailTarget={onHailTarget} playerTurnActions={playerTurnActions} navigationTarget={navigationTarget}
                                    isTurnResolving={isTurnResolving} onSendAwayTeam={onSendAwayTeam} themeName={themeName}
                                    desperationMoveAnimation={desperationMoveAnimation}
                                    selectedSubsystem={player.targeting?.subsystem || null}
                                    onSelectSubsystem={onSelectSubsystem}
                                    onEnterOrbit={onEnterOrbit}
                                    orbitingPlanetId={gameState.orbitingPlanetId}
                                    onToggleCloak={onToggleCloak}
                                />
                            </section>
                        </div>
                    </div>
                    
                    {/* Vertical Resizer - only on desktop */}
                    <div className="hidden md:block px-2">
                        <Resizer
                            onDrag={handleVerticalResize}
                            orientation="vertical"
                            onResizeStart={() => setIsResizing(true)}
                            onResizeEnd={() => setIsResizing(false)}
                        />
                    </div>
                    
                    {/* Sidebar */}
                    <aside className="hidden md:flex flex-shrink-0" style={{ width: `${sidebarWidth}px` }}>
                       <SidebarContent 
                            gameState={gameState}
                            selectedTargetId={selectedTargetId}
                            onEnergyChange={onEnergyChange}
                            onToggleRedAlert={onToggleRedAlert}
                            onEvasiveManeuvers={onEvasiveManeuvers}
                            onSelectRepairTarget={onSelectRepairTarget}
                            onToggleCloak={onToggleCloak}
                            onTogglePointDefense={onTogglePointDefense}
                            themeName={themeName}
                       />
                    </aside>
                </div>
            </main>
            <footer className="flex-shrink-0 h-16 mt-2 md:mt-4">
                <StatusLine 
                    latestLog={logs.length > 0 ? logs[logs.length-1] : null}
                    onOpenLog={() => setShowLogModal(true)}
                    onOpenGameMenu={() => setShowGameMenu(true)}
                >
                    <ThemeSwitcher themeName={themeName} setTheme={setTheme} />
                </StatusLine>
            </footer>
        
            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                 <div className="md:hidden fixed inset-0 z-30 flex justify-end" aria-modal="true" role="dialog">
                    <div className="fixed inset-0 bg-black/60" onClick={() => setShowMobileSidebar(false)} />
                    <aside className="relative z-40 w-full max-w-xs bg-bg-default p-4 h-full">
                        <SidebarContent 
                            gameState={gameState}
                            selectedTargetId={selectedTargetId}
                            onEnergyChange={onEnergyChange}
                            onToggleRedAlert={onToggleRedAlert}
                            onEvasiveManeuvers={onEvasiveManeuvers}
                            onSelectRepairTarget={onSelectRepairTarget}
                            onToggleCloak={onToggleCloak}
                            onTogglePointDefense={onTogglePointDefense}
                            themeName={themeName}
                        />
                    </aside>
                </div>
            )}
            
            {/* Floating 'Systems' button for touch devices */}
            {isTouchDevice && (
                <div className="md:hidden fixed bottom-20 right-4 z-20">
                    <button
                        onClick={() => setShowMobileSidebar(true)}
                        className="btn btn-secondary rounded-full p-4 aspect-square flex items-center justify-center shadow-lg"
                        aria-label="Open Ship Systems"
                    >
                       <ScienceIcon className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameUI;
