import React from 'react';
import type { PlayerTurnActions, Position, Ship, Entity, GameState } from '../types';
import { ThemeName } from '../hooks/useTheme';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';

interface CommandConsoleProps {
  onEndTurn: () => void;
  onFirePhasers: () => void;
  onLaunchTorpedo: () => void;
  onInitiateRetreat: () => void;
  onCancelRetreat: () => void;
  onSendAwayTeam: (type: 'boarding' | 'strike') => void;
  retreatingTurn: number | null;
  currentTurn: number;
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
    onEndTurn, onFirePhasers, onLaunchTorpedo,
    onInitiateRetreat, onCancelRetreat, onSendAwayTeam,
    retreatingTurn, currentTurn, hasTarget, hasEnemy, 
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
      if (playerShip.subsystems.engines.health < playerShip.subsystems.engines.maxHealth * 0.5) {
        return "Engines Offline";
      }
      return "End Turn & Move";
    }
    return "End Turn";
  }
  
  const isTargetFriendly = target?.faction === 'Federation';
  const isAdjacentToTarget = target ? Math.max(Math.abs(playerShip.position.x - target.position.x), Math.abs(playerShip.position.y - target.position.y)) <= 1 : false;
  const canBoardOrStrike = target?.type === 'ship' && isAdjacentToTarget && (target.shields / target.maxShields) <= 0.2 && !isTargetFriendly && playerShip.securityTeams.current > 0 && playerShip.subsystems.transporter.health >= playerShip.subsystems.transporter.maxHealth;
  const { WeaponIcon, TorpedoIcon, BoardingIcon, StrikeTeamIcon, RetreatIcon } = getFactionIcons(themeName);

  const canFireOnShip = hasTarget && target?.type === 'ship' && !isTargetFriendly;
  const canFireOnTorpedo = hasTarget && target?.type === 'torpedo_projectile' && target.faction !== 'Federation';
  const canUsePhasers = playerShip.subsystems.weapons.health > 0 && (canFireOnShip || canFireOnTorpedo);
  const canLaunchTorpedoFinal = playerShip.torpedoes.current > 0 && (playerShip.subsystems.weapons.health / playerShip.subsystems.weapons.maxHealth) >= 0.34;

  const isTargetingSubsystem = targeting && targeting.entityId === target?.id && targeting.subsystem;
  const phaserButtonText = isTargetingSubsystem
    ? `Phasers (${targeting.subsystem.charAt(0).toUpperCase()})`
    : 'Phasers';

  return (
    <div className="flex flex-col h-full">
        <div className="flex-grow space-y-1">
            <SectionHeader title="Tactical Actions" />
            <div className="grid grid-cols-2 gap-2">
                <CommandButton onClick={onFirePhasers} disabled={!canUsePhasers || isRetreating || isTurnResolving} accentColor="red">
                    <WeaponIcon className="w-5 h-5" /> {phaserButtonText}
                </CommandButton>
                <CommandButton onClick={onLaunchTorpedo} disabled={!canLaunchTorpedoFinal || !canFireOnShip || isRetreating || isTurnResolving || playerTurnActions.hasLaunchedTorpedo} accentColor="sky">
                    <TorpedoIcon className="w-5 h-5" />
                    Torpedo
                </CommandButton>
                <CommandButton onClick={() => onSendAwayTeam('boarding')} disabled={!canBoardOrStrike || isRetreating || isTurnResolving || playerTurnActions.hasUsedAwayTeam} accentColor="purple">
                    <BoardingIcon className="w-5 h-5" /> Board
                </CommandButton>
                <CommandButton onClick={() => onSendAwayTeam('strike')} disabled={!canBoardOrStrike || isRetreating || isTurnResolving || playerTurnActions.hasUsedAwayTeam} accentColor="orange">
                    <StrikeTeamIcon className="w-5 h-5" /> Strike
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
            disabled={isTurnResolving || (!!navigationTarget && playerShip.subsystems.engines.health < playerShip.subsystems.engines.maxHealth * 0.5)}
            className="flex-grow btn btn-primary"
        >
            {getEndTurnButtonText()}
        </button>
      </div>
    </div>
  );
};

export default CommandConsole;