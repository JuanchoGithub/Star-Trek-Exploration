
import type { GameState, Ship, TorpedoProjectile, ShipSubsystems, CombatEffect } from '../../../types';
import { calculateDistance, moveOneStep, findClosestTarget, uniqueId } from '../../utils/ai';
import { AIActions, AIStance } from '../FactionAI';
import { shipClasses } from '../../../assets/ships/configs/shipClassStats';
import { torpedoStats } from '../../../assets/projectiles/configs/torpedoTypes';
import { isPosInNebula } from '../../utils/sector';

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
            isPlayerSource: false,
            color: ship.logColor,
        });
        return true; // Action taken
    }
    return false; // No action taken
}

export function processCommonTurn(
    ship: Ship, 
    potentialTargets: Ship[], 
    gameState: GameState, 
    actions: AIActions,
    subsystemTarget: keyof ShipSubsystems | null,
    stance: AIStance
) {
    const target = findClosestTarget(ship, potentialTargets);
    if (!target) {
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: "Holding position, no targets in sight.", isPlayerSource: false, color: ship.logColor });
        return;
    }

    const { currentSector } = gameState;
    const distance = calculateDistance(ship.position, target.position);
    
    // Cloak Handling
    if (ship.cloakState === 'cloaked') {
        const shouldDecloak = (distance <= 5 && (ship.hull / ship.maxHull) > 0.4);
        if (shouldDecloak) {
            ship.cloakState = 'visible';
            ship.cloakCooldown = 2;
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Decloaks, preparing to engage!`, isPlayerSource: false, color: ship.logColor });
            return;
        } else {
            if (distance > 1) {
                ship.position = moveOneStep(ship.position, target.position);
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Remains cloaked, maneuvering for a better position.`, isPlayerSource: false, color: ship.logColor });
            } else {
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Remains cloaked, holding position.`, isPlayerSource: false, color: ship.logColor });
            }
            return;
        }
    }
    
    // Movement
    if (distance > 2) {
        if (ship.subsystems.engines.health < ship.subsystems.engines.maxHealth * 0.5) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: "Impulse engines are offline, cannot move.", isPlayerSource: false, color: ship.logColor });
        } else {
            ship.position = moveOneStep(ship.position, target.position);
        }
    }

    // Firing Logic
    const enemyTorpedoes = currentSector.entities.filter((e): e is TorpedoProjectile => e.type === 'torpedo_projectile' && e.faction !== ship.faction);
    let hasFired = false;
    
    if (ship.pointDefenseEnabled && enemyTorpedoes.length > 0) {
        const torpedoToShoot = enemyTorpedoes.sort((a,b) => calculateDistance(ship.position, a.position) - calculateDistance(ship.position, b.position))[0];
        if (torpedoToShoot && calculateDistance(ship.position, torpedoToShoot.position) <= 1) {
            const hitChance = ship.subsystems.pointDefense.health / ship.subsystems.pointDefense.maxHealth;
            if (Math.random() < hitChance) {
                gameState.combatEffects.push({ type: 'point_defense', sourceId: ship.id, targetId: torpedoToShoot.id, faction: ship.faction, delay: 0 });
                torpedoToShoot.hull = 0;
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Point-defense system has intercepted an incoming torpedo!`, isPlayerSource: false, color: ship.logColor });
                hasFired = true;
            }
        }
    }

    if (hasFired) return;

    if (ship.subsystems.weapons.health > 0 && distance <= 5) {
        const phaserBaseDamage = 20 * ship.energyModifier;
        const phaserPowerModifier = ship.energyAllocation.weapons / 100;
        const finalDamage = phaserBaseDamage * phaserPowerModifier;
        
        const combatLogs = actions.applyPhaserDamage(target, finalDamage, subsystemTarget, ship, gameState);
        gameState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: target.id, faction: ship.faction, delay: 0 });
        combatLogs.forEach(message => actions.addLog({ sourceId: ship.id, sourceName: ship.name, message, isPlayerSource: false, color: ship.logColor }));
    }
    
    const canLaunchTorpedo = ship.torpedoes.current > 0 && (ship.subsystems.weapons.health / ship.subsystems.weapons.maxHealth) >= 0.34;

    if (canLaunchTorpedo && distance <= 8 && Math.random() < 0.4) {
        const shipStats = shipClasses[ship.shipModel][ship.shipClass];
        if (shipStats.torpedoType === 'None') return;
        const torpedoData = torpedoStats[shipStats.torpedoType];

        ship.torpedoes.current--;
        const torpedo: TorpedoProjectile = {
            id: uniqueId(), name: torpedoData.name, type: 'torpedo_projectile', faction: ship.faction,
            position: { ...ship.position }, targetId: target.id, sourceId: ship.id, stepsTraveled: 0,
            speed: torpedoData.speed, path: [{ ...ship.position }], scanned: true, turnLaunched: gameState.turn, hull: 1, maxHull: 1,
            torpedoType: shipStats.torpedoType, damage: torpedoData.damage, specialDamage: torpedoData.specialDamage,
        };
        currentSector.entities.push(torpedo);
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Has launched a ${torpedoData.name}!`, isPlayerSource: false, color: ship.logColor });
    }
}
