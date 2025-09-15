import React from 'react';
import { WeaponIcon, CycleTargetIcon, TorpedoIcon, EvasiveManeuverIcon } from './Icons';

interface CommandConsoleProps {
  onEndTurn: () => void;
  onFirePhasers: () => void;
  onLaunchTorpedo: () => void;
  onCycleTargets: () => void;
  onEvasiveManeuvers: () => void;
  canFire: boolean;
  canLaunchTorpedo: boolean;
  canCycleTargets: boolean;
  canTakeEvasive: boolean;
  torpedoCount: number;
  isQuadrantView: boolean;
}

const CommandButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode, className?: string}> = ({ onClick, disabled, children, className="" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left p-3 font-bold rounded transition-all flex items-center gap-3
      ${
        disabled
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : `bg-blue-600 hover:bg-blue-500 text-white ${className}`
      }`}
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
    isQuadrantView
}) => {
  return (
    <div className="flex flex-col space-y-2 mt-auto">
      <CommandButton onClick={onFirePhasers} disabled={!canFire || isQuadrantView} className="bg-red-700 hover:bg-red-600">
        <WeaponIcon className="w-5 h-5" /> Fire Phasers
      </CommandButton>
       <CommandButton onClick={onLaunchTorpedo} disabled={!canLaunchTorpedo || isQuadrantView} className="bg-cyan-700 hover:bg-cyan-600">
        <TorpedoIcon className="w-5 h-5" />
        <span className="flex-grow">Launch Torpedo</span>
        <span className="bg-cyan-900 text-cyan-200 text-xs font-bold px-2 py-1 rounded-full">{torpedoCount}</span>
      </CommandButton>
      <CommandButton onClick={onCycleTargets} disabled={!canCycleTargets || isQuadrantView} className="bg-purple-700 hover:bg-purple-600">
        <CycleTargetIcon className="w-5 h-5" /> Cycle Targets
      </CommandButton>
      <CommandButton onClick={onEvasiveManeuvers} disabled={!canTakeEvasive || isQuadrantView} className="bg-green-700 hover:bg-green-600">
        <EvasiveManeuverIcon className="w-5 h-5" /> Evasive Maneuvers
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
