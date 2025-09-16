import React from 'react';
import type { PlayerTurnActions, Position, Ship, Entity } from '../types';
import { WeaponIcon, TorpedoIcon, EvasiveManeuverIcon, DamageControlIcon, ScanIcon, RetreatIcon, HailIcon, TransporterIcon } from './Icons';

interface CommandConsoleProps {
  onEndTurn: () => void;
  onFirePhasers: () => void;
  onLaunchTorpedo: () => void;
  onEvasiveManeuvers: () => void;
  onInitiateDamageControl: () => void;
  onScanTarget: () => void;
  onInitiateRetreat: () => void;
  onHailTarget: () => void;
  onTransportAction: () => void;
  retreatingTurn: number | null;
  currentTurn: number;
  isRepairMode: boolean;
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
  boardingParty: { targetId: string; strength: number } | null;
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
    onInitiateDamageControl, onScanTarget, onInitiateRetreat, onHailTarget, onTransportAction,
    retreatingTurn, currentTurn, isRepairMode, isTargetFriendly, hasDamagedSystems, isTargetScanned, hasTarget, hasEnemy, 
    playerTurnActions, navigationTarget, playerShipPosition, isTurnResolving, playerShip, target, boardingParty
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
    if (playerTurnActions.evasive) {
        return "End Turn & Evade";
    }
     if (playerTurnActions.repair) {
        return "End Turn & Repair";
    }
    return "End Turn";
  }

  const canTransport = () => {
    if (!target || playerShip.subsystems.transporter.health <= 0 || playerShip.energy.current < 20) return false;
    if (boardingParty) return true; // Can always recall
    if (target.type === 'ship' && target.shields <= 0 && !isTargetFriendly) return true; // Boarding
    if (target.type === 'event_beacon' && target.eventType === 'derelict_ship' && !target.isResolved) return true; // Investigate
    return false;
  }

  const isRepairing = !!playerTurnActions.repair;

  return (
    <div className="flex flex-col h-full">
        <div className="flex-grow space-y-1">
            <SectionHeader title="Combat" />
            <div className="grid grid-cols-2 gap-2">
                <CommandButton onClick={onFirePhasers} disabled={!canFire || isTargetFriendly || isRepairMode || isRetreating || isTurnResolving} className="bg-red-700 hover:bg-red-600">
                    <WeaponIcon className="w-5 h-5" /> Fire Phasers
                </CommandButton>
                <CommandButton onClick={onLaunchTorpedo} disabled={!canLaunchTorpedo || isTargetFriendly || isRepairMode || isRetreating || isTurnResolving} className="bg-cyan-700 hover:bg-cyan-600">
                    <TorpedoIcon className="w-5 h-5" />
                    Launch Torpedo
                </CommandButton>
            </div>

            <SectionHeader title="Maneuvers" />
            <div className="grid grid-cols-2 gap-2">
                <CommandButton onClick={onEvasiveManeuvers} disabled={!canTakeEvasive || isRepairMode || isRetreating || isTurnResolving} className="bg-green-700 hover:bg-green-600" isActive={!!playerTurnActions.evasive}>
                    <EvasiveManeuverIcon className="w-5 h-5" /> Evasive
                </CommandButton>
                <CommandButton onClick={onInitiateRetreat} disabled={isRepairMode || !hasEnemy || isRetreating || isTurnResolving || !!boardingParty} className="bg-indigo-700 hover:bg-indigo-600">
                    <RetreatIcon className="w-5 h-5" /> 
                    {isRetreating ? `Retreating (${turnsToRetreat})` : 'Retreat'}
                </CommandButton>
            </div>

            <SectionHeader title="Systems" />
            <div className="grid grid-cols-2 gap-2">
                <CommandButton onClick={onScanTarget} disabled={!hasTarget || isTargetScanned || isRepairMode || isRetreating || isTurnResolving} className="bg-sky-600 hover:bg-sky-500">
                    <ScanIcon className="w-5 h-5" /> Scan
                </CommandButton>
                 <CommandButton onClick={onHailTarget} disabled={!hasTarget || isRepairMode || isRetreating || isTurnResolving} className="bg-teal-600 hover:bg-teal-500">
                    <HailIcon className="w-5 h-5" /> Hail
                </CommandButton>
            </div>
             <CommandButton onClick={onTransportAction} disabled={!canTransport() || isRepairMode || isRetreating || isTurnResolving} className="bg-purple-700 hover:bg-purple-600">
                <TransporterIcon className="w-5 h-5" /> {boardingParty ? 'Recall Party' : 'Transport'}
            </CommandButton>
             <CommandButton 
                onClick={onInitiateDamageControl} 
                disabled={!hasDamagedSystems || isRetreating || isRepairMode || isTurnResolving} 
                className="bg-yellow-700 hover:bg-yellow-600" 
                isActive={isRepairMode || isRepairing}
            >
                <DamageControlIcon className="w-5 h-5" /> 
                {isRepairing ? `Repairing ${playerTurnActions.repair}` : 'Damage Control'}
            </CommandButton>
        </div>
      <button 
        onClick={() => onEndTurn()}
        disabled={isTurnResolving}
        className="w-full mt-2 p-3 font-bold rounded transition-all bg-orange-600 hover:bg-orange-500 text-white flex-shrink-0 disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {getEndTurnButtonText()}
      </button>
    </div>
  );
};

export default CommandConsole;