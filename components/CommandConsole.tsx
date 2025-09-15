import React from 'react';
import { WeaponIcon, CycleTargetIcon, TorpedoIcon, EvasiveManeuverIcon, DamageControlIcon, ScanIcon } from './Icons';

interface CommandConsoleProps {
  onEndTurn: () => void;
  onFirePhasers: () => void;
  onLaunchTorpedo: () => void;
  onCycleTargets: () => void;
  onEvasiveManeuvers: () => void;
  onInitiateDamageControl: () => void;
  onScanTarget: () => void;
  isRepairMode: boolean;
  canFire: boolean;
  canLaunchTorpedo: boolean;
  canCycleTargets: boolean;
  canTakeEvasive: boolean;
  torpedoCount: number;
  isQuadrantView: boolean;
  isTargetFriendly: boolean;
  hasDamagedSystems: boolean;
  isTargetScanned: boolean;
  hasTarget: boolean;
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
    isRepairMode,
    isQuadrantView,
    isTargetFriendly,
    hasDamagedSystems,
    isTargetScanned,
    hasTarget,
}) => {
  return (
    <div className="flex flex-col space-y-2 mt-auto">
      {hasTarget && !isTargetScanned && !isTargetFriendly ? (
        <CommandButton onClick={onScanTarget} disabled={isQuadrantView || isRepairMode} className="bg-teal-600 hover:bg-teal-500">
            <ScanIcon className="w-5 h-5" />
            <span className="flex-grow">Scan Target</span>
            <span className="bg-teal-900 text-teal-200 text-xs font-bold px-2 py-1 rounded-full">1 Turn</span>
        </CommandButton>
      ) : (
        <>
            <CommandButton onClick={onFirePhasers} disabled={!canFire || isQuadrantView || isTargetFriendly || isRepairMode} className="bg-red-700 hover:bg-red-600">
                <WeaponIcon className="w-5 h-5" /> Fire Phasers
            </CommandButton>
            <CommandButton onClick={onLaunchTorpedo} disabled={!canLaunchTorpedo || isQuadrantView || isTargetFriendly || isRepairMode} className="bg-cyan-700 hover:bg-cyan-600">
                <TorpedoIcon className="w-5 h-5" />
                <span className="flex-grow">Launch Torpedo</span>
                <span className="bg-cyan-900 text-cyan-200 text-xs font-bold px-2 py-1 rounded-full">{torpedoCount}</span>
            </CommandButton>
        </>
      )}
      <CommandButton onClick={onCycleTargets} disabled={!canCycleTargets || isQuadrantView || isRepairMode} className="bg-purple-700 hover:bg-purple-600">
        <CycleTargetIcon className="w-5 h-5" /> Cycle Targets
      </CommandButton>
      <div className="grid grid-cols-2 gap-2">
        <CommandButton onClick={onEvasiveManeuvers} disabled={!canTakeEvasive || isQuadrantView || isRepairMode} className="bg-green-700 hover:bg-green-600">
          <EvasiveManeuverIcon className="w-5 h-5" /> Evasive
        </CommandButton>
        <CommandButton onClick={onInitiateDamageControl} disabled={!hasDamagedSystems || isQuadrantView || !canTakeEvasive} className="bg-yellow-700 hover:bg-yellow-600" isActive={isRepairMode}>
          <DamageControlIcon className="w-5 h-5" /> Repairs
        </CommandButton>
      </div>
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