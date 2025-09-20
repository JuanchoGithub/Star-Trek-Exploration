import type { GameState, QuadrantPosition, Ship, SectorState, Entity, EventBeacon, PlanetClass, FactionOwner, ShipRole, ShipSubsystems, BridgeOfficer, LogEntry } from '../../types';
import { planetNames } from '../../assets/planets/configs/planetNames';
import { planetClasses, planetTypes } from '../../assets/planets/configs/planetTypes';
import { shipNames } from '../../assets/ships/configs/shipNames';
import { shipRoleStats } from '../../assets/ships/configs/shipRoleStats';
import { SECTOR_WIDTH, SECTOR_HEIGHT, QUADRANT_SIZE } from '../../assets/configs/gameConstants';
import { PLAYER_LOG_COLOR, SYSTEM_LOG_COLOR, ENEMY_LOG_COLORS } from '../../assets/configs/logColors';
import { uniqueId } from '../utils/ai';

export const getFactionOwner = (qx: number, qy: number): FactionOwner => {
    const midX = QUADRANT_SIZE / 2;
    const midY = QUADRANT_SIZE / 2;

    if (qx < midX && qy < midY) return 'Klingon';
    if (qx >= midX && qy < midY) return 'Romulan';
    if (qx < midX && qy >= midY) return 'Federation';
    
    return 'None';
};

const generateSectorContent = (sector: SectorState, qx: number, qy: number, availablePlanetNames?: Record<string, string[]>, availableShipNames?: Record<string, string[]>, colorIndex?: { current: number }): SectorState => {
    const newEntities: Entity[] = [];
    const entityCount = Math.floor(Math.random() * 4) + 2;
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
            nameList.splice(nameIndex, 1);
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
                const nameList = availablePlanetNames[planetConfig.typeName as PlanetClass];
                if (nameList && nameList.length > 0) {
                    const nameIndex = Math.floor(Math.random() * nameList.length);
                    name = nameList[nameIndex];
                    nameList.splice(nameIndex, 1);
                } else {
                    name = `Uncharted Planet ${uniqueId().substr(-4)}`;
                }
            } else {
                const nameList = planetNames[planetConfig.typeName as PlanetClass] || ['Unknown Planet'];
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
    const availablePlanetNames: Record<string, string[]> = JSON.parse(JSON.stringify(planetNames));
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

export const createInitialGameState = (): GameState => {
  const playerStats = shipRoleStats.Dreadnought;
  const playerShip: Ship = {
    id: 'player', name: 'U.S.S. Endeavour', type: 'ship', shipModel: 'Federation', shipRole: 'Dreadnought',
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
    // FIX: Added missing 'desperationMoveAnimations' property to align with the GameState interface.
    desperationMoveAnimations: [],
  };
};
