
import type { Ship, ShipSubsystems, GameState } from '../../types';
import { calculateDistance } from './ai';

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

export const applyPhaserDamage = (
    target: Ship, damage: number, subsystem: keyof ShipSubsystems | null,
    sourceShip: Ship, gameState: GameState
): string[] => {
    const logs: string[] = [];
    let hitChance = 0.9;
    if (gameState.currentSector.hasNebula) hitChance *= 0.75;
    if (target.evasive) hitChance *= 0.6;
    if (sourceShip.evasive) hitChance *= 0.75;
    
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
