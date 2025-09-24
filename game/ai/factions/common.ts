import type { GameState, Ship, TorpedoProjectile, ShipSubsystems, Position, CombatEffect } from '../../../types';
import { calculateDistance, moveOneStep, findClosestTarget, uniqueId } from '../../utils/ai';
import { AIActions, AIStance } from '../FactionAI';
import { shipClasses } from '../../../assets/ships/configs/shipClassStats';
import { torpedoStats } from '../../../assets/projectiles/configs/torpedoTypes';
import { isPosInNebula } from '../../utils/sector';
import { SECTOR_WIDTH, SECTOR_HEIGHT } from '../../../assets/configs/gameConstants';

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
            message: `Has dispatched a boarding party and taken control of the derelict ${derelictToCapture.name}! Emergency repairs have begun.`, 
            isPlayerSource: false,
            color: ship.logColor,
        });
        return true; // Action taken
    }
    return false; // No action taken
}

export function processRecoveryTurn(ship: Ship, actions: AIActions): void {
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
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Beginning repairs on the damaged ${mostDamagedSystem} system.` });
        } else if (ship.hull < ship.maxHull) {
            ship.repairTarget = 'hull';
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `All systems nominal. Beginning hull repairs.` });
        }
    }
    // Ship does not move or attack in recovery mode.
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
    const originalPosition = { ...ship.position };
    
    // --- AI DECISION MAKING & LOGGING ---
    let moveTarget: Position | null = null;
    let aiDecisionLog = `Targeting ${target.name} (Dist: ${distance}).`;

    // Movement decision
    if (stance === 'Aggressive' && distance > 2) {
        moveTarget = target.position;
        aiDecisionLog += ' Closing to attack range.';
    } else if (stance === 'Defensive' && distance < 6) {
        moveTarget = { 
            x: ship.position.x + (ship.position.x - target.position.x),
            y: ship.position.y + (ship.position.y - target.position.y)
        };
        aiDecisionLog += ' Attempting to open range.';
    } else if (stance === 'Balanced' && distance > 3) {
        moveTarget = target.position;
        aiDecisionLog += ' Moving to optimal range.';
    } else {
        aiDecisionLog += ' Holding position.';
    }
    
    // Targeting decision
    if (subsystemTarget) {
        aiDecisionLog += ` Targeting ${subsystemTarget}.`;
    } else {
        aiDecisionLog += ' Targeting hull.';
    }
    actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: aiDecisionLog, isPlayerSource: false, color: ship.logColor });

    // --- ACTION EXECUTION ---
    
    // Evasive Maneuvers Logic
    if (stance === 'Defensive' && (ship.hull / ship.maxHull) < 0.5) {
        if (!ship.evasive) {
            ship.evasive = true;
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Taking evasive maneuvers!`, isPlayerSource: false, color: ship.logColor });
        }
    } else {
        if (ship.evasive) {
            ship.evasive = false;
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Ceasing evasive maneuvers.`, isPlayerSource: false, color: ship.logColor });
        }
    }

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
    if (moveTarget) {
        if (ship.subsystems.engines.health < ship.subsystems.engines.maxHealth * 0.5) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: "Impulse engines are offline, cannot move.", isPlayerSource: false, color: ship.logColor });
        } else {
            const nextStep = moveOneStep(ship.position, moveTarget);
            const allShipsInSector = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
            const isBlocked = allShipsInSector.some(s => s.id !== ship.id && s.position.x === nextStep.x && s.position.y === nextStep.y);
            const isValidPosition = nextStep.x >= 0 && nextStep.x < SECTOR_WIDTH && nextStep.y >= 0 && nextStep.y < SECTOR_HEIGHT;

            if (isBlocked) {
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Movement blocked by another vessel.`, isPlayerSource: false, color: ship.logColor });
            } else if (!isValidPosition) {
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holds position at the edge of the sector, cannot move further.`, isPlayerSource: false, color: ship.logColor });
            } else {
                ship.position = nextStep;
            }
        }
    }

    const didMove = ship.position.x !== originalPosition.x || ship.position.y !== originalPosition.y;
    const phaserDelay = didMove ? 700 : 0;

    // Firing Logic
    if (ship.subsystems.weapons.health > 0 && distance <= 5) {
        const phaserBaseDamage = 20 * ship.energyModifier;
        const phaserPowerModifier = ship.energyAllocation.weapons / 100;
        const finalDamage = phaserBaseDamage * phaserPowerModifier;
        
        const combatLogs = actions.applyPhaserDamage(target, finalDamage, subsystemTarget, ship, gameState);
        gameState.combatEffects.push({ type: 'phaser', sourceId: ship.id, targetId: target.id, faction: ship.faction, delay: phaserDelay });
        combatLogs.forEach(message => actions.addLog({ sourceId: ship.id, sourceName: ship.name, message, isPlayerSource: false, color: ship.logColor }));
    }
    
    const canLaunchTorpedo = ship.torpedoes.current > 0 && (ship.subsystems.weapons.health / ship.subsystems.weapons.maxHealth) >= 0.34;
    const targetShields = target.maxShields > 0 ? target.shields / target.maxShields : 0;
    
    let torpedoLaunchChance = 0;
    if (stance === 'Aggressive') {
        torpedoLaunchChance = targetShields > 0.3 ? 0.75 : 0.4; // High chance if shields are up
    } else if (stance === 'Balanced') {
        torpedoLaunchChance = 0.3;
    }

    if (canLaunchTorpedo && distance <= 8 && Math.random() < torpedoLaunchChance) {
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