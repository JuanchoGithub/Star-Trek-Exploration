import type { GameState, PlayerTurnActions, Ship, LogEntry, TorpedoProjectile, ShipSubsystems, CombatEffect, Position } from '../../types';
import { AIActions, AIStance } from '../ai/FactionAI';
import { applyTorpedoDamage, applyPhaserDamage, consumeEnergy } from '../utils/combat';
import { calculateDistance, moveOneStep, uniqueId, findClosestTarget } from '../utils/ai';
import { shipClasses } from '../../assets/ships/configs/shipClassStats';
import { torpedoStats } from '../../assets/projectiles/configs/torpedoTypes';
import { AIDirector } from '../ai/AIDirector';
import { processRecoveryTurn } from '../ai/factions/common';
import { applyResourceChange } from '../utils/state';
import { SECTOR_HEIGHT, SECTOR_WIDTH } from '../../assets/configs/gameConstants';

export interface TurnStep {
    updatedState: GameState;
    newNavigationTarget?: { x: number; y: number } | null;
    newSelectedTargetId?: string | null;
    delay: number;
}

interface TurnConfig {
    mode: 'game' | 'dogfight' | 'spectate';
    playerTurnActions: PlayerTurnActions;
    navigationTarget: { x: number; y: number } | null;
    selectedTargetId: string | null;
}

const getShipsInTurnOrder = (state: GameState, mode: 'game' | 'dogfight' | 'spectate'): Ship[] => {
    const allShips = (mode === 'game')
        ? [state.player.ship, ...state.currentSector.entities.filter(e => e.type === 'ship')] as Ship[]
        : state.currentSector.entities.filter(e => e.type === 'ship') as Ship[];

    return [...allShips].sort((a, b) => {
        const allegianceOrder: Record<Required<Ship>['allegiance'], number> = { player: 0, ally: 1, neutral: 2, enemy: 3 };
        const aAllegiance = a.id === 'player' ? 'player' : a.allegiance;
        const bAllegiance = b.id === 'player' ? 'player' : b.allegiance;
        return allegianceOrder[aAllegiance!] - allegianceOrder[bAllegiance!];
    });
};

export const generatePhasedTurn = (
    initialState: GameState,
    config: TurnConfig,
): TurnStep[] => {
    const steps: TurnStep[] = [];
    let currentState: GameState = JSON.parse(JSON.stringify(initialState));
    let logQueue: Omit<LogEntry, 'id' | 'turn'>[] = [];
    
    let currentNavTarget = config.navigationTarget;
    let currentSelectedId = config.selectedTargetId;

    const addLog = (logData: Omit<LogEntry, 'id' | 'turn'>) => logQueue.push(logData);

    const addStep = (delay: number) => {
        if (steps.length === 0) {
            currentState.turn++;
        }
        
        logQueue.forEach(log => {
            currentState.logs.push({
                id: uniqueId(),
                turn: currentState.turn,
                ...log
            });
        });
        logQueue = [];

        steps.push({
            updatedState: JSON.parse(JSON.stringify(currentState)),
            delay: delay,
            newNavigationTarget: currentNavTarget,
            newSelectedTargetId: currentSelectedId,
        });
    };

    const actions: AIActions = {
        addLog: (log) => addLog({ ...log, isPlayerSource: false, color: log.color || 'border-gray-500' }),
        applyPhaserDamage,
        triggerDesperationAnimation: (animation) => {
            currentState.desperationMoveAnimations.push(animation);
        }
    };

    const shipsInOrder = getShipsInTurnOrder(currentState, config.mode);
    const allShipsInSector = () => (config.mode === 'game')
        ? [currentState.player.ship, ...currentState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[]
        : currentState.currentSector.entities.filter(e => e.type === 'ship') as Ship[];

    for (const ship of shipsInOrder) {
        let shipInState = allShipsInSector().find(s => s.id === ship.id);
        if (!shipInState || shipInState.hull <= 0 || shipInState.isDerelict) continue;

        const isPlayer = ship.id === 'player' && (config.mode === 'game' || config.mode === 'dogfight');

        // --- AI/Player PRE-CALCULATION & DECISION MAKING ---
        let stance: AIStance | 'player_actions' = 'Balanced';
        let subsystemTarget: keyof ShipSubsystems | null = null;
        let moveTarget: Position | null = null;
        let phaserTargetId: string | null = null;
        let torpedoTargetId: string | null = null;
        let didAction = false;

        if (isPlayer) {
            stance = 'player_actions';
            moveTarget = currentNavTarget;
            phaserTargetId = config.playerTurnActions.phaserTargetId || null;
            torpedoTargetId = config.playerTurnActions.torpedoTargetId || null;
        } else {
            const factionAI = AIDirector.getAIForFaction(shipInState.faction);
            const potentialTargets = allShipsInSector().filter(s => {
                if (s.id === shipInState!.id || s.hull <= 0 || s.isDerelict) return false;
                if (shipInState!.allegiance === 'enemy') return s.allegiance === 'player' || s.allegiance === 'ally';
                if (shipInState!.allegiance === 'ally' || shipInState!.allegiance === 'player') return s.allegiance === 'enemy';
                return false;
            });
            
            stance = factionAI.determineStance(shipInState, potentialTargets);
            const closestTarget = findClosestTarget(shipInState, potentialTargets);
            
            if (stance === 'Recovery') {
                processRecoveryTurn(shipInState, actions);
            } else if (closestTarget) {
                if (shipInState.repairTarget) {
                    shipInState.repairTarget = null;
                    // FIX: Added missing 'isPlayerSource' property to addLog call.
                    addLog({ sourceId: ship.id, sourceName: ship.name, message: `Hostiles detected. Halting repairs to engage.`, color: ship.logColor, isPlayerSource: false });
                }
                subsystemTarget = factionAI.determineSubsystemTarget(shipInState, closestTarget);
                const distance = calculateDistance(shipInState.position, closestTarget.position);

                // Movement decision based on stance
                if (stance === 'Aggressive' && distance > 2) moveTarget = closestTarget.position;
                if (stance === 'Defensive' && distance < 6) {
                    let bestFleePosition: Position | null = null;
                    let maxDist = distance;
                    
                    // Check all 8 directions
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            if (dx === 0 && dy === 0) continue;

                            const potentialPos = { x: shipInState.position.x + dx, y: shipInState.position.y + dy };

                            // Check boundaries
                            if (potentialPos.x < 0 || potentialPos.x >= SECTOR_WIDTH || potentialPos.y < 0 || potentialPos.y >= SECTOR_HEIGHT) {
                                continue;
                            }
                            
                            // Check if blocked by another ship
                            const isBlocked = allShipsInSector().some(s => s.id !== shipInState!.id && s.position.x === potentialPos.x && s.position.y === potentialPos.y);
                            if (isBlocked) {
                                continue;
                            }

                            // Check distance from target
                            const newDist = calculateDistance(potentialPos, closestTarget.position);
                            if (newDist > maxDist) {
                                maxDist = newDist;
                                bestFleePosition = potentialPos;
                            }
                        }
                    }
                    
                    if (bestFleePosition) {
                        moveTarget = bestFleePosition;
                    }
                }
                if (stance === 'Balanced' && distance > 4) moveTarget = closestTarget.position;

                // Firing decision based on stance
                if (distance <= 5 && stance !== 'Defensive') phaserTargetId = closestTarget.id;
                if (distance <= 8 && stance === 'Aggressive' && Math.random() < 0.5) torpedoTargetId = closestTarget.id;
            }
        }
        
        // --- PHASE 1: POINT DEFENSE ---
        _handlePointDefense(shipInState, currentState, addLog);
        if (currentState.combatEffects.length > 0) { addStep(750); didAction = true; }

        // --- PHASE 2: ENERGY/REPAIR ---
        _handleEnergyAndRepair(shipInState, isPlayer, stance, actions);
        addStep(0); // non-visual change

        // --- PHASE 3: MOVEMENT & CLOAK ---
        const moved = _handleMovement(shipInState, moveTarget, allShipsInSector(), addLog);
        if (moved) {
            addStep(750);
            didAction = true;
            if (isPlayer) { // Update nav target if reached
                if (shipInState.position.x === moveTarget?.x && shipInState.position.y === moveTarget.y) {
                    currentNavTarget = null;
                }
            }
        }

        // --- PHASE 4: TORPEDO ---
        if (_handleTorpedo(shipInState, torpedoTargetId, currentState, addLog)) {
            addStep(0); // Torpedo appears instantly
            didAction = true;
        }

        // --- PHASE 5: PHASER ---
        if (_handlePhaser(shipInState, phaserTargetId, subsystemTarget, currentState, actions, addLog)) {
            addStep(750);
            didAction = true;
        }
        
        if (!didAction && !isPlayer && stance !== 'Recovery') {
            // FIX: Added missing 'isPlayerSource' property to addLog call.
            addLog({ sourceId: ship.id, sourceName: ship.name, message: 'Holding position.', color: ship.logColor, isPlayerSource: false });
        }
    }

    // --- PROJECTILE MOVEMENT PHASE ---
    _handleProjectileMovement(currentState, allShipsInSector(), addLog);
    addStep(750);

    // --- END OF TURN PHASE ---
    _handleEndOfTurn(currentState, allShipsInSector(), addLog);
    addStep(0);
    
    return steps;
};


// Helper Functions
function _handlePointDefense(ship: Ship, state: GameState, addLog: Function) {
    const torpedoesInRange = state.currentSector.entities.filter(e => e.type === 'torpedo_projectile' && e.faction !== ship.faction && calculateDistance(ship.position, e.position) <= 1) as TorpedoProjectile[];
    if (ship.pointDefenseEnabled && ship.subsystems.pointDefense.health > 0 && torpedoesInRange.length > 0) {
        const torpedoToTarget = torpedoesInRange.sort((a,b) => b.damage - a.damage)[0];
        const hitChance = ship.subsystems.pointDefense.health / ship.subsystems.pointDefense.maxHealth;
        let logMsg = `Point-defense system targets incoming ${torpedoToTarget.name}.`;
        
        if (Math.random() < hitChance) {
            logMsg += ` Direct hit! The torpedo is destroyed.`;
            state.currentSector.entities = state.currentSector.entities.filter(e => e.id !== torpedoToTarget.id);
        } else { logMsg += ` The shot misses!`; }
        
        addLog({ sourceId: ship.id, sourceName: ship.name, message: logMsg, color: ship.logColor, isPlayerSource: false });
        state.combatEffects.push({ type: 'point_defense', sourceId: ship.id, targetPosition: torpedoToTarget.position, faction: ship.faction, delay: 0 });
    }
}

function _handleEnergyAndRepair(ship: Ship, isPlayer: boolean, stance: AIStance | 'player_actions', actions: AIActions) {
    if (!isPlayer && stance !== 'player_actions') {
        const energySettings: Record<AIStance, { w: number, s: number, e: number }> = {
            'Aggressive': { w: 74, s: 13, e: 13 },
            'Defensive': { w: 20, s: 60, e: 20 },
            'Balanced': { w: 34, s: 33, e: 33 },
            'Recovery': { w: 0, s: 0, e: 100 },
        };
        const targetAlloc = energySettings[stance];
        if (ship.energyAllocation.weapons !== targetAlloc.w) {
            ship.energyAllocation = { weapons: targetAlloc.w, shields: targetAlloc.s, engines: targetAlloc.e };
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Adopting ${stance.toLowerCase()} stance.`, color: ship.logColor });
        }
    }
}

function _handleMovement(ship: Ship, moveTarget: Position | null, allShips: Ship[], addLog: Function): boolean {
    const originalPosition = { ...ship.position };
    if (moveTarget) {
        const nextStep = moveOneStep(ship.position, moveTarget);
        const isBlocked = allShips.some(s => s.id !== ship.id && s.position.x === nextStep.x && s.position.y === nextStep.y);
        const isValidPosition = nextStep.x >= 0 && nextStep.x < SECTOR_WIDTH && nextStep.y >= 0 && nextStep.y < SECTOR_HEIGHT;

        if (isBlocked) {
            if (ship.allegiance !== 'player') addLog({ sourceId: ship.id, sourceName: ship.name, message: `Movement blocked.`, isPlayerSource: false, color: ship.logColor });
        } else if (!isValidPosition) {
             if (ship.allegiance !== 'player') addLog({ sourceId: ship.id, sourceName: ship.name, message: `Cannot move further.`, isPlayerSource: false, color: ship.logColor });
        } else {
            ship.position = nextStep;
        }
    }
    return ship.position.x !== originalPosition.x || ship.position.y !== originalPosition.y;
}

function _handleTorpedo(ship: Ship, targetId: string | null, state: GameState, addLog: Function): boolean {
    if (!targetId || ship.torpedoes.current <= 0) return false;
    
    const shipStats = shipClasses[ship.shipModel][ship.shipClass];
    if (shipStats.torpedoType === 'None') return false;

    const torpedoData = torpedoStats[shipStats.torpedoType];
    const target = state.currentSector.entities.find(e => e.id === targetId);
    if (!target) return false;

    ship.torpedoes.current--;
    const torpedo: TorpedoProjectile = {
        id: uniqueId(), name: torpedoData.name, type: 'torpedo_projectile', faction: ship.faction,
        position: { ...ship.position }, targetId, sourceId: ship.id, stepsTraveled: 0,
        speed: torpedoData.speed, path: [{ ...ship.position }], scanned: true, turnLaunched: state.turn, hull: 1, maxHull: 1,
        torpedoType: shipStats.torpedoType, damage: torpedoData.damage, specialDamage: torpedoData.specialDamage,
    };
    state.currentSector.entities.push(torpedo);
    const isPlayerSource = ship.id === 'player';
    addLog({ sourceId: ship.id, sourceName: ship.name, message: `${torpedoData.name} launched at ${target.name}.`, isPlayerSource, color: ship.logColor });
    return true;
}

function _handlePhaser(ship: Ship, targetId: string | null, subsystem: keyof ShipSubsystems | null, state: GameState, actions: AIActions, addLog: Function): boolean {
    if (!targetId || ship.subsystems.weapons.health <= 0) return false;
    const target = state.currentSector.entities.find(e => e.id === targetId) as Ship | undefined;
    if (!target) return false;

    const phaserBaseDamage = 20 * ship.energyModifier;
    const phaserPowerModifier = ship.energyAllocation.weapons / 100;
    const pointDefenseModifier = ship.pointDefenseEnabled ? 0.6 : 1.0;
    const finalDamage = phaserBaseDamage * phaserPowerModifier * pointDefenseModifier;

    const combatLogs = actions.applyPhaserDamage(target, finalDamage, subsystem, ship, state);
    state.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: target.id, faction: ship.faction, delay: 0 });
    
    const isPlayerSource = ship.id === 'player';
    combatLogs.forEach(message => addLog({ sourceId: ship.id, sourceName: ship.name, message, isPlayerSource, color: ship.logColor }));
    return true;
}

function _handleProjectileMovement(state: GameState, allShips: Ship[], addLog: Function) {
    const torpedoes = state.currentSector.entities.filter(e => e.type === 'torpedo_projectile') as TorpedoProjectile[];
    if (torpedoes.length === 0) return;

    const entitiesToKeep = state.currentSector.entities.filter(e => e.type !== 'torpedo_projectile');
    const newTorpedoes: TorpedoProjectile[] = [];

    for (const torpedo of torpedoes) {
        const target = allShips.find(e => e.id === torpedo.targetId);
        if (!target || target.hull <= 0) continue;

        let keepTorpedo = true;
        for (let i = 0; i < torpedo.speed; i++) {
            if (calculateDistance(torpedo.position, target.position) <= 0) {
                const damageLogs = applyTorpedoDamage(target, torpedo);
                damageLogs.forEach(message => addLog({ sourceId: torpedo.sourceId, sourceName: torpedo.name, message, isPlayerSource: torpedo.sourceId === 'player', color: 'border-orange-400'}));
                state.combatEffects.push({ type: 'torpedo_hit', position: target.position, delay: i * (750 / torpedo.speed), torpedoType: torpedo.torpedoType });
                keepTorpedo = false;
                break;
            }
            torpedo.position = moveOneStep(torpedo.position, target.position);
            torpedo.path.push({ ...torpedo.position });
        }
        if (keepTorpedo) {
            newTorpedoes.push(torpedo);
        }
    }
    state.currentSector.entities = [...entitiesToKeep, ...newTorpedoes];
}

function _handleEndOfTurn(state: GameState, allShips: Ship[], addLog: (log: Omit<LogEntry, 'id' | 'turn'>) => void) {
    allShips.forEach(ship => {
        if (ship.hull <= 0 || ship.isDerelict) return;

        // Repair
        if (ship.repairTarget) {
            const repairAmount = 5;
            if (ship.repairTarget === 'hull') {
                applyResourceChange(ship, 'hull', repairAmount);
            } else {
                applyResourceChange(ship, ship.repairTarget, repairAmount);
            }
        }

        // Shield Regeneration
        if (state.redAlert && ship.shields < ship.maxShields && ship.subsystems.shields.health > 0) {
            const shieldEfficiency = ship.subsystems.shields.health / ship.subsystems.shields.maxHealth;
            // Power modifier is proportional: 33% power = 1x regen, 66% = 2x, 100% = ~3x
            const powerToShieldsModifier = (ship.energyAllocation.shields / 33); 
            const baseRegen = ship.maxShields * 0.10; // Base regen is 10% of max shields at 33% power
            
            const regenerationAmount = baseRegen * powerToShieldsModifier * shieldEfficiency;
            
            if (regenerationAmount > 0) {
                ship.shields = Math.min(ship.maxShields, ship.shields + regenerationAmount);
            }
        }
        
        // Energy Regen/Drain
        const stats = shipClasses[ship.shipModel]?.[ship.shipClass];
        if (stats) {
            const engineOutputMultiplier = 0.5 + 1.5 * (ship.energyAllocation.engines / 100);
            const engineEfficiency = ship.subsystems.engines.maxHealth > 0 ? ship.subsystems.engines.health / ship.subsystems.engines.maxHealth : 0;
            const generated = stats.baseEnergyGeneration * engineOutputMultiplier * engineEfficiency;
            
            let consumption = stats.systemConsumption.base;
            for (const key in ship.subsystems) {
                const systemKey = key as keyof ShipSubsystems;
                if (ship.subsystems[systemKey].health > 0) consumption += stats.systemConsumption[systemKey];
            }
            if(ship.shields > 0) consumption += 20 * stats.energyModifier;
            if(ship.evasive) consumption += 10 * stats.energyModifier;
            if(ship.pointDefenseEnabled) consumption += 15 * stats.energyModifier;
            if(ship.repairTarget) consumption += 5 * stats.energyModifier;

            const netChange = generated - consumption;
            ship.energy.current = Math.max(0, Math.min(ship.energy.max, ship.energy.current + netChange));
        }
        
        const isPlayerSource = ship.id === 'player';
        const logColor = isPlayerSource ? 'border-blue-400' : ship.logColor;

        // Dilithium/Life Support Failure Logic
        if (ship.energy.current <= 0) {
            if (ship.dilithium.current > 0) {
                ship.dilithium.current--;
                ship.energy.current = ship.energy.max;
                addLog({
                    sourceId: ship.id, sourceName: ship.name,
                    message: `Reserve power depleted! Consuming one dilithium crystal to restore energy reserves.`,
                    isPlayerSource, color: logColor
                });

                if (Math.random() < 0.25) { // 25% chance of damage
                    const subsystems: (keyof ShipSubsystems)[] = ['weapons', 'engines', 'shields', 'transporter', 'pointDefense', 'computer', 'lifeSupport'];
                    const randomSubsystemKey = subsystems[Math.floor(Math.random() * subsystems.length)];
                    const targetSubsystem = ship.subsystems[randomSubsystemKey];
                    if (targetSubsystem.maxHealth > 0) {
                        const damage = 5 + Math.floor(Math.random() * 6);
                        targetSubsystem.health = Math.max(0, targetSubsystem.health - damage);
                        addLog({
                            sourceId: ship.id, sourceName: ship.name,
                            message: `WARNING: The emergency power transfer caused ${damage} damage to the ${randomSubsystemKey} system!`,
                            isPlayerSource, color: 'border-orange-500'
                        });
                    }
                }
            } else {
                if (ship.lifeSupportFailureTurn === null) {
                    ship.lifeSupportFailureTurn = state.turn;
                    addLog({
                        sourceId: ship.id, sourceName: ship.name,
                        message: `CRITICAL: All power and dilithium reserves exhausted! Life support is running on emergency batteries. Failure in 2 turns!`,
                        isPlayerSource, color: 'border-red-600'
                    });
                }
            }
        }

        // Check for life support failure resolution
        if (ship.lifeSupportFailureTurn !== null) {
            if (state.turn - ship.lifeSupportFailureTurn >= 2) {
                ship.isDerelict = true;
                ship.hull = Math.min(ship.hull, ship.maxHull * 0.1);
                ship.shields = 0;
                ship.energy.current = 0;
                addLog({
                    sourceId: ship.id, sourceName: ship.name,
                    message: `Life support has failed! The ship is now a derelict hulk.`,
                    isPlayerSource, color: 'border-red-600'
                });
            }
        }

        // Status Effects
        ship.statusEffects = ship.statusEffects.filter(effect => {
            if (effect.type === 'plasma_burn') {
                const damage = Math.round(effect.damage * (stats ? stats.energyModifier : 1));
                ship.hull = Math.max(0, ship.hull - damage);
                addLog({ sourceId: ship.id, sourceName: ship.name, message: `Plasma fire burns the hull for ${damage} damage!`, isPlayerSource, color: 'border-orange-400' });
                effect.turnsRemaining--;
            }
            return effect.turnsRemaining > 0;
        });

    });
}