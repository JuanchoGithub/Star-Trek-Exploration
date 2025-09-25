import type { Ship, ShipSubsystems, GameState, TorpedoProjectile, SectorState, Entity, Position } from '../../types';
import { calculateDistance } from './ai';
import { isPosInNebula } from './sector';
import { useOneDilithiumCrystal } from './energy';

export const canTargetEntity = (source: Ship, target: Entity, sector: SectorState): { canTarget: boolean, reason: string } => {
    if (target.type === 'ship' && (target as Ship).cloakState === 'cloaked') {
        return { canTarget: false, reason: 'Target is cloaked.' };
    }

    const distance = calculateDistance(source.position, target.position);
    
    const asteroidPositions = new Set(sector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
    const targetPosKey = `${target.position.x},${target.position.y}`;

    if (asteroidPositions.has(targetPosKey)) {
        if (distance > 2) {
            return { canTarget: false, reason: 'Target is obscured by asteroids.' };
        }
    }
    
    return { canTarget: true, reason: '' };
};


export const consumeEnergy = (ship: Ship, amount: number): { success: boolean, logs: string[] } => {
    const logs: string[] = [];
    if (ship.energy.current >= amount) {
        ship.energy.current -= amount;
        return { success: true, logs };
    }

    const initialEnergy = ship.energy.current;
    const remainingCost = amount - initialEnergy;

    if (ship.dilithium.current <= 0) {
        logs.push(`Action failed: Insufficient reserve power and no Dilithium backup.`);
        return { success: false, logs };
    }

    ship.energy.current = 0;
    logs.push(`CRITICAL: Drained remaining ${Math.round(initialEnergy)} power. Rerouting 1 Dilithium to batteries.`);

    const { restoredEnergy, logs: dilithiumLogs } = useOneDilithiumCrystal(ship);
    logs.push(...dilithiumLogs);

    if (restoredEnergy >= remainingCost) {
        ship.energy.current = restoredEnergy - remainingCost;
        return { success: true, logs };
    } else {
        ship.energy.current = restoredEnergy;
        logs.push(`Action failed: Power cost is too high even for a dilithium boost. Power restored, but action aborted.`);
        return { success: false, logs };
    }
};

export const applyPhaserDamage = (
    target: Ship, damage: number, subsystem: keyof ShipSubsystems | null,
    sourceShip: Ship, gameState: GameState
): string[] => {
    target.lastAttackerPosition = { ...sourceShip.position };
    const wasShieldHit = target.shields > 0;

    const PHASER_BEAM_DRAW_TIME = 150; // 20% of 750ms animation
    gameState.combatEffects.push({
        type: 'phaser_impact',
        position: { ...target.position },
        delay: PHASER_BEAM_DRAW_TIME,
        hitType: wasShieldHit ? 'shield' : 'hull',
    });

    if (target.id === 'player' && !gameState.redAlert) {
        target.shields = 0;
    }

    let hitChance = 0.9;
    
    const isTargetInNebula = isPosInNebula(target.position, gameState.currentSector);
    if (isTargetInNebula) {
        hitChance *= 0.75;
    }

    const asteroidPositions = new Set(gameState.currentSector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
    const targetPosKey = `${target.position.x},${target.position.y}`;
    if (asteroidPositions.has(targetPosKey)) {
        hitChance *= 0.70;
    }

    if (target.evasive) hitChance *= 0.6;
    if (sourceShip.id === 'player' && sourceShip.evasive) hitChance *= 0.75;
    
    const phaserEfficiency = sourceShip.subsystems.weapons.health / sourceShip.subsystems.weapons.maxHealth;
    const baseDamage = damage * phaserEfficiency;
    
    let effectiveDamage = baseDamage;
    const damageModifiers: string[] = [];

    const distance = calculateDistance(sourceShip.position, target.position);
    let effectiveDistance = distance;
    if (sourceShip.pointDefenseEnabled) {
        effectiveDistance++;
    }
    
    const MAX_PHASER_RANGE = 6;
    if (distance > 1) {
        const distanceModifier = Math.max(0.2, 1 - (effectiveDistance - 1) / (MAX_PHASER_RANGE - 1));
        effectiveDamage *= distanceModifier;
        damageModifiers.push(`Range x${distanceModifier.toFixed(2)}`);
    }

    if (sourceShip.id === 'player' && subsystem) {
        const targetingInfo = gameState.player.targeting;
        if (targetingInfo && targetingInfo.entityId === target.id && targetingInfo.subsystem === subsystem) {
            const consecutiveTurns = targetingInfo.consecutiveTurns || 1;
            if (consecutiveTurns > 1) {
                const targetingModifier = 1 + (Math.min(4, consecutiveTurns - 1) * 0.25);
                effectiveDamage *= targetingModifier;
                damageModifiers.push(`Focus +${((targetingModifier - 1) * 100).toFixed(0)}%`);
            }
        }
    }
    
    let mainFireLog = `Fires phasers at ${target.name}. Hit chance: ${Math.round(hitChance * 100)}%.`;
    if (damageModifiers.length > 0) mainFireLog += ` Modifiers: ${damageModifiers.join(', ')}.`;

    if (Math.random() > hitChance) {
        mainFireLog += " Shot resolved as a >>MISS!<<";
        return [mainFireLog];
    }

    mainFireLog += ` Chance resolved as a >>HIT!<<`;
    
    let damageToProcess = effectiveDamage;
    let damageBypassingShields = 0;
    const shieldPercent = target.maxShields > 0 ? target.shields / target.maxShields : 0;

    if (subsystem) {
        const bypassMultiplier = (1 - shieldPercent) ** 2;
        damageBypassingShields = damageToProcess * bypassMultiplier;
        damageToProcess -= damageBypassingShields;
    }

    const absorbedByShields = Math.min(target.shields, damageToProcess);
    if (absorbedByShields > 0) {
        target.shields = Math.max(0, target.shields - absorbedByShields);
        mainFireLog += ` Shields absorbed ${Math.round(absorbedByShields)} damage`;
        if (damageToProcess - absorbedByShields <= 0 && damageBypassingShields <= 0) {
            mainFireLog += `, the full hit was absorbed.`;
        } else {
            mainFireLog += '.';
        }
    }
    damageToProcess -= absorbedByShields;
    
    const totalPenetratingDamage = damageToProcess + damageBypassingShields;

    if (totalPenetratingDamage > 0) {
        let finalSubsystemDamage = 0;
        let finalHullDamage = 0;

        if (subsystem && target.subsystems[subsystem]) {
            const shieldsAreLow = shieldPercent <= 0.2;
            const subsystemDamageMultiplier = shieldsAreLow ? 0.9 : 0.7;
            
            let subsystemPortion = totalPenetratingDamage * subsystemDamageMultiplier;
            const hullPortion = totalPenetratingDamage * (1 - subsystemDamageMultiplier);
            
            let criticalHitMultiplier = 1.0;
            if (sourceShip.id === 'player') {
                const targetingInfo = gameState.player.targeting;
                if (targetingInfo && targetingInfo.entityId === target.id && targetingInfo.subsystem === subsystem) {
                    if (targetingInfo.consecutiveTurns >= 2) {
                        criticalHitMultiplier = 1.5;
                    }
                }
            }

            finalSubsystemDamage = Math.round(subsystemPortion * criticalHitMultiplier);
            finalHullDamage = Math.round(hullPortion);

        } else {
            finalHullDamage = Math.round(totalPenetratingDamage);
        }

        target.hull = Math.max(0, target.hull - finalHullDamage);
        if (finalSubsystemDamage > 0 && subsystem && target.subsystems[subsystem]) {
            target.subsystems[subsystem].health = Math.max(0, target.subsystems[subsystem].health - finalSubsystemDamage);
        }
        
        const logParts = [];
        if (finalHullDamage > 0) logParts.push(`${finalHullDamage} hull`);
        if (finalSubsystemDamage > 0 && subsystem) logParts.push(`${finalSubsystemDamage} ${subsystem}`);

        if (logParts.length > 0) mainFireLog += ` ${target.name} takes ${logParts.join(' and ')} damage.`;
        if (subsystem && target.subsystems[subsystem]?.health === 0) mainFireLog += ` CRITICAL HIT: ${target.name}'s ${subsystem} have been disabled!`;
        if (target.hull <= 0) {
            mainFireLog += ` --> ${target.name} is destroyed!`;
        }
    }

    if (target.cloakState === 'cloaking') {
        target.cloakDestabilizedThisTurn = true;
        const instabilityIncrease = 0.15;
        target.cloakInstability = Math.min(0.8, target.cloakInstability + instabilityIncrease); // Cap instability at 80% to avoid guaranteed failure
        mainFireLog += ` The impact destabilizes the ${target.name}'s cloaking field!`;
    }

    return [mainFireLog];
};


export const applyTorpedoDamage = (target: Ship, torpedo: TorpedoProjectile, sourcePosition: Position | null): string[] => {
    const logs: string[] = [];
    if (sourcePosition) {
        target.lastAttackerPosition = { ...sourcePosition };
    }
    let damageToHull = torpedo.damage;

    // Quantum Torpedoes partially bypass shields
    if (torpedo.torpedoType === 'Quantum') {
        const bypassDamage = damageToHull * 0.25;
        target.hull = Math.max(0, target.hull - bypassDamage);
        logs.push(`Quantum resonance field bypasses shields, dealing ${Math.round(bypassDamage)} direct hull damage!`);
        damageToHull *= 0.75;
    }
    
    const shieldAbsorption = Math.min(target.shields, damageToHull * 4);
    const absorbedDamageRatio = shieldAbsorption / 4;
    damageToHull -= absorbedDamageRatio;

    if (shieldAbsorption > 0) {
        target.shields = Math.max(0, target.shields - shieldAbsorption);
        let shieldLog = `Shields absorb ${Math.round(shieldAbsorption)} energy, reducing torpedo damage by ${Math.round(absorbedDamageRatio)}`;
        if (damageToHull <= 0) {
            shieldLog += `, the full hit was absorbed.`;
        } else {
            shieldLog += '.';
        }
        logs.push(shieldLog);
    }
    
    damageToHull = Math.round(damageToHull);
    if (damageToHull > 0) {
        target.hull = Math.max(0, target.hull - damageToHull);
        logs.push(`${target.name} takes ${damageToHull} hull damage from the torpedo impact!`);
    }

    if (torpedo.specialDamage?.type === 'plasma_burn') {
        target.statusEffects.push({
            type: 'plasma_burn',
            damage: torpedo.specialDamage.damage,
            turnsRemaining: torpedo.specialDamage.duration,
        });
        logs.push(`The torpedo leaves a plasma fire on the hull, which will burn for several turns!`);
    }

    if (target.hull <= 0) {
        logs.push(`${target.name} is destroyed by the torpedo impact!`);
    }
    
    if (target.cloakState === 'cloaking') {
        target.cloakDestabilizedThisTurn = true;
        const instabilityIncrease = 0.25; // Torpedoes are more jarring
        target.cloakInstability = Math.min(0.8, target.cloakInstability + instabilityIncrease);
        logs.push(`The torpedo impact severely destabilizes the ${target.name}'s cloaking field!`);
    }

    return logs;
};