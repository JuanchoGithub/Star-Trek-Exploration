import type { GameState, Ship, TorpedoProjectile, ShipSubsystems, Position, CombatEffect, BeamWeapon, ProjectileWeapon } from '../../../types';
import { calculateDistance, moveOneStep, findClosestTarget, uniqueId } from '../../utils/ai';
import { AIActions, AIStance } from '../FactionAI';
import { shipClasses } from '../../../assets/ships/configs/shipClassStats';
import { torpedoStats } from '../../../assets/projectiles/configs/torpedoTypes';
import { SECTOR_WIDTH, SECTOR_HEIGHT } from '../../../assets/configs/gameConstants';
import { findOptimalMove } from '../pathfinding';
import { generateRecoveryLog, generateStanceLog, generateBeamAttackLog, generateTorpedoLaunchLog } from '../aiLogger';
import { fireBeamWeapon } from '../../utils/combat';

export function determineGeneralStance(ship: Ship, potentialTargets: Ship[]): { stance: AIStance, reason: string } {
    const closestTarget = findClosestTarget(ship, potentialTargets);
    if (!closestTarget || calculateDistance(ship.position, closestTarget.position) > 10) {
        if (ship.hull < ship.maxHull || Object.values(ship.subsystems).some(s => s.health < s.maxHealth) || ship.energy.current < ship.energy.max * 0.9) {
             return { stance: 'Recovery', reason: `No threats nearby. Ship hull is at ${Math.round(ship.hull / ship.maxHull * 100)}% and energy is at ${Math.round(ship.energy.current / ship.energy.max * 100)}%. Entering recovery mode.` };
        }
        return { stance: 'Balanced', reason: `No threats nearby and ship at full capacity. Holding balanced stance.` };
    }

    const shipHealth = ship.hull / ship.maxHull;
    const shipShields = ship.maxShields > 0 ? ship.shields / ship.maxShields : 0;
    const targetShields = closestTarget.maxShields > 0 ? closestTarget.shields / closestTarget.maxShields : 0;
    const targetHealth = closestTarget.hull / closestTarget.maxHull;

    if (shipHealth < 0.25) {
        return { stance: 'Defensive', reason: `Hull critical at ${Math.round(shipHealth * 100)}% (<25%).` };
    }
    if (shipShields < 0.15 && Math.random() < 0.8) {
        return { stance: 'Defensive', reason: `Shields critical at ${Math.round(shipShields * 100)}% (<15%).` };
    }
    if (shipShields > 0.8 && targetShields > 0.8 && Math.random() < 0.8) {
        return { stance: 'Aggressive', reason: `Stalemate detected (Own Shields: ${Math.round(shipShields * 100)}% > 80%, Target Shields: ${Math.round(targetShields * 100)}% > 80%). Pressing the attack.` };
    }
    if (targetShields <= 0.05 && targetHealth < 0.7) {
        return { stance: 'Aggressive', reason: `Target is vulnerable (Shields: ${Math.round(targetShields * 100)}% <= 5%, Hull: ${Math.round(targetHealth * 100)}% < 70%).` };
    }

    return { stance: 'Balanced', reason: 'No special conditions met.' };
}

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
            sourceFaction: ship.faction,
            message: `Has dispatched a boarding party and taken control of the derelict ${derelictToCapture.name}! Emergency repairs have begun.`, 
            isPlayerSource: false,
            color: ship.logColor,
            category: 'special',
        });
        return true; // Action taken
    }
    return false; // No action taken
}

export function processRecoveryTurn(ship: Ship, actions: AIActions, turn: number): void {
    ship.currentTargetId = null;
    // Set energy allocation for recovery
    if (ship.energyAllocation.engines !== 100) {
        ship.energyAllocation = { weapons: 0, shields: 0, engines: 100 };
    }

    // Set repair target if not already set
    if (!ship.repairTarget) {
        const subsystemsToRepair: (keyof ShipSubsystems)[] = [
            'lifeSupport', 'engines', 'weapons', 'shields', 'pointDefense', 'computer', 'transporter', 'shuttlecraft'
        ];
        let mostDamagedSystem: keyof ShipSubsystems | null = null;
        let maxDamagePercent = 0;

        for (const key of subsystemsToRepair) {
            const system = ship.subsystems[key];
            if (system.maxHealth > 0) {
                const damagePercent = 1 - (system.health / system.maxHealth);
                if (damagePercent > maxDamagePercent) {
                    maxDamagePercent = damagePercent;
                    mostDamagedSystem = key;
                }
            }
        }

        if (mostDamagedSystem && maxDamagePercent > 0.01) { // Only repair if there's meaningful damage
            ship.repairTarget = mostDamagedSystem;
        } else if (ship.hull < ship.maxHull) {
            ship.repairTarget = 'hull';
        }
    }
    
    const logMessage = generateRecoveryLog(ship, turn);

    actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: logMessage, isPlayerSource: false, color: ship.logColor, category: 'stance' });
}


export function processCommonTurn(
    ship: Ship, 
    potentialTargets: Ship[], 
    gameState: GameState, 
    actions: AIActions,
    subsystemTarget: keyof ShipSubsystems | null,
    stance: AIStance,
    analysisReason: string,
    defenseActionTaken: string | null
) {
    const primaryTarget = findClosestTarget(ship, potentialTargets);
    ship.currentTargetId = primaryTarget ? primaryTarget.id : null;

    if (!primaryTarget && ship.lastAttackerPosition) {
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `Detecting weapon impacts from an unseen source! Attempting to evade!`, isPlayerSource: false, color: ship.logColor, category: 'movement' });
        
        const fleeVector = {
            x: ship.position.x - ship.lastAttackerPosition.x,
            y: ship.position.y - ship.lastAttackerPosition.y,
        };

        let fleePosition = { ...ship.position };
        if (Math.abs(fleeVector.x) > Math.abs(fleeVector.y)) {
            fleePosition.x += Math.sign(fleeVector.x) || 1;
        } else {
            fleePosition.y += Math.sign(fleeVector.y) || 1;
        }

        fleePosition.x = Math.max(0, Math.min(SECTOR_WIDTH - 1, fleePosition.x));
        fleePosition.y = Math.max(0, Math.min(SECTOR_HEIGHT - 1, fleePosition.y));
        
        ship.position = moveOneStep(ship.position, fleePosition);
        ship.currentTargetId = null;
        ship.lastAttackerPosition = null; 
        return;
    }
    
    ship.lastAttackerPosition = null;

    if (!primaryTarget) {
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: "Holding position, no targets in sight.", isPlayerSource: false, color: ship.logColor, category: 'info' });
        return;
    }

    const { currentSector } = gameState;
    const distance = calculateDistance(ship.position, primaryTarget.position);
    const originalPosition = { ...ship.position };

    // --- CLOAK HANDLING & TACTICAL CHOICE ---
    if (ship.cloakState === 'cloaked') {
        const canLaunchTorpedo = ship.weapons.some(w => w.type === 'projectile' && ship.ammo[(w as ProjectileWeapon).ammoType] && ship.ammo[(w as ProjectileWeapon).ammoType]!.current > 0) && (ship.subsystems.weapons.health / ship.subsystems.weapons.maxHealth) >= 0.34;
        const isGoodTorpedoRange = distance >= 2 && distance <= 8;
        const willFireTorpedo = canLaunchTorpedo && isGoodTorpedoRange && Math.random() < 0.75;

        if (willFireTorpedo) {
            const projectileWeapon = ship.weapons.find(w => w.type === 'projectile') as ProjectileWeapon | undefined;
            if (projectileWeapon) {
                const torpedoData = torpedoStats[projectileWeapon.ammoType];
                ship.ammo[projectileWeapon.ammoType]!.current--;
                if (ship.torpedoes.current > 0) ship.torpedoes.current--;
                const torpedo: TorpedoProjectile = {
                    id: uniqueId(), name: torpedoData.name, type: 'torpedo_projectile', faction: ship.faction,
                    position: { ...ship.position }, targetId: primaryTarget.id, sourceId: ship.id, stepsTraveled: 0,
                    speed: torpedoData.speed, path: [{ ...ship.position }], scanned: true, turnLaunched: gameState.turn, hull: 1, maxHull: 1,
                    torpedoType: projectileWeapon.ammoType, damage: torpedoData.damage, specialDamage: torpedoData.specialDamage,
                };
                currentSector.entities.push(torpedo);
                const message = generateTorpedoLaunchLog(ship, primaryTarget, torpedoData.name);
                actions.addTurnEvent(`LAUNCH TORPEDO: [${torpedo.id}] '${ship.name}' -> '${primaryTarget.name}' [${torpedo.name}]`);
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message, isPlayerSource: false, color: ship.logColor, category: 'combat' });
            }
            return; // End turn after firing torpedo
        }
        
        const shouldDecloak = (distance <= 5 && (ship.hull / ship.maxHull) > 0.4);
        if (shouldDecloak) {
            ship.cloakState = 'decloaking';
            ship.cloakTransitionTurnsRemaining = 2;
        } else {
            if (distance > 1) {
                ship.position = moveOneStep(ship.position, primaryTarget.position);
            }
        }
    }

    // Actions are disabled during cloak/decloak transitions
    if (ship.cloakState === 'cloaking' || ship.cloakState === 'decloaking') {
        return;
    }

    // --- MOVEMENT & LOGGING ---
    const allShipsInSector = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
    const moveResult = findOptimalMove(ship, potentialTargets, gameState, allShipsInSector, stance);
    const moveTarget = moveResult.position;
    
    // Evasive Maneuvers Logic
    if (stance === 'Defensive' && (ship.hull / ship.maxHull) < 0.5) {
        if (!ship.evasive) {
            ship.evasive = true;
        }
    } else {
        if (ship.evasive) {
            ship.evasive = false;
        }
    }

    // Movement
    if (moveTarget) {
        if (ship.subsystems.engines.health < ship.subsystems.engines.maxHealth * 0.5) {
            // Cannot move, log will be handled below
        } else {
            ship.position = moveTarget;
        }
    }
    
    const didMove = ship.position.x !== originalPosition.x || ship.position.y !== originalPosition.y;
    if (didMove) {
        actions.addTurnEvent(`MOVE: '${ship.name}' from (${originalPosition.x},${originalPosition.y}) to (${ship.position.x},${ship.position.y})`);
    } else {
        actions.addTurnEvent(`HOLD: '${ship.name}' at (${originalPosition.x},${originalPosition.y})`);
    }

    // --- WEAPON USAGE DETERMINATION ---
    const beamWeapon = ship.weapons.find(w => w.type === 'beam') as BeamWeapon | undefined;
    const willFirePhasers = beamWeapon && ship.subsystems.weapons.health > 0 && distance <= beamWeapon.range;
    
    const projectileWeapon = ship.weapons.find(w => w.type === 'projectile') as ProjectileWeapon | undefined;
    const canLaunchTorpedo = projectileWeapon && 
                             ship.ammo[projectileWeapon.ammoType] && 
                             ship.ammo[projectileWeapon.ammoType]!.current > 0 &&
                             (ship.subsystems.weapons.health / ship.subsystems.weapons.maxHealth) >= 0.34;

    const targetShields = primaryTarget.maxShields > 0 ? primaryTarget.shields / primaryTarget.maxShields : 0;
    
    let torpedoLaunchChance = 0;
    if (stance === 'Aggressive') { torpedoLaunchChance = targetShields > 0.3 ? 0.75 : 0.4; } 
    else if (stance === 'Balanced') { torpedoLaunchChance = 0.3; }
    
    const willLaunchTorpedo = canLaunchTorpedo && distance <= 8 && Math.random() < torpedoLaunchChance;
    
    // --- BUILD & DISPATCH LOG ---
    const shipsTargetingMe = allShipsInSector.filter(s => s.currentTargetId === ship.id);
    const moveAction = didMove ? 'MOVING' : 'HOLDING';
    const moveRationale = ship.subsystems.engines.health < ship.subsystems.engines.maxHealth * 0.5 ? 'Impulse Engines Offline!' : moveResult.reason;

    const finalLogMessage = generateStanceLog({
        ship, stance, analysisReason, target: primaryTarget, shipsTargetingMe, moveAction, originalPosition, moveRationale, turn: gameState.turn, defenseAction: defenseActionTaken
    });
  
    actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: finalLogMessage, isPlayerSource: false, color: ship.logColor, category: 'stance' });


    // --- ACTION EXECUTION ---
    const phaserDelay = didMove ? 700 : 0;

    // Firing Logic
    if (willFirePhasers && beamWeapon) {
        const attackResult = fireBeamWeapon(primaryTarget, beamWeapon, subsystemTarget, ship, gameState);
        actions.addTurnEvent(`FIRE PHASER: '${ship.name}' -> '${primaryTarget.name}' (Hit: ${attackResult.hit})`);
        gameState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: primaryTarget.id, faction: ship.faction, delay: phaserDelay });
        const message = generateBeamAttackLog(ship, primaryTarget, beamWeapon, attackResult);
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message, isPlayerSource: false, color: ship.logColor, category: 'combat' });
    }
    
    if (willLaunchTorpedo && projectileWeapon) {
        const torpedoData = torpedoStats[projectileWeapon.ammoType];
        if (torpedoData) {
            ship.ammo[projectileWeapon.ammoType]!.current--;
            if (ship.torpedoes.current > 0) ship.torpedoes.current--;
            
            const torpedo: TorpedoProjectile = {
                id: uniqueId(), name: torpedoData.name, type: 'torpedo_projectile', faction: ship.faction,
                position: { ...ship.position }, targetId: primaryTarget.id, sourceId: ship.id, stepsTraveled: 0,
                speed: torpedoData.speed, path: [{ ...ship.position }], scanned: true, turnLaunched: gameState.turn, hull: 1, maxHull: 1,
                torpedoType: projectileWeapon.ammoType,
                damage: torpedoData.damage, specialDamage: torpedoData.specialDamage,
            };
            currentSector.entities.push(torpedo);
            actions.addTurnEvent(`LAUNCH TORPEDO: [${torpedo.id}] '${ship.name}' -> '${primaryTarget.name}' [${torpedo.name}]`);
            const message = generateTorpedoLaunchLog(ship, primaryTarget, torpedoData.name);
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message, isPlayerSource: false, color: ship.logColor, category: 'combat' });
        }
    }
}