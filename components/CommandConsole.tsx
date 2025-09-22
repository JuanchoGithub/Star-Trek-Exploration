

import React from 'react';
import type { PlayerTurnActions, Position, Ship, Entity, GameState } from '../types';
import { ThemeName } from '../hooks/useTheme';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';
import { shipClasses } from '../assets/ships/configs/shipClassStats';
import { canTargetEntity } from '../game/utils/combat';

interface CommandConsoleProps {
  onEndTurn: () => void;
  onFirePhasers: () => void;
  onLaunchTorpedo: () => void;
  onInitiateRetreat: () => void;
  onCancelRetreat: () => void;
  onSendAwayTeam: (type: 'boarding' | 'strike') => void;
  onToggleCloak: () => void;
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
  gameState: GameState;
}

const CommandButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode, accentColor: string, title?: string}> = ({ onClick, disabled, children, accentColor, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left font-bold transition-all flex items-center gap-3 btn btn-accent ${accentColor}`}
    title={title}
  >
    {children}
  </button>
);

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h4 className="text-sm font-bold text-text-secondary uppercase tracking-wider mt-2 mb-1 px-1">{title}</h4>
);


const CommandConsole: React.FC<CommandConsoleProps> = ({ 
    onEndTurn, onFirePhasers, onLaunchTorpedo, onToggleCloak,
    onInitiateRetreat, onCancelRetreat, onSendAwayTeam,
    retreatingTurn, currentTurn, hasTarget, hasEnemy, 
    playerTurnActions, navigationTarget, playerShipPosition, isTurnResolving, playerShip, target, targeting, themeName, gameState
}) => {
  const isRetreating = retreatingTurn !== null && retreatingTurn >= currentTurn;
  const turnsToRetreat = isRetreating ? retreatingTurn! - currentTurn : 0;
  
  const getEndTurnButtonText = () => {
    if (playerShip.isStunned) return "Systems Stunned";
    if (isTurnResolving) return "Resolving...";
    if (isRetreating && turnsToRetreat === 0) return "Engage Emergency Warp";
    if (playerTurnActions.combat) return "End Turn & Fire";
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
  const canBoardOrStrike = target?.type === 'ship' && isAdjacentToTarget && (target.shields / target.maxHull) <= 0.2 && !isTargetFriendly && playerShip.securityTeams.current > 0 && playerShip.subsystems.transporter.health >= playerShip.subsystems.transporter.maxHealth;
  const { WeaponIcon, TorpedoIcon, BoardingIcon, StrikeTeamIcon, RetreatIcon, CloakIcon } = getFactionIcons(themeName);

  const canFireOnShip = hasTarget && target?.type === 'ship' && !isTargetFriendly;
  const canFireOnTorpedo = hasTarget && target?.type === 'torpedo_projectile' && target.faction !== 'Federation';
  const canUsePhasers = playerShip.subsystems.weapons.health > 0 && (canFireOnShip || canFireOnTorpedo);
  const canLaunchTorpedoFinal = playerShip.torpedoes.current > 0 && (playerShip.subsystems.weapons.health / playerShip.subsystems.weapons.maxHealth) >= 0.34;
  const hasTakenMajorAction = playerTurnActions.hasTakenMajorAction || false;

  const actionDisabled = isRetreating || isTurnResolving || playerShip.isStunned || hasTakenMajorAction;

  const targetingCheck = target ? canTargetEntity(playerShip, target, gameState.currentSector) : { canTarget: true, reason: '' };
  const cannotTargetReason = !targetingCheck.canTarget ? targetingCheck.reason : '';

  const isTargetingSubsystem = targeting && targeting.entityId === target?.id && targeting.subsystem;
  const phaserButtonText = isTargetingSubsystem
    ? `Phasers (${targeting.subsystem.charAt(0).toUpperCase()})`
    : 'Phasers';

  const cloakStats = shipClasses[playerShip.shipModel]?.[playerShip.shipClass];
  const canCloak = playerShip.cloakingCapable && cloakStats;
  const isCloaking = playerShip.cloakState === 'cloaking';
  const isCloaked = playerShip.cloakState === 'cloaked';
  const isCloakOnCooldown = playerShip.cloakCooldown > 0;
  
  const cannotCloakReason = 
      !canCloak ? "Cloaking device not equipped" :
      isCloaking ? "Cloaking sequence in progress." :
      isCloakOnCooldown ? `Cloak recharging (${playerShip.cloakCooldown} turns)` : 
      gameState.redAlert ? "Cannot cloak while at Red Alert" : 
      hasTakenMajorAction ? "Major action already taken this turn." :
      "";

  return (
    <div className="flex flex-col h-full">
        <div className="flex-grow space-y-1">
            <SectionHeader title="Tactical Actions" />
            <div className="grid grid-cols-2 gap-2 tactical-grid">
                <CommandButton onClick={onFirePhasers} disabled={!canUsePhasers || actionDisabled || isCloaked || !targetingCheck.canTarget} accentColor="red" title={cannotTargetReason}>
                    <WeaponIcon className="w-5 h-5" /> {phaserButtonText}
                </CommandButton>
                <CommandButton onClick={onLaunchTorpedo} disabled={!canLaunchTorpedoFinal || !canFireOnShip || actionDisabled || isCloaked || playerTurnActions.hasLaunchedTorpedo || !targetingCheck.canTarget} accentColor="sky" title={cannotTargetReason}>
                    <TorpedoIcon className="w-5 h-5" />
                    Torpedo
                </CommandButton>
                 <CommandButton 
                    onClick={onToggleCloak} 
                    disabled={!canCloak || isCloaking || (isCloaked && hasTakenMajorAction) || (!isCloaked && (isCloakOnCooldown || gameState.redAlert || hasTakenMajorAction))}
                    accentColor="teal"
                    title={cannotCloakReason}
                 >
                    <CloakIcon className="w-5 h-5" /> {isCloaked ? 'Decloak' : isCloaking ? 'Engaging...' : 'Cloak'}
                </CommandButton>
                <CommandButton onClick={() => onSendAwayTeam('boarding')} disabled={!canBoardOrStrike || actionDisabled || isCloaked || playerTurnActions.hasUsedAwayTeam} accentColor="purple">
                    <BoardingIcon className="w-5 h-5" /> Board
                </CommandButton>
                <CommandButton onClick={() => onSendAwayTeam('strike')} disabled={!canBoardOrStrike || actionDisabled || isCloaked || playerTurnActions.hasUsedAwayTeam} accentColor="orange">
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
                disabled={!hasEnemy || isTurnResolving || hasTakenMajorAction || isCloaked}
                className="font-bold transition-all flex items-center gap-3 btn btn-accent indigo flex-shrink-0"
            >
                <RetreatIcon className="w-5 h-5" />
                Retreat
            </button>
        )}
        <button
            onClick={() => onEndTurn()}
            disabled={isTurnResolving || (!!navigationTarget && playerShip.subsystems.engines.health < playerShip.subsystems.engines.maxHealth * 0.5) || playerShip.isStunned}
            className="flex-grow btn btn-primary"
        >
            {getEndTurnButtonText()}
        </button>
      </div>
    </div>
  );
};

export default CommandConsole;