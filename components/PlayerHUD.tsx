import React from 'react';
import type { GameState, Entity, PlayerTurnActions, Position, Ship, ShipSubsystems } from '../types';
import CommandConsole from './CommandConsole';
import { ThemeName } from '../hooks/useTheme';
import LcarsDecoration from './LcarsDecoration';
import DesperationMoveAnimation from './DesperationMoveAnimation';
import PlaybackControls from './PlaybackControls';
import TargetInfo from './TargetInfo';


interface PlayerHUDProps {
  gameState: GameState;
  onEndTurn: () => void;
  onFireWeapon: (weaponId: string, targetId: string) => void;
  onToggleCloak: () => void;
  target?: Entity;
  isDocked: boolean;
  onDockWithStarbase: () => void;
  onUndock: () => void;
  onScanTarget: () => void;
  onInitiateRetreat: () => void;
  onCancelRetreat: () => void;
  onStartAwayMission: (planetId: string) => void;
  onHailTarget: () => void;
  playerTurnActions: PlayerTurnActions;
  navigationTarget: Position | null;
  isTurnResolving: boolean;
  onSendAwayTeam: (targetId: string, type: 'boarding' | 'strike') => void;
  themeName: ThemeName;
  desperationMoveAnimation: {
      source: Ship;
      target?: Ship;
      type: string;
      outcome?: 'success' | 'failure';
  } | null;
  selectedSubsystem: keyof ShipSubsystems | null;
  onSelectSubsystem: (subsystem: keyof ShipSubsystems | null) => void;
  onEnterOrbit: (planetId: string) => void;
  orbitingPlanetId: string | null;
  // Props for simulator history control
  isViewingHistory?: boolean;
  historyIndex?: number;
  onResumeFromHistory?: () => void;
  onStepHistory?: (direction: number) => void;
}

const PlayerHUD: React.FC<PlayerHUDProps> = ({
    gameState, onEndTurn, onFireWeapon, onToggleCloak,
    target, isDocked, onDockWithStarbase, onUndock,
    onScanTarget, onInitiateRetreat, onCancelRetreat, onStartAwayMission, onHailTarget,
    playerTurnActions, navigationTarget, isTurnResolving, onSendAwayTeam, themeName,
    desperationMoveAnimation, selectedSubsystem, onSelectSubsystem, onEnterOrbit, orbitingPlanetId,
    isViewingHistory, historyIndex, onResumeFromHistory, onStepHistory,
}) => {
    const playerShip = gameState.player.ship;
    
    const hasEnemy = gameState.currentSector.entities.some(e => e.type === 'ship' && (e.faction === 'Klingon' || e.faction === 'Romulan' || e.faction === 'Pirate'));
    const isAdjacentToStarbase = target?.type === 'starbase' && Math.max(Math.abs(target.position.x - playerShip.position.x), Math.abs(target.position.y - playerShip.position.y)) <= 1;

    return (
        <div className="relative">
            {themeName === 'federation' && (
                <>
                    <LcarsDecoration type="label" label="TGT-PROC" className="top-0 left-1/4" seed={1} />
                    <LcarsDecoration type="numbers" className="top-0 right-1/4" seed={2} />
                    <LcarsDecoration type="label" label="CMD-SEQ" className="bottom-0 left-1/3" seed={3} />
                </>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative flex flex-col space-y-2">
                    <div className="flex-grow">
                        {target ? (
                            <TargetInfo 
                                target={target} 
                                themeName={themeName} 
                                selectedSubsystem={selectedSubsystem} 
                                onSelectSubsystem={onSelectSubsystem}
                                playerShip={playerShip}
                                hasEnemy={hasEnemy}
                                orbitingPlanetId={orbitingPlanetId}
                                isTurnResolving={isTurnResolving}
                                onScanTarget={onScanTarget}
                                onHailTarget={onHailTarget}
                                onStartAwayMission={onStartAwayMission}
                                onEnterOrbit={onEnterOrbit}
                                isDocked={isDocked}
// FIX: Pass the onUndock prop to the TargetInfo component.
                                onUndock={onUndock}
                            />
                        ) : (
                            <div className="panel-style p-3 flex flex-col justify-center text-center h-full">
                                <h3 className="text-lg font-bold text-text-secondary">No Target Selected</h3>
                                <p className="text-sm text-text-disabled">Click an object on the map to select it.</p>
                            </div>
                        )}
                    </div>
                    {isAdjacentToStarbase && !isDocked && (
                        <div className="panel-style p-3 text-center flex-shrink-0">
                            <button onClick={onDockWithStarbase} className="w-full btn btn-primary">Initiate Docking</button>
                        </div>
                    )}
                    
                    {desperationMoveAnimation && (
                        <DesperationMoveAnimation 
                            animation={desperationMoveAnimation}
                        />
                    )}
                </div>

                <div className="flex flex-col h-full">
                    {isViewingHistory ? (
                         <PlaybackControls
                            currentIndex={historyIndex!}
                            maxIndex={(gameState.replayHistory || []).length > 0 ? gameState.replayHistory!.length - 1 : 0}
                            isPlaying={false}
                            isTurnResolving={isTurnResolving}
                            onStep={(dir) => onStepHistory && onStepHistory(dir)}
                            onSliderChange={() => {}} // Not implemented for this view
                            onResumeFromHistory={onResumeFromHistory}
                        />
                    ) : (
                        <CommandConsole 
                            gameState={gameState}
                            onEndTurn={onEndTurn}
                            onFireWeapon={onFireWeapon}
                            onInitiateRetreat={onInitiateRetreat}
                            onCancelRetreat={onCancelRetreat}
                            onSendAwayTeam={(type) => target && onSendAwayTeam(target.id, type)}
                            onToggleCloak={onToggleCloak}
                            retreatingTurn={playerShip.retreatingTurn}
                            currentTurn={gameState.turn}
                            hasTarget={!!target}
                            hasEnemy={hasEnemy}
                            playerTurnActions={playerTurnActions}
                            navigationTarget={navigationTarget}
                            playerShipPosition={playerShip.position}
                            isTurnResolving={isTurnResolving}
                            playerShip={playerShip}
                            target={target}
                            targeting={gameState.player.targeting}
                            themeName={themeName}
                            isDocked={isDocked}
                            onUndock={onUndock}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlayerHUD;