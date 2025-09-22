import type { GameState, PlayerTurnActions, Ship, ShipSubsystems } from '../../types';
import { applyPhaserDamage } from '../utils/combat';
import { calculateDistance, moveOneStep } from '../utils/ai';

export const processPlayerTurn = (
    nextState: GameState,
    playerTurnActions: PlayerTurnActions,
    navigationTarget: { x: number; y: number } | null,
    selectedTargetId: string | null,
    addLog: (logData: any) => void
): { newNavigationTarget: { x: number; y: number } | null, newSelectedTargetId: string | null } => {
    const { player, currentSector } = nextState;
    const { ship } = player;

    if (ship.isStunned) {
        addLog({ sourceId: 'player', sourceName: ship.name, message: 'Systems are offline! Cannot perform actions.', isPlayerSource: true, color: 'border-orange-500' });
        return { newNavigationTarget: navigationTarget, newSelectedTargetId: selectedTargetId };
    }

    // Combat
    if (playerTurnActions.combat) {
        const target = currentSector.entities.find(e => e.id === playerTurnActions.combat!.targetId) as Ship | undefined;
        if (target) {
            const phaserBaseDamage = 20 * ship.energyModifier;
            const phaserPowerModifier = ship.energyAllocation.weapons / 100;
            const pointDefenseModifier = ship.pointDefenseEnabled ? 0.6 : 1.0;
            const finalDamage = phaserBaseDamage * phaserPowerModifier * pointDefenseModifier;

            const combatLogs = applyPhaserDamage(target, finalDamage, player.targeting?.subsystem || null, ship, nextState);
            nextState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: target.id, faction: ship.faction, delay: 0 });
            combatLogs.forEach(message => addLog({ sourceId: 'player', sourceName: ship.name, message, isPlayerSource: true, color: 'border-blue-400' }));
        }
    }

    // Movement
    let newNavigationTarget = navigationTarget;
    if (navigationTarget && !playerTurnActions.combat && !playerTurnActions.hasTakenMajorAction) {
        const moveSpeed = nextState.redAlert ? 1 : 3;
        for (let i = 0; i < moveSpeed; i++) {
            if (!navigationTarget || (ship.position.x === navigationTarget.x && ship.position.y === navigationTarget.y)) {
                if (navigationTarget) {
                    addLog({ sourceId: 'player', sourceName: ship.name, message: 'Arrived at destination.', isPlayerSource: true, color: 'border-blue-400' });
                    newNavigationTarget = null;
                }
                break;
            }
            ship.position = moveOneStep(ship.position, navigationTarget);
        }
    }
    
    if (newNavigationTarget && ship.position.x === newNavigationTarget.x && ship.position.y === newNavigationTarget.y) {
        newNavigationTarget = null;
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