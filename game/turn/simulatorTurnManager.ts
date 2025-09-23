import type { GameState, PlayerTurnActions, Ship, LogEntry, TorpedoProjectile, ShipSubsystems } from '../../types';
import { processAITurns } from './aiProcessor';
import { AIActions } from '../ai/FactionAI';
import { applyTorpedoDamage, applyPhaserDamage } from '../utils/combat';
import { calculateDistance, moveOneStep, uniqueId } from '../utils/ai';
import { shipClasses } from '../../assets/ships/configs/shipClassStats';

const processSimulatorPlayerTurn = (
    nextState: GameState,
    playerTurnActions: PlayerTurnActions,
    navigationTarget: { x: number; y: number } | null,
    selectedTargetId: string | null,
    addLog: (logData: any) => void
): { newNavigationTarget: { x: number; y: number } | null, newSelectedTargetId: string | null } => {
    const playerShip = nextState.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;
    if (!playerShip) {
        return { newNavigationTarget: navigationTarget, newSelectedTargetId: selectedTargetId };
    }

    // Combat
    if (playerTurnActions.combat) {
        const target = nextState.currentSector.entities.find(e => e.id === playerTurnActions.combat!.targetId) as Ship | undefined;
        if (target) {
            const phaserBaseDamage = 20 * playerShip.energyModifier;
            const phaserPowerModifier = playerShip.energyAllocation.weapons / 100;
            const pointDefenseModifier = playerShip.pointDefenseEnabled ? 0.6 : 1.0;
            const finalDamage = phaserBaseDamage * phaserPowerModifier * pointDefenseModifier;

            const combatLogs = applyPhaserDamage(target, finalDamage, null, playerShip, nextState);
            nextState.combatEffects.push({ type: 'phaser', sourceId: playerShip.id, targetId: target.id, faction: playerShip.faction, delay: 0 });
            combatLogs.forEach(message => addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message, isPlayerSource: true, color: playerShip.logColor }));
        }
    }

    // Movement
    let newNavigationTarget = navigationTarget;
    if (navigationTarget && !playerTurnActions.combat) {
        if (playerShip.position.x === navigationTarget.x && playerShip.position.y === navigationTarget.y) {
            addLog({ sourceId: playerShip.id, sourceName: playerShip.name, message: 'Arrived at destination.', isPlayerSource: true, color: playerShip.logColor });
            newNavigationTarget = null;
        } else {
            playerShip.position = moveOneStep(playerShip.position, navigationTarget);
        }
    }
    
    if (newNavigationTarget && playerShip.position.x === newNavigationTarget.x && playerShip.position.y === newNavigationTarget.y) {
        newNavigationTarget = null;
    }

    return {
        newNavigationTarget,
        newSelectedTargetId: selectedTargetId,
    };
};


const processEndOfTurnSystemsForSim = (state: GameState, addLog: (logData: Omit<LogEntry, 'id' | 'turn'>) => void): void => {
    const allShips = state.currentSector.entities.filter(e => e.type === 'ship') as Ship[];
    
    allShips.forEach(ship => {
        if (ship.hull <= 0) return;

        // 1. Status Effects (Plasma Burn)
        ship.statusEffects = ship.statusEffects.filter(effect => {
            if (effect.type === 'plasma_burn') {
                ship.hull = Math.max(0, ship.hull - effect.damage);
                addLog({ sourceId: ship.id, sourceName: 'Damage Control', message: `${ship.name} takes ${effect.damage} damage from plasma fire!`, color: 'border-orange-400', isPlayerSource: ship.allegiance === 'player' });
                effect.turnsRemaining--;
                return effect.turnsRemaining > 0;
            }
            return false;
        });

        // 2. Damage Control Repairs (for dogfight mode)
        if (ship.repairTarget) {
            const repairCost = 5 * ship.energyModifier;
            if (ship.energy.current >= repairCost) {
                ship.energy.current -= repairCost;
                const repairAmount = 5;
                if (ship.repairTarget === 'hull') {
                    ship.hull = Math.min(ship.maxHull, ship.hull + repairAmount);
                } else {
                    const subsystem = ship.subsystems[ship.repairTarget];
                    if (subsystem) {
                        subsystem.health = Math.min(subsystem.maxHealth, subsystem.health + repairAmount);
                        if (subsystem.health >= subsystem.maxHealth) {
                            ship.repairTarget = null;
                        }
                    }
                }
            }
        }
        
        // 3. System Failure Timers
        if (ship.lifeSupportFailureTurn !== null) {
            const turnsPassed = state.turn - ship.lifeSupportFailureTurn;
            if (turnsPassed >= 2) {
                ship.isDerelict = true;
                ship.hull = 1;
                addLog({ sourceId: ship.id, sourceName: 'SYSTEM', message: `Life support failure on ${ship.name}! The ship is now a derelict hulk.`, color: 'border-red-600', isPlayerSource: false });
            }
        }
        if (ship.engineFailureTurn !== null) {
            const turnsPassed = state.turn - ship.engineFailureTurn;
            if (turnsPassed >= 3) {
                ship.engineFailureTurn = null;
            }
        }

        // 4. Energy Management
        const stats = shipClasses[ship.shipModel][ship.shipClass];
        if (stats) {
            const engineOutputMultiplier = 0.5 + 1.5 * (ship.energyAllocation.engines / 100);
            const engineEfficiency = ship.subsystems.engines.maxHealth > 0 ? ship.subsystems.engines.health / ship.subsystems.engines.maxHealth : 0;
            const generatedFromEngines = stats.baseEnergyGeneration * engineOutputMultiplier * engineEfficiency;

            let totalConsumption = 0;
            for (const key in ship.subsystems) {
                const systemKey = key as keyof ShipSubsystems;
                if (ship.subsystems[systemKey].health > 0 && stats.systemConsumption[systemKey] > 0) {
                    totalConsumption += stats.systemConsumption[systemKey];
                }
            }
            if (stats.systemConsumption.base > 0) totalConsumption += stats.systemConsumption.base;
            
            // In simulator, red alert is always on for combatants
            if (ship.allegiance === 'player' || ship.allegiance === 'ally' || ship.allegiance === 'enemy') {
                totalConsumption += 20;
            }

            if (ship.evasive) totalConsumption += 10;
            if (ship.pointDefenseEnabled) totalConsumption += 15;
            if (ship.repairTarget) totalConsumption += 5;

            const netChange = generatedFromEngines - totalConsumption;
            ship.energy.current += netChange;

            // Dilithium backup
            if (ship.energy.current < 0) {
                if (ship.dilithium.current > 0) {
                    ship.dilithium.current--;
                    addLog({ sourceId: ship.id, sourceName: 'Engineering', message: `Emergency power! ${ship.name} used 1 Dilithium to prevent a blackout.`, color: 'border-orange-500', isPlayerSource: ship.allegiance === 'player' });
                    ship.energy.current = ship.energy.max + netChange; // Add max energy, then subtract the deficit.
                } else {
                    if (ship.subsystems.lifeSupport.health > 0 && ship.lifeSupportFailureTurn === null) {
                        ship.subsystems.lifeSupport.health = 0;
                        ship.lifeSupportFailureTurn = state.turn;
                        addLog({ sourceId: ship.id, sourceName: 'SYSTEM', message: `Power failure on ${ship.name}! Life support is failing!`, color: 'border-red-600', isPlayerSource: false });
                    }
                }
            }
        }

        // 5. Shield Regeneration
        if (ship.shields < ship.maxShields && ship.subsystems.shields.health > 0) {
            const regenAmount = (ship.energyAllocation.shields / 100) * (ship.maxShields * 0.1);
            const shieldEfficiency = ship.subsystems.shields.health / ship.subsystems.shields.maxHealth;
            const effectiveRegen = regenAmount * shieldEfficiency;
            ship.shields = Math.min(ship.maxShields, ship.shields + effectiveRegen);
        }

        // 6. Cloaking
        if (ship.cloakState === 'cloaked') {
            const reliability = ship.customCloakStats?.reliability ?? 0.90;
            const powerCost = ship.customCloakStats?.powerCost ?? 40;
            if (ship.energy.current < powerCost || Math.random() > reliability) {
                ship.cloakState = 'visible';
                ship.cloakCooldown = 2;
            } else {
                ship.energy.current -= powerCost;
            }
        }
        if (ship.cloakCooldown > 0) ship.cloakCooldown--;

        // 7. Stun recovery
        if (ship.isStunned) ship.isStunned = false;
        
        // Final energy clamp
        ship.energy.current = Math.max(0, Math.min(ship.energy.max, ship.energy.current));
    });
};

export const resolveTurn = (
    gameState: GameState,
    playerTurnActions: PlayerTurnActions,
    navigationTarget: { x: number; y: number } | null,
    selectedTargetId: string | null,
    addLog: (logData: Omit<LogEntry, 'id' | 'turn'>) => void
) => {
    const nextState: GameState = JSON.parse(JSON.stringify(gameState));
    
    const playerShip = nextState.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;
    const actedShipIds = new Set<string>();
    
    let playerResult = { newNavigationTarget: navigationTarget, newSelectedTargetId: selectedTargetId };
    if (playerShip) {
        playerResult = processSimulatorPlayerTurn(nextState, playerTurnActions, navigationTarget, selectedTargetId, addLog);
        actedShipIds.add(playerShip.id);
    }

    const aiActions: AIActions = {
        addLog,
        applyPhaserDamage: (target: Ship, damage: number, subsystem: keyof ShipSubsystems | null, source: Ship, state: GameState) => {
            return applyPhaserDamage(target, damage, subsystem, source, state);
        },
        triggerDesperationAnimation: (animation) => nextState.desperationMoveAnimations.push(animation),
    };
    
    processAITurns(nextState, aiActions, actedShipIds);

    // Torpedo Movement & Resolution
    nextState.currentSector.entities = nextState.currentSector.entities.filter(entity => {
        if (entity.type !== 'torpedo_projectile') return true;
        const torpedo = entity as TorpedoProjectile;
        const allShips = nextState.currentSector.entities.filter(e => e.type === 'ship') as Ship[];
        const target = allShips.find(s => s.id === torpedo.targetId);
        
        if (!target || target.hull <= 0) return false;

        for (let i = 0; i < torpedo.speed; i++) {
            if (calculateDistance(torpedo.position, target.position) <= 0) {
                 const combatLogs = applyTorpedoDamage(target, torpedo);
                 combatLogs.forEach(log => addLog({ sourceId: torpedo.sourceId, sourceName: 'Combat Log', message: log, isPlayerSource: false, color: 'border-gray-500' }));
                 nextState.combatEffects.push({ type: 'torpedo_hit', position: target.position, delay: 0, torpedoType: torpedo.torpedoType });
                return false;
            }
            torpedo.position = moveOneStep(torpedo.position, target.position);
            torpedo.path.push({ ...torpedo.position });
        }
        return true;
    });

    processEndOfTurnSystemsForSim(nextState, addLog);

    nextState.currentSector.entities = nextState.currentSector.entities.filter(e => {
        if (e.type === 'ship' || e.type === 'torpedo_projectile') {
            return (e as Ship).hull > 0;
        }
        return true;
    });
    
    const allRemainingShips = nextState.currentSector.entities.filter(e => e.type === 'ship') as Ship[];
    const playerTeam = allRemainingShips.filter(s => s.allegiance === 'player' || s.allegiance === 'ally');
    const enemyTeam = allRemainingShips.filter(s => s.allegiance === 'enemy');
    
    if (playerTeam.length === 0 && enemyTeam.length > 0) {
        nextState.gameOver = true;
        addLog({ sourceId: 'system', sourceName: 'Simulator', message: 'Friendly forces eliminated. Simulation Over.', isPlayerSource: false, color: 'border-red-600' });
    } else if (enemyTeam.length === 0 && playerTeam.length > 0) {
        nextState.gameWon = true;
        addLog({ sourceId: 'system', sourceName: 'Simulator', message: 'Hostile forces eliminated. Simulation Complete.', isPlayerSource: false, color: 'border-green-600' });
    }
    
    nextState.turn++;

    return {
        nextGameState: nextState,
        newNavigationTarget: playerResult.newNavigationTarget,
        newSelectedTargetId: playerResult.newSelectedTargetId,
    };
};