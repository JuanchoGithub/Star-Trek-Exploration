import { useState, useCallback, useEffect } from 'react';
// FIX: Import QuadrantPosition type.
import type { GameState, Ship, SectorState, Position, Entity, Starbase, Faction, QuadrantPosition, Planet } from '../types';

const SECTOR_WIDTH = 12;
const SECTOR_HEIGHT = 10;
const PLAYER_PHASER_DAMAGE = 10;
const PLAYER_TORPEDO_DAMAGE = 30;
const ENEMY_PHASER_DAMAGE = 5;
const SHIELD_BLEED_THROUGH = 0.2;
const WEAPON_RANGE = 5;

const distance = (a: Position, b: Position) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

const createPlayerShip = (): Ship => ({
    id: 'player-ship',
    name: 'U.S.S. Endeavour',
    type: 'ship',
    position: { x: 5, y: 5 },
    faction: 'Federation',
    hull: 100, maxHull: 100,
    shields: 50, maxShields: 50,
    energy: { current: 100, max: 100 },
    energyAllocation: { weapons: 34, shields: 33, engines: 33 },
    subsystems: {
        weapons: { health: 100, maxHealth: 100 },
        engines: { health: 100, maxHealth: 100 },
        shields: { health: 100, maxHealth: 100 },
    },
    torpedoes: { current: 10, max: 10 },
    dilithium: { current: 10, max: 10 },
    scanned: true,
    evasive: false,
    retreatingTurn: null,
    repairTarget: null,
});

const createEnemyShip = (id: string, name: string, position: Position, faction: Faction = 'Klingon'): Ship => ({
    id, name, position,
    type: 'ship',
    faction,
    hull: 50, maxHull: 50,
    shields: 20, maxShields: 20,
    energy: { current: 50, max: 50 },
    energyAllocation: { weapons: 50, shields: 50, engines: 0 },
    subsystems: {
        weapons: { health: 50, maxHealth: 50 },
        engines: { health: 50, maxHealth: 50 },
        shields: { health: 50, maxHealth: 50 },
    },
    torpedoes: { current: 5, max: 5 },
    // FIX: Add missing 'dilithium' property to conform to the 'Ship' type.
    dilithium: { current: 0, max: 0 },
    scanned: false,
    evasive: false,
    retreatingTurn: null,
    repairTarget: null,
});

const createStarbase = (id: string, position: Position): Starbase => ({
    id,
    name: 'Starbase 34',
    type: 'starbase',
    position,
    faction: 'Federation',
});

const createPlanet = (id: string, position: Position): Planet => ({
    id,
    name: `Planet ${id.slice(-4)}`,
    type: 'planet',
    position,
});

const generateSector = (sectorState: SectorState) => {
    const entities: Entity[] = [];
    if (sectorState.hasEnemies) {
        const numEnemies = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numEnemies; i++) {
            entities.push(createEnemyShip(`enemy-${Date.now()}-${i}`, 'Klingon Bird-of-Prey', { x: Math.floor(Math.random() * SECTOR_WIDTH), y: Math.floor(Math.random() * SECTOR_HEIGHT) }));
        }
    }
    if (sectorState.hasStarbase) {
        entities.push(createStarbase('starbase-1', { x: Math.floor(Math.random() * SECTOR_WIDTH), y: Math.floor(Math.random() * SECTOR_HEIGHT) }));
    }
    if (sectorState.hasPlanet) {
        entities.push(createPlanet(`planet-${Date.now()}`, { x: Math.floor(Math.random() * SECTOR_WIDTH), y: Math.floor(Math.random() * SECTOR_HEIGHT) }));
    }
    if (sectorState.hasNeutral) {
        entities.push(createEnemyShip(`neutral-${Date.now()}`, 'Independent Trader', { x: Math.floor(Math.random() * SECTOR_WIDTH), y: Math.floor(Math.random() * SECTOR_HEIGHT) }, 'Independent'));
    }
    return { entities };
}

const createInitialGameState = (): GameState => {
    const quadrantMap: SectorState[][] = Array(8).fill(null).map(() => Array(8).fill(null).map(() => {
        const hasStarbase = Math.random() > 0.85;
        // Starbase sectors are safe
        const hasEnemies = !hasStarbase && Math.random() > 0.6;
        const hasNeutral = !hasStarbase && Math.random() > 0.8;
        return {
            visited: false,
            hasEnemies,
            hasStarbase,
            hasPlanet: Math.random() > 0.7,
            hasNeutral,
        };
    }));
    
    const playerQuadrantPos = { qx: 4, qy: 4 };
    quadrantMap[playerQuadrantPos.qy][playerQuadrantPos.qx] = { visited: true, hasEnemies: true, hasStarbase: false, hasPlanet: false, hasNeutral: false };

    return {
        player: {
            ship: createPlayerShip(),
            quadrantPosition: playerQuadrantPos,
        },
        currentSector: generateSector(quadrantMap[playerQuadrantPos.qy][playerQuadrantPos.qx]),
        quadrantMap,
        turn: 1,
        navigationTarget: null,
    };
};

export const useGameLogic = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [gameLog, setGameLog] = useState<string[]>(['Welcome to the U.S.S. Endeavour.']);
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
    const [selectedSubsystem, setSelectedSubsystem] = useState<'weapons' | 'engines' | 'shields' | null>(null);
    const [currentView, setCurrentView] = useState<'sector' | 'quadrant'>('sector');
    const [isRepairMode, setIsRepairMode] = useState(false);

    useEffect(() => {
        setGameState(createInitialGameState());
    }, []);

    const addLog = useCallback((message: string) => {
        setGameLog(prev => [`Turn ${gameState?.turn || 1}: ${message}`, ...prev.slice(0, 99)]);
    }, [gameState?.turn]);

    const runAITurn = useCallback((gs: GameState): GameState => {
        let newGameState = { ...gs };
        const playerShip = newGameState.player.ship;

        // --- Player Ship Updates ---
        // Shield regeneration
        const shieldRecharge = playerShip.energyAllocation.shields / 10;
        playerShip.shields = Math.min(playerShip.maxShields, playerShip.shields + shieldRecharge);
        playerShip.energy.current = Math.max(0, playerShip.energy.current - shieldRecharge);
        if (shieldRecharge > 0) addLog(`Shields recharged by ${shieldRecharge.toFixed(1)}.`);

        // Repairs
        if (playerShip.repairTarget) {
            const repairAmount = 5 + Math.floor(playerShip.energyAllocation.engines / 10);
            if (playerShip.repairTarget === 'hull') {
                playerShip.hull = Math.min(playerShip.maxHull, playerShip.hull + repairAmount);
            } else {
                const subsystem = playerShip.subsystems[playerShip.repairTarget];
                subsystem.health = Math.min(subsystem.maxHealth, subsystem.health + repairAmount);
            }
            addLog(`Repair teams restored ${repairAmount.toFixed(1)} points to ${playerShip.repairTarget}.`);
        }
        
        // --- Enemy AI ---
        newGameState.currentSector.entities.forEach(entity => {
            // Hostile ships (Klingon, Romulan etc.) will attack
            if (entity.type === 'ship' && entity.faction !== 'Federation' && entity.faction !== 'Independent') {
                const enemyShip = entity as Ship;
                const dist = distance(enemyShip.position, playerShip.position);

                if (dist <= WEAPON_RANGE) {
                    addLog(`${enemyShip.name} is firing!`);
                    let damage = ENEMY_PHASER_DAMAGE * (enemyShip.subsystems.weapons.health / enemyShip.subsystems.weapons.maxHealth);
                    if (playerShip.evasive) damage *= 0.5;

                    const shieldDamage = damage * (1 - SHIELD_BLEED_THROUGH);
                    const hullDamage = damage * SHIELD_BLEED_THROUGH;

                    if (playerShip.shields > 0) {
                        playerShip.shields = Math.max(0, playerShip.shields - shieldDamage);
                        addLog(`Shields absorbed ${shieldDamage.toFixed(1)} damage.`);
                    }
                    playerShip.hull = Math.max(0, playerShip.hull - hullDamage);
                    addLog(`Hull took ${hullDamage.toFixed(1)} critical damage!`);

                    if (playerShip.hull <= 0) {
                        addLog('CRITICAL: Hull breach! The Endeavour has been destroyed!');
                    }

                } else if (enemyShip.subsystems.engines.health > 0) {
                    const dx = playerShip.position.x - enemyShip.position.x;
                    const dy = playerShip.position.y - enemyShip.position.y;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        enemyShip.position.x += Math.sign(dx);
                    } else {
                        enemyShip.position.y += Math.sign(dy);
                    }
                    addLog(`${enemyShip.name} is moving to intercept.`);
                }
            }
        });

        // --- Post-turn Cleanup ---
        playerShip.evasive = false;
        playerShip.repairTarget = null;
        newGameState.turn++;
        
        return newGameState;
    }, [addLog]);

    const endTurn = useCallback((action?: (gs: GameState) => GameState) => {
        setGameState(gs => {
            if (!gs) return null;
            let newState = { ...gs };
            if(action) {
                newState = action(newState);
            }

            // Player movement
            if (newState.navigationTarget && newState.player.ship.subsystems.engines.health > 0) {
                const start = newState.player.ship.position;
                const end = newState.navigationTarget;
                if (start.x !== end.x || start.y !== end.y) {
                    const dx = end.x - start.x;
                    const dy = end.y - start.y;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        start.x += Math.sign(dx);
                    } else {
                        start.y += Math.sign(dy);
                    }
                } else {
                    newState.navigationTarget = null;
                }
            }
            
            // Check for retreat
            if (newState.player.ship.retreatingTurn !== null) {
                if (newState.turn >= newState.player.ship.retreatingTurn) {
                    addLog("Emergency warp successful!");
                    newState.player.ship.retreatingTurn = null;
                    const {qx, qy} = newState.player.quadrantPosition;
                    // Simple escape to a random adjacent sector
                    const newPos = (Math.random() > 0.5) ? {qx: qx + (Math.random() > 0.5 ? 1 : -1), qy} : {qx, qy: qy + (Math.random() > 0.5 ? 1 : -1)}
                    newPos.qx = Math.max(0, Math.min(7, newPos.qx));
                    newPos.qy = Math.max(0, Math.min(7, newPos.qy));

                    newState.player.quadrantPosition = newPos;
                    newState.quadrantMap[newPos.qy][newPos.qx].visited = true;
                    newState.currentSector = generateSector(newState.quadrantMap[newPos.qy][newPos.qx]);
                    newState.player.ship.position = { x: 5, y: 5 };
                    newState.navigationTarget = null;
                    setSelectedTargetId(null);
                    newState.turn++;
                    setCurrentView('sector');
                    return newState;
                } else {
                     addLog(`Charging warp drive... ${newState.player.ship.retreatingTurn - newState.turn} turns remaining.`);
                }
            }
            
            return runAITurn(newState);
        });
    }, [addLog, runAITurn]);
    
    const handleSelectTarget = useCallback((id: string | null) => {
        setSelectedTargetId(id);
        setSelectedSubsystem(null);
        if (id) {
            const target = gameState?.currentSector.entities.find(e => e.id === id);
            addLog(`Targeting system locked on ${target?.name || 'unknown entity'}.`);
        }
    }, [addLog, gameState]);
    
    const handleSelectSubsystem = useCallback((subsystem: 'weapons' | 'engines' | 'shields') => {
        setSelectedSubsystem(subsystem);
        addLog(`Targeting ${subsystem} subsystem.`);
    }, [addLog]);

    const handleEnergyChange = useCallback((type: 'weapons' | 'shields' | 'engines', value: number) => {
        setGameState(gs => {
            if (!gs) return null;
            const newAllocation = { ...gs.player.ship.energyAllocation, [type]: value };
            const total = Object.values(newAllocation).reduce((sum, val) => sum + val, 0);
            if (total > 101) {
                return gs;
            }
            return { ...gs, player: { ...gs.player, ship: { ...gs.player.ship, energyAllocation: newAllocation }}};
        });
    }, []);

    const handleFirePhasers = useCallback(() => {
        endTurn(gs => {
            const target = gs.currentSector.entities.find(e => e.id === selectedTargetId) as Ship;
            if (!target) return gs;

            const weaponPower = gs.player.ship.energyAllocation.weapons;
            let damage = PLAYER_PHASER_DAMAGE * (weaponPower / 50) * (gs.player.ship.subsystems.weapons.health / gs.player.ship.subsystems.weapons.maxHealth);
            
            addLog(`Firing phasers for ${damage.toFixed(1)} damage!`);
            
            target.shields -= damage;
            if (target.shields < 0) {
                target.hull += target.shields;
                target.shields = 0;
            }

            if(target.hull <= 0) {
                addLog(`${target.name} destroyed!`);
                gs.currentSector.entities = gs.currentSector.entities.filter(e => e.id !== selectedTargetId);
                setSelectedTargetId(null);
            }
            return gs;
        });
    }, [selectedTargetId, endTurn, addLog]);

    const handleLaunchTorpedo = useCallback(() => {
        endTurn(gs => {
            if (gs.player.ship.torpedoes.current <= 0) return gs;
            gs.player.ship.torpedoes.current--;
            const target = gs.currentSector.entities.find(e => e.id === selectedTargetId) as Ship;
            if (!target) return gs;
            
            addLog(`Photon torpedo away!`);
            target.hull -= PLAYER_TORPEDO_DAMAGE; // Torpedoes largely ignore shields
            target.shields -= PLAYER_TORPEDO_DAMAGE * 0.25;

            if(target.hull <= 0) {
                addLog(`${target.name} destroyed!`);
                gs.currentSector.entities = gs.currentSector.entities.filter(e => e.id !== selectedTargetId);
                setSelectedTargetId(null);
            }
            return gs;
        });
    }, [selectedTargetId, endTurn, addLog]);

    const handleRestart = useCallback(() => { 
        setGameState(createInitialGameState());
        setGameLog(['Welcome to the U.S.S. Endeavour.']);
        setCurrentView('sector');
        setSelectedTargetId(null);
        setIsRepairMode(false);
    }, []);
    
    const handleCycleTargets = useCallback(() => {
        if (!gameState) return;
        const enemyShips = gameState.currentSector.entities.filter(e => e.type === 'ship' && e.faction !== 'Federation');
        if (enemyShips.length === 0) return;
        const currentIndex = enemyShips.findIndex(e => e.id === selectedTargetId);
        const nextIndex = (currentIndex + 1) % enemyShips.length;
        handleSelectTarget(enemyShips[nextIndex].id);
    }, [gameState, selectedTargetId, handleSelectTarget]);

    const handleEvasiveManeuvers = useCallback(() => {
        endTurn(gs => {
            gs.player.ship.evasive = true;
            addLog('Evasive maneuvers! Hard to port!');
            return gs;
        });
    }, [endTurn, addLog]);

    const handleSetNavigationTarget = useCallback((pos: Position | null) => {
        setGameState(gs => gs ? { ...gs, navigationTarget: pos } : null);
        if (pos) addLog(`Navigation target set to ${pos.x},${pos.y}.`); else addLog('Navigation target cleared.');
    }, [addLog]);

    const handleSetView = useCallback((view: 'sector' | 'quadrant') => { setCurrentView(view); }, []);

    const handleWarpToSector = useCallback((pos: QuadrantPosition) => {
        endTurn(gs => {
            if(gs.player.ship.dilithium.current <= 0) {
                addLog("Cannot warp, dilithium crystals depleted!");
                return gs;
            }
            gs.player.ship.dilithium.current--;
            gs.player.quadrantPosition = pos;
            gs.quadrantMap[pos.qy][pos.qx].visited = true;
            gs.currentSector = generateSector(gs.quadrantMap[pos.qy][pos.qx]);
            gs.player.ship.position = { x: 5, y: 5 };
            gs.navigationTarget = null;
            setSelectedTargetId(null);
            setCurrentView('sector');
            addLog(`Warping to quadrant ${pos.qx},${pos.qy}.`);
            return gs;
        });
    }, [endTurn, addLog]);

    const handleRechargeDilithium = useCallback(() => {
        endTurn(gs => {
            gs.player.ship.dilithium.current = gs.player.ship.dilithium.max;
            addLog("Dilithium crystals fully recharged.");
            return gs;
        })
    }, [endTurn, addLog]);

    const handleDockWithStarbase = useCallback(() => {
        if (!gameState || !selectedTargetId) return;
        const target = gameState.currentSector.entities.find(e => e.id === selectedTargetId);
        if (target && target.type === 'starbase') {
            handleSetNavigationTarget(target.position);
            addLog("Setting course to dock with starbase.");
        }
    }, [gameState, selectedTargetId, handleSetNavigationTarget, addLog]);

    const handleInitiateDamageControl = useCallback(() => { setIsRepairMode(prev => !prev); }, []);

    const handleSelectRepairTarget = useCallback((target: 'weapons' | 'engines' | 'shields' | 'hull') => {
        setIsRepairMode(false);
        endTurn(gs => {
            gs.player.ship.repairTarget = target;
            addLog(`Damage control teams dispatched to ${target}.`);
            return gs;
        });
    }, [endTurn, addLog]);

    const handleResupplyTorpedoes = useCallback(() => {
        endTurn(gs => {
            gs.player.ship.torpedoes.current = gs.player.ship.torpedoes.max;
            addLog("Photon torpedoes resupplied.");
            return gs;
        });
    }, [endTurn, addLog]);

    const handleScanTarget = useCallback(() => {
        endTurn(gs => {
            const target = gs.currentSector.entities.find(e => e.id === selectedTargetId);
            if(target) {
                target.scanned = true;
                addLog(`Scan complete. Revealing details for ${target.name}.`);
            }
            return gs;
        });
    }, [selectedTargetId, endTurn, addLog]);

    const handleInitiateRetreat = useCallback(() => {
        endTurn(gs => {
            if(gs.player.ship.subsystems.engines.health <= 0) {
                addLog("Cannot retreat, engines are offline!");
                return gs;
            }
            gs.player.ship.retreatingTurn = gs.turn + 3;
            addLog(`Retreat initiated! Emergency warp in 3 turns.`);
            return gs;
        });
    }, [endTurn, addLog]);
    
    const isDockedWith = gameState?.currentSector.entities.find(e => e.type === 'starbase' && distance(e.position, gameState.player.ship.position) <= 1);

    return {
        gameState,
        gameLog,
        selectedTargetId,
        selectedSubsystem,
        currentView,
        isDockedWith,
        isRepairMode,
        handleEndTurn: () => endTurn(),
        handleSelectTarget,
        handleSelectSubsystem,
        handleEnergyChange,
        handleFirePhasers,
        handleLaunchTorpedo,
        handleRestart,
        handleCycleTargets,
        handleEvasiveManeuvers,
        handleSetNavigationTarget,
        handleSetView,
        handleWarpToSector,
        handleRechargeDilithium,
        handleDockWithStarbase,
        handleInitiateDamageControl,
        handleSelectRepairTarget,
        handleResupplyTorpedoes,
        handleScanTarget,
        handleInitiateRetreat,
    };
};