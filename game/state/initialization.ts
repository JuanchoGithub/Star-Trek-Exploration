import type { GameState, Ship, BridgeOfficer, LogEntry, SectorState, Entity, FactionOwner, Position, StarbaseType, ShipRole, PlanetClass, EventBeacon, SectorTemplate, AsteroidField, BeamWeapon, ProjectileWeapon, AmmoType } from '../../types';
import { SECTOR_WIDTH, SECTOR_HEIGHT, QUADRANT_SIZE } from '../../assets/configs/gameConstants';
import { PLAYER_LOG_COLOR, SYSTEM_LOG_COLOR, ENEMY_LOG_COLORS } from '../../assets/configs/logColors';
import { shipClasses, type ShipClassStats } from '../../assets/ships/configs/shipClassStats';
import { sectorTemplates } from '../../assets/galaxy/sectorTemplates';
import { planetNames } from '../../assets/planets/configs/planetNames';
import { shipNames } from '../../assets/ships/configs/shipNames';
import { starbaseTypes } from '../../assets/starbases/configs/starbaseTypes';
import { planetTypes } from '../../assets/planets/configs/planetTypes';
import { uniqueId } from '../utils/ai';
import { seededRandom, cyrb53 } from '../utils/helpers';
import { WEAPON_PHASER_TYPE_IV, WEAPON_PHASER_TYPE_V, WEAPON_PHASER_TYPE_VI, WEAPON_PHASER_TYPE_VII, WEAPON_PHASER_TYPE_VIII, WEAPON_PHASER_TYPE_IX, WEAPON_PHASER_TYPE_X } from '../../assets/weapons/weaponRegistry';

const getFactionOwner = (qx: number, qy: number): GameState['currentSector']['factionOwner'] => {
    const midX = QUADRANT_SIZE / 2;
    const midY = QUADRANT_SIZE / 2;
    if (qx < midX && qy < midY) return 'Klingon';
    if (qx >= midX && qy < midY) return 'Romulan';
    if (qx < midX && qy >= midY) return 'Federation';
    return 'None';
};

const generateNebulaField = (rand: () => number): Position[] => {
    const cells = new Set<string>();
    const percentage = 0.3 + rand() * 0.4; // 30% to 70%
    const targetCellCount = Math.floor(SECTOR_WIDTH * SECTOR_HEIGHT * percentage);

    if (targetCellCount === 0) return [];

    const seeds: Position[] = [];
    for (let i = 0; i < 3; i++) {
        seeds.push({
            x: Math.floor(rand() * SECTOR_WIDTH),
            y: Math.floor(rand() * SECTOR_HEIGHT),
        });
    }

    const queue: Position[] = [...seeds];
    seeds.forEach(p => cells.add(`${p.x},${p.y}`));

    while (cells.size < targetCellCount && queue.length > 0) {
        const current = queue.shift()!;
        
        const neighbors = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 },
        ].sort(() => rand() - 0.5);

        for (const neighbor of neighbors) {
            if (
                neighbor.x >= 0 && neighbor.x < SECTOR_WIDTH &&
                neighbor.y >= 0 && neighbor.y < SECTOR_HEIGHT &&
                !cells.has(`${neighbor.x},${neighbor.y}`) &&
                cells.size < targetCellCount
            ) {
                if (rand() < 0.8) {
                    cells.add(`${neighbor.x},${neighbor.y}`);
                    queue.push(neighbor);
                }
            }
        }
        
        if (queue.length === 0 && cells.size < targetCellCount) {
             let newSeed: Position;
             do {
                 newSeed = {
                    x: Math.floor(rand() * SECTOR_WIDTH),
                    y: Math.floor(rand() * SECTOR_HEIGHT),
                };
             } while (cells.has(`${newSeed.x},${newSeed.y}`));
             queue.push(newSeed);
             cells.add(`${newSeed.x},${newSeed.y}`);
        }
    }

    return Array.from(cells).map(s => {
        const [x, y] = s.split(',').map(Number);
        return { x, y };
    });
};

const createEntityFromTemplate = (
    template: any, position: Position, factionOwner: FactionOwner,
    availableShipNames: Record<string, string[]>, availablePlanetNames: Record<string, string[]>, colorIndex: { current: number },
    rand: () => number
): Entity | null => {
    const getUniqueShipName = (faction: string): string => {
        if (availableShipNames[faction]?.length > 0) {
            return availableShipNames[faction].splice(Math.floor(rand() * availableShipNames[faction].length), 1)[0];
        }
        return `${faction} Vessel ${uniqueId().substr(-4)}`;
    };

    const chosenFaction = template.faction === 'Inherit' ? factionOwner : template.faction;

    switch (template.type) {
        case 'ship': {
            if (chosenFaction === 'None' || chosenFaction === 'Unknown') return null;
            const factionShipClasses = shipClasses[chosenFaction];
            const potentialRoles: ShipRole[] = Array.isArray(template.shipRole) ? template.shipRole : [template.shipRole];
            const validClasses = Object.values(factionShipClasses).filter(c => potentialRoles.includes((c as ShipClassStats).role));
            if (validClasses.length === 0) return null;
            const stats = validClasses[Math.floor(rand() * validClasses.length)] as ShipClassStats;
            
            let allegiance: Ship['allegiance'] = 'neutral';
            if (chosenFaction === 'Klingon' || chosenFaction === 'Romulan' || chosenFaction === 'Pirate') {
                allegiance = 'enemy';
            } else if (chosenFaction === 'Federation') {
                allegiance = 'ally';
            } else if (chosenFaction === 'Independent') {
                allegiance = 'neutral';
            }

            const newShip = {
                id: uniqueId(), name: getUniqueShipName(chosenFaction), type: 'ship', shipModel: chosenFaction,
                shipClass: stats.name, shipRole: stats.role, cloakingCapable: stats.cloakingCapable,
                faction: chosenFaction, position, allegiance, hull: stats.maxHull, maxHull: stats.maxHull, shields: 0, maxShields: stats.maxShields,
                energy: { current: stats.energy.max, max: stats.energy.max }, energyAllocation: { weapons: 50, shields: 50, engines: 0 },
                subsystems: JSON.parse(JSON.stringify(stats.subsystems)), securityTeams: { current: stats.securityTeams.max, max: stats.securityTeams.max },
                dilithium: { current: stats.dilithium.max, max: stats.dilithium.max }, scanned: false, evasive: false, retreatingTurn: null,
                crewMorale: { current: 100, max: 100 }, repairTarget: null, logColor: ENEMY_LOG_COLORS[colorIndex.current++ % ENEMY_LOG_COLORS.length],
                lifeSupportReserves: { current: 100, max: 100 }, cloakState: 'visible', cloakCooldown: 0, shieldReactivationTurn: null,
                cloakInstability: 0, cloakDestabilizedThisTurn: false,
                cloakTransitionTurnsRemaining: null,
                isStunned: false, engineFailureTurn: null, lifeSupportFailureTurn: null, isDerelict: false, captureInfo: null,
                statusEffects: [], lastKnownPlayerPosition: null, pointDefenseEnabled: false, energyModifier: stats.energyModifier,
                lastAttackerPosition: null,
                // @deprecated
                torpedoes: { current: stats.torpedoes.max, max: stats.torpedoes.max },
                // New weapon system
                weapons: JSON.parse(JSON.stringify(stats.weapons)),
                ammo: Object.keys(stats.ammo).reduce((acc, key) => {
                    acc[key as AmmoType] = { current: stats.ammo[key as AmmoType]!.max, max: stats.ammo[key as AmmoType]!.max };
                    return acc;
                }, {} as Ship['ammo']),
            } as Ship;

            if (newShip.shipModel === 'Federation') {
                let phaserOptions: BeamWeapon[] = [];
                switch (newShip.shipClass) {
                    case 'Sovereign-class':
                        phaserOptions = [WEAPON_PHASER_TYPE_VIII, WEAPON_PHASER_TYPE_IX, WEAPON_PHASER_TYPE_X];
                        break;
                    case 'Constitution-class':
                        phaserOptions = [WEAPON_PHASER_TYPE_V, WEAPON_PHASER_TYPE_VI, WEAPON_PHASER_TYPE_VII];
                        break;
                    case 'Galaxy-class':
                        phaserOptions = [WEAPON_PHASER_TYPE_IV, WEAPON_PHASER_TYPE_V, WEAPON_PHASER_TYPE_VI];
                        break;
                    case 'Intrepid-class':
                        phaserOptions = [WEAPON_PHASER_TYPE_VII, WEAPON_PHASER_TYPE_VIII, WEAPON_PHASER_TYPE_IX];
                        break;
                }

                if (phaserOptions.length > 0) {
                    const chosenPhaser = phaserOptions[Math.floor(rand() * phaserOptions.length)];
                    
                    const phaserIndex = newShip.weapons.findIndex(w => w.type === 'beam' && w.animationType !== 'pulse');
                    if (phaserIndex !== -1) {
                        newShip.weapons[phaserIndex] = chosenPhaser;
                    }
                }
            }

            if (chosenFaction === 'Pirate' && rand() < 0.10) { // 10% chance
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
                return options[Math.floor(rand() * options.length)];
            };
            const planetClass = getPlanetClass();

            const nameList = availablePlanetNames[planetClass];
            const name = nameList?.length > 0 ? nameList.splice(Math.floor(rand() * nameList.length), 1)[0] : `Planet ${uniqueId()}`;
            return { id: uniqueId(), name, type: 'planet', faction: 'None', position, scanned: false, planetClass, awayMissionCompleted: false };
        }
        case 'starbase': {
            if (chosenFaction === 'None' || chosenFaction === 'Pirate' || chosenFaction === 'Independent' || chosenFaction === 'Unknown') return null;
            
            const getStarbaseType = (): StarbaseType => {
                if (!template.starbaseType) return 'command_station';
                const options = Array.isArray(template.starbaseType) ? template.starbaseType : [template.starbaseType];
                return options[Math.floor(rand() * options.length)];
            };
            const starbaseType = getStarbaseType();
            const config = starbaseTypes[starbaseType];

            if (!config) {
                console.error(`Could not find config for starbaseType: ${starbaseType}`);
                return null;
            }

            return {
                 id: uniqueId(), name: `${config.namePrefix[0]} ${Math.floor(rand() * 100) + 1}`, type: 'starbase',
                 faction: chosenFaction, position, scanned: false, hull: config.maxHull, maxHull: config.maxHull, starbaseType
             };
        }
        case 'asteroid_field': return { id: uniqueId(), name: 'Asteroid Field', type: 'asteroid_field', faction: 'None', position, scanned: true };
        case 'event_beacon': {
            const getEventType = (): EventBeacon['eventType'] => {
                if (!template.eventType) return 'derelict_ship';
                const options = Array.isArray(template.eventType) ? template.eventType : [template.eventType];
                return options[Math.floor(rand() * options.length)];
            };
            const eventType = getEventType();
            return { id: uniqueId(), name: 'Unidentified Signal', type: 'event_beacon', eventType, faction: 'Unknown', position, scanned: false, isResolved: false };
        }
    }
    return null;
};

// FIX: Export the 'createSectorFromTemplate' function to make it available for import in other modules.
export const createSectorFromTemplate = (
    template: SectorTemplate, factionOwner: FactionOwner, 
    availablePlanetNames: Record<string, string[]>,
    availableShipNames: Record<string, string[]>, 
    colorIndex: { current: number },
    seed: string
): SectorState => {
    const newEntities: Entity[] = [];
    const takenPositions = new Set<string>();
    const rand = seededRandom(cyrb53(seed));

    const getUniquePosition = () => {
        let pos;
        do { pos = { x: Math.floor(rand() * SECTOR_WIDTH), y: Math.floor(rand() * SECTOR_HEIGHT) };
        } while (takenPositions.has(`${pos.x},${pos.y}`));
        takenPositions.add(`${pos.x},${pos.y}`);
        return pos;
    };
    
    // Special handling for asteroid fields to create clusters
    const asteroidTemplate = template.entityTemplates.find(et => et.type === 'asteroid_field');
    if (asteroidTemplate) {
        const clusterCount = Math.floor(rand() * (asteroidTemplate.count[1] - asteroidTemplate.count[0] + 1)) + asteroidTemplate.count[0];
        
        for (let i = 0; i < clusterCount; i++) {
            const clusterSize = Math.floor(rand() * (9 - 3 + 1)) + 3;
            const clusterPositions: Position[] = [];
            const queue: Position[] = [];
            
            let startPos: Position;
            let attempts = 0;
            do {
                startPos = { x: Math.floor(rand() * SECTOR_WIDTH), y: Math.floor(rand() * SECTOR_HEIGHT) };
                attempts++;
            } while (takenPositions.has(`${startPos.x},${startPos.y}`) && attempts < 50);

            if (attempts >= 50) continue; // Couldn't find a spot, skip this cluster

            takenPositions.add(`${startPos.x},${startPos.y}`);
            clusterPositions.push(startPos);
            queue.push(startPos);

            while (clusterPositions.length < clusterSize && queue.length > 0) {
                const current = queue.shift()!;
                const neighbors = [
                    { x: current.x + 1, y: current.y }, { x: current.x - 1, y: current.y },
                    { x: current.x, y: current.y + 1 }, { x: current.x, y: current.y - 1 },
                ].sort(() => rand() - 0.5); // Shuffle neighbors

                for (const neighbor of neighbors) {
                    if (clusterPositions.length >= clusterSize) break;
                    const posKey = `${neighbor.x},${neighbor.y}`;
                    if (neighbor.x >= 0 && neighbor.x < SECTOR_WIDTH && neighbor.y >= 0 && neighbor.y < SECTOR_HEIGHT && !takenPositions.has(posKey)) {
                        if (rand() < 0.75) { 
                            takenPositions.add(posKey);
                            clusterPositions.push(neighbor);
                            queue.push(neighbor);
                        }
                    }
                }
            }

            for (const pos of clusterPositions) {
                newEntities.push({
                    id: uniqueId(),
                    name: 'Asteroid Field',
                    type: 'asteroid_field',
                    faction: 'None',
                    position: pos,
                    scanned: true,
                } as AsteroidField);
            }
        }
    }
    
    // Process all other entity templates
    const otherTemplates = template.entityTemplates.filter(et => et.type !== 'asteroid_field');
    otherTemplates.forEach((et: any) => {
        const count = Math.floor(rand() * (et.count[1] - et.count[0] + 1)) + et.count[0];
        for (let i = 0; i < count; i++) {
            const newEntity = createEntityFromTemplate(et, getUniquePosition(), factionOwner, availableShipNames, availablePlanetNames, colorIndex, rand);
            if (newEntity) newEntities.push(newEntity);
        }
    });

    const hasNebula = rand() < (template.hasNebulaChance || 0);
    return {
        templateId: template.id,
        seed,
        entities: newEntities,
        visited: false,
        hasNebula,
        nebulaCells: hasNebula ? generateNebulaField(rand) : [],
        factionOwner,
        isScanned: false
    };
};

export const createInitialGameState = (): GameState => {
  const playerStats = shipClasses.Federation['Sovereign-class'];

  const playerPhaserOptions = [WEAPON_PHASER_TYPE_VIII, WEAPON_PHASER_TYPE_IX, WEAPON_PHASER_TYPE_X];
  const chosenPlayerPhaser = playerPhaserOptions[Math.floor(Math.random() * playerPhaserOptions.length)];
  const playerWeapons = JSON.parse(JSON.stringify(playerStats.weapons));
  const playerPhaserIndex = playerWeapons.findIndex((w: BeamWeapon) => w.type === 'beam' && w.animationType !== 'pulse');
  if (playerPhaserIndex !== -1) {
      playerWeapons[playerPhaserIndex] = chosenPlayerPhaser;
  }

  const playerShip: Ship = {
    id: 'player', name: 'U.S.S. Endeavour', type: 'ship', shipModel: 'Federation', 
    shipClass: playerStats.name, shipRole: playerStats.role, cloakingCapable: playerStats.cloakingCapable,
    faction: 'Federation', position: { x: Math.floor(SECTOR_WIDTH / 2), y: SECTOR_HEIGHT - 2 },
    allegiance: 'player',
    hull: playerStats.maxHull, maxHull: playerStats.maxHull, shields: 0, maxShields: playerStats.maxShields,
    subsystems: JSON.parse(JSON.stringify(playerStats.subsystems)),
    energy: { current: playerStats.energy.max, max: playerStats.energy.max }, energyAllocation: { weapons: 34, shields: 33, engines: 33 },
    dilithium: { current: playerStats.dilithium.max, max: playerStats.dilithium.max },
    scanned: true, evasive: false, retreatingTurn: null,
    crewMorale: { current: 100, max: 100 }, securityTeams: { current: playerStats.securityTeams.max, max: playerStats.securityTeams.max }, repairTarget: null,
    logColor: PLAYER_LOG_COLOR, lifeSupportReserves: { current: 100, max: 100 }, cloakState: 'visible', cloakCooldown: 0, shieldReactivationTurn: null,
    cloakInstability: 0, cloakDestabilizedThisTurn: false,
    // FIX: Add missing 'cloakTransitionTurnsRemaining' property to conform to the Ship interface.
    cloakTransitionTurnsRemaining: null,
    isStunned: false, engineFailureTurn: null, lifeSupportFailureTurn: null, isDerelict: false, captureInfo: null, statusEffects: [], pointDefenseEnabled: false,
    energyModifier: playerStats.energyModifier,
    lastAttackerPosition: null,
    // @deprecated
    torpedoes: { current: playerStats.torpedoes.max, max: playerStats.torpedoes.max },
    // New weapon system
    weapons: playerWeapons,
    ammo: Object.keys(playerStats.ammo).reduce((acc, key) => {
        acc[key as AmmoType] = { current: playerStats.ammo[key as AmmoType]!.max, max: playerStats.ammo[key as AmmoType]!.max };
        return acc;
    }, {} as Ship['ammo']),
  };

  const playerCrew: BridgeOfficer[] = [
    { id: 'officer-1', name: "Cmdr. T'Vok", role: 'Science', personality: 'Logical' },
    { id: 'officer-2', name: 'Lt. Thorne', role: 'Security', personality: 'Aggressive' },
    { id: 'officer-3', name: 'Lt. Cmdr. Singh', role: 'Engineering', personality: 'Cautious' },
  ];

  const quadrantMap: GameState['quadrantMap'] = Array.from({ length: QUADRANT_SIZE }, () => Array.from({ length: QUADRANT_SIZE }, () => ({ entities: [], visited: false, hasNebula: false, nebulaCells: [], factionOwner: 'None', isScanned: false, seed: '', templateId: '' })));
  const availablePlanetNames: Record<string, string[]> = JSON.parse(JSON.stringify(planetNames));
  const availableShipNames: Record<string, string[]> = JSON.parse(JSON.stringify(shipNames));
  const colorIndex = { current: 0 };
  const galaxySeed = `galaxy_${Math.random().toString(36).substring(2, 11)}`;

  for (let qy = 0; qy < QUADRANT_SIZE; qy++) {
      for (let qx = 0; qx < QUADRANT_SIZE; qx++) {
          const factionOwner = getFactionOwner(qx, qy);
          const validTemplates = sectorTemplates.filter(t => t.allowedFactions.includes(factionOwner));
          const totalWeight = validTemplates.reduce((sum, t) => sum + t.weight, 0);
          let roll = Math.random() * totalWeight;
          const chosenTemplate = validTemplates.find(t => (roll -= t.weight) <= 0) || validTemplates[0];
          const sectorSeed = `${galaxySeed}_${qx}_${qy}`;
          if (chosenTemplate) {
            quadrantMap[qy][qx] = createSectorFromTemplate(chosenTemplate, factionOwner, availablePlanetNames, availableShipNames, colorIndex, sectorSeed);
          }
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
    replayHistory: [],
    isDocked: false,
  };
}