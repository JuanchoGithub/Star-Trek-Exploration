import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Ship, Entity, SectorState } from '../types';

const SECTOR_SIZE = { width: 12, height: 10 };
const QUADRANT_SIZE = { width: 8, height: 8 };

const generateSectorEntities = (isExplored: boolean): Entity[] => {
    if (isExplored) return []; // Should only be called for brand new, empty sectors.
    
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

    const hasEnemy = Math.random() > 0.5; // 50% chance of an enemy
    if (hasEnemy) {
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
            subsystems: {
                weapons: { health: 100, maxHealth: 100 },
                engines: { health: 100, maxHealth: 100 },
                shields: { health: 100, maxHealth: 100 },
            },
            repairTarget: null,
            scanned: false,
            retreatingTurn: null,
        });
    } else if (Math.random() < 0.40) { // 40% chance of a starbase if no enemy (was 25%)
        entities.push({
            id: `starbase-${Date.now()}`,
            type: 'starbase',
            name: `Starbase ${Math.floor(Math.random() * 100) + 1}`,
            faction: 'Federation',
            position: {
                x: Math.floor(Math.random() * SECTOR_SIZE.width),
                y: Math.floor(Math.random() * SECTOR_SIZE.height)
            },
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
        subsystems: {
            weapons: { health: 100, maxHealth: 100 },
            engines: { health: 100, maxHealth: 100 },
            shields: { health: 100, maxHealth: 100 },
        },
        repairTarget: null,
        scanned: true,
        retreatingTurn: null,
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
  const [selectedSubsystem, setSelectedSubsystem] = useState<'weapons' | 'engines' | 'shields' | null>(null);
  const [currentView, setCurrentView] = useState<'sector' | 'quadrant'>('sector');
  const [isDockedWith, setIsDockedWith] = useState<string | null>(null);
  const [isRepairMode, setIsRepairMode] = useState<boolean>(false);


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

  useEffect(() => {
    if (!gameState) return;
    const playerPos = gameState.player.ship.position;
    const starbase = gameState.currentSector.entities.find(
        e => e.type === 'starbase' && e.position.x === playerPos.x && e.position.y === playerPos.y
    );
    if (starbase && isDockedWith !== starbase.id) {
        setIsDockedWith(starbase.id);
        addToLog(`Docking with ${starbase.name} complete. Use 'Starbase Operations' to recharge dilithium.`);
    } else if (!starbase && isDockedWith) {
        setIsDockedWith(null);
        addToLog(`U.S.S. Endeavour has departed the starbase.`);
    }
  }, [gameState?.player.ship.position, gameState?.currentSector.entities, isDockedWith, addToLog]);


  const handleSelectTarget = useCallback((id: string | null) => {
    setSelectedTargetId(id);
    setSelectedSubsystem(null);
  }, []);

  const handleSelectSubsystem = useCallback((subsystem: 'weapons' | 'engines' | 'shields' | null) => {
    setSelectedSubsystem(subsystem);
    if(subsystem) addToLog(`Targeting computer locking on enemy ${subsystem}.`);
  }, [addToLog]);

  const handleSetView = useCallback((view: 'sector' | 'quadrant') => {
      setCurrentView(view);
      setIsRepairMode(false); // Exit repair mode when switching views
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

        newState.player.ship.dilithium -= 1;
        const oldPos = newState.player.quadrantPosition;
        // Persist the current state of the sector we are leaving
        newState.quadrantMap[oldPos.qy][oldPos.qx].entities = newState.currentSector.entities;
        
        newState.player.quadrantPosition = pos;
        newState.player.ship.position = { x: 2, y: 5 };
        
        const targetSectorState = newState.quadrantMap[pos.qy][pos.qx];
        if (!targetSectorState.visited) {
            targetSectorState.visited = true;
            targetSectorState.entities = generateSectorEntities(false);
            addToLog("We are the first Federation ship to enter this sector.");
        } else {
             // FIX: Do not regenerate entities for a visited sector. The existing entities will be loaded.
             addToLog("Entering previously charted space.");
        }
        
        newState.currentSector.entities = targetSectorState.entities;
        newState.navigationTarget = null;
        setSelectedTargetId(null);
        setSelectedSubsystem(null);
        
        return newState;
    });

    handleEndTurn(true);
    setCurrentView('sector');
  }, [gameState, addToLog]);

  const handleSetNavigationTarget = useCallback((pos: { x: number; y: number } | null) => {
    setGameState(prev => {
        if (!prev) return null;
        if(prev.player.ship.retreatingTurn) {
            addToLog("Cannot set course while retreating!");
            return prev;
        }
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
    setIsRepairMode(false); // Always exit repair mode at end of turn
    setGameState(prev => {
      if (!prev) return null;

      const newState: GameState = JSON.parse(JSON.stringify(prev));
      const playerShip = newState.player.ship;

      // Handle Retreat
      if (playerShip.retreatingTurn !== null) {
          if (newState.turn >= playerShip.retreatingTurn) {
              // --- Execute Retreat ---
              addToLog("Emergency warp successful! We have escaped the sector.");
              const oldPos = newState.player.quadrantPosition;
              newState.quadrantMap[oldPos.qy][oldPos.qx].entities = newState.currentSector.entities.filter(e => e.id !== playerShip.id);

              // Find valid adjacent sectors
              const adjacentSectors = [];
              for(let dx = -1; dx <= 1; dx++) {
                  for(let dy = -1; dy <=1; dy++) {
                      if((dx === 0 && dy === 0) || (dx !== 0 && dy !== 0)) continue;
                      const nx = oldPos.qx + dx;
                      const ny = oldPos.qy + dy;
                      if(nx >= 0 && nx < QUADRANT_SIZE.width && ny >= 0 && ny < QUADRANT_SIZE.height) {
                          adjacentSectors.push({qx: nx, qy: ny});
                      }
                  }
              }
              const retreatTo = adjacentSectors[Math.floor(Math.random() * adjacentSectors.length)];
              newState.player.quadrantPosition = retreatTo;
              
              const targetSectorState = newState.quadrantMap[retreatTo.qy][retreatTo.qx];
              if (!targetSectorState.visited) {
                  targetSectorState.visited = true;
                  targetSectorState.entities = generateSectorEntities(false);
              }
              newState.currentSector.entities = targetSectorState.entities;
              
              playerShip.position = { x: 2, y: 5 };
              playerShip.retreatingTurn = null;
              newState.navigationTarget = null;
              setSelectedTargetId(null);
              setSelectedSubsystem(null);
              
              newState.turn +=1;
              return newState;
          } else {
             const turnsLeft = playerShip.retreatingTurn - newState.turn;
             addToLog(`Warp drive charging for retreat... Escape in ${turnsLeft} turn(s).`);
          }
      }

      const getSystemEfficiency = (ship: Ship, system: 'weapons' | 'engines' | 'shields') => {
        const sub = ship.subsystems[system];
        return sub.health / sub.maxHealth;
      };
      
      // Process Player Ship Repairs
      if (playerShip.repairTarget) {
        const system = playerShip.subsystems[playerShip.repairTarget];
        // Repair amount is based on engine power, simulating engineering crew effort
        const repairAmount = 10 + Math.floor(playerShip.powerAllocation.engines / 10);
        const oldHealth = system.health;
        system.health = Math.min(system.maxHealth, system.health + repairAmount);
        addToLog(`Damage control teams repaired ${playerShip.repairTarget} by ${system.health - oldHealth} points. Integrity at ${system.health}%.`);
        playerShip.repairTarget = null;
      }

      // Player Movement (only if not retreating)
      if (!actionTaken && newState.navigationTarget && playerShip.retreatingTurn === null) {
        const target = newState.navigationTarget;
        const currentPos = playerShip.position;
        const engineEfficiency = getSystemEfficiency(playerShip, 'engines');
        const enginePower = playerShip.powerAllocation.engines;
        const movesPerTurn = Math.floor((enginePower / 33) * engineEfficiency);

        if (engineEfficiency <= 0) {
            addToLog("Engines are offline! Cannot move.");
        } else {
            for (let i = 0; i < movesPerTurn; i++) {
                if (currentPos.x === target.x && currentPos.y === target.y) break;
                const dx = target.x - currentPos.x;
                const dy = target.y - currentPos.y;
                if (Math.abs(dx) > Math.abs(dy)) currentPos.x += Math.sign(dx);
                else if (dy !== 0) currentPos.y += Math.sign(dy);
                else if (dx !== 0) currentPos.x += Math.sign(dx);
            }
            if(movesPerTurn > 0) addToLog(`Moving to new coordinates: (${currentPos.x}, ${currentPos.y}).`);
            if (currentPos.x === target.x && currentPos.y === target.y) {
                newState.navigationTarget = null;
                addToLog(`Navigation target reached.`);
            }
        }
      }

      // AI Logic
      newState.currentSector.entities.forEach(entity => {
        if (entity.type === 'ship' && entity.faction !== 'Federation' && entity.hull > 0) {
          const aiShip = entity as Ship;
          const distance = Math.abs(aiShip.position.x - playerShip.position.x) + Math.abs(aiShip.position.y - playerShip.position.y);
          const attackRange = 6;
          
          if(distance <= attackRange && getSystemEfficiency(aiShip, 'weapons') > 0) {
            if (playerShip.isEvasive && Math.random() < 0.5) {
                addToLog(`The attack from ${aiShip.name} missed due to our evasive maneuvers!`);
                return;
            }
            
            addToLog(`${aiShip.name} is firing!`);
            
            const aiWeaponEfficiency = getSystemEfficiency(aiShip, 'weapons');
            const baseDamage = Math.round(15 * (0.5 + aiWeaponEfficiency * 0.5));
            const damage = Math.round(baseDamage * (aiShip.powerAllocation.weapons / 100 + 0.5));

            const bleedThroughRatio = 0.2; // 20% of damage bleeds through shields
            const bleedThroughDamage = Math.round(damage * bleedThroughRatio);
            const shieldDirectedDamage = damage - bleedThroughDamage;

            let overflowDamage = 0;

            if (playerShip.shields.fore > 0) {
                const absorbedDamage = Math.min(playerShip.shields.fore, shieldDirectedDamage);
                playerShip.shields.fore -= absorbedDamage;
                overflowDamage = shieldDirectedDamage - absorbedDamage; 
                addToLog(`Our shields absorbed ${absorbedDamage} damage. Shield strength at ${playerShip.shields.fore}.`);
            } else {
                overflowDamage = shieldDirectedDamage;
            }

            const totalDamageToInternals = bleedThroughDamage + overflowDamage;

            if (totalDamageToInternals > 0) {
                const targetableSubsystems = (['weapons', 'engines', 'shields'] as const)
                    .filter(sub => playerShip.subsystems[sub].health > 0);
                const aiTargetSubsystem = targetableSubsystems[Math.floor(Math.random() * targetableSubsystems.length)];

                if (aiTargetSubsystem) {
                    addToLog(`The attack bypassed our shields, hitting our ${aiTargetSubsystem} systems.`);
                    const targetSub = playerShip.subsystems[aiTargetSubsystem];
                    
                    const damageToSubsystem = Math.min(targetSub.health, Math.round(totalDamageToInternals * 0.75));
                    targetSub.health -= damageToSubsystem;
                    addToLog(`Direct hit to ${aiTargetSubsystem}! System integrity at ${targetSub.health}%.`);
                    
                    const damageToHull = totalDamageToInternals - damageToSubsystem;
                    if (damageToHull > 0) {
                        playerShip.hull = Math.max(0, playerShip.hull - damageToHull);
                        addToLog(`We took ${damageToHull} damage to hull. Hull integrity at ${playerShip.hull}%.`);
                    }
                } else {
                    playerShip.hull = Math.max(0, playerShip.hull - totalDamageToInternals);
                    addToLog(`Direct hit to the hull for ${totalDamageToInternals} damage! Hull integrity at ${playerShip.hull}%.`);
                }

                if (playerShip.hull <= 0) {
                    addToLog("CRITICAL: Hull breach! The Endeavour has been destroyed!");
                }
            }
          } else if (getSystemEfficiency(aiShip, 'engines') > 0) {
            const dx = playerShip.position.x - aiShip.position.x;
            const dy = playerShip.position.y - aiShip.position.y;
            if (Math.abs(dx) > Math.abs(dy)) aiShip.position.x += Math.sign(dx);
            else if (Math.abs(dy) > 0) aiShip.position.y += Math.sign(dy);
            addToLog(`${aiShip.name} moves to intercept course. New position: (${aiShip.position.x}, ${aiShip.position.y}).`);
          }
        }
      });

      // Shield Regeneration
      newState.currentSector.entities.forEach(entity => {
        if (entity.type === 'ship') {
          const ship = entity as Ship;
          const shieldGenEfficiency = getSystemEfficiency(ship, 'shields');
          if (shieldGenEfficiency > 0) {
            const regenAmount = Math.round(10 * (ship.powerAllocation.shields / 100) * shieldGenEfficiency);
            ship.shields.fore = Math.min(ship.maxShields.fore, ship.shields.fore + regenAmount);
            ship.shields.aft = Math.min(ship.maxShields.aft, ship.shields.aft + regenAmount);
          }
        }
      });
      const playerShieldGenEfficiency = getSystemEfficiency(playerShip, 'shields');
      if (playerShieldGenEfficiency > 0) {
        const playerRegen = Math.round(15 * (newState.player.ship.powerAllocation.shields / 100) * playerShieldGenEfficiency);
        playerShip.shields.fore = Math.min(playerShip.maxShields.fore, playerShip.shields.fore + playerRegen);
        playerShip.shields.aft = Math.min(playerShip.maxShields.aft, playerShip.shields.aft + playerRegen);
        if (playerRegen > 0) addToLog(`Shields regenerated by ${playerRegen} points.`);
      } else {
        addToLog(`Shield generators are offline. No regeneration.`);
      }

      // End of turn cleanup
      newState.turn += 1;
      playerShip.isEvasive = false;
      newState.currentSector.entities.forEach(e => {
          if (e.type === 'ship') (e as Ship).isEvasive = false;
      });
      
      return newState;
    });
  }, [addToLog]);

  const handleFirePhasers = useCallback(() => {
    if (!gameState || !selectedTargetId || gameState.player.ship.isEvasive || gameState.player.ship.retreatingTurn) return;
    
    const playerWeaponHealth = gameState.player.ship.subsystems.weapons.health;
    if (playerWeaponHealth <= 0) {
        addToLog("Phaser array is offline!");
        return;
    }

    const target = gameState.currentSector.entities.find(e => e.id === selectedTargetId);
    if (!target || target.type !== 'ship') {
      addToLog("Invalid target selected for phaser attack.");
      return;
    }
    
    setGameState(prev => {
        if (!prev) return null;
        const newState = JSON.parse(JSON.stringify(prev)) as GameState;
        const attacker = newState.player.ship;
        const targetIndex = newState.currentSector.entities.findIndex(e => e.id === selectedTargetId);
        const newTargetState = newState.currentSector.entities[targetIndex] as Ship & { type: 'ship' };

        const weaponEfficiency = attacker.subsystems.weapons.health / attacker.subsystems.weapons.maxHealth;
        const baseDamage = 20 * (0.5 + weaponEfficiency * 0.5);
        const damage = Math.round(baseDamage * (attacker.powerAllocation.weapons / 100 + 0.5));
        
        addToLog(`Firing phasers at ${newTargetState.name}.`);
        
        if (selectedSubsystem) {
            const subsystem = newTargetState.subsystems[selectedSubsystem];
            const damageToSubsystem = Math.min(subsystem.health, damage);
            subsystem.health -= damageToSubsystem;
            const overflowDamage = damage - damageToSubsystem;
            addToLog(`Phasers hit ${newTargetState.name}'s ${selectedSubsystem}! System integrity at ${subsystem.health}%.`);
            if (overflowDamage > 0) {
                newTargetState.hull = Math.max(0, newTargetState.hull - overflowDamage);
                addToLog(`The blast penetrated the hull for ${overflowDamage} damage! Hull integrity at ${newTargetState.hull}%.`);
            }
        } else {
            let damageToHull = 0;
            if (newTargetState.shields.fore > 0) {
              const shieldDamage = Math.min(newTargetState.shields.fore, damage);
              newTargetState.shields.fore -= shieldDamage;
              damageToHull = damage - shieldDamage;
              addToLog(`${newTargetState.name} shields absorbed ${shieldDamage} damage. Shield strength at ${newTargetState.shields.fore}.`);
            } else {
              damageToHull = damage;
            }
            if (damageToHull > 0) {
              newTargetState.hull = Math.max(0, newTargetState.hull - damageToHull);
              addToLog(`${newTargetState.name} took ${damageToHull} damage to hull. Hull integrity at ${newTargetState.hull}%.`);
            }
        }

        if (newTargetState.hull <= 0) {
            addToLog(`${newTargetState.name} has been destroyed!`);
            newState.currentSector.entities.splice(targetIndex, 1);
            setSelectedTargetId(null);
            setSelectedSubsystem(null);
        } else {
            newState.currentSector.entities[targetIndex] = newTargetState;
        }
        return newState;
    });
    
    handleEndTurn(true);
  }, [gameState, selectedTargetId, selectedSubsystem, addToLog, handleEndTurn]);

  const handleLaunchTorpedo = useCallback(() => {
    if (!gameState || !selectedTargetId || gameState.player.ship.torpedoes <= 0 || gameState.player.ship.isEvasive || gameState.player.ship.retreatingTurn) return;

    if (gameState.player.ship.subsystems.weapons.health <= 0) {
        addToLog("Torpedo launcher is offline!");
        return;
    }
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

      if (newTargetState.shields.fore > 0) {
        const shieldDamage = Math.min(newTargetState.shields.fore, baseDamage);
        newTargetState.shields.fore -= shieldDamage;
        addToLog(`${target.name} shields absorbed the torpedo blast. Shield strength at ${newTargetState.shields.fore}.`);
      } else if (selectedSubsystem) {
        const subsystem = newTargetState.subsystems[selectedSubsystem];
        const damageToSubsystem = Math.min(subsystem.health, baseDamage);
        subsystem.health -= damageToSubsystem;
        const overflowDamage = Math.max(0, baseDamage - damageToSubsystem);
        addToLog(`Direct torpedo hit on ${newTargetState.name}'s ${selectedSubsystem}! System integrity at ${subsystem.health}%.`);
        if (overflowDamage > 0) {
          newTargetState.hull = Math.max(0, newTargetState.hull - overflowDamage);
          addToLog(`The explosion tears through the hull for ${overflowDamage} damage! Hull integrity at ${newTargetState.hull}%.`);
        }
      } else {
        newTargetState.hull = Math.max(0, newTargetState.hull - baseDamage);
        addToLog(`${target.name} took a direct hit of ${baseDamage} damage to hull. Hull integrity at ${newTargetState.hull}%.`);
      }
      
      if (newTargetState.hull <= 0) {
          addToLog(`${newTargetState.name} has been destroyed!`);
          newState.currentSector.entities.splice(targetIndex, 1);
          setSelectedTargetId(null);
          setSelectedSubsystem(null);
      } else {
          newState.currentSector.entities[targetIndex] = newTargetState;
      }
      return newState;
    });
    handleEndTurn(true);
  }, [gameState, selectedTargetId, selectedSubsystem, addToLog, handleEndTurn]);

  const handleEvasiveManeuvers = useCallback(() => {
      if (!gameState || gameState.player.ship.isEvasive || gameState.player.ship.retreatingTurn) return;

      if (gameState.player.ship.subsystems.engines.health <= 0) {
          addToLog("Engines are offline! Cannot perform evasive maneuvers!");
          return;
      }

      addToLog(`U.S.S. Endeavour is taking evasive maneuvers!`);
      setGameState(prev => {
          if (!prev) return null;
          const newState = JSON.parse(JSON.stringify(prev)) as GameState;
          newState.player.ship.isEvasive = true;
          return newState;
      });
      handleEndTurn(true);
  }, [gameState, addToLog, handleEndTurn]);

    const handleInitiateRetreat = useCallback(() => {
        if (!gameState || gameState.player.ship.retreatingTurn) return;
        if (gameState.player.ship.subsystems.engines.health <= 0) {
            addToLog("Cannot retreat, engines are offline!");
            return;
        }
        
        addToLog("Warp drive charging for emergency retreat! Escape in 3 turns.");
        setGameState(prev => {
            if(!prev) return null;
            const newState = JSON.parse(JSON.stringify(prev)) as GameState;
            newState.player.ship.retreatingTurn = newState.turn + 3;
            newState.navigationTarget = null; // Cancel any movement
            return newState;
        });

        handleEndTurn(true);
    }, [gameState, addToLog, handleEndTurn]);

  const handleScanTarget = useCallback(() => {
    if (!gameState || !selectedTargetId) return;
    const target = gameState.currentSector.entities.find(e => e.id === selectedTargetId);
    if (!target || target.type !== 'ship') {
        addToLog("Scan failed: Invalid target.");
        return;
    }
    
    addToLog(`Initiating detailed sensor scan on ${target.name}...`);

    setGameState(prev => {
        if (!prev) return null;
        const newState = JSON.parse(JSON.stringify(prev)) as GameState;
        const targetIndex = newState.currentSector.entities.findIndex(e => e.id === selectedTargetId);
        if (targetIndex !== -1) {
            const entity = newState.currentSector.entities[targetIndex];
            if (entity.type === 'ship') {
                entity.scanned = true;
            }
        }
        return newState;
    });

    handleEndTurn(true);
  }, [gameState, selectedTargetId, addToLog, handleEndTurn]);
  
  const handleInitiateDamageControl = useCallback(() => {
      setIsRepairMode(prev => !prev);
  }, []);

  const handleSelectRepairTarget = useCallback((system: 'weapons' | 'engines' | 'shields') => {
      if (!gameState) return;
      const targetSystem = gameState.player.ship.subsystems[system];
      if (targetSystem.health >= targetSystem.maxHealth) {
          addToLog(`${system.charAt(0).toUpperCase() + system.slice(1)} systems are already at full integrity.`);
          setIsRepairMode(false);
          return;
      }

      addToLog(`Damage control teams assigned to repair ${system}.`);
      setGameState(prev => {
          if (!prev) return null;
          const newState = JSON.parse(JSON.stringify(prev)) as GameState;
          newState.player.ship.repairTarget = system;
          return newState;
      });
      handleEndTurn(true);
  }, [gameState, addToLog, handleEndTurn]);

  const handleDockWithStarbase = useCallback(() => {
    if (!gameState || !selectedTargetId) return;

    const target = gameState.currentSector.entities.find(e => e.id === selectedTargetId);
    if (!target || target.type !== 'starbase') {
        addToLog("Docking command failed: Target is not a starbase.");
        return;
    }

    addToLog(`Helm, setting course for ${target.name}. Initiating docking procedures.`);
    
    setGameState(prev => {
        if (!prev) return null;
        const newState = JSON.parse(JSON.stringify(prev)) as GameState;
        newState.navigationTarget = target.position;
        return newState;
    });

    handleEndTurn(false);
  }, [gameState, selectedTargetId, addToLog, handleEndTurn]);

  const handleRechargeDilithium = useCallback(() => {
        if (!isDockedWith) {
            addToLog("Cannot recharge: We are not docked at a starbase.");
            return;
        }
        setGameState(prev => {
            if (!prev) return null;
            const newState = JSON.parse(JSON.stringify(prev)) as GameState;
            const playerShip = newState.player.ship;
            const dilithiumNeeded = playerShip.maxDilithium - playerShip.dilithium;

            if (dilithiumNeeded === 0) {
                addToLog("Dilithium crystals are already at maximum capacity.");
                return newState;
            }

            playerShip.dilithium = playerShip.maxDilithium;
            addToLog(`Dilithium crystals recharged to maximum capacity.`);
            return newState;
        });

        if (gameState && gameState.player.ship.dilithium < gameState.player.ship.maxDilithium) {
            handleEndTurn(true);
        }
    }, [isDockedWith, gameState, addToLog, handleEndTurn]);

    const handleResupplyTorpedoes = useCallback(() => {
        if (!isDockedWith) {
            addToLog("Cannot resupply: We are not docked at a starbase.");
            return;
        }
        setGameState(prev => {
            if (!prev) return null;
            const newState = JSON.parse(JSON.stringify(prev)) as GameState;
            const playerShip = newState.player.ship;

            if (playerShip.torpedoes >= 10) { // Assuming max is 10
                addToLog("Torpedo bays are already fully stocked.");
                return newState;
            }

            playerShip.torpedoes = 10;
            addToLog(`Photon torpedoes resupplied to maximum capacity.`);
            return newState;
        });

        if (gameState && gameState.player.ship.torpedoes < 10) {
            handleEndTurn(true);
        }
    }, [isDockedWith, gameState, addToLog, handleEndTurn]);

  const handleCycleTargets = useCallback(() => {
    if (!gameState) return;
    const hostileShips = gameState.currentSector.entities.filter(
      (e): e is Ship & { type: 'ship' } => e.type === 'ship' && e.faction !== 'Federation' && e.hull > 0
    );
    if (hostileShips.length === 0) {
      setSelectedTargetId(null);
      setSelectedSubsystem(null);
      addToLog("No hostile targets in sensor range.");
      return;
    }
    const currentTargetIndex = hostileShips.findIndex(s => s.id === selectedTargetId);
    let nextTargetIndex = (currentTargetIndex === -1) ? 0 : (currentTargetIndex + 1) % hostileShips.length;
    const nextTarget = hostileShips[nextTargetIndex];
    setSelectedTargetId(nextTarget.id);
    setSelectedSubsystem(null);
    addToLog(`Targeting systems locked on: ${nextTarget.name}.`);
  }, [gameState, selectedTargetId, addToLog]);

  const handleRestart = () => {
    localStorage.removeItem('star_trek_savegame');
    setGameState(createInitialGameState());
    setGameLog([]);
    setSelectedTargetId(null);
    setSelectedSubsystem(null);
    setIsDockedWith(null);
    setIsRepairMode(false);
  };
  
  return {
    gameState,
    gameLog,
    selectedTargetId,
    selectedSubsystem,
    currentView,
    isDockedWith,
    isRepairMode,
    handleSelectTarget,
    handleSelectSubsystem,
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
    handleRechargeDilithium,
    handleDockWithStarbase,
    handleInitiateDamageControl,
    handleSelectRepairTarget,
    handleResupplyTorpedoes,
    handleScanTarget,
    handleInitiateRetreat,
  };
};