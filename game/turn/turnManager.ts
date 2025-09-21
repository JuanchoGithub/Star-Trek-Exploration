import type { GameState, PlayerTurnActions, Position, Entity, Ship, ShipSubsystems, TorpedoProjectile, LogEntry } from '../../types';
import { processAITurns } from './aiProcessor';
import { AIActions } from '../ai/FactionAI';
import { applyPhaserDamage, consumeEnergy } from '../utils/combat';
import { moveOneStep } from '../utils/ai';
import { uniqueId } from '../utils/helpers';
import { shipClasses } from '../../assets/ships/configs/shipClassStats';

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
            torpedo.position = moveOneStep(torpedo.position, targetEntity.position);
            
            if (torpedo.position.x === targetEntity.position.x && torpedo.position.y === targetEntity.position.y) {
                const combatLogs = applyPhaserDamage(targetEntity, 50, null, allShipsForProjectiles.find(s=>s.id === torpedo.sourceId)!, next); // Simulating torpedo damage via phaser logic for now
                next.combatEffects.push({ type: 'torpedo_hit', position: targetEntity.position, delay: 0 });
                combatLogs.forEach(msg => addLogForTurn({ sourceId: torpedo.sourceId, sourceName: 'Torpedo', message: msg, isPlayerSource: torpedo.faction === 'Federation' }));
                destroyedProjectileIds.add(torpedo.id);
                return;
            }
        }
    });

    next.currentSector.entities = next.currentSector.entities.filter(e => !destroyedProjectileIds.has(e.id));
    
    const aiActions: AIActions = { addLog: addLogForTurn, applyPhaserDamage, triggerDesperationAnimation };
    processAITurns(next, aiActions, new Set<string>());
    
    const allShips = [...next.currentSector.entities.filter((e): e is Ship => e.type === 'ship'), playerShip];
    allShips.forEach(ship => {
        // --- Shield Regeneration ---
        if (ship.shields < ship.maxShields && ship.subsystems.shields.health / ship.subsystems.shields.maxHealth >= 0.25) {
            const potentialRegen = (ship.energyAllocation.shields / 100) * (ship.maxShields * 0.1);
            if (potentialRegen > 0) {
                const energyCost = Math.round(potentialRegen * 2); // Regeneration costs energy
                if (ship.id !== 'player' && ship.energy.current >= energyCost) {
                    ship.energy.current -= energyCost;
                    ship.shields = Math.min(ship.maxShields, ship.shields + potentialRegen);
                }
            }
        } else if (ship.subsystems.shields.health / ship.subsystems.shields.maxHealth < 0.25) {
            ship.shields = 0;
        }

        // --- AI Energy Regeneration & Engine Failure ---
        if (ship.id !== 'player') {
            if (ship.subsystems.engines.health > 0) {
                ship.energy.current = Math.min(ship.energy.max, ship.energy.current + Math.round(8 * getEnergyOutputMultiplier(ship.subsystems.engines.health / ship.subsystems.engines.maxHealth)));
                if (ship.engineFailureTurn != null) {
                    // FIX: Added missing isPlayerSource property to log call.
                    addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `Engineering has brought impulse engines back online!`, isPlayerSource: false, color: 'border-green-400' });
                    ship.engineFailureTurn = null;
                }
            } else {
                if (ship.engineFailureTurn == null) {
                    ship.engineFailureTurn = next.turn;
                    // FIX: Added missing isPlayerSource property to log call.
                    addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `CRITICAL: Impulse engines have failed! The ship is dead in the water and cannot regenerate power.`, isPlayerSource: false, color: 'border-red-600' });
                }
            }
        }

        // --- Life Support Failure ---
        if (ship.subsystems.lifeSupport.health <= 0) {
            ship.lifeSupportReserves.current = Math.max(0, ship.lifeSupportReserves.current - 50); // Uses 50% of reserves per turn
            if (ship.lifeSupportFailureTurn == null) {
                ship.lifeSupportFailureTurn = next.turn;
                // FIX: Added missing isPlayerSource property to log call.
                addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `CRITICAL: Life support has failed! Switching to emergency reserves. 2 turns remaining.`, isPlayerSource: ship.id === 'player', color: 'border-red-600' });
            } else if (ship.lifeSupportReserves.current <= 0 && ship.hull > 0 && !ship.isDerelict) {
                ship.isDerelict = true;
                ship.crewMorale.current = 0;
                ship.hull = Math.max(1, ship.hull); // Don't destroy it, make it a derelict
                // FIX: Added missing isPlayerSource property to log call.
                addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `Catastrophic life support failure! All hands lost. The ship is now a derelict hulk.`, isPlayerSource: ship.id === 'player', color: 'border-red-700' });
            } else if (ship.hull > 0 && !ship.isDerelict) {
                 // FIX: Added missing isPlayerSource property to log call.
                 addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `Life support offline. ${Math.round(ship.lifeSupportReserves.current/50)} turn(s) of emergency reserves left.`, isPlayerSource: ship.id === 'player', color: 'border-orange-400' });
            }
        } else {
            if (ship.lifeSupportFailureTurn != null) {
                // FIX: Added missing isPlayerSource property to log call.
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
        // FIX: Replaced playerShip.current with playerShip.energy.current.
        playerShip.energy.current = Math.min(playerShip.energy.max, playerShip.energy.current + Math.round(10 * getEnergyOutputMultiplier(playerShip.subsystems.engines.health / playerShip.subsystems.engines.maxHealth)));
    }
    
    next.turn++;
    addLogForTurn({ sourceId: 'system', sourceName: 'Log', message: `Turn ${next.turn} begins.`, isPlayerSource: false, color: 'border-gray-700' });
    
    return { nextGameState: next, newNavigationTarget: newNavTarget, newSelectedTargetId };
}
