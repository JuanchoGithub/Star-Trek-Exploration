import { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
// FIX: Added Position to the type import and changed QuadrantPosition to Position in createEntityFromTemplate signature.
import type { GameState, QuadrantPosition, Ship, AwayMissionTemplate, ActiveHail, ActiveAwayMission, Entity, PlayerTurnActions, EventTemplate, EventTemplateOption, EventBeacon, PlanetClass, ActiveAwayMissionOption, AwayMissionResult, ResourceType, LogEntry, Planet, BridgeOfficer, OfficerAdvice, ShipSubsystems, SectorTemplate, EntityTemplate, FactionOwner, Position, StarbaseType, ShipRole } from '../types';
import { awayMissionTemplates, hailResponses, counselAdvice, eventTemplates } from '../assets/content';
import { SAVE_GAME_KEY } from '../assets/configs/gameConstants';
import { applyPhaserDamage } from './combatUtilities';
import { processAITurns } from './ai/aiProcessor';
import { AIActions } from './ai/FactionAI';
import { shipClasses } from '../assets/ships/configs/shipClassStats';
import { seededRandom, cyrb53 } from './ai/aiUtilities';
import { consumeEnergy } from './combatUtilities';
import { uniqueId, moveOneStep } from './ai/aiUtilities';
import { PLAYER_LOG_COLOR, SYSTEM_LOG_COLOR, ENEMY_LOG_COLORS } from '../assets/configs/logColors';
import { QUADRANT_SIZE, SECTOR_HEIGHT, SECTOR_WIDTH } from '../assets/configs/gameConstants';
import { planetNames } from '../assets/planets/configs/planetNames';
import { planetClasses, planetTypes } from '../assets/planets/configs/planetTypes';
import { shipNames } from '../assets/ships/configs/shipNames';
import { sectorTemplates } from '../assets/galaxy/sectorTemplates';
import { starbaseTypes } from '../assets/starbases/configs/starbaseTypes';


const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

const getEnergyOutputMultiplier = (engineHealthPercent: number): number => {
    const H = engineHealthPercent;
    if (H > 0.75) {
        return 0.9 + (H - 0.75) * 0.4; // Interpolate between (1.0, 1.0) and (0.75, 0.9)
    }
    if (H > 0.25) {
        return 0.5 + (H - 0.25) * 0.8; // Interpolate between (0.75, 0.9) and (0.25, 0.5)
    }
    return H * 2; // Interpolate between (0.25, 0.5) and (0.0, 0.0)
};

const getFactionOwner = (qx: number, qy: number): GameState['currentSector']['factionOwner'] => {
    const midX = QUADRANT_SIZE / 2;
    const midY = QUADRANT_SIZE / 2;

    if (qx < midX && qy < midY) return 'Klingon';
    if (qx >= midX && qy < midY) return 'Romulan';
    if (qx < midX && qy >= midY) return 'Federation';
    
    return 'None';
};

const createEntityFromTemplate = (
    template: EntityTemplate,
    position: Position,
    factionOwner: FactionOwner,
    availableShipNames: Record<string, string[]>,
    availablePlanetNames: Record<string, string[]>,
    colorIndex: { current: number }
): Entity | null => {
    const getUniqueShipName = (faction: string): string => {
        if (availableShipNames[faction]?.length > 0) {
            const nameList = availableShipNames[faction];
            const nameIndex = Math.floor(Math.random() * nameList.length);
            return nameList.splice(nameIndex, 1)[0];
        }
        return `${faction} Vessel ${uniqueId().substr(-4)}`;
    };

    const getNextShipColor = (): string => {
        const color = ENEMY_LOG_COLORS[colorIndex.current];
        colorIndex.current = (colorIndex.current + 1) % ENEMY_LOG_COLORS.length;
        return color;
    };
    
    const chosenFaction = template.faction === 'Inherit' ? factionOwner : template.faction;

    switch (template.type) {
        case 'ship': {
            if (chosenFaction === 'None' || chosenFaction === 'Unknown' || chosenFaction === 'Federation') return null; // Player faction ships are not randomly generated this way
            
            const factionShipClasses = shipClasses[chosenFaction];
            if (!factionShipClasses) return null;

            let potentialRoles: ShipRole[];
            if (Array.isArray(template.shipRole)) {
                potentialRoles = template.shipRole;
            } else if (template.shipRole) {
                potentialRoles = [template.shipRole];
            } else {
                potentialRoles = Object.values(factionShipClasses).map(c => c.role);
            }

            const validClasses = Object.values(factionShipClasses).filter(c => potentialRoles.includes(c.role));
            if (validClasses.length === 0) return null;

            const stats = validClasses[Math.floor(Math.random() * validClasses.length)];

            let energyAllocation: Ship['energyAllocation'];
            switch (chosenFaction) {
                case 'Klingon': case 'Romulan': energyAllocation = { weapons: 50, shields: 50, engines: 0 }; break;
                case 'Pirate': energyAllocation = { weapons: 60, shields: 40, engines: 0 }; break;
                default: energyAllocation = { weapons: 0, shields: 0, engines: 100 }; break;
            }

            return {
                id: uniqueId(), name: getUniqueShipName(chosenFaction), type: 'ship', shipModel: chosenFaction, 
                shipClass: stats.name, shipRole: stats.role, cloakingCapable: stats.cloakingCapable,
                faction: chosenFaction, position, 
                hull: stats.maxHull, maxHull: stats.maxHull, shields: 0, maxShields: stats.maxShields, 
                energy: { current: stats.energy.max, max: stats.energy.max }, energyAllocation, 
                torpedoes: { current: stats.torpedoes.max, max: stats.torpedoes.max }, 
                subsystems: JSON.parse(JSON.stringify(stats.subsystems)), 
                securityTeams: { current: stats.securityTeams.max, max: stats.securityTeams.max }, 
                dilithium: { current: 0, max: 0 }, scanned: false, evasive: false, retreatingTurn: null, 
                crewMorale: { current: 100, max: 100 }, repairTarget: null, logColor: getNextShipColor(), 
                lifeSupportReserves: { current: 100, max: 100 },
                cloakState: 'visible',
                cloakCooldown: 0,
                isStunned: false,
                engineFailureTurn: null,
                isDerelict: false,
                captureInfo: null,
            } as Ship;
        }
        case 'planet': {
             let planetClass: PlanetClass;
            if (Array.isArray(template.planetClass)) {
                planetClass = template.planetClass[Math.floor(Math.random() * template.planetClass.length)];
            } else {
                planetClass = template.planetClass || planetClasses[Math.floor(Math.random() * planetClasses.length)];
            }
            const planetConfig = planetTypes[planetClass];
            let name: string;
            const nameList = availablePlanetNames[planetConfig.typeName as PlanetClass];
            if (nameList?.length > 0) name = nameList.splice(Math.floor(Math.random() * nameList.length), 1)[0];
            else name = `Uncharted Planet ${uniqueId().substr(-4)}`;
            
            return { id: uniqueId(), name, type: 'planet', faction: 'None', position, scanned: false, planetClass, awayMissionCompleted: false };
        }
        case 'starbase': {
             if (chosenFaction === 'None' || chosenFaction === 'Pirate' || chosenFaction === 'Independent' || chosenFaction === 'Unknown') return null;
             
             let starbaseType: StarbaseType;
             if (Array.isArray(template.starbaseType)) {
                starbaseType = template.starbaseType[Math.floor(Math.random() * template.starbaseType.length)];
             } else {
                starbaseType = template.starbaseType || 'command_station';
             }

             const config = starbaseTypes[starbaseType];
             const namePrefix = config.namePrefix[Math.floor(Math.random() * config.namePrefix.length)];

             return {
                 id: uniqueId(),
                 name: `${namePrefix} ${Math.floor(Math.random() * 100) + 1}`,
                 type: 'starbase',
                 faction: chosenFaction,
                 position,
                 scanned: false,
                 hull: config.maxHull,
                 maxHull: config.maxHull,
                 starbaseType: config.key
             };
        }
        case 'asteroid_field': {
            return { id: uniqueId(), name: 'Asteroid Field', type: 'asteroid_field', faction: 'None', position, scanned: true };
        }
        case 'event_beacon': {
             const eventTypes: EventBeacon['eventType'][] = ['derelict_ship', 'distress_call', 'ancient_probe'];
             let eventType: EventBeacon['eventType'];
             if(Array.isArray(template.eventType)) {
                eventType = template.eventType[Math.floor(Math.random() * template.eventType.length)];
             } else {
                eventType = template.eventType || eventTypes[Math.floor(Math.random() * eventTypes.length)];
             }
             return { id: uniqueId(), name: 'Unidentified Signal', type: 'event_beacon', eventType, faction: 'Unknown', position, scanned: false, isResolved: false };
        }
        default:
            return null;
    }
};

const createSectorFromTemplate = (
    template: SectorTemplate,
    factionOwner: FactionOwner,
    availablePlanetNames: Record<string, string[]>,
    availableShipNames: Record<string, string[]>,
    colorIndex: { current: number }
): GameState['currentSector'] => {
    const newEntities: Entity[] = [];
    const takenPositions = new Set<string>();

    const getUniquePosition = () => {
        let pos;
        let tries = 0;
        do {
            pos = { x: Math.floor(Math.random() * SECTOR_WIDTH), y: Math.floor(Math.random() * SECTOR_HEIGHT) };
            tries++;
        } while (takenPositions.has(`${pos.x},${pos.y}`) && tries < 50);
        takenPositions.add(`${pos.x},${pos.y}`);
        return pos;
    };
    
    template.entityTemplates.forEach(entityTemplate => {
        const count = Math.floor(Math.random() * (entityTemplate.count[1] - entityTemplate.count[0] + 1)) + entityTemplate.count[0];
        for (let i = 0; i < count; i++) {
            const position = getUniquePosition();
            const newEntity = createEntityFromTemplate(entityTemplate, position, factionOwner, availableShipNames, availablePlanetNames, colorIndex);
            if (newEntity) {
                newEntities.push(newEntity);
            }
        }
    });

    const hasNebula = Math.random() < (template.hasNebulaChance || 0.1);

    return { entities: newEntities, visited: false, hasNebula, factionOwner, isScanned: false };
}


const createInitialGameState = (): GameState => {
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
    logColor: PLAYER_LOG_COLOR,
    lifeSupportReserves: { current: 100, max: 100 },
    cloakState: 'visible',
    cloakCooldown: 0,
    isStunned: false,
    engineFailureTurn: null,
    isDerelict: false,
    captureInfo: null,
  };

  const playerCrew: BridgeOfficer[] = [
    { id: 'officer-1', name: "Cmdr. T'Vok", role: 'Science', personality: 'Logical' },
    { id: 'officer-2', name: 'Lt. Thorne', role: 'Security', personality: 'Aggressive' },
    { id: 'officer-3', name: 'Lt. Cmdr. Singh', role: 'Engineering', personality: 'Cautious' },
  ];

    let quadrantMap: GameState['quadrantMap'] = Array.from({ length: QUADRANT_SIZE }, () =>
        Array.from({ length: QUADRANT_SIZE }, () => ({ entities: [], visited: false, hasNebula: false, factionOwner: 'None', isScanned: false }))
    );

    const availablePlanetNames: Record<string, string[]> = JSON.parse(JSON.stringify(planetNames));
    const availableShipNames: Record<string, string[]> = JSON.parse(JSON.stringify(shipNames));
    const colorIndex = { current: 0 };

    for (let qy = 0; qy < QUADRANT_SIZE; qy++) {
        for (let qx = 0; qx < QUADRANT_SIZE; qx++) {
            const factionOwner = getFactionOwner(qx, qy);

            const validTemplates = sectorTemplates.filter(t => t.allowedFactions.includes(factionOwner));
            
            const totalWeight = validTemplates.reduce((sum, t) => sum + t.weight, 0);
            let roll = Math.random() * totalWeight;
            
            const chosenTemplate = validTemplates.find(t => {
                roll -= t.weight;
                return roll <= 0;
            }) || validTemplates[0];

            if (chosenTemplate) {
                 quadrantMap[qy][qx] = createSectorFromTemplate(chosenTemplate, factionOwner, availablePlanetNames, availableShipNames, colorIndex);
            }
        }
    }

    const playerPosition = { qx: 1, qy: 6 };
    for (let qy = 0; qy < QUADRANT_SIZE; qy++) for (let qx = 0; qx < QUADRANT_SIZE; qx++) if (quadrantMap[qy][qx].factionOwner === 'Federation') { quadrantMap[qy][qx].visited = true; quadrantMap[qy][qx].isScanned = true; }
    let startSector = quadrantMap[playerPosition.qy][playerPosition.qx];
    startSector.visited = true; startSector.isScanned = true;
    if (!startSector.entities.some(e => e.type === 'starbase')) {
        const stationConfig = starbaseTypes.command_station;
        startSector.entities.push({
            id: uniqueId(), name: `Starbase 364`, type: 'starbase', faction: 'Federation',
            position: { x: 2, y: 2 }, scanned: true, hull: stationConfig.maxHull, maxHull: stationConfig.maxHull,
            starbaseType: 'command_station'
        });
    }
    startSector.entities = startSector.entities.filter(e => e.faction !== 'Klingon' && e.faction !== 'Romulan' && e.faction !== 'Pirate' && e.type !== 'event_beacon');

  return {
    player: { ship: playerShip, position: playerPosition, crew: playerCrew },
    quadrantMap, currentSector: startSector, turn: 1, logs: [{ id: uniqueId(), turn: 1, sourceId: 'system', sourceName: "Captain's Log", message: "Stardate 47458.2. We have entered the Typhon Expanse.", color: SYSTEM_LOG_COLOR, isPlayerSource: false }],
    gameOver: false, gameWon: false, redAlert: false, combatEffects: [], isRetreatingWarp: false,
    usedAwayMissionSeeds: [], usedAwayMissionTemplateIds: [], desperationMoveAnimations: [], orbitingPlanetId: null,
  };
};

export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>(() => {
        const savedStateJSON = localStorage.getItem(SAVE_GAME_KEY);
        if (savedStateJSON) {
            try {
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
                    if (savedState.desperationMoveAnimations === undefined) savedState.desperationMoveAnimations = [];
                    if (savedState.orbitingPlanetId === undefined) savedState.orbitingPlanetId = null;
                    
                    const migrateShip = (ship: Ship) => {
                        if ((ship as any).shipClass) {
                            ship.shipModel = (ship as any).shipClass;
                            delete (ship as any).shipClass;
                        }
                        const factionClasses = shipClasses[ship.shipModel];
                        const matchingClass = factionClasses ? Object.values(factionClasses).find(c => c.name === ship.shipClass) : null;
                        
                        if (!ship.shipRole || matchingClass) {
                            const stats = matchingClass || shipClasses.Independent['Civilian Freighter'];
                            ship.shipRole = stats.role;
                            ship.shipClass = stats.name;
                            ship.cloakingCapable = stats.cloakingCapable;
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
                        if((ship as any).desperationMove !== undefined) delete (ship as any).desperationMove;
                        if (!ship.lifeSupportReserves) ship.lifeSupportReserves = { current: 100, max: 100 };
                        if ((ship as any).isCloaked !== undefined) {
                            ship.cloakState = (ship as any).isCloaked ? 'cloaked' : 'visible';
                            delete (ship as any).isCloaked;
                        } else if (!ship.cloakState) {
                            ship.cloakState = 'visible';
                        }
                        ship.cloakCooldown = ship.cloakCooldown || 0;
                        ship.isStunned = ship.isStunned || false;
                        if (ship.engineFailureTurn === undefined) ship.engineFailureTurn = null;
                        if (ship.isDerelict === undefined) ship.isDerelict = false;
                        if (ship.captureInfo === undefined) ship.captureInfo = null;
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
    const [playerTurnActions, setPlayerTurnActions] = useState<PlayerTurnActions>({});
    const [activeEvent, setActiveEvent] = useState<{ beaconId: string; template: EventTemplate } | null>(null);
    const [isWarping, setIsWarping] = useState(false);
    const [isTurnResolving, setIsTurnResolving] = useState(false);
    const [awayMissionResult, setAwayMissionResult] = useState<AwayMissionResult | null>(null);
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
        const distance = Math.max(Math.abs(gameState.player.ship.position.x - starbase.position.x), Math.abs(gameState.player.ship.position.y - starbase.position.y));
        if (distance > 1) {
            setIsDocked(false);
            addLog({ sourceId: 'system', sourceName: 'Ship Computer', message: "Undocked: Moved out of range of the starbase.", isPlayerSource: false });
        }
    }, [gameState.turn, gameState.currentSector.entities, isDocked, addLog, gameState.player.ship.position]);

    useEffect(() => {
        if (activeEvent) return;
        const beacon = gameState.currentSector.entities.find(e =>
            e.type === 'event_beacon' && !e.isResolved && Math.max(Math.abs(gameState.player.ship.position.x - e.position.x), Math.abs(gameState.player.ship.position.y - e.position.y)) <= 1
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
        if (gameState.desperationMoveAnimations.length > 0) {
            const timer = setTimeout(() => {
                setGameState(prev => ({ ...prev, desperationMoveAnimations: [] }));
            }, 4000); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [gameState.desperationMoveAnimations]);

    useEffect(() => {
        if (gameState.isRetreatingWarp) {
            setIsWarping(true);
            const timer = setTimeout(() => {
                setIsWarping(false);
                setGameState(prev => ({ ...prev, isRetreatingWarp: false, }));
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [gameState.isRetreatingWarp]);

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
    setGameState(currentGameState => {
        const next: GameState = JSON.parse(JSON.stringify(currentGameState));
        if (next.gameOver) {
            setIsTurnResolving(false);
            return next;
        }

        const addLogForTurn = (logData: Omit<LogEntry, 'id' | 'turn' | 'color'> & { color?: string }) => {
            const allShips = [...next.currentSector.entities.filter((e): e is Ship => e.type === 'ship'), next.player.ship];
            const sourceShip = allShips.find(s => s.id === logData.sourceId);
            next.logs.push({ id: uniqueId(), turn: next.turn, ...logData, color: logData.color || sourceShip?.logColor || SYSTEM_LOG_COLOR });
        };
        const triggerDesperationAnimation = (animation: { source: Ship; target?: Ship; type: string; outcome?: 'success' | 'failure' }) => {
            next.desperationMoveAnimations.push(animation);
        };

        const { player, currentSector } = next;
        const playerShip = player.ship;
        
        if (playerShip.isStunned) {
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: "Ship systems were offline. All power restored.", isPlayerSource: true, color: 'border-orange-400' });
            playerShip.isStunned = false;
            next.turn++;
            addLogForTurn({ sourceId: 'system', sourceName: 'Log', message: `Turn ${next.turn} begins.`, isPlayerSource: false, color: 'border-gray-700' });
            return next;
        }

        let maintainedTargetLock = false;

        // Auto-decloak if offensive actions were taken
        if (playerShip.cloakState === 'cloaked' && (playerTurnActions.combat || playerTurnActions.hasLaunchedTorpedo || playerTurnActions.hasUsedAwayTeam)) {
            playerShip.cloakState = 'visible';
            playerShip.cloakCooldown = 2; // Standard cooldown after offensive action
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: 'Taking offensive action has disengaged the cloaking device.', isPlayerSource: true });
        }

        if (playerShip.repairTarget) {
            const energyCost = 10;
            const { success, logs: energyLogs } = consumeEnergy(playerShip, energyCost);
            energyLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true }));
            if (success) {
                const repairAmount = 25;
                const targetSystem = playerShip.repairTarget;
                let repaired = false; let isComplete = false;
                if (targetSystem === 'hull') {
                    const oldHull = playerShip.hull;
                    playerShip.hull = Math.min(playerShip.maxHull, playerShip.hull + repairAmount);
                    if (playerShip.hull > oldHull) { addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Engineering teams continue repairs on the hull, restoring ${Math.round(playerShip.hull - oldHull)} integrity.`, isPlayerSource: true }); repaired = true; }
                    if (playerShip.hull === playerShip.maxHull) isComplete = true;
                } else {
                    const subsystem = playerShip.subsystems[targetSystem as keyof ShipSubsystems];
                    if (subsystem) {
                        const oldHealth = subsystem.health;
                        subsystem.health = Math.min(subsystem.maxHealth, subsystem.health + repairAmount);
                        if (subsystem.health > oldHealth) { addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Engineering teams continue repairs on the ${targetSystem}, restoring ${Math.round(subsystem.health - oldHealth)} health.`, isPlayerSource: true }); repaired = true; }
                        if (subsystem.health === subsystem.maxHealth) isComplete = true;
                    }
                }
                if (isComplete) { addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Repairs to ${targetSystem} are complete.`, isPlayerSource: true }); playerShip.repairTarget = null; }
                else if (!repaired) { addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `The ${targetSystem} is already at full integrity.`, isPlayerSource: true }); playerShip.repairTarget = null; }
            }
        }
        
        if (playerShip.retreatingTurn !== null) {
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: "Attempting to retreat, cannot take other actions.", isPlayerSource: true });
        } else {
            if (navigationTarget) {
                const movementSpeed = playerShip.cloakState === 'cloaked' ? 1 : (next.redAlert ? 1 : 3);
                let moved = false; const initialPosition = { ...playerShip.position };
                for (let i = 0; i < movementSpeed; i++) {
                    if (playerShip.position.x === navigationTarget.x && playerShip.position.y === navigationTarget.y) break;
                    playerShip.position = moveOneStep(playerShip.position, navigationTarget); moved = true;
                    const asteroidFields = currentSector.entities.filter((e: Entity) => e.type === 'asteroid_field');
                    if (asteroidFields.some(field => Math.max(Math.abs(playerShip.position.x - field.position.x), Math.abs(playerShip.position.y - field.position.y)) <= 1) && Math.random() < 0.25) {
                        const damage = 3 + Math.floor(Math.random() * 5);
                        addLogForTurn({ sourceId: 'system', sourceName: 'Hazard Alert', message: `Navigating near asteroid field... minor debris impact!`, isPlayerSource: false, color: 'border-orange-400' });
                        let remainingDamage = damage;
                        if (playerShip.shields > 0) { const absorbed = Math.min(playerShip.shields, remainingDamage); playerShip.shields -= absorbed; remainingDamage -= absorbed; addLogForTurn({ sourceId: 'system', sourceName: 'Ship Computer', message: `Shields absorbed ${Math.round(absorbed)} damage.`, isPlayerSource: false }); }
                        if (remainingDamage > 0) { const roundedDamage = Math.round(remainingDamage); playerShip.hull = Math.max(0, playerShip.hull - roundedDamage); addLogForTurn({ sourceId: 'system', sourceName: 'Damage Control', message: `Ship took ${roundedDamage} hull damage!`, isPlayerSource: false }); }
                    }
                }
                if (moved) { addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Moving from (${initialPosition.x},${initialPosition.y}) to (${playerShip.position.x},${playerShip.position.y}).`, isPlayerSource: true }); }
                if (playerShip.position.x === navigationTarget.x && playerShip.position.y === navigationTarget.y) { setNavigationTarget(null); addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Arrived at navigation target.`, isPlayerSource: true }); }
                 if (next.orbitingPlanetId && moved) {
                    const planet = next.currentSector.entities.find(e => e.id === next.orbitingPlanetId);
                    if (planet) {
                        const distance = Math.max(Math.abs(playerShip.position.x - planet.position.x), Math.abs(playerShip.position.y - planet.position.y));
                        if (distance > 1) {
                            next.orbitingPlanetId = null;
                            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Leaving orbit of ${planet.name}.`, isPlayerSource: true });
                        }
                    } else {
                        next.orbitingPlanetId = null;
                    }
                }
            }
            if (playerTurnActions.combat?.type === 'phasers') {
                const target = currentSector.entities.find((e: Entity) => e.id === playerTurnActions.combat!.targetId);
                if (target) {
                    const targetingInfo = player.targeting;
                    if (targetingInfo && targetingInfo.entityId === target.id) {
                        if (target.type === 'ship') {
                            const subsystem = targetingInfo.subsystem; let energyCost = 0; if (subsystem) energyCost = 4;
                            let canFire = true;
                            if (energyCost > 0) {
                                const { success, logs: energyLogs } = consumeEnergy(playerShip, energyCost);
                                energyLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true }));
                                if(success) addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Consumed ${energyCost} power for targeting computers.`, isPlayerSource: true }); else canFire = false;
                            }
                            if(canFire) {
                                next.combatEffects.push({ type: 'phaser', sourceId: playerShip.id, targetId: target.id, faction: playerShip.faction, delay: 0 });
                                const baseDamage = 20 * (playerShip.energyAllocation.weapons / 100);
                                const combatLogs = applyPhaserDamage(target as Ship, baseDamage, subsystem || null, playerShip, next);
                                combatLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true }));
                                if(subsystem) maintainedTargetLock = true;
                            }
                        } else if (target.type === 'torpedo_projectile') {
                            const { success, logs: energyLogs } = consumeEnergy(playerShip, 4);
                            energyLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true }));
                            if(success) {
                                next.combatEffects.push({ type: 'phaser', sourceId: playerShip.id, targetId: target.id, faction: playerShip.faction, delay: 0 });
                                (target as any).hull = 0;
                                addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Point-defense phasers fire at a hostile torpedo!\n--> HIT! The torpedo is destroyed!`, isPlayerSource: true });
                            }
                        }
                    }
                }
            }
        }

        if (player.targeting) {
            if (maintainedTargetLock) player.targeting.consecutiveTurns = (player.targeting.consecutiveTurns || 1) + 1;
            else if (player.targeting.consecutiveTurns > 1) { addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Targeting lock lapsed.`, isPlayerSource: true }); player.targeting.consecutiveTurns = 1; }
        }

        const projectiles = currentSector.entities.filter((e): e is any => e.type === 'torpedo_projectile');
        const allShips = [...currentSector.entities.filter((e): e is Ship => e.type === 'ship'), playerShip];
        const destroyedProjectileIds = new Set<string>();
        projectiles.forEach(torpedo => {
            if (torpedo.hull <= 0) { destroyedProjectileIds.add(torpedo.id); return; }
            const targetEntity = allShips.find(s => s.id === torpedo.targetId); const sourceEntity = allShips.find(s => s.id === torpedo.sourceId);
            if (!targetEntity || !sourceEntity || targetEntity.faction === torpedo.faction || targetEntity.hull <= 0) { addLogForTurn({ sourceId: sourceEntity?.id || 'system', sourceName: sourceEntity?.name || 'Torpedo Control', message: `${torpedo.name} self-destructs: invalid target.`, isPlayerSource: sourceEntity?.id === 'player' }); destroyedProjectileIds.add(torpedo.id); return; }
            if (next.turn - torpedo.turnLaunched >= 3) { addLogForTurn({ sourceId: sourceEntity.id, sourceName: sourceEntity.name, message: `${torpedo.name} self-destructs at the end of its lifespan.`, isPlayerSource: sourceEntity.id === 'player' }); destroyedProjectileIds.add(torpedo.id); return; }
            for (let i = 0; i < torpedo.speed; i++) {
                if (torpedo.position.x === targetEntity.position.x && torpedo.position.y === targetEntity.position.y) break;
                torpedo.position = moveOneStep(torpedo.position, targetEntity.position); torpedo.path.push({ ...torpedo.position }); torpedo.stepsTraveled++;
                for (const ship of allShips.filter(s => s.faction !== torpedo.faction && s.hull > 0)) {
                    if (ship.position.x === torpedo.position.x && ship.position.y === torpedo.position.y) {
                        let hitChance = Math.max(0.05, 1.0 - (torpedo.stepsTraveled * 0.24));
                        if (ship.evasive) hitChance *= 0.3; if (next.currentSector.hasNebula) hitChance *= 0.6;
                        let torpedoLog = `${sourceEntity.name}'s torpedo is on an intercept course with ${ship.name}. Impact chance: ${Math.round(hitChance * 100)}%.`;
                        if (Math.random() < hitChance) {
                            next.combatEffects.push({ type: 'torpedo_hit', position: ship.position, delay: 0 });
                            const damage = 50; let remainingDamage = damage;
                            const shieldDamage = remainingDamage * 0.25; const absorbedByShields = Math.min(ship.shields, shieldDamage);
                            if (absorbedByShields > 0) { ship.shields -= absorbedByShields; torpedoLog += `\n--> Shields absorbed ${Math.round(absorbedByShields)} damage.`; }
                            remainingDamage -= absorbedByShields / 0.25;
                            if (remainingDamage > 0) { const roundedHullDamage = Math.round(remainingDamage); ship.hull = Math.max(0, ship.hull - roundedHullDamage); torpedoLog += `\n--> ${ship.name} takes ${roundedHullDamage} hull damage.`; }
                        } else { torpedoLog += `\n--> The torpedo misses!`; }
                        addLogForTurn({ sourceId: sourceEntity.id, sourceName: sourceEntity.name, message: torpedoLog, isPlayerSource: sourceEntity.id === 'player' });
                        destroyedProjectileIds.add(torpedo.id); return;
                    }
                }
            }
        });
        next.currentSector.entities = next.currentSector.entities.filter(e => !destroyedProjectileIds.has(e.id));
        
        const aiActions: AIActions = { addLog: addLogForTurn, applyPhaserDamage, triggerDesperationAnimation };
        processAITurns(next, aiActions);
        
        // Shield and Energy regeneration and health checks for all ships
        [playerShip, ...currentSector.entities].forEach(e => {
            if (e.type === 'ship') {
                const ship = e as Ship;
                const shieldHealthPercent = ship.subsystems.shields.maxHealth > 0 ? ship.subsystems.shields.health / ship.subsystems.shields.maxHealth : 0;

                // Shields can only recharge if the generator is at least 25% operational.
                if (shieldHealthPercent >= 0.25) {
                    // Shield recharge rate is proportional to shield subsystem health.
                    const rechargeRateMultiplier = shieldHealthPercent;
                    const baseRegenAmount = (ship.energyAllocation.shields / 100) * (ship.maxShields * 0.1);
                    const finalRegenAmount = baseRegenAmount * rechargeRateMultiplier;
                    ship.shields = Math.min(ship.maxShields, ship.shields + finalRegenAmount);
                } else {
                    // If shields are too damaged, they go offline and cannot recharge.
                    ship.shields = 0;
                }

                // AI ship energy regeneration
                if (ship.id !== 'player') {
                    const engineHealthPercent = ship.subsystems.engines.health / ship.subsystems.engines.maxHealth;
                    if (engineHealthPercent > 0) {
                        const energyMultiplier = getEnergyOutputMultiplier(engineHealthPercent);
                        // AI gets a slightly lower base recharge to make attrition a viable strategy
                        const rechargeAmount = Math.round(8 * energyMultiplier); 
                        ship.energy.current = Math.min(ship.energy.max, ship.energy.current + rechargeAmount);
                    }
                }
            }
        });
        
        allShips.forEach(ship => {
            if (ship.subsystems.lifeSupport.health < ship.subsystems.lifeSupport.maxHealth) {
                ship.lifeSupportReserves.current = Math.max(0, ship.lifeSupportReserves.current - (100 / 40)); 
                if (ship.lifeSupportReserves.current <= 0 && ship.hull > 0) {
                    ship.hull = 0;
                    if (ship.id === 'player') {
                        addLogForTurn({ sourceId: 'system', sourceName: 'Life Support', message: 'CRITICAL: Life support reserves depleted. Catastrophic crew loss.', isPlayerSource: false, color: 'border-red-700' });
                    } else {
                        addLogForTurn({ sourceId: 'system', sourceName: 'Sensors', message: `${ship.name} has suffered catastrophic life support failure.`, isPlayerSource: false });
                    }
                } else if (ship.id === 'player' && ship.lifeSupportReserves.current > 0) {
                     addLogForTurn({ sourceId: 'system', sourceName: 'Life Support', message: `WARNING: Life support failing. ${ship.lifeSupportReserves.current.toFixed(0)}% reserves remaining.`, isPlayerSource: false, color: 'border-orange-400' });
                }
            } else {
                ship.lifeSupportReserves.current = Math.min(ship.lifeSupportReserves.max, ship.lifeSupportReserves.current + (100/80)); 
            }
        });

        // Player ship cloak state resolution
        const stats = shipClasses[playerShip.shipModel]?.[playerShip.shipClass];
        if (stats && playerShip.cloakingCapable) {
            if (playerShip.cloakState === 'cloaking') {
                const { success: energySuccess } = consumeEnergy(playerShip, stats.cloakEnergyCost.initial);
                if (!energySuccess) {
                    playerShip.cloakState = 'visible';
                    addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: 'Cloaking sequence failed: Insufficient initial power.', isPlayerSource: true, color: 'border-orange-400' });
                } else if (Math.random() < stats.cloakFailureChance) {
                    playerShip.cloakState = 'visible';
                    playerShip.cloakCooldown = 3;
                    addLogForTurn({ sourceId: 'system', sourceName: 'Engineering', message: `Cloaking device failed to engage!`, isPlayerSource: false, color: 'border-red-500' });
                } else {
                    playerShip.cloakState = 'cloaked';
                    addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Cloaking device engaged. Ship is now hidden from sensors.`, isPlayerSource: true });
                }
            } else if (playerShip.cloakState === 'cloaked') {
                const { success, logs: energyLogs } = consumeEnergy(playerShip, stats.cloakEnergyCost.maintain);
                energyLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true }));
                if (!success) {
                    playerShip.cloakState = 'visible';
                    playerShip.cloakCooldown = 3;
                    playerShip.isStunned = true;
                    addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: 'CRITICAL: Insufficient power to maintain cloak! Device failed, causing a ship-wide power surge. Systems are temporarily offline!', isPlayerSource: true, color: 'border-red-500' });
                }
            }
        }
        if (playerShip.cloakCooldown > 0) {
            playerShip.cloakCooldown--;
        }

        // AI ship cloak state resolution
        currentSector.entities.forEach(e => {
            if (e.type === 'ship') {
                const ship = e as Ship;
                if (ship.id === 'player') return;

                const aiStats = shipClasses[ship.shipModel]?.[ship.shipClass];
                if (aiStats && ship.cloakingCapable) {
                    if (ship.cloakState === 'cloaked') {
                        const { success } = consumeEnergy(ship, aiStats.cloakEnergyCost.maintain);
                        if (!success) {
                            ship.cloakState = 'visible';
                            ship.cloakCooldown = 3; // Cooldown after failure
                            ship.isStunned = true;
                            addLogForTurn({
                                sourceId: ship.id,
                                sourceName: ship.name,
                                message: 'CRITICAL: Insufficient power to maintain cloak! Device failed, causing a ship-wide power surge. Systems are temporarily offline!',
                                isPlayerSource: false,
                                color: 'border-red-500'
                            });
                        }
                    }
                }
                if (ship.cloakCooldown > 0) {
                    ship.cloakCooldown--;
                }
            }
        });

        // Engine failure checks
        allShips.forEach(ship => {
            if (ship.subsystems.engines.health <= 0 && ship.engineFailureTurn === null) {
                ship.engineFailureTurn = next.turn;
                addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `CRITICAL: Main engineering has gone offline! No power is being generated!`, isPlayerSource: ship.id === 'player', color: 'border-red-500' });
            }
        });

        const destroyedIds = new Set<string>();
        currentSector.entities.forEach(e => {
            if (e.type === 'ship' && (e as Ship).isDerelict) return;
            const entityWithHull = e as any;
            if (entityWithHull.hull !== undefined && entityWithHull.hull <= 0) {
                if (e.type === 'torpedo_projectile') { addLogForTurn({ sourceId: 'system', sourceName: 'Tactical', message: `${e.name} was intercepted.`, isPlayerSource: false }); next.combatEffects.push({ type: 'torpedo_hit', position: e.position, delay: 0 }); }
                else if (e.type === 'ship' || e.type === 'starbase') { addLogForTurn({ sourceId: 'system', sourceName: 'Tactical', message: `${e.name} has been destroyed!`, isPlayerSource: false }); }
                destroyedIds.add(e.id);
            }
        });
        
        if (player.targeting && (!currentSector.entities.some(e => e.id === player.targeting!.entityId) || destroyedIds.has(player.targeting.entityId))) {
            delete player.targeting; addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Target destroyed. Disengaging computers.`, isPlayerSource: true });
        }
        if (selectedTargetId && destroyedIds.has(selectedTargetId)) setSelectedTargetId(null);
        next.currentSector.entities = currentSector.entities.filter(e => !destroyedIds.has(e.id));

        if (playerShip.retreatingTurn !== null && next.turn >= playerShip.retreatingTurn) {
            playerShip.retreatingTurn = null; next.currentSector.entities = next.currentSector.entities.filter(e => e.faction !== 'Klingon' && e.faction !== 'Romulan' && e.faction !== 'Pirate');
            addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Retreat successful!`, isPlayerSource: true });
            next.isRetreatingWarp = true;
        }
        
        if (playerShip.hull <= 0 && !playerShip.isDerelict) { 
             if (playerShip.faction === 'Federation') {
                triggerDesperationAnimation({ source: playerShip, type: 'evacuate' });
                playerShip.isDerelict = true;
                playerShip.hull = 1;
                addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Hull breach critical! All hands abandon ship!`, isPlayerSource: true, color: 'border-red-700' });
            }
            next.gameOver = true; 
            addLogForTurn({ sourceId: 'system', sourceName: 'FATAL', message: "CRITICAL: U.S.S. Endeavour has been lost. Game Over.", isPlayerSource: false, color: 'border-red-700' }); 
        }
        
        const hasEnemies = next.currentSector.entities.some(e => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
        if (next.redAlert && !hasEnemies) {
            next.redAlert = false;
            playerShip.shields = 0;
            playerShip.evasive = false;
            addLogForTurn({ sourceId: 'system', sourceName: 'Stand Down', message: "Hostiles clear. Standing down from Red Alert.", isPlayerSource: false });
        } else if (!next.redAlert && hasEnemies) {
            next.redAlert = true;
            const shieldHealthPercent = playerShip.subsystems.shields.maxHealth > 0 ? playerShip.subsystems.shields.health / playerShip.subsystems.shields.maxHealth : 0;
            if (shieldHealthPercent >= 0.25) {
                playerShip.shields = playerShip.maxShields;
                addLogForTurn({ sourceId: 'system', sourceName: 'RED ALERT!', message: "Hostiles detected! Shields up!", isPlayerSource: false, color: 'border-red-600' });
            } else {
                playerShip.shields = 0;
                addLogForTurn({ sourceId: 'system', sourceName: 'RED ALERT!', message: "Hostiles detected! Warning: Shield generator is below 25% health!", isPlayerSource: false, color: 'border-red-600' });
            }
        }

        if (next.redAlert && hasEnemies) {
            let energyDrain = 5; if (playerShip.evasive) energyDrain += 5;
            if (energyDrain > 0) {
                const { success, logs: energyLogs } = consumeEnergy(playerShip, energyDrain);
                energyLogs.forEach(msg => addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: msg, isPlayerSource: true }));
                if (!success) {
                    addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `WARNING: Insufficient power for combat systems! Dropping shields!`, isPlayerSource: true });
                    next.redAlert = false;
                    playerShip.shields = 0;
                    playerShip.evasive = false;
                } else {
                    addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Combat systems consumed ${energyDrain} reserve power.`, isPlayerSource: true });
                }
            }
        } else if (!next.redAlert) {
            if (playerShip.energy.current < playerShip.energy.max) {
                const engineHealthPercent = playerShip.subsystems.engines.health / playerShip.subsystems.engines.maxHealth;
                const energyMultiplier = getEnergyOutputMultiplier(engineHealthPercent);
                const rechargeAmount = Math.round(10 * energyMultiplier);
                playerShip.energy.current = Math.min(playerShip.energy.max, playerShip.energy.current + rechargeAmount); 
                if (energyMultiplier < 1.0) {
                     addLogForTurn({ sourceId: 'player', sourceName: playerShip.name, message: `Damaged engines operating at ${Math.round(energyMultiplier*100)}% efficiency. Recharged ${rechargeAmount} power.`, isPlayerSource: true });
                }
            }
        }
        
        // Final checks for derelicts, repairs, and life support failure
        const finalAllShips = [...next.currentSector.entities.filter((e): e is Ship => e.type === 'ship'), playerShip];
        finalAllShips.forEach(ship => {
            // Life support checks due to engine failure. Skips captured ships under repair.
            if (ship.engineFailureTurn !== null && !ship.isDerelict && !ship.captureInfo) {
                ship.energy.current = Math.max(0, ship.energy.current - ship.energy.max * 0.10);

                addLogForTurn({
                    sourceId: ship.id,
                    sourceName: ship.name,
                    message: `Reserve power at ${ship.energy.current.toFixed(0)}/${ship.energy.max}. No power being generated.`,
                    isPlayerSource: ship.id === 'player',
                    color: 'border-orange-500'
                });

                if (ship.energy.current <= 0) {
                    const turnsSinceFailure = next.turn - ship.engineFailureTurn;
                    const turnsUntilFailure = 3 - turnsSinceFailure;

                    if (turnsUntilFailure > 0) {
                        addLogForTurn({
                            sourceId: ship.id,
                            sourceName: ship.name,
                            message: `WARNING: Life support on emergency power. ${turnsUntilFailure} turn(s) until total system failure.`,
                            isPlayerSource: ship.id === 'player',
                            color: 'border-red-600'
                        });
                    } else if (!ship.isDerelict) { // This is the turn it fails
                        ship.isDerelict = true;
                        if (ship.faction === 'Federation') {
                             triggerDesperationAnimation({ source: ship, type: 'evacuate' });
                             addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `Life support has failed due to prolonged power loss! The crew is abandoning ship!`, isPlayerSource: ship.id === 'player', color: 'border-red-700' });
                        } else {
                             addLogForTurn({ sourceId: ship.id, sourceName: ship.name, message: `Life support has failed due to prolonged power loss! The crew is lost.`, isPlayerSource: ship.id === 'player', color: 'border-red-700' });
                        }
                        if (ship.id === 'player') {
                            next.gameOver = true;
                        }
                    }
                }
            }
            
            // Check for ongoing capture repairs and log progress
            if (ship.captureInfo && next.turn > ship.captureInfo.repairTurn && next.turn < ship.captureInfo.repairTurn + 5) {
                const captor = finalAllShips.find(s => s.id === ship.captureInfo!.captorId);
                const turnsRemaining = (ship.captureInfo.repairTurn + 5) - next.turn;
                addLogForTurn({
                    sourceId: ship.captureInfo.captorId,
                    sourceName: captor ? `${captor.name}'s Repair Crew` : 'Repair Crew',
                    message: `Repairs on ${ship.name} continue. ${turnsRemaining} turn(s) until operational.`,
                    isPlayerSource: ship.captureInfo.captorId === 'player',
                });
            }

            // Check for completed capture repairs
            if (ship.captureInfo && next.turn >= ship.captureInfo.repairTurn + 5) {
                Object.values(ship.subsystems).forEach(subsystem => {
                    if (subsystem.health < subsystem.maxHealth * 0.3) {
                        subsystem.health = subsystem.maxHealth * 0.3;
                    }
                });
                if (ship.hull < ship.maxHull * 0.3) {
                    ship.hull = ship.maxHull * 0.3;
                }
                ship.energy.current = ship.energy.max * 0.5;
                const captor = finalAllShips.find(s => s.id === ship.captureInfo!.captorId);
                addLogForTurn({ 
                    sourceId: ship.captureInfo.captorId, 
                    sourceName: captor ? `${captor.name}'s Repair Crew` : 'Repair Crew', 
                    message: `Emergency repairs on the ${ship.name} are complete. The ship is now operational.`, 
                    isPlayerSource: ship.captureInfo.captorId === 'player'
                });
                ship.captureInfo = null;
                ship.engineFailureTurn = null;
                ship.isDerelict = false;
            }
        });

        next.turn++;
        addLogForTurn({ sourceId: 'system', sourceName: 'Log', message: `Turn ${next.turn} begins.`, isPlayerSource: false, color: 'border-gray-700' });
        
        return next;
    });

    setTimeout(() => {
        setPlayerTurnActions({});
        setIsTurnResolving(false);
    }, 300);
}, [isTurnResolving, navigationTarget, playerTurnActions]);
    
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
            const next: GameState = JSON.parse(JSON.stringify(prev));
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
        if (pos) {
            addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: `Navigation target set to (${pos.x}, ${pos.y}).`, isPlayerSource: true });
        } else {
            addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: `Navigation cancelled.`, isPlayerSource: true });
        }
    }, [addLog, gameState.player.ship.name]);

    const onSetView = useCallback((view: 'sector' | 'quadrant') => {
        setCurrentView(view);
    }, []);

    const onWarp = useCallback((pos: QuadrantPosition) => {
        const { ship } = gameState.player;
        const warpEnginesHealth = ship.subsystems.engines.health / ship.subsystems.engines.maxHealth;
        
        if (warpEnginesHealth < 0.50) {
            addLog({ sourceId: 'player', sourceName: ship.name, message: "Cannot initiate warp: Main engines are too damaged.", isPlayerSource: true });
            return;
        }

        if (gameState.redAlert) {
            addLog({ sourceId: 'player', sourceName: ship.name, message: "Cannot initiate warp while on Red Alert.", isPlayerSource: true });
            return;
        }

        const { current: dilithium } = gameState.player.ship.dilithium;
        if (dilithium <= 0) {
            addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: "Cannot warp: No dilithium crystals available.", isPlayerSource: true });
            return;
        }
        
        setIsWarping(true);
        setTimeout(() => {
          setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next.quadrantMap[prev.player.position.qy][prev.player.position.qx] = next.currentSector;
            next.player.position = pos;
            const newSector = next.quadrantMap[pos.qy][pos.qx];
            newSector.visited = true;
            next.currentSector = newSector;
            next.player.ship.position = { x: Math.floor(SECTOR_WIDTH / 2), y: Math.floor(SECTOR_HEIGHT - 2) };
            next.player.ship.dilithium.current -= 1;
            next.orbitingPlanetId = null;
            return next;
          });
          setIsWarping(false);
          setCurrentView('sector');
          addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: `Warp successful. Arrived in quadrant (${pos.qx}, ${pos.qy}).`, isPlayerSource: true });
        }, 2000);
    }, [gameState, addLog]);

    const onScanQuadrant = useCallback((pos: QuadrantPosition) => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const { ship } = next.player;
            const energyCost = 1;
            if(ship.energy.current < energyCost) {
                addLog({ sourceId: 'player', sourceName: ship.name, message: 'Insufficient power for long-range scan.', isPlayerSource: true });
                return prev;
            }
            ship.energy.current -= energyCost;
            next.quadrantMap[pos.qy][pos.qx].isScanned = true;
            addLog({ sourceId: 'player', sourceName: ship.name, message: `Long-range scan of quadrant (${pos.qx}, ${pos.qy}) complete. Consumed ${energyCost} power.`, isPlayerSource: true });
            return next;
        });
    }, [addLog]);

    const onToggleRedAlert = useCallback(() => {
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const { ship } = next.player;
            if (!next.redAlert) { // Activating Red Alert
                 if (ship.cloakState !== 'visible') {
                    addLog({ sourceId: 'player', sourceName: ship.name, message: `Cannot go to Red Alert while cloaking device is active.`, isPlayerSource: true });
                    return prev;
                }

                const shieldHealthPercent = ship.subsystems.shields.maxHealth > 0 ? ship.subsystems.shields.health / ship.subsystems.shields.maxHealth : 0;
                
                const baseEnergyCost = 15;
                let energyCost = baseEnergyCost;
                
                // If shields are functional, their damage increases the energy cost to raise them.
                if (shieldHealthPercent > 0) {
                    const damagePercent = 1 - shieldHealthPercent;
                    const energyCostMultiplier = 1 + (damagePercent / 2);
                    energyCost = baseEnergyCost * energyCostMultiplier;
                }

                if (ship.energy.current < energyCost) {
                    addLog({ sourceId: 'system', sourceName: 'Ship Computer', message: `Not enough reserve power to activate Red Alert! (Required: ${Math.round(energyCost)}, Available: ${Math.round(ship.energy.current)})`, isPlayerSource: false, color: 'border-orange-400' });
                    return prev;
                }

                ship.energy.current -= energyCost;
                next.redAlert = true;

                if (shieldHealthPercent < 0.25) {
                    ship.shields = 0;
                    addLog({ sourceId: 'system', sourceName: 'RED ALERT!', message: `Warning: Shield generator is below 25% health! Shields cannot be raised. Consumed ${Math.round(energyCost)} power for alert status.`, isPlayerSource: false, color: 'border-red-600' });
                } else {
                    ship.shields = ship.maxShields;
                    addLog({ sourceId: 'system', sourceName: 'RED ALERT!', message: `Shields up! Consumed ${Math.round(energyCost)} power.`, isPlayerSource: false, color: 'border-red-600' });
                    if (shieldHealthPercent < 1.0) {
                        addLog({ sourceId: 'system', sourceName: 'Engineering', message: `Note: Shield generator at ${Math.round(shieldHealthPercent * 100)}% efficiency. Energy consumption for shield operations is increased.`, isPlayerSource: false, color: 'border-orange-400' });
                    }
                }
            } else { // Deactivating Red Alert
                next.redAlert = false;
                ship.shields = 0;
                ship.evasive = false;
                addLog({ sourceId: 'system', sourceName: 'Stand Down', message: 'Standing down from Red Alert. Shields offline.', isPlayerSource: false });
            }
            return next;
        });
    }, [addLog]);

    const onEvasiveManeuvers = useCallback(() => {
        setGameState(prev => {
            if (!prev.redAlert || prev.player.ship.subsystems.engines.health <= 0) return prev;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            next.player.ship.evasive = !next.player.ship.evasive;
            addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Evasive maneuvers ${next.player.ship.evasive ? 'engaged' : 'disengaged'}.`, isPlayerSource: true });
            return next;
        });
    }, [addLog]);

    const onSelectRepairTarget = useCallback((subsystem: 'hull' | keyof ShipSubsystems | null) => {
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            if (next.player.ship.repairTarget === subsystem) {
                next.player.ship.repairTarget = null;
                addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Damage control team standing by.`, isPlayerSource: true });
            } else {
                next.player.ship.repairTarget = subsystem;
                addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Damage control team assigned to repair ${subsystem}.`, isPlayerSource: true });
            }
            return next;
        });
    }, [addLog]);

    const onFirePhasers = useCallback((targetId: string) => {
        if (gameState.player.ship.isStunned || gameState.player.ship.cloakState === 'cloaked' || playerTurnActions.hasTakenMajorAction) return;
        setPlayerTurnActions(prev => ({ ...prev, combat: { type: 'phasers', targetId } }));
        const target = gameState.currentSector.entities.find(e => e.id === targetId);
        addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: `Targeting ${target?.name || 'unknown'} with phasers.`, isPlayerSource: true });
    }, [addLog, gameState, playerTurnActions]);

    const onLaunchTorpedo = useCallback((targetId: string) => {
        if (gameState.player.ship.isStunned || gameState.player.ship.cloakState === 'cloaked' || playerTurnActions.hasTakenMajorAction) return;
        if (playerTurnActions.hasLaunchedTorpedo) {
            addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: 'Torpedo tubes are reloading. Only one launch per turn.', isPlayerSource: true });
            return;
        }
        
        const { ship } = gameState.player;
        if (ship.torpedoes.current <= 0) {
            addLog({ sourceId: 'player', sourceName: ship.name, message: `Cannot launch torpedo: All tubes are empty.`, isPlayerSource: true });
            return;
        }
        const target = gameState.currentSector.entities.find((e: Entity) => e.id === targetId);
        if (!target || target.type !== 'ship') {
            addLog({ sourceId: 'player', sourceName: ship.name, message: `Cannot launch torpedo: Invalid target.`, isPlayerSource: true });
            return;
        }
    
        setPlayerTurnActions(prev => ({ ...prev, hasLaunchedTorpedo: true }));
    
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const shipInNext = next.player.ship;
            const targetInNext = next.currentSector.entities.find(e => e.id === targetId);
    
            shipInNext.torpedoes.current--;
            const torpedo = {
                id: uniqueId(),
                name: 'Photon Torpedo',
                type: 'torpedo_projectile' as const,
                faction: 'Federation' as const,
                position: { ...shipInNext.position },
                targetId,
                sourceId: shipInNext.id,
                stepsTraveled: 0,
                speed: 2,
                path: [{ ...shipInNext.position }],
                scanned: true,
                turnLaunched: next.turn,
                hull: 1,
                maxHull: 1,
            };
            next.currentSector.entities.push(torpedo);
            addLog({ sourceId: 'player', sourceName: shipInNext.name, message: `Photon torpedo launched at ${targetInNext?.name}.`, isPlayerSource: true });
            return next;
        });
    }, [addLog, playerTurnActions, gameState]);

    const onScanTarget = useCallback(() => {
        if (!selectedTargetId || gameState.player.ship.isStunned || gameState.player.ship.cloakState === 'cloaked' || playerTurnActions.hasTakenMajorAction) return;
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const { ship } = next.player;
            const energyCost = 5;
            const { success, logs } = consumeEnergy(ship, energyCost);
            logs.forEach(log => addLog({ sourceId: 'player', sourceName: ship.name, message: log, isPlayerSource: true }));
            if (!success) return prev;

            const target = next.currentSector.entities.find((e: Entity) => e.id === selectedTargetId);
            if (target) {
                target.scanned = true;
                addLog({ sourceId: 'player', sourceName: ship.name, message: `Scan complete on ${target.name}.`, isPlayerSource: true });
            }
            return next;
        });
    }, [selectedTargetId, addLog, gameState, playerTurnActions]);

    const onInitiateRetreat = useCallback(() => {
        if (gameState.player.ship.isStunned || gameState.player.ship.cloakState === 'cloaked' || playerTurnActions.hasTakenMajorAction) return;
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            next.player.ship.retreatingTurn = next.turn + 3;
            addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Retreat initiated! Charging warp core. We must survive for 3 turns.`, isPlayerSource: true, color: 'border-orange-400' });
            return next;
        });
    }, [addLog, gameState, playerTurnActions]);

    const onCancelRetreat = useCallback(() => {
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            next.player.ship.retreatingTurn = null;
            addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Retreat cancelled.`, isPlayerSource: true });
            return next;
        });
    }, [addLog]);
    
    const onDockWithStarbase = useCallback(() => {
        setIsDocked(true);
        addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: 'Docking procedures initiated. Welcome to Starbase.', isPlayerSource: true });
    }, [addLog, gameState.player.ship.name]);

    const onStarbaseRepairs = useCallback(() => {
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const { ship } = next.player;
            ship.hull = ship.maxHull;
            Object.values(ship.subsystems).forEach(s => s.health = s.maxHealth);
            ship.energy.current = ship.energy.max;
            addLog({ sourceId: 'system', sourceName: 'Starbase Control', message: 'Full repairs complete. All systems at 100%.', isPlayerSource: false });
            return next;
        });
    }, [addLog]);

    const onRechargeDilithium = useCallback(() => {
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            next.player.ship.dilithium.current = next.player.ship.dilithium.max;
            addLog({ sourceId: 'system', sourceName: 'Starbase Control', message: 'Dilithium reserves replenished.', isPlayerSource: false });
            return next;
        });
    }, [addLog]);

    const onResupplyTorpedoes = useCallback(() => {
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            next.player.ship.torpedoes.current = next.player.ship.torpedoes.max;
            addLog({ sourceId: 'system', sourceName: 'Starbase Control', message: 'Photon torpedo casings restocked.', isPlayerSource: false });
            return next;
        });
    }, [addLog]);

    const onStartAwayMission = useCallback((planetId: string) => {
        if (gameState.player.ship.isStunned || gameState.player.ship.cloakState === 'cloaked' || playerTurnActions.hasTakenMajorAction) return;
        const planet = gameState.currentSector.entities.find(e => e.id === planetId);
        if (!planet || planet.type !== 'planet') return;
        
        const availableTemplates = awayMissionTemplates.filter(t =>
            t.planetClasses.includes(planet.planetClass) &&
            !gameState.usedAwayMissionTemplateIds?.includes(t.id)
        );
        
        let template;
        if (availableTemplates.length > 0) {
            template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
        } else {
            const olderTemplates = awayMissionTemplates.filter(t =>
                t.planetClasses.includes(planet.planetClass) &&
                !gameState.usedAwayMissionTemplateIds?.slice(-5).includes(t.id)
            );
            if (olderTemplates.length > 0) {
                template = olderTemplates[Math.floor(Math.random() * olderTemplates.length)];
            } else {
                const allClassTemplates = awayMissionTemplates.filter(t => t.planetClasses.includes(planet.planetClass));
                template = allClassTemplates[Math.floor(Math.random() * allClassTemplates.length)];
            }
        }

        if (!template) {
            addLog({ sourceId: 'system', sourceName: 'Ship Computer', message: `No suitable away missions available for this planet class.`, isPlayerSource: false });
            return;
        }

        const missionSeed = `${template.id}_${planet.id}_${gameState.turn}`;
        const rand = seededRandom(cyrb53(missionSeed));

        const activeOptions = template.options.map(opt => ({
            ...opt,
            calculatedSuccessChance: opt.successChanceRange[0] + rand() * (opt.successChanceRange[1] - opt.successChanceRange[0])
        }));
        
        const advice: OfficerAdvice[] = gameState.player.crew.map(officer => {
            const advicePool = counselAdvice[officer.role]?.[officer.personality];
            return {
                officerName: officer.name,
                role: officer.role,
                message: advicePool ? advicePool[Math.floor(rand() * advicePool.length)] : 'I have no specific advice, Captain.'
            };
        });

        setActiveMissionPlanetId(planetId);
        setGameState(prev => ({ ...prev, usedAwayMissionSeeds: [...prev.usedAwayMissionSeeds, missionSeed], usedAwayMissionTemplateIds: [...(prev.usedAwayMissionTemplateIds || []), template.id] }));
        setActiveAwayMission({ ...template, options: activeOptions, advice, seed: missionSeed });
    }, [gameState, addLog, playerTurnActions]);

    const onChooseAwayMissionOption = useCallback((option: ActiveAwayMissionOption) => {
        if (!activeAwayMission) return;
        const rand = seededRandom(cyrb53(activeAwayMission.seed, option.role.length));
        const success = rand() < option.calculatedSuccessChance;

        const outcomePool = success ? option.outcomes.success : option.outcomes.failure;
        const totalWeight = outcomePool.reduce((sum, o) => sum + o.weight, 0);
        let randomWeight = rand() * totalWeight;
        const chosenOutcome = outcomePool.find(o => {
            randomWeight -= o.weight;
            return randomWeight < 0;
        }) || outcomePool[0];

        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const { ship } = next.player;
            const result: AwayMissionResult = {
                log: chosenOutcome.log,
                status: success ? 'success' : 'failure',
                changes: []
            };
            
            if (chosenOutcome.type === 'reward' || chosenOutcome.type === 'damage') {
                const amount = (chosenOutcome.type === 'damage' ? -1 : 1) * (chosenOutcome.amount || 0);
                if (chosenOutcome.resource) {
                    const res = chosenOutcome.resource;
                    switch (res) {
                        case 'hull': ship.hull = Math.max(0, Math.min(ship.maxHull, ship.hull + amount)); break;
                        case 'energy': ship.energy.current = Math.max(0, Math.min(ship.energy.max, ship.energy.current + amount)); break;
                        case 'dilithium': ship.dilithium.current = Math.max(0, Math.min(ship.dilithium.max, ship.dilithium.current + amount)); break;
                        case 'torpedoes': ship.torpedoes.current = Math.max(0, Math.min(ship.torpedoes.max, ship.torpedoes.current + amount)); break;
                        case 'morale': ship.crewMorale.current = Math.max(0, Math.min(ship.crewMorale.max, ship.crewMorale.current + amount)); break;
                        case 'security_teams': ship.securityTeams.current = Math.max(0, Math.min(ship.securityTeams.max, ship.securityTeams.current + amount)); break;
                        case 'weapons': case 'engines': case 'shields': case 'transporter':
                        case 'scanners': case 'computer': case 'lifeSupport': case 'shuttlecraft':
                            const subsystem = ship.subsystems[res];
                            if (subsystem) subsystem.health = Math.max(0, Math.min(subsystem.maxHealth, subsystem.health + amount));
                            break;
                    }
                    result.changes.push({ resource: res, amount });
                }
            }

            if (activeMissionPlanetId) {
                const planet = next.currentSector.entities.find((e): e is Planet => e.id === activeMissionPlanetId);
                if(planet) planet.awayMissionCompleted = true;
            }

            setAwayMissionResult(result);
            return next;
        });

        setActiveAwayMission(null);
    }, [activeAwayMission, activeMissionPlanetId]);

    const onCloseAwayMissionResult = useCallback(() => {
        setAwayMissionResult(null);
    }, []);

    const onHailTarget = useCallback(async () => {
        if (!selectedTargetId || !ai) {
            addLog({sourceId: 'system', sourceName: 'Comms', message: 'Cannot hail target: AI system offline or no target selected.', isPlayerSource: false});
            return;
        }
        const target = gameState.currentSector.entities.find(e => e.id === selectedTargetId);
        if (!target || target.type !== 'ship') return;

        setActiveHail({ targetId: target.id, loading: true, message: '' });

        try {
            const factionResponses = hailResponses[target.faction];
            let baseResponse = factionResponses ? factionResponses.greeting : "No response.";
            
            const isDamaged = target.hull < target.maxHull;
            if(isDamaged) baseResponse = factionResponses.threatened || baseResponse;
            
            const prompt = `You are the captain of a ${target.faction} ${(target as Ship).shipRole} starship named '${target.name}'. You are being hailed by a Federation starship. Your ship is ${isDamaged ? 'damaged' : 'at full health'}. Your personality is typical for your faction: ${target.faction === 'Klingon' ? 'aggressive and honor-bound' : target.faction === 'Romulan' ? 'suspicious and arrogant' : target.faction === 'Pirate' ? 'greedy and dismissive' : 'neutral'}. Provide a short, in-character hailing response based on this base message: "${baseResponse}"`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { temperature: 0.8, thinkingConfig: { thinkingBudget: 0 } },
            });

            setActiveHail({ targetId: target.id, loading: false, message: response.text });
        } catch (error) {
            console.error("Gemini API call failed:", error);
            const factionResponses = hailResponses[target.faction];
            const fallbackMessage = factionResponses ? factionResponses.greeting : "Static ... no response.";
            setActiveHail({ targetId: target.id, loading: false, message: fallbackMessage });
        }
    }, [selectedTargetId, gameState.currentSector.entities, addLog]);

    const onCloseHail = useCallback(() => {
        setActiveHail(null);
    }, []);

    const onChooseEventOption = useCallback((option: EventTemplateOption) => {
        if (!activeEvent) return;
        setEventResult(option.outcome.log);
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const { ship } = next.player;

            if (option.outcome.type === 'reward' || option.outcome.type === 'damage') {
                const amount = (option.outcome.type === 'damage' ? -1 : 1) * (option.outcome.amount || 0);
                if (option.outcome.resource) {
                     const res = option.outcome.resource;
                    switch (res) {
                        case 'hull': ship.hull = Math.max(0, Math.min(ship.maxHull, ship.hull + amount)); break;
                        case 'energy': ship.energy.current = Math.max(0, Math.min(ship.energy.max, ship.energy.current + amount)); break;
                        case 'dilithium': ship.dilithium.current = Math.max(0, Math.min(ship.dilithium.max, ship.dilithium.current + amount)); break;
                        case 'torpedoes': ship.torpedoes.current = Math.max(0, Math.min(ship.torpedoes.max, ship.torpedoes.current + amount)); break;
                        case 'morale': ship.crewMorale.current = Math.max(0, Math.min(ship.crewMorale.max, ship.crewMorale.current + amount)); break;
                        case 'weapons': case 'engines': case 'shields': case 'transporter':
                        case 'scanners': case 'computer': case 'lifeSupport': case 'shuttlecraft':
                            const subsystem = ship.subsystems[res];
                            if (subsystem) subsystem.health = Math.max(0, Math.min(subsystem.maxHealth, subsystem.health + amount));
                            break;
                    }
                }
            } else if (option.outcome.type === 'combat') {
                addLog({ sourceId: 'system', sourceName: 'Tactical Alert', message: 'Hostile ships detected!', isPlayerSource: false, color: 'border-red-600' });
                next.redAlert = true;
            }

            const beacon = next.currentSector.entities.find((e): e is EventBeacon => e.id === activeEvent.beaconId);
            if (beacon) beacon.isResolved = true;

            return next;
        });
        setActiveEvent(null);
    }, [activeEvent, addLog]);

    const onCloseEventResult = useCallback(() => {
        setEventResult(null);
    }, []);

    const onSelectSubsystem = useCallback((subsystem: keyof ShipSubsystems | null) => {
        setGameState(prev => {
            if (!prev.player.targeting) return prev;
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const currentTarget = next.player.targeting;
            
            const oldSubsystem = currentTarget.subsystem;
            currentTarget.subsystem = subsystem;

            // Reset the focus bonus if the target changes
            if (oldSubsystem !== subsystem) {
                currentTarget.consecutiveTurns = 1;
            }
            
            return next;
        });
    }, []);

    const onSendAwayTeam = useCallback((targetId: string, type: 'boarding' | 'strike') => {
        if (gameState.player.ship.isStunned || gameState.player.ship.cloakState === 'cloaked' || playerTurnActions.hasTakenMajorAction) return;
        if (playerTurnActions.hasUsedAwayTeam) {
            addLog({ sourceId: 'player', sourceName: gameState.player.ship.name, message: 'Transporter room is cycling. Only one away team action per turn.', isPlayerSource: true });
            return;
        }
        
        const { ship } = gameState.player;
        if (ship.securityTeams.current <= 0) {
            addLog({ sourceId: 'player', sourceName: ship.name, message: 'No security teams available to transport.', isPlayerSource: true });
            return;
        }
        const target = gameState.currentSector.entities.find((e: Entity): e is Ship => e.id === targetId);
        if (!target) {
            return;
        }
    
        setPlayerTurnActions(prev => ({ ...prev, hasUsedAwayTeam: true }));
        
        setGameState(prev => {
            const next: GameState = JSON.parse(JSON.stringify(prev));
            const shipInNext = next.player.ship;
            const targetInNext = next.currentSector.entities.find((e: Entity): e is Ship => e.id === targetId);
    
            if (!targetInNext) return prev; // Should not happen

            shipInNext.securityTeams.current--;
            addLog({ sourceId: 'player', sourceName: shipInNext.name, message: `Sending a security team to ${targetInNext.name}...`, isPlayerSource: true });
            
            let successChance = type === 'boarding' ? 0.5 : 0.8;
            if (targetInNext.isDerelict && type === 'boarding') {
                successChance = 1.0;
            }
            const success = Math.random() < successChance;

            if (success) {
                if (type === 'boarding') {
                    const wasDerelict = targetInNext.isDerelict;

                    targetInNext.faction = 'Federation';
                    targetInNext.logColor = 'border-blue-300';
                    targetInNext.isDerelict = false;
                    targetInNext.captureInfo = { captorId: shipInNext.id, repairTurn: next.turn };

                    const message = wasDerelict
                        ? `Boarding successful! We have secured the derelict ${targetInNext.name}! An engineering team is being dispatched to begin repairs.`
                        : `Boarding successful! We have captured the ${targetInNext.name}! An engineering team is being dispatched to stabilize and repair the vessel.`;
                        
                    addLog({ sourceId: 'player', sourceName: shipInNext.name, message: message, isPlayerSource: true });
                } else { // strike
                    const damage = 20 + Math.floor(Math.random() * 10);
                    targetInNext.hull = Math.max(0, targetInNext.hull - damage);
                    addLog({ sourceId: 'player', sourceName: shipInNext.name, message: `Strike team successful! They have sabotaged the enemy hull, dealing ${damage} damage.`, isPlayerSource: true });
                }
            } else {
                shipInNext.crewMorale.current = Math.max(0, shipInNext.crewMorale.current - 10);
                addLog({ sourceId: 'player', sourceName: shipInNext.name, message: `The away team was repelled! We have lost a security team and crew morale has dropped.`, isPlayerSource: true, color: 'border-red-500' });
            }

            return next;
        });
    }, [addLog, gameState, playerTurnActions]);

    const onEnterOrbit = useCallback((planetId: string) => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            next.orbitingPlanetId = planetId;
            const planet = next.currentSector.entities.find((e:Entity) => e.id === planetId);
            addLog({ sourceId: 'player', sourceName: next.player.ship.name, message: `Entering orbit of ${planet?.name || 'the planet'}.`, isPlayerSource: true });
            return next;
        });
    }, [addLog]);

    const onToggleCloak = useCallback(() => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const { ship } = next.player;

            if (playerTurnActions.hasTakenMajorAction) {
                addLog({ sourceId: 'player', sourceName: ship.name, message: "Cannot perform another action this turn.", isPlayerSource: true });
                return prev;
            }

            if (!ship.cloakingCapable) {
                addLog({ sourceId: 'player', sourceName: ship.name, message: "This ship is not equipped with a cloaking device.", isPlayerSource: true });
                return prev;
            }

            const stats = shipClasses[ship.shipModel]?.[ship.shipClass];
            if (!stats) return prev;

            if (ship.cloakState === 'cloaked') {
                ship.cloakState = 'visible';
                ship.cloakCooldown = 2; 
                addLog({ sourceId: 'player', sourceName: ship.name, message: "Cloaking device disengaged. This has used our tactical action for the turn.", isPlayerSource: true });
                setPlayerTurnActions(pt => ({...pt, hasTakenMajorAction: true}));
            } else if (ship.cloakState === 'visible') {
                if (ship.cloakCooldown > 0) {
                    addLog({ sourceId: 'player', sourceName: ship.name, message: `Cannot engage cloak: Device is recharging for ${ship.cloakCooldown} more turn(s).`, isPlayerSource: true });
                    return prev;
                }
                if (next.redAlert) {
                    addLog({ sourceId: 'player', sourceName: ship.name, message: "Cannot engage cloak while shields are up (Red Alert).", isPlayerSource: true });
                    return prev;
                }
                const { success } = consumeEnergy(ship, stats.cloakEnergyCost.initial);
                if (!success) {
                    addLog({ sourceId: 'player', sourceName: ship.name, message: "Insufficient power to initiate cloaking sequence.", isPlayerSource: true });
                    return prev;
                }
                
                ship.cloakState = 'cloaking';
                addLog({ sourceId: 'player', sourceName: ship.name, message: `Initiating cloaking sequence. Ship is vulnerable.`, isPlayerSource: true });
                setPlayerTurnActions(pt => ({...pt, hasTakenMajorAction: true}));
            }
            return next;
        });
    }, [addLog, playerTurnActions]);

    return {
        gameState, selectedTargetId, navigationTarget, currentView, isDocked, activeAwayMission, activeHail, targetEntity: gameState.currentSector.entities.find(e => e.id === selectedTargetId),
        playerTurnActions, activeEvent, isWarping, isTurnResolving, awayMissionResult, eventResult,
        desperationMoveAnimation: gameState.desperationMoveAnimations.length > 0 ? gameState.desperationMoveAnimations[0] : null,
        onEnergyChange, onEndTurn, onFirePhasers, onLaunchTorpedo, onEvasiveManeuvers, onSelectTarget, onSetNavigationTarget, onSetView, onWarp, onDockWithStarbase, onRechargeDilithium,
        onResupplyTorpedoes, onStarbaseRepairs, onSelectRepairTarget, onScanTarget, onInitiateRetreat, onCancelRetreat, onStartAwayMission, onChooseAwayMissionOption,
        onHailTarget, onCloseHail, onSelectSubsystem, onChooseEventOption, saveGame, loadGame, exportSave, importSave, onDistributeEvenly, onSendAwayTeam,
        onToggleRedAlert, onCloseAwayMissionResult, onCloseEventResult, onScanQuadrant, onEnterOrbit, onToggleCloak,
    };
};