import type { Ship, ShipSubsystems, GameState, TorpedoProjectile, SectorState, Entity, Position, BeamWeapon, BeamAttackResult, Mine } from '../../types';
import { calculateDistance } from './ai';
import { isPosInNebula } from './sector';
import { useOneDilithiumCrystal } from './energy';
import { generateTorpedoImpactLog } from '../ai/aiLogger';
import { TorpedoType } from '../../types';

export const getTorpedoHitChance = (torpedoType: TorpedoType, distance: number): number => {
    let baseAccuracy: number;

    switch (distance) {
        case 1: baseAccuracy = 0.80; break;
        case 2: baseAccuracy = 0.70; break;
        case 3: baseAccuracy = 0.50; break;
        case 4: baseAccuracy = 0.25; break;
        default: baseAccuracy = 0;
    }

    if (baseAccuracy === 0) return 0;

    let modifier = 0;
    switch (torpedoType) {
        case 'Quantum':     modifier = 0.15; break;
        case 'Plasma':      modifier = -0.10; break;
        case 'HeavyPlasma': modifier = -0.15; break;
        case 'HeavyPhoton': modifier = -0.20; break;
        default:            modifier = 0; // Photon
    }

    return Math.max(0, Math.min(1, baseAccuracy + modifier));
};


export const canTargetEntity = (source: Ship, target: Entity, sector: SectorState, currentTurn: number): { canTarget: boolean, reason: string } => {
    if (source.weaponFailureTurn && currentTurn < source.weaponFailureTurn) {
        return { canTarget: false, reason: `Weapon systems are offline due to ion storm for ${source.weaponFailureTurn - currentTurn} more turn(s).` };
    }
    
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

export const fireBeamWeapon = (
    target: Ship, weapon: BeamWeapon, subsystem: keyof ShipSubsystems | null,
    sourceShip: Ship, gameState: GameState
): BeamAttackResult => {
    target.lastAttackerPosition = { ...sourceShip.position };
    const wasShieldHit = target.shields > 0;
    const shieldPercentBeforeHit = wasShieldHit ? Math.round((target.shields) / target.maxShields * 100) : 0;

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
    
    // Klingon Disruptors are less accurate than phasers. Romulan disruptors are not penalized.
    if (weapon.name.toLowerCase().includes('disruptor') && !weapon.name.toLowerCase().includes('romulan')) {
        hitChance *= 0.95;
    }

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
    
    const phaserPowerModifier = sourceShip.energyAllocation.weapons / 100;
    const damageAfterPower = weapon.baseDamage * phaserPowerModifier * sourceShip.energyModifier;

    const phaserEfficiency = sourceShip.subsystems.weapons.health / sourceShip.subsystems.weapons.maxHealth;
    const baseDamage = damageAfterPower * phaserEfficiency;

    const pointDefenseModifier = sourceShip.pointDefenseEnabled ? 0.6 : 1.0;
    let effectiveDamage = baseDamage * pointDefenseModifier;

    const damageModifiers: string[] = [];
    if (sourceShip.pointDefenseEnabled) {
        damageModifiers.push('PD Active x0.6');
    }

    const distance = calculateDistance(sourceShip.position, target.position);
    let effectiveDistance = distance;
    if (sourceShip.pointDefenseEnabled) {
        effectiveDistance++;
    }
    
    const MAX_PHASER_RANGE = weapon.range;
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
    
    const hit = Math.random() < hitChance;
    const leakageChance = 0.05 + Math.pow(1 - (target.maxShields > 0 ? target.shields / target.maxShields : 0), 2) * 0.95;

    if (!hit) {
        return { hit: false, hitChance, damageModifiers, damageDealt: 0, wasShieldHit: false, shieldPercentBeforeHit: 0, absorbedByShields: 0, leakageDamage: 0, leakageChance, breakthroughDamage: 0, totalPenetratingDamage: 0, finalHullDamage: 0, finalSubsystemDamage: 0, subsystemTargeted: null, targetDestroyed: false, subsystemDestroyed: false, cloakWasDestabilized: false };
    }

    const damageDealt = Math.round(effectiveDamage);

    const leakRoll = Math.random();
    
    let leakageDamage = 0;
    let damageHittingShields = effectiveDamage;

    if (target.shields > 0 && leakRoll < leakageChance) {
        const leakageAmount = effectiveDamage * leakageChance;
        leakageDamage = Math.max(1, Math.round(leakageAmount));
        damageHittingShields = effectiveDamage - leakageDamage;
    }
    
    const absorbedByShields = Math.min(target.shields, damageHittingShields);
    
    target.shields = Math.max(0, target.shields - absorbedByShields);
    const breakthroughDamage = damageHittingShields - absorbedByShields;
    const totalPenetratingDamage = leakageDamage + breakthroughDamage;
    
    let finalSubsystemDamage = 0;
    let finalHullDamage = 0;
    let subsystemDestroyed = false;
    
    if (totalPenetratingDamage > 0) {
        if (subsystem && target.subsystems[subsystem]) {
            const shieldsAreLow = (target.maxShields > 0 ? target.shields / target.maxShields : 0) <= 0.2;
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
            const systemBeforeDamage = target.subsystems[subsystem].health;
            target.subsystems[subsystem].health = Math.max(0, systemBeforeDamage - finalSubsystemDamage);
            if(systemBeforeDamage > 0 && target.subsystems[subsystem].health === 0) {
                subsystemDestroyed = true;
            }
        }
    }
    
    const cloakWasDestabilized = target.cloakState === 'cloaking';
    if (cloakWasDestabilized) {
        target.cloakDestabilizedThisTurn = true;
        const instabilityIncrease = 0.15;
        target.cloakInstability = Math.min(0.8, target.cloakInstability + instabilityIncrease);
    }

    return {
        hit: true, hitChance, damageModifiers, damageDealt, wasShieldHit, shieldPercentBeforeHit, absorbedByShields,
        leakageDamage, leakageChance, breakthroughDamage, totalPenetratingDamage, finalHullDamage, finalSubsystemDamage,
        subsystemTargeted: subsystem, targetDestroyed: target.hull <= 0, subsystemDestroyed, cloakWasDestabilized
    };
};


export const applyTorpedoDamage = (target: Ship, torpedo: TorpedoProjectile, sourceShip: Ship | null): string => {
    if (sourceShip) {
        target.lastAttackerPosition = { ...sourceShip.position };
    }

    const distance = calculateDistance(torpedo.position, target.position);
    const hitChance = getTorpedoHitChance(torpedo.torpedoType, distance);
    const hit = Math.random() < hitChance;

    if (!hit) {
        return generateTorpedoImpactLog({
            source: sourceShip,
            target,
            torpedo,
            results: {
                hit: false,
                hitChance,
                bypassDamage: 0,
                shieldAbsorption: 0,
                absorbedDamageRatio: 0,
                finalHullDamage: 0,
                newInstability: null,
                isDestroyed: false,
            }
        });
    }

    let damageToHull = torpedo.damage;

    // --- Calculations ---
    let bypassDamage = 0;
    if (torpedo.torpedoType === 'Quantum') {
        bypassDamage = damageToHull * 0.25;
        target.hull = Math.max(0, target.hull - bypassDamage);
        damageToHull *= 0.75;
    }
    
    const shieldAbsorption = Math.min(target.shields, damageToHull * 4);
    const absorbedDamageRatio = shieldAbsorption / 4;
    damageToHull -= absorbedDamageRatio;

    if (shieldAbsorption > 0) {
        target.shields = Math.max(0, target.shields - shieldAbsorption);
    }
    
    const finalHullDamage = Math.max(0, Math.round(damageToHull));
    if (finalHullDamage > 0) {
        target.hull = Math.max(0, target.hull - finalHullDamage);
    }

    let plasmaDamage, plasmaDuration;
    if (torpedo.specialDamage?.type === 'plasma_burn') {
        target.statusEffects.push({
            type: 'plasma_burn',
            damage: torpedo.specialDamage.damage,
            turnsRemaining: torpedo.specialDamage.duration,
        });
        plasmaDamage = torpedo.specialDamage.damage;
        plasmaDuration = torpedo.specialDamage.duration;
    }

    let newInstability: number | null = null;
    if (target.cloakState === 'cloaking') {
        target.cloakDestabilizedThisTurn = true;
        const instabilityIncrease = 0.25; // Torpedoes are more jarring
        target.cloakInstability = Math.min(0.8, target.cloakInstability + instabilityIncrease);
        newInstability = target.cloakInstability;
    }

    const isDestroyed = target.hull <= 0;
    
    const logData = {
        source: sourceShip,
        target,
        torpedo,
        results: {
            hit: true,
            hitChance,
            bypassDamage,
            shieldAbsorption,
            absorbedDamageRatio,
            finalHullDamage,
            newInstability,
            isDestroyed,
            plasmaDamage,
            plasmaDuration,
        }
    };
    
    return generateTorpedoImpactLog(logData);
};

export const applyMineDamage = (target: Ship, mine: Mine): string => {
    target.lastAttackerPosition = { ...mine.position };
    let damageToHull = mine.damage;

    let bypassDamage = 0;
    if (mine.torpedoType === 'Quantum') {
        bypassDamage = damageToHull * 0.25;
        target.hull = Math.max(0, target.hull - bypassDamage);
        damageToHull *= 0.75;
    }
    
    const shieldAbsorption = Math.min(target.shields, damageToHull * 4);
    const absorbedDamageRatio = shieldAbsorption / 4;
    damageToHull -= absorbedDamageRatio;

    if (shieldAbsorption > 0) {
        target.shields = Math.max(0, target.shields - shieldAbsorption);
    }
    
    const finalHullDamage = Math.max(0, Math.round(damageToHull));
    if (finalHullDamage > 0) {
        target.hull = Math.max(0, target.hull - finalHullDamage);
    }

    let plasmaDamage, plasmaDuration;
    if (mine.specialDamage?.type === 'plasma_burn') {
        target.statusEffects.push({
            type: 'plasma_burn',
            damage: mine.specialDamage.damage,
            turnsRemaining: mine.specialDamage.duration,
        });
        plasmaDamage = mine.specialDamage.damage;
        plasmaDuration = mine.specialDamage.duration;
    }

    const isDestroyed = target.hull <= 0;
    
    const logData = {
        source: null,
        target,
        torpedo: { ...mine, name: "Cloaked Plasma Mine" } as any,
        results: {
            hit: true,
            hitChance: 1, // Always hits
            bypassDamage,
            shieldAbsorption,
            absorbedDamageRatio,
            finalHullDamage,
            newInstability: null,
            isDestroyed,
            plasmaDamage,
            plasmaDuration,
        }
    };
    
    return generateTorpedoImpactLog(logData);
};