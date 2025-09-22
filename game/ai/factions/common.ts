import type { GameState, Ship, TorpedoProjectile, SectorState, ShipSubsystems, TorpedoType } from '../../../types';
import { calculateDistance, moveOneStep } from '../../utils/ai';
import { AIActions, AIStance } from '../FactionAI';
import { shipClasses } from '../../../assets/ships/configs/shipClassStats';
import { torpedoStats } from '../../../assets/projectiles/configs/torpedoTypes';
import { isPosInNebula, isDeepNebula } from '../../utils/sector';
import { uniqueId } from '../../utils/helpers';
import { findClosestTarget } from '../../utils/ai';
import { consumeEnergy } from '../../utils/combat';

const canAISeeTarget = (aiShip: Ship, target: Ship, sector: SectorState): boolean => {
    if (target.cloakState === 'cloaked') return false;
    
    if (isDeepNebula(target.position, sector)) return false;

    if (isPosInNebula(aiShip.position, sector)) {
        return calculateDistance(aiShip.position, target.position) <= 1;
    }

    const asteroidPositions = new Set(sector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
    const targetPosKey = `${target.position.x},${target.position.y}`;
    if (asteroidPositions.has(targetPosKey)) {
        if (calculateDistance(aiShip.position, target.position) > 4) {
            return false;
        }
    }
    
    return true;
};

// Returns true if the ship's turn should end after this function
const processAIStrategicDecisions = (ship: Ship, stance: AIStance, gameState: GameState, actions: AIActions, target: Ship | null): boolean => {
    // 1. Energy Management
    const ENERGY_CRITICAL_THRESHOLD = 25 * ship.energyModifier;
    if (ship.energy.current < ENERGY_CRITICAL_THRESHOLD && ship.dilithium.current > 0) {
        const { logs } = consumeEnergy(ship, 0); // Use 0 to just trigger the recharge
        logs.forEach(log => actions.addLog({
            sourceId: ship.id,
            sourceName: ship.name,
            message: log,
            isPlayerSource: false,
            color: 'border-orange-500'
        }));
    }

    // 2. Retreat Logic
    if (ship.energy.current < ENERGY_CRITICAL_THRESHOLD && ship.dilithium.current <= 0) {
        if (ship.retreatingTurn === null) {
            ship.retreatingTurn = gameState.turn + 2;
            actions.addLog({
                sourceId: ship.id,
                sourceName: ship.name,
                message: `Power and dilithium reserves are critically low! Attempting to disengage and warp out!`,
                isPlayerSource: false,
                color: 'border-yellow-500'
            });
        }
    }
    
    if (ship.retreatingTurn !== null) {
        // Move away from target if retreating
        if (target) {
            const fleeVector = {
                x: ship.position.x - target.position.x,
                y: ship.position.y - target.position.y,
            };
            let fleePosition = { ...ship.position };
            if (Math.abs(fleeVector.x) > Math.abs(fleeVector.y)) { fleePosition.x += Math.sign(fleeVector.x); } 
            else if (fleeVector.y !== 0) { fleePosition.y += Math.sign(fleeVector.y); } 
            else if (fleeVector.x !== 0) { fleePosition.x += Math.sign(fleeVector.x); }
            
            if (fleePosition.x >= 0 && fleePosition.x < 12 && fleePosition.y >= 0 && fleePosition.y < 10) {
                ship.position = fleePosition;
            }
        }
        return true; // End turn after retreating move
    }

    // 3. Point Defense Logic
    const incomingTorpedoes = gameState.currentSector.entities.some(e => e.type === 'torpedo_projectile' && e.targetId === ship.id && e.hull > 0);
    const isHighTorpedoThreat = target?.shipClass === 'Sovereign-class' || target?.shipClass === 'Defiant-class';

    const shouldEnableLPD = incomingTorpedoes || stance === 'Defensive' || isHighTorpedoThreat;
    
    if (ship.pointDefenseEnabled && !shouldEnableLPD && ship.energy.current < ship.energy.max * 0.5) {
        ship.pointDefenseEnabled = false;
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Deactivating point-defense grid to conserve power.`, isPlayerSource: false, color: 'border-gray-400' });
    } else if (!ship.pointDefenseEnabled && shouldEnableLPD) {
        ship.pointDefenseEnabled = true;
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Activating point-defense grid to counter threats.`, isPlayerSource: false, color: 'border-yellow-400' });
    }

    // LPD Firing and energy consumption
    if (ship.pointDefenseEnabled) {
        processPointDefenseForAI(ship, gameState, actions);
    }
    
    return false; // Continue with the rest of the turn
};

function processPointDefenseForAI(ship: Ship, gameState: GameState, actions: AIActions) {
    if (!ship.pointDefenseEnabled || ship.subsystems.pointDefense.health <= 0) return;

    const incomingTorpedoes = gameState.currentSector.entities.filter((e): e is TorpedoProjectile => 
        e.type === 'torpedo_projectile' && e.targetId === ship.id && e.hull > 0
    );

    let pointDefenseFired = false;
    if (incomingTorpedoes.length > 0) {
        const POINT_DEFENSE_RANGE = 1;
        const validTargets = incomingTorpedoes.filter(torpedo => 
            calculateDistance(ship.position, torpedo.position) <= POINT_DEFENSE_RANGE
        );

        if (validTargets.length > 0) {
            const threatOrder: Record<TorpedoType, number> = { 'Quantum': 5, 'HeavyPhoton': 4, 'Photon': 3, 'HeavyPlasma': 2, 'Plasma': 1 };
            validTargets.sort((a, b) => threatOrder[b.torpedoType] - threatOrder[a.torpedoType]);
            
            const torpedoToShoot = validTargets[0];
            const activeEnergyCost = 40 * ship.energyModifier;

            if (ship.energy.current >= activeEnergyCost) {
                ship.energy.current -= activeEnergyCost;
                pointDefenseFired = true;
                
                const hitChance = ship.subsystems.pointDefense.health / ship.subsystems.pointDefense.maxHealth;
                if (Math.random() < hitChance) {
                    torpedoToShoot.hull = 0;
                    gameState.combatEffects.push({ type: 'point_defense', sourceId: ship.id, targetId: torpedoToShoot.id, faction: ship.faction, delay: 0 });
                    actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Point-defense grid intercepts incoming ${torpedoToShoot.name}!`, isPlayerSource: false });
                } else {
                     actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Point-defense grid fired at incoming ${torpedoToShoot.name} but missed!`, isPlayerSource: false });
                }
            }
        }
    }
    
    if (!pointDefenseFired) {
        const passiveEnergyCost = 20 * ship.energyModifier;
        if (ship.energy.current >= passiveEnergyCost) {
            ship.energy.current -= passiveEnergyCost;
        } else {
            ship.pointDefenseEnabled = false;
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Insufficient power for upkeep. Deactivating point-defense grid.`, isPlayerSource: false, color: 'border-orange-500' });
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
    potentialTargets: Ship[], 
    gameState: GameState, 
    actions: AIActions,
    subsystemTarget: keyof ShipSubsystems | null,
    stance: AIStance
) {
    const { currentSector } = gameState;
    const visibleTargets = potentialTargets.filter(t => canAISeeTarget(ship, t, currentSector));
    const target = findClosestTarget(ship, visibleTargets);
    
    if (processAIStrategicDecisions(ship, stance, gameState, actions, target)) {
        return; // Turn is spent on strategic actions (retreating, etc.)
    }

    if (target) {
        ship.lastKnownPlayerPosition = { ...target.position };

        const distance = calculateDistance(ship.position, target.position);
        
        const asteroidPositions = new Set(currentSector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
        const targetPosKey = `${target.position.x},${target.position.y}`;
        const canTargetInAsteroids = !(asteroidPositions.has(targetPosKey) && distance > 2);
        
        if (ship.cloakState === 'cloaked') {
            const shouldDecloak = (distance <= 5 && (ship.hull / ship.maxHull) > 0.4);
            if (shouldDecloak) {
                ship.cloakState = 'visible';
                ship.cloakCooldown = 2;
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Decloaks, preparing to engage!`, isPlayerSource: false });
                return;
            } else {
                if (distance > 1) {
                    ship.position = moveOneStep(ship.position, target.position);
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
                ship.position = moveOneStep(ship.position, target.position);
                const newDist = calculateDistance(ship.position, target.position);
                
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
                const phaserCost = 10 * ship.energyModifier;
                if (ship.energy.current >= phaserCost) {
                    ship.energy.current -= phaserCost;
                    const combatLogs = actions.applyPhaserDamage(target, 10 * ship.energyModifier * (ship.energyAllocation.weapons / 100), subsystemTarget, ship, gameState);
                    gameState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: target.id, faction: ship.faction, delay: 0 });
                    combatLogs.forEach(message => actions.addLog({ sourceId: ship.id, sourceName: ship.name, message, isPlayerSource: false }));
                }
            }
        }
        
        const canLaunchTorpedo = ship.torpedoes.current > 0 && (ship.subsystems.weapons.health / ship.subsystems.weapons.maxHealth) >= 0.34;

        if (canLaunchTorpedo && distance <= 8 && Math.random() < 0.4) {
            if (canTargetInAsteroids) {
                const torpedoCost = 15 * ship.energyModifier;
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
                        position: { ...ship.position }, targetId: target.id, sourceId: ship.id, stepsTraveled: 0,
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
        // Cannot see any targets
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
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: "Unable to acquire a target lock on any enemy vessel.", isPlayerSource: false });
        }
    }
}