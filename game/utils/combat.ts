import type { Ship, ShipSubsystems, GameState, Entity, TorpedoProjectile } from '../../types';
import { calculateDistance } from './ai';
import { isPosInNebula } from './sector';

export const consumeEnergy = (ship: Ship, amount: number): { success: boolean, logs: string[] } => {
    const logs: string[] = [];
    if (ship.energy.current >= amount) {
        ship.energy.current -= amount;
        return { success: true, logs };
    }

    const initialEnergy = ship.energy.current;
    if (ship.dilithium.current <= 0) {
        logs.push(`Action failed: Insufficient reserve power and no Dilithium backup.`);
        return { success: false, logs };
    }

    ship.energy.current = 0;
    ship.dilithium.current--;
    ship.energy.current = ship.energy.max;
    logs.push(`CRITICAL: Drained remaining ${initialEnergy} power. Rerouting 1 Dilithium to batteries. Power fully restored.`);
    
    return { success: true, logs };
};

export const canTargetEntity = (source: Ship, target: Entity, sector: GameState['currentSector']): { canTarget: boolean; reason: string } => {
    const asteroidPositions = new Set(sector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
    const targetPosKey = `${target.position.x},${target.position.y}`;

    if (asteroidPositions.has(targetPosKey)) {
        const distance = calculateDistance(source.position, target.position);
        if (distance > 2) {
            return { canTarget: false, reason: "Target is obscured by the asteroid field. Must be within 2 hexes to fire." };
        }
    }

    return { canTarget: true, reason: "" };
};

export const applyTorpedoDamage = (
    target: Ship,
    torpedo: TorpedoProjectile,
    gameState: GameState,
): string[] => {
    const logs: string[] = [];
    logs.push(`--> ${torpedo.name} impacts ${target.name}!`);
    let damageToProcess = torpedo.damage;
    let bypassDamage = 0;

    if (torpedo.torpedoType === 'Quantum') {
        bypassDamage = damageToProcess * 0.25;
        damageToProcess *= 0.75;
        logs.push(`--> Quantum cascade bypasses shields, dealing ${Math.round(bypassDamage)} direct hull damage.`);
    }

    const absorbedByShields = Math.min(target.shields, damageToProcess);
    if (absorbedByShields > 0) {
        logs.push(`--> Shields absorbed ${Math.round(absorbedByShields)} damage.`);
        target.shields -= absorbedByShields;
        damageToProcess -= absorbedByShields;
    }

    const totalHullDamage = damageToProcess + bypassDamage;
    if (totalHullDamage > 0) {
        target.hull = Math.max(0, target.hull - totalHullDamage);
        logs.push(`--> Hull takes ${Math.round(totalHullDamage)} damage.`);
    }

    if (target.hull === 0 && !target.isDerelict) {
        target.isDerelict = true;
        target.shields = 0;
        target.statusEffects = []; // Clear status effects on destruction
        logs.push(`--> ${target.name} has been destroyed!`);
    }

    if (torpedo.specialDamage?.type === 'plasma_burn' && target.hull > 0) {
        const burn = torpedo.specialDamage;
        target.statusEffects.push({
            type: 'plasma_burn',
            damage: burn.damage,
            turnsRemaining: burn.duration,
        });
        logs.push(`--> The hull is burning from plasma residue!`);
    }

    return logs;
};


export const applyPhaserDamage = (
    target: Ship, damage: number, subsystem: keyof ShipSubsystems | null,
    sourceShip: Ship, gameState: GameState
): string[] => {
    const logs: string[] = [];
    if (target.id === 'player' && !gameState.redAlert) {
        target.shields = 0;
    }

    let hitChance = 0.9;
    const hitChanceMods: string[] = [];
    if (isPosInNebula(target.position, gameState.currentSector)) {
        hitChance *= 0.75;
        hitChanceMods.push('Nebula (-25%)');
    }
    if (target.evasive) {
        hitChance *= 0.6;
        hitChanceMods.push('Evasive (-40%)');
    }
    if (sourceShip.evasive) {
        hitChance *= 0.75;
        hitChanceMods.push('Firing while Evasive (-25%)');
    }
    const asteroidPositions = new Set(gameState.currentSector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
    const targetPosKey = `${target.position.x},${target.position.y}`;
    if (asteroidPositions.has(targetPosKey)) {
        hitChance *= 0.70;
        hitChanceMods.push('Asteroid Cover (-30%)');
    }
    
    logs.push(`Firing phasers at ${target.name}. Base Hit: 90%. Modifiers: ${hitChanceMods.length > 0 ? hitChanceMods.join(', ') : 'None'}. Final Chance: ${Math.round(hitChance * 100)}%.`);

    if (Math.random() > hitChance) {
        logs.push(`--> Attack missed!`);
        return logs;
    }
    
    const phaserEfficiency = sourceShip.subsystems.weapons.health / sourceShip.subsystems.weapons.maxHealth;
    const baseDamage = damage * phaserEfficiency;
    logs.push(`--> HIT! Calculating damage...`);
    logs.push(` > Base Damage: ${damage.toFixed(1)}`);
    if(phaserEfficiency < 1.0) logs.push(` > Weapon Health Modifier: x${phaserEfficiency.toFixed(2)} (${Math.round(phaserEfficiency * 100)}%)`);
    logs.push(` > Initial Damage: ${baseDamage.toFixed(1)}`);
    
    let effectiveDamage = baseDamage;
    const logModifiers: string[] = [];
    
    let distance = calculateDistance(sourceShip.position, target.position);

    if (sourceShip.id === 'player' && sourceShip.pointDefenseEnabled) {
        effectiveDamage *= 0.60;
        logModifiers.push('LPD Power Drain (-40%)');
        distance += 1;
        logModifiers.push('LPD Range Penalty (+1 hex)');
    }

    const MAX_PHASER_RANGE = 6;
    const distanceModifier = Math.max(0.2, 1 - (distance - 1) / (MAX_PHASER_RANGE - 1));
    if (distance > 1) {
        effectiveDamage *= distanceModifier;
        logModifiers.push(`Range x${distanceModifier.toFixed(2)}`);
    }

    if (sourceShip.id === 'player' && subsystem) {
        const targetingInfo = gameState.player.targeting;
        if (targetingInfo && targetingInfo.entityId === target.id && targetingInfo.subsystem === subsystem) {
            const consecutiveTurns = targetingInfo.consecutiveTurns || 1;
            if (consecutiveTurns > 1) {
                const targetingModifier = 1 + (Math.min(4, consecutiveTurns - 1) * 0.25);
                effectiveDamage *= targetingModifier;
                logModifiers.push(`Sustained Targeting Bonus: +${((targetingModifier - 1) * 100).toFixed(0)}%`);
            }
        }
    }
    if(effectiveDamage.toFixed(1) !== baseDamage.toFixed(1)) logs.push(` > Effective Damage: ${effectiveDamage.toFixed(1)}`);

    let damageToProcess = effectiveDamage;
    let damageBypassingShields = 0;
    const shieldPercent = target.maxShields > 0 ? target.shields / target.maxShields : 0;

    if (subsystem) {
        const bypassMultiplier = (1 - shieldPercent) ** 2;
        damageBypassingShields = damageToProcess * bypassMultiplier;
        damageToProcess -= damageBypassingShields;
        if (damageBypassingShields > 1) logs.push(` > Target shields at ${Math.round(shieldPercent*100)}% strength. ${damageBypassingShields.toFixed(1)} damage bypasses shields.`);
    }

    const absorbedByShields = Math.min(target.shields, damageToProcess);
    if (absorbedByShields > 0) {
        logs.push(`--> Shields absorbed ${absorbedByShields.toFixed(1)} damage.`);
        target.shields -= absorbedByShields;
        damageToProcess -= absorbedByShields;
    }
    
    const totalPenetratingDamage = damageToProcess + damageBypassingShields;

    if (totalPenetratingDamage > 0) {
        let finalSubsystemDamage = 0;
        let finalHullDamage = 0;

        if (subsystem && target.subsystems[subsystem]) {
            const shieldsAreLow = shieldPercent <= 0.2;
            const subsystemDamageMultiplier = shieldsAreLow ? 0.9 : 0.7;
            
            if (shieldsAreLow) logs.push(` > Shields are failing! Focusing fire on the ${subsystem}. (90% to Subsystem / 10% to Hull)`);
            
            let subsystemPortion = totalPenetratingDamage * subsystemDamageMultiplier;
            const hullPortion = totalPenetratingDamage * (1 - subsystemDamageMultiplier);
            
            let criticalHitMultiplier = 1.0;
            if (sourceShip.id === 'player') {
                const targetingInfo = gameState.player.targeting;
                if (targetingInfo && targetingInfo.entityId === target.id && targetingInfo.subsystem === subsystem) {
                    if (targetingInfo.consecutiveTurns >= 2) {
                        criticalHitMultiplier = 1.5;
                        logs.push(` > CRITICAL HIT! Sustained targeting deals x${criticalHitMultiplier.toFixed(1)} damage to the ${subsystem}!`);
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
        if (finalHullDamage > 0) logParts.push(`${finalHullDamage} hull damage`);
        if (finalSubsystemDamage > 0 && subsystem) logParts.push(`${finalSubsystemDamage} damage to ${subsystem}`);

        if (logParts.length > 0) logs.push(`--> ${target.name} takes ${logParts.join(' and ')}.`);
        if (subsystem && target.subsystems[subsystem]?.health === 0) logs.push(`CRITICAL: ${target.name}'s ${subsystem} system has been disabled!`);

        if (target.hull === 0 && !target.isDerelict) {
            target.isDerelict = true;
            target.shields = 0;
            target.statusEffects = [];
            logs.push(`--> ${target.name} has been destroyed!`);
        }
    } else {
         logs.push(`--> Shields absorbed the entire hit.`);
    }
    return logs;
};