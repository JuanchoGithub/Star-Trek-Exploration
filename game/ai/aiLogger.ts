
import type { Ship, Position, BeamWeapon, BeamAttackResult } from '../../types';
import type { AIStance } from './FactionAI';

export interface StanceLogData {
    ship: Ship;
    stance: AIStance;
    analysisReason: string;
    target: Ship | null;
    shipsTargetingMe: Ship[];
    moveAction: 'MOVING' | 'HOLDING';
    originalPosition: Position;
    moveRationale: string;
    turn: number;
    defenseAction?: string | null;
}

export const generateStanceLog = (data: StanceLogData): string => {
    const { ship, stance, analysisReason, target, shipsTargetingMe, moveAction, originalPosition, moveRationale, turn, defenseAction } = data;

    const stanceColor = stance === 'Aggressive' ? 'text-red-500' : stance === 'Defensive' ? 'text-cyan-400' : 'text-yellow-400';
    const moveActionColor = moveAction === 'MOVING' ? 'text-green-400' : 'text-yellow-400';

    const logMessage = `
    <div class="${ship.logColor.replace('border-', 'text-')} font-bold">${ship.name} Turn Analysis (T${turn}):</div>
    <div class="text-xs space-y-1 pl-2">
      <div class="font-bold">Threat Assessment:</div>
      <div>&nbsp;&nbsp;Target: ${target ? `<b>${target.name}</b> <span class="text-text-disabled">(${target.position.x},${target.position.y})</span>` : '<b>None</b>'}</div>
      <div>&nbsp;&nbsp;Targeted By: ${shipsTargetingMe.length > 0 ? `<b>${shipsTargetingMe.length} ship(s)</b>` : '<b>None</b>'} <span class="text-text-disabled">(Threat: ${ship.threatInfo?.total.toFixed(2) || '0.00'})</span></div>
      ${defenseAction ? `<div>&nbsp;&nbsp;Defense: <b class="text-orange-400">${defenseAction}</b></div>` : ''}
      <div class="font-bold">Tactical Decision:</div>
      <div>&nbsp;&nbsp;Stance: <b class="${stanceColor}">${stance}</b> <i class="text-text-disabled">(${analysisReason})</i></div>
      <div>&nbsp;&nbsp;Power: <span class="text-red-400">W:${ship.energyAllocation.weapons}%</span> <span class="text-cyan-400">S:${ship.energyAllocation.shields}%</span> <span class="text-green-400">E:${ship.energyAllocation.engines}%</span></div>
      <div class="font-bold">Maneuver Execution:</div>
      <div>&nbsp;&nbsp;Action: <b class="${moveActionColor}">${moveAction}</b> from (${originalPosition.x},${originalPosition.y}) to (${ship.position.x},${ship.position.y})</div>
      <div>&nbsp;&nbsp;Rationale: <i>${moveRationale}</i></div>
    </div>
    `.replace(/\n/g, '').replace(/  +/g, ' ');

    return logMessage;
};

export const generateRecoveryLog = (ship: Ship, turn: number): string => {
    let repairTargetText = "All systems nominal.";
    if (ship.repairTarget) {
        repairTargetText = `Focusing repairs on <b class="text-yellow-400">${ship.repairTarget}</b>.`;
    }
    
    const logMessage = `
    <div class="${ship.logColor.replace('border-', 'text-')} font-bold">${ship.name} Turn Analysis (T${turn}):</div>
    <div class="text-xs space-y-1 pl-2">
      <div class="font-bold">Threat Assessment:</div>
      <div>&nbsp;&nbsp;Target: <b>None</b></div>
      <div class="font-bold">Tactical Decision:</div>
      <div>&nbsp;&nbsp;Stance: <b class="text-blue-400">Recovery</b> <i class="text-text-disabled">(No threats detected)</i></div>
      <div>&nbsp;&nbsp;Power: <span class="text-red-400">W:${ship.energyAllocation.weapons}%</span> <span class="text-cyan-400">S:${ship.energyAllocation.shields}%</span> <span class="text-green-400">E:${ship.energyAllocation.engines}%</span></div>
      <div class="font-bold">Maneuver Execution:</div>
      <div>&nbsp;&nbsp;Action: <b class="text-yellow-400">HOLDING</b> at (${ship.position.x},${ship.position.y})</div>
      <div>&nbsp;&nbsp;Rationale: <i>${repairTargetText}</i></div>
    </div>
    `.replace(/\n/g, '').replace(/  +/g, ' ');

    return logMessage;
};

export interface FleeLogData {
    ship: Ship;
    stance: AIStance;
    analysisReason: string;
    target: Ship;
    shipsTargetingMe: Ship[];
    moveAction: 'MOVING' | 'HOLDING';
    originalPosition: Position;
    moveRationale: string;
    turn: number;
    defenseAction?: string | null;
}

export const generateFleeLog = (data: FleeLogData): string => {
    const { ship, stance, analysisReason, target, shipsTargetingMe, moveAction, originalPosition, moveRationale, turn, defenseAction } = data;
    
    const stanceColor = 'text-cyan-400';
    const moveActionColor = moveAction === 'MOVING' ? 'text-green-400' : 'text-yellow-400';

    const logMessage = `
    <div class="text-yellow-400 font-bold">${ship.name} Turn Analysis (T${turn}):</div>
     <div class="text-xs space-y-1 pl-2">
      <div class="font-bold">Threat Assessment:</div>
      <div>&nbsp;&nbsp;Primary Threat: <b>${target.name}</b> <span class="text-text-disabled">(${target.position.x},${target.position.y})</span></div>
       ${defenseAction ? `<div>&nbsp;&nbsp;Defense: <b class="text-orange-400">${defenseAction}</b></div>` : ''}
      <div class="font-bold">Tactical Decision:</div>
      <div>&nbsp;&nbsp;Stance: <b class="${stanceColor}">${stance}</b> <i class="text-text-disabled">(${analysisReason})</i></div>
      <div>&nbsp;&nbsp;Power: <span class="text-red-400">W:${ship.energyAllocation.weapons}%</span> <span class="text-cyan-400">S:${ship.energyAllocation.shields}%</span> <span class="text-green-400">E:${ship.energyAllocation.engines}%</span></div>
      <div class="font-bold">Maneuver Execution:</div>
      <div>&nbsp;&nbsp;Action: <b class="${moveActionColor}">${moveAction}</b> from (${originalPosition.x},${originalPosition.y}) to (${ship.position.x},${ship.position.y})</div>
      <div>&nbsp;&nbsp;Rationale: <i>${moveRationale}</i></div>
    </div>
    `.replace(/\n/g, '').replace(/  +/g, ' ');

    return logMessage;
};

export const generateBeamAttackLog = (source: Ship, target: Ship, weapon: BeamWeapon, result: BeamAttackResult): string => {
    let fireLog = `Fires ${weapon.name} at ${target.name}. Hit chance: ${Math.round(result.hitChance * 100)}%.`;
    if (result.damageModifiers.length > 0) {
        fireLog += ` Modifiers: ${result.damageModifiers.join(', ')}.`;
    }

    if (!result.hit) {
        return fireLog + " >> MISS! <<";
    }

    fireLog += ` >> HIT! <<`;
    
    let damageLog = `\n--> Base Damage: <b>${result.damageDealt}</b>.`;

    if (result.wasShieldHit) {
        damageLog += ` Shields at <b>${result.shieldPercentBeforeHit}%</b> stopped <b>${Math.round(result.absorbedByShields)}</b>.`;
    }
    
    const damageParts = [];
    if (result.finalHullDamage > 0) damageParts.push(`<b>${Math.round(result.finalHullDamage)}</b> to hull`);
    if (result.finalSubsystemDamage > 0 && result.subsystemTargeted) damageParts.push(`<b>${Math.round(result.finalSubsystemDamage)}</b> to ${result.subsystemTargeted}`);
    
    if (damageParts.length > 0) {
        damageLog += `\n--> Final Damage: ${damageParts.join(' and ')}.`;
    } else if (result.wasShieldHit) {
        damageLog += `\n--> The attack was fully absorbed by the shields.`;
    }

    if (result.subsystemDestroyed) {
        damageLog += `\n<b>CRITICAL HIT:</b> ${target.name}'s ${result.subsystemTargeted} have been disabled!`;
    }
    if (result.targetDestroyed) {
        damageLog += `\n--> ${target.name} is destroyed!`;
    }
    
    if (result.cloakWasDestabilized) {
        damageLog += `\nThe impact destabilizes the ${target.name}'s cloaking field!`;
    }

    return fireLog + damageLog;
}

export const generateTorpedoLaunchLog = (source: Ship, target: Ship, torpedoName: string): string => {
    return `Has launched a <b>${torpedoName}</b> at <b class="text-accent-yellow">${target.name}</b>!`;
}

export const generatePlayerTorpedoLaunchLog = (target: Ship, torpedoName: string): string => {
    return `Launched a <b>${torpedoName}</b> at <b class="text-accent-yellow">${target.name}</b>.`;
}

export interface CloakLogData {
    ship: Ship;
    finalReliability: number;
    baseReliability: number;
    instability: number;
    envReason: string;
    success: boolean;
    isTransitioning: boolean;
    turnsRemaining: number | null;
}

export const generateCloakLog = (data: CloakLogData): string => {
    const { ship, finalReliability, baseReliability, instability, envReason, success, isTransitioning, turnsRemaining } = data;

    const reliabilityPercent = Math.round(finalReliability * 100);
    const basePercent = Math.round(baseReliability * 100);
    const instabilityPercent = Math.round(instability * 100);

    const resultColor = success ? 'text-green-400' : 'text-red-500';
    const resultText = success ? 'SUCCESS' : 'FAILURE';

    let statusMessage = '';
    if (success) {
        if (isTransitioning) {
            statusMessage = `Transition sequence stable. ${turnsRemaining} turn(s) remaining.`;
        } else if (ship.cloakState === 'cloaked') {
            statusMessage = `Cloaking field remains stable.`;
        }
    } else {
        statusMessage = `The cloaking field has collapsed! Shield emitters are offline for 2 turns.`;
    }
    
    const isCloakingOrCloaked = ship.cloakState === 'cloaking' || ship.cloakState === 'cloaked';
    const powerMessage = isCloakingOrCloaked ? `<div>&nbsp;&nbsp;Diverting power from shields to maintain cloak.</div>` : '';
    const vulnerabilityMessage = isTransitioning ? `<div>&nbsp;&nbsp;Weapons and shields are offline during transition.</div>` : '';

    const logMessage = `
    <div class="text-teal-400 font-bold">${ship.name} Cloak Status:</div>
    <div class="text-xs space-y-1 pl-2">
      <div>&nbsp;&nbsp;Field Check: <b class="${resultColor}">${reliabilityPercent}%</b></div>
      <div>&nbsp;&nbsp;Reliability Base: ${basePercent}%</div>
      <div>&nbsp;&nbsp;Instability: -${instabilityPercent}% ${envReason}</div>
      <div class="font-bold ${resultColor}">&nbsp;&nbsp;Result: ${resultText}</div>
      <div>&nbsp;&nbsp;Status: <i>${statusMessage}</i></div>
      ${powerMessage}
      ${vulnerabilityMessage}
    </div>
    `.replace(/\n/g, '').replace(/  +/g, ' ');

    return logMessage;
};
