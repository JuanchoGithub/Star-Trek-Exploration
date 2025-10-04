
import type { GameState, PlayerTurnActions, Position, Ship, TorpedoProjectile, Mine, AmmoType } from '../../types';
import { processPlayerTurn } from './player';
import { processAITurns } from './aiProcessor';
import { handleShipEndOfTurnSystems, applyResourceChange } from '../utils/energy';
import { applyTorpedoDamage, applyMineDamage } from '../utils/combat';
// FIX: Imported 'handleBoardingTurn' to process derelict capture over multiple turns.
import { handleBoardingTurn } from '../actions/boarding';
// FIX: Imported 'moveOneStep' to calculate torpedo movement.
import { calculateDistance, uniqueId, moveOneStep } from '../utils/ai';
import { torpedoStats } from '../../assets/projectiles/configs/torpedoTypes';
import { isPosInIonStorm, isPosInNebula } from '../utils/sector';
import { SECTOR_HEIGHT, SECTOR_WIDTH } from '../../assets/configs/gameConstants';
import type { LogEntry } from '../../types';

export interface TurnStep {
    updatedState: GameState;
    newNavigationTarget?: Position | null;
    newSelectedTargetId?: string | null;
    delay: number;
}

interface TurnConfig {
    mode: 'game' | 'dogfight' | 'spectate';
    playerTurnActions: PlayerTurnActions;
    navigationTarget: Position | null;
    selectedTargetId: string | null;
}

export function generatePhasedTurn(initialState: GameState, config: TurnConfig): TurnStep[] {
    const turnSteps: TurnStep[] = [];
    const turnEvents: string[] = [];
    const addTurnEvent = (event: string) => turnEvents.push(event);

    let nextState: GameState = JSON.parse(JSON.stringify(initialState));
    nextState.combatEffects = [];
    nextState.desperationMoveAnimations = [];

    const addLog = (logData: Omit<LogEntry, 'id' | 'turn'>) => {
        const newLog: LogEntry = {
            id: uniqueId(),
            turn: nextState.turn,
            ...logData
        };
        nextState.logs.push(newLog);
    };

    const actions = {
        addLog,
        fireBeamWeapon: (target: Ship, weapon: any, subsystem: any, source: Ship, state: GameState) => {
            // This is a stub. The real firing logic is in processCommonTurn.
            // But we need to provide it to the AI.
            return null as any; 
        },
        triggerDesperationAnimation: (animation: any) => {
            nextState.desperationMoveAnimations.push(animation);
        },
        addTurnEvent,
    };

    // --- Phase 1: Player Actions (if applicable) ---
    let newNavTarget = config.navigationTarget;
    let newSelectedTargetId = config.selectedTargetId;
    const actedShipIds = new Set<string>();
    
    if (config.mode === 'game' || config.mode === 'dogfight') {
        const playerShip = (config.mode === 'game')
            ? nextState.player.ship
            : nextState.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;

        if (playerShip) {
            const playerResult = processPlayerTurn(nextState, config.playerTurnActions, config.navigationTarget, config.selectedTargetId, addLog, addTurnEvent);
            newNavTarget = playerResult.newNavigationTarget;
            newSelectedTargetId = playerResult.newSelectedTargetId;
            actedShipIds.add(playerShip.id);
        }
    }
    
    turnSteps.push({ updatedState: JSON.parse(JSON.stringify(nextState)), newNavigationTarget: newNavTarget, newSelectedTargetId: newSelectedTargetId, delay: 100 });

    const allShips = [...nextState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
    if (nextState.player.ship && nextState.player.ship.id) {
        if (!allShips.some(s => s.id === nextState.player.ship.id)) {
            allShips.push(nextState.player.ship);
        }
    }

    // --- Phase 2: AI Actions ---
    const claimedCellsThisTurn = new Set<string>();
    
    // Player claims their final spot first.
    const finalPlayerShip = allShips.find(s => s.id === 'player' || s.allegiance === 'player');
    if (finalPlayerShip) {
        claimedCellsThisTurn.add(`${finalPlayerShip.position.x},${finalPlayerShip.position.y}`);
    }
    
    processAITurns(nextState, initialState, actions, actedShipIds, allShips, config.mode, claimedCellsThisTurn);
    turnSteps.push({ updatedState: JSON.parse(JSON.stringify(nextState)), delay: 100 });


    // --- Phase 3: Torpedo Movement & Point Defense ---
    const torpedoes = nextState.currentSector.entities.filter(e => e.type === 'torpedo_projectile') as TorpedoProjectile[];
    const pointDefenseTargets: { ship: Ship, torpedo: TorpedoProjectile }[] = [];

    allShips.forEach(ship => {
        if (ship.pointDefenseEnabled && ship.subsystems.pointDefense.health > 0) {
            const incoming = torpedoes.filter(t => t.targetId === ship.id && calculateDistance(ship.position, t.position) <= 1);
            if (incoming.length > 0) {
                // Prioritize most dangerous torpedo
                incoming.sort((a, b) => b.damage - a.damage);
                pointDefenseTargets.push({ ship, torpedo: incoming[0] });
            }
        }
    });

    if (pointDefenseTargets.length > 0) {
        pointDefenseTargets.forEach(({ ship, torpedo }) => {
            addTurnEvent(`PD: '${ship.name}' -> [${torpedo.id}]`);
            const hitChance = ship.subsystems.pointDefense.health / ship.subsystems.pointDefense.maxHealth;
            if (Math.random() < hitChance) {
                addTurnEvent(`INTERCEPTED: [${torpedo.id}]`);
                nextState.currentSector.entities = nextState.currentSector.entities.filter(e => e.id !== torpedo.id);
                nextState.combatEffects.push({ type: 'point_defense', sourceId: ship.id, targetPosition: torpedo.position, faction: ship.faction, delay: 0 });
            }
        });
        turnSteps.push({ updatedState: JSON.parse(JSON.stringify(nextState)), delay: 400 });
    }

    const remainingTorpedoes = nextState.currentSector.entities.filter(e => e.type === 'torpedo_projectile') as TorpedoProjectile[];
    if (remainingTorpedoes.length > 0) {
        const asteroidPositions = new Set(nextState.currentSector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
        const destroyedTorpedoIds = new Set<string>();

        const maxSpeed = Math.max(0, ...remainingTorpedoes.map(t => t.speed));
        for (let i = 0; i < maxSpeed; i++) {
            remainingTorpedoes.forEach(torpedo => {
                if (i >= torpedo.speed || destroyedTorpedoIds.has(torpedo.id)) return;

                const target = allShips.find(s => s.id === torpedo.targetId);
                if (target) {
                    const from = { ...torpedo.position };
                    torpedo.position = moveOneStep(torpedo.position, target.position);
                    torpedo.path.push({ ...torpedo.position });
                    addTurnEvent(`MOVE TORPEDO: [${torpedo.id}] from (${from.x},${from.y}) to (${torpedo.position.x},${torpedo.position.y})`);

                    if (asteroidPositions.has(`${torpedo.position.x},${torpedo.position.y}`)) {
                        if (Math.random() < 0.40) { // 40% chance of destruction
                            destroyedTorpedoIds.add(torpedo.id);
                            addLog({
                                sourceId: 'system',
                                sourceName: 'Asteroid Field',
                                message: `A ${torpedo.name} was destroyed by a collision!`,
                                color: 'border-gray-500',
                                isPlayerSource: false,
                                category: 'combat'
                            });
                            nextState.combatEffects.push({
                                type: 'torpedo_hit',
                                position: { ...torpedo.position },
                                delay: 0,
                                torpedoType: torpedo.torpedoType
                            });
                            addTurnEvent(`INTERCEPTED: [${torpedo.id}] by Asteroid`);
                        }
                    }
                }
            });
        }
        
        if (destroyedTorpedoIds.size > 0) {
            nextState.currentSector.entities = nextState.currentSector.entities.filter(e => !destroyedTorpedoIds.has(e.id));
        }

        turnSteps.push({ updatedState: JSON.parse(JSON.stringify(nextState)), delay: 400 });
    }


    // --- Phase 4: Combat Resolution (Torpedo Hits) ---
    const finalTorpedoes = nextState.currentSector.entities.filter(e => e.type === 'torpedo_projectile') as TorpedoProjectile[];
    const torpedoHits: {torpedo: TorpedoProjectile, target: Ship}[] = [];

    finalTorpedoes.forEach(torpedo => {
        const target = allShips.find(s => s.id === torpedo.targetId);
        if (target && calculateDistance(torpedo.position, target.position) <= 0) {
            torpedoHits.push({ torpedo, target });
        }
    });

    if (torpedoHits.length > 0) {
        torpedoHits.forEach(({ torpedo, target }) => {
            const sourceShip = allShips.find(s => s.id === torpedo.sourceId);
            const logMessage = applyTorpedoDamage(target, torpedo, sourceShip || null);
            addLog({ sourceId: sourceShip?.id || 'unknown', sourceName: sourceShip?.name || 'Unknown', sourceFaction: sourceShip?.faction, message: logMessage, color: sourceShip?.logColor || 'border-gray-500', isPlayerSource: false, category: 'combat' });
            nextState.combatEffects.push({ type: 'torpedo_hit', position: { ...target.position }, delay: 0, torpedoType: torpedo.torpedoType });
            addTurnEvent(`HIT TORPEDO: [${torpedo.id}] -> '${target.name}'`);
        });
        nextState.currentSector.entities = nextState.currentSector.entities.filter(e => !torpedoHits.some(hit => hit.torpedo.id === e.id));
        turnSteps.push({ updatedState: JSON.parse(JSON.stringify(nextState)), delay: 800 });
    }
    
    // --- Phase 5: Mine Detonation ---
    const mines = nextState.currentSector.entities.filter(e => e.type === 'mine');
    if (mines.length > 0) {
        const shipsToUpdate = allShips.filter(s => s.hull > 0);
        shipsToUpdate.forEach(ship => {
            const mine = mines.find(m => m.position.x === ship.position.x && m.position.y === ship.position.y);
            if (mine) {
                const logMessage = applyMineDamage(ship, mine as any);
                addLog({ sourceId: mine.id, sourceName: mine.name, sourceFaction: mine.faction, message: logMessage, color: 'border-orange-500', isPlayerSource: false, category: 'combat' });
                nextState.combatEffects.push({ type: 'torpedo_hit', position: { ...ship.position }, delay: 0, torpedoType: (mine as any).torpedoType });
                nextState.currentSector.entities = nextState.currentSector.entities.filter(e => e.id !== mine.id);
            }
        });
        turnSteps.push({ updatedState: JSON.parse(JSON.stringify(nextState)), delay: 800 });
    }


    // --- Phase 6: End of Turn Systems & Retreat ---
    const shipsAfterCombat = [...nextState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
    if (nextState.player.ship && nextState.player.ship.id) {
        const playerInList = shipsAfterCombat.some(s => s.id === nextState.player.ship.id);
        if (!playerInList) {
            shipsAfterCombat.push(nextState.player.ship);
        }
    }
    
    shipsAfterCombat.forEach(ship => {
        if (ship.hull <= 0) return;
        
        // ION STORM EFFECTS
        if (isPosInIonStorm(ship.position, nextState.currentSector)) {
            const effects = [
                { name: 'hull_damage', chance: 0.10, details: '5% Hull Damage' },
                { name: 'shields_offline', chance: 0.05, details: 'Shields Offline (2 Turns)' },
                { name: 'shield_damage', chance: 0.15, details: '10% Shield System Damage' },
                { name: 'weapons_offline', chance: 0.07, details: 'Weapons Offline (2 Turns)' },
                { name: 'energy_depleted', chance: 0.07, details: 'Reserve Power Depleted' },
                { name: 'engines_offline', chance: 0.23, details: 'Impulse Engines Disabled (1 Turn)' },
                { name: 'phaser_damage_down', chance: 0.55, details: 'Phaser Damage Reduced (2 Turns)' },
                { name: 'torpedo_misfire', chance: 0.70, details: 'Torpedo Misfire' },
            ];

            const successfulChecks = [];
            let logDetails = 'Ion Storm Discharge Analysis:';

            for (const effect of effects) {
                const roll = Math.random();
                const success = roll < effect.chance;
                logDetails += `\n  - ${effect.details}: Roll ${roll.toFixed(2)} vs ${effect.chance} -> ${success ? '<b class="text-green-400">PASS</b>' : '<span class="text-red-400">FAIL</span>'}`;
                if (success) {
                    successfulChecks.push(effect);
                }
            }

            if (successfulChecks.length > 0) {
                const chosenEffect = successfulChecks[Math.floor(Math.random() * successfulChecks.length)];
                logDetails += `\n<b class="text-yellow-400">Random Discharge Selected: ${chosenEffect.details}</b>`;
                
                let effectLog = '';
                switch (chosenEffect.name) {
                    case 'hull_damage':
                        const hullDamage = Math.round(ship.maxHull * 0.05);
                        ship.hull = Math.max(0, ship.hull - hullDamage);
                        effectLog = `The ship is battered by ionic stress, taking ${hullDamage} hull damage.`;
                        break;
                    case 'shields_offline':
                        ship.shields = 0;
                        ship.shieldReactivationTurn = nextState.turn + 2;
                        effectLog = `The shield emitters are overloaded and go offline! Recalibrating for 2 turns.`;
                        break;
                    case 'shield_damage':
                        const shieldSysDamage = Math.round(ship.subsystems.shields.maxHealth * 0.10);
                        ship.subsystems.shields.health = Math.max(0, ship.subsystems.shields.health - shieldSysDamage);
                        effectLog = `Shield generators take ${shieldSysDamage} damage from a power surge.`;
                        break;
                    case 'weapons_offline':
                        ship.weaponFailureTurn = nextState.turn + 2;
                        effectLog = `Weapon control systems are short-circuited! Weapons offline for 2 turns.`;
                        break;
                    case 'energy_depleted':
                        ship.energy.current = 0;
                        effectLog = `The ship's reserve power is completely drained by a massive discharge!`;
                        break;
                    case 'engines_offline':
                        ship.engineFailureTurn = nextState.turn + 1;
                        effectLog = `Impulse engines are disabled by the storm! Movement will be impossible next turn.`;
                        break;
                    case 'phaser_damage_down':
                        const existingShock = ship.statusEffects.find(e => e.type === 'ion_shock');
                        if (existingShock) {
                            existingShock.turnsRemaining = 2;
                        } else {
                            ship.statusEffects.push({ type: 'ion_shock', phaserDamageModifier: 0.3, turnsRemaining: 2 });
                        }
                        effectLog = `Phaser emitters are ionized! Damage reduced by 70% for 2 turns.`;
                        break;
                    case 'torpedo_misfire':
                        if (ship.torpedoes.current > 0) {
                            ship.torpedoes.current--;
                            
                            const ammoTypesWithAmmo = Object.keys(ship.ammo).filter(key => ship.ammo[key as AmmoType]!.current > 0) as AmmoType[];
                            if(ammoTypesWithAmmo.length > 0) {
                                const randomAmmoType = ammoTypesWithAmmo[Math.floor(Math.random() * ammoTypesWithAmmo.length)];
                                ship.ammo[randomAmmoType]!.current--;
                            }
        
                            const misfireDamage = 25;
                            ship.hull = Math.max(0, ship.hull - misfireDamage);
                            effectLog = `A torpedo casing in the launch bay is detonated by the storm! The ship takes ${misfireDamage} hull damage.`;
                        } else {
                            effectLog = `An energy surge hits the torpedo bay, but it is empty.`;
                        }
                        break;
                }
                logDetails += `\n<b class="text-orange-400">Result: ${effectLog}</b>`;

            } else {
                logDetails += '\n<i class="text-gray-400">The ship weathered the storm this turn with no new system failures.</i>';
            }
            
            addLog({
                sourceId: ship.id, 
                sourceName: ship.name, 
                sourceFaction: ship.faction,
                message: logDetails, 
                isPlayerSource: false, 
                color: ship.logColor,
                category: 'system'
            });
        }
        
        // Boarding progression
        if (ship.captureInfo) {
            const boardingResult = handleBoardingTurn(ship, nextState);
            boardingResult.logs.forEach(log => {
                addLog({ sourceId: ship.captureInfo?.captorId || 'system', sourceName: 'Salvage Team', sourceFaction: ship.faction, message: log.message, isPlayerSource: false, color: log.color, category: log.category });
            });
        }

        const systemLogs = handleShipEndOfTurnSystems(ship, nextState, addTurnEvent);
        systemLogs.forEach(log => addLog(log));
    });
    
    // Retreat check
    if (nextState.player.ship.retreatingTurn === nextState.turn) {
        nextState.isRetreatingWarp = true;
        addLog({ sourceId: 'player', sourceName: nextState.player.ship.name, sourceFaction: 'Federation', message: 'Emergency warp engaged!', isPlayerSource: true, color: 'border-blue-400', category: 'special' });
    }

    nextState.turn++;
    nextState.turnEvents = turnEvents;
    turnSteps.push({ updatedState: JSON.parse(JSON.stringify(nextState)), delay: 100 });

    return turnSteps;
}