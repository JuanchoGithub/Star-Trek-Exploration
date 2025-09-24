
import type { GameState, PlayerTurnActions, Ship, ShipSubsystems, Position } from '../../types';
import { applyPhaserDamage } from '../utils/combat';
import { calculateDistance, moveOneStep } from '../utils/ai';

export const processPlayerTurn = (
    nextState: GameState,
    playerTurnActions: PlayerTurnActions,
    navigationTarget: Position | null,
    selectedTargetId: string | null,
    addLog: (logData: any) => void
): { newNavigationTarget: Position | null, newSelectedTargetId: string | null } => {
    const { player, currentSector } = nextState;
    const { ship } = player;
    const originalPosition = { ...ship.position };

    if (ship.isStunned) {
        addLog({ sourceId: 'player', sourceName: ship.name, message: 'Systems are offline! Cannot perform actions.', isPlayerSource: true, color: 'border-orange-500' });
        return { newNavigationTarget: navigationTarget, newSelectedTargetId: selectedTargetId };
    }

    // Movement
    let newNavigationTarget = navigationTarget;
    if (navigationTarget) {
        const moveSpeed = nextState.redAlert ? 1 : 3;
        const allOtherShips = nextState.currentSector.entities.filter(e => e.type === 'ship' && e.id !== ship.id) as Ship[];

        for (let i = 0; i < moveSpeed; i++) {
            if (!newNavigationTarget || (ship.position.x === newNavigationTarget.x && ship.position.y === newNavigationTarget.y)) {
                if (newNavigationTarget) {
                    // FIX: addLog call was missing properties.
                    addLog({ sourceId: 'player', sourceName: ship.name, message: 'Arrived at destination.', isPlayerSource: true, color: 'border-blue-400' });
                    newNavigationTarget = null;
                }
                break;
            }

            const nextStep = moveOneStep(ship.position, newNavigationTarget);
            
            const isBlocked = allOtherShips.some(s => s.position.x === nextStep.x && s.position.y === nextStep.y);

            if (isBlocked) {
                // FIX: addLog call was missing properties.
                addLog({ sourceId: 'player', sourceName: ship.name, message: 'Path blocked by another vessel. Halting movement for this turn.', isPlayerSource: true, color: 'border-blue-400' });
                // Do not clear navigation target, just stop for this turn.
                break; 
            }

            ship.position = nextStep;

            // check arrival again after moving one step
            if (ship.position.x === newNavigationTarget.x && ship.position.y === newNavigationTarget.y) {
                 // FIX: addLog call was missing properties.
                 addLog({ sourceId: 'player', sourceName: ship.name, message: 'Arrived at destination.', isPlayerSource: true, color: 'border-blue-400' });
                 newNavigationTarget = null;
                 break;
            }
        }
    }
    
    const didMove = ship.position.x !== originalPosition.x || ship.position.y !== originalPosition.y;
    const phaserDelay = didMove ? 700 : 0;

    // Combat
    // FIX: Property 'combat' does not exist on type 'PlayerTurnActions'. Replaced with 'phaserTargetId'.
    if (playerTurnActions.phaserTargetId) {
        // FIX: Property 'combat' does not exist on type 'PlayerTurnActions'. Replaced with 'phaserTargetId'.
        const target = currentSector.entities.find(e => e.id === playerTurnActions.phaserTargetId) as Ship | undefined;
        if (target) {
            const phaserBaseDamage = 20 * ship.energyModifier;
            const phaserPowerModifier = ship.energyAllocation.weapons / 100;
            const pointDefenseModifier = ship.pointDefenseEnabled ? 0.6 : 1.0;
            const finalDamage = phaserBaseDamage * phaserPowerModifier * pointDefenseModifier;

            const combatLogs = applyPhaserDamage(target, finalDamage, player.targeting?.subsystem || null, ship, nextState);
            nextState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: target.id, faction: ship.faction, delay: phaserDelay });
            combatLogs.forEach(message => addLog({ sourceId: 'player', sourceName: ship.name, message, isPlayerSource: true, color: 'border-blue-400' }));
        }
    }

    // Targeting
    const targetEntity = currentSector.entities.find(e => e.id === selectedTargetId);
    let newSelectedTargetId = selectedTargetId;

    if (player.targeting) {
        if (player.targeting.entityId !== selectedTargetId || !targetEntity || (targetEntity.type === 'ship' && (targetEntity as Ship).hull <= 0)) {
            delete player.targeting;
            if (selectedTargetId) {
                newSelectedTargetId = null;
            }
        } else {
             if (player.targeting.entityId === selectedTargetId) {
                player.targeting.consecutiveTurns++;
            }
        }
    }

    // Cloaking state transition
    if (ship.cloakState === 'cloaking') {
        const reliability = ship.customCloakStats?.reliability ?? 0.90;
        if (Math.random() < reliability) {
            ship.cloakState = 'cloaked';
            addLog({ sourceId: 'player', sourceName: ship.name, message: 'Cloaking field is active.', isPlayerSource: true, color: 'border-blue-400' });
        } else {
            ship.cloakState = 'visible';
            ship.cloakCooldown = 2;
            addLog({ sourceId: 'player', sourceName: ship.name, message: 'Cloaking device failed to engage!', isPlayerSource: true, color: 'border-orange-500' });
        }
    }

    return {
        newNavigationTarget,
        newSelectedTargetId
    };
};