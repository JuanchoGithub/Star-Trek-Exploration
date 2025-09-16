import React from 'react';
import type { PlayerTurnActions, Position, Ship, Entity } from '../types';
import { WeaponIcon, TorpedoIcon, EvasiveManeuverIcon, DamageControlIcon, ScanIcon, RetreatIcon, HailIcon, SecurityIcon } from './Icons';

interface CommandConsoleProps {
  onEndTurn: () => void;
  onFirePhasers: () => void;
  onLaunchTorpedo: () => void;
  onEvasiveManeuvers: () => void;
  onInitiateDamageControl: () => void;
  onScanTarget: () => void;
  onInitiateRetreat: () => void;
  onHailTarget: () => void;
  onSendAwayTeam: (type: 'boarding' | 'strike') => void;
  retreatingTurn: number | null;
  currentTurn: number;
  canFire: boolean;
  canLaunchTorpedo: boolean;
  canTakeEvasive: boolean;
  isTargetFriendly: boolean;
  hasDamagedSystems: boolean;
  isTargetScanned: boolean;
  hasTarget: boolean;
  hasEnemy: boolean;
  playerTurnActions: PlayerTurnActions;
  navigationTarget: Position | null;
  playerShipPosition: Position;
  isTurnResolving: boolean;
  playerShip: Ship;
  target?: Entity;
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

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-2 mb-1 px-1">{title}</h4>
);


const CommandConsole: React.FC<CommandConsoleProps> = ({ 
    onEndTurn, onFirePhasers, canFire, onLaunchTorpedo, canLaunchTorpedo, onEvasiveManeuvers, canTakeEvasive,
    onInitiateDamageControl, onScanTarget, onInitiateRetreat, onHailTarget, onSendAwayTeam,
    retreatingTurn, currentTurn, isTargetFriendly, hasDamagedSystems, isTargetScanned, hasTarget, hasEnemy, 
    playerTurnActions, navigationTarget, playerShipPosition, isTurnResolving, playerShip, target
}) => {
  const isRetreating = retreatingTurn !== null && retreatingTurn > currentTurn;
  const turnsToRetreat = isRetreating ? retreatingTurn! - currentTurn : 0;
  
  const getEndTurnButtonText = () => {
    if (isTurnResolving) {
        return "Resolving...";
    }
    if (playerTurnActions.combat) {
        return "End Turn & Fire";
    }
    if (navigationTarget && (playerShipPosition.x !== navigationTarget.x || playerShipPosition.y !== navigationTarget.y)) {
        return "End Turn & Move";
    }
    return "End Turn";
  }
  
  const canBoardOrStrike = target?.type === 'ship' && (target.shields / target.maxShields) <= 0.2 && !isTargetFriendly && playerShip.securityTeams.current > 0 && playerShip.subsystems.transporter.health > 0;

  return (
    <div className="flex flex-col h-full">
        <div className="flex-grow space-y-1">
            <SectionHeader title="Combat" />
            <div className="grid grid-cols-2 gap-2">
                <CommandButton onClick={onFirePhasers} disabled={!canFire || isTargetFriendly || isRetreating || isTurnResolving} className="bg-red-700 hover:bg-red-600">
                    <WeaponIcon className="w-5 h-5" /> Fire Phasers
                </CommandButton>
                <CommandButton onClick={onLaunchTorpedo} disabled={!canLaunchTorpedo || isTargetFriendly || isRetreating || isTurnResolving} className="bg-cyan-700 hover:bg-cyan-600">
                    <TorpedoIcon className="w-5 h-5" />
                    Launch Torpedo
                </CommandButton>
            </div>
             <div className="grid grid-cols-2 gap-2">
                <CommandButton onClick={() => onSendAwayTeam('boarding')} disabled={!canBoardOrStrike || isRetreating || isTurnResolving} className="bg-purple-700 hover:bg-purple-600">
                    <SecurityIcon className="w-5 h-5" /> Board Ship
                </CommandButton>
                <CommandButton onClick={() => onSendAwayTeam('strike')} disabled={!canBoardOrStrike || isRetreating || isTurnResolving} className="bg-orange-700 hover:bg-orange-600">
                    <SecurityIcon className="w-5 h-5" /> Strike Team
                </CommandButton>
            </div>


            <SectionHeader title="Maneuvers & Systems" />
            <div className="grid grid-cols-2 gap-2">
                <CommandButton onClick={onEvasiveManeuvers} disabled={!canTakeEvasive || isRetreating || isTurnResolving} className="bg-green-700 hover:bg-green-600" isActive={playerShip.evasive}>
                    <EvasiveManeuverIcon className="w-5 h-5" /> Evasive
                </CommandButton>
                 <CommandButton 
                    onClick={onInitiateDamageControl} 
                    disabled={!hasDamagedSystems || isRetreating || isTurnResolving} 
                    className="bg-yellow-700 hover:bg-yellow-600" 
                    isActive={!!playerShip.repairTarget}
                >
                    <DamageControlIcon className="w-5 h-5" /> 
                    {playerShip.repairTarget ? `Repairing ${playerShip.repairTarget}` : 'Damage Control'}
                </CommandButton>
                <CommandButton onClick={onScanTarget} disabled={!hasTarget || isTargetScanned || isRetreating || isTurnResolving} className="bg-sky-600 hover:bg-sky-500">
                    <ScanIcon className="w-5 h-5" /> Scan
                </CommandButton>
                 <CommandButton onClick={onHailTarget} disabled={!hasTarget || isRetreating || isTurnResolving} className="bg-teal-600 hover:bg-teal-500">
                    <HailIcon className="w-5 h-5" /> Hail
                </CommandButton>
                 <CommandButton onClick={onInitiateRetreat} disabled={!hasEnemy || isRetreating || isTurnResolving} className="bg-indigo-700 hover:bg-indigo-600">
                    <RetreatIcon className="w-5 h-5" /> 
                    {isRetreating ? `Retreating (${turnsToRetreat})` : 'Retreat'}
                </CommandButton>
            </div>
        </div>
      <button 
        onClick={() => onEndTurn()}
        disabled={isTurnResolving}
        className="w-full mt-2 p-3 font-bold rounded transition-all bg-blue-600 hover:bg-blue-500 text-white flex-shrink-0 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {getEndTurnButtonText()}
      </button>
    </div>
  );
};

export default CommandConsole;
