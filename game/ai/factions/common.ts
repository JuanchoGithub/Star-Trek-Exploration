
import type { GameState, Ship, TorpedoProjectile, CombatEffect } from '../../../types';
import { calculateDistance, moveOneStep } from '../../utils/ai';
import { AIActions } from '../FactionAI';

export function tryCaptureDerelict(ship: Ship, gameState: GameState, actions: AIActions): boolean {
    const allEntities = [...gameState.currentSector.entities, gameState.player.ship];
    const adjacentDerelicts = allEntities.filter((e): e is Ship => 
        e.type === 'ship' &&
        e.isDerelict &&
        !e.captureInfo &&
        calculateDistance(ship.position, e.position) <= 1
    );

    if (adjacentDerelicts.length > 0) {
        const derelictToCapture = adjacentDerelicts[0];
        derelictToCapture.faction = ship.faction;
        derelictToCapture.logColor = ship.logColor;
        derelictToCapture.isDerelict = false;
        derelictToCapture.captureInfo = { captorId: ship.id, repairTurn: gameState.turn };
        
        actions.addLog({ 
            sourceId: ship.id, 
            sourceName: ship.name, 
            message: `Has dispatched a boarding party and taken control of the derelict ${derelictToCapture.name}! Emergency repairs have begun.`, 
            isPlayerSource: false 
        });
        return true; // Action taken
    }
    return false; // No action taken
}

export function processCommonTurn(
    ship: Ship, 
    playerShip: Ship, 
    gameState: GameState, 
    actions: AIActions
) {
    if (playerShip.cloakState === 'cloaked') {
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: "Unable to acquire a target lock on the enemy vessel.", isPlayerSource: false });
        return;
    }

    const { currentSector } = gameState;
    const distance = calculateDistance(ship.position, playerShip.position);
    
    if (ship.cloakState === 'cloaked') {
        const shouldDecloak = (distance <= 5 && (ship.hull / ship.maxHull) > 0.4);
        
        if (shouldDecloak) {
            ship.cloakState = 'visible';
            ship.cloakCooldown = 2;
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Decloaks, preparing to engage!`, isPlayerSource: false });
            return;
        } else {
            if (distance > 1) {
                ship.position = moveOneStep(ship.position, playerShip.position);
                 actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Remains cloaked, maneuvering for a better position.`, isPlayerSource: false });
            } else {
                 actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Remains cloaked, holding position.`, isPlayerSource: false });
            }
            return;
        }
    }
    
    if (distance > 2) {
        if (ship.subsystems.engines.health < ship.subsystems.engines.maxHealth * 0.5) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: "Impulse engines are offline, cannot move.", isPlayerSource: false });
        } else {
            ship.position = moveOneStep(ship.position, playerShip.position);
        }
    }

    const playerTorpedoes = currentSector.entities.filter((e): e is TorpedoProjectile => e.type === 'torpedo_projectile' && e.faction === 'Federation');
    let hasFired = false;
    if (playerTorpedoes.length > 0 && ship.subsystems.weapons.health > 0 && Math.random() < 0.75) {
        const torpedoToShoot = playerTorpedoes[0];
        if (calculateDistance(ship.position, torpedoToShoot.position) <= 5) {
            const phaserCost = 5;
            if (ship.energy.current >= phaserCost) {
                ship.energy.current -= phaserCost;
                gameState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: torpedoToShoot.id, faction: ship.faction, delay: 0 });
                torpedoToShoot.hull = 0;
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Fires point-defense at an incoming torpedo!\n--> HIT! The torpedo is destroyed!`, isPlayerSource: false });
                hasFired = true;
            }
        }
    }

    if (hasFired) return;

    if (ship.subsystems.weapons.health > 0 && distance <= 5) {
        const phaserCost = 10;
        if (ship.energy.current >= phaserCost) {
            ship.energy.current -= phaserCost;
            const combatLogs = actions.applyPhaserDamage(playerShip, 10 * (ship.energyAllocation.weapons / 100), null, ship, gameState);
            gameState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: playerShip.id, faction: ship.faction, delay: 0 });
            combatLogs.forEach(message => actions.addLog({ sourceId: ship.id, sourceName: ship.name, message, isPlayerSource: false }));
        }
    }
    
    const canLaunchTorpedo = ship.torpedoes.current > 0 && (ship.subsystems.weapons.health / ship.subsystems.weapons.maxHealth) >= 0.34;

    if (canLaunchTorpedo && distance <= 8 && Math.random() < 0.4) {
        const torpedoCost = 15;
        if (ship.energy.current >= torpedoCost) {
            ship.energy.current -= torpedoCost;
            ship.torpedoes.current--;
            const torpedo: TorpedoProjectile = {
                id: `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`,
                name: 'Enemy Torpedo', type: 'torpedo_projectile', faction: ship.faction,
                position: { ...ship.position }, targetId: playerShip.id, sourceId: ship.id, stepsTraveled: 0,
                speed: 2, path: [{ ...ship.position }], scanned: true, turnLaunched: gameState.turn, hull: 1, maxHull: 1,
            };
            currentSector.entities.push(torpedo);
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Has launched a torpedo!`, isPlayerSource: false });
        }
    }
}
