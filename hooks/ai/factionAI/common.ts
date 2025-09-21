import type { GameState, Ship, TorpedoProjectile, CombatEffect } from '../../../types';
import { calculateDistance, moveOneStep, uniqueId } from '../aiUtilities';
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
    applyPhaserDamage: (target: Ship, damage: number, subsystem: any, source: Ship, state: GameState) => string[],
    addLog: (log: any) => void
) {
    if (playerShip.cloakState === 'cloaked') {
        addLog({ sourceId: ship.id, sourceName: ship.name, message: "Unable to acquire a target lock on the enemy vessel.", isPlayerSource: false });
        return;
    }

    const { currentSector } = gameState;
    const distance = calculateDistance(ship.position, playerShip.position);
    
    // AI Cloak Handling: If cloaked, the AI's turn is spent either decloaking or repositioning.
    if (ship.cloakState === 'cloaked') {
        // Simple logic: If in range and healthy, decloak to attack next turn.
        const shouldDecloak = (distance <= 5 && (ship.hull / ship.maxHull) > 0.4);
        
        if (shouldDecloak) {
            ship.cloakState = 'visible';
            ship.cloakCooldown = 2; // Standard cooldown after voluntary decloak.
            addLog({ sourceId: ship.id, sourceName: ship.name, message: `Decloaks, preparing to engage!`, isPlayerSource: false });
            return; // Decloaking is the action for this turn. It cannot fire or move further.
        } else {
            // Stay cloaked and reposition.
            if (distance > 1) {
                ship.position = moveOneStep(ship.position, playerShip.position); // Move at tactical speed (1 cell)
                 addLog({ sourceId: ship.id, sourceName: ship.name, message: `Remains cloaked, maneuvering for a better position.`, isPlayerSource: false });
            } else {
                 addLog({ sourceId: ship.id, sourceName: ship.name, message: `Remains cloaked, holding position.`, isPlayerSource: false });
            }
            return; // End turn, stay cloaked.
        }
    }
    
    // Movement
    if (distance > 2) {
        if (ship.subsystems.engines.health < ship.subsystems.engines.maxHealth * 0.5) {
            addLog({ sourceId: ship.id, sourceName: ship.name, message: "Impulse engines are offline, cannot move.", isPlayerSource: false });
        } else {
            ship.position = moveOneStep(ship.position, playerShip.position);

            const asteroidFields = currentSector.entities.filter(e => e.type === 'asteroid_field');
            if (asteroidFields.some(field => calculateDistance(ship.position, field.position) <= 1)) {
                if (Math.random() < 0.20) {
                    const damage = 3 + Math.floor(Math.random() * 5);
                    addLog({ sourceId: 'system', sourceName: 'Sensors', message: `${ship.name} is struck by debris while maneuvering near asteroids!`, isPlayerSource: false, color: 'border-orange-400' });
                    let remainingDamage: number = damage;
                    if (ship.shields > 0) {
                        const absorbed = Math.min(ship.shields, remainingDamage);
                        ship.shields -= absorbed;
                        remainingDamage -= absorbed;
                    }
                    if (remainingDamage > 0) {
                        const roundedDamage = Math.round(remainingDamage);
                        ship.hull = Math.max(0, ship.hull - roundedDamage);
                    }
                }
            }
        }
    }

    // Firing Logic
    const playerTorpedoes = currentSector.entities.filter((e): e is TorpedoProjectile => e.type === 'torpedo_projectile' && e.faction === 'Federation');
    let hasFired = false;
    // Prioritize shooting down torpedoes
    if (playerTorpedoes.length > 0 && ship.subsystems.weapons.health > 0 && Math.random() < 0.75) {
        const torpedoToShoot = playerTorpedoes[0];
        if (calculateDistance(ship.position, torpedoToShoot.position) <= 5) {
            const phaserCost = 5; // Point defense is cheaper
            if (ship.energy.current >= phaserCost) {
                ship.energy.current -= phaserCost;
                gameState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: torpedoToShoot.id, faction: ship.faction, delay: 0 });
                torpedoToShoot.hull = 0;
                addLog({ sourceId: ship.id, sourceName: ship.name, message: `Fires point-defense at an incoming torpedo!\n--> HIT! The torpedo is destroyed!`, isPlayerSource: false });
                hasFired = true;
            }
        }
    }

    if (hasFired) return;

    if (distance <= 7 && !ship.scanned) {
        ship.scanned = true;
        addLog({ sourceId: 'system', sourceName: 'Tactical Alert', message: `Automatically scanned ${ship.name} due to proximity during attack.`, isPlayerSource: false });
    }

    if (ship.subsystems.weapons.health > 0 && distance <= 5) {
        const phaserCost = 10;
        if (ship.energy.current >= phaserCost) {
            ship.energy.current -= phaserCost;
            const combatLogs = applyPhaserDamage(playerShip, 10 * (ship.energyAllocation.weapons / 100), null, ship, gameState);
            gameState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: playerShip.id, faction: ship.faction, delay: 0 });
            combatLogs.forEach(message => addLog({ sourceId: ship.id, sourceName: ship.name, message, isPlayerSource: false }));
        } else {
            addLog({ sourceId: ship.id, sourceName: ship.name, message: "Weapons offline, insufficient power!", isPlayerSource: false });
        }
    }
    
    const canLaunchTorpedo = ship.torpedoes.current > 0 && (ship.subsystems.weapons.health / ship.subsystems.weapons.maxHealth) >= 0.34;

    if (canLaunchTorpedo && distance <= 8 && Math.random() < 0.4) {
        const torpedoCost = 15;
        if (ship.energy.current >= torpedoCost) {
            ship.energy.current -= torpedoCost;
            ship.torpedoes.current--;
            const torpedo: TorpedoProjectile = {
                id: uniqueId(),
                name: 'Enemy Torpedo', type: 'torpedo_projectile', faction: ship.faction,
                position: { ...ship.position }, targetId: playerShip.id, sourceId: ship.id, stepsTraveled: 0,
                speed: 2, path: [{ ...ship.position }], scanned: true, turnLaunched: gameState.turn, hull: 1, maxHull: 1,
            };
            currentSector.entities.push(torpedo);
            addLog({ sourceId: ship.id, sourceName: ship.name, message: `Has launched a torpedo!`, isPlayerSource: false });
        }
    }
}