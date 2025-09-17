import React from 'react';
import type { PlayerTurnActions, Position, Ship, Entity } from '../types';
import { ThemeName } from '../hooks/useTheme';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';

interface CommandConsoleProps {
  onEndTurn: () => void;
  onFirePhasers: () => void;
  onLaunchTorpedo: () => void;
  onScanTarget: () => void;
  onInitiateRetreat: () => void;
  onHailTarget: () => void;
  onSendAwayTeam: (type: 'boarding' | 'strike') => void;
  retreatingTurn: number | null;
  currentTurn: number;
  canFire: boolean;
  canLaunchTorpedo: boolean;
  isTargetFriendly: boolean;
  isTargetScanned: boolean;
  hasTarget: boolean;
  hasEnemy: boolean;
  playerTurnActions: PlayerTurnActions;
  navigationTarget: Position | null;
  playerShipPosition: Position;
  isTurnResolving: boolean;
  playerShip: Ship;
  target?: Entity;
  themeName: ThemeName;
}

const CommandButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode, accentColor: string}> = ({ onClick, disabled, children, accentColor }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left p-3 font-bold transition-all flex items-center gap-3 btn btn-accent ${accentColor}`}
  >
    {children}
  </button>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mt-2 mb-1 px-1">{title}</h4>
);


const CommandConsole: React.FC<CommandConsoleProps> = ({ 
    onEndTurn, onFirePhasers, canFire, onLaunchTorpedo, canLaunchTorpedo,
    onScanTarget, onInitiateRetreat, onHailTarget, onSendAwayTeam,
    retreatingTurn, currentTurn, isTargetFriendly, isTargetScanned, hasTarget, hasEnemy, 
    playerTurnActions, navigationTarget, playerShipPosition, isTurnResolving, playerShip, target, themeName
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
  const { WeaponIcon, TorpedoIcon, SecurityIcon, ScanIcon, HailIcon, RetreatIcon } = getFactionIcons(themeName);

  return (
    <div className="flex flex-col h-full">
        <div className="flex-grow space-y-1">
            <SectionHeader title="Combat" />
            <div className="grid grid-cols-2 gap-2">
                <CommandButton onClick={onFirePhasers} disabled={!canFire || isTargetFriendly || isRetreating || isTurnResolving} accentColor="red">
                    <WeaponIcon className="w-5 h-5" /> Fire Phasers
                </CommandButton>
                <CommandButton onClick={onLaunchTorpedo} disabled={!canLaunchTorpedo || isTargetFriendly || isRetreating || isTurnResolving} accentColor="sky">
                    <TorpedoIcon className="w-5 h-5" />
                    Launch Torpedo
                </CommandButton>
            </div>
             <div className="grid grid-cols-2 gap-2">
                <CommandButton onClick={() => onSendAwayTeam('boarding')} disabled={!canBoardOrStrike || isRetreating || isTurnResolving} accentColor="purple">
                    <SecurityIcon className="w-5 h-5" /> Board Ship
                </CommandButton>
                <CommandButton onClick={() => onSendAwayTeam('strike')} disabled={!canBoardOrStrike || isRetreating || isTurnResolving} accentColor="orange">
                    <SecurityIcon className="w-5 h-5" /> Strike Team
                </CommandButton>
            </div>


            <SectionHeader title="Maneuvers & Systems" />
            <div className="grid grid-cols-2 gap-2">
                <CommandButton onClick={onScanTarget} disabled={!hasTarget || isTargetScanned || isRetreating || isTurnResolving} accentColor="yellow">
                    <ScanIcon className="w-5 h-5" /> Scan
                </CommandButton>
                 <CommandButton onClick={onHailTarget} disabled={!hasTarget || isRetreating || isTurnResolving} accentColor="teal">
                    <HailIcon className="w-5 h-5" /> Hail
                </CommandButton>
                 <CommandButton onClick={onInitiateRetreat} disabled={!hasEnemy || isRetreating || isTurnResolving} accentColor="indigo">
                    <RetreatIcon className="w-5 h-5" /> 
                    {isRetreating ? `Retreating (${turnsToRetreat})` : 'Retreat'}
                </CommandButton>
            </div>
        </div>
      <button 
        onClick={() => onEndTurn()}
        disabled={isTurnResolving}
        className="w-full mt-2 p-3 flex-shrink-0 btn btn-primary"
      >
        {getEndTurnButtonText()}
      </button>
    </div>
  );
};

export default CommandConsole;