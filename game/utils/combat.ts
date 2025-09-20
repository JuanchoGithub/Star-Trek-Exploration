import type { Ship, ShipSubsystems, GameState } from '../../types';
import { calculateDistance } from './ai';

// Helper for player energy consumption with dilithium backup
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
    ship.dilithium.current--;
    const rechargedEnergy = ship.energy.max;
    logs.push(`CRITICAL: Drained remaining ${initialEnergy} power. Rerouting 1 Dilithium to batteries. Power fully restored.`);

    const subsystems: (keyof ShipSubsystems)[] = ['weapons', 'engines', 'shields', 'transporter'];
    const randomSubsystemKey = subsystems[Math.floor(Math.random() * subsystems.length)];
    const targetSubsystem = ship.subsystems[randomSubsystemKey];
    if (targetSubsystem.maxHealth > 0) {
        const damage = 5 + Math.floor(Math.random() * 6);
        targetSubsystem.health = Math.max(0, targetSubsystem.health - damage);
        logs.push(`WARNING: The power surge caused ${damage} damage to the ${randomSubsystemKey} system!`);
    }

    if (rechargedEnergy >= remainingCost) {
        ship.energy.current = rechargedEnergy - remainingCost;
        return { success: true, logs };
    } else {
        ship.energy.current = rechargedEnergy;
        logs.push(`Action failed: Power cost is too high even for a dilithium boost. Power restored, but action aborted.`);
        return { success: false, logs };
    }
};

export const applyPhaserDamage = (
    target: Ship, damage: number, subsystem: 'weapons' | 'engines' | 'shields' | null,
    sourceShip: Ship, gameState: GameState
): string[] => {
    const logs: string[] = [];
    if (target.id === 'player' && !gameState.redAlert) {
        target.shields = 0;
    }

    let hitChance = 0.9;
    if (gameState.currentSector.hasNebula) {
        hitChance *= 0.75;
        logs.push(`Nebula interference is affecting targeting sensors.`);
    }
    if (target.evasive) hitChance *= 0.6;
    if (sourceShip.id === 'player' && sourceShip.evasive) hitChance *= 0.75;
    
    logs.push(`Fires phasers at ${target.name}. Hit chance: ${Math.round(hitChance * 100)}%.`);

    if (Math.random() > hitChance) {
        logs.push(`--> Attack missed! ${target.name} evaded.`);
        return logs;
    }
    
    logs.push(`--> HIT! Initial damage: ${Math.round(damage)}.`);
    
    let effectiveDamage = damage;
    const logModifiers: string[] = [];

    const distance = calculateDistance(sourceShip.position, target.position);
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
                logModifiers.push(`Focus +${((targetingModifier - 1) * 100).toFixed(0)}%`);
            }
        }
    }

    if (logModifiers.length > 0) logs.push(`--> Modifiers: ${logModifiers.join(', ')}. Effective damage: ${Math.round(effectiveDamage)}.`);

    let damageToProcess = effectiveDamage;
    let damageBypassingShields = 0;
    const shieldPercent = target.maxShields > 0 ? target.shields / target.maxShields : 0;

    if (subsystem) {
        const bypassMultiplier = (1 - shieldPercent) ** 2;
        damageBypassingShields = damageToProcess * bypassMultiplier;
        damageToProcess -= damageBypassingShields;
        if (damageBypassingShields > 1) logs.push(`--> Target's weak shields allowed ${Math.round(damageBypassingShields)} damage to bypass defenses!`);
    }

    const absorbedByShields = Math.min(target.shields, damageToProcess);
    if (absorbedByShields > 0) {
        logs.push(`--> Shields absorbed ${Math.round(absorbedByShields)} damage.`);
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
            
            if (shieldsAreLow) logs.push(`--> Shields are failing! Focusing fire on the ${subsystem}.`);
            
            let subsystemPortion = totalPenetratingDamage * subsystemDamageMultiplier;
            const hullPortion = totalPenetratingDamage * (1 - subsystemDamageMultiplier);
            
            let criticalHitMultiplier = 1.0;
            if (sourceShip.id === 'player') {
                const targetingInfo = gameState.player.targeting;
                if (targetingInfo && targetingInfo.entityId === target.id && targetingInfo.subsystem === subsystem) {
                    if (targetingInfo.consecutiveTurns >= 2) {
                        criticalHitMultiplier = 1.5;
                        logs.push(`--> Direct Hit Bonus! Sustained targeting deals x${criticalHitMultiplier.toFixed(1)} damage to the ${subsystem}!`);
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
        if (subsystem && target.subsystems[subsystem]?.health === 0) logs.push(`CRITICAL HIT: ${target.name}'s ${subsystem} have been disabled!`);

    } else {
         logs.push(`--> Shields absorbed the entire hit.`);
    }
    return logs;
};
