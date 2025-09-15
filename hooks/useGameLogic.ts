import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Ship, Entity, SectorState } from '../types';

const SECTOR_SIZE = { width: 12, height: 10 };
const QUADRANT_SIZE = { width: 8, height: 8 };

const generateSectorEntities = (isExplored: boolean): Entity[] => {
    if (isExplored) return []; // Return to an empty sector
    
    const entities: Entity[] = [];
    const numPlanets = Math.floor(Math.random() * 3) + 1; // 1-3 planets
    
    for (let i = 0; i < numPlanets; i++) {
        entities.push({
            id: `planet-${Date.now()}-${i}`,
            type: 'planet',
            name: `Planet ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 100)}`,
            position: { 
                x: Math.floor(Math.random() * SECTOR_SIZE.width), 
                y: Math.floor(Math.random() * SECTOR_SIZE.height) 
            },
        });
    }

    if (Math.random() > 0.5) { // 50% chance of an enemy
        entities.push({
            id: 'klingon-bird-of-prey',
            type: 'ship',
            name: 'Klingon Bird-of-Prey',
            hull: 80,
            maxHull: 80,
            shields: { fore: 50, aft: 50 },
            maxShields: { fore: 50, aft: 50 },
            energy: 800,
            maxEnergy: 800,
            torpedoes: 5,
            dilithium: 10,
            maxDilithium: 50,
            position: { x: Math.floor(Math.random() * 6) + 6, y: Math.floor(Math.random() * SECTOR_SIZE.height) },
            powerAllocation: { weapons: 50, shields: 30, engines: 20 },
            faction: 'Klingon',
            isEvasive: false,
        });
    }

    return entities;
}

const createInitialGameState = (): GameState => {
  const initialQuadrantMap = Array.from({ length: QUADRANT_SIZE.height }, () =>
    Array.from({ length: QUADRANT_SIZE.width }, (): SectorState => ({
      visited: false,
      entities: [],
    }))
  );
  
  const startPos = { qx: 3, qy: 4 };
  initialQuadrantMap[startPos.qy][startPos.qx].visited = true;
  initialQuadrantMap[startPos.qy][startPos.qx].entities = generateSectorEntities(false);

  return {
    turn: 1,
    player: {
      rank: 'Commander',
      xp: 0,
      ship: {
        id: 'uss-endeavour',
        name: 'U.S.S. Endeavour',
        hull: 100,
        maxHull: 100,
        shields: { fore: 100, aft: 100 },
        maxShields: { fore: 100, aft: 100 },
        energy: 1000,
        maxEnergy: 1000,
        torpedoes: 10,
        dilithium: 20,
        maxDilithium: 50,
        position: { x: 2, y: 5 },
        powerAllocation: { weapons: 34, shields: 33, engines: 33 },
        faction: 'Federation',
        isEvasive: false,
      },
      quadrantPosition: startPos,
    },
    factions: {
      Federation: { reputation: 100 },
      Klingon: { reputation: -50 },
    },
    currentSector: {
      size: SECTOR_SIZE,
      entities: initialQuadrantMap[startPos.qy][startPos.qx].entities,
    },
    navigationTarget: null,
    quadrantMap: initialQuadrantMap,
  }
};

export const useGameLogic = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'sector' | 'quadrant'>('sector');

  const turnRef = useRef(1);
  useEffect(() => {
    if (gameState?.turn) {
      turnRef.current = gameState.turn;
    }
  }, [gameState?.turn]);

  useEffect(() => {
    const savedGame = localStorage.getItem('star_trek_savegame');
    if (savedGame) {
      try {
        setGameState(JSON.parse(savedGame));
      } catch (e) {
        console.error("Failed to parse saved game, starting new game.", e);
        setGameState(createInitialGameState());
      }
    } else {
      setGameState(createInitialGameState());
    }
  }, []);

  useEffect(() => {
    if (gameState) {
      localStorage.setItem('star_trek_savegame', JSON.stringify(gameState));
    }
  }, [gameState]);

  const addToLog = useCallback((message: string) => {
    setGameLog(prev => [`Turn ${turnRef.current}: ${message}`, ...prev].slice(0, 50));
  }, []);

  const handleSetView = useCallback((view: 'sector' | 'quadrant') => {
      setCurrentView(view);
  }, []);

  const handleWarpToSector = useCallback((pos: { qx: number; qy: number }) => {
    if (!gameState) return;

    const { qx, qy } = gameState.player.quadrantPosition;
    const isAdjacent = Math.abs(pos.qx - qx) + Math.abs(pos.qy - qy) === 1;

    if (!isAdjacent) {
        addToLog("Warp failed: Target sector is out of range.");
        return;
    }

    if (gameState.player.ship.dilithium <= 0) {
      addToLog("Warp failed: Insufficient Dilithium.");
      return;
    }

    addToLog(`Warp drive engaged! Traveling to sector (${pos.qx}, ${pos.qy}). 1 unit of Dilithium consumed.`);
    
    setGameState(prev => {
        if (!prev) return null;
        const newState = JSON.parse(JSON.stringify(prev)) as GameState;

        // Consume Dilithium
        newState.player.ship.dilithium -= 1;

        // Update old sector's entity state
        const oldPos = newState.player.quadrantPosition;
        newState.quadrantMap[oldPos.qy][oldPos.qx].entities = newState.currentSector.entities;
        
        // Move player
        newState.player.quadrantPosition = pos;
        newState.player.ship.position = { x: 2, y: 5 }; // Reset to entry point
        
        // Generate new sector if unvisited
        const targetSectorState = newState.quadrantMap[pos.qy][pos.qx];
        if (!targetSectorState.visited) {
            targetSectorState.visited = true;
            targetSectorState.entities = generateSectorEntities(false);
            addToLog("We are the first Federation ship to enter this sector.");
        } else {
            // Re-load entities if visited
             targetSectorState.entities = generateSectorEntities(true); // For now, make visited sectors empty
             addToLog("Entering previously charted space.");
        }
        
        newState.currentSector.entities = targetSectorState.entities;
        newState.navigationTarget = null;
        setSelectedTargetId(null);
        
        return newState;
    });

    handleEndTurn(true);
    setCurrentView('sector');
  }, [gameState, addToLog]);

  const handleSetNavigationTarget = useCallback((pos: { x: number; y: number } | null) => {
    setGameState(prev => {
        if (!prev) return null;
        const newState = JSON.parse(JSON.stringify(prev)) as GameState;
        if (pos && (pos.x === newState.player.ship.position.x && pos.y === newState.player.ship.position.y)) {
             newState.navigationTarget = null;
             addToLog("Navigation target cleared.");
        } else {
            newState.navigationTarget = pos;
            if(pos) addToLog(`New course set. Destination: (${pos.x}, ${pos.y}).`);
        }
        return newState;
    })
  }, [addToLog]);

  const handleEnergyChange = useCallback((type: 'weapons' | 'shields' | 'engines', value: number) => {
    setGameState(prev => {
      if (!prev) return null;
      const newState = JSON.parse(JSON.stringify(prev)) as GameState;
      const otherTwoTotal = 100 - value;
      let remaining = 100;
      
      newState.player.ship.powerAllocation[type] = value;
      remaining -= value;
      
      const otherKeys = (['weapons', 'shields', 'engines'] as const).filter(k => k !== type);
      
      let ratioShields = newState.player.ship.powerAllocation[otherKeys[0]];
      let ratioEngines = newState.player.ship.powerAllocation[otherKeys[1]];
      let totalRatio = ratioShields + ratioEngines;

      if(totalRatio === 0) {
        ratioShields = 50;
        ratioEngines = 50;
        totalRatio = 100;
      }
      
      newState.player.ship.powerAllocation[otherKeys[0]] = Math.round((ratioShields / totalRatio) * remaining);
      newState.player.ship.powerAllocation[otherKeys[1]] = Math.round((ratioEngines / totalRatio) * remaining);
      
      const currentTotal = Object.values(newState.player.ship.powerAllocation).reduce((a, b) => a + b, 0);
      if(currentTotal !== 100){
        const diff = 100 - currentTotal;
        newState.player.ship.powerAllocation[otherKeys[0]] += diff;
      }
      
      return newState;
    });
  }, []);

  const handleEndTurn = useCallback((actionTaken: boolean = false) => {
    setGameState(prev => {
      if (!prev) return null;

      const newState: GameState = JSON.parse(JSON.stringify(prev));
      const playerShip = newState.player.ship;

      // 1. Player Movement (only if an action wasn't taken)
      if (!actionTaken && newState.navigationTarget) {
        const target = newState.navigationTarget;
        const currentPos = playerShip.position;

        const enginePower = playerShip.powerAllocation.engines;
        const movesPerTurn = Math.floor(enginePower / 33);

        for (let i = 0; i < movesPerTurn; i++) {
            if (currentPos.x === target.x && currentPos.y === target.y) {
                break;
            }
            const dx = target.x - currentPos.x;
            const dy = target.y - currentPos.y;
            if (Math.abs(dx) > Math.abs(dy)) currentPos.x += Math.sign(dx);
            else if (dy !== 0) currentPos.y += Math.sign(dy);
            else if (dx !== 0) currentPos.x += Math.sign(dx);
        }
        addToLog(`Moving to new coordinates: (${currentPos.x}, ${currentPos.y}).`);
        
        if (currentPos.x === target.x && currentPos.y === target.y) {
            newState.navigationTarget = null;
            addToLog(`Navigation target reached.`);
        }
      }

      // 2. AI Actions
      newState.currentSector.entities.forEach(entity => {
        if (entity.type === 'ship' && entity.faction !== 'Federation' && entity.hull > 0) {
          const aiShip = entity as Ship;
          const distance = Math.abs(aiShip.position.x - playerShip.position.x) + Math.abs(aiShip.position.y - playerShip.position.y);
          const attackRange = 6;
          
          if(distance <= attackRange) {
            addToLog(`${aiShip.name} is firing at the Endeavour.`);
            if (playerShip.isEvasive && Math.random() < 0.5) {
                addToLog(`The attack from ${aiShip.name} missed due to our evasive maneuvers!`);
                return;
            }
            const baseDamage = 15;
            const damage = Math.round(baseDamage * (aiShip.powerAllocation.weapons / 100 + 0.5));
            let damageToHull = 0;
            if (playerShip.shields.fore > 0) {
              const shieldDamage = Math.min(playerShip.shields.fore, damage);
              playerShip.shields.fore -= shieldDamage;
              damageToHull = damage - shieldDamage;
              addToLog(`Our shields absorbed ${shieldDamage} damage. Shield strength at ${playerShip.shields.fore}.`);
            } else {
              damageToHull = damage;
            }

            if (damageToHull > 0) {
              playerShip.hull = Math.max(0, playerShip.hull - damageToHull);
              addToLog(`We took ${damageToHull} damage to hull. Hull integrity at ${playerShip.hull}%.`);
            }
            if (playerShip.hull <= 0) addToLog("CRITICAL: Hull breach! The Endeavour has been destroyed!");

          } else {
            const dx = playerShip.position.x - aiShip.position.x;
            const dy = playerShip.position.y - aiShip.position.y;
            if (Math.abs(dx) > Math.abs(dy)) aiShip.position.x += Math.sign(dx);
            else if (Math.abs(dy) > 0) aiShip.position.y += Math.sign(dy);
            addToLog(`${aiShip.name} moves to intercept course. New position: (${aiShip.position.x}, ${aiShip.position.y}).`);
          }
        }
      });

      // 3. Shield Regeneration
      newState.currentSector.entities.forEach(entity => {
        if (entity.type === 'ship') {
          const ship = entity as Ship;
          const regenAmount = Math.round(10 * (ship.powerAllocation.shields / 100));
          ship.shields.fore = Math.min(ship.maxShields.fore, ship.shields.fore + regenAmount);
          ship.shields.aft = Math.min(ship.maxShields.aft, ship.shields.aft + regenAmount);
        }
      });
      const playerRegen = Math.round(15 * (newState.player.ship.powerAllocation.shields / 100));
      playerShip.shields.fore = Math.min(playerShip.maxShields.fore, playerShip.shields.fore + playerRegen);
      playerShip.shields.aft = Math.min(playerShip.maxShields.aft, playerShip.shields.aft + playerRegen);
      if (playerRegen > 0) addToLog(`Shields regenerated by ${playerRegen} points.`);

      // 4. Increment Turn & Reset states
      newState.turn += 1;
      playerShip.isEvasive = false;
      newState.currentSector.entities.forEach(e => {
          if (e.type === 'ship') (e as Ship).isEvasive = false;
      });
      
      return newState;
    });
  }, [addToLog]);

  const handleFirePhasers = useCallback(() => {
    if (!gameState || !selectedTargetId || gameState.player.ship.isEvasive) return;

    const target = gameState.currentSector.entities.find(e => e.id === selectedTargetId);
    if (!target || target.type !== 'ship') {
      addToLog("Invalid target selected for phaser attack.");
      return;
    }
    
    const attacker = gameState.player.ship;
    const baseDamage = 20;
    const damage = Math.round(baseDamage * (attacker.powerAllocation.weapons / 100 + 0.5));
    
    addToLog(`Firing phasers at ${target.name}.`);
    
    const newTargetState = { ...target };
    let damageToHull = 0;

    if (newTargetState.shields.fore > 0) {
      const shieldDamage = Math.min(newTargetState.shields.fore, damage);
      newTargetState.shields.fore -= shieldDamage;
      damageToHull = damage - shieldDamage;
      addToLog(`${target.name} shields absorbed ${shieldDamage} damage. Shield strength at ${newTargetState.shields.fore}.`);
    } else {
      damageToHull = damage;
    }

    if (damageToHull > 0) {
      newTargetState.hull = Math.max(0, newTargetState.hull - damageToHull);
      addToLog(`${target.name} took ${damageToHull} damage to hull. Hull integrity at ${newTargetState.hull}%.`);
    }

    setGameState(prev => {
        if (!prev) return null;
        const newState = JSON.parse(JSON.stringify(prev)) as GameState;
        const targetIndex = newState.currentSector.entities.findIndex(e => e.id === selectedTargetId);
        if (targetIndex !== -1) {
            if (newTargetState.hull <= 0) {
                addToLog(`${newTargetState.name} has been destroyed!`);
                newState.currentSector.entities.splice(targetIndex, 1);
                setSelectedTargetId(null);
            } else {
                newState.currentSector.entities[targetIndex] = newTargetState;
            }
        }
        return newState;
    });
    
    handleEndTurn(true);

  }, [gameState, selectedTargetId, addToLog, handleEndTurn]);

  const handleLaunchTorpedo = useCallback(() => {
    if (!gameState || !selectedTargetId || gameState.player.ship.torpedoes <= 0 || gameState.player.ship.isEvasive) return;

    const target = gameState.currentSector.entities.find(e => e.id === selectedTargetId);
    if (!target || target.type !== 'ship') {
      addToLog("Invalid target for torpedo launch.");
      return;
    }

    addToLog(`Launching photon torpedo at ${target.name}!`);

    setGameState(prev => {
      if (!prev) return null;
      const newState = JSON.parse(JSON.stringify(prev)) as GameState;
      newState.player.ship.torpedoes -= 1;
      const targetIndex = newState.currentSector.entities.findIndex(e => e.id === selectedTargetId);
      if (targetIndex === -1) return newState;
      const newTargetState = newState.currentSector.entities[targetIndex] as Ship & { type: 'ship' };
      const baseDamage = 50;
      let damageToHull = 0;
      if (newTargetState.shields.fore > 0) {
        const torpedoDamageVsShields = Math.round(baseDamage / 2);
        const shieldDamage = Math.min(newTargetState.shields.fore, torpedoDamageVsShields);
        newTargetState.shields.fore -= shieldDamage;
        const damageAbsorbed = shieldDamage * 2;
        damageToHull = Math.max(0, baseDamage - damageAbsorbed);
        addToLog(`${target.name} shields partially absorbed torpedo impact. Shield strength at ${newTargetState.shields.fore}.`);
      } else {
        damageToHull = baseDamage;
      }
      if (damageToHull > 0) {
        newTargetState.hull = Math.max(0, newTargetState.hull - damageToHull);
        addToLog(`${target.name} took a direct hit of ${damageToHull} damage to hull. Hull integrity at ${newTargetState.hull}%.`);
      }
      if (newTargetState.hull <= 0) {
          addToLog(`${newTargetState.name} has been destroyed!`);
          newState.currentSector.entities.splice(targetIndex, 1);
          setSelectedTargetId(null);
      } else {
          newState.currentSector.entities[targetIndex] = newTargetState;
      }
      return newState;
    });
    handleEndTurn(true);
  }, [gameState, selectedTargetId, addToLog, handleEndTurn]);

  const handleEvasiveManeuvers = useCallback(() => {
      if (!gameState || gameState.player.ship.isEvasive) return;
      addToLog(`U.S.S. Endeavour is taking evasive maneuvers!`);
      setGameState(prev => {
          if (!prev) return null;
          const newState = JSON.parse(JSON.stringify(prev)) as GameState;
          newState.player.ship.isEvasive = true;
          return newState;
      });
      handleEndTurn(true);
  }, [gameState, addToLog, handleEndTurn]);

  const handleCycleTargets = useCallback(() => {
    if (!gameState) return;
    const hostileShips = gameState.currentSector.entities.filter(
      (e): e is Ship & { type: 'ship' } => e.type === 'ship' && e.faction !== 'Federation' && e.hull > 0
    );
    if (hostileShips.length === 0) {
      setSelectedTargetId(null);
      addToLog("No hostile targets in sensor range.");
      return;
    }
    const currentTargetIndex = hostileShips.findIndex(s => s.id === selectedTargetId);
    let nextTargetIndex = (currentTargetIndex === -1) ? 0 : (currentTargetIndex + 1) % hostileShips.length;
    const nextTarget = hostileShips[nextTargetIndex];
    setSelectedTargetId(nextTarget.id);
    addToLog(`Targeting systems locked on: ${nextTarget.name}.`);
  }, [gameState, selectedTargetId, addToLog]);

  const handleRestart = () => {
    localStorage.removeItem('star_trek_savegame');
    setGameState(createInitialGameState());
    setGameLog([]);
    setSelectedTargetId(null);
  };
  
  return {
    gameState,
    gameLog,
    selectedTargetId,
    currentView,
    setSelectedTargetId,
    handleEndTurn,
    handleEnergyChange,
    handleFirePhasers,
    handleLaunchTorpedo,
    handleRestart,
    handleCycleTargets,
    handleEvasiveManeuvers,
    handleSetNavigationTarget,
    handleSetView,
    handleWarpToSector,
  };
};