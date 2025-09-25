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
import { processPlayerTurn } from './player';
import { canShipSeeEntity } from '../utils/visibility';
import { isCommBlackout } from '../utils/sector';

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
    
    // --- PLAYER TURN ---
    if (config.mode === 'game') {
        const playerResult = processPlayerTurn(currentState, config.playerTurnActions, currentNavTarget, currentSelectedId, addLog);
        currentNavTarget = playerResult.newNavigationTarget;
        currentSelectedId = playerResult.newSelectedTargetId;
    }
    addStep(0); // Add step after player actions resolve

    // --- AI TURNS ---
    for (const ship of shipsInOrder) {
        if (ship.id === 'player') continue; // Player already acted

        let shipInState = allShipsInSector().find(s => s.id === ship.id);
        if (!shipInState || shipInState.hull <= 0 || shipInState.isDerelict) continue;
        
        const factionAI = AIDirector.getAIForFaction(shipInState.faction);
        
        let allPossibleOpponents: Ship[] = [];
        if (shipInState.allegiance === 'enemy') {
            allPossibleOpponents = allShipsInSector().filter(s => (s.allegiance === 'player' || s.allegiance === 'ally') && s.hull > 0);
        } else if (shipInState.allegiance === 'player' || shipInState.allegiance === 'ally') {
            allPossibleOpponents = allShipsInSector().filter(s => s.allegiance === 'enemy' && s.hull > 0);
        } else if (shipInState.allegiance === 'neutral') {
            allPossibleOpponents = allShipsInSector().filter(s => (s.allegiance === 'enemy' || s.allegiance === 'player' || s.allegiance === 'ally') && s.hull > 0);
        }

        // Find all allies that are NOT in a communication blackout.
        // A ship can always use its own sensors, even in a blackout.
        const alliesWithComms = allShipsInSector().filter(s => 
            s.allegiance === shipInState!.allegiance && 
            s.hull > 0 &&
            (s.id === shipInState!.id || !isCommBlackout(s.position, currentState.currentSector))
        );

        const potentialTargets = allPossibleOpponents.filter(target => {
            if (target.cloakState === 'cloaked') return false;

            // Check if the target is visible to ANY allied ship with active communications.
            // This simulates a shared sensor network (C3 - Command, Control, Communications).
            const isVisibleToAnyAlly = alliesWithComms.some(ally => 
                canShipSeeEntity(target, ally, currentState.currentSector)
            );

            return isVisibleToAnyAlly;
        });

        factionAI.processTurn(shipInState, currentState, actions, potentialTargets);
        addStep(0);
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
                const sourceShip = allShips.find(s => s.id === torpedo.sourceId);
                const damageLogs = applyTorpedoDamage(target, torpedo, sourceShip?.position || null);
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

        // Docking Repairs & Resupply
        if (ship.id === 'player' && state.isDocked) {
            const hullRepair = ship.maxHull * 0.2;
            const dilithiumResupply = ship.dilithium.max * 0.2;
            const torpedoResupply = ship.torpedoes.max * 0.5;

            applyResourceChange(ship, 'hull', hullRepair);
            applyResourceChange(ship, 'dilithium', dilithiumResupply);
            applyResourceChange(ship, 'torpedoes', torpedoResupply);

            (Object.keys(ship.subsystems) as Array<keyof ShipSubsystems>).forEach(key => {
                const subsystem = ship.subsystems[key];
                const subRepair = subsystem.maxHealth * 0.2;
                applyResourceChange(ship, key, subRepair);
            });
            
            addLog({ sourceId: 'system', sourceName: 'Starbase Control', message: 'Repairs and resupply in progress.', isPlayerSource: false, color: 'border-gray-500' });
            return; // No other end-of-turn actions while docked
        }

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