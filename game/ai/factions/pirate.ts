import type { GameState, Ship, ShipSubsystems, TorpedoProjectile } from '../../../types';
// FIX: Added AIStance to import
import { FactionAI, AIActions, AIStance } from '../FactionAI';
import { processCommonTurn, tryCaptureDerelict, determineGeneralStance, processRecoveryTurn } from './common';
// FIX: Imported 'calculateDistance' to resolve a reference error.
import { calculateDistance, findClosestTarget } from '../../utils/ai';

export class PirateAI extends FactionAI {
    // FIX: Corrected method signature to match the abstract class and updated logic to use potentialTargets.
    determineStance(ship: Ship, potentialTargets: Ship[]): { stance: AIStance, reason: string } {
        const generalStance = determineGeneralStance(ship, potentialTargets);
        if (generalStance.stance !== 'Balanced') {
            return generalStance;
        }

        const target = findClosestTarget(ship, potentialTargets);
        if (!target) {
            return { stance: 'Balanced', reason: 'No targets detected.' };
        }

        const shipHealth = ship.hull / ship.maxHull;
        const targetHealth = target.hull / target.maxHull;

        if (shipHealth < 0.6) {
            return { stance: 'Defensive', reason: `Own hull is below 60% (${Math.round(shipHealth * 100)}%).` };
        }
        if (targetHealth < 0.4) {
            return { stance: 'Aggressive', reason: `Target hull is weak (${Math.round(targetHealth * 100)}% < 40%). Pressing the attack!` };
        }

        return { stance: 'Balanced', reason: generalStance.reason + ' Maintaining balanced attack pattern.' };
    }

    // FIX: Implemented missing abstract method 'determineSubsystemTarget' to satisfy FactionAI.
    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        // Pirates target transporters to prevent boarding parties, which might capture their loot.
        if (playerShip.subsystems.transporter.health > 0) {
            return 'transporter';
        }
        // Fallback to weapons if transporter is down.
        if (playerShip.subsystems.weapons.health > 0) {
            return 'weapons';
        }
        return null; // Target hull as a last resort.
    }

    handleTorpedoThreat(ship: Ship, gameState: GameState, actions: AIActions, incomingTorpedoes: TorpedoProjectile[]): boolean {
        // Pirates with an unstable cloak will gamble
        if (ship.cloakingCapable && ship.cloakState === 'visible' && ship.cloakCooldown <= 0) {
            ship.cloakState = 'cloaking';
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Detects incoming torpedoes! Attempting to engage makeshift cloaking device!` });
            return true; // Cloaking is a turn-ending action
        }
        
        // Fallback to point defense
        if (ship.subsystems.pointDefense.health > 0 && !ship.pointDefenseEnabled) {
            ship.pointDefenseEnabled = true;
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Cloak unavailable! Activating point-defense grid.` });
        }
        return false;
    }

    // FIX: Corrected processTurn to accept potentialTargets and pass them to processCommonTurn.
    executeMainTurnLogic(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[]): void {
        if (tryCaptureDerelict(ship, gameState, actions)) {
            return; // Turn spent capturing
        }
        
        const { stance, reason } = this.determineStance(ship, potentialTargets);
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Stance analysis: ${reason}` });

        if (stance === 'Recovery') {
            processRecoveryTurn(ship, actions);
            return;
        }

        const target = findClosestTarget(ship, potentialTargets);
        if (target) {
            const subsystemTarget = this.determineSubsystemTarget(ship, target);

            switch (stance) {
                case 'Aggressive':
                    if (ship.energyAllocation.weapons !== 70) {
                        ship.energyAllocation = { weapons: 70, shields: 30, engines: 0 };
                    }
                    break;
                case 'Defensive':
                    if (ship.energyAllocation.shields !== 80) {
                        ship.energyAllocation = { weapons: 20, shields: 80, engines: 0 };
                    }
                    break;
                case 'Balanced':
                    if (ship.energyAllocation.weapons !== 50) {
                        ship.energyAllocation = { weapons: 50, shields: 50, engines: 0 };
                    }
                    break;
            }
            
            // FIX: Added the missing 'stance' argument to the processCommonTurn call to resolve the "Expected 6 arguments, but got 5" error.
            processCommonTurn(ship, potentialTargets, gameState, actions, subsystemTarget, stance);
        } else {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Holding position, no targets in sight.`, isPlayerSource: false });
        }
    }

    // FIX: Replaced `getDesperationMove` with `processDesperationMove` and implemented the self-destruct logic.
    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
        const allShips = [gameState.player.ship, ...gameState.currentSector.entities.filter(e => e.type === 'ship')] as Ship[];
        const adjacentShips = allShips.filter(s => s.id !== ship.id && calculateDistance(ship.position, s.position) <= 1);
        
        actions.triggerDesperationAnimation({ source: ship, type: 'self_destruct' });

        let logMessage = `"${ship.name}" overloads its reactor! The ship explodes violently!`;
        
        adjacentShips.forEach(target => {
            const shieldPercent = target.maxShields > 0 ? target.shields / target.maxShields : 0;
            const shieldDamageMultiplier = shieldPercent < 0.2 ? 1.0 : 0.8;
            const hullDamageMultiplier = shieldPercent < 0.2 ? 0.4 : 0.2;
            const shieldDamage = target.maxShields * shieldDamageMultiplier;
            const hullDamage = target.maxHull * hullDamageMultiplier;
            
            target.shields = Math.max(0, target.shields - shieldDamage);
            target.hull = Math.max(0, target.hull - hullDamage);
            logMessage += `\n--> "${target.name}" is caught in the blast!`;
        });
        
        actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: logMessage });
        ship.hull = 0;
    }
}
