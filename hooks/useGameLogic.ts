import { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { GameState, QuadrantPosition, Ship, SectorState, AwayMissionTemplate, ActiveHail, ActiveCounselSession, BridgeOfficer, OfficerAdvice, Entity, Position, PlayerTurnActions, EventTemplate, EventTemplateOption, EventBeacon, PlanetClass, CombatEffect, TorpedoProjectile, ShipSubsystems, Planet, Starbase, LogEntry, FactionOwner, ShipRole, ActiveAwayMission, AwayMissionOutcome, ActiveAwayMissionOption, ResourceType } from '../types';
import { awayMissionTemplates, hailResponses, counselAdvice, eventTemplates } from '../assets/content';
import { planetNames } from '../assets/planets/configs/planetNames';
import { planetClasses, planetTypes } from '../assets/planets/configs/planetTypes';
import { shipNames } from '../assets/ships/configs/shipNames';
import { shipRoleStats } from '../assets/ships/configs/shipRoleStats';
import { SECTOR_WIDTH, SECTOR_HEIGHT, QUADRANT_SIZE, SAVE_GAME_KEY } from '../assets/configs/gameConstants';
import { PLAYER_LOG_COLOR, SYSTEM_LOG_COLOR, ENEMY_LOG_COLORS } from '../assets/configs/logColors';

// Helper to generate a unique ID
const uniqueId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to calculate Chebyshev distance on the grid
const calculateDistance = (pos1: Position, pos2: Position) => {
    return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
};

// Helper to move one step towards a target
const moveOneStep = (start: Position, end: Position): Position => {
    const newPos = { ...start };
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    if (Math.abs(dx) > Math.abs(dy)) {
        newPos.x += Math.sign(dx);
    } else if (dy !== 0) {
        newPos.y += Math.sign(dy);
    } else if (dx !== 0) {
        newPos.x += Math.sign(dx);
    }
    return newPos;
};

// Seeded PRNG helpers
const cyrb53 = (str: string, seed = 0): number => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const seededRandom = (seed: number): (() => number) => {
    let state = seed;
    return function() {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
    };
};

// Helper for player energy consumption with dilithium backup
const consumeEnergy = (ship: Ship, amount: number): { success: boolean, logs: string[] } => {
    const logs: string[] = [];
    if (ship.energy.current >= amount) {
        ship.energy.current -= amount;
        return { success: true, logs };
    }

    // Not enough initial power.
    const initialEnergy = ship.energy.current;
    const remainingCost = amount - initialEnergy;

    if (ship.dilithium.current <= 0) {
        logs.push(`Action failed: Insufficient reserve power and no Dilithium backup.`);
        return { success: false, logs };
    }

    // Use dilithium
    ship.energy.current = 0; // Use up what was left
    ship.dilithium.current--;
    const rechargedEnergy = ship.energy.max; // Full recharge
    logs.push(`CRITICAL: Drained remaining ${initialEnergy} power. Rerouting 1 Dilithium to batteries. Power fully restored.`);

    // Apply subsystem damage
    const subsystems: (keyof ShipSubsystems)[] = ['weapons', 'engines', 'shields', 'transporter'];
    const randomSubsystemKey = subsystems[Math.floor(Math.random() * subsystems.length)];
    const targetSubsystem = ship.subsystems[randomSubsystemKey];
    if (targetSubsystem.maxHealth > 0) {
        const damage = 5 + Math.floor(Math.random() * 6);
        targetSubsystem.health = Math.max(0, targetSubsystem.health - damage);
        logs.push(`WARNING: The power surge caused ${damage} damage to the ${randomSubsystemKey} system!`);
    }

    // Now check if we can cover the remaining cost.
    if (rechargedEnergy >= remainingCost) {
        ship.energy.current = rechargedEnergy - remainingCost;
        return { success: true, logs };
    } else {
        // This is an edge case where the action costs more than a full tank of energy plus whatever was left.
        // The action fails, but the dilithium is still spent. The ship is left with full power.
        ship.energy.current = rechargedEnergy;
        logs.push(`Action failed: Power cost is too high even for a dilithium boost. Power restored, but action aborted.`);
        return { success: false, logs };
    }
};

const getFactionOwner = (qx: number, qy: number): FactionOwner => {
    const midX = QUADRANT_SIZE / 2;
    const midY = QUADRANT_SIZE / 2;

    if (qx < midX && qy < midY) return 'Klingon';
    if (qx >= midX && qy < midY) return 'Romulan';
    if (qx < midX && qy >= midY) return 'Federation';
    
    return 'None'; // No Man's Land
};

const generateSectorContent = (sector: SectorState, qx: number, qy: number, availablePlanetNames?: Record<PlanetClass, string[]>, availableShipNames?: Record<string, string[]>, colorIndex?: { current: number }): SectorState => {
    const newEntities: Entity[] = [];
    const entityCount = Math.floor(Math.random() * 4) + 2; // 2 to 5 entities
    const takenPositions = new Set<string>();

    const getUniquePosition = () => {
        let pos;
        let tries = 0;
        do {
            pos = {
                x: Math.floor(Math.random() * SECTOR_WIDTH),
                y: Math.floor(Math.random() * SECTOR_HEIGHT),
            };
            tries++;
        } while (takenPositions.has(`${pos.x},${pos.y}`) && tries < 50);
        takenPositions.add(`${pos.x},${pos.y}`);
        return pos;
    };

    const getUniqueShipName = (faction: string): string => {
        if (availableShipNames && availableShipNames[faction] && availableShipNames[faction].length > 0) {
            const nameList = availableShipNames[faction];
            const nameIndex = Math.floor(Math.random() * nameList.length);
            const name = nameList[nameIndex];
            nameList.splice(nameIndex, 1); // Remove from pool
            return name;
        }
        return `${faction} Vessel ${uniqueId().substr(-4)}`;
    };

    const getNextShipColor = (): string => {
        if (colorIndex) {
            const color = ENEMY_LOG_COLORS[colorIndex.current];
            colorIndex.current = (colorIndex.current + 1) % ENEMY_LOG_COLORS.length;
            return color;
        }
        return ENEMY_LOG_COLORS[0];
    };

    const { factionOwner } = sector;
    const midX = QUADRANT_SIZE / 2;
    const midY = QUADRANT_SIZE / 2;

    let depth = 0;
    if (factionOwner === 'Klingon') depth = (midX - 1 - qx) + (midY - 1 - qy);
    else if (factionOwner === 'Romulan') depth = (qx - midX) + (midY - 1 - qy);
    else if (factionOwner === 'Federation') depth = (midX - 1 - qx) + (qy - midY);

    let mainFaction: Ship['shipModel'] | null = null;
    let pirateChance = 0.1;
    let factionShipChance = 0;
    let starbaseChance = 0;

    switch (factionOwner) {
        case 'Federation':
            mainFaction = 'Federation';
            starbaseChance = 0.2 + depth * 0.05;
            factionShipChance = 0.2; 
            pirateChance = 0.01;
            break;
        case 'Klingon':
            mainFaction = 'Klingon';
            starbaseChance = 0.02 + depth * 0.01;
            factionShipChance = 0.25 + depth * 0.1;
            pirateChance = 0.05;
            break;
        case 'Romulan':
            mainFaction = 'Romulan';
            starbaseChance = 0.02 + depth * 0.01;
            factionShipChance = 0.25 + depth * 0.1;
            pirateChance = 0.05;
            break;
        case 'None':
            pirateChance = 0.4;
            factionShipChance = 0.2;
            break;
    }

    if (Math.random() < starbaseChance) {
        newEntities.push({
            id: uniqueId(), name: `Starbase ${Math.floor(Math.random() * 100) + 1}`, type: 'starbase',
            faction: mainFaction === 'Klingon' || mainFaction === 'Romulan' ? mainFaction : 'Federation', 
            position: getUniquePosition(), scanned: false, hull: 500, maxHull: 500,
        });
    }

    for (let i = 0; i < entityCount; i++) {
        const entityTypeRoll = Math.random();
        const position = getUniquePosition();

        if (entityTypeRoll < 0.1 && newEntities.length > 0) {
            const eventTypes: EventBeacon['eventType'][] = ['derelict_ship', 'distress_call', 'ancient_probe'];
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            newEntities.push({
                id: uniqueId(), name: 'Unidentified Signal', type: 'event_beacon', eventType: eventType,
                faction: 'Unknown', position: position, scanned: false, isResolved: false,
            });
        } else if (entityTypeRoll < 0.4) {
            const planetClass = planetClasses[Math.floor(Math.random() * planetClasses.length)];
            const planetConfig = planetTypes[planetClass];
            
            let name: string;
            if (availablePlanetNames) {
                const nameList = availablePlanetNames[planetConfig.typeName];
                if (nameList && nameList.length > 0) {
                    const nameIndex = Math.floor(Math.random() * nameList.length);
                    name = nameList[nameIndex];
                    nameList.splice(nameIndex, 1);
                } else {
                    name = `Uncharted Planet ${uniqueId().substr(-4)}`;
                }
            } else {
                const nameList = planetNames[planetConfig.typeName] || ['Unknown Planet'];
                name = nameList[Math.floor(Math.random() * nameList.length)];
            }

            newEntities.push({
                id: uniqueId(), name: name, type: 'planet', faction: 'None', position,
                scanned: false, planetClass: planetClass, awayMissionCompleted: false,
            });
        } else if (entityTypeRoll < 0.55) {
             newEntities.push({
                id: uniqueId(), name: 'Asteroid Field', type: 'asteroid_field', faction: 'None',
                position, scanned: true,
            });
        } else {
            let faction: Ship['shipModel'] | null = null;
            const shipRoll = Math.random();

            if (factionOwner === 'None') {
                if (shipRoll < pirateChance) faction = 'Pirate';
                else if (shipRoll < pirateChance + 0.1) faction = 'Klingon';
                else if (shipRoll < pirateChance + 0.15) faction = 'Romulan';
                else if (shipRoll < pirateChance + 0.25) faction = 'Independent';
            } else {
                if (shipRoll < factionShipChance) faction = mainFaction;
                else if (shipRoll < factionShipChance + pirateChance) faction = 'Pirate';
            }

            if (factionOwner === 'Federation' && faction === 'Federation') {
                faction = Math.random() < 0.6 ? 'Federation' : 'Independent';
            }
            
            if (faction) {
                let shipRole: ShipRole;
                let energyAllocation: Ship['energyAllocation'];

                switch(faction) {
                    case 'Klingon':
                    case 'Romulan':
                        shipRole = Math.random() < 0.8 ? 'Cruiser' : 'Escort';
                        energyAllocation = { weapons: 50, shields: 50, engines: 0 };
                        break;
                    case 'Pirate':
                        shipRole = 'Escort';
                        energyAllocation = { weapons: 60, shields: 40, engines: 0 };
                        break;
                    case 'Federation':
                        shipRole = Math.random() < 0.7 ? 'Explorer' : 'Cruiser';
                        energyAllocation = { weapons: 33, shields: 34, engines: 33 };
                        break;
                    case 'Independent':
                    default:
                        shipRole = 'Freighter';
                        faction = 'Independent';
                        energyAllocation = { weapons: 0, shields: 0, engines: 100 };
                        break;
                }
                
                const stats = shipRoleStats[shipRole];
                
                newEntities.push({
                    id: uniqueId(), name: getUniqueShipName(faction), type: 'ship', shipModel: faction, shipRole, faction, position,
                    hull: stats.maxHull, maxHull: stats.maxHull,
                    shields: 0, maxShields: stats.maxShields,
                    energy: { current: stats.energy.max, max: stats.energy.max }, energyAllocation,
                    torpedoes: { current: stats.torpedoes.max, max: stats.torpedoes.max },
                    subsystems: JSON.parse(JSON.stringify(stats.subsystems)),
                    securityTeams: { current: stats.securityTeams.max, max: stats.securityTeams.max },
                    dilithium: { current: 0, max: 0 }, scanned: false, evasive: false, retreatingTurn: null,
                    crewMorale: { current: 100, max: 100 }, repairTarget: null, logColor: getNextShipColor(),
                } as Ship);
            }
        }
    }

    return { ...sector, entities: newEntities, hasNebula: Math.random() < 0.2 };
};

const pregenerateGalaxy = (quadrantMap: SectorState[][]): SectorState[][] => {
    const newMap = JSON.parse(JSON.stringify(quadrantMap));
    const availablePlanetNames: Record<PlanetClass, string[]> = JSON.parse(JSON.stringify(planetNames));
    const availableShipNames: Record<string, string[]> = JSON.parse(JSON.stringify(shipNames));
    const colorIndex = { current: 0 };

    for (let qy = 0; qy < QUADRANT_SIZE; qy++) {
        for (let qx = 0; qx < QUADRANT_SIZE; qx++) {
            const sector = newMap[qy][qx];
            sector.factionOwner = getFactionOwner(qx, qy);
            newMap[qy][qx] = generateSectorContent(sector, qx, qy, availablePlanetNames, availableShipNames, colorIndex);
        }
    }
    return newMap;
};


const createInitialGameState = (): GameState => {
  const playerStats = shipRoleStats.Explorer;
  const playerShip: Ship = {
    id: 'player', name: 'U.S.S. Endeavour', type: 'ship', shipModel: 'Federation', shipRole: 'Explorer',
    faction: 'Federation', position: { x: Math.floor(SECTOR_WIDTH / 2), y: SECTOR_HEIGHT - 2 },
    hull: playerStats.maxHull, maxHull: playerStats.maxHull, shields: 0, maxShields: playerStats.maxShields,
    subsystems: JSON.parse(JSON.stringify(playerStats.subsystems)),
    energy: { current: playerStats.energy.max, max: playerStats.energy.max }, energyAllocation: { weapons: 34, shields: 33, engines: 33 },
    torpedoes: { current: playerStats.torpedoes.max, max: playerStats.torpedoes.max }, dilithium: { current: 20, max: 20 },
    scanned: true, evasive: false, retreatingTurn: null,
    crewMorale: { current: 100, max: 100 }, securityTeams: { current: playerStats.securityTeams.max, max: playerStats.securityTeams.max }, repairTarget: null,
    logColor: PLAYER_LOG_COLOR,
  };

  const playerCrew: BridgeOfficer[] = [
    { id: 'officer-1', name: "Cmdr. T'Vok", role: 'Science', personality: 'Logical' },
    { id: 'officer-2', name: 'Lt. Thorne', role: 'Security', personality: 'Aggressive' },
    { id: 'officer-3', name: 'Lt. Cmdr. Singh', role: 'Engineering', personality: 'Cautious' },
  ];

  let quadrantMap: SectorState[][] = Array.from({ length: QUADRANT_SIZE }, () =>
    Array.from({ length: QUADRANT_SIZE }, () => ({ entities: [], visited: false, hasNebula: false, factionOwner: 'None', isScanned: false }))
  );

  quadrantMap = pregenerateGalaxy(quadrantMap);

  const playerPosition = { qx: 1, qy: 6 };
  
  for (let qy = 0; qy < QUADRANT_SIZE; qy++) {
    for (let qx = 0; qx < QUADRANT_SIZE; qx++) {
        if (quadrantMap[qy][qx].factionOwner === 'Federation') {
            quadrantMap[qy][qx].visited = true;
            quadrantMap[qy][qx].isScanned = true;
        }
    }
  }

  let startSector = quadrantMap[playerPosition.qy][playerPosition.qx];
  startSector.visited = true;
  startSector.isScanned = true;

  if (!startSector.entities.some(e => e.type === 'starbase')) {
    startSector.entities.push({
        id: uniqueId(), name: `Starbase 364`, type: 'starbase', faction: 'Federation',
        position: { x: 2, y: 2 }, scanned: true, hull: 500, maxHull: 500
    });
  }
  startSector.entities = startSector.entities.filter(e => e.faction !== 'Klingon' && e.faction !== 'Romulan' && e.faction !== 'Pirate' && e.type !== 'event_beacon');

  const initialLog: LogEntry = {
      id: uniqueId(), turn: 1, sourceId: 'system', sourceName: "Captain's Log",
      message: "Stardate 47458.2. We have entered the Typhon Expanse.",
      color: SYSTEM_LOG_COLOR, isPlayerSource: false,
  };

  return {
    player: { ship: playerShip, position: playerPosition, crew: playerCrew },
    quadrantMap, currentSector: startSector, turn: 1, logs: [initialLog],
    gameOver: false, gameWon: false, redAlert: false, combatEffects: [],
    isRetreatingWarp: false,
    usedAwayMissionSeeds: [],
    usedAwayMissionTemplateIds: [],
  };
};

const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

const applyPhaserDamage = (
    target: Ship, damage: number, subsystem: 'weapons' | 'engines' | 'shields' | null,
    sourceShip: Ship, gameState: GameState
): string[] => {
    const logs: string[] = [];
    if (target.id === 'player' && !gameState.redAlert) {
        target.shields = 0;
    }

    let hitChance = 0.9;
    if (gameState.currentSector.hasNebula) {
        hitChance *= 0.75;
        logs.push(`Nebula interference is affecting targeting sensors.`);
    }
    if (target.evasive) hitChance *= 0.6;
    if (sourceShip.id === 'player' && sourceShip.evasive) hitChance *= 0.75;
    
    logs.push(`Fires phasers at ${target.name}. Hit chance: ${Math.round(hitChance * 100)}%.`);

    if (Math.random() > hitChance) {
        logs.push(`--> Attack missed! ${target.name} evaded.`);
        return logs;
    }
    
    logs.push(`--> HIT! Initial damage: ${Math.round(damage)}.`);
    
    let effectiveDamage = damage;
    const logModifiers: string[] = [];

    const distance = calculateDistance(sourceShip.position, target.position);
    const MAX_PHASER_RANGE = 6;
    const distanceModifier = Math.max(0.2, 1 - (distance - 1) / (MAX_PHASER_RANGE - 1));
    if (distance > 1) {
        effectiveDamage *= distanceModifier;
        logModifiers.push(`Range x${distanceModifier.toFixed(2)}`);
    }

    if (sourceShip.id === 'player' && subsystem) {
        const targetingInfo = gameState.player.targeting;
        if (targetingInfo && targetingInfo.entityId === target.id && targetingInfo.subsystem === subsystem) {
            const consecutiveTurns = targetingInfo.consecutiveTurns || 1;
            if (consecutiveTurns > 1) {
                const targetingModifier = 1 + (Math.min(4, consecutiveTurns - 1) * 0.25);
                effectiveDamage *= targetingModifier;
                logModifiers.push(`Focus +${((targetingModifier - 1) * 100).toFixed(0)}%`);
            }
        }
    }

    if (logModifiers.length > 0) logs.push(`--> Modifiers: ${logModifiers.join(', ')}. Effective damage: ${Math.round(effectiveDamage)}.`);

    let damageToProcess = effectiveDamage;
    let damageBypassingShields = 0;
    const shieldPercent = target.maxShields > 0 ? target.shields / target.maxShields : 0;

    if (subsystem) {
        const bypassMultiplier = (1 - shieldPercent) ** 2;
        damageBypassingShields = damageToProcess * bypassMultiplier;
        damageToProcess -= damageBypassingShields;
        if (damageBypassingShields > 1) logs.push(`--> Target's weak shields allowed ${Math.round(damageBypassingShields)} damage to bypass defenses!`);
    }

    const absorbedByShields = Math.min(target.shields, damageToProcess);
    if (absorbedByShields > 0) {
        logs.push(`--> Shields absorbed ${Math.round(absorbedByShields)} damage.`);
        target.shields -= absorbedByShields;
        damageToProcess -= absorbedByShields;
    }
    
    const totalPenetratingDamage = damageToProcess + damageBypassingShields;

    if (totalPenetratingDamage > 0) {
        let finalSubsystemDamage = 0;
        let finalHullDamage = 0;

        if (subsystem && target.subsystems[subsystem]) {
            const shieldsAreLow = shieldPercent <= 0.2;
            const subsystemDamageMultiplier = shieldsAreLow ? 0.9 : 0.7;
            
            if (shieldsAreLow) logs.push(`--> Shields are failing! Focusing fire on the ${subsystem}.`);
            
            let subsystemPortion = totalPenetratingDamage * subsystemDamageMultiplier;
            const hullPortion = totalPenetratingDamage * (1 - subsystemDamageMultiplier);
            
            let criticalHitMultiplier = 1.0;
            if (sourceShip.id === 'player') {
                const targetingInfo = gameState.player.targeting;
                if (targetingInfo && targetingInfo.entityId === target.id && targetingInfo.subsystem === subsystem) {
                    if (targetingInfo.consecutiveTurns >= 2) {
                        criticalHitMultiplier = 1.5;
                        logs.push(`--> Direct Hit Bonus! Sustained targeting deals x${criticalHitMultiplier.toFixed(1)} damage to the ${subsystem}!`);
                    }
                }
            }

            finalSubsystemDamage = Math.round(subsystemPortion * criticalHitMultiplier);
            finalHullDamage = Math.round(hullPortion);

        } else {
            finalHullDamage = Math.round(totalPenetratingDamage);
        }

        target.hull = Math.max(0, target.hull - finalHullDamage);
        if (finalSubsystemDamage > 0 && subsystem && target.subsystems[subsystem]) {
            target.subsystems[subsystem].health = Math.max(0, target.subsystems[subsystem].health - finalSubsystemDamage);
        }
        
        const logParts = [];
        if (finalHullDamage > 0) logParts.push(`${finalHullDamage} hull damage`);
        if (finalSubsystemDamage > 0 && subsystem) logParts.push(`${finalSubsystemDamage} damage to ${subsystem}`);

        if (logParts.length > 0) logs.push(`--> ${target.name} takes ${logParts.join(' and ')}.`);
        if (subsystem && target.subsystems[subsystem]?.health === 0) logs.push(`CRITICAL HIT: ${target.name}'s ${subsystem} have been disabled!`);

    } else {
         logs.push(`--> Shields absorbed the entire hit.`);
    }
    return logs;
};


export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>(() => {
        const savedStateJSON = localStorage.getItem(SAVE_GAME_KEY);
        if (savedStateJSON) {
            try {
                const savedState: GameState = JSON.parse(savedStateJSON);
                if (savedState.player && savedState.turn) {
                    // Backwards compatibility for saves
                    if ((savedState.player as any).boardingParty) delete (savedState.player as any).boardingParty;
                    if (!savedState.player.ship.securityTeams) savedState.player.ship.securityTeams = { current: 3, max: 3 };
                    if (savedState.player.ship.repairTarget === undefined) savedState.player.ship.repairTarget = null;
                    if (!savedState.player.ship.subsystems.transporter) savedState.player.ship.subsystems.transporter = { health: 100, maxHealth: 100 };
                    if (!savedState.player.targeting) delete savedState.player.targeting;
                    else if (!savedState.player.targeting.consecutiveTurns) savedState.player.targeting.consecutiveTurns = 1;
                    if (savedState.isRetreatingWarp === undefined) savedState.isRetreatingWarp = false;
                    if (savedState.usedAwayMissionSeeds === undefined) savedState.usedAwayMissionSeeds = [];
                    if (savedState.usedAwayMissionTemplateIds === undefined) savedState.usedAwayMissionTemplateIds = [];
                    
                    // Migration to shipModel and shipRole
                    const migrateShip = (ship: Ship) => {
                        if ((ship as any).shipClass) {
                            ship.shipModel = (ship as any).shipClass;
                            delete (ship as any).shipClass;
                        }
                        if (!ship.shipRole) {
                            let role: ShipRole;
                            let model = ship.shipModel || ship.faction; // Fallback for really old saves
                            switch(model) {
                                case 'Klingon':
                                case 'Romulan':
                                    role = 'Cruiser'; break;
                                case 'Pirate':
                                    role = 'Escort'; break;
                                case 'Federation':
                                    role = 'Explorer'; break;
                                default:
                                    role = 'Freighter'; break;
                            }
                            ship.shipRole = role;
                            const stats = shipRoleStats[role];
                            ship.maxHull = stats.maxHull;
                            ship.hull = Math.min(ship.hull, stats.maxHull);
                            ship.maxShields = stats.maxShields;
                            ship.shields = Math.min(ship.shields, stats.maxShields);
                            ship.energy.max = stats.energy.max;
                            ship.energy.current = Math.min(ship.energy.current, stats.energy.max);
                            ship.torpedoes.max = stats.torpedoes.max;
                            ship.torpedoes.current = Math.min(ship.torpedoes.current, stats.torpedoes.max);

                            const oldSubsystems = JSON.parse(JSON.stringify(ship.subsystems));
                            ship.subsystems = JSON.parse(JSON.stringify(stats.subsystems));
                            (Object.keys(ship.subsystems) as Array<keyof ShipSubsystems>).forEach(key => {
                                if (oldSubsystems[key]) {
                                    ship.subsystems[key].health = Math.min(oldSubsystems[key].health, ship.subsystems[key].maxHealth);
                                }
                            });
                        }
                    };

                    migrateShip(savedState.player.ship);
                    if (!savedState.player.ship.shipModel) savedState.player.ship.shipModel = 'Federation';
                    
                    // Add log colors if missing
                    let colorIndex = 0;
                    savedState.player.ship.logColor = PLAYER_LOG_COLOR;
                    const assignColor = (ship: Ship) => {
                        if (!ship.logColor) {
                           ship.logColor = ENEMY_LOG_COLORS[colorIndex];
                           colorIndex = (colorIndex + 1) % ENEMY_LOG_COLORS.length;
                        }
                    };
                    savedState.quadrantMap.forEach(row => row.forEach(sector => {
                        // Add factionOwner and isScanned if missing
                        if (!sector.factionOwner) {
                            const qx = savedState.quadrantMap[0].findIndex(s => s === sector);
                            const qy = savedState.quadrantMap.findIndex(r => r.includes(sector));
                            if(qx !== -1 && qy !== -1) sector.factionOwner = getFactionOwner(qx, qy);
                            else sector.factionOwner = 'None';
                        }
                        if (sector.isScanned === undefined) {
                            sector.isScanned = sector.visited;
                        }
                        sector.entities.forEach(e => {
                            if (e.type === 'ship' && e.id !== 'player') {
                                migrateShip(e as Ship);
                                assignColor(e as Ship);
                            }
                        })
                    }));
                    
                    // Convert old string logs to new LogEntry format
                    if (savedState.logs.length > 0 && typeof savedState.logs[0] === 'string') {
                        savedState.logs = (savedState.logs as unknown as string[]).map((msg, index) => ({
                            id: `compat_${index}`, turn: savedState.turn, sourceId: 'system', sourceName: 'Log',
                            message: msg, color: SYSTEM_LOG_COLOR, isPlayerSource: false,
                        })).reverse();
                    }

                    return savedState;
                }
            } catch (e) { console.error("Could not parse saved state, starting new game.", e); }
        }
        return createInitialGameState();
    });
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
    const [navigationTarget, setNavigationTarget] = useState<{ x: number; y: number } | null>(null);
    const [currentView, setCurrentView] = useState<'sector' | 'quadrant'>('sector');
    const [isDocked, setIsDocked] = useState(false);
    const [activeAwayMission, setActiveAwayMission] = useState<ActiveAwayMission | null>(null);
    const [activeHail, setActiveHail] = useState<ActiveHail | null>(null);
    const [officerCounsel, setOfficerCounsel] = useState<ActiveCounselSession | null>(null);
    const [playerTurnActions, setPlayerTurnActions] = useState<PlayerTurnActions>({});
    const [activeEvent, setActiveEvent] = useState<{ beaconId: string; template: EventTemplate } | null>(null);
    const [isWarping, setIsWarping] = useState(false);
    const [isTurnResolving, setIsTurnResolving] = useState(false);
    const [awayMissionResult, setAwayMissionResult] = useState<string | null>(null);
    const [eventResult, setEventResult] = useState<string | null>(null);
    const [activeMissionPlanetId, setActiveMissionPlanetId] = useState<string | null>(null);


    const addLog = useCallback((logData: Omit<LogEntry, 'id' | 'turn' | 'color'> & { color?: string }) => {
        setGameState(prev => {
            const allShips = [...prev.currentSector.entities.filter((e): e is Ship => e.type === 'ship'), prev.player.ship];
            const sourceShip = allShips.find(s => s.id === logData.sourceId);

            const newLog: LogEntry = {
                id: uniqueId(),
                turn: prev.turn,
                sourceId: logData.sourceId,
                sourceName: logData.sourceName,
                message: logData.message,
                color: logData.color || sourceShip?.logColor || SYSTEM_LOG_COLOR,
                isPlayerSource: logData.isPlayerSource,
            };
            return { ...prev, logs: [...prev.logs, newLog] };
        });
    }, []);

    useEffect(() => {
        if (!isDocked) return;
        const starbase = gameState.currentSector.entities.find(e => e.type === 'starbase');
        if (!starbase) { setIsDocked(false); return; }
        if (calculateDistance(gameState.player.ship.position, starbase.position) > 1) {
            setIsDocked(false);
            addLog({ sourceId: 'system', sourceName: 'Ship Computer', message: "Undocked: Moved out of range of the starbase.", isPlayerSource: false });
        }
    }, [gameState.turn, gameState.currentSector.entities, isDocked, addLog]);

    useEffect(() => {
        if (activeEvent) return;
        const beacon = gameState.currentSector.entities.find(e =>
            e.type === 'event_beacon' && !e.isResolved && calculateDistance(gameState.player.ship.position, e.position) <= 1
        ) as EventBeacon | undefined;

        if (beacon) {
            const templates = eventTemplates[beacon.eventType];
            if (templates && templates.length > 0) {
                const template = templates[Math.floor(Math.random() * templates.length)];
                addLog({ sourceId: 'system', sourceName: 'Sensors', message: `Approaching an ${beacon.name}...`, isPlayerSource: false });
                setActiveEvent({ beaconId: beacon.id, template });
            }
        }
    }, [gameState.player.ship.position, gameState.currentSector.entities, activeEvent, addLog]);

    useEffect(() => {
        if (gameState.combatEffects.length > 0) {
            const maxDelay = Math.max(0, ...gameState.combatEffects.map(e => e.delay));
            const totalAnimationTime = maxDelay + 1000;
            const timer = setTimeout(() => {
                setGameState(prev => ({ ...prev, combatEffects: [] }));
            }, totalAnimationTime);
            return () => clearTimeout(timer);
        }
    }, [gameState.combatEffects]);

    useEffect(() => {
        if (gameState.isRetreatingWarp) {
            setIsWarping(true);
            const timer = setTimeout(() => {
                setIsWarping(false);
                setGameState(prev => ({
                    ...prev,
                    isRetreatingWarp: false,
                }));
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [gameState.isRetreatingWarp, addLog, gameState.player.ship.name]);


    const saveGame = useCallback(() => {
        try {
            localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameState));
            addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Game state saved successfully.', isPlayerSource: false });
        } catch (error) {
            console.error("Failed to save game:", error);
            addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Error: Could not save game state.', isPlayerSource: false, color: 'border-red-500' });
        }
    }, [gameState, addLog]);

    const loadGame = useCallback(() => {
        try {
            const savedStateJSON = localStorage.getItem(SAVE_GAME_KEY);
            if (savedStateJSON) {
                const savedState: GameState = JSON.parse(savedStateJSON);
                if (savedState.player && savedState.turn) {
                    if ((savedState.player as any).boardingParty) delete (savedState.player as any).boardingParty;
                    if (!savedState.player.ship.securityTeams) savedState.player.ship.securityTeams = { current: 3, max: 3 };
                    if (savedState.player.ship.repairTarget === undefined) savedState.player.ship.repairTarget = null;
                    if (!savedState.player.ship.subsystems.transporter) savedState.player.ship.subsystems.transporter = { health: 100, maxHealth: 100 };
                    if (!savedState.player.targeting) delete savedState.player.targeting;
                    else if (!savedState.player.targeting.consecutiveTurns) savedState.player.targeting.consecutiveTurns = 1;
                    if (savedState.isRetreatingWarp === undefined) savedState.isRetreatingWarp = false;
                    if (savedState.usedAwayMissionSeeds === undefined) savedState.usedAwayMissionSeeds = [];
                    if (savedState.usedAwayMissionTemplateIds === undefined) savedState.usedAwayMissionTemplateIds = [];
                    
                     const migrateShip = (ship: Ship) => {
                        if ((ship as any).shipClass) {
                            ship.shipModel = (ship as any).shipClass;
                            delete (ship as any).shipClass;
                        }
                        if (!ship.shipRole) {
                            let role: ShipRole;
                            let model = ship.shipModel || ship.faction;
                            switch(model) {
                                case 'Klingon': case 'Romulan': role = 'Cruiser'; break;
                                case 'Pirate': role = 'Escort'; break;
                                case 'Federation': role = 'Explorer'; break;
                                default: role = 'Freighter'; break;
                            }
                            ship.shipRole = role;
                            const stats = shipRoleStats[role];
                            ship.maxHull = stats.maxHull;
                            ship.hull = Math.min(ship.hull, stats.maxHull);
                            ship.maxShields = stats.maxShields;
                            ship.shields = Math.min(ship.shields, stats.maxShields);
                            ship.energy.max = stats.energy.max;
                            ship.energy.current = Math.min(ship.energy.current, stats.energy.max);
                            ship.torpedoes.max = stats.torpedoes.max;
                            ship.torpedoes.current = Math.min(ship.torpedoes.current, stats.torpedoes.max);
                            const oldSubsystems = JSON.parse(JSON.stringify(ship.subsystems));
                            ship.subsystems = JSON.parse(JSON.stringify(stats.subsystems));
                            (Object.keys(ship.subsystems) as Array<keyof ShipSubsystems>).forEach(key => {
                                if (oldSubsystems[key]) {
                                    ship.subsystems[key].health = Math.min(oldSubsystems[key].health, ship.subsystems[key].maxHealth);
                                }
                            });
                        }
                    };
                    migrateShip(savedState.player.ship);
                     if (!savedState.player.ship.shipModel) savedState.player.ship.shipModel = 'Federation';

                    let colorIndex = 0;
                    savedState.player.ship.logColor = PLAYER_LOG_COLOR;
                     const assignColor = (ship: Ship) => {
                        if (!ship.logColor) {
                           ship.logColor = ENEMY_LOG_COLORS[colorIndex];
                           colorIndex = (colorIndex + 1) % ENEMY_LOG_COLORS.length;
                        }
                    };
                    savedState.quadrantMap.forEach((row, qy) => row.forEach((sector, qx) => {
                         if (!sector.factionOwner) {
                            sector.factionOwner = getFactionOwner(qx, qy);
                        }
                        if (sector.isScanned === undefined) {
                            sector.isScanned = sector.visited;
                        }
                        sector.entities.forEach(e => {
                            if (e.type === 'ship' && e.id !== 'player') {
                                migrateShip(e as Ship);
                                assignColor(e as Ship);
                            }
                        });
                    }));

                    if (savedState.logs.length > 0 && typeof savedState.logs[0] === 'string') {
                        savedState.logs = (savedState.logs as unknown as string[]).map((msg, index) => ({
                            id: `compat_${index}`, turn: savedState.turn, sourceId: 'system', sourceName: 'Log',
                            message: msg, color: SYSTEM_LOG_COLOR, isPlayerSource: false,
                        })).reverse();
                    }
                    
                    setGameState(savedState);
                    addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Game state loaded successfully.', isPlayerSource: false });
                } else {
                    addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Error: Invalid save data found.', isPlayerSource: false, color: 'border-red-500' });
                }
            } else {
                addLog({ sourceId: 'system', sourceName: 'Computer', message: 'No saved game found to load.', isPlayerSource: false });
            }
        } catch (error) {
            console.error("Failed to load game:", error);
            addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Error: Could not load game state.', isPlayerSource: false, color: 'border-red-500' });
        }
    }, [addLog]);

    const exportSave = useCallback(() => {
        try {
            const stateJSON = JSON.stringify(gameState, null, 2);
            const blob = new Blob([stateJSON], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `startrek-save-turn-${gameState.turn}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Save file exported.', isPlayerSource: false });
        } catch (error) {
            console.error("Failed to export save:", error);
            addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Error: Could not export save file.', isPlayerSource: false, color: 'border-red-500' });
        }
    }, [gameState, addLog]);

    const importSave = useCallback((jsonString: string) => {
        try {
            const newState: GameState = JSON.parse(jsonString);
            if (newState.player && newState.turn && newState.quadrantMap) {
                setGameState(newState);
                addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Game state imported successfully.', isPlayerSource: false });
            } else {
                addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Error: The imported file is not a valid save file.', isPlayerSource: false, color: 'border-red-500' });
            }
        } catch (error) {
            console.error("Failed to import save:", error);
            addLog({ sourceId: 'system', sourceName: 'Computer', message: 'Error: Could not parse the imported save file.', isPlayerSource: false, color: 'border-red-500' });
        }
    }, [addLog]);

    const onEndTurn = useCallback(() => {
        if (isTurnResolving) return;
        setIsTurnResolving(true);

        const createLogs = (source: {id: string, name: string, isPlayer: boolean}, messages: string[]) => {
            messages.forEach(msg => addLog({ sourceId: source.id, sourceName: source.name, message: msg, isPlayerSource: source.isPlayer }));
        };

        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            if (next.gameOver) { setIsTurnResolving(false); return prev; }
            
            const { player, currentSector } = next;
            const playerShip = player.ship;
            const phaserEffects: CombatEffect[] = [];

            // Passive Repair Action
            if (playerShip.repairTarget) {
                const energyCost = 10;
                const { success, logs: energyLogs } = consumeEnergy(playerShip, energyCost);
                createLogs({id: 'player', name: playerShip.name, isPlayer: true}, energyLogs);

                if (success) {
                    const repairAmount = 25;
                    const targetSystem = playerShip.repairTarget;
                    let repaired = false; let isComplete = false;
                    if (targetSystem === 'hull') {
                        const oldHull = playerShip.hull;
                        playerShip.hull = Math.min(playerShip.maxHull, playerShip.hull + repairAmount);
                        if (playerShip.hull > oldHull) {
                            addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Engineering teams continue repairs on the hull, restoring ${Math.round(playerShip.hull - oldHull)} integrity.`, isPlayerSource: true });
                            repaired = true;
                        }
                        if (playerShip.hull === playerShip.maxHull) isComplete = true;
                    } else {
                        const subsystem = playerShip.subsystems[targetSystem as 'weapons' | 'engines' | 'shields' | 'transporter'];
                        if (subsystem) {
                            const oldHealth = subsystem.health;
                            subsystem.health = Math.min(subsystem.maxHealth, subsystem.health + repairAmount);
                            if (subsystem.health > oldHealth) {
                                addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Engineering teams continue repairs on the ${targetSystem}, restoring ${Math.round(subsystem.health - oldHealth)} health.`, isPlayerSource: true });
                                repaired = true;
                            }
                            if (subsystem.health === subsystem.maxHealth) isComplete = true;
                        }
                    }
                    if (isComplete) {
                        addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Repairs to ${targetSystem} are complete. Engineering teams standing by.`, isPlayerSource: true });
                        playerShip.repairTarget = null;
                    } else if (!repaired) {
                        addLog({ sourceId: 'player', sourceName: playerShip.name, message: `The ${targetSystem} is already at full integrity. Halting repairs.`, isPlayerSource: true });
                        playerShip.repairTarget = null;
                    }
                }
            }
            
            let maintainedTargetLock = false;
            
            if (playerShip.retreatingTurn !== null) {
                addLog({ sourceId: 'player', sourceName: playerShip.name, message: "Attempting to retreat, cannot take other actions.", isPlayerSource: true });
            } else {
                if (navigationTarget) {
                    const movementSpeed = next.redAlert ? 1 : 3;
                    let moved = false;
                    const initialPosition = { ...playerShip.position };

                    for (let i = 0; i < movementSpeed; i++) {
                        if (playerShip.position.x === navigationTarget.x && playerShip.position.y === navigationTarget.y) {
                            break; // Arrived at destination
                        }
                        
                        playerShip.position = moveOneStep(playerShip.position, navigationTarget);
                        moved = true;

                        // Asteroid field hazard check for each step
                        const asteroidFields = currentSector.entities.filter((e: Entity) => e.type === 'asteroid_field');
                        const isAdjacentToAsteroids = asteroidFields.some(field => calculateDistance(playerShip.position, field.position) <= 1);
                        if (isAdjacentToAsteroids && Math.random() < 0.25) {
                            const damage = 3 + Math.floor(Math.random() * 5); // 3-7 damage
                            addLog({ sourceId: 'system', sourceName: 'Hazard Alert', message: `Navigating near asteroid field... minor debris impact!`, isPlayerSource: false, color: 'border-orange-400' });
                            let remainingDamage: number = damage;
                            if (playerShip.shields > 0) {
                                const absorbed = Math.min(playerShip.shields, remainingDamage);
                                playerShip.shields -= absorbed;
                                remainingDamage -= absorbed;
                                addLog({ sourceId: 'system', sourceName: 'Ship Computer', message: `Shields absorbed ${Math.round(absorbed)} damage.`, isPlayerSource: false });
                            }
                            if (remainingDamage > 0) {
                                const roundedDamage = Math.round(remainingDamage);
                                playerShip.hull = Math.max(0, playerShip.hull - roundedDamage);
                                addLog({ sourceId: 'system', sourceName: 'Damage Control', message: `Ship took ${roundedDamage} hull damage!`, isPlayerSource: false });
                            }
                        }
                    }

                    if (moved) {
                        addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Moving from (${initialPosition.x},${initialPosition.y}) to (${playerShip.position.x},${playerShip.position.y}).`, isPlayerSource: true });
                    }

                    if (playerShip.position.x === navigationTarget.x && playerShip.position.y === navigationTarget.y) {
                        setNavigationTarget(null);
                        addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Arrived at navigation target.`, isPlayerSource: true });
                    }
                }
                if (playerTurnActions.combat?.type === 'phasers') {
                    const actionTargetId = playerTurnActions.combat.targetId;
                    const target = currentSector.entities.find((e: Entity) => e.id === actionTargetId);
                    
                    if (target) {
                        const targetingInfo = player.targeting;
                        if (targetingInfo && targetingInfo.entityId === actionTargetId) {
                            if (target.type === 'ship') {
                                const subsystem = targetingInfo.subsystem;
                                let energyCost = 0; if (subsystem) energyCost = 4;
                                let canFire = true;

                                if (energyCost > 0) {
                                    const { success, logs: energyLogs } = consumeEnergy(playerShip, energyCost);
                                    createLogs({id: 'player', name: playerShip.name, isPlayer: true}, energyLogs);
                                    if(success) addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Consumed ${energyCost} power for targeting computers.`, isPlayerSource: true });
                                    else canFire = false;
                                }

                                if(canFire) {
                                    phaserEffects.push({ type: 'phaser', sourceId: playerShip.id, targetId: target.id, faction: playerShip.faction, delay: 0 });
                                    const baseDamage = 20 * (playerShip.energyAllocation.weapons / 100);
                                    const combatLogs = applyPhaserDamage(target as Ship, baseDamage, subsystem || null, playerShip, next);
                                    createLogs({id: 'player', name: playerShip.name, isPlayer: true}, combatLogs);
                                    if(subsystem) maintainedTargetLock = true;
                                }
                            } else if (target.type === 'torpedo_projectile') {
                                const { success, logs: energyLogs } = consumeEnergy(playerShip, 4);
                                createLogs({id: 'player', name: playerShip.name, isPlayer: true}, energyLogs);
                                if(success) {
                                    phaserEffects.push({ type: 'phaser', sourceId: playerShip.id, targetId: target.id, faction: playerShip.faction, delay: 0 });
                                    (target as TorpedoProjectile).hull = 0;
                                    addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Point-defense phasers fire at a hostile torpedo!\n--> HIT! The torpedo is destroyed!`, isPlayerSource: true });
                                }
                            }
                        }
                    }
                }
            }
            
            const targetingInfo = player.targeting;
            if (targetingInfo) {
                if (maintainedTargetLock) {
                    targetingInfo.consecutiveTurns = (targetingInfo.consecutiveTurns || 1) + 1;
                    const target = currentSector.entities.find(e => e.id === targetingInfo.entityId);
                    addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Maintaining target lock on ${target?.name}'s ${targetingInfo.subsystem} (${targetingInfo.consecutiveTurns} turns).`, isPlayerSource: true });
                } else if (targetingInfo.consecutiveTurns > 1) {
                    addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Targeting lock on ${targetingInfo.subsystem} lapsed.`, isPlayerSource: true });
                    targetingInfo.consecutiveTurns = 1;
                }
            }
            
            next.combatEffects = phaserEffects;
            return next;
        });
        
        setTimeout(() => setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev)); if (next.gameOver) return prev;
            const newEffects: CombatEffect[] = [];
            const destroyedProjectileIds = new Set<string>();
            const { currentSector } = next;
            const projectiles = currentSector.entities.filter((e: Entity): e is TorpedoProjectile => e.type === 'torpedo_projectile');
            const allShips = [...currentSector.entities.filter((e: Entity): e is Ship => e.type === 'ship'), next.player.ship];

            const applyTorpedoDamage = (target: Ship, damage: number, sourceShip: Ship) => {
                 const logs: string[] = [];
                 if (target.id === 'player' && !next.redAlert) target.shields = 0;
                 logs.push(`--> HIT! Initial damage: ${Math.round(damage)}.`);
                 let remainingDamage = damage;
                 const shieldDamage = remainingDamage * 0.25;
                 const absorbedByShields = Math.min(target.shields, shieldDamage);
                 if (absorbedByShields > 0) {
                     logs.push(`--> Shields absorbed ${Math.round(absorbedByShields)} damage.`);
                     target.shields -= absorbedByShields;
                 }
                 remainingDamage -= absorbedByShields / 0.25;
                 if (remainingDamage > 0) {
                     const roundedHullDamage = Math.round(remainingDamage);
                     target.hull = Math.max(0, target.hull - roundedHullDamage);
                     logs.push(`--> ${target.name} takes ${roundedHullDamage} hull damage.`);
                 }
                 else {
                     logs.push(`--> Shields absorbed the entire hit.`);
                 }
                 return logs;
            };

            projectiles.forEach(torpedo => {
                if (torpedo.hull <= 0 || destroyedProjectileIds.has(torpedo.id)) { destroyedProjectileIds.add(torpedo.id); return; }
                const targetEntity = allShips.find(s => s.id === torpedo.targetId);
                const sourceEntity = allShips.find(s => s.id === torpedo.sourceId);

                if (!targetEntity || !sourceEntity || targetEntity.faction === torpedo.faction || targetEntity.hull <= 0) {
                    addLog({ sourceId: sourceEntity?.id || 'system', sourceName: sourceEntity?.name || 'Torpedo Control', message: `${torpedo.name} self-destructs as its target is no longer valid.`, isPlayerSource: sourceEntity?.id === 'player' });
                    destroyedProjectileIds.add(torpedo.id); return;
                }
                if (next.turn - torpedo.turnLaunched >= 3) {
                    addLog({ sourceId: sourceEntity.id, sourceName: sourceEntity.name, message: `${torpedo.name} self-destructs at the end of its lifespan.`, isPlayerSource: sourceEntity.id === 'player' });
                    destroyedProjectileIds.add(torpedo.id); return;
                }

                for (let i = 0; i < torpedo.speed; i++) {
                    if (torpedo.position.x === targetEntity.position.x && torpedo.position.y === targetEntity.position.y) break;
                    torpedo.position = moveOneStep(torpedo.position, targetEntity.position);
                    torpedo.path.push({ ...torpedo.position });
                    torpedo.stepsTraveled++;
                    
                    const potentialTargets = allShips.filter(s => s.faction !== torpedo.faction && s.hull > 0);
                    for (const ship of potentialTargets) {
                        if (ship.position.x === torpedo.position.x && ship.position.y === torpedo.position.y) {
                            let hitChance = Math.max(0.05, 1.0 - (torpedo.stepsTraveled * 0.24));
                            if (ship.evasive) hitChance *= 0.3;
                            if (next.currentSector.hasNebula) hitChance *= 0.6;
                            
                            let torpedoLog = `${sourceEntity.name}'s torpedo is on an intercept course with ${ship.name}. Impact chance: ${Math.round(hitChance * 100)}%.`;
                             if (next.currentSector.hasNebula) {
                                torpedoLog += ` (Reduced by nebula interference)`;
                            }
                            if (Math.random() < hitChance) {
                                const damageLogs = applyTorpedoDamage(ship, 50, sourceEntity);
                                torpedoLog += '\n' + damageLogs.join('\n');
                                newEffects.push({ type: 'torpedo_hit', position: ship.position, delay: 0 });
                            } else {
                                torpedoLog += `\n--> The torpedo misses! ${ship.name} evaded at the last moment.`;
                            }
                            addLog({ sourceId: sourceEntity.id, sourceName: sourceEntity.name, message: torpedoLog, isPlayerSource: sourceEntity.id === 'player' });
                            destroyedProjectileIds.add(torpedo.id); return;
                        }
                    }
                }
            });

            next.currentSector.entities = next.currentSector.entities.filter((e: Entity) => !destroyedProjectileIds.has(e.id));
            next.combatEffects = [...next.combatEffects, ...newEffects];
            return next;
        }), 300);

        setTimeout(() => setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev)); if (next.gameOver) return prev;
            const phaserEffects: CombatEffect[] = [];
            const { currentSector } = next;
            const alliedShips = currentSector.entities.filter((e: Entity): e is Ship => e.type === 'ship' && e.faction === 'Federation' && e.id !== 'player');
            const hostileShips = currentSector.entities.filter((e: Entity): e is Ship => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
            
            if (alliedShips.length > 0 && hostileShips.length > 0) {
                alliedShips.forEach((ally, index) => {
                    let closestHostile: Ship | null = null; let minDistance = Infinity;
                    hostileShips.forEach(hostile => {
                        const distance = calculateDistance(ally.position, hostile.position);
                        if (distance < minDistance) { minDistance = distance; closestHostile = hostile; }
                    });
                    if (closestHostile && minDistance <= 6) {
                        phaserEffects.push({ type: 'phaser', sourceId: ally.id, targetId: closestHostile.id, faction: ally.faction, delay: index * 200 });
                        const combatLogs = applyPhaserDamage(closestHostile, 15, null, ally, next);
                        createLogs({id: ally.id, name: ally.name, isPlayer: false}, combatLogs);
                    }
                });
            }
            next.combatEffects = [...next.combatEffects, ...phaserEffects];
            return next;
        }), 800);

        setTimeout(() => setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev)); if (next.gameOver) return prev;
            const hostileAIShips = next.currentSector.entities.filter((e: Entity): e is Ship => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
            hostileAIShips.forEach((aiShip: Ship) => {
                const distance = calculateDistance(aiShip.position, next.player.ship.position);
                if (distance > 2 && aiShip.subsystems.engines.health > 0) {
                    aiShip.position = moveOneStep(aiShip.position, next.player.ship.position);

                    // AI Asteroid hazard
                    const asteroidFields = next.currentSector.entities.filter((e: Entity) => e.type === 'asteroid_field');
                    if (asteroidFields.some(field => calculateDistance(aiShip.position, field.position) <= 1)) {
                        if (Math.random() < 0.20) {
                            const damage = 3 + Math.floor(Math.random() * 5);
                            addLog({ sourceId: 'system', sourceName: 'Sensors', message: `${aiShip.name} is struck by debris while maneuvering near asteroids!`, isPlayerSource: false, color: 'border-orange-400' });
                            let remainingDamage: number = damage;
                            if (aiShip.shields > 0) {
                                const absorbed = Math.min(aiShip.shields, remainingDamage);
                                aiShip.shields -= absorbed;
                                remainingDamage -= absorbed;
                            }
                            if (remainingDamage > 0) {
                                const roundedDamage = Math.round(remainingDamage);
                                aiShip.hull = Math.max(0, aiShip.hull - roundedDamage);
                            }
                        }
                    }
                }
            });
            return { ...next };
        }), 1200);

        setTimeout(() => {
            setGameState(prev => {
                const next = JSON.parse(JSON.stringify(prev));
                if (next.gameOver) { setIsTurnResolving(false); return prev; }
                const { player, currentSector } = next; const playerShip = player.ship;
                const phaserEffects: CombatEffect[] = []; let redAlertThisTurn = false;

                const hostileAIShips = currentSector.entities.filter((e: Entity): e is Ship => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
                hostileAIShips.forEach((aiShip: Ship, index: number) => {
                    const distance = calculateDistance(aiShip.position, playerShip.position); let hasFired = false;
                    const playerTorpedoes = currentSector.entities.filter((e: Entity): e is TorpedoProjectile => e.type === 'torpedo_projectile' && e.faction === 'Federation');
                    if (playerTorpedoes.length > 0 && aiShip.subsystems.weapons.health > 0 && Math.random() < 0.75) {
                        const torpedoToShoot = playerTorpedoes[0];
                        if (calculateDistance(aiShip.position, torpedoToShoot.position) <= 5) {
                            phaserEffects.push({ type: 'phaser', sourceId: aiShip.id, targetId: torpedoToShoot.id, faction: aiShip.faction, delay: index * 250 });
                            torpedoToShoot.hull = 0;
                            addLog({ sourceId: aiShip.id, sourceName: aiShip.name, message: `Fires point-defense at an incoming torpedo!\n--> HIT! The torpedo is destroyed!`, isPlayerSource: false });
                            redAlertThisTurn = true; hasFired = true;
                        }
                    }
                    if (hasFired) return;
                    if (distance <= 7 && !aiShip.scanned) {
                        aiShip.scanned = true;
                        addLog({ sourceId: 'system', sourceName: 'Tactical Alert', message: `Automatically scanned ${aiShip.name} due to proximity during attack.`, isPlayerSource: false });
                    }
                    if (aiShip.subsystems.weapons.health > 0 && distance <= 5) {
                        const combatLogs = applyPhaserDamage(playerShip, 10 * (aiShip.energyAllocation.weapons / 100), null, aiShip, next);
                        phaserEffects.push({ type: 'phaser', sourceId: aiShip.id, targetId: playerShip.id, faction: aiShip.faction, delay: index * 250 });
                        createLogs({id: aiShip.id, name: aiShip.name, isPlayer: false}, combatLogs);
                        redAlertThisTurn = true;
                    }
                    if (aiShip.torpedoes.current > 0 && aiShip.subsystems.weapons.health > 0 && distance <= 8 && Math.random() < 0.4) {
                         aiShip.torpedoes.current--;
                         const torpedo: TorpedoProjectile = {
                             id: uniqueId(), name: 'Enemy Torpedo', type: 'torpedo_projectile', faction: aiShip.faction,
                             position: { ...aiShip.position }, targetId: playerShip.id, sourceId: aiShip.id, stepsTraveled: 0,
                             speed: 2, path: [{ ...aiShip.position }], scanned: true, turnLaunched: next.turn, hull: 1, maxHull: 1,
                         };
                         next.currentSector.entities.push(torpedo);
                         addLog({ sourceId: aiShip.id, sourceName: aiShip.name, message: `Has launched a torpedo!`, isPlayerSource: false });
                         redAlertThisTurn = true;
                    }
                });
                next.combatEffects = [...next.combatEffects, ...phaserEffects];

                [playerShip, ...currentSector.entities].forEach(e => {
                    if (e.type === 'ship') {
                        const ship = e as Ship;
                        const regenAmount = (ship.energyAllocation.shields / 100) * (ship.maxShields * 0.1);
                        ship.shields = Math.min(ship.maxShields, ship.shields + regenAmount);
                    }
                });

                // Resolve all combat and destruction before handling retreat.
                const destroyedIds = new Set<string>(); const newExplosionEffects: CombatEffect[] = [];
                currentSector.entities.forEach(e => {
                    const entityWithHull = e as Ship | Starbase | TorpedoProjectile;
                    if (entityWithHull.hull !== undefined && entityWithHull.hull <= 0) {
                        if (e.type === 'torpedo_projectile') {
                            addLog({ sourceId: 'system', sourceName: 'Tactical', message: `${e.name} was intercepted and destroyed.`, isPlayerSource: false });
                            newExplosionEffects.push({ type: 'torpedo_hit', position: e.position, delay: 0 });
                        } else if (e.type === 'ship' || e.type === 'starbase') {
                            addLog({ sourceId: 'system', sourceName: 'Tactical', message: `${e.name} has been destroyed!`, isPlayerSource: false });
                        }
                        destroyedIds.add(e.id);
                    }
                });

                if (newExplosionEffects.length > 0) next.combatEffects = [...next.combatEffects, ...newExplosionEffects];
                
                const targetingInfo = player.targeting;
                if (targetingInfo) {
                    const targetEntity = currentSector.entities.find(e => e.id === targetingInfo.entityId);
                    if (!targetEntity || destroyedIds.has(targetingInfo.entityId)) {
                        delete next.player.targeting;
                        addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Target destroyed. Disengaging targeting computers.`, isPlayerSource: true });
                    } else if (targetingInfo.subsystem && targetEntity.type === 'ship') {
                        if (targetEntity.subsystems[targetingInfo.subsystem].health <= 0) {
                            next.player.targeting.subsystem = null;
                            addLog({ sourceId: 'player', sourceName: playerShip.name, message: `${targetEntity.name}'s ${targetingInfo.subsystem} disabled. Reverting to hull targeting.`, isPlayerSource: true });
                        }
                    }
                }
                if (selectedTargetId && destroyedIds.has(selectedTargetId)) setSelectedTargetId(null);
                next.currentSector.entities = currentSector.entities.filter(e => !destroyedIds.has(e.id));
                
                const retreatSuccessful = playerShip.retreatingTurn !== null && next.turn >= playerShip.retreatingTurn;
                
                if (retreatSuccessful) {
                    const oldPlayerPos = next.player.position;
                    
                    // Save the now-finalized state of the sector being left.
                    next.quadrantMap[oldPlayerPos.qy][oldPlayerPos.qx] = JSON.parse(JSON.stringify(next.currentSector));

                    playerShip.retreatingTurn = null;
                    
                    const friendlySectors: QuadrantPosition[] = [];
                    next.quadrantMap.forEach((row: SectorState[], qy: number) => {
                        row.forEach((sector: SectorState, qx: number) => {
                            if (sector.factionOwner === 'Federation' && (qx !== oldPlayerPos.qx || qy !== oldPlayerPos.qy)) {
                                friendlySectors.push({ qx, qy });
                            }
                        });
                    });

                    let destination: QuadrantPosition | null = null;
                    if (friendlySectors.length > 0) {
                        destination = friendlySectors[Math.floor(Math.random() * friendlySectors.length)];
                    } else {
                        // Fallback to original adjacent logic if no other friendly sector is found
                        const { qx, qy } = next.player.position;
                        const adjacentDeltas = [{dx: -1, dy: 0}, {dx: 1, dy: 0}, {dx: 0, dy: -1}, {dx: 0, dy: 1}];
                        const potentialDestinations: QuadrantPosition[] = [];
                        for (const delta of adjacentDeltas) {
                            const newQx = qx + delta.dx;
                            const newQy = qy + delta.dy;
                            if (newQx >= 0 && newQx < QUADRANT_SIZE && newQy >= 0 && newQy < QUADRANT_SIZE) {
                                potentialDestinations.push({ qx: newQx, qy: newQy });
                            }
                        }
                        if(potentialDestinations.length > 0) {
                             const pickSafest = (destinations: QuadrantPosition[]) => {
                                const safe = destinations.filter(pos => 
                                    !next.quadrantMap[pos.qy][pos.qx].entities.some((e: Entity) => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction))
                                );
                                if (safe.length > 0) return safe[Math.floor(Math.random() * safe.length)];
                                return destinations[Math.floor(Math.random() * destinations.length)];
                            };
                            destination = pickSafest(potentialDestinations);
                        }
                    }

                    addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Retreat successful! Engaging emergency warp to quadrant (${destination?.qx ?? 'unknown'}, ${destination?.qy ?? 'unknown'})...`, isPlayerSource: true });

                    const damageLogs: string[] = [];
                    if (Math.random() < 0.3) {
                        const damage = Math.round(playerShip.maxHull * Math.random() * 0.5);
                        playerShip.hull = Math.max(0, playerShip.hull - damage);
                        damageLogs.push(`--> Hull took ${damage} stress damage.`);
                    }
                    if (Math.random() < 0.4) {
                        const subsystems: (keyof ShipSubsystems)[] = ['weapons', 'engines', 'shields', 'transporter'];
                        const randomSubsystemKey = subsystems[Math.floor(Math.random() * subsystems.length)];
                        const targetSubsystem = playerShip.subsystems[randomSubsystemKey];
                        if (targetSubsystem.maxHealth > 0) {
                            const damage = Math.round(targetSubsystem.maxHealth * Math.random() * 0.5);
                            targetSubsystem.health = Math.max(0, targetSubsystem.health - damage);
                            damageLogs.push(`--> The ${randomSubsystemKey} system took ${damage} damage from the power surge.`);
                        }
                    }
                    if (damageLogs.length > 0) {
                        addLog({ 
                            sourceId: 'system', 
                            sourceName: 'Damage Control', 
                            message: "The emergency warp has strained the ship's systems!\n" + damageLogs.join('\n'), 
                            isPlayerSource: false,
                            color: 'border-orange-400'
                        });
                    }

                    if (destination) {
                        next.player.position = destination;
                        next.currentSector = JSON.parse(JSON.stringify(next.quadrantMap[destination.qy][destination.qx]));
                        next.player.ship.position = { x: 6, y: 8 };
                        next.currentSector.visited = true;
                        setNavigationTarget(null);
                        addLog({ sourceId: 'system', sourceName: 'Navigation', message: `Emergency warp completed. Arrived in quadrant (${destination.qx}, ${destination.qy}).`, isPlayerSource: false });
                    } else {
                        addLog({ sourceId: 'system', sourceName: 'Navigation', message: `Warp failed to find a safe vector! We've cleared the immediate area.`, isPlayerSource: false, color: 'border-orange-400' });
                        next.currentSector.entities = next.currentSector.entities.filter((e: Entity) => e.faction !== 'Klingon' && e.faction !== 'Romulan' && e.faction !== 'Pirate');
                    }
                    
                    delete next.player.targeting;
                    setSelectedTargetId(null);
                    next.isRetreatingWarp = true;
                }
                
                if (playerShip.hull <= 0) {
                    next.gameOver = true;
                    addLog({ sourceId: 'system', sourceName: 'FATAL', message: "CRITICAL: U.S.S. Endeavour has been destroyed. Game Over.", isPlayerSource: false, color: 'border-red-700' });
                }

                if (next.redAlert) {
                    let energyDrain = 5; if (playerShip.evasive) energyDrain += 5;
                    if (energyDrain > 0) {
                        const { success, logs: energyLogs } = consumeEnergy(playerShip, energyDrain);
                        createLogs({ id: 'player', name: playerShip.name, isPlayer: true }, energyLogs);
                        if (!success) addLog({ sourceId: 'player', sourceName: playerShip.name, message: `WARNING: Insufficient power for combat systems!`, isPlayerSource: true });
                        else addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Combat systems consumed ${energyDrain} reserve power.`, isPlayerSource: true });
                    }
                } else {
                    if (playerShip.energy.current < playerShip.energy.max) {
                        const rechargeAmount = 10;
                        playerShip.energy.current = Math.min(playerShip.energy.max, playerShip.energy.current + rechargeAmount);
                        addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Reserve batteries recharged by ${rechargeAmount} units.`, isPlayerSource: true });
                    }
                }
                
                const hasEnemies = next.currentSector.entities.some((e: Entity) => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
                if (redAlertThisTurn && !next.redAlert) {
                    next.redAlert = true;
                    addLog({ sourceId: 'system', sourceName: 'RED ALERT!', message: "Attacked by hostile vessel! Shields are being raised!", isPlayerSource: false, color: 'border-red-600' });
                    playerShip.shields = playerShip.maxShields;
                } else if (!hasEnemies && next.redAlert) {
                    next.redAlert = false; playerShip.shields = 0; playerShip.evasive = false;
                    addLog({ sourceId: 'system', sourceName: 'Stand Down', message: "Hostiles eliminated or evaded. Standing down from Red Alert. Shields offline.", isPlayerSource: false });
                }

                next.turn++;
                addLog({ sourceId: 'system', sourceName: 'Log', message: `Turn ${next.turn} begins.`, isPlayerSource: false, color: 'border-gray-700' });
                setPlayerTurnActions({});
                
                setIsTurnResolving(false);
                return next;
            });
        }, 1700);

    }, [addLog, playerTurnActions, navigationTarget, selectedTargetId, isTurnResolving]);

    const onEnergyChange = useCallback((changedKey: 'weapons' | 'shields' | 'engines', value: number) => {
        setGameState(prev => {
            const oldAlloc = prev.player.ship.energyAllocation; if (oldAlloc[changedKey] === value) return prev;
            const newAlloc = { ...oldAlloc }; const oldValue = oldAlloc[changedKey];
            const clampedNewValue = Math.max(0, Math.min(100, value));
            const [key1, key2] = (['weapons', 'shields', 'engines'] as const).filter(k => k !== changedKey);
            const val1 = oldAlloc[key1]; const val2 = oldAlloc[key2];
            const totalOtherVal = val1 + val2;
            const intendedDiff = clampedNewValue - oldValue;
            let actualDiff = intendedDiff;
            if (intendedDiff > 0) actualDiff = Math.min(intendedDiff, totalOtherVal);
            const finalNewValue = oldValue + actualDiff; newAlloc[changedKey] = finalNewValue;
            const toDistribute = -actualDiff;
            if (totalOtherVal > 0) {
                newAlloc[key1] = val1 + Math.round(toDistribute * (val1 / totalOtherVal));
                newAlloc[key2] = val2 + Math.round(toDistribute * (val2 / totalOtherVal));
            } else {
                newAlloc[key1] = val1 + Math.floor(toDistribute / 2); newAlloc[key2] = val2 + Math.ceil(toDistribute / 2);
            }
            const sum = newAlloc.weapons + newAlloc.shields + newAlloc.engines;
            if (sum !== 100) newAlloc[changedKey] += (100 - sum);
            return { ...prev, player: { ...prev.player, ship: { ...prev.player.ship, energyAllocation: newAlloc } } };
        });
    }, []);

    const onDistributeEvenly = useCallback(() => {
        setGameState(prev => ({
            ...prev, player: { ...prev.player, ship: { ...prev.player.ship, energyAllocation: { weapons: 34, shields: 33, engines: 33 } } }
        }));
        addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: "Energy allocation reset to default distribution.", isPlayerSource: true });
    }, [addLog, gameState.player.ship.name]);

    const onSelectTarget = useCallback((id: string | null) => {
        setSelectedTargetId(id);
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            if (id) {
                const targetEntity = next.currentSector.entities.find((e: Entity) => e.id === id);
                const currentTargeting = next.player.targeting;
                if (!currentTargeting || currentTargeting.entityId !== id) {
                    if (targetEntity && (targetEntity.type === 'ship' || targetEntity.type === 'torpedo_projectile')) {
                        next.player.targeting = { entityId: id, subsystem: null, consecutiveTurns: 1 };
                    } else { delete next.player.targeting; }
                }
            } else { delete next.player.targeting; }
            return next;
        });
    }, []);
    
    const onSetNavigationTarget = useCallback((pos: { x: number; y: number } | null) => {
        setNavigationTarget(pos);
        const message = pos ? `Navigation target set to ${pos.x}, ${pos.y}.` : `Navigation target cleared.`;
        addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: message, isPlayerSource: true });
    }, [addLog, gameState.player.ship.name]);

    const onWarp = useCallback((pos: QuadrantPosition) => {
        if (gameState.player.ship.dilithium.current <= 0) {
            addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: "Warp failed. Insufficient Dilithium crystals.", isPlayerSource: true }); return;
        }
        addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: `Warp drive engaged. Plotting course for quadrant ${pos.qx}, ${pos.qy}.`, isPlayerSource: true });
        setIsWarping(true);

         setTimeout(() => {
            setCurrentView('sector'); setNavigationTarget(null); setSelectedTargetId(null); setIsDocked(false);
            setGameState(prev => {
                const next = JSON.parse(JSON.stringify(prev));
                const oldPlayerPos = next.player.position;

                // Save the state of the sector being left using a deep copy.
                next.quadrantMap[oldPlayerPos.qy][oldPlayerPos.qx] = JSON.parse(JSON.stringify(next.currentSector));

                next.player.ship.dilithium.current--;
                let sectorToWarpTo = JSON.parse(JSON.stringify(next.quadrantMap[pos.qy][pos.qx]));
                
                next.player.ship.position = { x: 6, y: 8 };

                if (!sectorToWarpTo.visited) {
                    sectorToWarpTo.visited = true;
                    addLog({ sourceId: 'system', sourceName: 'Sensors', message: `Entering unexplored sector. Long-range scans show ${sectorToWarpTo.entities.length} entities.`, isPlayerSource: false });

                    if (Math.random() < 0.15 && !sectorToWarpTo.entities.some((e: Entity) => e.type === 'starbase')) {
                        addLog({ sourceId: 'system', sourceName: 'RED ALERT!', message: "It's an ambush! Pirate vessels are decloaking!", isPlayerSource: false, color: 'border-red-600' });
                        for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) {
                            const stats = shipRoleStats['Escort'];
                            sectorToWarpTo.entities.push({
                                id: uniqueId(), name: 'Pirate Raider', type: 'ship', faction: 'Pirate', shipModel: 'Pirate', shipRole: 'Escort',
                                position: { x: Math.floor(Math.random() * SECTOR_WIDTH), y: Math.floor(Math.random() * 3) },
                                hull: stats.maxHull, maxHull: stats.maxHull, shields: stats.maxShields, maxShields: stats.maxShields, logColor: ENEMY_LOG_COLORS[i % ENEMY_LOG_COLORS.length],
                                energy: { current: stats.energy.max, max: stats.energy.max }, energyAllocation: { weapons: 60, shields: 40, engines: 0 },
                                torpedoes: { current: stats.torpedoes.max, max: stats.torpedoes.max }, dilithium: { current: 0, max: 0 }, scanned: true, evasive: false, retreatingTurn: null,
                                subsystems: JSON.parse(JSON.stringify(stats.subsystems)),
                                crewMorale: { current: 100, max: 100 }, securityTeams: { current: stats.securityTeams.max, max: stats.securityTeams.max }, repairTarget: null,
                            } as Ship);
                        }
                        next.redAlert = true; next.player.ship.shields = next.player.ship.maxShields;
                    }
                } else { addLog({ sourceId: 'system', sourceName: 'Sensors', message: `Entering previously explored sector.`, isPlayerSource: false }); }
                
                addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Arrived at quadrant ${pos.qx}, ${pos.qy}. Consumed 1 Dilithium.`, isPlayerSource: true });
                next.player.position = pos; next.currentSector = sectorToWarpTo;
                return next;
            });
            setIsWarping(false);
         }, 2500);
    }, [addLog, gameState.player.ship.name, gameState.player.ship.dilithium]);

    const onScanQuadrant = useCallback((pos: QuadrantPosition) => {
        const energyCost = 1;
        
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const { success, logs } = consumeEnergy(next.player.ship, energyCost);
            
            if (!success) {
                logs.forEach(log => addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: log, isPlayerSource: true }));
                return prev;
            }

            logs.forEach(log => addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: log, isPlayerSource: true }));
            addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Performing long-range scan of quadrant (${pos.qx},${pos.qy}). Consumed ${energyCost} power.`, isPlayerSource: true });
            next.quadrantMap[pos.qy][pos.qx].isScanned = true;
            
            const scannedSector = next.quadrantMap[pos.qy][pos.qx];
            let scanReport = `Scan complete. Results for (${pos.qx},${pos.qy}):\n`;

            if (scannedSector.hasNebula) {
                scanReport += `--> A dense nebula is present in this sector. Detailed sensor readings are impossible.\n`;
                const hostileCount = scannedSector.entities.filter((e:Entity) => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction)).length;
                if (hostileCount > 0) {
                    scanReport += `--> CAUTION: Intermittent energy readings detected, could indicate vessel activity.`;
                }
            } else {
                const hostileCount = scannedSector.entities.filter((e:Entity) => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction)).length;
                const hasStarbase = scannedSector.entities.some((e:Entity) => e.type === 'starbase');
                const planetCount = scannedSector.entities.filter((e:Entity) => e.type === 'planet').length;
                
                const findings = [];
                if (hostileCount > 0) findings.push(`WARNING: ${hostileCount} hostile contacts detected.`);
                if (hasStarbase) findings.push(`Starbase signature detected.`);
                if (planetCount > 0) findings.push(`${planetCount} planetary bodies detected.`);
                
                if (findings.length > 0) {
                    scanReport += findings.map(f => `--> ${f}`).join('\n');
                } else {
                    scanReport += `--> No significant readings.`;
                }
            }

            addLog({ sourceId: 'system', sourceName: 'Sensors', message: scanReport.trim(), isPlayerSource: false });

            return next;
        });
    }, [addLog]);

    const onFirePhasers = useCallback((targetId: string) => {
        addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: `Phaser attack ordered. Awaiting turn end.`, isPlayerSource: true });
        setPlayerTurnActions(prev => ({ ...prev, combat: { type: 'phasers', targetId } }));
    }, [addLog, gameState.player.ship.name]);
    
    const onLaunchTorpedo = useCallback((targetId: string) => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const { player, currentSector } = next; const playerShip = player.ship;
            const target = currentSector.entities.find((e: Entity) => e.id === targetId);

            if (!target) { addLog({ sourceId: 'player', sourceName: playerShip.name, message: "Cannot launch torpedo: Invalid target.", isPlayerSource: true }); return prev; }
            if (playerShip.torpedoes.current <= 0) { addLog({ sourceId: 'player', sourceName: playerShip.name, message: "Launch failed: No torpedoes remaining.", isPlayerSource: true }); return prev; }
            if (playerShip.subsystems.weapons.health <= 0) { addLog({ sourceId: 'player', sourceName: playerShip.name, message: "Launch failed: Weapon systems are offline.", isPlayerSource: true }); return prev; }
            playerShip.torpedoes.current--;

            const torpedo: TorpedoProjectile = {
                id: uniqueId(), name: 'Photon Torpedo', type: 'torpedo_projectile', faction: 'Federation',
                position: { ...playerShip.position }, targetId: targetId, sourceId: playerShip.id, stepsTraveled: 0,
                speed: 2, path: [{ ...playerShip.position }], scanned: true, turnLaunched: next.turn, hull: 1, maxHull: 1,
            };
            currentSector.entities.push(torpedo);
            addLog({ sourceId: 'player', sourceName: playerShip.name, message: `Photon torpedo launched at ${target.name}.`, isPlayerSource: true });
            if (next.player.targeting) next.player.targeting.subsystem = null;
            return next;
        });
    }, [addLog]);
    
    const onEvasiveManeuvers = useCallback(() => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            if (!next.redAlert) {
                addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: "Cannot engage evasive maneuvers without shields raised.", isPlayerSource: true });
                return prev;
            }
            const isEvasive = !next.player.ship.evasive;
            next.player.ship.evasive = isEvasive;
            const message = isEvasive ? 'Evasive maneuvers enabled. Increases passive energy drain.' : 'Evasive maneuvers disabled.';
            addLog({ sourceId: 'player', sourceName: next.player.ship.name, message, isPlayerSource: true });
            return next;
        });
    }, [addLog]);

    const onDockWithStarbase = useCallback(() => { setIsDocked(true); addLog({ sourceId: 'system', sourceName: 'Starbase Control', message: 'Docking successful. Welcome to Starbase.', isPlayerSource: false }); }, [addLog]);
    const onRechargeDilithium = useCallback(() => { addLog({ sourceId: 'system', sourceName: 'Starbase Ops', message: 'Dilithium crystals fully recharged.', isPlayerSource: false }); setGameState(prev => ({ ...prev, player: { ...prev.player, ship: { ...prev.player.ship, dilithium: { ...prev.player.ship.dilithium, current: prev.player.ship.dilithium.max } } } })); }, [addLog]);
    const onResupplyTorpedoes = useCallback(() => { addLog({ sourceId: 'system', sourceName: 'Starbase Ops', message: 'Torpedoes resupplied.', isPlayerSource: false }); setGameState(prev => ({ ...prev, player: { ...prev.player, ship: { ...prev.player.ship, torpedoes: { ...prev.player.ship.torpedoes, current: prev.player.ship.torpedoes.max } } } })); }, [addLog]);
    const onStarbaseRepairs = useCallback(() => {
        if (!isDocked) return;
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev)); const ship = next.player.ship;
            ship.hull = ship.maxHull; ship.energy.current = ship.energy.max;
            // Fix: Cast each subsystem to access its properties, as type information is lost after JSON.parse.
            Object.values(ship.subsystems).forEach(s => {
                const subsystem = s as { health: number; maxHealth: number };
                subsystem.health = subsystem.maxHealth;
            });
            ship.securityTeams.current = ship.securityTeams.max;
            return next;
        });
        addLog({ sourceId: 'system', sourceName: 'Starbase Ops', message: 'Service complete: Hull, energy, all subsystems, and security teams restored to maximum.', isPlayerSource: false });
    }, [addLog, isDocked]);
    
    const onSelectRepairTarget = useCallback((subsystem: 'weapons' | 'engines' | 'shields' | 'hull' | 'transporter') => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev)); const currentTarget = next.player.ship.repairTarget;
            const newTarget = currentTarget === subsystem ? null : subsystem;
            next.player.ship.repairTarget = newTarget;
            const message = newTarget ? `Engineering teams assigned to repair the ${newTarget}.` : `Engineering has halted repairs on the ${subsystem}.`;
            addLog({ sourceId: 'player', sourceName: next.player.ship.name, message, isPlayerSource: true });
            return next;
        });
    }, [addLog]);

    const onScanTarget = useCallback(() => {
         if (!selectedTargetId) return;
         addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: 'Scanning target...', isPlayerSource: true });
         setGameState(prev => {
            const newEntities = prev.currentSector.entities.map(e => e.id === selectedTargetId ? { ...e, scanned: true } : e);
            return { ...prev, currentSector: { ...prev.currentSector, entities: newEntities } };
         });
    }, [addLog, selectedTargetId, gameState.player.ship.name]);

    const onInitiateRetreat = useCallback(() => {
        addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: 'Retreat initiated! Evasive maneuvers for 2 turns.', isPlayerSource: true });
        setGameState(prev => ({ ...prev, player: { ...prev.player, ship: { ...prev.player.ship, retreatingTurn: prev.turn + 2 } } }));
    }, [addLog, gameState.player.ship.name]);

    const onCancelRetreat = useCallback(() => {
        addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: 'Retreat canceled. Resuming normal operations.', isPlayerSource: true });
        setGameState(prev => ({ ...prev, player: { ...prev.player, ship: { ...prev.player.ship, retreatingTurn: null } } }));
    }, [addLog, gameState.player.ship.name]);

    const generateAwayMission = useCallback((planet: Planet, turn: number, usedSeeds: string[], usedTemplateIds: string[]): ActiveAwayMission | null => {
        let seed = `${planet.id}-${turn}`;
        if (usedSeeds.includes(seed)) {
            // This should be rare, but as a fallback, add a random element.
            seed = `${planet.id}-${turn}-${Math.random()}`;
        }
        const rand = seededRandom(cyrb53(seed));

        const compatibleMissions = awayMissionTemplates.filter(t => t.planetClasses.includes(planet.planetClass));
        if (compatibleMissions.length === 0) {
            console.error(`No compatible away missions found for planet class: ${planet.planetClass}`);
            return null;
        }

        // Filter out missions that have already been used in this playthrough
        let availableMissions = compatibleMissions.filter(t => !usedTemplateIds.includes(t.id));

        // If all compatible missions have been used, reset the pool for this planet type.
        if (availableMissions.length === 0) {
            console.warn(`All missions for planet class ${planet.planetClass} have been used. Resetting pool for selection.`);
            availableMissions = compatibleMissions;
        }

        const template = availableMissions[Math.floor(rand() * availableMissions.length)];

        const activeMission: ActiveAwayMission = {
            id: template.id,
            seed: seed,
            title: template.title,
            description: template.description,
            options: template.options.map(optTemplate => {
                const [min, max] = optTemplate.successChanceRange;
                const calculatedSuccessChance = min + (max - min) * rand();
                return {
                    role: optTemplate.role,
                    text: optTemplate.text,
                    outcomes: optTemplate.outcomes,
                    calculatedSuccessChance,
                };
            })
        };
        
        console.log(`AWAY MISSION GENERATED (SEED: ${seed})`, activeMission);
        return activeMission;
    }, []);

    const onStartAwayMission = useCallback((planetId: string) => {
        const planet = gameState.currentSector.entities.find(e => e.id === planetId) as Planet | undefined;
        if (!planet) return;
        
        const mission = generateAwayMission(planet, gameState.turn, gameState.usedAwayMissionSeeds, gameState.usedAwayMissionTemplateIds || []);
        if (!mission) {
             addLog({ sourceId: 'system', sourceName: 'Bridge', message: "After assessing the planet, the senior staff concludes an away mission is not viable at this time.", isPlayerSource: false });
             return;
        }

        setActiveMissionPlanetId(planetId);
        
        const relevantOfficers = gameState.player.crew.filter(officer => mission.options.some(option => option.role === officer.role));
        const advice: OfficerAdvice[] = relevantOfficers.map(officer => {
            const adviceOptions = counselAdvice[officer.role]?.[officer.personality];
            const message = adviceOptions ? adviceOptions[Math.floor(Math.random() * adviceOptions.length)] : "I have no specific recommendation, Captain.";
            return { officerName: officer.name, role: officer.role, message };
        });

        if (advice.length > 0) {
            setOfficerCounsel({ mission, advice });
            addLog({ sourceId: 'system', sourceName: 'Bridge', message: "The bridge crew offers their counsel on the upcoming away mission.", isPlayerSource: false });
        } else {
            setActiveAwayMission(mission);
            addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: 'Away team beamed down.', isPlayerSource: true });
        }
    }, [gameState.currentSector.entities, gameState.turn, gameState.usedAwayMissionSeeds, gameState.player.crew, gameState.player.ship.name, addLog, generateAwayMission]);

    const onSendAwayTeam = useCallback((targetId: string, type: 'boarding' | 'strike') => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev)); const playerShip = next.player.ship;
            const target = next.currentSector.entities.find((e: Entity) => e.id === targetId) as Ship;
            let message = '';
            if (!target) message = "Away team action failed: Invalid target.";
            else if (playerShip.securityTeams.current <= 0) message = "Away team action failed: No security teams available.";
            else if ((target.shields / target.maxShields) > 0.2) message = `Away team action failed: ${target.name}'s shields are too strong.`;
            else if (playerShip.subsystems.transporter.health <= 0) message = "Away team action failed: Transporter is offline.";
            if (message) { addLog({ sourceId: 'player', sourceName: playerShip.name, message, isPlayerSource: true }); return prev; }

            if (type === 'boarding') {
                message = `Attempting to board the ${target.name}...`;
                playerShip.securityTeams.current--;
                const successChance = Math.max(0.1, (playerShip.crewMorale.current / 100) - (target.hull / target.maxHull) + 0.3);
                if (Math.random() < successChance) {
                    target.faction = 'Federation';
                    message += `\nSuccess! The ${target.name} has been captured and is now under Federation control.`;
                } else {
                    message += `\nThe boarding attempt failed! We lost the team in the assault.`;
                    playerShip.crewMorale.current = Math.max(0, playerShip.crewMorale.current - 10);
                }
            } else if (type === 'strike') {
                message = `Sending a strike team to the ${target.name}!`;
                const damage = 35 + Math.floor(Math.random() * 10);
                target.hull = Math.max(0, target.hull - damage);
                message += `\nThe strike team dealt ${damage} hull damage.`;
                if (Math.random() < 0.25) {
                    playerShip.securityTeams.current--;
                    message += `\nWe lost the strike team during the action!`;
                    playerShip.crewMorale.current = Math.max(0, playerShip.crewMorale.current - 5);
                } else { message += `\nThe strike team has returned safely.`; }
            }
            addLog({ sourceId: 'player', sourceName: playerShip.name, message, isPlayerSource: true });
            return next;
        });
    }, [addLog]);

    const onChooseAwayMissionOption = useCallback((option: ActiveAwayMissionOption) => {
        if (!activeAwayMission) return;
        
        const rand = seededRandom(cyrb53(activeAwayMission.seed + option.role));
        
        const successRoll = rand();
        const success = successRoll < option.calculatedSuccessChance;
        
        const outcomes = success ? option.outcomes.success : option.outcomes.failure;

        const totalWeight = outcomes.reduce((sum, o) => sum + o.weight, 0);
        
        // Use the next random number in the sequence for outcome selection
        const outcomeRollForSelection = rand();
        let weightRoll = outcomeRollForSelection * totalWeight;
        
        const chosenOutcome = outcomes.find(o => {
            weightRoll -= o.weight;
            return weightRoll < 0;
        }) || outcomes[0];

        console.groupCollapsed(`Away Mission Resolution (Seed: ${activeAwayMission.seed})`);
        console.log('Mission:', `"${activeAwayMission.title}"`);
        console.log('All Options & Chances:');
        console.table(activeAwayMission.options.map(opt => ({ 
            role: opt.role, 
            text: opt.text, 
            chance: `${(opt.calculatedSuccessChance * 100).toFixed(1)}%` 
        })));
        console.log('--- RESOLUTION ---');
        console.log('Player Chose:', `[${option.role}] ${option.text}`);
        console.log(`Success Check: Rolled ${(successRoll * 100).toFixed(2)} vs Target of ${(option.calculatedSuccessChance * 100).toFixed(2)} -> ${success ? 'SUCCESS' : 'FAILURE'}`);
        if(outcomes.length > 1) {
            console.log(`Outcome Selection (${outcomes.length} possibilities, total weight ${totalWeight}): Rolled a value that selected the following outcome.`);
        }
        console.log('Final Outcome:', chosenOutcome.log);
        console.log('State Changes:', chosenOutcome);
        console.groupEnd();

        const resultText = success ? 'SUCCESS' : 'FAILURE';
        const debugLogMessage = `[DEBUG] Mission Seed: ${activeAwayMission.seed} | Choice: ${option.role} | Roll: ${successRoll.toFixed(2)} vs Chance: ${option.calculatedSuccessChance.toFixed(2)} | Result: ${resultText}`;

        addLog({
            sourceId: 'system',
            sourceName: 'System Log',
            message: debugLogMessage,
            isPlayerSource: false,
            color: 'border-gray-700'
        });
        
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev)); 
            const playerShip = next.player.ship;
            const amount = chosenOutcome.amount || 0;
            const resource = chosenOutcome.resource as ResourceType;

            switch (chosenOutcome.type) {
                case 'reward':
                    if (resource) {
                        if (resource === 'dilithium') playerShip.dilithium.current = Math.min(playerShip.dilithium.max, playerShip.dilithium.current + amount);
                        else if (resource === 'torpedoes') playerShip.torpedoes.current = Math.min(playerShip.torpedoes.max, playerShip.torpedoes.current + amount);
                        else if (resource === 'hull') playerShip.hull = Math.min(playerShip.maxHull, playerShip.hull + amount);
                        else if (resource === 'energy') playerShip.energy.current = Math.min(playerShip.energy.max, playerShip.energy.current + amount);
                        else if (resource === 'morale') playerShip.crewMorale.current = Math.min(playerShip.crewMorale.max, playerShip.crewMorale.current + amount);
                        else if (['weapons', 'engines', 'shields', 'transporter'].includes(resource)) {
                            const subsystem = playerShip.subsystems[resource as keyof ShipSubsystems];
                            if (subsystem) subsystem.health = Math.min(subsystem.maxHealth, subsystem.health + amount);
                        }
                    }
                    break;
                case 'damage':
                    if (resource) {
                        if (resource === 'hull') playerShip.hull = Math.max(0, playerShip.hull - amount);
                        else if (resource === 'morale') playerShip.crewMorale.current = Math.max(0, playerShip.crewMorale.current - amount);
                        else if (resource === 'energy') playerShip.energy.current = Math.max(0, playerShip.energy.current - amount);
                        else if (resource === 'dilithium') playerShip.dilithium.current = Math.max(0, playerShip.dilithium.current - amount);
                        else if (resource === 'security_teams') playerShip.securityTeams.current = Math.max(0, playerShip.securityTeams.current - amount);
                        else if (['weapons', 'engines', 'shields', 'transporter'].includes(resource)) {
                            const subsystem = playerShip.subsystems[resource as keyof ShipSubsystems];
                            if (subsystem) subsystem.health = Math.max(0, subsystem.health - amount);
                        }
                    }
                    break;
            }

            if (activeMissionPlanetId) {
                const planet = next.currentSector.entities.find((e: Entity) => e.id === activeMissionPlanetId) as Planet | undefined;
                if (planet) planet.awayMissionCompleted = true;
            }

            next.usedAwayMissionSeeds.push(activeAwayMission.seed);
            if (!next.usedAwayMissionTemplateIds) {
                next.usedAwayMissionTemplateIds = [];
            }
            if (!next.usedAwayMissionTemplateIds.includes(activeAwayMission.id)) {
                next.usedAwayMissionTemplateIds.push(activeAwayMission.id);
            }
            return next;
        });
        
        setAwayMissionResult(chosenOutcome.log);
        setActiveAwayMission(null); 
        setActiveMissionPlanetId(null);
    }, [activeAwayMission, activeMissionPlanetId, addLog]);

    const onProceedFromCounsel = useCallback(() => {
        if (officerCounsel) {
            setActiveAwayMission(officerCounsel.mission);
            addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: 'Away team beamed down.', isPlayerSource: true });
            setOfficerCounsel(null);
        }
    }, [addLog, officerCounsel, gameState.player.ship.name]);

    const onCloseOfficerCounsel = useCallback(() => {
        setOfficerCounsel(null); setActiveMissionPlanetId(null);
        addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: "Away mission aborted based on counsel.", isPlayerSource: true });
    }, [addLog, gameState.player.ship.name]);

    const onHailTarget = useCallback(async () => {
         if (!selectedTargetId || !ai) return;
         const target = gameState.currentSector.entities.find(e => e.id === selectedTargetId); if (!target) return;
         setActiveHail({ targetId: selectedTargetId, loading: true, message: '' });
         addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: `Hailing ${target.name}...`, isPlayerSource: true });
         try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are the captain of a ${target.faction} ship called '${target.name}'. I am hailing you from the Federation starship U.S.S. Endeavour. What is your response? Be brief and in character.`,
                config: { systemInstruction: "You are a spaceship captain in a sci-fi universe. Respond concisely." },
              });
            // FIX: The response object has a `text` property, not a `text()` method.
            setActiveHail({ targetId: selectedTargetId, loading: false, message: response.text });
         } catch (error) {
            console.error("Hail AI error:", error);
            addLog({ sourceId: 'system', sourceName: 'Comms', message: `Hailing failed: Could not establish a stable connection.`, isPlayerSource: false });
            const defaultResponse = hailResponses[target.faction as keyof typeof hailResponses]?.greeting || "No response received.";
            setActiveHail({ targetId: selectedTargetId, loading: false, message: defaultResponse });
         }
    }, [addLog, gameState.currentSector.entities, selectedTargetId, gameState.player.ship.name]);
    
    const onChooseEventOption = useCallback((option: EventTemplateOption) => {
        if (!activeEvent) return;
        
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev)); const playerShip = next.player.ship;
            const beacon = next.currentSector.entities.find((e: Entity) => e.id === activeEvent.beaconId);
            if (beacon && beacon.type === 'event_beacon') { beacon.isResolved = true; beacon.name = 'Resolved Signal'; }
            const outcome = option.outcome; const amount = outcome.amount || 0;
            switch (outcome.type) {
                case 'reward': 
                    if (outcome.resource) {
                        if(outcome.resource === 'dilithium') playerShip.dilithium.current = Math.min(playerShip.dilithium.max, playerShip.dilithium.current + amount);
                        else if(outcome.resource === 'torpedoes') playerShip.torpedoes.current = Math.min(playerShip.torpedoes.max, playerShip.torpedoes.current + amount);
                        else if(outcome.resource === 'hull') playerShip.hull = Math.min(playerShip.maxHull, playerShip.hull + amount);
                        else if(outcome.resource === 'energy') playerShip.energy.current = Math.min(playerShip.energy.max, playerShip.energy.current + amount);
                        else if(outcome.resource === 'morale') playerShip.crewMorale.current = Math.min(playerShip.crewMorale.max, playerShip.crewMorale.current + amount);
                    } 
                    break;
                case 'damage': 
                    if (outcome.resource) {
                        if (outcome.resource === 'hull') playerShip.hull = Math.max(0, playerShip.hull - amount);
                        else if (outcome.resource === 'morale') playerShip.crewMorale.current = Math.max(0, playerShip.crewMorale.current - amount);
                        else if (outcome.resource === 'energy') playerShip.energy.current = Math.max(0, playerShip.energy.current - amount);
                        else if (outcome.resource === 'dilithium') playerShip.dilithium.current = Math.max(0, playerShip.dilithium.current - amount);
                        else if (['weapons', 'engines', 'shields', 'transporter'].includes(outcome.resource)) {
                            const subsystem = playerShip.subsystems[outcome.resource as keyof ShipSubsystems];
                            if (subsystem) {
                                subsystem.health = Math.max(0, subsystem.health - amount);
                            }
                        }
                    }
                    break;
                case 'combat': if (outcome.spawn && beacon) {
                        for (let i = 0; i < (outcome.spawnCount || 1); i++) {
                             const stats = shipRoleStats['Escort'];
                             next.currentSector.entities.push({
                                id: uniqueId(), name: 'Pirate Raider', type: 'ship', faction: 'Pirate', shipModel: 'Pirate', shipRole: 'Escort',
                                position: { x: beacon.position.x + i + 1, y: beacon.position.y }, hull: stats.maxHull, maxHull: stats.maxHull, shields: stats.maxShields, maxShields: stats.maxShields,
                                logColor: ENEMY_LOG_COLORS[i % ENEMY_LOG_COLORS.length],
                                energy: { current: stats.energy.max, max: stats.energy.max }, energyAllocation: { weapons: 60, shields: 40, engines: 0 },
                                torpedoes: { current: stats.torpedoes.max, max: stats.torpedoes.max }, dilithium: { current: 0, max: 0 }, scanned: false, evasive: false, retreatingTurn: null,
                                subsystems: JSON.parse(JSON.stringify(stats.subsystems)),
                                crewMorale: { current: 100, max: 100 }, securityTeams: { current: stats.securityTeams.max, max: stats.securityTeams.max }, repairTarget: null,
                            } as Ship);
                        } next.redAlert = true;
                    } break;
            } return next;
        });

        // Set event result after state update to trigger dialog
        setEventResult(option.outcome.log);
        setActiveEvent(null);
    }, [activeEvent, addLog]);

    const onToggleRedAlert = useCallback(() => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev)); if (next.gameOver) return prev;
            const newRedAlertState = !next.redAlert; let message = '';
            if (newRedAlertState) {
                const { success, logs } = consumeEnergy(next.player.ship, 15);
                if (success) {
                    next.redAlert = true; next.player.ship.shields = next.player.ship.maxShields;
                    message = logs.join('\n') + `Red Alert! Shields raised. Consumed 15 reserve power.`;
                } else { message = logs.join('\n') + `\nRed Alert failed: Insufficient power to charge shields.`; }
            } else {
                next.redAlert = false; next.player.ship.shields = 0;
                message = "Standing down from Red Alert. Shields offline. Recharging reserve batteries.";
                if (next.player.ship.evasive) { next.player.ship.evasive = false; message += "\nEvasive maneuvers disengaged."; }
            }
            addLog({ sourceId: 'player', sourceName: next.player.ship.name, message, isPlayerSource: true });
            return next;
        });
    }, [addLog]);

    const onSelectSubsystem = useCallback((subsystem: 'weapons' | 'engines' | 'shields') => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev)); const currentTargeting = next.player.targeting;
            let message = '';
            if (currentTargeting && currentTargeting.entityId === selectedTargetId) {
                if (currentTargeting.subsystem === subsystem) {
                    currentTargeting.subsystem = null;
                    message = `Targeting lock disengaged from ${subsystem}. Targeting main hull.`;
                } else {
                    currentTargeting.subsystem = subsystem; currentTargeting.consecutiveTurns = 1;
                    message = `Targeting computers locked on enemy ${subsystem}.`;
                }
                addLog({ sourceId: 'player', sourceName: next.player.ship.name, message, isPlayerSource: true });
            } return next;
        });
    }, [selectedTargetId, addLog]);

    const targetEntity = gameState.currentSector.entities.find(e => e.id === selectedTargetId);
    
    useEffect(() => { setNavigationTarget(null); }, [currentView])

    return {
        gameState, selectedTargetId, navigationTarget, currentView, isDocked, activeAwayMission, activeHail,
        officerCounsel, targetEntity, playerTurnActions, activeEvent, isWarping, isTurnResolving, awayMissionResult, eventResult,
        onEnergyChange, onEndTurn, onFirePhasers, onLaunchTorpedo, onEvasiveManeuvers, onSelectTarget,
        onSetNavigationTarget, onSetView: setCurrentView, onWarp, onScanQuadrant, onDockWithStarbase, onRechargeDilithium,
        onResupplyTorpedoes, onStarbaseRepairs, onSelectRepairTarget, onScanTarget, onInitiateRetreat, onCancelRetreat,
        onStartAwayMission, onChooseAwayMissionOption, onHailTarget, onCloseHail: () => setActiveHail(null),
        onCloseOfficerCounsel, onProceedFromCounsel, onSelectSubsystem, onChooseEventOption, saveGame, loadGame,
        exportSave, importSave, onDistributeEvenly, onSendAwayTeam, onToggleRedAlert, onCloseAwayMissionResult: () => setAwayMissionResult(null),
        onCloseEventResult: () => setEventResult(null),
    };
};
