
import type { Ship, ShipSubsystems, GameState, Entity } from '../../types';
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

    // Other future targeting rules can be added here.
    return { canTarget: true, reason: "" };
};

export const applyPhaserDamage = (
    target: Ship, damage: number, subsystem: keyof ShipSubsystems | null,
    sourceShip: Ship, gameState: GameState
): string[] => {
    const logs: string[] = [];
    let hitChance = 0.9;
    if (isPosInNebula(target.position, gameState.currentSector)) {
        hitChance *= 0.75;
        logs.push(`Nebula interference is affecting targeting sensors.`);
    }
    if (target.evasive) hitChance *= 0.6;
    if (sourceShip.evasive) hitChance *= 0.75;

    const asteroidPositions = new Set(gameState.currentSector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
    const targetPosKey = `${target.position.x},${target.position.y}`;
    if (asteroidPositions.has(targetPosKey)) {
        hitChance *= 0.70; // 30% reduction
        logs.push(`Target is obscured by an asteroid field, reducing accuracy.`);
    }
    
    if (Math.random() > hitChance) {
        logs.push(`--> Attack missed!`);
        return logs;
    }
    
    const phaserEfficiency = sourceShip.subsystems.weapons.health / sourceShip.subsystems.weapons.maxHealth;
    let effectiveDamage = damage * phaserEfficiency;
    
    const distance = calculateDistance(sourceShip.position, target.position);
    effectiveDamage *= Math.max(0.2, 1 - (distance - 1) / 5);

    let damageToProcess = effectiveDamage;
    let damageBypassingShields = 0;

    if (subsystem) {
        const shieldPercent = target.maxShields > 0 ? target.shields / target.maxShields : 0;
        damageBypassingShields = damageToProcess * ((1 - shieldPercent) ** 2);
        damageToProcess -= damageBypassingShields;
    }

    const absorbedByShields = Math.min(target.shields, damageToProcess);
    target.shields -= absorbedByShields;
    damageToProcess -= absorbedByShields;
    
    const totalPenetratingDamage = damageToProcess + damageBypassingShields;

    if (totalPenetratingDamage > 0) {
        if (subsystem && target.subsystems[subsystem]) {
            const subsystemPortion = totalPenetratingDamage * 0.7;
            const hullPortion = totalPenetratingDamage * 0.3;
            target.subsystems[subsystem].health = Math.max(0, target.subsystems[subsystem].health - subsystemPortion);
            target.hull = Math.max(0, target.hull - hullPortion);
            logs.push(`--> HIT! Target takes ${Math.round(hullPortion)} hull and ${Math.round(subsystemPortion)} subsystem damage!`);
        } else {
            target.hull = Math.max(0, target.hull - totalPenetratingDamage);
            logs.push(`--> HIT! Target takes ${Math.round(totalPenetratingDamage)} hull damage!`);
        }
    } else {
         logs.push(`--> Shields absorbed the entire hit.`);
    }
    return logs;
};