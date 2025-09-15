import React from 'react';
import type { GameState, Entity, Ship } from '../types';
import ShipStatus from './ShipStatus';
import EnergyAllocator from './EnergyAllocator';
import CommandConsole from './CommandConsole';
import { TargetIcon, QuadrantIcon, SectorIcon, DilithiumIcon } from './Icons';

interface PlayerHUDProps {
  gameState: GameState;
  onEnergyChange: (type: 'weapons' | 'shields' | 'engines', value: number) => void;
  onEndTurn: () => void;
  onFirePhasers: () => void;
  onLaunchTorpedo: () => void;
  onCycleTargets: () => void;
  onEvasiveManeuvers: () => void;
  target: Entity | undefined;
  currentView: 'sector' | 'quadrant';
  onSetView: (view: 'sector' | 'quadrant') => void;
  isDocked: boolean;
  onRechargeDilithium: () => void;
}

const SubsystemStatus: React.FC<{label: string; health: number; maxHealth: number}> = ({ label, health, maxHealth }) => {
    const healthPercentage = (health / maxHealth) * 100;
    let color = 'text-green-400';
    if (healthPercentage < 60) color = 'text-yellow-400';
    if (healthPercentage < 25) color = 'text-red-500';

    return (
        <div className="flex justify-between text-xs">
            <span>{label}:</span>
            <span className={`font-bold ${color}`}>{Math.round(healthPercentage)}%</span>
        </div>
    );
}

const PlayerHUD: React.FC<PlayerHUDProps> = ({ 
  gameState, 
  onEnergyChange, 
  onEndTurn, 
  onFirePhasers, 
  onLaunchTorpedo, 
  onCycleTargets, 
  onEvasiveManeuvers, 
  target,
  currentView,
  onSetView,
  isDocked,
  onRechargeDilithium
}) => {
  const playerShip = gameState.player.ship;
  const canCycleTargets = gameState.currentSector.entities.some(e => {
    if (e.type !== 'ship') return false;
    return e.faction !== 'Federation' && e.hull > 0;
  });

  const canPerformActions = !playerShip.isEvasive && currentView === 'sector';
  const canFirePhasers = !!target && target.type === 'ship' && canPerformActions;
  const canLaunchTorpedo = canFirePhasers && playerShip.torpedoes > 0;

  return (
    <div className="bg-gray-800 border-2 border-blue-400 p-4 rounded-md flex flex-col gap-4 h-full">
      <ShipStatus ship={playerShip} />
      <div className="w-full border-t border-blue-600 my-2"></div>
      
      {isDocked ? (
        <div className="bg-gray-900 p-3 rounded flex-grow flex flex-col">
          <h3 className="text-lg font-bold text-blue-300 mb-2">Starbase Operations</h3>
          <p className="text-sm text-gray-400 mb-4">Welcome. All facilities are at your disposal, Captain.</p>
          <div className="mt-auto space-y-2">
            <button
                onClick={onRechargeDilithium}
                className="w-full text-left p-3 font-bold rounded transition-all flex items-center gap-3 bg-pink-600 hover:bg-pink-500 text-white"
            >
                <DilithiumIcon className="w-5 h-5" />
                <span className="flex-grow">Recharge Dilithium</span>
                <span className="bg-pink-900 text-pink-200 text-xs font-bold px-2 py-1 rounded-full">1 Turn</span>
            </button>
            <button
                onClick={() => onEndTurn()}
                className="w-full p-3 font-bold rounded transition-all bg-orange-600 hover:bg-orange-500 text-white"
            >
                End Turn (Remain Docked)
            </button>
          </div>
        </div>
      ) : (
        <>
          <EnergyAllocator 
            allocation={playerShip.powerAllocation} 
            onEnergyChange={onEnergyChange} 
          />
          <div className="w-full border-t border-blue-600 my-2"></div>

          <div className="bg-gray-900 p-3 rounded flex-grow">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-blue-300 flex items-center gap-2"><TargetIcon className="w-5 h-5"/>Selected Target</h3>
                <button 
                  onClick={() => onSetView(currentView === 'sector' ? 'quadrant' : 'sector')}
                  className="px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-500 rounded flex items-center gap-1"
                >
                  {currentView === 'sector' ? <QuadrantIcon className="w-4 h-4" /> : <SectorIcon className="w-4 h-4" />}
                  {currentView === 'sector' ? 'Quadrant View' : 'Sector View'}
                </button>
            </div>
            {target && currentView === 'sector' ? (
              <div className="text-orange-300 space-y-1">
                <p className="font-bold text-base">{target.name}</p>
                {target.type === 'ship' && (
                  <>
                    <p className="text-sm">Hull: {target.hull}%, Shields: {target.shields.fore}</p>
                    <div className="pt-1 mt-1 border-t border-gray-700">
                        <SubsystemStatus label="Weapons" {...target.subsystems.weapons} />
                        <SubsystemStatus label="Engines" {...target.subsystems.engines} />
                        <SubsystemStatus label="Shield Gen" {...target.subsystems.shields} />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-gray-400">
                {currentView === 'quadrant' ? 'Viewing Quadrant Map' : 'No target selected.'}
              </p>
            )}
          </div>

          <CommandConsole 
            onEndTurn={onEndTurn}
            onFirePhasers={onFirePhasers}
            onLaunchTorpedo={onLaunchTorpedo}
            onCycleTargets={onCycleTargets}
            onEvasiveManeuvers={onEvasiveManeuvers}
            canFire={canFirePhasers}
            canLaunchTorpedo={canLaunchTorpedo}
            canCycleTargets={canCycleTargets && currentView === 'sector'}
            canTakeEvasive={canPerformActions}
            torpedoCount={playerShip.torpedoes}
            isQuadrantView={currentView === 'quadrant'}
          />
        </>
      )}
    </div>
  );
};

export default PlayerHUD;