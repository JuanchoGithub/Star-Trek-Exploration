import React from 'react';
import { WeaponIcon, CycleTargetIcon, TorpedoIcon, EvasiveManeuverIcon, DamageControlIcon, ScanIcon, RetreatIcon, HailIcon } from './Icons';

interface CommandConsoleProps {
  onEndTurn: () => void;
  onFirePhasers: () => void;
  onLaunchTorpedo: () => void;
  onCycleTargets: () => void;
  onEvasiveManeuvers: () => void;
  onInitiateDamageControl: () => void;
  onScanTarget: () => void;
  onInitiateRetreat: () => void;
  onHailTarget: () => void;
  retreatingTurn: number | null;
  currentTurn: number;
  isRepairMode: boolean;
  canFire: boolean;
  canLaunchTorpedo: boolean;
  canCycleTargets: boolean;
  canTakeEvasive: boolean;
  torpedoCount: number;
  isQuadrantView: boolean;
  isTargetFriendly: boolean;
  isTargetHostile: boolean;
  hasDamagedSystems: boolean;
  isTargetScanned: boolean;
  hasTarget: boolean;
  hasEnemy: boolean;
}

const CommandButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode, className?: string, isActive?: boolean}> = ({ onClick, disabled, children, className="", isActive=false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left p-3 font-bold rounded transition-all flex items-center gap-3
      ${
        disabled
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : `bg-blue-600 hover:bg-blue-500 text-white ${className}`
      }
      ${isActive ? 'ring-2 ring-yellow-400' : ''}
    `}
  >
    {children}
  </button>
);


const CommandConsole: React.FC<CommandConsoleProps> = ({ 
    onEndTurn, 
    onFirePhasers, 
    canFire, 
    onLaunchTorpedo, 
    canLaunchTorpedo, 
    torpedoCount, 
    onCycleTargets, 
    canCycleTargets,
    onEvasiveManeuvers,
    canTakeEvasive,
    onInitiateDamageControl,
    onScanTarget,
    onInitiateRetreat,
    onHailTarget,
    retreatingTurn,
    currentTurn,
    isRepairMode,
    isQuadrantView,
    isTargetFriendly,
    isTargetHostile,
    hasDamagedSystems,
    isTargetScanned,
    hasTarget,
    hasEnemy,
}) => {
  const isRetreating = retreatingTurn !== null && retreatingTurn > currentTurn;
  const turnsToRetreat = isRetreating ? retreatingTurn! - currentTurn : 0;
  
  return (
    <div className="flex flex-col space-y-2 mt-auto">
      {hasTarget && !isTargetFriendly && !isTargetHostile && (
         <CommandButton onClick={onHailTarget} disabled={isQuadrantView || isRepairMode || isRetreating} className="bg-teal-600 hover:bg-teal-500">
            <HailIcon className="w-5 h-5" />
            <span className="flex-grow">Hail Vessel</span>
        </CommandButton>
      )}

      {hasTarget && !isTargetScanned && !isTargetFriendly ? (
        <CommandButton onClick={onScanTarget} disabled={isQuadrantView || isRepairMode || isRetreating} className="bg-sky-600 hover:bg-sky-500">
            <ScanIcon className="w-5 h-5" />
            <span className="flex-grow">Scan Target</span>
            <span className="bg-sky-900 text-sky-200 text-xs font-bold px-2 py-1 rounded-full">Free Action</span>
        </CommandButton>
      ) : (
        <>
            <CommandButton onClick={onFirePhasers} disabled={!canFire || isQuadrantView || isTargetFriendly || isRepairMode || isRetreating} className="bg-red-700 hover:bg-red-600">
                <WeaponIcon className="w-5 h-5" /> Fire Phasers
            </CommandButton>
            <CommandButton onClick={onLaunchTorpedo} disabled={!canLaunchTorpedo || isQuadrantView || isTargetFriendly || isRepairMode || isRetreating} className="bg-cyan-700 hover:bg-cyan-600">
                <TorpedoIcon className="w-5 h-5" />
                <span className="flex-grow">Launch Torpedo</span>
                <span className="bg-cyan-900 text-cyan-200 text-xs font-bold px-2 py-1 rounded-full">{torpedoCount}</span>
            </CommandButton>
        </>
      )}
      <CommandButton onClick={onCycleTargets} disabled={!canCycleTargets || isQuadrantView || isRepairMode || isRetreating} className="bg-purple-700 hover:bg-purple-600">
        <CycleTargetIcon className="w-5 h-5" /> Cycle Targets
      </CommandButton>
      <div className="grid grid-cols-2 gap-2">
        <CommandButton onClick={onEvasiveManeuvers} disabled={!canTakeEvasive || isQuadrantView || isRepairMode || isRetreating} className="bg-green-700 hover:bg-green-600">
          <EvasiveManeuverIcon className="w-5 h-5" /> Evasive
        </CommandButton>
        <CommandButton onClick={onInitiateDamageControl} disabled={!hasDamagedSystems || isQuadrantView || isRetreating || isRepairMode} className="bg-yellow-700 hover:bg-yellow-600" isActive={isRepairMode}>
          <DamageControlIcon className="w-5 h-5" /> Repairs
        </CommandButton>
      </div>
       <CommandButton onClick={onInitiateRetreat} disabled={isQuadrantView || isRepairMode || !hasEnemy || isRetreating} className="bg-indigo-700 hover:bg-indigo-600">
          <RetreatIcon className="w-5 h-5" /> 
          {isRetreating ? `Retreating (${turnsToRetreat} turns)` : 'Initiate Retreat'}
      </CommandButton>
      <button 
        onClick={() => onEndTurn()}
        className="w-full p-3 font-bold rounded transition-all bg-orange-600 hover:bg-orange-500 text-white"
      >
        End Turn
      </button>
    </div>
  );
};

export default CommandConsole;