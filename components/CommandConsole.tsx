import React from 'react';
import type { PlayerTurnActions, Position, Ship, Entity, GameState } from '../types';
import { ThemeName } from '../hooks/useTheme';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';

interface CommandConsoleProps {
  onEndTurn: () => void;
  onFirePhasers: () => void;
  onLaunchTorpedo: () => void;
  onScanTarget: () => void;
  onInitiateRetreat: () => void;
  onCancelRetreat: () => void;
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
  targeting?: GameState['player']['targeting'];
  themeName: ThemeName;
}

const CommandButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode, accentColor: string}> = ({ onClick, disabled, children, accentColor }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left font-bold transition-all flex items-center gap-3 btn btn-accent ${accentColor}`}
  >
    {children}
  </button>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mt-2 mb-1 px-1">{title}</h4>
);


const CommandConsole: React.FC<CommandConsoleProps> = ({ 
    onEndTurn, onFirePhasers, canFire, onLaunchTorpedo, canLaunchTorpedo,
    onScanTarget, onInitiateRetreat, onCancelRetreat, onHailTarget, onSendAwayTeam,
    retreatingTurn, currentTurn, isTargetFriendly, isTargetScanned, hasTarget, hasEnemy, 
    playerTurnActions, navigationTarget, playerShipPosition, isTurnResolving, playerShip, target, targeting, themeName
}) => {
  const isRetreating = retreatingTurn !== null && retreatingTurn >= currentTurn;
  const turnsToRetreat = isRetreating ? retreatingTurn! - currentTurn : 0;
  
  const getEndTurnButtonText = () => {
    if (isTurnResolving) {
        return "Resolving...";
    }
    if (isRetreating && turnsToRetreat === 0) {
        return "Engage Emergency Warp";
    }
    if (playerTurnActions.combat) {
        return "End Turn & Fire";
    }
    if (navigationTarget && (playerShipPosition.x !== navigationTarget.x || playerShipPosition.y !== navigationTarget.y)) {
        return "End Turn & Move";
    }
    return "End Turn";
  }
  
  const isAdjacentToTarget = target ? Math.max(Math.abs(playerShip.position.x - target.position.x), Math.abs(playerShip.position.y - target.position.y)) <= 1 : false;
  const canBoardOrStrike = target?.type === 'ship' && isAdjacentToTarget && (target.shields / target.maxShields) <= 0.2 && !isTargetFriendly && playerShip.securityTeams.current > 0 && playerShip.subsystems.transporter.health > 0;
  const { WeaponIcon, TorpedoIcon, BoardingIcon, StrikeTeamIcon, ScanIcon, HailIcon, RetreatIcon } = getFactionIcons(themeName);

  const canFireOnShip = hasTarget && target?.type === 'ship' && !isTargetFriendly;
  const canFireOnTorpedo = hasTarget && target?.type === 'torpedo_projectile' && target.faction !== 'Federation';
  const canUsePhasers = canFire && (canFireOnShip || canFireOnTorpedo);

  const isTargetingSubsystem = targeting && targeting.entityId === target?.id && targeting.subsystem;
  const phaserButtonText = isTargetingSubsystem
    ? `Phasers (${targeting.subsystem.charAt(0).toUpperCase()})`
    : 'Phasers';

  return (
    <div className="flex flex-col h-full">
        <div className="flex-grow space-y-1">
            <SectionHeader title="Combat" />
            <div className="grid grid-cols-2 gap-2">
                <CommandButton onClick={onFirePhasers} disabled={!canUsePhasers || isRetreating || isTurnResolving} accentColor="red">
                    <WeaponIcon className="w-5 h-5" /> {phaserButtonText}
                </CommandButton>
                <CommandButton onClick={onLaunchTorpedo} disabled={!canLaunchTorpedo || !canFireOnShip || isRetreating || isTurnResolving} accentColor="sky">
                    <TorpedoIcon className="w-5 h-5" />
                    Torpedo
                </CommandButton>
            </div>
             <div className="grid grid-cols-2 gap-2">
                <CommandButton onClick={() => onSendAwayTeam('boarding')} disabled={!canBoardOrStrike || isRetreating || isTurnResolving} accentColor="purple">
                    <BoardingIcon className="w-5 h-5" /> Board Ship
                </CommandButton>
                <CommandButton onClick={() => onSendAwayTeam('strike')} disabled={!canBoardOrStrike || isRetreating || isTurnResolving} accentColor="orange">
                    <StrikeTeamIcon className="w-5 h-5" /> Strike Team
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
            </div>
        </div>
      <div className="flex items-center gap-2 mt-2 flex-shrink-0">
        {isRetreating ? (
            <button
                onClick={onCancelRetreat}
                disabled={isTurnResolving || turnsToRetreat === 0}
                className="font-bold transition-all flex items-center gap-3 btn btn-accent yellow flex-shrink-0"
            >
                <RetreatIcon className="w-5 h-5" />
                {turnsToRetreat > 0 ? `Cancel Retreat (${turnsToRetreat})` : 'Warp Ready'}
            </button>
        ) : (
            <button
                onClick={onInitiateRetreat}
                disabled={!hasEnemy || isTurnResolving}
                className="font-bold transition-all flex items-center gap-3 btn btn-accent indigo flex-shrink-0"
            >
                <RetreatIcon className="w-5 h-5" />
                Retreat
            </button>
        )}
        <button
            onClick={() => onEndTurn()}
            disabled={isTurnResolving}
            className="flex-grow btn btn-primary"
        >
            {getEndTurnButtonText()}
        </button>
      </div>
    </div>
  );
};

export default CommandConsole;