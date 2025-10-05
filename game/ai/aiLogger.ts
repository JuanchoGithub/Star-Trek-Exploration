import type { Ship, Position, BeamWeapon, BeamAttackResult, TorpedoProjectile, TorpedoType } from '../../types';
import type { AIStance } from './FactionAI';
import { torpedoStats } from '../../assets/projectiles/configs/torpedoTypes';
import { PathfindingResult } from '../pathfinding';
import { AIDirector } from './AIDirector';

export interface SquadronTargetingScore {
    targetId: string;
    totalScore: number;
    components: {
        damage: number;
        vulnerability: number;
        threat: number;
        proximity: number;
        persistence: number;
    };
}

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
    pathfindingDetails?: PathfindingResult;
    isCoordinatedTarget?: boolean;
}

const formatPathfindingDetails = (details: PathfindingResult, stance: AIStance): string => {
    if (!details.chosenMove) {
        return '';
    }

    const isBalanced = stance === 'Balanced';

    let content = '<div class="mt-2 text-xs space-y-1">';
    
    details.topCandidates.forEach(candidate => {
        const isChosen = candidate.position.x === details.chosenMove!.position.x && candidate.position.y === details.chosenMove!.position.y;
        const rowClass = isChosen ? 'bg-yellow-900/50 font-bold p-1 rounded' : 'bg-bg-paper-lighter/50 p-1 rounded';

        content += `<div class="${rowClass} flex flex-wrap gap-x-3 gap-y-1 items-center">
            <span class="font-mono"><b>Pos:</b> (${candidate.position.x},${candidate.position.y})</span>
            <span class="font-mono" title="Threat Score"><b>Thr:</b> ${candidate.threatComponent.toFixed(1)}</span>
            <span class="font-mono" title="Centrality Score"><b>Ctr:</b> ${candidate.centralityComponent.toFixed(1)}</span>
            <span class="font-mono" title="Cover Score"><b>Cvr:</b> ${candidate.coverComponent.toFixed(1)}</span>`;
        if (isBalanced && candidate.rangeComponent !== undefined) {
            content += `<span class="font-mono" title="Range Score"><b>Rng:</b> ${(candidate.rangeComponent).toFixed(1)}</span>`;
        }
        content += `<span class="font-mono ml-auto"><b>Total: ${candidate.finalScore.toFixed(1)}</b></span></div>`;
    });

    content += '</div>';
    return content;
}

export const generateStanceLog = (data: StanceLogData): string => {
    const { ship, stance, analysisReason, target, shipsTargetingMe, moveAction, originalPosition, moveRationale, turn, defenseAction, pathfindingDetails, isCoordinatedTarget } = data;

    const stanceColor = stance === 'Aggressive' ? 'text-red-500' : stance === 'Defensive' ? 'text-cyan-400' : 'text-yellow-400';
    const moveActionColor = moveAction === 'MOVING' ? 'text-green-400' : 'text-yellow-400';

    let pathfindingHtml = '';
    if (pathfindingDetails) {
        pathfindingHtml = formatPathfindingDetails(pathfindingDetails, stance);
    }

    const targetingReason = isCoordinatedTarget ? '(Squadron Priority)' : '(Closest Threat)';
    const targetDisplay = target ? `<b>${target.name}</b> <span class="text-text-disabled">(${target.position.x},${target.position.y}) ${targetingReason}</span>` : '<b>None</b>';
    
    let subsystemTargetText = 'Hull';
    if (target) {
        const factionAI = AIDirector.getAIForFaction(ship.faction);
        const targetedSub = factionAI.determineSubsystemTarget(ship, target);
        if (targetedSub) {
            subsystemTargetText = targetedSub.charAt(0).toUpperCase() + targetedSub.slice(1);
        }
    }


    const logMessage = `
    <div class="${ship.logColor.replace('border-', 'text-')} font-bold">${ship.name} Turn Analysis (T${turn}):</div>
    <div class="text-sm pl-2">
      <div class="font-bold">Threat Assessment:</div>
      <div>&nbsp;&nbsp;Target: ${targetDisplay}</div>
      <div>&nbsp;&nbsp;Targeted By: ${shipsTargetingMe.length > 0 ? `<b>${shipsTargetingMe.length} ship(s)</b>` : '<b>None</b>'} <span class="text-text-disabled">(Threat: ${ship.threatInfo?.total.toFixed(2) || '0.00'})</span></div>
      ${defenseAction ? `<div>&nbsp;&nbsp;Defense: <b class="text-orange-400">${defenseAction}</b></div>` : ''}
      <div class="font-bold mt-1">Tactical Decision:</div>
      <div>&nbsp;&nbsp;Stance: <b class="${stanceColor}">${stance}</b> <i class="text-text-disabled">(${analysisReason})</i></div>
      <div>&nbsp;&nbsp;Subsystem Focus: <b class="text-yellow-400">${subsystemTargetText}</b></div>
      <div>&nbsp;&nbsp;Power: <span class="text-red-400">W:${ship.energyAllocation.weapons}%</span> <span class="text-cyan-400">S:${ship.energyAllocation.shields}%</span> <span class="text-green-400">E:${ship.energyAllocation.engines}%</span></div>
      <div class="font-bold mt-1">Maneuver Execution:</div>
      <div>&nbsp;&nbsp;Action: <b class="${moveActionColor}">${moveAction}</b> from (${originalPosition.x},${originalPosition.y}) to (${ship.position.x},${ship.position.y})</div>
      <div>&nbsp;&nbsp;Rationale: <i>${moveRationale}</i></div>
      ${pathfindingHtml}
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
    <div class="text-sm pl-2">
      <div class="font-bold">Threat Assessment:</div>
      <div>&nbsp;&nbsp;Target: <b>None</b></div>
      <div class="font-bold mt-1">Tactical Decision:</div>
      <div>&nbsp;&nbsp;Stance: <b class="text-blue-400">Recovery</b> <i class="text-text-disabled">(No threats detected)</i></div>
      <div>&nbsp;&nbsp;Power: <span class="text-red-400">W:${ship.energyAllocation.weapons}%</span> <span class="text-cyan-400">S:${ship.energyAllocation.shields}%</span> <span class="text-green-400">E:${ship.energyAllocation.engines}%</span></div>
      <div class="font-bold mt-1">Maneuver Execution:</div>
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
    target: Ship | null;
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
    const targetDisplay = target ? `<b>${target.name}</b> <span class="text-text-disabled">(${target.position.x},${target.position.y})</span>` : '<b>last known position</b>';

    const logMessage = `
    <div class="${ship.logColor.replace('border-', 'text-')} font-bold">${ship.name} Turn Analysis (T${turn}):</div>
     <div class="text-sm pl-2">
      <div class="font-bold">Threat Assessment:</div>
      <div>&nbsp;&nbsp;Primary Threat: ${targetDisplay}</div>
       ${defenseAction ? `<div>&nbsp;&nbsp;Defense: <b class="text-orange-400">${defenseAction}</b></div>` : ''}
      <div class="font-bold mt-1">Tactical Decision:</div>
      <div>&nbsp;&nbsp;Stance: <b class="${stanceColor}">${stance}</b> <i class="text-text-disabled">(${analysisReason})</i></div>
      <div>&nbsp;&nbsp;Power: <span class="text-red-400">W:${ship.energyAllocation.weapons}%</span> <span class="text-cyan-400">S:${ship.energyAllocation.shields}%</span> <span class="text-green-400">E:${ship.energyAllocation.engines}%</span></div>
      <div class="font-bold mt-1">Maneuver Execution:</div>
      <div>&nbsp;&nbsp;Action: <b class="${moveActionColor}">${moveAction}</b> from (${originalPosition.x},${originalPosition.y}) to (${ship.position.x},${ship.position.y})</div>
      <div>&nbsp;&nbsp;Rationale: <i>${moveRationale}</i></div>
    </div>
    `.replace(/\n/g, '').replace(/  +/g, ' ');

    return logMessage;
};

const getFactionStyle = (faction: string) => {
    switch(faction) {
        case 'Federation': return 'text-blue-400';
        case 'Klingon': return 'text-red-500';
        case 'Romulan': return 'text-green-400';
        case 'Pirate': return 'text-orange-400';
        default: return 'text-gray-300';
    }
};

export const generateSquadronTargetingLog = (
    squadron: Ship[],
    allegiance: Required<Ship>['allegiance'],
    potentialTargets: Ship[],
    scoringDetails: SquadronTargetingScore[]
): string => {
    const squadronName = `${allegiance.charAt(0).toUpperCase() + allegiance.slice(1)} Squadron`;
    const finalDecision = scoringDetails.length > 0 ? scoringDetails[0].targetId : null;
    const finalTarget = potentialTargets.find(t => t.id === finalDecision);

    let squadronComposition = '<ul>';
    squadron.forEach(ship => {
        squadronComposition += `<li>${ship.name} (${ship.shipClass}) at (${ship.position.x},${ship.position.y})</li>`;
    });
    squadronComposition += '</ul>';

    let targetAnalysisTable = `
        <table class="w-full text-xs mt-1 border-collapse">
            <thead class="bg-black/30">
                <tr>
                    <th class="p-1 border border-border-dark text-left">Target</th>
                    <th class="p-1 border border-border-dark" title="Damage Level Score">Dmg</th>
                    <th class="p-1 border border-border-dark" title="Vulnerability Score">Vuln</th>
                    <th class="p-1 border border-border-dark" title="Threat Score">Thr</th>
                    <th class="p-1 border border-border-dark" title="Proximity Score">Prox</th>
                    <th class="p-1 border border-border-dark" title="Persistence Bonus">Persist</th>
                    <th class="p-1 border border-border-dark">Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    scoringDetails.forEach(detail => {
        const target = potentialTargets.find(t => t.id === detail.targetId);
        if (!target) return;
        
        const isChosen = detail.targetId === finalDecision;
        const rowClass = isChosen ? 'bg-yellow-900/50' : '';

        targetAnalysisTable += `
            <tr class="${rowClass}">
                <td class="p-1 border border-border-dark">${target.name}</td>
                <td class="p-1 border border-border-dark text-center">${detail.components.damage.toFixed(0)}</td>
                <td class="p-1 border border-border-dark text-center">${detail.components.vulnerability.toFixed(0)}</td>
                <td class="p-1 border border-border-dark text-center">${detail.components.threat.toFixed(0)}</td>
                <td class="p-1 border border-border-dark text-center">${detail.components.proximity.toFixed(0)}</td>
                <td class="p-1 border border-border-dark text-center">${detail.components.persistence.toFixed(0)}</td>
                <td class="p-1 border border-border-dark text-center font-bold">${detail.totalScore.toFixed(0)}</td>
            </tr>
        `;
    });
    
    if(scoringDetails.length === 0) {
        targetAnalysisTable += '<tr><td colspan="7" class="p-1 border border-border-dark text-center italic">No valid targets in sensor range.</td></tr>';
    }

    targetAnalysisTable += '</tbody></table>';

    const decisionText = finalTarget 
        ? `Primary target designated: <b class="${getFactionStyle(finalTarget.faction)}">${finalTarget.name}</b>.`
        : 'No target designated.';

    const logMessage = `
    <div class="text-yellow-400 font-bold">Squadron Target Designation (${squadronName}):</div>
    <div class="text-sm pl-2">
      <div class="font-bold">Squadron Composition:</div>
      <div class="pl-2 text-xs">${squadronComposition}</div>
      <div class="font-bold mt-1">Target Analysis:</div>
      ${targetAnalysisTable}
      <div class="font-bold mt-1">Final Decision:</div>
      <div class="pl-2">${decisionText}</div>
    </div>
    `.replace(/\n/g, '').replace(/  +/g, ' ');

    return logMessage;
};


export const generateBeamAttackLog = (source: Ship, target: Ship, weapon: BeamWeapon, result: BeamAttackResult): string => {
    const phaserColor = 'text-red-400';
    const factionStyle = getFactionStyle(target.faction);
    
    let fireLog = `Firing <b class="${phaserColor}">${weapon.name}</b> at <b class="${factionStyle}">${target.shipClass} ${target.name}</b> <span class="text-text-disabled">(${target.position.x},${target.position.y})</span>`;
    
    let details = '';
    
    if (result.subsystemTargeted) {
        const subsystem = target.subsystems[result.subsystemTargeted];
        if (subsystem && subsystem.maxHealth > 0) {
            const healthBeforeDamage = subsystem.health + result.finalSubsystemDamage;
            const damagedPercent = Math.round(100 - (healthBeforeDamage / subsystem.maxHealth * 100));
            details += `\n  Targeting <b>${result.subsystemTargeted}</b> (${damagedPercent}% damaged).`;
        } else {
             details += `\n  Targeting <b>${result.subsystemTargeted}</b>.`;
        }
    }

    details += `\n  Hit chance: ${Math.round(result.hitChance * 100)}%.`;
    if (result.damageModifiers.length > 0) {
        details += ` <span class="text-text-disabled"><i>Modifiers: ${result.damageModifiers.join(', ')}</i></span>.`;
    }
    
    if (!result.hit) {
        return fireLog + details + `\n  <b class="text-yellow-400">MISS!</b>`;
    }

    details += ` <b class="text-green-400">HIT!</b>`;
    details += `\n  Base Damage: <b>${result.damageDealt}</b> points.`;

    if (result.wasShieldHit) {
        details += `\n  Target Shields at <b>${result.shieldPercentBeforeHit}%</b>.`;
        if (result.leakageChance > 0.051) { // Only show if chance is > base 5%
            details += ` <i class="text-text-disabled">(Shield Leakage Chance: ${Math.round(result.leakageChance * 100)}%)</i>`;
        }
        details += `\n  Shields absorbed <b>${Math.round(result.absorbedByShields)}</b> points.`;
        if (result.leakageDamage > 0) {
            details += ` <b class="text-yellow-400">${Math.round(result.leakageDamage)} damage leaked through!</b>`;
        }
    }
    
    const damageParts: { system: string, damage: number }[] = [];
    if (result.finalHullDamage > 0) damageParts.push({ system: 'Hull', damage: Math.round(result.finalHullDamage) });
    if (result.finalSubsystemDamage > 0 && result.subsystemTargeted) damageParts.push({ system: result.subsystemTargeted, damage: Math.round(result.finalSubsystemDamage) });
    
    if (damageParts.length > 0) {
        details += `\n  Final Penetrating Damage:`;
        damageParts.forEach(part => {
            details += `\n    ${part.system}: <b>${part.damage}</b> points`;
        });
    } else if (result.wasShieldHit && result.totalPenetratingDamage === 0) {
        details += `\n  <i class="text-text-disabled">The attack was fully absorbed by the shields.</i>`;
    }

    if (result.subsystemDestroyed) {
        details += `\n  <b class="text-orange-500">CRITICAL HIT:</b> ${target.name}'s ${result.subsystemTargeted} have been disabled!`;
    }
    if (result.targetDestroyed) {
        details += `\n  <b class="text-red-600">${target.name} is destroyed!</b>`;
    }
    
    if (result.cloakWasDestabilized) {
        details += `\n  <i class="text-yellow-400">The impact destabilizes the ${target.name}'s cloaking field!</i>`;
    }

    return fireLog + details;
}

export const generateTorpedoLaunchLog = (source: Ship, target: Ship, torpedoName: string, torpedoType: TorpedoType): string => {
    const torpedoConfig = torpedoStats[torpedoType];
    const colorClass = torpedoConfig ? torpedoConfig.colorClass.replace('text-', 'text-') : 'text-accent-yellow';
    const factionStyle = getFactionStyle(target.faction);
    return `Firing <b class="${colorClass}">${torpedoName}</b> at <b class="${factionStyle}">${target.shipClass} ${target.name}</b> at <span class="text-text-disabled">(${target.position.x},${target.position.y})</span>`;
}

export const generatePlayerTorpedoLaunchLog = (target: Ship, torpedoName: string, torpedoType: TorpedoType): string => {
    const torpedoConfig = torpedoStats[torpedoType];
    const colorClass = torpedoConfig ? torpedoConfig.colorClass.replace('text-', 'text-') : 'text-accent-yellow';
    const factionStyle = getFactionStyle(target.faction);
    return `Firing <b class="${colorClass}">${torpedoName}</b> at <b class="${factionStyle}">${target.shipClass} ${target.name}</b> at <span class="text-text-disabled">(${target.position.x},${target.position.y})</span>`;
}

export const generatePointDefenseLog = (hit: boolean, hitChance: number, torpedoName: string, torpedoType: TorpedoType): string => {
    const torpedoConfig = torpedoStats[torpedoType];
    const colorClass = torpedoConfig ? torpedoConfig.colorClass.replace('text-', 'text-') : 'text-accent-yellow';

    let log = `Point-defense grid fired at an incoming <b class="${colorClass}">${torpedoName}</b>!`;
    log += `\n  Hit Chance: ${Math.round(hitChance * 100)}%`;

    if (hit) {
        log += `\n  <b class="text-green-400">HIT!</b>`;
        log += `\n  <b>Projectile destroyed.</b>`;
    } else {
        log += `\n  <b class="text-yellow-400">MISS!</b>`;
    }

    return log;
};


interface TorpedoImpactLogData {
    source: Ship | null;
    target: Ship;
    torpedo: TorpedoProjectile;
    results: {
        hit: boolean;
        hitChance: number;
        bypassDamage: number;
        shieldAbsorption: number;
        absorbedDamageRatio: number;
        finalHullDamage: number;
        newInstability: number | null;
        isDestroyed: boolean;
        plasmaDamage?: number;
        plasmaDuration?: number;
    }
}

export const generateTorpedoImpactLog = (data: TorpedoImpactLogData): string => {
    const { target, torpedo, results } = data;

    const torpedoConfig = torpedoStats[torpedo.torpedoType];
    const torpedoColor = torpedoConfig ? torpedoConfig.colorClass : 'text-accent-yellow';
    const targetFactionStyle = getFactionStyle(target.faction);

    let log = `<b class="${targetFactionStyle}">${target.shipClass} ${target.name}</b> <span class="text-text-disabled">(${target.position.x},${target.position.y})</span> is targeted by a <b class="${torpedoColor}">${torpedo.name}</b>!`;
    log += `\n  Hit Chance: ${Math.round(results.hitChance * 100)}%`;

    if (!results.hit) {
        log += `\n  <b class="text-yellow-400">MISS!</b> The torpedo misses its target.`;
        return log;
    }

    log += `\n  <b class="text-green-400">IMPACT!</b>`;
    log += ` Base hit: <b>${torpedo.damage}</b>`;
    
    if (results.shieldAbsorption > 0) {
        log += `\n  Shields absorbed <b>${Math.round(results.shieldAbsorption)}</b> energy, mitigating <b>${Math.round(results.absorbedDamageRatio)}</b> damage.`;
    }

    if (results.bypassDamage > 0) {
        log += `\n  Quantum resonance field inflicts <b>${Math.round(results.bypassDamage)}</b> direct hull damage.`;
    }

    if (results.finalHullDamage > 0) {
        log += `\n  Hull takes <b>${Math.round(results.finalHullDamage)}</b> damage from the impact.`;
    }

    if(results.plasmaDamage && results.plasmaDuration){
        log += `\n  <b class="text-orange-400">Plasma fire inflicts ${results.plasmaDamage} damage over ${results.plasmaDuration} turns.</b>`;
    }

    if (results.newInstability !== null) {
        log += `\n  <i class="text-yellow-400">The torpedo impact severely destabilizes the cloaking field, cloak instability now at ${Math.round(results.newInstability * 100)}%.</i>`;
    }
    
    if (results.isDestroyed) {
        log += `\n  <b class="text-red-600">${target.name} is destroyed!</b>`;
    }

    return log;
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
    <div class="text-sm space-y-1 pl-2">
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
