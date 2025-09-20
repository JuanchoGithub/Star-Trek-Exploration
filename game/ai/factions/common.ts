import type { GameState, Ship, TorpedoProjectile } from '../../../types';
import { calculateDistance, moveOneStep } from '../../utils/ai';
import { AIActions } from '../FactionAI';

export function processCommonTurn(ship: Ship, gameState: GameState, actions: AIActions) {
    const { currentSector } = gameState;
    const playerShip = gameState.player.ship;
    const distance = calculateDistance(ship.position, playerShip.position);
    
    // Movement
    if (distance > 2 && ship.subsystems.engines.health > 0) {
        ship.position = moveOneStep(ship.position, playerShip.position);

        const asteroidFields = currentSector.entities.filter(e => e.type === 'asteroid_field');
        if (asteroidFields.some(field => calculateDistance(ship.position, field.position) <= 1)) {
            if (Math.random() < 0.20) {
                const damage = 3 + Math.floor(Math.random() * 5);
                actions.addLog({ sourceId: 'system', sourceName: 'Sensors', message: `${ship.name} is struck by debris while maneuvering near asteroids!`, isPlayerSource: false, color: 'border-orange-400' });
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

    // Firing Logic
    const playerTorpedoes = currentSector.entities.filter((e): e is TorpedoProjectile => e.type === 'torpedo_projectile' && e.faction === 'Federation');
    let hasFired = false;
    // Prioritize shooting down torpedoes
    if (playerTorpedoes.length > 0 && ship.subsystems.weapons.health > 0 && Math.random() < 0.75) {
        const torpedoToShoot = playerTorpedoes[0];
        if (calculateDistance(ship.position, torpedoToShoot.position) <= 5) {
            gameState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: torpedoToShoot.id, faction: ship.faction, delay: 0 });
            torpedoToShoot.hull = 0;
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Fires point-defense at an incoming torpedo!\n--> HIT! The torpedo is destroyed!`, isPlayerSource: false });
            hasFired = true;
        }
    }

    if (hasFired) return;

    if (distance <= 7 && !ship.scanned) {
        ship.scanned = true;
        actions.addLog({ sourceId: 'system', sourceName: 'Tactical Alert', message: `Automatically scanned ${ship.name} due to proximity during attack.`, isPlayerSource: false });
    }

    if (ship.subsystems.weapons.health > 0 && distance <= 5) {
        const combatLogs = actions.applyPhaserDamage(playerShip, 10 * (ship.energyAllocation.weapons / 100), null, ship, gameState);
        gameState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: playerShip.id, faction: ship.faction, delay: 0 });
        combatLogs.forEach(message => actions.addLog({ sourceId: ship.id, sourceName: ship.name, message, isPlayerSource: false }));
    }
    
    if (ship.torpedoes.current > 0 && ship.subsystems.weapons.health > 0 && distance <= 8 && Math.random() < 0.4) {
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
