import { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { GameState, QuadrantPosition, Ship, SectorState, AwayMissionTemplate, AwayMissionOption, ActiveHail, ActiveCounselSession, BridgeOfficer, OfficerAdvice, Entity, Position, PlayerTurnActions } from '../types';
import { awayMissionTemplates, hailResponses, counselAdvice } from '../data/contentData';

const SECTOR_WIDTH = 12;
const SECTOR_HEIGHT = 10;
const QUADRANT_SIZE = 8;
const SAVE_GAME_KEY = 'star_trek_savegame';

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


const generateSectorContent = (sector: SectorState): SectorState => {
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

        if (entityTypeRoll < 0.4) { // 40% chance for a planet
            newEntities.push({
                id: uniqueId(),
                name: `Planet ${uniqueId().substring(3, 7)}`,
                type: 'planet',
                faction: 'None',
                position,
                scanned: false,
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
                subsystems: { weapons: { health: 100, maxHealth: 100 }, engines: { health: 100, maxHealth: 100 }, shields: { health: 100, maxHealth: 100 } },
                crewMorale: { current: 100, max: 100 },
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
                subsystems: { weapons: { health: 80, maxHealth: 80 }, engines: { health: 100, maxHealth: 100 }, shields: { health: 70, maxHealth: 70 } },
                crewMorale: { current: 100, max: 100 },
            });
        } else { // 15% chance for a Trader
            newEntities.push({
                id: uniqueId(),
                name: 'Independent Trader',
                type: 'ship',
                faction: 'Independent',
                position,
                hull: 30, maxHull: 30, shields: 0, maxShields: 0,
                energy: { current: 20, max: 20 }, energyAllocation: { weapons: 0, shields: 0, engines: 100 },
                torpedoes: { current: 0, max: 0 }, dilithium: { current: 0, max: 0 }, scanned: false, evasive: false, retreatingTurn: null,
                subsystems: { weapons: { health: 0, maxHealth: 0 }, engines: { health: 100, maxHealth: 100 }, shields: { health: 0, maxHealth: 0 } },
                crewMorale: { current: 100, max: 100 },
            });
        }
    }

    return {
        ...sector,
        entities: newEntities,
        hasNebula: Math.random() < 0.2, // 20% chance of a nebula
    };
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
    },
    energy: { current: 100, max: 100 },
    energyAllocation: { weapons: 34, shields: 33, engines: 33 },
    torpedoes: { current: 10, max: 10 },
    dilithium: { current: 20, max: 20 },
    scanned: true,
    evasive: false,
    retreatingTurn: null,
    crewMorale: { current: 100, max: 100 },
  };

  const playerCrew: BridgeOfficer[] = [
    { id: 'officer-1', name: "Cmdr. T'Vok", role: 'Science', personality: 'Logical' },
    { id: 'officer-2', name: 'Lt. Thorne', role: 'Security', personality: 'Aggressive' },
    { id: 'officer-3', name: 'Lt. Cmdr. Singh', role: 'Engineering', personality: 'Cautious' },
  ];

  // Create quadrant map
  const quadrantMap: SectorState[][] = Array.from({ length: QUADRANT_SIZE }, () =>
    Array.from({ length: QUADRANT_SIZE }, () => ({
      entities: [],
      visited: false,
      hasNebula: false,
    }))
  );

  const playerPosition = { qx: Math.floor(QUADRANT_SIZE / 2), qy: Math.floor(QUADRANT_SIZE / 2) };

  // Populate starting sector
  let startSector = quadrantMap[playerPosition.qy][playerPosition.qx];
  startSector = generateSectorContent(startSector);
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
    });
  }
  startSector.entities = startSector.entities.filter(e => e.faction !== 'Klingon' && e.faction !== 'Romulan' && e.faction !== 'Pirate');


  quadrantMap[playerPosition.qy][playerPosition.qx] = startSector;


  return {
    player: { ship: playerShip, position: playerPosition, crew: playerCrew },
    quadrantMap,
    currentSector: startSector,
    turn: 1,
    logs: ["Captain's Log, Stardate 47458.2. We have entered the Typhon Expanse."],
    gameOver: false,
    gameWon: false,
    redAlert: false,
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
    const [isRepairMode, setIsRepairMode] = useState(false);
    const [activeAwayMission, setActiveAwayMission] = useState<AwayMissionTemplate | null>(null);
    const [activeHail, setActiveHail] = useState<ActiveHail | null>(null);
    const [officerCounsel, setOfficerCounsel] = useState<ActiveCounselSession | null>(null);
    const [selectedSubsystem, setSelectedSubsystem] = useState<'weapons' | 'engines' | 'shields' | null>(null);
    const [playerTurnActions, setPlayerTurnActions] = useState<PlayerTurnActions>({});


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
    setGameState(prev => {
        if (prev.gameOver) return prev;

        const next = JSON.parse(JSON.stringify(prev)); // Deep copy to avoid mutation issues
        const logs: string[] = [];
        const { player, currentSector } = next;
        const playerShip = player.ship;
        const isRetreating = playerShip.retreatingTurn !== null;
        const pendingDamage: { targetId: string; damage: number; isTorpedo: boolean; subsystem?: 'weapons' | 'engines' | 'shields' }[] = [];
        let redAlertThisTurn = false;

        // --- Player Action Phase ---
        if (isRetreating) {
            logs.push("Attempting to retreat, cannot take other actions.");
        } else {
             // 1. Evasive Maneuvers
            if (playerTurnActions.evasive) {
                playerShip.evasive = true;
                playerShip.energy.current = Math.max(0, playerShip.energy.current - 15);
                logs.push("U.S.S. Endeavour is performing evasive maneuvers.");
            } else {
                playerShip.evasive = false;
            }

            // 2. Navigation
            if (navigationTarget) {
                const currentPos = playerShip.position;
                if (currentPos.x !== navigationTarget.x || currentPos.y !== navigationTarget.y) {
                    playerShip.position = moveOneStep(currentPos, navigationTarget);
                    logs.push(`Moving to ${playerShip.position.x}, ${playerShip.position.y}.`);
                }
                if (playerShip.position.x === navigationTarget.x && playerShip.position.y === navigationTarget.y) {
                    setNavigationTarget(null);
                     logs.push(`Arrived at navigation target.`);
                }
            }

            // 3. Combat
            if (playerTurnActions.combat) {
                const target = currentSector.entities.find(e => e.id === playerTurnActions.combat!.targetId) as Ship;
                if (target) {
                    if (playerTurnActions.combat.type === 'phasers') {
                        const baseDamage = 20 * (playerShip.energyAllocation.weapons / 100);
                        playerShip.energy.current -= 10;
                        pendingDamage.push({ targetId: target.id, damage: baseDamage, isTorpedo: false, subsystem: playerTurnActions.combat.subsystem });
                        logs.push(`Firing phasers at ${target.name}${playerTurnActions.combat.subsystem ? `'s ${playerTurnActions.combat.subsystem}`: ''}.`);
                    } else if (playerTurnActions.combat.type === 'torpedoes') {
                         if (playerShip.torpedoes.current > 0) {
                            playerShip.torpedoes.current--;
                            pendingDamage.push({ targetId: target.id, damage: 50, isTorpedo: true, subsystem: playerTurnActions.combat.subsystem });
                            logs.push(`Launching torpedo at ${target.name}${playerTurnActions.combat.subsystem ? `'s ${playerTurnActions.combat.subsystem}`: ''}.`);
                        }
                    }
                }
            }
        }
        
        // --- AI Phase ---
        currentSector.entities.forEach((entity: Entity) => {
            if (entity.type !== 'ship' || entity.id === playerShip.id) return;
            
            const aiShip = entity as Ship;
            const isHostile = ['Klingon', 'Romulan', 'Pirate'].includes(aiShip.faction);

            if (isHostile && aiShip.subsystems.weapons.health > 0) {
                const distance = calculateDistance(aiShip.position, playerShip.position);
                if (distance <= 5) { // Firing range
                    const aiDamage = 10 * (aiShip.energyAllocation.weapons / 100);
                    pendingDamage.push({ targetId: playerShip.id, damage: aiDamage, isTorpedo: false });
                    logs.push(`${aiShip.name} is firing at the U.S.S. Endeavour!`);
                    redAlertThisTurn = true;
                }
                if (distance > 2) { // Move closer
                    aiShip.position = moveOneStep(aiShip.position, playerShip.position);
                }
            }
        });

        // --- Resolution Phase ---
        // 1. Apply Damage
        const entityMap = new Map<string, Entity>([...currentSector.entities, playerShip].map(e => [e.id, e]));
        pendingDamage.forEach(({ targetId, damage, isTorpedo, subsystem }) => {
            const target = entityMap.get(targetId) as Ship;
            if (!target) return;

            let hitChance = target.evasive ? 0.6 : 0.9;
            if (isRetreating && target.id === playerShip.id) hitChance = 0.5; // Player is harder to hit when retreating
            if (Math.random() > hitChance) {
                logs.push(`${target.name} evaded an attack!`);
                return;
            }

            let remainingDamage = damage;
            const shieldDamage = isTorpedo ? remainingDamage * 0.25 : remainingDamage;
            const absorbedByShields = Math.min(target.shields, shieldDamage);
            target.shields -= absorbedByShields;
            remainingDamage -= absorbedByShields / (isTorpedo ? 0.25 : 1);
            
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
                    logs.push(`${target.name} takes ${Math.round(remainingDamage)} hull damage.`);
                }
            } else {
                 logs.push(`${target.name}'s shields absorbed the hit.`);
            }
        });

        // 2. Shield Regeneration
        [playerShip, ...currentSector.entities].forEach(e => {
            if (e.type === 'ship') {
                const ship = e as Ship;
                const regenAmount = (ship.energyAllocation.shields / 100) * (ship.maxShields * 0.1);
                ship.shields = Math.min(ship.maxShields, ship.shields + regenAmount);
            }
        });
        
        // 3. Retreat Check
        if (isRetreating && next.turn >= playerShip.retreatingTurn!) {
            playerShip.retreatingTurn = null;
            next.currentSector.entities = next.currentSector.entities.filter(e => e.faction !== 'Klingon' && e.faction !== 'Romulan' && e.faction !== 'Pirate');
            logs.push("Retreat successful! We've escaped to a safe distance.");
            setSelectedTargetId(null);
        }

        // 4. Remove destroyed ships & check for game over
        const destroyedIds = new Set<string>();
        currentSector.entities.forEach(e => {
            if (e.type === 'ship' && e.hull <= 0) {
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

        // --- Cleanup ---
        next.turn++;
        logs.unshift(`Turn ${next.turn} begins.`);
        next.logs = [...logs.reverse(), ...prev.logs];
        next.redAlert = redAlertThisTurn;
        setPlayerTurnActions({});

        return next;
    });
    }, [addLog, playerTurnActions, navigationTarget, selectedTargetId]);

    const onEnergyChange = useCallback((type: 'weapons' | 'shields' | 'engines', value: number) => {
        setGameState(prev => {
            const newAlloc = { ...prev.player.ship.energyAllocation, [type]: value };
            const total = newAlloc.weapons + newAlloc.shields + newAlloc.engines;
            if (total > 100) {
                const excess = total - 100;
                // A simple way to handle excess is to reduce the other sliders
                // This logic can be improved for better UX
                if (type !== 'weapons') newAlloc.weapons = Math.max(0, newAlloc.weapons - excess/2);
                if (type !== 'shields') newAlloc.shields = Math.max(0, newAlloc.shields - excess/2);
                if (type !== 'engines') newAlloc.engines = Math.max(0, newAlloc.engines - excess/2);

                const keys = ['weapons', 'shields', 'engines'] as const;
                let currentTotal = newAlloc.weapons + newAlloc.shields + newAlloc.engines;
                for (const key of keys) {
                    if (currentTotal > 100) {
                        const reduction = Math.min(newAlloc[key], currentTotal - 100);
                        newAlloc[key] -= reduction;
                        currentTotal -= reduction;
                    }
                }
            }
            return { ...prev, player: { ...prev.player, ship: { ...prev.player.ship, energyAllocation: newAlloc } } };
        });
    }, []);

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
         addLog(`Warping to quadrant ${pos.qx}, ${pos.qy}. Consumed 1 Dilithium.`);
         setCurrentView('sector');
         setNavigationTarget(null);
         setSelectedTargetId(null);
         setIsDocked(false);
         setGameState(prev => {
            const newPlayerShip = { ...prev.player.ship };
            newPlayerShip.dilithium.current--;

            const newMap = prev.quadrantMap.map(row => [...row]);
            let sectorToWarpTo = newMap[pos.qy][pos.qx];
            
            if (!sectorToWarpTo.visited) {
                sectorToWarpTo = generateSectorContent(sectorToWarpTo);
                sectorToWarpTo.visited = true;
                newMap[pos.qy][pos.qx] = sectorToWarpTo;
                 addLog(`Entering unexplored sector. Long-range scans show ${sectorToWarpTo.entities.length} entities.`);
            } else {
                 addLog(`Entering previously explored sector.`);
            }

            return {
                ...prev,
                player: { ...prev.player, ship: newPlayerShip, position: pos },
                currentSector: sectorToWarpTo,
                quadrantMap: newMap
            }
         })
    }, [addLog, gameState.player.ship.dilithium.current]);

    const onFirePhasers = useCallback((targetId: string) => {
        addLog(`Phasers targeted at ${gameState.currentSector.entities.find(e=>e.id === targetId)?.name}. Awaiting turn end.`);
        setPlayerTurnActions(prev => ({ ...prev, combat: { type: 'phasers', targetId, subsystem: selectedSubsystem || undefined } }));
        setSelectedSubsystem(null);
    }, [addLog, gameState.currentSector.entities, selectedSubsystem]);
    
    const onLaunchTorpedo = useCallback((targetId: string) => {
        addLog(`Torpedo targeted at ${gameState.currentSector.entities.find(e=>e.id === targetId)?.name}. Awaiting turn end.`);
        setPlayerTurnActions(prev => ({ ...prev, combat: { type: 'torpedoes', targetId, subsystem: selectedSubsystem || undefined } }));
        setSelectedSubsystem(null);
    }, [addLog, gameState.currentSector.entities, selectedSubsystem]);
    
    const onEvasiveManeuvers = useCallback(() => {
        setPlayerTurnActions(prev => {
            const isEvasive = !prev.evasive;
            addLog(isEvasive ? 'Evasive maneuvers enabled for next turn.' : 'Evasive maneuvers disabled.');
            return { ...prev, evasive: isEvasive };
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
    const onInitiateDamageControl = useCallback(() => setIsRepairMode(prev => !prev), []);
    const onSelectRepairTarget = useCallback((subsystem: 'weapons' | 'engines' | 'shields' | 'hull') => {
        addLog(`Repairing ${subsystem}...`);
        setIsRepairMode(false);
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
    const onStartAwayMission = useCallback(() => {
        const mission = awayMissionTemplates[0]; // For demo, always use the first mission
        if (!mission) return;

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
    const onChooseAwayMissionOption = useCallback((option: AwayMissionOption) => {
        const success = Math.random() < option.successChance;
        addLog(success ? option.outcomes.success : option.outcomes.failure);
        setActiveAwayMission(null);
    }, [addLog]);

    const onProceedFromCounsel = useCallback(() => {
        if (officerCounsel) {
            setActiveAwayMission(officerCounsel.mission);
            addLog('Away team beamed down.');
            setOfficerCounsel(null);
        }
    }, [addLog, officerCounsel]);

    const onCloseOfficerCounsel = useCallback(() => {
        setOfficerCounsel(null);
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
        isRepairMode,
        activeAwayMission,
        activeHail,
        officerCounsel,
        targetEntity,
        selectedSubsystem,
        playerTurnActions,
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
        onInitiateDamageControl,
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
        saveGame,
        loadGame,
        exportSave,
        importSave,
    };
};