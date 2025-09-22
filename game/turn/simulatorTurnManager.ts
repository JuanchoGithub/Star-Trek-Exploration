import type { GameState, PlayerTurnActions, Ship, LogEntry, TorpedoProjectile } from '../../types';
import { processPlayerTurn } from './player';
import { AIDirector } from '../ai/AIDirector';
import type { AIActions } from '../ai/FactionAI';
import { applyTorpedoDamage } from '../utils/combat';
import { calculateDistance } from '../utils/ai';
import { uniqueId } from '../utils/helpers';
import { PLAYER_LOG_COLOR, SYSTEM_LOG_COLOR } from '../../assets/configs/logColors';

const processEndOfTurnSystems = (state: GameState, addLog: (logData: Omit<LogEntry, 'id' | 'turn'>) => void): void => {
    const allShips = state.currentSector.entities.filter(e => e.type === 'ship') as Ship[];
    
    allShips.forEach(ship => {
        // Captured ship repair logic
        if (ship.captureInfo) {
            const turnsSinceCapture = state.turn - ship.captureInfo.repairTurn;
            if (turnsSinceCapture > 0 && turnsSinceCapture <= 5) {
                ship.hull = Math.min(ship.maxHull, ship.hull + ship.maxHull * 0.1);
                const subsystems = Object.values(ship.subsystems);
                const damagedSubsystems = subsystems.filter(s => s.health < s.maxHealth);
                if (damagedSubsystems.length > 0) {
                    const systemToRepair = damagedSubsystems[Math.floor(Math.random() * damagedSubsystems.length)];
                    systemToRepair.health = Math.min(systemToRepair.maxHealth, systemToRepair.health + 20);
                }
                addLog({ sourceId: 'system', sourceName: 'Engineering', message: `Repair teams are making progress on the captured ${ship.name}.`, isPlayerSource: false, color: SYSTEM_LOG_COLOR });
            } else if (turnsSinceCapture > 5) {
                ship.captureInfo = null;
                addLog({ sourceId: 'system', sourceName: 'Engineering', message: `The captured ${ship.name} is now fully operational!`, isPlayerSource: false, color: PLAYER_LOG_COLOR });
            }
        }
        
        // System Failure Cascade Logic
        if (ship.subsystems.engines.health <= 0 && ship.engineFailureTurn === null) {
            ship.engineFailureTurn = state.turn;
            addLog({ sourceId: ship.id, sourceName: ship.name, message: `${ship.name}'s engines have failed! They are dead in space.`, isPlayerSource: ship.allegiance === 'player', color: 'border-orange-500' });
        }
        if (ship.engineFailureTurn !== null) {
            if (ship.energy.current <= 0 && ship.lifeSupportFailureTurn === null) {
                ship.lifeSupportFailureTurn = state.turn;
                addLog({ sourceId: ship.id, sourceName: ship.name, message: `${ship.name}'s main power has failed! Switching to emergency life support (2 turns).`, isPlayerSource: ship.allegiance === 'player', color: 'border-orange-500' });
            }
        }
        if (ship.lifeSupportFailureTurn !== null && state.turn > ship.lifeSupportFailureTurn + 2) {
            if (!ship.isDerelict) {
                ship.isDerelict = true;
                addLog({ sourceId: ship.id, sourceName: ship.name, message: `Emergency life support on ${ship.name} has failed! The ship is now a derelict hulk.`, isPlayerSource: ship.allegiance === 'player', color: 'border-red-600' });
            }
        }
        
        // Shield Regeneration
        if (ship.shields < ship.maxShields && ship.subsystems.shields.health > 0) {
            const regenAmount = (ship.energyAllocation.shields / 100) * (ship.maxShields * 0.1);
            const shieldEfficiency = ship.subsystems.shields.health / ship.subsystems.shields.maxHealth;
            const effectiveRegen = regenAmount * shieldEfficiency;
            ship.shields = Math.min(ship.maxShields, ship.shields + effectiveRegen);
        }
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
    const actedShipIds = new Set<string>();
    
    const playerShip = nextState.currentSector.entities.find(e => e.type === 'ship' && e.allegiance === 'player') as Ship | undefined;

    if (playerShip) {
        nextState.player.ship = playerShip;
        const playerResult = processPlayerTurn(nextState, playerTurnActions, navigationTarget, selectedTargetId, addLog);
        actedShipIds.add(playerShip.id);
        navigationTarget = playerResult.newNavigationTarget;
        selectedTargetId = playerResult.newSelectedTargetId;
    }

    const aiShips = nextState.currentSector.entities.filter((e): e is Ship => e.type === 'ship' && e.id !== playerShip?.id);

    const allShips = nextState.currentSector.entities.filter(e => e.type === 'ship') as Ship[];

    for (const ship of aiShips) {
        if (actedShipIds.has(ship.id)) continue;
        if (ship.hull <= 0 || ship.isDerelict || ship.captureInfo) continue;

        const factionAI = AIDirector.getAIForFaction(ship.faction);
        
        let potentialTargets: Ship[] = [];
        if (ship.allegiance === 'enemy') {
            potentialTargets = allShips.filter(s => s.allegiance === 'player' || s.allegiance === 'ally');
        } else if (ship.allegiance === 'ally') {
            potentialTargets = allShips.filter(s => s.allegiance === 'enemy');
        } else if (ship.allegiance === 'neutral') {
             // Neutral ships currently don't act in combat in the simulator beyond their AI's flee logic.
        }

        if (ship.hull / ship.maxHull <= 0.05) {
            addLog({ sourceId: ship.id, sourceName: ship.name, message: `The ${ship.name}'s hull is critical! They're making a desperate move!`, color: 'border-orange-400', isPlayerSource: false });
            factionAI.processDesperationMove(ship, nextState, { addLog, applyPhaserDamage: () => [], triggerDesperationAnimation: (anim) => nextState.desperationMoveAnimations.push(anim) });
        } else {
            factionAI.processTurn(ship, nextState, { addLog, applyPhaserDamage: () => [], triggerDesperationAnimation: (anim) => nextState.desperationMoveAnimations.push(anim) }, potentialTargets);
        }
    }

    // Torpedo Movement
    nextState.currentSector.entities = nextState.currentSector.entities.filter(entity => {
        if (entity.type !== 'torpedo_projectile') return true;
        const torpedo = entity as TorpedoProjectile;
        const target = allShips.find(s => s.id === torpedo.targetId);
        
        if (!target || target.hull <= 0) {
            addLog({ sourceId: torpedo.sourceId, sourceName: 'Sensors', message: `A torpedo lost its target lock and self-destructed.`, isPlayerSource: false, color: SYSTEM_LOG_COLOR });
            return false;
        }

        for (let i = 0; i < torpedo.speed; i++) {
            if (calculateDistance(torpedo.position, target.position) <= 0) {
                 const combatLogs = applyTorpedoDamage(target, torpedo);
                 combatLogs.forEach(log => addLog({ sourceId: torpedo.sourceId, sourceName: 'Simulator', message: log, isPlayerSource: false, color: 'border-gray-500' }));
                 nextState.combatEffects.push({ type: 'torpedo_hit', position: target.position, delay: 0, torpedoType: torpedo.torpedoType });
                return false;
            }
             torpedo.position = calculateDistance(torpedo.position, target.position) > 0 ? {
                x: torpedo.position.x + Math.sign(target.position.x - torpedo.position.x),
                y: torpedo.position.y + Math.sign(target.position.y - torpedo.position.y)
            } : torpedo.position;
            torpedo.path.push({ ...torpedo.position });
        }
        return true;
    });

    processEndOfTurnSystems(nextState, addLog);

    // Ship Cleanup
    nextState.currentSector.entities = nextState.currentSector.entities.filter(e => {
        if (e.type === 'ship' && e.hull <= 0) {
            return false;
        }
        return true;
    });

    nextState.turn++;

    const remainingEnemies = nextState.currentSector.entities.some(e => e.type === 'ship' && e.allegiance === 'enemy' && e.hull > 0);
    const remainingAllies = nextState.currentSector.entities.some(e => e.type === 'ship' && (e.allegiance === 'player' || e.allegiance === 'ally') && e.hull > 0);

    if (!remainingEnemies) {
        nextState.gameWon = true;
        nextState.gameOver = true;
        addLog({ sourceId: 'system', sourceName: 'Simulator', message: 'All enemy forces have been eliminated. Player and allies are victorious!', isPlayerSource: false, color: 'border-green-500' });
    }
    if (!remainingAllies) {
        nextState.gameOver = true;
        addLog({ sourceId: 'system', sourceName: 'Simulator', message: 'All allied and player forces have been eliminated. Enemy is victorious.', isPlayerSource: false, color: 'border-red-500' });
    }

    return {
        nextGameState: nextState,
        newNavigationTarget: navigationTarget,
        newSelectedTargetId: selectedTargetId,
    };
};
