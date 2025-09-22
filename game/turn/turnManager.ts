import type { GameState, PlayerTurnActions, Position, Entity, Ship, ShipSubsystems, TorpedoProjectile, LogEntry } from '../../types';
import { processAITurns } from './aiProcessor';
import { AIActions } from '../ai/FactionAI';
import { applyPhaserDamage, consumeEnergy } from '../utils/combat';
import { moveOneStep, calculateDistance } from '../utils/ai';
import { uniqueId } from '../utils/helpers';
import { shipClasses } from '../../assets/ships/configs/shipClassStats';
import { isPosInNebula } from '../utils/sector';

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
                    const combatLogs = applyPhaserDamage(target as Ship, 20 * (playerShip.energyAllocation.weapons / 100), player.targeting?.subsystem || null, playerShip, next);
                    next.combatEffects.push({ type: 'phaser', sourceId: playerShip.id, targetId: target.id, faction: playerShip.faction, delay: 0 });
                    combatLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true }));
                    if (player.targeting?.subsystem) maintainedTargetLock = true;
                }
            }
        }

        if (player.targeting) {
            if (maintainedTargetLock) player.targeting.consecutiveTurns = (player.targeting.consecutiveTurns || 1) + 1;
            else if (player.targeting.consecutiveTurns > 1) player.targeting.consecutiveTurns = 1;
        }
    }

    if (playerTurnActions.hasUsedTachyonScan) {
        const cloakedShips = currentSector.entities.filter((e): e is Ship => e.type === 'ship' && e.cloakState === 'cloaked');
        let detectedCount = 0;

        if (cloakedShips.length > 0) {
            const scannerHealthPercent = playerShip.subsystems.scanners.health / playerShip.subsystems.scanners.maxHealth;
            
            cloakedShips.forEach(cloakedShip => {
                const distance = Math.max(Math.abs(playerShip.position.x - cloakedShip.position.x), Math.abs(playerShip.position.y - cloakedShip.position.y));
                if (distance <= 5) { // 5 hex radius
                    const baseChance = 0.40; // 40%
                    const proximityBonus = (5 - distance) * 0.05; // Up to 20% bonus at range 1
                    const detectionChance = (baseChance + proximityBonus) * scannerHealthPercent;
                    
                    if (Math.random() < detectionChance) {
                        detectedCount++;
                        cloakedShip.cloakState = 'visible';
                        cloakedShip.cloakCooldown = 2; // Prevent immediate re-cloaking
                        addLogForTurn({
                            sourceId: 'player',
                            sourceName: playerShip.name,
                            message: `Tachyon scan reveals the ${cloakedShip.name}! Its cloak has been disrupted!`,
                            isPlayerSource: true,
                            color: 'border-yellow-400'
                        });
                    }
                }
            });
        }

        if (detectedCount === 0) {
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: 'Tachyon scan complete. No cloaked vessels detected in range.', isPlayerSource: true });
        }
    }
    
    const projectiles = currentSector.entities.filter((e): e is TorpedoProjectile => e.type === 'torpedo_projectile');
    const allShipsForProjectiles = [...currentSector.entities.filter((e): e is Ship => e.type === 'ship'), playerShip];
    const destroyedProjectileIds = new Set<string>();
    
    projectiles.forEach(torpedo => {
        if (torpedo.hull <= 0) { destroyedProjectileIds.add(torpedo.id); return; }
        const targetEntity = allShipsForProjectiles.find(s => s.id === torpedo.targetId);
        if (!targetEntity || targetEntity.hull <= 0) { destroyedProjectileIds.add(torpedo.id); return; }
        
        for (let i = 0; i < torpedo.speed; i++) {
            if (torpedo.position.x === targetEntity.position.x && torpedo.position.y === targetEntity.position.y) break;

            const nextStep = moveOneStep(torpedo.position, targetEntity.position);

            if (isPosInNebula(nextStep, currentSector)) {
                if (calculateDistance(torpedo.position, targetEntity.position) > 1) {
                    addLogForTurn({ sourceId: torpedo.sourceId, sourceName: torpedo.name, message: `The ${torpedo.name} is disrupted by the nebula and fizzles out.`, isPlayerSource: torpedo.faction === 'Federation' });
                    destroyedProjectileIds.add(torpedo.id);
                    return;
                }
            }

            torpedo.position = nextStep;
            torpedo.path.push({ ...torpedo.position });
            
            if (torpedo.position.x === targetEntity.position.x && torpedo.position.y === targetEntity.position.y) {
                const combatLogs = applyPhaserDamage(targetEntity, torpedo.damage, null, allShipsForProjectiles.find(s=>s.id === torpedo.sourceId)!, next); // Simulating torpedo damage via phaser logic for now
                next.combatEffects.push({ type: 'torpedo_hit', position: targetEntity.position, delay: 0, torpedoType: torpedo.torpedoType });
                combatLogs.forEach(msg => addLogForTurn({ sourceId: torpedo.sourceId, sourceName: torpedo.name, message: msg, isPlayerSource: torpedo.faction === 'Federation' }));
                destroyedProjectileIds.add(torpedo.id);
                return;
            }
        }
    });

    next.currentSector.entities = next.currentSector.entities.filter(e => !destroyedProjectileIds.has(e.id));
    
    const aiActions: AIActions = { addLog: addLogForTurn, applyPhaserDamage, triggerDesperationAnimation };
    processAITurns(next, aiActions, new Set<string>());

    // =================================================================
    // == Cloak Maintenance Phase ==
    // =================================================================
    const allShipsForCloakCheck = [...next.currentSector.entities.filter((e): e is Ship => e.type === 'ship'), playerShip];

    allShipsForCloakCheck.forEach(ship => {
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
                    const subsystems: (keyof ShipSubsystems)[] = ['weapons', 'engines', 'shields', 'weapons', 'engines', 'shields', 'scanners', 'computer', 'lifeSupport']; // Weighted
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