import type { GameState, Ship, BridgeOfficer, LogEntry, SectorState, Entity, FactionOwner, Position, StarbaseType, ShipRole, PlanetClass, EventBeacon } from '../../types';
import { SECTOR_WIDTH, SECTOR_HEIGHT, QUADRANT_SIZE } from '../../assets/configs/gameConstants';
import { PLAYER_LOG_COLOR, SYSTEM_LOG_COLOR, ENEMY_LOG_COLORS } from '../../assets/configs/logColors';
import { shipClasses, type ShipClassStats } from '../../assets/ships/configs/shipClassStats';
import { sectorTemplates } from '../../assets/galaxy/sectorTemplates';
import { planetNames } from '../../assets/planets/configs/planetNames';
import { shipNames } from '../../assets/ships/configs/shipNames';
import { starbaseTypes } from '../../assets/starbases/configs/starbaseTypes';
import { planetTypes } from '../../assets/planets/configs/planetTypes';
import { uniqueId } from '../utils/helpers';

const getFactionOwner = (qx: number, qy: number): GameState['currentSector']['factionOwner'] => {
    const midX = QUADRANT_SIZE / 2;
    const midY = QUADRANT_SIZE / 2;
    if (qx < midX && qy < midY) return 'Klingon';
    if (qx >= midX && qy < midY) return 'Romulan';
    if (qx < midX && qy >= midY) return 'Federation';
    return 'None';
};

const createEntityFromTemplate = (
    template: any, position: Position, factionOwner: FactionOwner,
    availableShipNames: Record<string, string[]>, availablePlanetNames: Record<string, string[]>, colorIndex: { current: number }
): Entity | null => {
    const getUniqueShipName = (faction: string): string => {
        if (availableShipNames[faction]?.length > 0) {
            return availableShipNames[faction].splice(Math.floor(Math.random() * availableShipNames[faction].length), 1)[0];
        }
        return `${faction} Vessel ${uniqueId().substr(-4)}`;
    };

    const chosenFaction = template.faction === 'Inherit' ? factionOwner : template.faction;

    switch (template.type) {
        case 'ship': {
            if (chosenFaction === 'None' || chosenFaction === 'Unknown' || chosenFaction === 'Federation') return null;
            const factionShipClasses = shipClasses[chosenFaction];
            const potentialRoles: ShipRole[] = Array.isArray(template.shipRole) ? template.shipRole : [template.shipRole];
            const validClasses = Object.values(factionShipClasses).filter(c => potentialRoles.includes((c as ShipClassStats).role));
            if (validClasses.length === 0) return null;
            // FIX: Explicitly cast the selected ship stats to ShipClassStats to resolve type inference issues where `stats` was being treated as `unknown`.
            const stats = validClasses[Math.floor(Math.random() * validClasses.length)] as ShipClassStats;
            const newShip = {
                id: uniqueId(), name: getUniqueShipName(chosenFaction), type: 'ship', shipModel: chosenFaction,
                shipClass: stats.name, shipRole: stats.role, cloakingCapable: stats.cloakingCapable,
                faction: chosenFaction, position, hull: stats.maxHull, maxHull: stats.maxHull, shields: 0, maxShields: stats.maxShields,
                energy: { current: stats.energy.max, max: stats.energy.max }, energyAllocation: { weapons: 50, shields: 50, engines: 0 },
                torpedoes: { current: stats.torpedoes.max, max: stats.torpedoes.max },
                subsystems: JSON.parse(JSON.stringify(stats.subsystems)), securityTeams: { current: stats.securityTeams.max, max: stats.securityTeams.max },
                dilithium: { current: 0, max: 0 }, scanned: false, evasive: false, retreatingTurn: null,
                crewMorale: { current: 100, max: 100 }, repairTarget: null, logColor: ENEMY_LOG_COLORS[colorIndex.current++ % ENEMY_LOG_COLORS.length],
                lifeSupportReserves: { current: 100, max: 100 }, cloakState: 'visible', cloakCooldown: 0,
                isStunned: false, engineFailureTurn: null, lifeSupportFailureTurn: null, isDerelict: false, captureInfo: null,
                statusEffects: [],
            } as Ship;

            if (chosenFaction === 'Pirate' && Math.random() < 0.10) { // 10% chance
                newShip.cloakingCapable = true;
                newShip.customCloakStats = {
                    reliability: 0.60,
                    powerCost: 70,
                    subsystemDamageChance: 0.07,
                    explosionChance: 0.001,
                };
            }

            return newShip;
        }
        case 'planet': {
            const getPlanetClass = (): PlanetClass => {
                if (!template.planetClass) return 'M';
                const options = Array.isArray(template.planetClass) ? template.planetClass : [template.planetClass];
                return options[Math.floor(Math.random() * options.length)];
            };
            const planetClass = getPlanetClass();

            const nameList = availablePlanetNames[planetClass];
            const name = nameList?.length > 0 ? nameList.splice(Math.floor(Math.random() * nameList.length), 1)[0] : `Planet ${uniqueId()}`;
            return { id: uniqueId(), name, type: 'planet', faction: 'None', position, scanned: false, planetClass, awayMissionCompleted: false };
        }
        case 'starbase': {
            if (chosenFaction === 'None' || chosenFaction === 'Pirate' || chosenFaction === 'Independent' || chosenFaction === 'Unknown') return null;
            
            const getStarbaseType = (): StarbaseType => {
                if (!template.starbaseType) return 'command_station';
                const options = Array.isArray(template.starbaseType) ? template.starbaseType : [template.starbaseType];
                return options[Math.floor(Math.random() * options.length)];
            };
            const starbaseType = getStarbaseType();
            const config = starbaseTypes[starbaseType];

            if (!config) {
                console.error(`Could not find config for starbaseType: ${starbaseType}`);
                return null;
            }

            return {
                 id: uniqueId(), name: `${config.namePrefix[0]} ${Math.floor(Math.random() * 100) + 1}`, type: 'starbase',
                 faction: chosenFaction, position, scanned: false, hull: config.maxHull, maxHull: config.maxHull, starbaseType
             };
        }
        case 'asteroid_field': return { id: uniqueId(), name: 'Asteroid Field', type: 'asteroid_field', faction: 'None', position, scanned: true };
        case 'event_beacon': {
            const getEventType = (): EventBeacon['eventType'] => {
                if (!template.eventType) return 'derelict_ship';
                const options = Array.isArray(template.eventType) ? template.eventType : [template.eventType];
                return options[Math.floor(Math.random() * options.length)];
            };
            const eventType = getEventType();
            return { id: uniqueId(), name: 'Unidentified Signal', type: 'event_beacon', eventType, faction: 'Unknown', position, scanned: false, isResolved: false };
        }
    }
    return null;
};

const createSectorFromTemplate = (
    template: any, factionOwner: FactionOwner, availablePlanetNames: Record<string, string[]>,
    availableShipNames: Record<string, string[]>, colorIndex: { current: number }
): SectorState => {
    const newEntities: Entity[] = [];
    const takenPositions = new Set<string>();
    const getUniquePosition = () => {
        let pos;
        do { pos = { x: Math.floor(Math.random() * SECTOR_WIDTH), y: Math.floor(Math.random() * SECTOR_HEIGHT) };
        } while (takenPositions.has(`${pos.x},${pos.y}`));
        takenPositions.add(`${pos.x},${pos.y}`);
        return pos;
    };
    
    template.entityTemplates.forEach((et: any) => {
        const count = Math.floor(Math.random() * (et.count[1] - et.count[0] + 1)) + et.count[0];
        for (let i = 0; i < count; i++) {
            const newEntity = createEntityFromTemplate(et, getUniquePosition(), factionOwner, availableShipNames, availablePlanetNames, colorIndex);
            if (newEntity) newEntities.push(newEntity);
        }
    });

    return { entities: newEntities, visited: false, hasNebula: Math.random() < (template.hasNebulaChance || 0), factionOwner, isScanned: false };
};

export const createInitialGameState = (): GameState => {
  const playerStats = shipClasses.Federation['Sovereign-class'];
  const playerShip: Ship = {
    id: 'player', name: 'U.S.S. Endeavour', type: 'ship', shipModel: 'Federation', 
    shipClass: playerStats.name, shipRole: playerStats.role, cloakingCapable: playerStats.cloakingCapable,
    faction: 'Federation', position: { x: Math.floor(SECTOR_WIDTH / 2), y: SECTOR_HEIGHT - 2 },
    hull: playerStats.maxHull, maxHull: playerStats.maxHull, shields: 0, maxShields: playerStats.maxShields,
    subsystems: JSON.parse(JSON.stringify(playerStats.subsystems)),
    energy: { current: playerStats.energy.max, max: playerStats.energy.max }, energyAllocation: { weapons: 34, shields: 33, engines: 33 },
    torpedoes: { current: playerStats.torpedoes.max, max: playerStats.torpedoes.max }, dilithium: { current: 20, max: 20 },
    scanned: true, evasive: false, retreatingTurn: null,
    crewMorale: { current: 100, max: 100 }, securityTeams: { current: playerStats.securityTeams.max, max: playerStats.securityTeams.max }, repairTarget: null,
    logColor: PLAYER_LOG_COLOR, lifeSupportReserves: { current: 100, max: 100 }, cloakState: 'visible', cloakCooldown: 0,
    isStunned: false, engineFailureTurn: null, lifeSupportFailureTurn: null, isDerelict: false, captureInfo: null, statusEffects: [],
  };

  const playerCrew: BridgeOfficer[] = [
    { id: 'officer-1', name: "Cmdr. T'Vok", role: 'Science', personality: 'Logical' },
    { id: 'officer-2', name: 'Lt. Thorne', role: 'Security', personality: 'Aggressive' },
    { id: 'officer-3', name: 'Lt. Cmdr. Singh', role: 'Engineering', personality: 'Cautious' },
  ];

  const quadrantMap: GameState['quadrantMap'] = Array.from({ length: QUADRANT_SIZE }, () => Array.from({ length: QUADRANT_SIZE }, () => ({ entities: [], visited: false, hasNebula: false, factionOwner: 'None', isScanned: false })));
  const availablePlanetNames: Record<string, string[]> = JSON.parse(JSON.stringify(planetNames));
  const availableShipNames: Record<string, string[]> = JSON.parse(JSON.stringify(shipNames));
  const colorIndex = { current: 0 };

  for (let qy = 0; qy < QUADRANT_SIZE; qy++) {
      for (let qx = 0; qx < QUADRANT_SIZE; qx++) {
          const factionOwner = getFactionOwner(qx, qy);
          const validTemplates = sectorTemplates.filter(t => t.allowedFactions.includes(factionOwner));
          const totalWeight = validTemplates.reduce((sum, t) => sum + t.weight, 0);
          let roll = Math.random() * totalWeight;
          const chosenTemplate = validTemplates.find(t => (roll -= t.weight) <= 0) || validTemplates[0];
          if (chosenTemplate) quadrantMap[qy][qx] = createSectorFromTemplate(chosenTemplate, factionOwner, availablePlanetNames, availableShipNames, colorIndex);
      }
  }

  const playerPosition = { qx: 1, qy: 6 };
  quadrantMap.forEach((row, qy) => row.forEach((sector, qx) => { if(sector.factionOwner === 'Federation') { sector.visited = true; sector.isScanned = true; }}));
  
  let startSector = quadrantMap[playerPosition.qy][playerPosition.qx];
  startSector.entities = startSector.entities.filter(e => !['Klingon', 'Romulan', 'Pirate'].includes(e.faction) && e.type !== 'event_beacon');
  if (!startSector.entities.some(e => e.type === 'starbase')) {
      startSector.entities.push({ id: uniqueId(), name: `Starbase 364`, type: 'starbase', faction: 'Federation', position: { x: 2, y: 2 }, scanned: true, hull: 500, maxHull: 500, starbaseType: 'command_station' });
  }

  const initialLog: LogEntry = { id: uniqueId(), turn: 1, sourceId: 'system', sourceName: "Captain's Log", message: "Stardate 47458.2. We have entered the Typhon Expanse.", color: SYSTEM_LOG_COLOR, isPlayerSource: false };

  return {
    player: { ship: playerShip, position: playerPosition, crew: playerCrew },
    quadrantMap, currentSector: startSector, turn: 1, logs: [initialLog],
    gameOver: false, gameWon: false, redAlert: false, combatEffects: [], isRetreatingWarp: false,
    usedAwayMissionSeeds: [], usedAwayMissionTemplateIds: [], desperationMoveAnimations: [], orbitingPlanetId: null,
  };
};