
import { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { GameState, QuadrantPosition, Ship, SectorState, AwayMissionTemplate, AwayMissionOption, ActiveHail, ActiveCounselSession, BridgeOfficer, OfficerAdvice, Entity, Position, PlayerTurnActions, EventTemplate, EventTemplateOption, EventBeacon, PlanetClass, CombatEffect, TorpedoProjectile, ShipSubsystems, Planet } from '../types';
import { awayMissionTemplates, hailResponses, counselAdvice, eventTemplates } from '../assets/content';
import { planetNames } from '../assets/planets/configs/planetNames';
import { planetClasses, planetTypes } from '../assets/planets/configs/planetTypes';
import { SECTOR_WIDTH, SECTOR_HEIGHT, QUADRANT_SIZE, SAVE_GAME_KEY } from '../assets/configs/gameConstants';

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


const generateSectorContent = (sector: SectorState, availablePlanetNames?: Record<PlanetClass, string[]>): SectorState => {
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

    // Chance for a starbase (rare)
    if (Math.random() < 0.1) {
        newEntities.push({
            id: uniqueId(),
            name: `Starbase ${Math.floor(Math.random() * 100) + 1}`,
            type: 'starbase',
            faction: 'Federation',
            position: getUniquePosition(),
            scanned: false,
            hull: 500,
            maxHull: 500,
        });
    }

    // Fix: Corrected loop to generate the intended number of entities.
    for (let i = 0; i < entityCount; i++) {
        const entityTypeRoll = Math.random();
        const position = getUniquePosition();

        if (entityTypeRoll < 0.1 && newEntities.length > 0) { // 10% chance for an event, not in an empty sector
            const eventTypes: EventBeacon['eventType'][] = ['derelict_ship', 'distress_call', 'ancient_probe'];
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            newEntities.push({
                id: uniqueId(),
                name: 'Unidentified Signal',
                type: 'event_beacon',
                eventType: eventType,
                faction: 'Unknown',
                position: position,
                scanned: false,
                isResolved: false,
            });
        } else if (entityTypeRoll < 0.4) { // ~30% chance for a planet
            const planetClass = planetClasses[Math.floor(Math.random() * planetClasses.length)];
            const planetConfig = planetTypes[planetClass];
            
            let name: string;
            // New logic to handle unique names from a pool
            if (availablePlanetNames) {
                const nameList = availablePlanetNames[planetConfig.typeName];
                if (nameList && nameList.length > 0) {
                    const nameIndex = Math.floor(Math.random() * nameList.length);
                    name = nameList[nameIndex];
                    nameList.splice(nameIndex, 1); // Remove used name from pool
                } else {
                    name = `Uncharted Planet ${uniqueId().substr(-4)}`; // Fallback if names run out
                }
            } else {
                // Original behavior if no pool is provided
                const nameList = planetNames[planetConfig.typeName] || ['Unknown Planet'];
                name = nameList[Math.floor(Math.random() * nameList.length)];
            }

            newEntities.push({
                id: uniqueId(),
                name: name,
                type: 'planet',
                faction: 'None',
                position,
                scanned: false,
                planetClass: planetClass,
                awayMissionCompleted: false,
            });
        } else if (entityTypeRoll < 0.55) { // 15% chance for an asteroid field
             newEntities.push({
                id: uniqueId(),
                name: 'Asteroid Field',
                type: 'asteroid_field',
                faction: 'None',
                position,
                scanned: true,
            });
        } else if (entityTypeRoll < 0.70) { // 15% chance for a Klingon/Romulan
            const isKlingon = Math.random() < 0.7;
            newEntities.push({
                id: uniqueId(),
                name: isKlingon ? 'Klingon Bird-of-Prey' : 'Romulan Warbird',
                type: 'ship',
                faction: isKlingon ? 'Klingon' : 'Romulan',
                position,
                hull: 60, maxHull: 60, shields: 20, maxShields: 20,
                energy: { current: 50, max: 50 }, energyAllocation: { weapons: 50, shields: 50, engines: 0 },
                torpedoes: { current: 4, max: 4 }, dilithium: { current: 0, max: 0 }, scanned: false, evasive: false, retreatingTurn: null,
                subsystems: { weapons: { health: 100, maxHealth: 100 }, engines: { health: 100, maxHealth: 100 }, shields: { health: 100, maxHealth: 100 }, transporter: { health: 0, maxHealth: 0 } },
                crewMorale: { current: 100, max: 100 },
                securityTeams: { current: 5, max: 5 }, // AI ships have internal security
                repairTarget: null,
            });
        } else if (entityTypeRoll < 0.85) { // 15% chance for a Pirate
            newEntities.push({
                id: uniqueId(),
                name: 'Pirate Raider',
                type: 'ship',
                faction: 'Pirate',
                position,
                hull: 40, maxHull: 40, shields: 10, maxShields: 10,
                energy: { current: 30, max: 30 }, energyAllocation: { weapons: 60, shields: 40, engines: 0 },
                torpedoes: { current: 2, max: 2 }, dilithium: { current: 0, max: 0 }, scanned: false, evasive: false, retreatingTurn: null,
                subsystems: { weapons: { health: 80, maxHealth: 80 }, engines: { health: 100, maxHealth: 100 }, shields: { health: 70, maxHealth: 70 }, transporter: { health: 0, maxHealth: 0 } },
                crewMorale: { current: 100, max: 100 },
                securityTeams: { current: 3, max: 3 },
                repairTarget: null,
            });
        } else { // ~15% chance for a Trader
            newEntities.push({
                id: uniqueId(),
                name: 'Independent Trader',
                type: 'ship',
                faction: 'Independent',
                position,
                hull: 30, maxHull: 30, shields: 0, maxShields: 0,
                energy: { current: 20, max: 20 }, energyAllocation: { weapons: 0, shields: 0, engines: 100 },
                torpedoes: { current: 0, max: 0 }, dilithium: { current: 0, max: 0 }, scanned: false, evasive: false, retreatingTurn: null,
                subsystems: { weapons: { health: 0, maxHealth: 0 }, engines: { health: 100, maxHealth: 100 }, shields: { health: 0, maxHealth: 0 }, transporter: { health: 0, maxHealth: 0 } },
                crewMorale: { current: 100, max: 100 },
                securityTeams: { current: 1, max: 1 },
                repairTarget: null,
            });
        }
    }

    return {
        ...sector,
        entities: newEntities,
        hasNebula: Math.random() < 0.2, // 20% chance of a nebula
    };
};

const pregenerateGalaxy = (quadrantMap: SectorState[][]): SectorState[][] => {
    const newMap = JSON.parse(JSON.stringify(quadrantMap));
    const availablePlanetNames: Record<PlanetClass, string[]> = JSON.parse(JSON.stringify(planetNames));

    for (let qy = 0; qy < QUADRANT_SIZE; qy++) {
        for (let qx = 0; qx < QUADRANT_SIZE; qx++) {
            newMap[qy][qx] = generateSectorContent(newMap[qy][qx], availablePlanetNames);
        }
    }
    return newMap;
};


const createInitialGameState = (): GameState => {
  // Create player ship
  const playerShip: Ship = {
    id: 'player',
    name: 'U.S.S. Endeavour',
    type: 'ship',
    faction: 'Federation',
    position: { x: Math.floor(SECTOR_WIDTH / 2), y: SECTOR_HEIGHT - 2 },
    hull: 100,
    maxHull: 100,
    shields: 50,
    maxShields: 50,
    subsystems: {
      weapons: { health: 100, maxHealth: 100 },
      engines: { health: 100, maxHealth: 100 },
      shields: { health: 100, maxHealth: 100 },
      transporter: { health: 100, maxHealth: 100 },
    },
    energy: { current: 100, max: 100 },
    energyAllocation: { weapons: 34, shields: 33, engines: 33 },
    torpedoes: { current: 10, max: 10 },
    dilithium: { current: 20, max: 20 },
    scanned: true,
    evasive: false,
    retreatingTurn: null,
    crewMorale: { current: 100, max: 100 },
    securityTeams: { current: 3, max: 3 },
    repairTarget: null,
  };

  const playerCrew: BridgeOfficer[] = [
    { id: 'officer-1', name: "Cmdr. T'Vok", role: 'Science', personality: 'Logical' },
    { id: 'officer-2', name: 'Lt. Thorne', role: 'Security', personality: 'Aggressive' },
    { id: 'officer-3', name: 'Lt. Cmdr. Singh', role: 'Engineering', personality: 'Cautious' },
  ];

  // Create quadrant map shell
  let quadrantMap: SectorState[][] = Array.from({ length: QUADRANT_SIZE }, () =>
    Array.from({ length: QUADRANT_SIZE }, () => ({
      entities: [],
      visited: false,
      hasNebula: false,
    }))
  );

  // Pregenerate the entire galaxy's content
  quadrantMap = pregenerateGalaxy(quadrantMap);

  const playerPosition = { qx: Math.floor(QUADRANT_SIZE / 2), qy: Math.floor(QUADRANT_SIZE / 2) };

  // Get the pre-generated starting sector
  let startSector = quadrantMap[playerPosition.qy][playerPosition.qx];
  startSector.visited = true;

  // Ensure starting sector has at least one planet for away missions and isn't a total deathtrap
  if (!startSector.entities.some(e => e.type === 'planet')) {
    startSector.entities.push({
        id: uniqueId(),
        name: 'Alpha Centauri III',
        type: 'planet',
        faction: 'None',
        position: { x: 2, y: 2 },
        scanned: true,
        planetClass: 'M',
        awayMissionCompleted: false,
    });
  }
  startSector.entities = startSector.entities.filter(e => e.faction !== 'Klingon' && e.faction !== 'Romulan' && e.faction !== 'Pirate' && e.type !== 'event_beacon');

  return {
    player: { ship: playerShip, position: playerPosition, crew: playerCrew },
    quadrantMap,
    currentSector: startSector,
    turn: 1,
    logs: ["Captain's Log, Stardate 47458.2. We have entered the Typhon Expanse."],
    gameOver: false,
    gameWon: false,
    redAlert: false,
    combatEffects: [],
  };
};

const ai = process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null;

export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState>(() => {
        const savedStateJSON = localStorage.getItem(SAVE_GAME_KEY);
        if (savedStateJSON) {
            try {
                const savedState = JSON.parse(savedStateJSON);
                if (savedState.player && savedState.turn) {
                    // Fix: Cast player object to any to handle deprecated 'boardingParty' property for backward compatibility.
                    // Backwards compatibility for saves
                    if ((savedState.player as any).boardingParty) { // remove old state
                        delete (savedState.player as any).boardingParty;
                    }
                    if (!savedState.player.ship.securityTeams) {
                        savedState.player.ship.securityTeams = { current: 3, max: 3 };
                    }
                    if (savedState.player.ship.repairTarget === undefined) {
                         savedState.player.ship.repairTarget = null;
                    }
                    if (!savedState.player.ship.subsystems.transporter) {
                        savedState.player.ship.subsystems.transporter = { health: 100, maxHealth: 100 };
                    }
                    return savedState;
                }
            } catch (e) {
                console.error("Could not parse saved state, starting new game.", e);
            }
        }
        return createInitialGameState();
    });
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
    const [navigationTarget, setNavigationTarget] = useState<{ x: number; y: number } | null>(null);
    const [currentView, setCurrentView] = useState<'sector' | 'quadrant'>('sector');
    const [isDocked, setIsDocked] = useState(false);
    const [activeAwayMission, setActiveAwayMission] = useState<AwayMissionTemplate | null>(null);
    const [activeHail, setActiveHail] = useState<ActiveHail | null>(null);
    const [officerCounsel, setOfficerCounsel] = useState<ActiveCounselSession | null>(null);
    const [selectedSubsystem, setSelectedSubsystem] = useState<'weapons' | 'engines' | 'shields' | null>(null);
    const [playerTurnActions, setPlayerTurnActions] = useState<PlayerTurnActions>({});
    const [activeEvent, setActiveEvent] = useState<{ beaconId: string; template: EventTemplate } | null>(null);
    const [isWarping, setIsWarping] = useState(false);
    const [isTurnResolving, setIsTurnResolving] = useState(false);
    const [awayMissionResult, setAwayMissionResult] = useState<string | null>(null);
    const [activeMissionPlanetId, setActiveMissionPlanetId] = useState<string | null>(null);


    const addLog = useCallback((message: string) => {
        setGameState(prev => ({ ...prev, logs: [message, ...prev.logs] }));
    }, []);

    // Effect to manage docking status based on proximity
    useEffect(() => {
        if (!isDocked) return;

        const starbase = gameState.currentSector.entities.find(e => e.type === 'starbase');
        
        // If there's no starbase in the sector, we can't be docked.
        if (!starbase) {
            setIsDocked(false);
            return;
        }

        const distance = calculateDistance(gameState.player.ship.position, starbase.position);
        if (distance > 1) {
            setIsDocked(false);
            addLog("Undocked: Moved out of range of the starbase.");
        }
    }, [gameState.turn, gameState.currentSector.entities, isDocked, addLog]);

    // Effect to trigger dynamic events when close to a beacon
    useEffect(() => {
        if (activeEvent) return; // Don't trigger a new event if one is already active

        const beacon = gameState.currentSector.entities.find(e =>
            e.type === 'event_beacon' &&
            !e.isResolved &&
            calculateDistance(gameState.player.ship.position, e.position) <= 1
        ) as EventBeacon | undefined;

        if (beacon) {
            const templates = eventTemplates[beacon.eventType];
            if (templates && templates.length > 0) {
                const template = templates[Math.floor(Math.random() * templates.length)];
                addLog(`Approaching an ${beacon.name}...`);
                setActiveEvent({ beaconId: beacon.id, template });
            }
        }
    }, [gameState.player.ship.position, gameState.currentSector.entities, activeEvent]);

    // Effect to clear combat effects after they've been displayed
    useEffect(() => {
        if (gameState.combatEffects.length > 0) {
            const maxDelay = Math.max(0, ...gameState.combatEffects.map(e => e.delay));
            const totalAnimationTime = maxDelay + 1000; // 1000ms is phaser animation duration
            const timer = setTimeout(() => {
                setGameState(prev => ({ ...prev, combatEffects: [] }));
            }, totalAnimationTime);
            return () => clearTimeout(timer);
        }
    }, [gameState.combatEffects]);


    const saveGame = useCallback(() => {
        try {
            localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameState));
            addLog('Game state saved successfully.');
        } catch (error) {
            console.error("Failed to save game:", error);
            addLog('Error: Could not save game state.');
        }
    }, [gameState, addLog]);

    const loadGame = useCallback(() => {
        try {
            const savedStateJSON = localStorage.getItem(SAVE_GAME_KEY);
            if (savedStateJSON) {
                const savedState: GameState = JSON.parse(savedStateJSON);
                if (savedState.player && savedState.turn) {
                    // Fix: Cast player object to any to handle deprecated 'boardingParty' property for backward compatibility.
                    // Backwards compatibility for saves
                    if ((savedState.player as any).boardingParty) {
                        delete (savedState.player as any).boardingParty;
                    }
                     if (!savedState.player.ship.securityTeams) {
                        savedState.player.ship.securityTeams = { current: 3, max: 3 };
                    }
                    if (savedState.player.ship.repairTarget === undefined) {
                         savedState.player.ship.repairTarget = null;
                    }
                    if (!savedState.player.ship.subsystems.transporter) {
                        savedState.player.ship.subsystems.transporter = { health: 100, maxHealth: 100 };
                    }
                    setGameState(savedState);
                    addLog('Game state loaded successfully.');
                } else {
                    addLog('Error: Invalid save data found.');
                }
            } else {
                addLog('No saved game found to load.');
            }
        } catch (error) {
            console.error("Failed to load game:", error);
            addLog('Error: Could not load game state.');
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
            addLog('Save file exported.');
        } catch (error) {
            console.error("Failed to export save:", error);
            addLog('Error: Could not export save file.');
        }
    }, [gameState, addLog]);

    const importSave = useCallback((jsonString: string) => {
        try {
            const newState: GameState = JSON.parse(jsonString);
            if (newState.player && newState.turn && newState.quadrantMap) {
                setGameState(newState);
                addLog('Game state imported successfully.');
            } else {
                addLog('Error: The imported file is not a valid save file.');
            }
        } catch (error) {
            console.error("Failed to import save:", error);
            addLog('Error: Could not parse the imported save file.');
        }
    }, [addLog]);

    const onEndTurn = useCallback(() => {
        if (isTurnResolving) return;
        setIsTurnResolving(true);

        const applyDamage = (target: Ship, damage: number, type: 'phaser' | 'torpedo', subsystem: 'weapons' | 'engines' | 'shields' | null, logs: string[], sourceShip: Ship) => {
            // --- Hit Chance Calculation ---
            let hitChance = type === 'phaser' ? 0.9 : 1.0; // Torpedo hit chance is handled separately
            // Evasive maneuvers of target
            if (target.evasive) {
                hitChance *= (type === 'phaser' ? 0.6 : 0.3); // 40% phaser reduction, 70% torpedo reduction
            }
            // Evasive maneuvers of attacker (player only)
            if (sourceShip.id === 'player' && sourceShip.evasive && type === 'phaser') {
                hitChance *= 0.75; // 25% accuracy penalty
            }
            
            if (Math.random() > hitChance) {
                logs.push(`${target.name} evaded an attack from ${sourceShip.name}!`);
                return;
            }

            // --- Damage Application ---
            let remainingDamage = damage;
            const shieldDamage = type === 'torpedo' ? remainingDamage * 0.25 : remainingDamage;
            const absorbedByShields = Math.min(target.shields, shieldDamage);
            target.shields -= absorbedByShields;
            remainingDamage -= absorbedByShields / (type === 'torpedo' ? 0.25 : 1);
            
            if (remainingDamage > 0) {
                if (subsystem && target.subsystems[subsystem]) {
                    const subsystemDamage = remainingDamage * 0.7;
                    const hullDamage = remainingDamage * 0.3;
                    target.hull -= hullDamage;
                    target.subsystems[subsystem].health = Math.max(0, target.subsystems[subsystem].health - subsystemDamage);
                    logs.push(`${target.name} takes ${Math.round(hullDamage)} hull damage and ${Math.round(subsystemDamage)} damage to ${subsystem}!`);
                    if (target.subsystems[subsystem].health === 0) {
                        logs.push(`CRITICAL HIT: ${target.name}'s ${subsystem} have been disabled!`);
                    }
                } else {
                    target.hull -= remainingDamage;
                    logs.push(`${target.name} takes ${Math.round(remainingDamage)} hull damage from ${sourceShip.name}.`);
                }
            } else {
                 logs.push(`${target.name}'s shields absorbed the hit from ${sourceShip.name}.`);
            }
        };

        // --- Phase 1: Player Actions & Passive Systems ---
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            if (next.gameOver) {
                setIsTurnResolving(false);
                return prev;
            }
            const { player, currentSector } = next;
            const playerShip = player.ship;
            const logs: string[] = [];
            const phaserEffects: CombatEffect[] = [];

            // Passive Repair Action
            if (playerShip.repairTarget) {
                const targetSystem = playerShip.repairTarget;
                const repairAmount = 25;
                const energyCost = 10;
                if (playerShip.energy.current >= energyCost) {
                    playerShip.energy.current -= energyCost;
                    let repaired = false;
                    let isComplete = false;
                    if (targetSystem === 'hull') {
                        const oldHull = playerShip.hull;
                        playerShip.hull = Math.min(playerShip.maxHull, playerShip.hull + repairAmount);
                        if (playerShip.hull > oldHull) {
                            logs.push(`Damage control repaired ${Math.round(playerShip.hull - oldHull)} points of hull integrity.`);
                            repaired = true;
                        }
                        if (playerShip.hull === playerShip.maxHull) isComplete = true;
                    } else { // It's a subsystem
                        const subsystem = playerShip.subsystems[targetSystem as 'weapons' | 'engines' | 'shields' | 'transporter'];
                        if (subsystem) {
                            const oldHealth = subsystem.health;
                            subsystem.health = Math.min(subsystem.maxHealth, subsystem.health + repairAmount);
                            if (subsystem.health > oldHealth) {
                                logs.push(`Engineering teams restored ${Math.round(subsystem.health - oldHealth)} health to the ${targetSystem} system.`);
                                repaired = true;
                            }
                            if (subsystem.health === subsystem.maxHealth) isComplete = true;
                        }
                    }
                    if (isComplete) {
                        logs.push(`Repairs to ${targetSystem} are complete.`);
                        playerShip.repairTarget = null;
                    } else if (!repaired) {
                        logs.push(`The ${targetSystem} system is already at full integrity. No repairs needed.`);
                        playerShip.repairTarget = null; // Auto-cancel if already full
                    }
                } else {
                    logs.push(`Repair of ${targetSystem} failed: Insufficient energy.`);
                }
            }

            if (playerShip.retreatingTurn !== null) {
                logs.push("Attempting to retreat, cannot take other actions.");
            } else {
                if (navigationTarget) {
                    if (playerShip.position.x !== navigationTarget.x || playerShip.position.y !== navigationTarget.y) {
                        playerShip.position = moveOneStep(playerShip.position, navigationTarget);
                        logs.push(`Moving to ${playerShip.position.x}, ${playerShip.position.y}.`);
                    }
                    if (playerShip.position.x === navigationTarget.x && playerShip.position.y === navigationTarget.y) {
                        setNavigationTarget(null);
                        logs.push(`Arrived at navigation target.`);
                    }
                }
                 if (playerTurnActions.combat) {
                    const target = currentSector.entities.find((e: Entity) => e.id === playerTurnActions.combat!.targetId) as Ship;
                    if (target) {
                        if (playerTurnActions.combat.type === 'phasers') {
                            const baseDamage = 20 * (playerShip.energyAllocation.weapons / 100);
                            playerShip.energy.current -= 10;
                            phaserEffects.push({ type: 'phaser', sourceId: playerShip.id, targetId: target.id, faction: playerShip.faction, delay: 0 });
                            applyDamage(target, baseDamage, 'phaser', playerTurnActions.combat.subsystem || null, logs, playerShip);
                            logs.push(`Firing phasers at ${target.name}${playerTurnActions.combat.subsystem ? `'s ${playerTurnActions.combat.subsystem}`: ''}.`);
                        }
                    }
                }
            }
            next.logs = [...logs.reverse(), ...prev.logs];
            next.combatEffects = phaserEffects;
            return next;
        });
        
        // --- Phase 2: Projectile Movement & Resolution ---
        setTimeout(() => {
            setGameState(prev => {
                const next = JSON.parse(JSON.stringify(prev));
                if (next.gameOver) return prev;

                const logs: string[] = [];
                const newEffects: CombatEffect[] = [];
                const destroyedProjectileIds = new Set<string>();
                const { currentSector } = next;

                const projectiles = currentSector.entities.filter((e: Entity): e is TorpedoProjectile => e.type === 'torpedo_projectile');
                const allShips = [...currentSector.entities.filter((e: Entity): e is Ship => e.type === 'ship'), next.player.ship];

                projectiles.forEach(torpedo => {
                    if (destroyedProjectileIds.has(torpedo.id)) return;

                    const targetEntity = allShips.find(s => s.id === torpedo.targetId);
                    const sourceEntity = allShips.find(s => s.id === torpedo.sourceId);

                    // Check for invalid target or expiration
                    if (!targetEntity || !sourceEntity || targetEntity.faction === torpedo.faction) {
                        logs.push(`${torpedo.name} self-destructs as its target is no longer valid.`);
                        destroyedProjectileIds.add(torpedo.id);
                        return;
                    }
                    if (next.turn - torpedo.turnLaunched >= 3) { // Active for up to 3 turns
                        logs.push(`${torpedo.name} self-destructs at the end of its lifespan.`);
                        destroyedProjectileIds.add(torpedo.id);
                        return;
                    }

                    const targetPosition = targetEntity.position;

                    // Move projectile
                    for (let i = 0; i < torpedo.speed; i++) {
                        if (torpedo.position.x === targetPosition.x && torpedo.position.y === targetPosition.y) break;
                        
                        torpedo.position = moveOneStep(torpedo.position, targetPosition);
                        torpedo.path.push({ ...torpedo.position });
                        torpedo.stepsTraveled++;
                        
                        // Check for collision with any valid target ship after each step
                        const potentialTargets = allShips.filter(s => s.faction !== torpedo.faction && s.hull > 0);
                        for (const ship of potentialTargets) {
                            if (ship.position.x === torpedo.position.x && ship.position.y === torpedo.position.y) {
                                // Collision!
                                let hitChance = Math.max(0.05, 1.0 - (torpedo.stepsTraveled * 0.24));
                                if (ship.evasive) hitChance *= 0.3; // 70% reduction

                                if (Math.random() < hitChance) {
                                    applyDamage(ship, 50, 'torpedo', null, logs, sourceEntity);
                                    newEffects.push({ type: 'torpedo_hit', position: ship.position, delay: 0 });
                                } else {
                                    logs.push(`A torpedo from ${sourceEntity.name} misses ${ship.name}!`);
                                }
                                destroyedProjectileIds.add(torpedo.id);
                                return; // Stop processing this torpedo
                            }
                        }
                    }
                });

                next.currentSector.entities = next.currentSector.entities.filter((e: Entity) => !destroyedProjectileIds.has(e.id));
                next.logs = [...logs.reverse(), ...next.logs];
                next.combatEffects = [...next.combatEffects, ...newEffects];
                return next;
            });
        }, 300);

        // --- Phase 3: Allied Ship AI ---
        setTimeout(() => {
            setGameState(prev => {
                const next = JSON.parse(JSON.stringify(prev));
                if (next.gameOver) return prev;
        
                const logs: string[] = [];
                const phaserEffects: CombatEffect[] = [];
                const { currentSector } = next;
        
                const alliedShips = currentSector.entities.filter((e: Entity): e is Ship => e.type === 'ship' && e.faction === 'Federation' && e.id !== 'player');
                const hostileShips = currentSector.entities.filter((e: Entity): e is Ship => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
        
                if (alliedShips.length > 0 && hostileShips.length > 0) {
                    alliedShips.forEach((ally, index) => {
                        // Find closest hostile
                        let closestHostile: Ship | null = null;
                        let minDistance = Infinity;
                        hostileShips.forEach(hostile => {
                            const distance = calculateDistance(ally.position, hostile.position);
                            if (distance < minDistance) {
                                minDistance = distance;
                                closestHostile = hostile;
                            }
                        });
        
                        if (closestHostile && minDistance <= 6) {
                            logs.push(`Allied ship ${ally.name} is engaging ${closestHostile.name}!`);
                            const allyDamage = 15; // Allies do a bit less damage
                            phaserEffects.push({ type: 'phaser', sourceId: ally.id, targetId: closestHostile.id, faction: ally.faction, delay: index * 200 });
                            applyDamage(closestHostile, allyDamage, 'phaser', null, logs, ally);
                        }
                    });
                }
        
                next.logs = [...logs.reverse(), ...next.logs];
                next.combatEffects = [...next.combatEffects, ...phaserEffects];
                return next;
            });
        }, 800);

        // --- Phase 4: Hostile AI Movement ---
        setTimeout(() => {
            setGameState(prev => {
                const next = JSON.parse(JSON.stringify(prev));
                if (next.gameOver) {
                    return prev;
                }
                const hostileAIShips = next.currentSector.entities.filter((e: Entity): e is Ship => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
                hostileAIShips.forEach((aiShip: Ship) => {
                    const distance = calculateDistance(aiShip.position, next.player.ship.position);
                    if (distance > 2 && aiShip.subsystems.engines.health > 0) {
                        aiShip.position = moveOneStep(aiShip.position, next.player.ship.position);
                    }
                });
                return { ...next };
            });
        }, 1200); // Wait for projectile animation

        // --- Phase 5: Hostile AI Firing & Turn Cleanup ---
        setTimeout(() => {
            setGameState(prev => {
                const next = JSON.parse(JSON.stringify(prev));
                if (next.gameOver) {
                    setIsTurnResolving(false);
                    return prev;
                }
                const logs: string[] = [];
                const { player, currentSector } = next;
                const playerShip = player.ship;
                const phaserEffects: CombatEffect[] = [];
                let redAlertThisTurn = false;
                
                const hostileAIShips = currentSector.entities.filter((e: Entity): e is Ship => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
                hostileAIShips.forEach((aiShip: Ship, index: number) => {
                    const distance = calculateDistance(aiShip.position, playerShip.position);

                    // Auto-scan if attacked at close range
                    if (distance <= 7 && !aiShip.scanned) {
                        aiShip.scanned = true;
                        logs.push(`Tactical Alert: Automatically scanned ${aiShip.name} due to proximity during attack.`);
                    }

                    // Phaser attack
                    if (aiShip.subsystems.weapons.health > 0 && distance <= 5) {
                        const aiDamage = 10 * (aiShip.energyAllocation.weapons / 100);
                        phaserEffects.push({ type: 'phaser', sourceId: aiShip.id, targetId: playerShip.id, faction: aiShip.faction, delay: index * 250 });
                        applyDamage(playerShip, aiDamage, 'phaser', null, logs, aiShip);
                        redAlertThisTurn = true;
                    }
                    
                    // Torpedo attack
                    if (aiShip.torpedoes.current > 0 && aiShip.subsystems.weapons.health > 0 && distance <= 8 && Math.random() < 0.4) {
                         aiShip.torpedoes.current--;
                         const torpedo: TorpedoProjectile = {
                             id: uniqueId(),
                             name: 'Enemy Torpedo',
                             type: 'torpedo_projectile',
                             faction: aiShip.faction,
                             position: { ...aiShip.position },
                             targetId: playerShip.id,
                             sourceId: aiShip.id,
                             stepsTraveled: 0,
                             speed: 2,
                             path: [{ ...aiShip.position }],
                             scanned: true,
                             turnLaunched: next.turn,
                         };
                         next.currentSector.entities.push(torpedo);
                         logs.push(`${aiShip.name} has launched a torpedo!`);
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

                if (playerShip.retreatingTurn !== null && next.turn >= playerShip.retreatingTurn) {
                    playerShip.retreatingTurn = null;
                    next.currentSector.entities = next.currentSector.entities.filter((e: Entity) => e.faction !== 'Klingon' && e.faction !== 'Romulan' && e.faction !== 'Pirate');
                    logs.push("Retreat successful! We've escaped to a safe distance.");
                    setSelectedTargetId(null);
                }

                const destroyedIds = new Set<string>();
                currentSector.entities.forEach(e => {
                    if ((e.type === 'ship' || e.type === 'starbase') && e.hull <= 0) {
                        logs.push(`${e.name} has been destroyed!`);
                        destroyedIds.add(e.id);
                    }
                });
                if (selectedTargetId && destroyedIds.has(selectedTargetId)) {
                    setSelectedTargetId(null);
                }
                next.currentSector.entities = currentSector.entities.filter(e => !destroyedIds.has(e.id));
                
                if (playerShip.hull <= 0) {
                    next.gameOver = true;
                    logs.push("CRITICAL: U.S.S. Endeavour has been destroyed. Game Over.");
                }

                next.turn++;
                logs.unshift(`Turn ${next.turn} begins.`);
                next.logs = [...logs.reverse(), ...prev.logs];
                next.redAlert = redAlertThisTurn || next.currentSector.entities.some((e: Entity) => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction));
                setPlayerTurnActions({});
                
                setIsTurnResolving(false);
                return next;
            });
        }, 1700); // Wait for AI movement to be perceived

    }, [addLog, playerTurnActions, navigationTarget, selectedTargetId, isTurnResolving]);

    const onEnergyChange = useCallback((changedKey: 'weapons' | 'shields' | 'engines', value: number) => {
        setGameState(prev => {
            const oldAlloc = prev.player.ship.energyAllocation;
            if (oldAlloc[changedKey] === value) return prev;
            
            const newAlloc = { ...oldAlloc };
            const oldValue = oldAlloc[changedKey];
            const clampedNewValue = Math.max(0, Math.min(100, value));
            
            const otherKeys = (['weapons', 'shields', 'engines'] as const).filter(k => k !== changedKey);
            const [key1, key2] = otherKeys;
            const val1 = oldAlloc[key1];
            const val2 = oldAlloc[key2];
            const totalOtherVal = val1 + val2;

            const intendedDiff = clampedNewValue - oldValue;
            
            let actualDiff = intendedDiff;
            if (intendedDiff > 0) { // Increasing slider, can't take more than what other sliders have
                actualDiff = Math.min(intendedDiff, totalOtherVal);
            }
            
            const finalNewValue = oldValue + actualDiff;
            newAlloc[changedKey] = finalNewValue;

            const toDistribute = -actualDiff;

            if (totalOtherVal > 0) {
                newAlloc[key1] = val1 + Math.round(toDistribute * (val1 / totalOtherVal));
                newAlloc[key2] = val2 + Math.round(toDistribute * (val2 / totalOtherVal));
            } else { // Both other sliders are 0, distribute evenly (they'll stay 0)
                newAlloc[key1] = val1 + Math.floor(toDistribute / 2);
                newAlloc[key2] = val2 + Math.ceil(toDistribute / 2);
            }

            // Final pass to ensure the sum is exactly 100 due to rounding
            const sum = newAlloc.weapons + newAlloc.shields + newAlloc.engines;
            if (sum !== 100) {
                newAlloc[changedKey] += (100 - sum);
            }

            return { ...prev, player: { ...prev.player, ship: { ...prev.player.ship, energyAllocation: newAlloc } } };
        });
    }, []);

    const onDistributeEvenly = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            player: {
                ...prev.player,
                ship: {
                    ...prev.player.ship,
                    energyAllocation: { weapons: 34, shields: 33, engines: 33 }
                }
            }
        }));
        addLog("Energy allocation reset to default distribution.");
    }, [addLog]);


    const onSelectTarget = useCallback((id: string | null) => {
        setSelectedTargetId(id);
        setSelectedSubsystem(null);
    }, []);
    
    const onSetNavigationTarget = useCallback((pos: { x: number; y: number } | null) => {
        setNavigationTarget(pos);
        if (pos) {
          addLog(`Navigation target set to ${pos.x}, ${pos.y}.`);
        } else {
          addLog(`Navigation target cleared.`);
        }
    }, [addLog]);

    const onWarp = useCallback((pos: QuadrantPosition) => {
        if (gameState.player.ship.dilithium.current <= 0) {
            addLog("Warp failed. Insufficient Dilithium crystals.");
            return;
        }
         addLog(`Warp drive engaged. Plotting course for quadrant ${pos.qx}, ${pos.qy}.`);
         setIsWarping(true);

         setTimeout(() => {
            setCurrentView('sector');
            setNavigationTarget(null);
            setSelectedTargetId(null);
            setIsDocked(false);

            setGameState(prev => {
                const next = JSON.parse(JSON.stringify(prev));
                next.player.ship.dilithium.current--;

                const newMap = next.quadrantMap;
                let sectorToWarpTo = newMap[pos.qy][pos.qx];
                
                if (!sectorToWarpTo.visited) {
                    sectorToWarpTo.visited = true;
                    next.logs.unshift(`Entering unexplored sector. Long-range scans show ${sectorToWarpTo.entities.length} entities.`);

                    // Pirate Ambush Chance
                    const isAmbush = Math.random() < 0.15;
                    if (isAmbush && !sectorToWarpTo.entities.some((e: Entity) => e.type === 'starbase')) {
                        next.logs.unshift("RED ALERT: It's an ambush! Pirate vessels are decloaking!");
                        const ambushCount = Math.floor(Math.random() * 2) + 1; // 1-2 pirates
                        for (let i = 0; i < ambushCount; i++) {
                            sectorToWarpTo.entities.push({
                                id: uniqueId(), name: 'Pirate Raider', type: 'ship', faction: 'Pirate',
                                position: { x: Math.floor(Math.random() * SECTOR_WIDTH), y: Math.floor(Math.random() * 3) }, // Appear at top
                                hull: 40, maxHull: 40, shields: 10, maxShields: 10,
                                energy: { current: 30, max: 30 }, energyAllocation: { weapons: 60, shields: 40, engines: 0 },
                                torpedoes: { current: 2, max: 2 }, dilithium: { current: 0, max: 0 }, scanned: true, evasive: false, retreatingTurn: null,
                                subsystems: { weapons: { health: 80, maxHealth: 80 }, engines: { health: 100, maxHealth: 100 }, shields: { health: 70, maxHealth: 70 }, transporter: { health: 0, maxHealth: 0 } },
                                crewMorale: { current: 100, max: 100 },
                                securityTeams: { current: 3, max: 3 }, repairTarget: null,
                            });
                        }
                        next.redAlert = true;
                    }

                } else {
                    next.logs.unshift(`Entering previously explored sector.`);
                }
                
                next.logs.unshift(`Arrived at quadrant ${pos.qx}, ${pos.qy}. Consumed 1 Dilithium.`);

                next.player.position = pos;
                next.currentSector = sectorToWarpTo;
                next.quadrantMap = newMap;
                return next;
            });
            setIsWarping(false);
         }, 2500); // Duration of the warp animation
    }, [addLog, gameState.player.ship.dilithium.current]);

    const onFirePhasers = useCallback((targetId: string) => {
        addLog(`Phasers targeted at ${gameState.currentSector.entities.find(e=>e.id === targetId)?.name}. Awaiting turn end.`);
        setPlayerTurnActions(prev => ({ ...prev, combat: { type: 'phasers', targetId, subsystem: selectedSubsystem || undefined } }));
        setSelectedSubsystem(null);
    }, [addLog, gameState.currentSector.entities, selectedSubsystem]);
    
    const onLaunchTorpedo = useCallback((targetId: string) => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const { player, currentSector } = next;
            const playerShip = player.ship;
            const target = currentSector.entities.find((e: Entity) => e.id === targetId);

            if (!target) {
                addLog("Cannot launch torpedo: Invalid target.");
                return prev;
            }
            if (playerShip.torpedoes.current <= 0) {
                addLog("Launch failed: No torpedoes remaining.");
                return prev;
            }
            if (playerShip.subsystems.weapons.health <= 0) {
                addLog("Launch failed: Weapon systems are offline.");
                return prev;
            }

            playerShip.torpedoes.current--;

            const torpedo: TorpedoProjectile = {
                id: uniqueId(),
                name: 'Photon Torpedo',
                type: 'torpedo_projectile',
                faction: 'Federation',
                position: { ...playerShip.position },
                targetId: targetId,
                sourceId: playerShip.id,
                stepsTraveled: 0,
                speed: 2,
                path: [{ ...playerShip.position }],
                scanned: true,
                turnLaunched: next.turn,
            };

            currentSector.entities.push(torpedo);
            addLog(`Photon torpedo launched at ${target.name}.`);
            
            return next;
        });
        setSelectedSubsystem(null);
    }, [addLog, setGameState]);
    
    const onEvasiveManeuvers = useCallback(() => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const isEvasive = !next.player.ship.evasive;
            next.player.ship.evasive = isEvasive;
            addLog(isEvasive ? 'Evasive maneuvers enabled.' : 'Evasive maneuvers disabled.');
            return next;
        });
    }, [addLog]);

    const onDockWithStarbase = useCallback(() => {
        setIsDocked(true);
        addLog('Docking successful. Welcome to Starbase.');
    }, [addLog]);
    const onRechargeDilithium = useCallback(() => {
        addLog('Dilithium crystals fully recharged.');
        setGameState(prev => ({ ...prev, player: { ...prev.player, ship: { ...prev.player.ship, dilithium: { ...prev.player.ship.dilithium, current: prev.player.ship.dilithium.max } } } }));
    }, [addLog]);
    const onResupplyTorpedoes = useCallback(() => {
        addLog('Torpedoes resupplied.');
         setGameState(prev => ({ ...prev, player: { ...prev.player, ship: { ...prev.player.ship, torpedoes: { ...prev.player.ship.torpedoes, current: prev.player.ship.torpedoes.max } } } }));
    }, [addLog]);

    const onStarbaseRepairs = useCallback(() => {
        if (!isDocked) return;
        addLog('Starbase service complete: Hull, energy, and all subsystems restored to maximum.');
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const ship = next.player.ship;
            ship.hull = ship.maxHull;
            ship.energy.current = ship.energy.max;
            ship.subsystems.weapons.health = ship.subsystems.weapons.maxHealth;
            ship.subsystems.engines.health = ship.subsystems.engines.maxHealth;
            ship.subsystems.shields.health = ship.subsystems.shields.maxHealth;
            ship.subsystems.transporter.health = ship.subsystems.transporter.maxHealth;
            // Also resupply security teams at starbase
            ship.securityTeams.current = ship.securityTeams.max;
            addLog('Security teams have been reinforced to full strength.');
            return next;
        });
    }, [addLog, isDocked]);
    
    const onSelectRepairTarget = useCallback((subsystem: 'weapons' | 'engines' | 'shields' | 'hull' | 'transporter') => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const currentTarget = next.player.ship.repairTarget;
            const newTarget = currentTarget === subsystem ? null : subsystem;
            next.player.ship.repairTarget = newTarget;

            if (newTarget) {
                addLog(`Engineering teams assigned to passively repair the ${newTarget}.`);
            } else {
                addLog(`Engineering teams are no longer assigned to repair the ${subsystem}.`);
            }
            return next;
        });
    }, [addLog]);

    const onScanTarget = useCallback(() => {
         if (!selectedTargetId) return;
         addLog('Scanning target...');
         setGameState(prev => {
            const newEntities = prev.currentSector.entities.map(e => {
                if (e.id === selectedTargetId) {
                    return { ...e, scanned: true };
                }
                return e;
            });
            return { ...prev, currentSector: { ...prev.currentSector, entities: newEntities } };
         });
    }, [addLog, selectedTargetId]);

    const onInitiateRetreat = useCallback(() => {
        addLog('Retreat initiated! Evasive maneuvers for 3 turns.');
        setGameState(prev => {
            const newShip = { ...prev.player.ship, retreatingTurn: prev.turn + 3 };
            return { ...prev, player: { ...prev.player, ship: newShip } };
        });
    }, [addLog]);

    const onStartAwayMission = useCallback((planetId: string) => {
        const mission = awayMissionTemplates[0]; // For demo, always use the first mission
        if (!mission) return;

        setActiveMissionPlanetId(planetId);

        const relevantOfficers = gameState.player.crew.filter(officer =>
            mission.options.some(option => option.role === officer.role)
        );

        const advice: OfficerAdvice[] = relevantOfficers.map(officer => {
            const adviceOptions = counselAdvice[officer.role]?.[officer.personality];
            const message = adviceOptions ? adviceOptions[Math.floor(Math.random() * adviceOptions.length)] : "I have no specific recommendation, Captain.";
            
            return {
                officerName: officer.name,
                role: officer.role,
                message: message,
            };
        });
        
        if (advice.length > 0) {
            setOfficerCounsel({ mission, advice });
            addLog("The bridge crew offers their counsel on the upcoming away mission.");
        } else {
            setActiveAwayMission(mission);
            addLog('Away team beamed down.');
        }
    }, [addLog, gameState.player.crew]);

    const onSendAwayTeam = useCallback((targetId: string, type: 'boarding' | 'strike') => {
        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const playerShip = next.player.ship;
            const target = next.currentSector.entities.find((e: Entity) => e.id === targetId) as Ship;

            if (!target) { addLog("Away team action failed: Invalid target."); return prev; }
            if (playerShip.securityTeams.current <= 0) { addLog("Away team action failed: No security teams available."); return prev; }
            if ((target.shields / target.maxShields) > 0.2) { addLog(`Away team action failed: ${target.name}'s shields are too strong.`); return prev; }
            if (playerShip.subsystems.transporter.health <= 0) { addLog("Away team action failed: Transporter is offline."); return prev; }

            if (type === 'boarding') {
                addLog(`Attempting to board the ${target.name}...`);
                playerShip.securityTeams.current--;
                // Success chance based on morale vs enemy hull integrity
                const successChance = Math.max(0.1, (playerShip.crewMorale.current / 100) - (target.hull / target.maxHull) + 0.3);
                if (Math.random() < successChance) {
                    target.faction = 'Federation';
                    addLog(`Success! The ${target.name} has been captured and is now under Federation control.`);
                } else {
                    addLog(`The boarding attempt failed! We lost the team in the assault.`);
                    playerShip.crewMorale.current = Math.max(0, playerShip.crewMorale.current - 10);
                }
            } else if (type === 'strike') {
                addLog(`Sending a strike team to the ${target.name}!`);
                const damage = 35 + Math.floor(Math.random() * 10);
                target.hull = Math.max(0, target.hull - damage);
                addLog(`The strike team dealt ${damage} hull damage.`);

                if (Math.random() < 0.25) { // 25% chance of losing the team
                    playerShip.securityTeams.current--;
                    addLog(`We lost the strike team during the action!`);
                    playerShip.crewMorale.current = Math.max(0, playerShip.crewMorale.current - 5);
                } else {
                    addLog(`The strike team has returned safely.`);
                }
            }
            return next;
        });
    }, [addLog]);

    const onChooseAwayMissionOption = useCallback((option: AwayMissionOption) => {
        const success = Math.random() < option.successChance;
        const resultMessage = success ? option.outcomes.success : option.outcomes.failure;
        
        setAwayMissionResult(resultMessage);
        addLog(`Away Mission Debrief: ${resultMessage}`);

        if (activeMissionPlanetId) {
            setGameState(prev => {
                const next = JSON.parse(JSON.stringify(prev));
                const planet = next.currentSector.entities.find((e: Entity) => e.id === activeMissionPlanetId) as Planet | undefined;
                if (planet) {
                    planet.awayMissionCompleted = true;
                }
                return next;
            });
        }
        
        setActiveAwayMission(null);
        setActiveMissionPlanetId(null);
    }, [addLog, activeMissionPlanetId]);

    const onProceedFromCounsel = useCallback(() => {
        if (officerCounsel) {
            setActiveAwayMission(officerCounsel.mission);
            addLog('Away team beamed down.');
            setOfficerCounsel(null);
        }
    }, [addLog, officerCounsel]);

    const onCloseOfficerCounsel = useCallback(() => {
        setOfficerCounsel(null);
        setActiveMissionPlanetId(null); // Clear planet target if mission is aborted
        addLog("Away mission aborted based on counsel.");
    }, [addLog]);

    const onHailTarget = useCallback(async () => {
         if (!selectedTargetId || !ai) return;
         const target = gameState.currentSector.entities.find(e => e.id === selectedTargetId);
         if (!target) return;
         
         setActiveHail({ targetId: selectedTargetId, loading: true, message: '' });
         addLog(`Hailing ${target.name}...`);
         
         try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `You are the captain of a ${target.faction} ship called '${target.name}'. I am hailing you from the Federation starship U.S.S. Endeavour. What is your response? Be brief and in character.`,
                config: {
                  systemInstruction: "You are a spaceship captain in a sci-fi universe. Respond concisely.",
                },
              });
            setActiveHail({ targetId: selectedTargetId, loading: false, message: response.text });
         } catch (error) {
            console.error("Hail AI error:", error);
            addLog(`Hailing failed: Could not establish a stable connection.`);
            const defaultResponse = hailResponses[target.faction as keyof typeof hailResponses]?.greeting || "No response received.";
            setActiveHail({ targetId: selectedTargetId, loading: false, message: defaultResponse });
         }
    }, [addLog, gameState.currentSector.entities, selectedTargetId]);
    
    const onChooseEventOption = useCallback((option: EventTemplateOption) => {
        if (!activeEvent) return;

        addLog(option.outcome.log);

        setGameState(prev => {
            const next = JSON.parse(JSON.stringify(prev));
            const playerShip = next.player.ship;

            // Mark beacon as resolved
            const beacon = next.currentSector.entities.find((e: Entity) => e.id === activeEvent.beaconId);
            if (beacon && beacon.type === 'event_beacon') {
                beacon.isResolved = true;
                beacon.name = 'Resolved Signal';
            }

            // Apply outcome effect
            const outcome = option.outcome;
            const amount = outcome.amount || 0;

            switch (outcome.type) {
                case 'reward':
                    if (outcome.resource) {
                        switch(outcome.resource) {
                            case 'dilithium': playerShip.dilithium.current = Math.min(playerShip.dilithium.max, playerShip.dilithium.current + amount); break;
                            case 'torpedoes': playerShip.torpedoes.current = Math.min(playerShip.torpedoes.max, playerShip.torpedoes.current + amount); break;
                            case 'energy': playerShip.energy.current = Math.min(playerShip.energy.max, playerShip.energy.current + amount); break;
                            case 'hull': playerShip.hull = Math.min(playerShip.maxHull, playerShip.hull + amount); break;
                            case 'shields': playerShip.shields = Math.min(playerShip.maxShields, playerShip.shields + amount); break;
                            case 'morale': playerShip.crewMorale.current = Math.min(playerShip.crewMorale.max, playerShip.crewMorale.current + amount); break;
                        }
                    }
                    break;
                case 'damage':
                     if (outcome.resource) {
                        switch(outcome.resource) {
                            case 'hull': playerShip.hull = Math.max(0, playerShip.hull - amount); break;
                            case 'shields': playerShip.shields = Math.max(0, playerShip.shields - amount); break;
                            case 'morale': playerShip.crewMorale.current = Math.max(0, playerShip.crewMorale.current - amount); break;
                        }
                    }
                    break;
                case 'combat':
                    if (outcome.spawn && beacon) {
                        const count = outcome.spawnCount || 1;
                        for (let i = 0; i < count; i++) {
                             next.currentSector.entities.push({
                                id: uniqueId(), name: 'Pirate Raider', type: 'ship', faction: 'Pirate',
                                position: { x: beacon.position.x + i + 1, y: beacon.position.y },
                                hull: 40, maxHull: 40, shields: 10, maxShields: 10,
                                energy: { current: 30, max: 30 }, energyAllocation: { weapons: 60, shields: 40, engines: 0 },
                                torpedoes: { current: 2, max: 2 }, dilithium: { current: 0, max: 0 }, scanned: false, evasive: false, retreatingTurn: null,
                                subsystems: { weapons: { health: 80, maxHealth: 80 }, engines: { health: 100, maxHealth: 100 }, shields: { health: 70, maxHealth: 70 }, transporter: {health: 0, maxHealth: 0} },
                                crewMorale: { current: 100, max: 100 },
                                securityTeams: { current: 3, max: 3 }, repairTarget: null,
                            });
                        }
                        next.redAlert = true;
                    }
                    break;
            }

            return next;
        });

        setActiveEvent(null);
    }, [activeEvent, addLog]);

    const onToggleRedAlert = useCallback(() => {
        setGameState(prev => {
            if (prev.gameOver) return prev;
            const newRedAlertState = !prev.redAlert;
            addLog(newRedAlertState ? "Red Alert! All hands to battle stations." : "Standing down from Red Alert.");
            return { ...prev, redAlert: newRedAlertState };
        });
    }, [addLog]);

    const targetEntity = gameState.currentSector.entities.find(e => e.id === selectedTargetId);
    
    // Clear navigation target when view changes
    useEffect(() => {
        setNavigationTarget(null);
    }, [currentView])

    return {
        gameState,
        selectedTargetId,
        navigationTarget,
        currentView,
        isDocked,
        activeAwayMission,
        activeHail,
        officerCounsel,
        targetEntity,
        selectedSubsystem,
        playerTurnActions,
        activeEvent,
        isWarping,
        isTurnResolving,
        awayMissionResult,
        onEnergyChange,
        onEndTurn,
        onFirePhasers,
        onLaunchTorpedo,
        onEvasiveManeuvers,
        onSelectTarget,
        onSetNavigationTarget,
        onSetView: setCurrentView,
        onWarp,
        onDockWithStarbase,
        onRechargeDilithium,
        onResupplyTorpedoes,
        onStarbaseRepairs,
        onSelectRepairTarget,
        onScanTarget,
        onInitiateRetreat,
        onStartAwayMission,
        onChooseAwayMissionOption,
        onHailTarget,
        onCloseHail: () => setActiveHail(null),
        onCloseOfficerCounsel,
        onProceedFromCounsel,
        onSelectSubsystem: setSelectedSubsystem,
        onChooseEventOption,
        saveGame,
        loadGame,
        exportSave,
        importSave,
        onDistributeEvenly,
        onSendAwayTeam,
        onToggleRedAlert,
        onCloseAwayMissionResult: () => setAwayMissionResult(null),
    };
};