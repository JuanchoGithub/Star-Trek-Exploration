
import type { GameState, Ship, TorpedoProjectile, SectorState, ShipSubsystems, TorpedoType } from '../../../types';
import { calculateDistance, moveOneStep } from '../../utils/ai';
import { AIActions } from '../FactionAI';
import { shipClasses } from '../../../assets/ships/configs/shipClassStats';
import { torpedoStats } from '../../../assets/projectiles/configs/torpedoTypes';
import { isPosInNebula, isDeepNebula } from '../../utils/sector';
import { uniqueId } from '../../utils/helpers';

const canAISeePlayer = (aiShip: Ship, playerShip: Ship, sector: SectorState): boolean => {
    if (playerShip.cloakState === 'cloaked') return false;
    
    if (isDeepNebula(playerShip.position, sector)) return false;

    if (isPosInNebula(aiShip.position, sector)) {
        return calculateDistance(aiShip.position, playerShip.position) <= 1;
    }

    const asteroidPositions = new Set(sector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
    const playerPosKey = `${playerShip.position.x},${playerShip.position.y}`;
    if (asteroidPositions.has(playerPosKey)) {
        if (calculateDistance(aiShip.position, playerShip.position) > 4) {
            return false;
        }
    }
    
    return true;
};

export function processPointDefenseForAI(ship: Ship, gameState: GameState, actions: AIActions) {
    if (!ship.pointDefenseEnabled || ship.subsystems.pointDefense.health <= 0) return;

    const incomingTorpedoes = gameState.currentSector.entities.filter((e): e is TorpedoProjectile => 
        e.type === 'torpedo_projectile' && 
        e.faction === 'Federation' && 
        e.hull > 0
    );

    let pointDefenseFired = false;
    if (incomingTorpedoes.length > 0) {
        const POINT_DEFENSE_RANGE = 1;
        const validTargets = incomingTorpedoes.filter(torpedo => 
            calculateDistance(ship.position, torpedo.position) <= POINT_DEFENSE_RANGE
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

            if (ship.energy.current >= activeEnergyCost) {
                ship.energy.current -= activeEnergyCost;
                pointDefenseFired = true;
                
                const hitChance = ship.subsystems.pointDefense.health / ship.subsystems.pointDefense.maxHealth;
                if (Math.random() < hitChance) {
                    torpedoToShoot.hull = 0;
                    gameState.combatEffects.push({ 
                        type: 'point_defense', 
                        sourceId: ship.id, 
                        targetId: torpedoToShoot.id, 
                        faction: ship.faction, 
                        delay: 0 
                    });
                    actions.addLog({
                        sourceId: ship.id,
                        sourceName: ship.name,
                        message: `Point-defense grid intercepts incoming ${torpedoToShoot.name}! (Hit Chance: ${Math.round(hitChance*100)}%)`,
                        isPlayerSource: false,
                    });
                } else {
                     actions.addLog({
                        sourceId: ship.id,
                        sourceName: ship.name,
                        message: `Point-defense grid fired at incoming ${torpedoToShoot.name} but missed! (Hit Chance: ${Math.round(hitChance*100)}%)`,
                        isPlayerSource: false,
                    });
                }
            }
        }
    }
    
    if (!pointDefenseFired) {
        const passiveEnergyCost = 20;
        if (ship.energy.current >= passiveEnergyCost) {
            ship.energy.current -= passiveEnergyCost;
        } else {
            ship.pointDefenseEnabled = false;
            actions.addLog({
                sourceId: ship.id,
                sourceName: ship.name,
                message: `Insufficient power for upkeep. Deactivating point-defense grid.`,
                isPlayerSource: false,
                color: 'border-orange-500'
            });
        }
    }
}

export function tryCaptureDerelict(ship: Ship, gameState: GameState, actions: AIActions): boolean {
    const allEntities = [...gameState.currentSector.entities, gameState.player.ship];
    const adjacentDerelicts = allEntities.filter((e): e is Ship => 
        e.type === 'ship' &&
        e.isDerelict &&
        !e.captureInfo &&
        calculateDistance(ship.position, e.position) <= 1
    );

    if (adjacentDerelicts.length > 0) {
        const derelictToCapture = adjacentDerelicts[0];
        derelictToCapture.faction = ship.faction;
        derelictToCapture.logColor = ship.logColor;
        derelictToCapture.isDerelict = false;
        derelictToCapture.captureInfo = { captorId: ship.id, repairTurn: gameState.turn };
        
        actions.addLog({ 
            sourceId: ship.id, 
            sourceName: ship.name, 
            message: `Has dispatched a boarding party and taken control of the derelict ${derelictToCapture.name}! Emergency repairs have begun.`, 
            isPlayerSource: false 
        });
        return true; // Action taken
    }
    return false; // No action taken
}

export function processCommonTurn(
    ship: Ship, 
    playerShip: Ship, 
    gameState: GameState, 
    actions: AIActions,
    subsystemTarget: keyof ShipSubsystems | null
) {
    const { currentSector } = gameState;

    if (canAISeePlayer(ship, playerShip, currentSector)) {
        ship.lastKnownPlayerPosition = { ...playerShip.position };

        const distance = calculateDistance(ship.position, playerShip.position);
        
        const asteroidPositions = new Set(currentSector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
        const playerPosKey = `${playerShip.position.x},${playerShip.position.y}`;
        const canTargetInAsteroids = !(asteroidPositions.has(playerPosKey) && distance > 2);
        
        if (ship.cloakState === 'cloaked') {
            const shouldDecloak = (distance <= 5 && (ship.hull / ship.maxHull) > 0.4);
            if (shouldDecloak) {
                ship.cloakState = 'visible';
                ship.cloakCooldown = 2;
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Decloaks, preparing to engage!`, isPlayerSource: false });
                return;
            } else {
                if (distance > 1) {
                    ship.position = moveOneStep(ship.position, playerShip.position);
                    actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Remains cloaked, maneuvering for a better position.`, isPlayerSource: false });
                } else {
                    actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Remains cloaked, holding position.`, isPlayerSource: false });
                }
                return;
            }
        }
        
        // Movement
        if (distance > 2) {
            const oldPos = { ...ship.position };
            if (ship.subsystems.engines.health < ship.subsystems.engines.maxHealth * 0.5) {
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: "Impulse engines are offline, cannot move.", isPlayerSource: false });
            } else {
                ship.position = moveOneStep(ship.position, playerShip.position);
                const newDist = calculateDistance(ship.position, playerShip.position);
                
                const wasInNebula = isPosInNebula(oldPos, gameState.currentSector);
                const isInNebula = isPosInNebula(ship.position, gameState.currentSector);

                let moveLog = `Closing distance from ${distance} to ${newDist} hexes to improve weapon effectiveness.`;
                if (isInNebula && !wasInNebula) {
                    moveLog += ` The ${ship.name} enters the nebula, obscuring its position.`;
                } else if (!isInNebula && wasInNebula) {
                    moveLog += ` The ${ship.name} leaves the nebula.`;
                }

                actions.addLog({
                    sourceId: ship.id,
                    sourceName: ship.name,
                    message: moveLog,
                    isPlayerSource: false
                });
            }
        } else {
            actions.addLog({
                sourceId: ship.id,
                sourceName: ship.name,
                message: `Maintaining optimal firing position at ${distance} hexes.`,
                isPlayerSource: false
            });
        }

        if (ship.subsystems.weapons.health > 0 && distance <= 5) {
            if (!canTargetInAsteroids) {
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: "Cannot get a target lock, target is obscured by asteroids.", isPlayerSource: false });
            } else {
                const phaserCost = 10;
                if (ship.energy.current >= phaserCost) {
                    ship.energy.current -= phaserCost;
                    const combatLogs = actions.applyPhaserDamage(playerShip, 10 * (ship.energyAllocation.weapons / 100), subsystemTarget, ship, gameState);
                    gameState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: playerShip.id, faction: ship.faction, delay: 0 });
                    combatLogs.forEach(message => actions.addLog({ sourceId: ship.id, sourceName: ship.name, message, isPlayerSource: false }));
                }
            }
        }
        
        const canLaunchTorpedo = ship.torpedoes.current > 0 && (ship.subsystems.weapons.health / ship.subsystems.weapons.maxHealth) >= 0.34;

        if (canLaunchTorpedo && distance <= 8 && Math.random() < 0.4) {
            if (canTargetInAsteroids) {
                const torpedoCost = 15;
                if (ship.energy.current >= torpedoCost) {
                    ship.energy.current -= torpedoCost;
                    ship.torpedoes.current--;
                    const shipStats = shipClasses[ship.shipModel][ship.shipClass];
                    if (shipStats.torpedoType === 'None') return;
                    const torpedoData = torpedoStats[shipStats.torpedoType];

                    const torpedo: TorpedoProjectile = {
                        id: uniqueId(),
                        name: torpedoData.name, 
                        type: 'torpedo_projectile', faction: ship.faction,
                        position: { ...ship.position }, targetId: playerShip.id, sourceId: ship.id, stepsTraveled: 0,
                        speed: torpedoData.speed, 
                        path: [{ ...ship.position }], scanned: true, turnLaunched: gameState.turn, hull: 1, maxHull: 1,
                        torpedoType: shipStats.torpedoType,
                        damage: torpedoData.damage,
                        specialDamage: torpedoData.specialDamage,
                    };
                    currentSector.entities.push(torpedo);
                    actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Has launched a ${torpedoData.name}!`, isPlayerSource: false });
                }
            }
        }
    } else {
        // Cannot see player
        if (ship.lastKnownPlayerPosition) {
            const distToLastKnown = calculateDistance(ship.position, ship.lastKnownPlayerPosition);
            if (distToLastKnown > 0) {
                const oldPos = { ...ship.position };
                ship.position = moveOneStep(ship.position, ship.lastKnownPlayerPosition);
                
                const wasInNebula = isPosInNebula(oldPos, gameState.currentSector);
                const isInNebula = isPosInNebula(ship.position, gameState.currentSector);
                let moveLog = `Lost sensor lock. Moving to last known contact position at (${ship.lastKnownPlayerPosition.x}, ${ship.lastKnownPlayerPosition.y}).`;
                if (isInNebula && !wasInNebula) {
                    moveLog += ` The ${ship.name} enters the nebula.`;
                } else if (!isInNebula && wasInNebula) {
                    moveLog += ` The ${ship.name} leaves the nebula.`;
                }

                actions.addLog({
                    sourceId: ship.id,
                    sourceName: ship.name,
                    message: moveLog,
                    isPlayerSource: false
                });
            } else {
                ship.lastKnownPlayerPosition = null; // Arrived at last known position
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Contact lost. Holding position.`, isPlayerSource: false });
            }
        } else {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: "Unable to acquire a target lock on the enemy vessel.", isPlayerSource: false });
        }
    }
}