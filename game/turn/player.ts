import type { GameState, PlayerTurnActions, Ship, ShipSubsystems, Position, BeamWeapon, TorpedoProjectile, ProjectileWeapon } from '../../types';
import { fireBeamWeapon } from '../utils/combat';
import { calculateDistance, moveOneStep, uniqueId } from '../utils/ai';
import { torpedoStats } from '../../assets/projectiles/configs/torpedoTypes';
import { generateBeamAttackLog, generatePlayerTorpedoLaunchLog } from '../ai/aiLogger';

export const processPlayerTurn = (
    nextState: GameState,
    playerTurnActions: PlayerTurnActions,
    navigationTarget: Position | null,
    selectedTargetId: string | null,
    addLog: (logData: any) => void,
    addTurnEvent: (event: string) => void
): { newNavigationTarget: Position | null, newSelectedTargetId: string | null } => {
    const { player, currentSector } = nextState;
    const { ship } = player;
    const originalPosition = { ...ship.position };

    if (ship.isStunned) {
        addLog({ sourceId: 'player', sourceName: ship.name, message: 'Systems are offline! Cannot perform actions.', isPlayerSource: true, color: 'border-orange-500' });
        return { newNavigationTarget: navigationTarget, newSelectedTargetId: selectedTargetId };
    }

    if (playerTurnActions.isUndocking) {
        nextState.isDocked = false;
        addLog({ sourceId: 'player', sourceName: ship.name, message: 'Undocking procedures complete. Ship has cleared the starbase.', isPlayerSource: true, color: 'border-blue-400' });
        return { newNavigationTarget: null, newSelectedTargetId: selectedTargetId };
    }

    if (nextState.isDocked) {
        addLog({ sourceId: 'player', sourceName: ship.name, message: 'Holding position at starbase. Awaiting orders.', isPlayerSource: true, color: 'border-blue-400' });
        return { newNavigationTarget: null, newSelectedTargetId: selectedTargetId };
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
                    addLog({ sourceId: 'player', sourceName: ship.name, sourceFaction: ship.faction, message: 'Arrived at destination.', isPlayerSource: true, color: 'border-blue-400' });
                    newNavigationTarget = null;
                }
                break;
            }

            const nextStep = moveOneStep(ship.position, newNavigationTarget);
            
            const isBlocked = allOtherShips.some(s => s.position.x === nextStep.x && s.position.y === nextStep.y);

            if (isBlocked) {
                // FIX: addLog call was missing properties.
                addLog({ sourceId: 'player', sourceName: ship.name, sourceFaction: ship.faction, message: 'Path blocked by another vessel. Halting movement for this turn.', isPlayerSource: true, color: 'border-blue-400' });
                // Do not clear navigation target, just stop for this turn.
                break; 
            }

            ship.position = nextStep;

            // check arrival again after moving one step
            if (ship.position.x === newNavigationTarget.x && ship.position.y === newNavigationTarget.y) {
                 // FIX: addLog call was missing properties.
                 addLog({ sourceId: 'player', sourceName: ship.name, sourceFaction: ship.faction, message: 'Arrived at destination.', isPlayerSource: true, color: 'border-blue-400' });
                 newNavigationTarget = null;
                 break;
            }
        }
    }
    
    const didMove = ship.position.x !== originalPosition.x || ship.position.y !== originalPosition.y;
    const phaserDelay = didMove ? 700 : 0;

    // Combat
    if (playerTurnActions.firedWeaponId && playerTurnActions.weaponTargetId) {
        const weapon = ship.weapons.find(w => w.id === playerTurnActions.firedWeaponId);
        const target = currentSector.entities.find(e => e.id === playerTurnActions.weaponTargetId) as Ship | undefined;

        if (weapon && target) {
            if (weapon.type === 'beam') {
                const attackResult = fireBeamWeapon(target, weapon as BeamWeapon, player.targeting?.subsystem || null, ship, nextState);
                nextState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: target.id, faction: ship.faction, delay: phaserDelay });
                const message = generateBeamAttackLog(ship, target, weapon as BeamWeapon, attackResult);
                addLog({ sourceId: 'player', sourceName: ship.name, message, isPlayerSource: true, color: 'border-blue-400', category: 'combat' });
            } else if (weapon.type === 'projectile') {
                const projectileWeapon = weapon as ProjectileWeapon;
                const torpedoData = torpedoStats[projectileWeapon.ammoType];

                if (torpedoData && ship.ammo[projectileWeapon.ammoType] && ship.ammo[projectileWeapon.ammoType]!.current > 0) {
                    ship.ammo[projectileWeapon.ammoType]!.current--;
                    // Also decrement old torpedoes property for now
                    if (ship.torpedoes.current > 0) ship.torpedoes.current--;

                    const torpedo: TorpedoProjectile = {
                        id: uniqueId(),
                        name: torpedoData.name,
                        type: 'torpedo_projectile',
                        faction: ship.faction,
                        position: { ...ship.position },
                        targetId: target.id,
                        sourceId: ship.id,
                        stepsTraveled: 0,
                        speed: torpedoData.speed,
                        path: [{ ...ship.position }],
                        scanned: true,
                        turnLaunched: nextState.turn,
                        hull: 1,
                        maxHull: 1,
                        torpedoType: projectileWeapon.ammoType,
                        damage: torpedoData.damage,
                        specialDamage: torpedoData.specialDamage,
                    };
                    currentSector.entities.push(torpedo);
                    addTurnEvent(`LAUNCH TORPEDO: [${torpedo.id}] '${ship.name}' -> '${target.name}' [${torpedo.name}]`);
                    const message = generatePlayerTorpedoLaunchLog(target, torpedoData.name, projectileWeapon.ammoType);
                    addLog({ sourceId: 'player', sourceName: ship.name, message, isPlayerSource: true, color: 'border-blue-400', category: 'combat' });
                }
            }
        }
    }

    // Cloaking initiation
    if (playerTurnActions.wantsToCloak) {
        ship.cloakState = 'cloaking';
        ship.cloakTransitionTurnsRemaining = 2;
        ship.pointDefenseEnabled = false; // Cannot have PD up while cloaking
    }
    if (playerTurnActions.wantsToDecloak) {
        ship.cloakState = 'decloaking';
        ship.cloakTransitionTurnsRemaining = 2;
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

    return {
        newNavigationTarget,
        newSelectedTargetId
    };
};