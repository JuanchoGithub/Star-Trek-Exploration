import type { GameState, PlayerTurnActions, Ship, LogEntry, TorpedoProjectile, ShipSubsystems } from '../../types';
import { processPlayerTurn } from './player';
import { processAITurns } from './aiProcessor';
import { AIActions } from '../ai/FactionAI';
import { applyTorpedoDamage, applyPhaserDamage, consumeEnergy } from '../utils/combat';
import { calculateDistance, moveOneStep, uniqueId } from '../utils/ai';
import { shipClasses } from '../../assets/ships/configs/shipClassStats';
import { isPosInNebula } from '../utils/sector';

const processEndOfTurnSystems = (state: GameState, addLog: (logData: Omit<LogEntry, 'id' | 'turn'>) => void): void => {
    const allShips = [state.player.ship, ...state.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
    
    allShips.forEach(ship => {
        if (ship.hull <= 0) return;

        // 1. Status Effects (Plasma Burn)
        ship.statusEffects = ship.statusEffects.filter(effect => {
            if (effect.type === 'plasma_burn') {
                ship.hull = Math.max(0, ship.hull - effect.damage);
                addLog({ sourceId: ship.id, sourceName: 'Damage Control', message: `${ship.name} takes ${effect.damage} damage from plasma fire!`, color: 'border-orange-400', isPlayerSource: ship.id === 'player' });
                effect.turnsRemaining--;
                return effect.turnsRemaining > 0;
            }
            return false;
        });

        // 2. Damage Control Repairs
        if (ship.repairTarget) {
            const repairCost = 5 * ship.energyModifier;
            const { success } = consumeEnergy(ship, repairCost);
            if (success) {
                const repairAmount = 5;
                if (ship.repairTarget === 'hull') {
                    ship.hull = Math.min(ship.maxHull, ship.hull + repairAmount);
                    addLog({ sourceId: ship.id, sourceName: 'Engineering', message: `Damage control team repaired the hull by ${repairAmount} points.`, color: 'border-green-400', isPlayerSource: ship.id === 'player' });
                } else {
                    const subsystem = ship.subsystems[ship.repairTarget];
                    if (subsystem) {
                        subsystem.health = Math.min(subsystem.maxHealth, subsystem.health + repairAmount);
                        addLog({ sourceId: ship.id, sourceName: 'Engineering', message: `Damage control team repaired ${ship.repairTarget} by ${repairAmount} points.`, color: 'border-green-400', isPlayerSource: ship.id === 'player' });
                        if (subsystem.health >= subsystem.maxHealth) {
                            ship.repairTarget = null;
                            addLog({ sourceId: ship.id, sourceName: 'Engineering', message: `${ship.repairTarget} fully repaired.`, color: 'border-green-400', isPlayerSource: ship.id === 'player' });
                        }
                    }
                }
            } else {
                 addLog({ sourceId: ship.id, sourceName: 'Engineering', message: `Insufficient power for damage control! Repairs halted.`, color: 'border-orange-400', isPlayerSource: ship.id === 'player' });
            }
        }

        // 3. System Failure Timers
        if (ship.lifeSupportFailureTurn !== null) {
            const turnsPassed = state.turn - ship.lifeSupportFailureTurn;
            if (turnsPassed >= 2) {
                ship.isDerelict = true;
                ship.hull = 1; // Not destroyed, but disabled
                addLog({ sourceId: ship.id, sourceName: 'SYSTEM', message: `Life support failure on ${ship.name}! The crew is lost. The ship is now a derelict hulk.`, color: 'border-red-600', isPlayerSource: false });
            }
        }
        if (ship.engineFailureTurn !== null) {
            const turnsPassed = state.turn - ship.engineFailureTurn;
            if (turnsPassed >= 3) {
                ship.engineFailureTurn = null; // Engines come back online after 3 turns
                addLog({ sourceId: ship.id, sourceName: 'Engineering', message: `${ship.name}'s engines have been stabilized and are back online.`, color: 'border-green-400', isPlayerSource: ship.id === 'player' });
            }
        }
        
        // 4. Energy Management (Generation & Consumption)
        const stats = shipClasses[ship.shipModel][ship.shipClass];
        const engineOutputMultiplier = 0.5 + 1.5 * (ship.energyAllocation.engines / 100);
        const engineEfficiency = ship.subsystems.engines.maxHealth > 0 ? ship.subsystems.engines.health / ship.subsystems.engines.maxHealth : 0;
        const generatedFromEngines = stats.baseEnergyGeneration * engineOutputMultiplier * engineEfficiency;

        let totalConsumption = 0;
        for (const key in ship.subsystems) {
            const systemKey = key as keyof ShipSubsystems;
            if (ship.subsystems[systemKey].health > 0 && stats.systemConsumption[systemKey] > 0) {
                totalConsumption += stats.systemConsumption[systemKey];
            }
        }
        if (stats.systemConsumption.base > 0) totalConsumption += stats.systemConsumption.base;
        if (ship.id === 'player' && state.redAlert) totalConsumption += 20;
        if (ship.evasive) totalConsumption += 10;
        if (ship.pointDefenseEnabled) totalConsumption += 15;
        if (ship.repairTarget) totalConsumption += 5;

        const netChange = generatedFromEngines - totalConsumption;
        ship.energy.current += netChange;

        // 5. Shield Regeneration
        if (ship.shields < ship.maxShields && ship.subsystems.shields.health > 0 && ((ship.id === 'player' && state.redAlert) || (ship.id !== 'player'))) {
            const regenAmount = (ship.energyAllocation.shields / 100) * (ship.maxShields * 0.1);
            const shieldEfficiency = ship.subsystems.shields.health / ship.subsystems.shields.maxHealth;
            const effectiveRegen = regenAmount * shieldEfficiency;
            ship.shields = Math.min(ship.maxShields, ship.shields + effectiveRegen);
        }

        // 6. Cloaking Maintenance & Cooldown
        if (ship.cloakState === 'cloaked') {
            const baseReliability = ship.customCloakStats?.reliability ?? 0.90;
            let currentReliability = baseReliability;
            if(isPosInNebula(ship.position, state.currentSector)) currentReliability -= 0.25;
            
            const powerCost = ship.customCloakStats?.powerCost ?? 40;
            const { success } = consumeEnergy(ship, powerCost);

            if (!success || Math.random() > currentReliability) {
                ship.cloakState = 'visible';
                ship.cloakCooldown = 2;
                addLog({ sourceId: ship.id, sourceName: 'Engineering', message: `Cloaking field collapsed due to power failure or instability!`, color: 'border-orange-400', isPlayerSource: ship.id === 'player' });
            }
        }
        if (ship.cloakCooldown > 0) ship.cloakCooldown--;

        // 7. Stun recovery
        if (ship.isStunned) ship.isStunned = false;
        
        // Final energy clamp
        ship.energy.current = Math.max(0, Math.min(ship.energy.max, ship.energy.current));
    });
};

export const resolveTurn = (
    gameState: GameState,
    playerTurnActions: PlayerTurnActions,
    navigationTarget: { x: number; y: number } | null,
    selectedTargetId: string | null
): { nextGameState: GameState; newNavigationTarget: { x: number; y: number } | null; newSelectedTargetId: string | null; } => {
    const nextState: GameState = JSON.parse(JSON.stringify(gameState));
    
    const logQueue: Omit<LogEntry, 'id' | 'turn'>[] = [];
    const addLog = (logData: Omit<LogEntry, 'id' | 'turn'>) => logQueue.push(logData);

    const actedShipIds = new Set<string>();
    
    // 1. Process Player Actions
    const { newNavigationTarget, newSelectedTargetId } = processPlayerTurn(nextState, playerTurnActions, navigationTarget, selectedTargetId, addLog);
    actedShipIds.add('player');

    // 2. Process AI Actions
    const aiActions: AIActions = {
        addLog,
        applyPhaserDamage: (target: Ship, damage: number, subsystem: keyof ShipSubsystems | null, source: Ship, state: GameState) => {
            return applyPhaserDamage(target, damage, subsystem, source, state);
        },
        triggerDesperationAnimation: (animation) => nextState.desperationMoveAnimations.push(animation),
    };
    processAITurns(nextState, aiActions, actedShipIds);

    // 3. Torpedo Movement & Resolution
    nextState.currentSector.entities = nextState.currentSector.entities.filter(entity => {
        if (entity.type !== 'torpedo_projectile') return true;
        
        const torpedo = entity as TorpedoProjectile;
        const allShips = [nextState.player.ship, ...nextState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
        const target = allShips.find(s => s.id === torpedo.targetId);
        
        if (!target || target.hull <= 0) return false; // Target destroyed or gone

        for (let i = 0; i < torpedo.speed; i++) {
            if (calculateDistance(torpedo.position, target.position) <= 0) {
                 const combatLogs = applyTorpedoDamage(target, torpedo);
                 combatLogs.forEach(log => addLog({ sourceId: torpedo.sourceId, sourceName: 'Combat Log', message: log, isPlayerSource: false, color: 'border-gray-500' }));
                 nextState.combatEffects.push({ type: 'torpedo_hit', position: target.position, delay: 0, torpedoType: torpedo.torpedoType });
                return false; // Torpedo is destroyed on impact
            }
            torpedo.position = moveOneStep(torpedo.position, target.position);
            torpedo.path.push({ ...torpedo.position });
        }
        return true; // Torpedo continues
    });
    
    // 4. Process End-of-Turn Systems
    processEndOfTurnSystems(nextState, addLog);
    
    // 5. Retreat Check
    if (nextState.player.ship.retreatingTurn !== null && nextState.turn >= nextState.player.ship.retreatingTurn) {
        addLog({ sourceId: 'player', sourceName: nextState.player.ship.name, message: 'Emergency warp engaged! We have escaped!', color: 'border-green-400', isPlayerSource: true });
        nextState.isRetreatingWarp = true; // This will trigger the warp animation
    }
    
    // 6. Clean up destroyed entities
    nextState.currentSector.entities = nextState.currentSector.entities.filter(e => {
        if (e.type === 'ship' || e.type === 'torpedo_projectile') {
            return (e as Ship).hull > 0;
        }
        return true;
    });

    // 7. Check for Game Over
    if (nextState.player.ship.hull <= 0) {
        nextState.gameOver = true;
        addLog({ sourceId: 'system', sourceName: 'SYSTEM', message: 'U.S.S. Endeavour has been destroyed. Mission failed.', color: 'border-red-600', isPlayerSource: false });
    } else {
        const enemyShips = nextState.currentSector.entities.filter(e => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
        if (nextState.redAlert && enemyShips.length === 0) {
            nextState.redAlert = false;
            nextState.player.ship.shields = 0;
            nextState.player.ship.evasive = false;
            addLog({ sourceId: 'system', sourceName: 'Ship Computer', message: 'All hostile contacts neutralized. Standing down from Red Alert.', color: 'border-gray-500', isPlayerSource: false });
        }
    }

    // 8. Increment turn and add logs
    nextState.turn++;
    logQueue.forEach(log => {
        nextState.logs.push({
            id: uniqueId(),
            turn: nextState.turn,
            ...log
        });
    });

    if (nextState.logs.length > 200) {
        nextState.logs = nextState.logs.slice(nextState.logs.length - 200);
    }

    return {
        nextGameState: nextState,
        newNavigationTarget,
        newSelectedTargetId,
    };
};
