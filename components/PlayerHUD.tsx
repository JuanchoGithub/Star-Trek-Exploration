import React from 'react';
import type { Ship, ShipSubsystems, Weapon, BeamWeapon, ProjectileWeapon } from '../types';
import CommandConsole from './CommandConsole';
import LcarsDecoration from './LcarsDecoration';
import DesperationMoveAnimation from './DesperationMoveAnimation';
import PlaybackControls from './PlaybackControls';
import TargetInfo from './TargetInfo';
import { useGameState } from '../contexts/GameStateContext';
import { useGameActions } from '../contexts/GameActionsContext';
import { useUIState } from '../contexts/UIStateContext';


const PlayerHUD: React.FC = () => {
    const { gameState, targetEntity, isTurnResolving, playerTurnActions, desperationMoveAnimation } = useGameState();
    const { onDockWithStarbase } = useGameActions();
    const { themeName } = useUIState();

    if (!gameState) return null;

    const playerShip = gameState.player.ship;
    const hasEnemy = gameState.currentSector.entities.some(e => e.type === 'ship' && (e.faction === 'Klingon' || e.faction === 'Romulan' || e.faction === 'Pirate'));
    const isAdjacentToStarbase = targetEntity?.type === 'starbase' && Math.max(Math.abs(targetEntity.position.x - playerShip.position.x), Math.abs(targetEntity.position.y - playerShip.position.y)) <= 1;

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
                        <TargetInfo />
                    </div>
                    {isAdjacentToStarbase && !gameState.isDocked && (
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
                    <CommandConsole />
                </div>
            </div>
        </div>
    );
};

export default PlayerHUD;