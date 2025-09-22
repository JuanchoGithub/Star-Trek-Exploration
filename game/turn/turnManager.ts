import type { GameState, PlayerTurnActions, QuadrantPosition, Ship, LogEntry, TorpedoProjectile, Shuttle } from '../../types';
import { processPlayerTurn } from './player';
import { processAITurns } from './aiProcessor';
import { uniqueId } from '../utils/helpers';
import { PLAYER_LOG_COLOR, SYSTEM_LOG_COLOR } from '../../assets/configs/logColors';
import { calculateDistance } from '../utils/ai';
import { applyTorpedoDamage } from '../utils/combat';

const addLogEntry = (state: GameState, logData: Omit<LogEntry, 'id' | 'turn'>): void => {
    state.logs.push({
        id: uniqueId(),
        turn: state.turn,
        ...logData,
    });
};

const processEndOfTurnSystems = (state: GameState): void => {
    const allShips = [state.player.ship, ...state.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
    
    allShips.forEach(ship => {
        // --- Captured Ship Repair Logic ---
        if (ship.captureInfo) {
            const turnsSinceCapture = state.turn - ship.captureInfo.repairTurn;
            if (turnsSinceCapture > 0 && turnsSinceCapture <= 5) {
                const hullRepair = ship.maxHull * 0.1;
                ship.hull = Math.min(ship.maxHull, ship.hull + hullRepair);
                const subsystems = Object.values(ship.subsystems);
                const damagedSubsystems = subsystems.filter(s => s.health < s.maxHealth);
                if (damagedSubsystems.length > 0) {
                    const systemToRepair = damagedSubsystems[Math.floor(Math.random() * damagedSubsystems.length)];
                    systemToRepair.health = Math.min(systemToRepair.maxHealth, systemToRepair.health + 20);
                }
                if (ship.captureInfo.captorId === 'player') {
                     addLogEntry(state, { sourceId: 'system', sourceName: 'Engineering Report', message: `Repair teams are making progress on the captured ${ship.name}. Hull at ${Math.round((ship.hull/ship.maxHull)*100)}%.`, isPlayerSource: false, color: SYSTEM_LOG_COLOR });
                }
            } else if (turnsSinceCapture > 5) {
                ship.captureInfo = null;
                if (ship.faction === 'Federation') {
                     addLogEntry(state, { sourceId: 'system', sourceName: 'Engineering Report', message: `The captured ${ship.name} is now fully operational and under our command!`, isPlayerSource: false, color: PLAYER_LOG_COLOR });
                }
            }
        }
        
        // --- System Failure Cascade Logic ---
        if (ship.subsystems.engines.health <= 0 && ship.engineFailureTurn === null) {
            ship.engineFailureTurn = state.turn;
            addLogEntry(state, { sourceId: ship.id, sourceName: ship.name, message: `${ship.name}'s engines have failed! They are dead in space.`, isPlayerSource: ship.id === 'player', color: 'border-orange-500' });
        }
        if (ship.engineFailureTurn !== null) {
            // Ship with failed engines doesn't regenerate energy.
            if (ship.energy.current <= 0 && ship.lifeSupportFailureTurn === null) {
                ship.lifeSupportFailureTurn = state.turn;
                 addLogEntry(state, { sourceId: ship.id, sourceName: ship.name, message: `${ship.name}'s main power has failed! Switching to emergency life support (2 turns).`, isPlayerSource: ship.id === 'player', color: 'border-orange-500' });
            }
        }
        if (ship.lifeSupportFailureTurn !== null && state.turn > ship.lifeSupportFailureTurn + 2) {
            if (!ship.isDerelict) {
                ship.isDerelict = true;
                 addLogEntry(state, { sourceId: ship.id, sourceName: ship.name, message: `Emergency life support on ${ship.name} has failed! The ship is now a derelict hulk.`, isPlayerSource: ship.id === 'player', color: 'border-red-600' });
            }
        }

        // --- Status Effect Processing ---
        ship.statusEffects = ship.statusEffects.filter(effect => {
            if (effect.type === 'plasma_burn') {
                ship.hull = Math.max(0, ship.hull - effect.damage);
                 addLogEntry(state, { sourceId: ship.id, sourceName: ship.name, message: `Plasma fire on the hull deals ${effect.damage} damage!`, isPlayerSource: ship.id === 'player', color: 'border-orange-500' });
                effect.turnsRemaining--;
                return effect.turnsRemaining > 0;
            }
            return true;
        });

        // --- Shield Regeneration ---
        if ((ship.id === 'player' && state.redAlert) || (ship.id !== 'player' && ship.shields > 0)) {
            if (ship.subsystems.shields.health > 0) {
                const regenAmount = (ship.energyAllocation.shields / 100) * (ship.maxShields * 0.1);
                const shieldEfficiency = ship.subsystems.shields.health / ship.subsystems.shields.maxHealth;
                const effectiveRegen = regenAmount * shieldEfficiency;
                ship.shields = Math.min(ship.maxShields, ship.shields + effectiveRegen);
            }
        } else if (ship.id === 'player' && !state.redAlert) {
            // Player energy regen
            const regenAmount = ship.energy.max * 0.1;
            ship.energy.current = Math.min(ship.energy.max, ship.energy.current + regenAmount);
        }

        // --- Repair Target Processing ---
        if (ship.repairTarget) {
            const repairCost = 10 * ship.energyModifier;
            if (ship.energy.current >= repairCost) {
                ship.energy.current -= repairCost;
                if (ship.repairTarget === 'hull') {
                    ship.hull = Math.min(ship.maxHull, ship.hull + 5);
                } else {
                    const subsystem = ship.subsystems[ship.repairTarget];
                    if (subsystem) {
                        subsystem.health = Math.min(subsystem.maxHealth, subsystem.health + 10);
                    }
                }
            }
        }

        // --- Cloak Cooldown ---
        if (ship.cloakCooldown > 0) {
            ship.cloakCooldown--;
        }

        // --- Stun Recovery ---
        ship.isStunned = false;
    });
};

export const resolveTurn = (
    gameState: GameState,
    playerTurnActions: PlayerTurnActions,
    navigationTarget: { x: number; y: number } | null,
    selectedTargetId: string | null
): { nextGameState: GameState; newNavigationTarget: { x: number; y: number } | null, newSelectedTargetId: string | null } => {
    const nextState: GameState = JSON.parse(JSON.stringify(gameState));
    const addLog = (logData: Omit<LogEntry, 'id' | 'turn'>) => addLogEntry(nextState, logData);
    
    // --- Combat Allegiance Assignment ---
    const hostileShips = nextState.currentSector.entities.filter(e => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
    const justEnteredCombat = !gameState.redAlert && hostileShips.length > 0;

    if (justEnteredCombat) {
        nextState.redAlert = true; // Automatically go to red alert
        addLog({ sourceId: 'system', sourceName: 'Tactical Alert', message: 'Hostile ships detected! Assigning combat allegiances.', isPlayerSource: false, color: 'border-red-500' });
        
        const allShips = [nextState.player.ship, ...nextState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
        allShips.forEach(ship => {
            if (ship.id === 'player') {
                ship.allegiance = 'player';
            } else if (ship.faction === 'Federation') {
                ship.allegiance = 'ally';
            } else if (['Klingon', 'Romulan', 'Pirate'].includes(ship.faction)) {
                ship.allegiance = 'enemy';
            } else if (ship.faction === 'Independent') {
                if (nextState.currentSector.factionOwner === 'Federation') {
                    ship.allegiance = 'ally';
                    addLog({ sourceId: ship.id, sourceName: ship.name, message: `The civilian vessel ${ship.name} is siding with the Federation!`, isPlayerSource: false, color: 'border-blue-300' });
                } else {
                    ship.allegiance = 'neutral';
                    addLog({ sourceId: ship.id, sourceName: ship.name, message: `The civilian vessel ${ship.name} is attempting to stay out of the fight.`, isPlayerSource: false, color: 'border-gray-400' });
                }
            } else {
                ship.allegiance = 'neutral';
            }
        });
    }


    const actedShipIds = new Set<string>();

    const playerResult = processPlayerTurn(nextState, playerTurnActions, navigationTarget, selectedTargetId, addLog);
    actedShipIds.add('player');

    // AI Ship Processing
    processAITurns(nextState, {
        addLog: addLog,
        applyPhaserDamage: (target, damage, subsystem, source, state) => [],
        triggerDesperationAnimation: (animation) => {
            nextState.desperationMoveAnimations.push(animation);
        }
    }, actedShipIds);


    // Torpedo Movement & Resolution
    let newProjectiles: TorpedoProjectile[] = [];
    nextState.currentSector.entities = nextState.currentSector.entities.filter(entity => {
        if (entity.type !== 'torpedo_projectile') return true;
        const torpedo = entity as TorpedoProjectile;
        if (torpedo.hull <= 0) { // Check if torpedo was destroyed this turn
            return false;
        }

        const allShips = [nextState.player.ship, ...nextState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
        const target = allShips.find(s => s.id === torpedo.targetId);
        
        if (!target || target.hull <= 0) { // Target destroyed or gone
             addLog({ sourceId: torpedo.sourceId, sourceName: 'Sensors', message: `A torpedo lost its target lock and self-destructed.`, isPlayerSource: false, color: SYSTEM_LOG_COLOR });
             return false;
        }

        for (let i = 0; i < torpedo.speed; i++) {
            if (calculateDistance(torpedo.position, target.position) <= 0) {
                addLog({ sourceId: torpedo.sourceId, sourceName: 'Sensors', message: `${torpedo.name} impacts ${target.name}!`, isPlayerSource: false, color: SYSTEM_LOG_COLOR });
                const combatLogs = applyTorpedoDamage(target, torpedo);
                combatLogs.forEach(log => addLog({ sourceId: torpedo.sourceId, sourceName: 'Damage Control', message: log, isPlayerSource: torpedo.faction === 'Federation', color: SYSTEM_LOG_COLOR }));
                nextState.combatEffects.push({ type: 'torpedo_hit', position: target.position, delay: 0, torpedoType: torpedo.torpedoType });
                return false; // Torpedo is consumed
            }
            torpedo.position = calculateDistance(torpedo.position, target.position) > 0 ? {
                x: torpedo.position.x + Math.sign(target.position.x - torpedo.position.x),
                y: torpedo.position.y + Math.sign(target.position.y - torpedo.position.y)
            } : torpedo.position;
            torpedo.path.push({ ...torpedo.position });
        }
        
        torpedo.stepsTraveled++;
        if (torpedo.stepsTraveled > 15) { // Max range
            return false;
        }
        
        return true;
    });
    nextState.currentSector.entities.push(...newProjectiles);

    // Shuttle Movement & Rescue
    const shuttles = nextState.currentSector.entities.filter(e => e.type === 'shuttle') as Shuttle[];
    if (shuttles.length > 0) {
        const friendlyShips = [nextState.player.ship, ...nextState.currentSector.entities.filter(e => e.type === 'ship' && e.faction === 'Federation')] as Ship[];
        shuttles.forEach(shuttle => {
            const closestFriendly = friendlyShips.sort((a, b) => calculateDistance(shuttle.position, a.position) - calculateDistance(shuttle.position, b.position))[0];
            if (closestFriendly) {
                if (calculateDistance(shuttle.position, closestFriendly.position) <= 1) {
                    addLog({ sourceId: 'system', sourceName: 'Transporter Control', message: `Rescued ${shuttle.crewCount} crew from a shuttle.`, isPlayerSource: false, color: 'border-green-500' });
                    nextState.currentSector.entities = nextState.currentSector.entities.filter(e => e.id !== shuttle.id);
                } else {
                    shuttle.position = {
                        x: shuttle.position.x + Math.sign(closestFriendly.position.x - shuttle.position.x),
                        y: shuttle.position.y + Math.sign(closestFriendly.position.y - shuttle.position.y)
                    };
                }
            }
        });
    }

    // Handle Retreats
    const playerShip = nextState.player.ship;
    if (playerShip.retreatingTurn !== null && playerShip.retreatingTurn <= nextState.turn) {
        addLog({ sourceId: 'player', sourceName: playerShip.name, message: 'Emergency warp engaged!', isPlayerSource: true, color: 'border-blue-400' });
        nextState.isRetreatingWarp = true;
        playerShip.retreatingTurn = null;
    }

    const aiShipsToRetreat = (nextState.currentSector.entities.filter(e => e.type === 'ship' && e.id !== 'player' && e.retreatingTurn !== null && e.retreatingTurn <= nextState.turn) as Ship[]);
    if (aiShipsToRetreat.length > 0) {
        aiShipsToRetreat.forEach(ship => {
            addLog({ sourceId: ship.id, sourceName: ship.name, message: `The ${ship.name} has successfully escaped the sector!`, isPlayerSource: false, color: 'border-yellow-500' });
        });
        nextState.currentSector.entities = nextState.currentSector.entities.filter(e => !aiShipsToRetreat.some(s => s.id === e.id));
    }

    processEndOfTurnSystems(nextState);

    // Ship Cleanup
    nextState.currentSector.entities = nextState.currentSector.entities.filter(e => {
        if (e.type === 'ship' && e.hull <= 0) {
            // Destruction already logged in combat functions
            return false;
        }
        return true;
    });

    nextState.turn++;
    
    // Check win/loss conditions
    const remainingHostiles = nextState.currentSector.entities.filter(e => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
    if (nextState.redAlert && remainingHostiles.length === 0) {
        nextState.redAlert = false;
        addLog({ sourceId: 'system', sourceName: 'Tactical Alert', message: `All hostile targets neutralized. Standing down from Red Alert.`, isPlayerSource: false, color: 'border-green-500' });
    }
    
    if (nextState.player.ship.hull <= 0) {
        nextState.gameOver = true;
        addLog({ sourceId: 'system', sourceName: 'FATAL ERROR', message: `The U.S.S. Endeavour has been destroyed.`, isPlayerSource: true, color: 'border-red-600' });
    }

    return {
        nextGameState: nextState,
        newNavigationTarget: playerResult.newNavigationTarget,
        newSelectedTargetId: playerResult.newSelectedTargetId,
    };
};