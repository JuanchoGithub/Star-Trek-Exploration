import type { GameState, PlayerTurnActions, Position, Entity, Ship, ShipSubsystems, QuadrantPosition, SectorState, TorpedoProjectile, Starbase, LogEntry } from '../../types';
import { processAITurns } from './aiProcessor';
import { AIActions } from '../ai/FactionAI';
import { applyPhaserDamage, consumeEnergy } from '../utils/combat';
import { uniqueId, moveOneStep } from '../utils/ai';
import { PLAYER_LOG_COLOR, SYSTEM_LOG_COLOR } from '../../assets/configs/logColors';
import { QUADRANT_SIZE } from '../../assets/configs/gameConstants';

interface TurnResolutionResult {
    nextGameState: GameState;
    newNavigationTarget: Position | null;
    newSelectedTargetId: string | null;
}

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

    const addLogForTurn = (logData: Omit<LogEntry, 'id' | 'turn'>) => {
        const allShips = [...next.currentSector.entities.filter((e): e is Ship => e.type === 'ship'), next.player.ship];
        const sourceShip = allShips.find(s => s.id === logData.sourceId);
        next.logs.push({
            id: uniqueId(),
            turn: next.turn,
            ...logData,
            color: (logData as any).color || sourceShip?.logColor || SYSTEM_LOG_COLOR,
        });
    };

    if (playerShip.repairTarget) {
        const energyCost = 10;
        const { success, logs: energyLogs } = consumeEnergy(playerShip, energyCost);
        energyLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true, color: playerShip.logColor }));

        if (success) {
            const repairAmount = 25;
            const targetSystem = playerShip.repairTarget;
            let repaired = false; let isComplete = false;
            if (targetSystem === 'hull') {
                const oldHull = playerShip.hull;
                playerShip.hull = Math.min(playerShip.maxHull, playerShip.hull + repairAmount);
                if (playerShip.hull > oldHull) {
                    addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Engineering teams continue repairs on the hull, restoring ${Math.round(playerShip.hull - oldHull)} integrity.`, isPlayerSource: true, color: playerShip.logColor });
                    repaired = true;
                }
                if (playerShip.hull === playerShip.maxHull) isComplete = true;
            } else {
                // FIX: Removed unnecessary and incorrect type assertion. `targetSystem` is already known to be `keyof ShipSubsystems` here.
                const subsystem = playerShip.subsystems[targetSystem];
                if (subsystem) {
                    const oldHealth = subsystem.health;
                    subsystem.health = Math.min(subsystem.maxHealth, subsystem.health + repairAmount);
                    if (subsystem.health > oldHealth) {
                        addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Engineering teams continue repairs on the ${targetSystem}, restoring ${Math.round(subsystem.health - oldHealth)} health.`, isPlayerSource: true, color: playerShip.logColor });
                        repaired = true;
                    }
                    if (subsystem.health === subsystem.maxHealth) isComplete = true;
                }
            }
            if (isComplete) {
                addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Repairs to ${targetSystem} are complete. Engineering teams standing by.`, isPlayerSource: true, color: playerShip.logColor });
                playerShip.repairTarget = null;
            } else if (!repaired) {
                addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `The ${targetSystem} is already at full integrity. Halting repairs.`, isPlayerSource: true, color: playerShip.logColor });
                playerShip.repairTarget = null;
            }
        }
    }

    let maintainedTargetLock = false;

    if (playerShip.retreatingTurn !== null) {
        addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: "Attempting to retreat, cannot take other actions.", isPlayerSource: true, color: playerShip.logColor });
    } else {
        if (navigationTarget) {
            const movementSpeed = next.redAlert ? 1 : 3;
            let moved = false;
            const initialPosition = { ...playerShip.position };

            for (let i = 0; i < movementSpeed; i++) {
                if (playerShip.position.x === navigationTarget.x && playerShip.position.y === navigationTarget.y) break;
                
                playerShip.position = moveOneStep(playerShip.position, navigationTarget);
                moved = true;

                const asteroidFields = currentSector.entities.filter((e: Entity) => e.type === 'asteroid_field');
                const isAdjacentToAsteroids = asteroidFields.some(field => Math.max(Math.abs(playerShip.position.x - field.position.x), Math.abs(playerShip.position.y - field.position.y)) <= 1);
                if (isAdjacentToAsteroids && Math.random() < 0.25) {
                    const damage = 3 + Math.floor(Math.random() * 5);
                    addLogForTurn({ sourceId: 'system', sourceName: 'Hazard Alert', message: `Navigating near asteroid field... minor debris impact!`, isPlayerSource: false, color: 'border-orange-400' });
                    let remainingDamage: number = damage;
                    if (playerShip.shields > 0) {
                        const absorbed = Math.min(playerShip.shields, remainingDamage);
                        playerShip.shields -= absorbed;
                        remainingDamage -= absorbed;
                        addLogForTurn({ sourceId: 'system', sourceName: 'Ship Computer', message: `Shields absorbed ${Math.round(absorbed)} damage.`, isPlayerSource: false, color: SYSTEM_LOG_COLOR });
                    }
                    if (remainingDamage > 0) {
                        const roundedDamage = Math.round(remainingDamage);
                        playerShip.hull = Math.max(0, playerShip.hull - roundedDamage);
                        addLogForTurn({ sourceId: 'system', sourceName: 'Damage Control', message: `Ship took ${roundedDamage} hull damage!`, isPlayerSource: false, color: SYSTEM_LOG_COLOR });
                    }
                }
            }

            if (moved) {
                addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Moving from (${initialPosition.x},${initialPosition.y}) to (${playerShip.position.x},${playerShip.position.y}).`, isPlayerSource: true, color: playerShip.logColor });
            }

            if (playerShip.position.x === navigationTarget.x && playerShip.position.y === navigationTarget.y) {
                newNavTarget = null;
                addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Arrived at navigation target.`, isPlayerSource: true, color: playerShip.logColor });
            }
        }

        if (playerTurnActions.combat?.type === 'phasers') {
            const actionTargetId = playerTurnActions.combat.targetId;
            const target = currentSector.entities.find((e: Entity) => e.id === actionTargetId);
            
            if (target) {
                const targetingInfo = player.targeting;
                if (targetingInfo && targetingInfo.entityId === actionTargetId) {
                    if (target.type === 'ship') {
                        const subsystem = targetingInfo.subsystem;
                        let energyCost = 0; if (subsystem) energyCost = 4;
                        let canFire = true;

                        if (energyCost > 0) {
                            const { success, logs: energyLogs } = consumeEnergy(playerShip, energyCost);
                            energyLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true, color: playerShip.logColor }));
                            if(success) addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Consumed ${energyCost} power for targeting computers.`, isPlayerSource: true, color: playerShip.logColor });
                            else canFire = false;
                        }

                        if(canFire) {
                            next.combatEffects.push({ type: 'phaser', sourceId: playerShip.id, targetId: target.id, faction: playerShip.faction, delay: 0 });
                            const baseDamage = 20 * (playerShip.energyAllocation.weapons / 100);
                            const combatLogs = applyPhaserDamage(target as Ship, baseDamage, subsystem || null, playerShip, next);
                            combatLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true, color: playerShip.logColor }));
                            if(subsystem) maintainedTargetLock = true;
                        }
                    } else if (target.type === 'torpedo_projectile') {
                        const { success, logs: energyLogs } = consumeEnergy(playerShip, 4);
                        energyLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true, color: playerShip.logColor }));
                        if(success) {
                            next.combatEffects.push({ type: 'phaser', sourceId: playerShip.id, targetId: target.id, faction: playerShip.faction, delay: 0 });
                            (target as TorpedoProjectile).hull = 0;
                            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Point-defense phasers fire at a hostile torpedo!\n--> HIT! The torpedo is destroyed!`, isPlayerSource: true, color: playerShip.logColor });
                        }
                    }
                }
            }
        }
    }
    
    const targetingInfo = player.targeting;
    if (targetingInfo) {
        if (maintainedTargetLock) {
            targetingInfo.consecutiveTurns = (targetingInfo.consecutiveTurns || 1) + 1;
            const target = currentSector.entities.find(e => e.id === targetingInfo.entityId);
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Maintaining target lock on ${target?.name}'s ${targetingInfo.subsystem} (${targetingInfo.consecutiveTurns} turns).`, isPlayerSource: true, color: playerShip.logColor });
        } else if (targetingInfo.consecutiveTurns > 1) {
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Targeting lock on ${targetingInfo.subsystem} lapsed.`, isPlayerSource: true, color: playerShip.logColor });
            targetingInfo.consecutiveTurns = 1;
        }
    }

    const applyTorpedoDamage = (target: Ship, damage: number, sourceShip: Ship) => {
         const logs: string[] = [];
         if (target.id === 'player' && !next.redAlert) target.shields = 0;
         logs.push(`--> HIT! Initial damage: ${Math.round(damage)}.`);
         let remainingDamage = damage;
         const shieldDamage = remainingDamage * 0.25;
         const absorbedByShields = Math.min(target.shields, shieldDamage);
         if (absorbedByShields > 0) {
             logs.push(`--> Shields absorbed ${Math.round(absorbedByShields)} damage.`);
             target.shields -= absorbedByShields;
         }
         remainingDamage -= absorbedByShields / 0.25;
         if (remainingDamage > 0) {
             const roundedHullDamage = Math.round(remainingDamage);
             target.hull = Math.max(0, target.hull - roundedHullDamage);
             logs.push(`--> ${target.name} takes ${roundedHullDamage} hull damage.`);
         }
         else {
             logs.push(`--> Shields absorbed the entire hit.`);
         }
         return logs;
    };

    const projectiles = currentSector.entities.filter((e: Entity): e is TorpedoProjectile => e.type === 'torpedo_projectile');
    const allShips = [...currentSector.entities.filter((e: Entity): e is Ship => e.type === 'ship'), next.player.ship];
    const destroyedProjectileIds = new Set<string>();

    projectiles.forEach(torpedo => {
        if (torpedo.hull <= 0 || destroyedProjectileIds.has(torpedo.id)) { destroyedProjectileIds.add(torpedo.id); return; }
        const targetEntity = allShips.find(s => s.id === torpedo.targetId);
        const sourceEntity = allShips.find(s => s.id === torpedo.sourceId);

        if (!targetEntity || !sourceEntity || targetEntity.faction === torpedo.faction || targetEntity.hull <= 0) {
            addLogForTurn({ sourceId: sourceEntity?.id || 'system', sourceName: sourceEntity?.name || 'Torpedo Control', message: `${torpedo.name} self-destructs as its target is no longer valid.`, isPlayerSource: sourceEntity?.id === 'player', color: sourceEntity?.logColor || SYSTEM_LOG_COLOR });
            destroyedProjectileIds.add(torpedo.id); return;
        }
        if (next.turn - torpedo.turnLaunched >= 3) {
            addLogForTurn({ sourceId: sourceEntity.id, sourceName: sourceEntity.name, message: `${torpedo.name} self-destructs at the end of its lifespan.`, isPlayerSource: sourceEntity.id === 'player', color: sourceEntity.logColor });
            destroyedProjectileIds.add(torpedo.id); return;
        }

        for (let i = 0; i < torpedo.speed; i++) {
            if (torpedo.position.x === targetEntity.position.x && torpedo.position.y === targetEntity.position.y) break;
            torpedo.position = moveOneStep(torpedo.position, targetEntity.position);
            torpedo.path.push({ ...torpedo.position });
            torpedo.stepsTraveled++;
            
            const potentialTargets = allShips.filter(s => s.faction !== torpedo.faction && s.hull > 0);
            for (const ship of potentialTargets) {
                if (ship.position.x === torpedo.position.x && ship.position.y === torpedo.position.y) {
                    let hitChance = Math.max(0.05, 1.0 - (torpedo.stepsTraveled * 0.24));
                    if (ship.evasive) hitChance *= 0.3;
                    if (next.currentSector.hasNebula) hitChance *= 0.6;
                    
                    let torpedoLog = `${sourceEntity.name}'s torpedo is on an intercept course with ${ship.name}. Impact chance: ${Math.round(hitChance * 100)}%.`;
                     if (next.currentSector.hasNebula) {
                        torpedoLog += ` (Reduced by nebula interference)`;
                    }
                    if (Math.random() < hitChance) {
                        const damageLogs = applyTorpedoDamage(ship, 50, sourceEntity);
                        torpedoLog += '\n' + damageLogs.join('\n');
                        next.combatEffects.push({ type: 'torpedo_hit', position: ship.position, delay: 0 });
                    } else {
                        torpedoLog += `\n--> The torpedo misses! ${ship.name} evaded at the last moment.`;
                    }
                    addLogForTurn({ sourceId: sourceEntity.id, sourceName: sourceEntity.name, message: torpedoLog, isPlayerSource: sourceEntity.id === 'player', color: sourceEntity.logColor });
                    destroyedProjectileIds.add(torpedo.id); return;
                }
            }
        }
    });
    next.currentSector.entities = next.currentSector.entities.filter((e: Entity) => !destroyedProjectileIds.has(e.id));
    
    const aiActions: AIActions = {
        addLog: addLogForTurn,
        applyPhaserDamage
    };
    processAITurns(next, aiActions);

    [playerShip, ...currentSector.entities].forEach(e => {
        if (e.type === 'ship') {
            const ship = e as Ship;
            const regenAmount = (ship.energyAllocation.shields / 100) * (ship.maxShields * 0.1);
            ship.shields = Math.min(ship.maxShields, ship.shields + regenAmount);
        }
    });

    const destroyedIds = new Set<string>();
    currentSector.entities.forEach(e => {
        const entityWithHull = e as Ship | Starbase | TorpedoProjectile;
        if (entityWithHull.hull !== undefined && entityWithHull.hull <= 0) {
            if (e.type === 'torpedo_projectile') {
                addLogForTurn({ sourceId: 'system', sourceName: 'Tactical', message: `${e.name} was intercepted and destroyed.`, isPlayerSource: false, color: SYSTEM_LOG_COLOR });
                next.combatEffects.push({ type: 'torpedo_hit', position: e.position, delay: 0 });
            } else if (e.type === 'ship' || e.type === 'starbase') {
                addLogForTurn({ sourceId: 'system', sourceName: 'Tactical', message: `${e.name} has been destroyed!`, isPlayerSource: false, color: SYSTEM_LOG_COLOR });
            }
            destroyedIds.add(e.id);
        }
    });
    
    if (targetingInfo) {
        const targetEntity = currentSector.entities.find(e => e.id === targetingInfo.entityId);
        if (!targetEntity || destroyedIds.has(targetingInfo.entityId)) {
            delete next.player.targeting;
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Target destroyed. Disengaging targeting computers.`, isPlayerSource: true, color: playerShip.logColor });
        } else if (targetingInfo.subsystem && targetEntity.type === 'ship') {
            if (targetEntity.subsystems[targetingInfo.subsystem].health <= 0) {
                next.player.targeting.subsystem = null;
                addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `${targetEntity.name}'s ${targetingInfo.subsystem} disabled. Reverting to hull targeting.`, isPlayerSource: true, color: playerShip.logColor });
            }
        }
    }
    if (newSelectedTargetId && destroyedIds.has(newSelectedTargetId)) {
        newSelectedTargetId = null;
    }
    next.currentSector.entities = currentSector.entities.filter(e => !destroyedIds.has(e.id));
    
    const retreatSuccessful = playerShip.retreatingTurn !== null && next.turn >= playerShip.retreatingTurn;
    
    if (retreatSuccessful) {
        const oldPlayerPos = next.player.position;
        next.quadrantMap[oldPlayerPos.qy][oldPlayerPos.qx] = JSON.parse(JSON.stringify(next.currentSector));
        playerShip.retreatingTurn = null;
        const friendlySectors: QuadrantPosition[] = [];
        next.quadrantMap.forEach((row: SectorState[], qy: number) => {
            row.forEach((sector: SectorState, qx: number) => {
                if (sector.factionOwner === 'Federation' && (qx !== oldPlayerPos.qx || qy !== oldPlayerPos.qy)) {
                    friendlySectors.push({ qx, qy });
                }
            });
        });
        let destination: QuadrantPosition | null = null;
        if (friendlySectors.length > 0) {
            destination = friendlySectors[Math.floor(Math.random() * friendlySectors.length)];
        } else {
            const { qx, qy } = next.player.position;
            const adjacentDeltas = [{dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: 0, dy: -1}, {dx: 0, dy: 1}];
            const potentialDestinations: QuadrantPosition[] = [];
            for (const delta of adjacentDeltas) {
                const newQx = qx + delta.dx;
                const newQy = qy + delta.dy;
                if (newQx >= 0 && newQx < QUADRANT_SIZE && newQy >= 0 && newQy < QUADRANT_SIZE) {
                    potentialDestinations.push({ qx: newQx, qy: newQy });
                }
            }
            if(potentialDestinations.length > 0) {
                 const pickSafest = (destinations: QuadrantPosition[]) => {
                    const safe = destinations.filter(pos => 
                        !next.quadrantMap[pos.qy][pos.qx].entities.some((e: Entity) => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction))
                    );
                    if (safe.length > 0) return safe[Math.floor(Math.random() * safe.length)];
                    return destinations[Math.floor(Math.random() * destinations.length)];
                };
                destination = pickSafest(potentialDestinations);
            }
        }
        addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Retreat successful! Engaging emergency warp to quadrant (${destination?.qx ?? 'unknown'}, ${destination?.qy ?? 'unknown'})...`, isPlayerSource: true, color: playerShip.logColor });
        const damageLogs: string[] = [];
        if (Math.random() < 0.3) {
            const damage = Math.round(playerShip.maxHull * Math.random() * 0.5);
            playerShip.hull = Math.max(0, playerShip.hull - damage);
            damageLogs.push(`--> Hull took ${damage} stress damage.`);
        }
        if (Math.random() < 0.4) {
            const subsystems: (keyof ShipSubsystems)[] = ['weapons', 'engines', 'shields', 'transporter'];
            const randomSubsystemKey = subsystems[Math.floor(Math.random() * subsystems.length)];
            const targetSubsystem = playerShip.subsystems[randomSubsystemKey];
            if (targetSubsystem.maxHealth > 0) {
                const damage = Math.round(targetSubsystem.maxHealth * Math.random() * 0.5);
                targetSubsystem.health = Math.max(0, targetSubsystem.health - damage);
                damageLogs.push(`--> The ${randomSubsystemKey} system took ${damage} damage from the power surge.`);
            }
        }
        if (damageLogs.length > 0) {
            addLogForTurn({ 
                sourceId: 'system', 
                sourceName: 'Damage Control', 
                message: "The emergency warp has strained the ship's systems!\n" + damageLogs.join('\n'), 
                isPlayerSource: false,
                color: 'border-orange-400'
            });
        }
        if (destination) {
            next.player.position = destination;
            next.currentSector = JSON.parse(JSON.stringify(next.quadrantMap[destination.qy][destination.qx]));
            next.player.ship.position = { x: 6, y: 8 };
            next.currentSector.visited = true;
            newNavTarget = null;
            addLogForTurn({ sourceId: 'system', sourceName: 'Navigation', message: `Emergency warp completed. Arrived in quadrant (${destination.qx}, ${destination.qy}).`, isPlayerSource: false, color: SYSTEM_LOG_COLOR });
        } else {
            addLogForTurn({ sourceId: 'system', sourceName: 'Navigation', message: `Warp failed to find a safe vector! We've cleared the immediate area.`, isPlayerSource: false, color: 'border-orange-400' });
            next.currentSector.entities = next.currentSector.entities.filter((e: Entity) => e.faction !== 'Klingon' && e.faction !== 'Romulan' && e.faction !== 'Pirate');
        }
        
        delete next.player.targeting;
        newSelectedTargetId = null;
        next.isRetreatingWarp = true;
    }
    
    if (playerShip.hull <= 0) {
        next.gameOver = true;
        addLogForTurn({ sourceId: 'system', sourceName: 'FATAL', message: "CRITICAL: U.S.S. Endeavour has been destroyed. Game Over.", isPlayerSource: false, color: 'border-red-700' });
    }

    const hasEnemies = next.currentSector.entities.some((e: Entity) => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
    if (next.redAlert && hasEnemies) {
        let energyDrain = 5; if (playerShip.evasive) energyDrain += 5;
        if (energyDrain > 0) {
            const { success, logs: energyLogs } = consumeEnergy(playerShip, energyDrain);
            energyLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, isPlayerSource: true, message: msg, color: playerShip.logColor }));
            if (!success) addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `WARNING: Insufficient power for combat systems!`, isPlayerSource: true, color: playerShip.logColor });
            else addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Combat systems consumed ${energyDrain} reserve power.`, isPlayerSource: true, color: playerShip.logColor });
        }
    } else if (!next.redAlert) {
        if (playerShip.energy.current < playerShip.energy.max) {
            const rechargeAmount = 10;
            playerShip.energy.current = Math.min(playerShip.energy.max, playerShip.energy.current + rechargeAmount);
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Reserve batteries recharged by ${rechargeAmount} units.`, isPlayerSource: true, color: playerShip.logColor });
        }
    }
    
    if (next.redAlert && !hasEnemies) {
        next.redAlert = false; playerShip.shields = 0; playerShip.evasive = false;
        addLogForTurn({ sourceId: 'system', sourceName: 'Stand Down', message: "Hostiles eliminated or evaded. Standing down from Red Alert. Shields offline.", isPlayerSource: false, color: SYSTEM_LOG_COLOR });
    } else if (!next.redAlert && hasEnemies) {
        next.redAlert = true;
        addLogForTurn({ sourceId: 'system', sourceName: 'RED ALERT!', message: "Hostiles detected! Shields are being raised!", isPlayerSource: false, color: 'border-red-600' });
        playerShip.shields = playerShip.maxShields;
    }
    
    next.turn++;
    addLogForTurn({ sourceId: 'system', sourceName: 'Log', message: `Turn ${next.turn} begins.`, isPlayerSource: false, color: 'border-gray-700' });
    
    return { nextGameState: next, newNavigationTarget: newNavTarget, newSelectedTargetId };
}