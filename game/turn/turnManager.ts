

import type { GameState, PlayerTurnActions, Ship, LogEntry, TorpedoProjectile, SectorState, ShipSubsystems } from '../../types';
import { processPlayerTurn } from './player';
import { processAITurns } from './aiProcessor';
import { AIActions } from '../ai/FactionAI';
import { applyTorpedoDamage, applyPhaserDamage } from '../utils/combat';
import { calculateDistance, moveOneStep, uniqueId } from '../utils/ai';
import { PLAYER_LOG_COLOR, SYSTEM_LOG_COLOR } from '../../assets/configs/logColors';
import { isPosInNebula } from '../utils/sector';

const processEndOfTurnSystems = (state: GameState, addLog: (logData: Omit<LogEntry, 'id' | 'turn'>) => void): void => {
    const allShips = [state.player.ship, ...state.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
    
    allShips.forEach(ship => {
        if (ship.hull <= 0) return;

        // Repair Target
        if (ship.repairTarget) {
            let repairAmount = 5;
            const energyCost = 5 * ship.energyModifier;
            if (ship.energy.current >= energyCost) {
                ship.energy.current -= energyCost;

                if (ship.repairTarget === 'hull') {
                    ship.hull = Math.min(ship.maxHull, ship.hull + repairAmount);
                } else {
                    const subsystem = ship.subsystems[ship.repairTarget];
                    if (subsystem) {
                        subsystem.health = Math.min(subsystem.maxHealth, subsystem.health + repairAmount);
                    }
                }
            }
        }
        
        // Status Effects (e.g., Plasma Burn)
        ship.statusEffects = ship.statusEffects.filter(effect => {
            if (effect.type === 'plasma_burn') {
                ship.hull = Math.max(0, ship.hull - effect.damage);
                addLog({ sourceId: ship.id, sourceName: 'Damage Control', message: `${ship.name} takes ${effect.damage} damage from plasma fire!`, color: 'border-orange-400', isPlayerSource: ship.id === 'player' });
                effect.turnsRemaining--;
                return effect.turnsRemaining > 0;
            }
            return false;
        });

        // Cooldowns
        if (ship.cloakCooldown > 0) {
            ship.cloakCooldown--;
        }

        // Captured ship repair logic
        if (ship.captureInfo) {
            const turnsSinceCapture = state.turn - ship.captureInfo.repairTurn;
            if (turnsSinceCapture > 0 && turnsSinceCapture <= 5) {
                ship.hull = Math.min(ship.maxHull, ship.hull + ship.maxHull * 0.1);
                const subsystems = Object.values(ship.subsystems);
                const damagedSubsystems = subsystems.filter(s => s.health < s.maxHealth);
                if (damagedSubsystems.length > 0) {
                    const systemToRepair = damagedSubsystems[0];
                    systemToRepair.health = Math.min(systemToRepair.maxHealth, systemToRepair.health + 20);
                }
                if(ship.id !== 'player') addLog({ sourceId: 'system', sourceName: 'Engineering', message: `Repair teams are making progress on the captured ${ship.name}.`, isPlayerSource: false, color: SYSTEM_LOG_COLOR });
            } else if (turnsSinceCapture > 5) {
                ship.captureInfo = null;
                if(ship.id !== 'player') addLog({ sourceId: 'system', sourceName: 'Engineering', message: `The captured ${ship.name} is now fully operational!`, isPlayerSource: false, color: PLAYER_LOG_COLOR });
            }
        }
        
        // System Failure Cascade Logic
        if (ship.subsystems.engines.health < ship.subsystems.engines.maxHealth * 0.5 && ship.engineFailureTurn === null) {
            ship.engineFailureTurn = state.turn;
            addLog({ sourceId: ship.id, sourceName: ship.name, message: `${ship.name}'s engines have failed! They are dead in space.`, isPlayerSource: ship.id === 'player', color: 'border-orange-500' });
        }
        if (ship.engineFailureTurn !== null) {
            if (ship.energy.current <= 0 && ship.lifeSupportFailureTurn === null) {
                ship.lifeSupportFailureTurn = state.turn;
                addLog({ sourceId: ship.id, sourceName: ship.name, message: `${ship.name}'s main power has failed! Switching to emergency life support (2 turns).`, isPlayerSource: ship.id === 'player', color: 'border-orange-500' });
            }
        }
        if (ship.lifeSupportFailureTurn !== null && state.turn > ship.lifeSupportFailureTurn + 2) {
            if (!ship.isDerelict) {
                ship.isDerelict = true;
                addLog({ sourceId: ship.id, sourceName: ship.name, message: `Emergency life support on ${ship.name} has failed! The ship is now a derelict hulk.`, isPlayerSource: ship.id === 'player', color: 'border-red-600' });
            }
        }
        
        // Shield & Energy Regeneration/Drain
        const isHostile = ship.allegiance === 'enemy' || state.currentSector.entities.some(e => e.type === 'ship' && e.faction !== ship.faction);
        const redAlertActive = (ship.id === 'player' && state.redAlert) || (ship.id !== 'player' && isHostile);

        if (redAlertActive) {
            if (ship.shields < ship.maxShields && ship.subsystems.shields.health > 0) {
                const regenAmount = (ship.energyAllocation.shields / 100) * (ship.maxShields * 0.1);
                const shieldEfficiency = ship.subsystems.shields.health / ship.subsystems.shields.maxHealth;
                const effectiveRegen = regenAmount * shieldEfficiency;
                ship.shields = Math.min(ship.maxShields, ship.shields + effectiveRegen);
            }

            // Energy Drain for Red Alert & other systems
            let drain = (2 * ship.energyModifier); // Base upkeep
            if (ship.evasive) drain += (5 * ship.energyModifier);
            if (ship.pointDefenseEnabled) drain += (10 * ship.energyModifier);
            if (ship.repairTarget) drain += (5 * ship.energyModifier);

            ship.energy.current = Math.max(0, ship.energy.current - drain);

        } else {
             // Energy Regen when not in Red Alert
             ship.energy.current = Math.min(ship.energy.max, ship.energy.current + 10);
        }
    });
};

export const resolveTurn = (
    gameState: GameState,
    playerTurnActions: PlayerTurnActions,
    navigationTarget: { x: number; y: number } | null,
    selectedTargetId: string | null
) => {
    const nextState: GameState = JSON.parse(JSON.stringify(gameState));
    const logs: Omit<LogEntry, 'id' | 'turn'>[] = [];
    const addLog = (logData: Omit<LogEntry, 'id' | 'turn'>) => logs.push(logData);

    // --- Allegiance Assignment on Combat Start ---
    const allShipRefs = [
        nextState.player.ship, 
        ...nextState.currentSector.entities.filter(e => e.type === 'ship')
    ] as Ship[];

    const needsAssignment = allShipRefs.some(s => s.allegiance === undefined);
    const hasHostiles = allShipRefs.some(s => ['Klingon', 'Romulan', 'Pirate'].includes(s.faction));

    if ((nextState.redAlert || hasHostiles) && needsAssignment) {
        addLog({ sourceId: 'system', sourceName: 'Tactical Alert', message: 'Hostile ships detected! Assigning combat allegiances.', isPlayerSource: false, color: SYSTEM_LOG_COLOR });
        
        allShipRefs.forEach(ship => {
            if (ship.id === 'player') {
                ship.allegiance = 'player';
            } else if (ship.faction === 'Federation') {
                ship.allegiance = 'ally';
            } else if (['Klingon', 'Romulan', 'Pirate'].includes(ship.faction)) {
                ship.allegiance = 'enemy';
            } else {
                ship.allegiance = 'neutral';
            }
        });
    }
    // --- End Allegiance Assignment ---

    const actedShipIds = new Set<string>();
    
    // Process player turn
    const playerResult = processPlayerTurn(nextState, playerTurnActions, navigationTarget, selectedTargetId, addLog);
    actedShipIds.add('player');

    // Setup AI Actions
    const aiActions: AIActions = {
        addLog,
        applyPhaserDamage: (target: Ship, damage: number, subsystem: keyof ShipSubsystems | null, source: Ship, state: GameState) => {
            const phaserLogs = applyPhaserDamage(target, damage, subsystem, source, state);
            return phaserLogs;
        },
        triggerDesperationAnimation: (animation) => nextState.desperationMoveAnimations.push(animation),
    };
    
    // Process AI turns
    processAITurns(nextState, aiActions, actedShipIds);

    // Torpedo Movement & Resolution
    nextState.currentSector.entities = nextState.currentSector.entities.filter(entity => {
        if (entity.type !== 'torpedo_projectile') return true;
        const torpedo = entity as TorpedoProjectile;
        const target = [...nextState.currentSector.entities, nextState.player.ship].find(s => s.id === torpedo.targetId) as Ship | undefined;
        
        if (!target || target.hull <= 0) {
            addLog({ sourceId: torpedo.sourceId, sourceName: 'Sensors', message: `A torpedo lost its target lock and self-destructed.`, isPlayerSource: false, color: SYSTEM_LOG_COLOR });
            return false;
        }

        for (let i = 0; i < torpedo.speed; i++) {
            if (calculateDistance(torpedo.position, target.position) <= 0) {
                 const combatLogs = applyTorpedoDamage(target, torpedo);
                 combatLogs.forEach(log => addLog({ sourceId: torpedo.sourceId, sourceName: 'Combat Log', message: log, isPlayerSource: false, color: 'border-gray-500' }));
                 nextState.combatEffects.push({ type: 'torpedo_hit', position: target.position, delay: 0, torpedoType: torpedo.torpedoType });
                return false;
            }
             torpedo.position = moveOneStep(torpedo.position, target.position);
            torpedo.path.push({ ...torpedo.position });
        }
        return true;
    });

    // End of Turn System processing
    processEndOfTurnSystems(nextState, addLog);

    // FIX: Replaced unsafe filter with a type-safe check to correctly remove destroyed entities.
    // Cleanup destroyed ships and torpedoes
    nextState.currentSector.entities = nextState.currentSector.entities.filter(e => {
        if (e.type === 'ship' || e.type === 'starbase' || e.type === 'torpedo_projectile') {
            return e.hull > 0;
        }
        return true;
    });

    // Add new logs to game state
    nextState.logs.push(...logs.map(log => ({ ...log, id: uniqueId(), turn: nextState.turn })));

    // Increment turn
    nextState.turn++;

    // Check for game over
    if (nextState.player.ship.hull <= 0) {
        nextState.gameOver = true;
        addLog({ sourceId: 'system', sourceName: 'System', message: 'U.S.S. Endeavour has been destroyed. Game Over.', isPlayerSource: false, color: 'border-red-600' });
    }

    return {
        nextGameState: nextState,
        newNavigationTarget: playerResult.newNavigationTarget,
        newSelectedTargetId: playerResult.newSelectedTargetId,
    };
};