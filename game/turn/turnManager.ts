import type { GameState, PlayerTurnActions, Position, Entity, Ship, ShipSubsystems, TorpedoProjectile, LogEntry, TorpedoType } from '../../types';
import { processAITurns } from './aiProcessor';
import { AIActions } from '../ai/FactionAI';
import { applyPhaserDamage, consumeEnergy, canTargetEntity, applyTorpedoDamage } from '../utils/combat';
import { moveOneStep, calculateDistance } from '../utils/ai';
import { uniqueId } from '../utils/helpers';
import { shipClasses } from '../../assets/ships/configs/shipClassStats';
import { isPosInNebula, isDeepNebula } from '../utils/sector';

interface TurnResolutionResult {
    nextGameState: GameState;
    newNavigationTarget: Position | null;
    newSelectedTargetId: string | null;
}

const getEnergyOutputMultiplier = (engineHealthPercent: number): number => {
    const H = engineHealthPercent;
    if (H > 0.75) return 0.9 + (H - 0.75) * 0.4;
    if (H > 0.25) return 0.5 + (H - 0.25) * 0.8;
    return H * 2;
};

export function resolveTurn(
    currentGameState: GameState,
    playerTurnActions: PlayerTurnActions,
    navigationTarget: Position | null,
    selectedTargetId: string | null
): TurnResolutionResult {
    const next: GameState = JSON.parse(JSON.stringify(currentGameState));
    if (next.gameOver) {
        return { nextGameState: next, newNavigationTarget: navigationTarget, newSelectedTargetId: selectedTargetId };
    }
    
    let newNavTarget = navigationTarget;
    let newSelectedTargetId = selectedTargetId;

    const { player, currentSector } = next;
    const playerShip = player.ship;
    const initialPlayerPosition = { ...playerShip.position };

    const addLogForTurn = (logData: Omit<LogEntry, 'id' | 'turn' | 'color'> & { color?: string }) => {
        const allShips = [...next.currentSector.entities.filter((e): e is Ship => e.type === 'ship'), next.player.ship];
        const sourceShip = allShips.find(s => s.id === logData.sourceId);
        next.logs.push({ 
            id: uniqueId(), 
            turn: next.turn, 
            ...logData, 
            color: logData.color || sourceShip?.logColor || 'border-gray-500' 
        });
    };
    
    const triggerDesperationAnimation = (animation: { source: Ship; target?: Ship; type: string; outcome?: 'success' | 'failure' }) => {
        next.desperationMoveAnimations.push(animation);
    };

    if (playerShip.isStunned) {
        addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: "Ship systems were offline. All power restored.", isPlayerSource: true, color: 'border-orange-400' });
        playerShip.isStunned = false;
    } else {
        if (playerShip.repairTarget) {
            const energyCost = 10;
            const { success, logs: energyLogs } = consumeEnergy(playerShip, energyCost);
            energyLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true }));
            if (success) {
                const repairAmount = 25;
                const targetSystem = playerShip.repairTarget;
                let isComplete = false;
                if (targetSystem === 'hull') {
                    playerShip.hull = Math.min(playerShip.maxHull, playerShip.hull + repairAmount);
                    if (playerShip.hull === playerShip.maxHull) isComplete = true;
                } else {
                    const subsystem = playerShip.subsystems[targetSystem as keyof ShipSubsystems];
                    subsystem.health = Math.min(subsystem.maxHealth, subsystem.health + repairAmount);
                    if (subsystem.health === subsystem.maxHealth) isComplete = true;
                }
                if (isComplete) {
                    addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Repairs to ${targetSystem} are complete.`, isPlayerSource: true });
                    playerShip.repairTarget = null;
                }
            }
        }
        
        let maintainedTargetLock = false;

        if (playerShip.cloakState === 'cloaked' && (playerTurnActions.combat || playerTurnActions.hasLaunchedTorpedo || playerTurnActions.hasUsedAwayTeam)) {
            playerShip.cloakState = 'visible';
            playerShip.cloakCooldown = 2;
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: 'Taking offensive action has disengaged the cloaking device.', isPlayerSource: true });
        }
        
        const wasInNebula = isPosInNebula(playerShip.position, currentSector);
        const wasInDeepNebula = isDeepNebula(playerShip.position, currentSector);

        if (playerShip.retreatingTurn === null) {
            if (navigationTarget) {
                const movementSpeed = playerShip.cloakState === 'cloaked' ? 1 : (next.redAlert ? 1 : 3);
                for (let i = 0; i < movementSpeed; i++) {
                    if (playerShip.position.x === navigationTarget.x && playerShip.position.y === navigationTarget.y) break;
                    playerShip.position = moveOneStep(playerShip.position, navigationTarget);
                }
                if (playerShip.position.x === navigationTarget.x && playerShip.position.y === navigationTarget.y) {
                    newNavTarget = null;
                }
                 if (next.orbitingPlanetId && (playerShip.position.x !== initialPlayerPosition.x || playerShip.position.y !== initialPlayerPosition.y)) {
                    const planet = next.currentSector.entities.find(e => e.id === next.orbitingPlanetId);
                    if (planet && Math.max(Math.abs(playerShip.position.x - planet.position.x), Math.abs(playerShip.position.y - planet.position.y)) > 1) {
                        next.orbitingPlanetId = null;
                        addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Leaving orbit of ${planet.name}.`, isPlayerSource: true });
                    }
                }
            }
            if (playerTurnActions.combat?.type === 'phasers') {
                const target = currentSector.entities.find(e => e.id === playerTurnActions.combat!.targetId);
                if (target) {
                    const targetingCheck = canTargetEntity(playerShip, target, next.currentSector);
                    if (!targetingCheck.canTarget) {
                        addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Firing solution failed: ${targetingCheck.reason}`, isPlayerSource: true });
                    } else {
                        const combatLogs = applyPhaserDamage(target as Ship, 20 * (playerShip.energyAllocation.weapons / 100), player.targeting?.subsystem || null, playerShip, next);
                        next.combatEffects.push({ type: 'phaser', sourceId: playerShip.id, targetId: target.id, faction: playerShip.faction, delay: 0 });
                        combatLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true }));
                        if (player.targeting?.subsystem) maintainedTargetLock = true;
                    }
                }
            }
        }
        
        const isInNebula = isPosInNebula(playerShip.position, currentSector);
        const isInDeepNebula = isDeepNebula(playerShip.position, currentSector);

        if (isInNebula && !wasInNebula) {
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: "Entering nebula. Our sensor range is reduced.", isPlayerSource: true });
        } else if (!isInNebula && wasInNebula) {
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: "We have cleared the nebula. Sensors are back to full capacity.", isPlayerSource: true });
        }

        if (isInDeepNebula && !wasInDeepNebula) {
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: "We've entered a deep nebula. We are hidden from enemy sensors!", isPlayerSource: true, color: 'border-green-400' });
        } else if (!isInDeepNebula && wasInDeepNebula) {
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: "Leaving deep nebula cover. We are now visible on local sensors.", isPlayerSource: true, color: 'border-orange-400' });
        }


        if (player.targeting) {
            if (maintainedTargetLock) player.targeting.consecutiveTurns = (player.targeting.consecutiveTurns || 1) + 1;
            else if (player.targeting.consecutiveTurns > 1) player.targeting.consecutiveTurns = 1;
        }
    }

    // =================================================================
    // == Point Defense Phase ==
    // =================================================================
    let pointDefenseFired = false;
    if (playerShip.pointDefenseEnabled && playerShip.subsystems.pointDefense.health > 0) {
        const incomingTorpedoes = currentSector.entities.filter((e): e is TorpedoProjectile => 
            e.type === 'torpedo_projectile' && 
            e.faction !== 'Federation' && 
            e.hull > 0
        );

        if (incomingTorpedoes.length > 0) {
            const POINT_DEFENSE_RANGE = 1;
            const validTargets = incomingTorpedoes.filter(torpedo => 
                calculateDistance(playerShip.position, torpedo.position) <= POINT_DEFENSE_RANGE
            );
            
            if (validTargets.length > 0) {
                const threatOrder: Record<TorpedoType, number> = {
                    'Quantum': 5,
                    'HeavyPhoton': 4,
                    'Photon': 3,
                    'HeavyPlasma': 2,
                    'Plasma': 1,
                };
                validTargets.sort((a, b) => threatOrder[b.torpedoType] - threatOrder[a.torpedoType]);
                
                const torpedoToShoot = validTargets[0];

                const activeEnergyCost = 40;
                const { success, logs: energyLogs } = consumeEnergy(playerShip, activeEnergyCost);
                energyLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true }));

                if (success) {
                    pointDefenseFired = true;
                    const hitChance = playerShip.subsystems.pointDefense.health / playerShip.subsystems.pointDefense.maxHealth;
                    if (Math.random() < hitChance) {
                        torpedoToShoot.hull = 0;
                        next.combatEffects.push({ 
                            type: 'point_defense', 
                            sourceId: playerShip.id, 
                            targetId: torpedoToShoot.id, 
                            faction: playerShip.faction, 
                            delay: 0 
                        });
                        addLogForTurn({
                            sourceId: 'player',
                            sourceName: 'Point-Defense System',
                            message: `Intercepted and destroyed an incoming ${torpedoToShoot.name}! (Hit Chance: ${Math.round(hitChance * 100)}%). Consumed ${activeEnergyCost} power.`,
                            isPlayerSource: true,
                        });
                    } else {
                         addLogForTurn({
                            sourceId: 'player',
                            sourceName: 'Point-Defense System',
                            message: `Attempted to intercept a ${torpedoToShoot.name} but missed! (Hit Chance: ${Math.round(hitChance * 100)}%). Consumed ${activeEnergyCost} power.`,
                            isPlayerSource: true,
                        });
                    }
                } else {
                    addLogForTurn({
                        sourceId: 'player',
                        sourceName: 'Point-Defense System',
                        message: `Insufficient power to intercept incoming torpedo!`,
                        isPlayerSource: true,
                        color: 'border-red-500'
                    });
                }
            }
        }
        
        if (!pointDefenseFired) {
            const passiveEnergyCost = 20;
            const { success, logs: energyLogs } = consumeEnergy(playerShip, passiveEnergyCost);
            energyLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true }));
            if(success) {
                 addLogForTurn({
                    sourceId: 'player',
                    sourceName: 'Point-Defense System',
                    message: `Point-defense grid maintained. Consumed ${passiveEnergyCost} power.`,
                    isPlayerSource: true,
                });
            } else {
                playerShip.pointDefenseEnabled = false;
                 addLogForTurn({
                    sourceId: 'player',
                    sourceName: 'Point-Defense System',
                    message: `Insufficient power for point-defense upkeep! System automatically deactivated.`,
                    isPlayerSource: true,
                    color: 'border-red-500'
                });
            }
        }
    }
    
    const projectiles = currentSector.entities.filter((e): e is TorpedoProjectile => e.type === 'torpedo_projectile');
    const allShipsForProjectiles = [...currentSector.entities.filter((e): e is Ship => e.type === 'ship'), playerShip];
    const destroyedProjectileIds = new Set<string>();
    const asteroidPositions = new Set(next.currentSector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));

    for (const torpedo of projectiles) {
        if (torpedo.hull <= 0) { destroyedProjectileIds.add(torpedo.id); continue; }
        const targetEntity = allShipsForProjectiles.find(s => s.id === torpedo.targetId);
        if (!targetEntity || targetEntity.hull <= 0) { destroyedProjectileIds.add(torpedo.id); continue; }
        
        for (let i = 0; i < torpedo.speed; i++) {
            if (torpedo.position.x === targetEntity.position.x && torpedo.position.y === targetEntity.position.y) break;

            const nextStep = moveOneStep(torpedo.position, targetEntity.position);

            if (isPosInNebula(nextStep, currentSector)) {
                if (calculateDistance(torpedo.position, targetEntity.position) > 1) {
                    addLogForTurn({ sourceId: torpedo.sourceId, sourceName: torpedo.name, message: `The ${torpedo.name} is disrupted by the nebula and fizzles out.`, isPlayerSource: torpedo.faction === 'Federation' });
                    torpedo.hull = 0;
                    break;
                }
            }
            
            const nextStepPosKey = `${nextStep.x},${nextStep.y}`;
            if (asteroidPositions.has(nextStepPosKey)) {
                if (Math.random() < 0.40) { // 40% chance of impact
                    addLogForTurn({
                        sourceId: torpedo.sourceId,
                        sourceName: torpedo.name,
                        message: `The ${torpedo.name} has struck an asteroid and was destroyed!`,
                        isPlayerSource: torpedo.faction === 'Federation'
                    });
                    next.combatEffects.push({ type: 'torpedo_hit', position: nextStep, delay: 0, torpedoType: torpedo.torpedoType });
                    torpedo.hull = 0;
                    break; 
                }
            }

            torpedo.position = nextStep;
            torpedo.path.push({ ...torpedo.position });
            
            if (torpedo.position.x === targetEntity.position.x && torpedo.position.y === targetEntity.position.y) {
                const combatLogs = applyTorpedoDamage(targetEntity, torpedo, next);
                next.combatEffects.push({ type: 'torpedo_hit', position: targetEntity.position, delay: 0, torpedoType: torpedo.torpedoType });
                combatLogs.forEach(msg => addLogForTurn({ sourceId: torpedo.sourceId, sourceName: torpedo.name, message: msg, isPlayerSource: torpedo.faction === 'Federation' }));
                torpedo.hull = 0;
                break;
            }
        }
        if (torpedo.hull <= 0) {
            destroyedProjectileIds.add(torpedo.id);
        }
    }

    next.currentSector.entities = next.currentSector.entities.filter(e => !destroyedProjectileIds.has(e.id));
    
    const aiActions: AIActions = { addLog: addLogForTurn, applyPhaserDamage, triggerDesperationAnimation };
    processAITurns(next, aiActions, new Set<string>());

    // =================================================================
    // == Status Effects Phase ==
    // =================================================================
    const allShipsForStatus = [...next.currentSector.entities.filter((e): e is Ship => e.type === 'ship'), playerShip];
    allShipsForStatus.forEach(ship => {
        if (ship.statusEffects.length > 0 && ship.hull > 0) {
            const newStatusEffects = [];
            for (const effect of ship.statusEffects) {
                if (effect.type === 'plasma_burn') {
                    ship.hull = Math.max(0, ship.hull - effect.damage);
                    addLogForTurn({
                        sourceId: 'system',
                        sourceName: 'Damage Report',
                        message: `${ship.name} takes ${effect.damage} damage from a plasma burn!`,
                        color: 'border-teal-500',
                        isPlayerSource: false,
                    });
                    effect.turnsRemaining--;
                }
                if (effect.turnsRemaining > 0) {
                    newStatusEffects.push(effect);
                } else {
                    addLogForTurn({
                        sourceId: 'system',
                        sourceName: 'Damage Report',
                        message: `The plasma fire on ${ship.name} has extinguished.`,
                        color: 'border-gray-500',
                        isPlayerSource: false,
                    });
                }
            }
            ship.statusEffects = newStatusEffects;
        }
    });

    // =================================================================
    // == Environmental Hazard Phase ==
    // =================================================================
    const allShipsForHazards = [...next.currentSector.entities.filter((e): e is Ship => e.type === 'ship'), playerShip];
    const asteroidPositionsForHazards = new Set(next.currentSector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));

    allShipsForHazards.forEach(ship => {
        if (ship.hull <= 0) return; // Skip destroyed ships
        
        const shipPosKey = `${ship.position.x},${ship.position.y}`;
        if (asteroidPositionsForHazards.has(shipPosKey)) {
            if (Math.random() < 0.33) { // 33% chance of taking damage
                const damage = 5 + Math.floor(Math.random() * 11); // 5-15 damage
                let remainingDamage = damage;
                
                let logMessage = `${ship.name} is struck by micrometeoroids for ${damage} damage!`;
                
                if (ship.shields > 0) {
                    const absorbed = Math.min(ship.shields, remainingDamage);
                    ship.shields -= absorbed;
                    remainingDamage -= absorbed;
                    logMessage += ` Shields absorbed ${Math.round(absorbed)}.`;
                }
                
                if (remainingDamage > 0) {
                    const roundedDamage = Math.round(remainingDamage);
                    ship.hull = Math.max(0, ship.hull - roundedDamage);
                    logMessage += ` Hull takes ${roundedDamage} damage.`;
                }
                
                addLogForTurn({
                    sourceId: 'system',
                    sourceName: 'Hazard',
                    message: logMessage,
                    isPlayerSource: false,
                    color: 'border-orange-400'
                });
            }
        }
    });

    // =================================================================
    // == Cloak Maintenance Phase ==
    // =================================================================
    const allShipsForCloakCheck = [...next.currentSector.entities.filter((e): e is Ship => e.type === 'ship'), playerShip];

    allShipsForCloakCheck.forEach(ship => {
        if (ship.hull <= 0 || ship.isDerelict) {
            return;
        }
        if (ship.cloakState === 'cloaking' || ship.cloakState === 'cloaked') {
            
            let reliability = 1.0;
            let powerCost = 0;
            let isMakeshiftCloak = false;
            let subsystemDamageChance = 0;
            let explosionChance = 0;

            if (ship.customCloakStats) { // Pirate makeshift cloak
                isMakeshiftCloak = true;
                reliability = ship.customCloakStats.reliability;
                powerCost = ship.customCloakStats.powerCost;
                subsystemDamageChance = ship.customCloakStats.subsystemDamageChance;
                explosionChance = ship.customCloakStats.explosionChance;
            } else { // Standard cloak
                const shipStats = shipClasses[ship.shipModel]?.[ship.shipClass];
                if (!shipStats || !ship.cloakingCapable) return;

                reliability = 1 - shipStats.cloakFailureChance;
                powerCost = shipStats.cloakEnergyCost.maintain;
            }
            
            let envModifierLog = "";

            if (next.currentSector.hasNebula) {
                reliability *= 0.75; 
                powerCost *= 1.30;
                envModifierLog = " (modified by nebula)";
            }
            
            powerCost = Math.round(powerCost);
            const wasEngaging = ship.cloakState === 'cloaking';

            if (isMakeshiftCloak) {
                if (Math.random() < explosionChance) {
                    ship.hull = 0;
                    next.combatEffects.push({ type: 'torpedo_hit', position: ship.position, delay: 0, torpedoType: 'Photon' }); // Re-use explosion effect
                    addLogForTurn({ 
                        sourceId: ship.id, 
                        sourceName: ship.name, 
                        message: `CATASTROPHIC FAILURE! The makeshift cloaking device overloads and destroys the ${ship.name}!`, 
                        isPlayerSource: false,
                        color: 'border-red-700'
                    });
                    return; 
                }
                if (Math.random() < subsystemDamageChance) {
                    const subsystems: (keyof ShipSubsystems)[] = ['weapons', 'engines', 'shields', 'weapons', 'engines', 'shields', 'pointDefense', 'computer', 'lifeSupport']; // Weighted
                    const randomSubsystemKey = subsystems[Math.floor(Math.random() * subsystems.length)];
                    const targetSubsystem = ship.subsystems[randomSubsystemKey];
                    if (targetSubsystem.maxHealth > 0 && targetSubsystem.health > 0) {
                        const damageAmount = Math.round(targetSubsystem.maxHealth * 0.30);
                        targetSubsystem.health = Math.max(0, targetSubsystem.health - damageAmount);
                        addLogForTurn({
                            sourceId: ship.id, 
                            sourceName: ship.name, 
                            message: `The unstable cloak backfires! A power surge inflicts ${damageAmount} damage to the ${randomSubsystemKey} system!`, 
                            isPlayerSource: false,
                            color: 'border-orange-500'
                        });
                    }
                }
            }

            if (Math.random() > reliability) {
                ship.cloakState = 'visible';
                ship.cloakCooldown = 2;
                addLogForTurn({ 
                    sourceId: ship.id, 
                    sourceName: ship.name, 
                    message: `Cloaking device failed${envModifierLog}! Ship is now visible.`, 
                    isPlayerSource: ship.id === 'player',
                    color: 'border-orange-400'
                });
            } else {
                let hasPower = false;
                if (ship.id === 'player') {
                    const consumptionResult = consumeEnergy(ship, powerCost);
                    hasPower = consumptionResult.success;
                    consumptionResult.logs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true }));
                } else {
                    if (ship.energy.current >= powerCost) {
                        ship.energy.current -= powerCost;
                        hasPower = true;
                    }
                }

                if (!hasPower) {
                    ship.cloakState = 'visible';
                    ship.cloakCooldown = 2;
                    addLogForTurn({
                        sourceId: ship.id, 
                        sourceName: ship.name, 
                        message: `Insufficient power to maintain cloak${envModifierLog}! Device disengaged.`, 
                        isPlayerSource: ship.id === 'player',
                        color: 'border-orange-400'
                    });
                } else {
                    if (wasEngaging) {
                        ship.cloakState = 'cloaked';
                        addLogForTurn({ 
                            sourceId: ship.id, 
                            sourceName: ship.name, 
                            message: `Cloak engaged successfully. Consumed ${powerCost} power${envModifierLog}.`, 
                            isPlayerSource: ship.id === 'player'
                        });
                    }
                }
            }
        }
    });

    const allShips = [...next.currentSector.entities.filter((e): e is Ship => e.type === 'ship'), playerShip];
    allShips.forEach(ship => {
        if (ship.hull <= 0 || ship.isDerelict) {
            return;
        }
        if (ship.shields < ship.maxShields && ship.subsystems.shields.health / ship.subsystems.shields.maxHealth >= 0.25) {
            const potentialRegen = (ship.energyAllocation.shields / 100) * (ship.maxShields * 0.1);
            if (potentialRegen > 0) {
                const energyCost = Math.round(potentialRegen * 2); 
                if (ship.id !== 'player' && ship.energy.current >= energyCost) {
                    ship.energy.current -= energyCost;
                    ship.shields = Math.min(ship.maxShields, ship.shields + potentialRegen);
                }
            }
        } else if (ship.subsystems.shields.health / ship.subsystems.shields.maxHealth < 0.25) {
            ship.shields = 0;
        }

        if (ship.id !== 'player') {
            if (ship.subsystems.engines.health > 0) {
                ship.energy.current = Math.min(ship.energy.max, ship.energy.current + Math.round(8 * getEnergyOutputMultiplier(ship.subsystems.engines.health / ship.subsystems.engines.maxHealth)));
                if (ship.engineFailureTurn != null) {
                    addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `Engineering has brought impulse engines back online!`, isPlayerSource: false, color: 'border-green-400' });
                    ship.engineFailureTurn = null;
                }
            } else {
                if (ship.engineFailureTurn == null) {
                    ship.engineFailureTurn = next.turn;
                    addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `CRITICAL: Impulse engines have failed! The ship is dead in the water and cannot regenerate power.`, isPlayerSource: false, color: 'border-red-600' });
                }
            }
        }

        if (ship.subsystems.lifeSupport.health <= 0) {
            ship.lifeSupportReserves.current = Math.max(0, ship.lifeSupportReserves.current - 50); 
            if (ship.lifeSupportFailureTurn == null) {
                ship.lifeSupportFailureTurn = next.turn;
                addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `CRITICAL: Life support has failed! Switching to emergency reserves. 2 turns remaining.`, isPlayerSource: ship.id === 'player', color: 'border-red-600' });
            } else if (ship.lifeSupportReserves.current <= 0 && ship.hull > 0 && !ship.isDerelict) {
                ship.isDerelict = true;
                ship.crewMorale.current = 0;
                ship.hull = Math.max(1, ship.hull); 
                addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `Catastrophic life support failure! All hands lost. The ship is now a derelict hulk.`, isPlayerSource: ship.id === 'player', color: 'border-red-700' });
            } else if (ship.hull > 0 && !ship.isDerelict) {
                 addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `Life support offline. ${Math.round(ship.lifeSupportReserves.current/50)} turn(s) of emergency reserves left.`, isPlayerSource: ship.id === 'player', color: 'border-orange-400' });
            }
        } else {
            if (ship.lifeSupportFailureTurn != null) {
                addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `Life support has been restored.`, isPlayerSource: ship.id === 'player', color: 'border-green-400' });
                ship.lifeSupportFailureTurn = null;
            }
        }
    });

    if (playerShip.hull <= 0 && !playerShip.isDerelict) { 
        triggerDesperationAnimation({ source: playerShip, type: 'evacuate' });
        playerShip.isDerelict = true;
        playerShip.hull = 1;
        addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Hull breach critical! All hands abandon ship!`, isPlayerSource: true, color: 'border-red-700' });
        next.gameOver = true; 
        addLogForTurn({ sourceId: 'system', sourceName: 'FATAL', message: "CRITICAL: U.S.S. Endeavour has been lost. Game Over.", isPlayerSource: false, color: 'border-red-700' }); 
    }
    
    const hasEnemies = next.currentSector.entities.some(e => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
    if (next.redAlert && !hasEnemies) {
        next.redAlert = false;
        playerShip.shields = 0;
        playerShip.evasive = false;
    } else if (!next.redAlert && hasEnemies) {
        next.redAlert = true;
        playerShip.shields = playerShip.maxShields;
    }

    if (next.redAlert && hasEnemies) {
        consumeEnergy(playerShip, playerShip.evasive ? 10 : 5);
    } else if (!next.redAlert) {
        playerShip.energy.current = Math.min(playerShip.energy.max, playerShip.energy.current + Math.round(10 * getEnergyOutputMultiplier(playerShip.subsystems.engines.health / playerShip.subsystems.engines.maxHealth)));
    }
    
    next.turn++;
    addLogForTurn({ sourceId: 'system', sourceName: 'Log', message: `Turn ${next.turn} begins.`, isPlayerSource: false, color: 'border-gray-700' });
    return { nextGameState: next, newNavigationTarget: newNavTarget, newSelectedTargetId };
}