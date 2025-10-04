
import type { Ship, ShipSubsystems, ResourceType, GameState, LogEntry } from '../../types';
import { shipClasses } from '../../assets/ships/configs/shipClassStats';
import { isPosInNebula } from './sector';
import { generateCloakLog } from '../ai/aiLogger';

/**
 * Mutates a ship object to apply a change to one of its resources or subsystems.
 * Handles min/max clamping.
 * @param ship The ship object to mutate.
 * @param resource The resource or subsystem key to change.
 * @param amount The amount to change by (can be positive or negative).
 */
export const applyResourceChange = (ship: Ship, resource: ResourceType, amount: number) => {
    switch (resource) {
        case 'hull':
            ship.hull = Math.max(0, Math.min(ship.maxHull, ship.hull + amount));
            break;
        case 'energy':
            ship.energy.current = Math.max(0, Math.min(ship.energy.max, ship.energy.current + amount));
            break;
        case 'dilithium':
            ship.dilithium.current = Math.max(0, Math.min(ship.dilithium.max, ship.dilithium.current + amount));
            break;
        case 'torpedoes':
            ship.torpedoes.current = Math.max(0, Math.min(ship.torpedoes.max, ship.torpedoes.current + amount));
            break;
        case 'morale':
            ship.crewMorale.current = Math.max(0, Math.min(ship.crewMorale.max, ship.crewMorale.current + amount));
            break;
        case 'security_teams':
            ship.securityTeams.current = Math.max(0, Math.min(ship.securityTeams.max, ship.securityTeams.current + amount));
            break;
        // Note: 'shields' as a resource targets the health of the shield generator subsystem, not the shield hit points.
        case 'weapons':
        case 'engines':
        case 'shields':
        case 'transporter':
        case 'pointDefense':
        case 'computer':
        case 'lifeSupport':
        case 'shuttlecraft':
            const subsystem = ship.subsystems[resource];
            if (subsystem) {
                subsystem.health = Math.max(0, Math.min(subsystem.maxHealth, subsystem.health + amount));
            }
            break;
    }
};

/**
 * Calculates the amount of energy restored by one dilithium crystal,
 * based on the ship's engine health. Scales from 5% to 100%.
 * @param ship The ship using the crystal.
 * @returns The amount of energy restored.
 */
function calculateEnergyPerCrystal(ship: Ship): number {
    const engineEfficiency = ship.subsystems.engines.maxHealth > 0 
        ? ship.subsystems.engines.health / ship.subsystems.engines.maxHealth 
        : 0;
    // New scaling: 5% at 0% health, 100% at 100% health.
    const restoredEnergyFraction = 0.05 + 0.95 * engineEfficiency;
    return ship.energy.max * restoredEnergyFraction;
}

/**
 * Applies consequential damage to a random subsystem after an emergency power transfer.
 * @param ship The ship to damage.
 * @param crystalsUsed The number of crystals used, which scales the damage.
 * @returns A log message about the damage, or null if no damage occurred.
 */
function applyConsequentialDamage(ship: Ship, crystalsUsed: number): string | null {
    // 25% chance of damage per crystal used.
    if (Math.random() > 0.25 * crystalsUsed) {
        return null;
    }
    
    const subsystems: (keyof ShipSubsystems)[] = ['weapons', 'engines', 'shields', 'transporter', 'pointDefense', 'computer', 'lifeSupport'];
    const functioningSubsystems = subsystems.filter(key => {
        const system = ship.subsystems[key];
        return system && system.maxHealth > 0 && system.health > 0;
    });

    if (functioningSubsystems.length === 0) {
        return null;
    }

    const randomSubsystemKey = functioningSubsystems[Math.floor(Math.random() * functioningSubsystems.length)];
    const targetSubsystem = ship.subsystems[randomSubsystemKey];
    // Damage scales with crystals used
    const damage = (5 + Math.floor(Math.random() * 6)) * crystalsUsed;
    targetSubsystem.health = Math.max(0, targetSubsystem.health - damage);
    
    return `WARNING: The emergency power transfer of ${crystalsUsed} crystal(s) caused ${damage} damage to the ${randomSubsystemKey} system!`;
}


/**
 * Consumes one dilithium crystal to provide an emergency energy boost for a specific action.
 * @param ship The ship using the crystal.
 * @returns An object containing the amount of energy restored and any log messages.
 */
export function useOneDilithiumCrystal(ship: Ship): { restoredEnergy: number, logs: string[] } {
    const logs: string[] = [];
    if (ship.dilithium.current <= 0) {
        return { restoredEnergy: 0, logs: ["No dilithium crystals available."] };
    }
    
    ship.dilithium.current--;
    const restoredEnergy = calculateEnergyPerCrystal(ship);
    ship.energy.current = Math.min(ship.energy.max, ship.energy.current + restoredEnergy);
    
    let mainLog = `Consumed one dilithium crystal to restore ${Math.round(restoredEnergy)} energy, <b>${ship.dilithium.current}</b> of ${ship.dilithium.max} left.`;

    const damageLog = applyConsequentialDamage(ship, 1);
    if (damageLog) {
        mainLog += `<br/><span class="text-yellow-400"><b>WARNING</b></span>: ${damageLog.substring(9)}`;
    }
    logs.push(mainLog);

    return { restoredEnergy, logs };
}

/**
 * At the end of a turn when a ship is out of power, consumes as many dilithium crystals
 * as needed to attempt a full recharge.
 * @param ship The ship to recharge.
 * @param turn The current game turn.
 * @returns An array of log messages generated by the process.
 */
export function handleFullRecharge(ship: Ship, turn: number): string[] {
    const logs: string[] = [];
    
    if (ship.dilithium.current <= 0) {
        return logs;
    }
    
    const energyNeeded = ship.energy.max - ship.energy.current;
    if (energyNeeded <= 0) {
        return logs;
    }

    const energyPerCrystal = calculateEnergyPerCrystal(ship);

    if (energyPerCrystal <= (ship.energy.max * 0.051)) { 
        logs.push(`Engines are too damaged to effectively channel power from dilithium.`);
    }

    const crystalsToUse = Math.ceil(energyNeeded / energyPerCrystal);
    const crystalsAvailable = ship.dilithium.current;
    const crystalsToConsume = Math.min(crystalsToUse, crystalsAvailable);

    if (crystalsToConsume > 0) {
        ship.dilithium.current -= crystalsToConsume;
        const totalEnergyRestored = crystalsToConsume * energyPerCrystal;
        ship.energy.current = Math.min(ship.energy.max, ship.energy.current + totalEnergyRestored);

        let mainLog = `Reserve power depleted! Consuming ${crystalsToConsume} dilithium crystal(s) to restore ${Math.round(totalEnergyRestored)} energy. <b>${ship.dilithium.current}</b> of ${ship.dilithium.max} left.`;

        const damageLog = applyConsequentialDamage(ship, crystalsToConsume);
        if (damageLog) {
            mainLog += `<br/><span class="text-yellow-400"><b>WARNING</b></span>: ${damageLog.substring(9)}`;
        }
        logs.push(mainLog);
    }
    
    return logs;
}

/**
 * Processes all end-of-turn system updates for a single ship, including repairs, energy management, and status effects.
 * This function mutates the ship object directly.
 * @param ship The ship to process.
 * @param gameState The current state of the game.
 * @returns An array of log entries generated by the system updates.
 */
export const handleShipEndOfTurnSystems = (ship: Ship, gameState: GameState, addTurnEvent?: (event: string) => void): Omit<LogEntry, 'id' | 'turn'>[] => {
    const logs: Omit<LogEntry, 'id' | 'turn'>[] = [];

    const isPlayerSource = ship.id === 'player';
    const logColor = ship.logColor || 'border-gray-500';
    const { turn, redAlert, isDocked } = gameState;

    // --- CLOAKING OVERHAUL ---
    // A single, comprehensive log is generated for all cloaking activity this turn.
    let generatedCloakLog = false;
    if (ship.cloakingCapable) {
        const stats = shipClasses[ship.shipModel]?.[ship.shipClass];
        const isCloakingOrCloaked = ship.cloakState === 'cloaking' || ship.cloakState === 'cloaked';

        if (stats && (isCloakingOrCloaked || ship.cloakState === 'decloaking')) {
            let baseReliability = ship.customCloakStats ? ship.customCloakStats.reliability : (1 - stats.cloakFailureChance);
            let environmentalModifier = 1.0;
            let envReason = "";

            const isInNebula = isPosInNebula(ship.position, gameState.currentSector);
            const isInAsteroids = gameState.currentSector.entities.some(e => e.type === 'asteroid_field' && e.position.x === ship.position.x && e.position.y === ship.position.y);

            if (isInNebula) { environmentalModifier = 0.75; envReason = ", Nebula x0.75"; } 
            else if (isInAsteroids) { environmentalModifier = 0.90; envReason = ", Asteroids x0.90"; }

            const finalReliability = (baseReliability - ship.cloakInstability) * environmentalModifier;
            const success = Math.random() < finalReliability;

            if (!success) {
                ship.cloakState = 'visible';
                ship.cloakCooldown = 2;
                ship.shieldReactivationTurn = turn + 2;
                ship.cloakTransitionTurnsRemaining = null;
            } else {
                 if (ship.customCloakStats) { // Pirate cloak special failure modes
                    if (Math.random() < ship.customCloakStats.explosionChance) {
                        logs.push({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `Catastrophic failure! The makeshift cloaking device explodes, destroying the ship!`, isPlayerSource, color: 'border-red-600', category: 'special' });
                        ship.hull = 0;
                        return logs;
                    } else if (Math.random() < ship.customCloakStats.subsystemDamageChance) {
                        const subsystems: (keyof ShipSubsystems)[] = ['weapons', 'engines', 'shields'];
                        const randomSubsystemKey = subsystems[Math.floor(Math.random() * subsystems.length)];
                        const targetSubsystem = ship.subsystems[randomSubsystemKey];
                        if(targetSubsystem) {
                            const damage = Math.round(targetSubsystem.maxHealth * 0.3);
                            targetSubsystem.health = Math.max(0, targetSubsystem.health - damage);
                            logs.push({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `WARNING: The makeshift cloak backfires, causing a power surge! ${damage} damage dealt to ${randomSubsystemKey}!`, isPlayerSource, color: 'border-orange-500', category: 'system' });
                        }
                    }
                }
            }

            const isTransitioning = ship.cloakState === 'cloaking' || ship.cloakState === 'decloaking';
            const logMessage = generateCloakLog({
                ship, finalReliability, baseReliability, instability: ship.cloakInstability, envReason,
                success, isTransitioning, turnsRemaining: ship.cloakTransitionTurnsRemaining
            });
            logs.push({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: logMessage, isPlayerSource, color: 'border-gray-400', category: 'system' });
            generatedCloakLog = true;
        }
    }
    ship.cloakDestabilizedThisTurn = false;

    // Shield Reactivation Timer
    if (ship.shieldReactivationTurn && turn >= ship.shieldReactivationTurn) {
        ship.shieldReactivationTurn = null;
        logs.push({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: 'Shield emitters are back online.', isPlayerSource, color: 'border-green-400', category: 'system' });
    }

    // Drop shields if cloaking (log for this is now in generateCloakLog)
    if (ship.cloakState !== 'visible' && ship.shields > 0) {
        ship.shields = 0;
    }

    // Docking Repairs & Resupply (only for player)
    if (ship.id === 'player' && isDocked) {
        const hullRepair = ship.maxHull * 0.2;
        const dilithiumResupply = ship.dilithium.max * 0.2;
        const torpedoResupply = ship.torpedoes.max * 0.5;

        applyResourceChange(ship, 'hull', hullRepair);
        applyResourceChange(ship, 'dilithium', dilithiumResupply);
        applyResourceChange(ship, 'torpedoes', torpedoResupply);

        (Object.keys(ship.subsystems) as Array<keyof ShipSubsystems>).forEach(key => {
            const subsystem = ship.subsystems[key];
            if (subsystem && subsystem.maxHealth > 0) {
                const subRepair = subsystem.maxHealth * 0.2;
                applyResourceChange(ship, key, subRepair);
            }
        });
        
        logs.push({ sourceId: 'system', sourceName: 'Starbase Control', message: 'Repairs and resupply in progress.', isPlayerSource: false, color: 'border-gray-500', category: 'system' });
        return logs; // No other end-of-turn actions while docked
    }

    // Damage Control Team Repairs
    if (ship.repairTarget) {
        const repairAmount = 5;
        applyResourceChange(ship, ship.repairTarget, repairAmount);
        addTurnEvent?.(`REPAIR: '${ship.name}' -> ${ship.repairTarget} (+${repairAmount})`);
    }

    // Shield Regeneration
    if ((ship.shieldReactivationTurn && turn < ship.shieldReactivationTurn) || ship.shields < 0) {
        ship.shields = 0;
    } else if (redAlert && ship.shields < ship.maxShields && ship.subsystems.shields.health > 0 && ship.cloakState === 'visible') {
        const shieldEfficiency = ship.subsystems.shields.health / ship.subsystems.shields.maxHealth;
        const powerToShieldsModifier = (ship.energyAllocation.shields / 33); 
        const baseRegen = 7;
        const regenerationAmount = baseRegen * powerToShieldsModifier * shieldEfficiency;
        
        if (regenerationAmount > 0) {
            ship.shields = Math.min(ship.maxShields, ship.shields + regenerationAmount);
            addTurnEvent?.(`REGEN: '${ship.name}' +${regenerationAmount.toFixed(1)} Shields`);
        }
    }
    
    // Energy Generation & Consumption
    const stats = shipClasses[ship.shipModel]?.[ship.shipClass];
    if (stats) {
        const engineOutputMultiplier = 0.5 + 1.5 * (ship.energyAllocation.engines / 100);
        const engineEfficiency = ship.subsystems.engines.maxHealth > 0 ? ship.subsystems.engines.health / ship.subsystems.engines.maxHealth : 0;
        const generated = stats.baseEnergyGeneration * engineOutputMultiplier * engineEfficiency;
        
        let consumption: number;
        if (ship.isRestored) {
            consumption = 0;
            if (ship.subsystems.weapons.health > 0) consumption += stats.systemConsumption.weapons;
            if (ship.shields > 0) consumption += 20 * stats.energyModifier;
        } else {
            consumption = stats.systemConsumption.base;
            for (const key in ship.subsystems) {
                const systemKey = key as keyof ShipSubsystems;
                if (ship.subsystems[systemKey] && ship.subsystems[systemKey].health > 0) {
                    consumption += stats.systemConsumption[systemKey];
                }
            }
            if(ship.shields > 0) consumption += 20 * stats.energyModifier;
            if(ship.evasive) consumption += 10 * stats.energyModifier;
            if(ship.pointDefenseEnabled) consumption += 15 * stats.energyModifier;
            if(ship.repairTarget) consumption += 5 * stats.energyModifier;

            if (ship.cloakState === 'cloaked' || ship.cloakState === 'cloaking' || ship.cloakState === 'decloaking') {
                const cloakStats = shipClasses[ship.shipModel]?.[ship.shipClass];
                if (cloakStats) {
                    let maintainCost = cloakStats.cloakEnergyCost.maintain;
                    if (ship.customCloakStats) {
                        maintainCost = ship.customCloakStats.powerCost;
                    }
                    
                    const isInNebula = isPosInNebula(ship.position, gameState.currentSector);
                    const isInAsteroids = gameState.currentSector.entities.some(e => e.type === 'asteroid_field' && e.position.x === ship.position.x && e.position.y === ship.position.y);
                    
                    if (isInNebula) {
                        maintainCost *= 1.30; // 30% increase
                    } else if (isInAsteroids) {
                        maintainCost *= 1.15; // 15% increase
                    }

                    consumption += maintainCost * stats.energyModifier;
                }
            }
        }

        const netChange = generated - consumption;
        ship.energy.current = Math.max(0, Math.min(ship.energy.max, ship.energy.current + netChange));
        addTurnEvent?.(`ENERGY: '${ship.name}' net ${netChange.toFixed(1)}`);

        if(ship.id === 'player') {
            const logMessage = `Energy grid: +${generated.toFixed(1)} GEN, -${consumption.toFixed(1)} CON. Net: ${netChange.toFixed(1)}. Reserve power is now ${Math.round(ship.energy.current)}/${ship.energy.max}. Dilithium: ${ship.dilithium.current}/${ship.dilithium.max}.`;
            logs.push({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: logMessage, isPlayerSource, color: logColor, category: 'system' });
        }
    }

    // --- Emergency Power (Dilithium) ---
    if (ship.energy.current <= 0) {
        const rechargeLogs = handleFullRecharge(ship, turn);
        rechargeLogs.forEach(message => {
            logs.push({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message, isPlayerSource, color: message.includes('WARNING') ? 'border-orange-500' : logColor, category: 'system' });
        });
    }
    
    // --- Life Support Failure Logic ---
    const lifeSupportHealth = ship.subsystems.lifeSupport.health;
    const hasPower = ship.energy.current > 0 || ship.dilithium.current > 0;
    const isLifeSupportSystemBroken = lifeSupportHealth <= 0;
    const isLifeSupportFailing = isLifeSupportSystemBroken || !hasPower;

    if (ship.lifeSupportFailureTurn !== null) {
        // A countdown is active. Check if it should be cancelled.
        if (!isLifeSupportSystemBroken && hasPower) {
            ship.lifeSupportFailureTurn = null;
            logs.push({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: 'Life support restored. Main power and oxygen production are back online.', isPlayerSource, color: 'border-green-400', category: 'system' });
        } else {
            // Countdown continues. Process it.
            const turnsSinceFailure = turn - ship.lifeSupportFailureTurn;
            const turnsRemaining = 2 - turnsSinceFailure;
            if (turnsRemaining > 0) {
                const reason = isLifeSupportSystemBroken ? 'system damage' : 'a total power failure';
                logs.push({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `CRITICAL: Life support is on emergency batteries due to ${reason}. Main power failure in ${turnsRemaining} turn(s)!`, isPlayerSource, color: 'border-red-600', category: 'system' });
            } else {
                ship.isDerelict = true;
                ship.hull = Math.min(ship.hull, ship.maxHull * 0.1);
                ship.shields = 0;
                ship.energy.current = 0;
                Object.keys(ship.subsystems).forEach(key => {
                    const system = ship.subsystems[key as keyof ShipSubsystems];
                    if (system) system.health = 0;
                });
                logs.push({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `Life support has failed! The ship is now a derelict hulk.`, isPlayerSource, color: 'border-red-600', category: 'system' });
            }
        }
    } else if (isLifeSupportFailing) {
        // Countdown is NOT active, but failure conditions are met. START the countdown.
        ship.lifeSupportFailureTurn = turn;
        const reason = isLifeSupportSystemBroken ? 'critical system damage' : 'a total power failure';
        logs.push({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `CRITICAL: Life support has failed due to ${reason}! Switching to emergency batteries. Failure in 2 turns!`, isPlayerSource, color: 'border-red-600', category: 'system' });
    }

    // Cloaking Sequence Resolution
    if (ship.cloakTransitionTurnsRemaining !== null && ship.cloakState !== 'visible') { // Check if cloak didn't just fail
        ship.cloakTransitionTurnsRemaining--;
        if (ship.cloakTransitionTurnsRemaining <= 0) {
            ship.cloakTransitionTurnsRemaining = null;
            if (ship.cloakState === 'cloaking') {
                ship.cloakState = 'cloaked';
                if (!generatedCloakLog) logs.push({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: 'Cloaking field is now active.', isPlayerSource, color: 'border-green-400', category: 'special' });
            } else if (ship.cloakState === 'decloaking') {
                ship.cloakState = 'visible';
                ship.cloakCooldown = 2;
                ship.shieldReactivationTurn = turn + 2;
                if (!generatedCloakLog) logs.push({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: 'Decloaking sequence complete. All systems are back online.', isPlayerSource, color: 'border-blue-400', category: 'special' });
            }
        }
    }

    // Status Effects Processing
    ship.statusEffects = ship.statusEffects.filter(effect => {
        if (effect.type === 'plasma_burn') {
            const damage = Math.round(effect.damage * (stats ? stats.energyModifier : 1));
            ship.hull = Math.max(0, ship.hull - damage);
            logs.push({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `Plasma fire burns the hull for ${damage} damage!`, isPlayerSource, color: 'border-orange-400', category: 'combat' });
            effect.turnsRemaining--;
        }
        return effect.turnsRemaining > 0;
    });

    return logs;
};
