
import { GameState, ShipSubsystems, LogEntry, QuadrantPosition, AwayMissionResult, Ship, Planet, EventTemplateOption } from '../../types';
import { createInitialGameState } from './initialization';

// Action Definitions
type ActionType =
  | { type: 'SET_STATE'; payload: GameState }
  | { type: 'RESET_GAME_STATE' }
  | { type: 'ADD_LOG'; payload: Omit<LogEntry, 'id' | 'turn'> }
  | { type: 'SET_ENERGY_ALLOCATION'; payload: { changedKey: 'weapons' | 'shields' | 'engines'; value: number } }
  | { type: 'SELECT_TARGET'; payload: { id: string | null; entities: GameState['currentSector']['entities'] } }
  | { type: 'SET_SUBSYSTEM_TARGET'; payload: { subsystem: keyof ShipSubsystems | null } }
  | { type: 'WARP_TO_QUADRANT'; payload: { pos: QuadrantPosition; dilithiumCost: number } }
// FIX: Update SCAN_QUADRANT payload to include energyCost.
  | { type: 'SCAN_QUADRANT'; payload: { pos: QuadrantPosition; energyCost: number } }
  | { type: 'TOGGLE_RED_ALERT'; payload: { energyCost: number; shieldHealthPercent: number } }
  | { type: 'TOGGLE_EVASIVE' }
  | { type: 'SET_REPAIR_TARGET'; payload: { subsystem: 'hull' | keyof ShipSubsystems | null } }
  | { type: 'SCAN_TARGET'; payload: { targetId: string } }
  | { type: 'INITIATE_RETREAT' }
  | { type: 'CANCEL_RETREAT' }
  | { type: 'DOCK_WITH_STARBASE' }
  | { type: 'DOCKING_STATUS_UPDATE' }
  | { type: 'UPDATE_USED_AWAY_MISSION_SEEDS'; payload: { seed: string; templateId: string } }
  | { type: 'RESOLVE_AWAY_MISSION'; payload: { result: AwayMissionResult; planetId: string } }
  | { type: 'RESOLVE_EVENT'; payload: { outcome: EventTemplateOption['outcome']; beaconId: string } }
  | { type: 'ENTER_ORBIT'; payload: { planetId: string } }
  | { type: 'TOGGLE_POINT_DEFENSE' }
  | { type: 'CONSUME_ENERGY'; payload: { amount: number } }
  | { type: 'SET_COMBAT_EFFECTS', payload: GameState['combatEffects'] }
  | { type: 'SET_DESPERATION_ANIMATIONS', payload: GameState['desperationMoveAnimations'] }
  | { type: 'SET_RETREATING_WARP', payload: boolean };


export type GameAction = ActionType;

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'SET_STATE':
            return action.payload;

        case 'RESET_GAME_STATE':
            return createInitialGameState();

        case 'ADD_LOG': {
            const newLog: LogEntry = {
                id: `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`,
                turn: state.turn,
                ...action.payload,
            };
            const nextLogs = [...state.logs, newLog];
            // Prevent logs from growing indefinitely
            if (nextLogs.length > 300) {
                 nextLogs.shift();
            }
            return { ...state, logs: nextLogs };
        }

        case 'SET_ENERGY_ALLOCATION': {
            const { changedKey, value } = action.payload;
            const oldAlloc = state.player.ship.energyAllocation;
            if (oldAlloc[changedKey] === value) return state;

            const newAlloc = { ...oldAlloc };
            const oldValue = oldAlloc[changedKey];
            const clampedNewValue = Math.max(0, Math.min(100, value));
            const [key1, key2] = (['weapons', 'shields', 'engines'] as const).filter(k => k !== changedKey);
            
            const val1 = oldAlloc[key1];
            const val2 = oldAlloc[key2];
            const totalOtherVal = val1 + val2;
            const intendedDiff = clampedNewValue - oldValue;
            let actualDiff = intendedDiff;
            
            if (intendedDiff > 0) {
                actualDiff = Math.min(intendedDiff, totalOtherVal);
            }

            const finalNewValue = oldValue + actualDiff;
            newAlloc[changedKey] = finalNewValue;
            const toDistribute = -actualDiff;

            if (totalOtherVal > 0) {
                newAlloc[key1] = val1 + Math.round(toDistribute * (val1 / totalOtherVal));
                newAlloc[key2] = val2 + Math.round(toDistribute * (val2 / totalOtherVal));
            } else {
                newAlloc[key1] = val1 + Math.floor(toDistribute / 2);
                newAlloc[key2] = val2 + Math.ceil(toDistribute / 2);
            }
            const sum = newAlloc.weapons + newAlloc.shields + newAlloc.engines;
            if (sum !== 100) {
                newAlloc[changedKey] += (100 - sum);
            }
            return { ...state, player: { ...state.player, ship: { ...state.player.ship, energyAllocation: newAlloc } } };
        }
        
        case 'SELECT_TARGET': {
            const { id, entities } = action.payload;
            const newShipState = { ...state.player.ship, currentTargetId: id };
            let newTargetingState = state.player.targeting;

            if (id) {
                const targetEntity = entities.find(e => e.id === id);
                const currentTargeting = state.player.targeting;
                if (!currentTargeting || currentTargeting.entityId !== id) {
                    if (targetEntity && (targetEntity.type === 'ship' || targetEntity.type === 'torpedo_projectile')) {
                        newTargetingState = { entityId: id, subsystem: null, consecutiveTurns: 1 };
                    } else {
                        newTargetingState = undefined;
                    }
                }
            } else {
                newTargetingState = undefined;
            }
            return { ...state, player: { ...state.player, ship: newShipState, targeting: newTargetingState } };
        }

        case 'SET_SUBSYSTEM_TARGET': {
            if (!state.player.targeting) return state;

            const currentTarget = state.player.targeting;
            const oldSubsystem = currentTarget.subsystem;
            const newSubsystem = action.payload.subsystem;

            const newTargetingState = {
                ...currentTarget,
                subsystem: newSubsystem,
                consecutiveTurns: oldSubsystem !== newSubsystem ? 1 : currentTarget.consecutiveTurns,
            };
            return { ...state, player: { ...state.player, targeting: newTargetingState } };
        }
        
        case 'WARP_TO_QUADRANT': {
            const { pos, dilithiumCost } = action.payload;
            const newQuadrantMap = state.quadrantMap.map(row => row.map(sector => ({...sector})));
            newQuadrantMap[state.player.position.qy][state.player.position.qx] = state.currentSector;
            const newSector = newQuadrantMap[pos.qy][pos.qx];
            newSector.visited = true;

            const newShip = { ...state.player.ship };
            newShip.position = { x: 6, y: 8 };
            newShip.dilithium.current -= dilithiumCost;

            return {
                ...state,
                quadrantMap: newQuadrantMap,
                currentSector: newSector,
                player: { ...state.player, position: pos, ship: newShip },
                orbitingPlanetId: null,
                replayHistory: [],
            };
        }

        case 'SCAN_QUADRANT': {
            // FIX: Consume energy for the scan action.
            const { pos, energyCost } = action.payload;
            const newQuadrantMap = state.quadrantMap.map((row, qy) => {
                if (qy !== pos.qy) return row;
                return row.map((sector, qx) => {
                    if (qx !== pos.qx) return sector;
                    return { ...sector, isScanned: true };
                });
            });
            const newShip = {
                ...state.player.ship,
                energy: {
                    ...state.player.ship.energy,
                    current: state.player.ship.energy.current - energyCost,
                }
            };
            return { ...state, quadrantMap: newQuadrantMap, player: { ...state.player, ship: newShip } };
        }
        
        case 'TOGGLE_RED_ALERT': {
            const { energyCost, shieldHealthPercent } = action.payload;
            const newShipState = { ...state.player.ship };
            const isActivating = !state.redAlert;

            if (isActivating) {
                newShipState.energy.current -= energyCost;
                newShipState.shields = shieldHealthPercent < 0.25 ? 0 : newShipState.maxShields;
            } else {
                newShipState.shields = 0;
                newShipState.evasive = false;
            }
            return { ...state, redAlert: isActivating, player: { ...state.player, ship: newShipState } };
        }
        
        case 'TOGGLE_EVASIVE':
            return { ...state, player: { ...state.player, ship: { ...state.player.ship, evasive: !state.player.ship.evasive } } };

        case 'SET_REPAIR_TARGET':
            const newTarget = state.player.ship.repairTarget === action.payload.subsystem ? null : action.payload.subsystem;
            return { ...state, player: { ...state.player, ship: { ...state.player.ship, repairTarget: newTarget } } };
        
        case 'SCAN_TARGET': {
            const newEntities = state.currentSector.entities.map(e => 
                e.id === action.payload.targetId ? { ...e, scanned: true } : e
            );
            return { ...state, currentSector: { ...state.currentSector, entities: newEntities } };
        }

        case 'INITIATE_RETREAT':
            return { ...state, player: { ...state.player, ship: { ...state.player.ship, retreatingTurn: state.turn + 3 } } };
        case 'CANCEL_RETREAT':
            return { ...state, player: { ...state.player, ship: { ...state.player.ship, retreatingTurn: null } } };
        
        case 'DOCK_WITH_STARBASE':
            return { ...state, isDocked: true };

        case 'DOCKING_STATUS_UPDATE': {
            if (!state.isDocked) return state; // Only act if we think we are docked
            const starbase = state.currentSector.entities.find(e => e.type === 'starbase');
            const distance = starbase ? Math.max(Math.abs(state.player.ship.position.x - starbase.position.x), Math.abs(state.player.ship.position.y - starbase.position.y)) : Infinity;
            if (distance > 1) {
                return { ...state, isDocked: false };
            }
            return state;
        }
        
        case 'UPDATE_USED_AWAY_MISSION_SEEDS':
            return {
                ...state,
                usedAwayMissionSeeds: [...state.usedAwayMissionSeeds, action.payload.seed],
                usedAwayMissionTemplateIds: [...(state.usedAwayMissionTemplateIds || []), action.payload.templateId]
            };
        
        case 'RESOLVE_AWAY_MISSION': {
            const newEntities = state.currentSector.entities.map(e => {
                if (e.id === action.payload.planetId && e.type === 'planet') {
                    return { ...e, awayMissionCompleted: true };
                }
                return e;
            });
            return { ...state, currentSector: { ...state.currentSector, entities: newEntities } };
        }
        
        case 'RESOLVE_EVENT': {
             const newEntities = state.currentSector.entities.map(e => {
                if (e.id === action.payload.beaconId) {
                    return { ...e, isResolved: true };
                }
                return e;
            });
            return { ...state, redAlert: action.payload.outcome.type === 'combat' ? true : state.redAlert, currentSector: { ...state.currentSector, entities: newEntities } };
        }

        case 'ENTER_ORBIT':
            return { ...state, orbitingPlanetId: action.payload.planetId };

        case 'TOGGLE_POINT_DEFENSE':
            return { ...state, player: { ...state.player, ship: { ...state.player.ship, pointDefenseEnabled: !state.player.ship.pointDefenseEnabled } } };
            
        case 'CONSUME_ENERGY':
            return { ...state, player: { ...state.player, ship: { ...state.player.ship, energy: { ...state.player.ship.energy, current: state.player.ship.energy.current - action.payload.amount } } } };
        
        case 'SET_COMBAT_EFFECTS':
            return { ...state, combatEffects: action.payload };

        case 'SET_DESPERATION_ANIMATIONS':
            return { ...state, desperationMoveAnimations: action.payload };

        case 'SET_RETREATING_WARP':
            return { ...state, isRetreatingWarp: action.payload };

        default:
            return state;
    }
};
