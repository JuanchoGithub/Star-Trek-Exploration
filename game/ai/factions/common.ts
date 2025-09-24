
import type { GameState, Ship, TorpedoProjectile, ShipSubsystems, Position, CombatEffect } from '../../../types';
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

export function processRecoveryTurn(ship: Ship, actions: AIActions): void {
    // Set energy allocation for recovery
    if (ship.energyAllocation.engines !== 100) {
        ship.energyAllocation = { weapons: 0, shields: 0, engines: 100 };
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `No threats nearby. Diverting all power to engines for energy recovery.` });
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
    let aiDecisionLog = `Adopting '${stance}' stance against ${target.name} (Dist: ${distance}).`;

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

            if (isBlocked) {
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Movement blocked by another vessel.`, isPlayerSource: false, color: ship.logColor });
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
