import type { GameState, Ship, ShipSubsystems } from '../../../types';
import { AIActions, FactionAI, AIStance } from '../FactionAI';
import { processCommonTurn, tryCaptureDerelict, processPointDefenseForAI } from './common';

export class RomulanAI extends FactionAI {
    determineStance(ship: Ship, playerShip: Ship): AIStance {
        // Romulans are tactical and cautious.
        const shipHealth = ship.hull / ship.maxHull;

        if (shipHealth < 0.5) {
            return 'Defensive'; // Preserve the ship if significantly damaged.
        }
        if (playerShip.shields <= 0) {
            return 'Aggressive'; // Exploit a critical weakness.
        }
        return 'Balanced';
    }

    determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null {
        // Romulans target engines to disable and control the engagement.
        if (playerShip.subsystems.engines.health > 0) {
            return 'engines';
        }
        return null; // Target hull if engines are already destroyed.
    }

    processTurn(ship: Ship, gameState: GameState, actions: AIActions): void {
        if (tryCaptureDerelict(ship, gameState, actions)) {
            return; // Turn spent capturing
        }
        
        const hasHostiles = gameState.player.ship.hull > 0;
        if (hasHostiles && !ship.pointDefenseEnabled) {
            ship.pointDefenseEnabled = true;
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Activating point-defense grid.`, isPlayerSource: false });
        } else if (!hasHostiles && ship.pointDefenseEnabled) {
            ship.pointDefenseEnabled = false;
        }

        processPointDefenseForAI(ship, gameState, actions);
        
        const stance = this.determineStance(ship, gameState.player.ship);
        const subsystemTarget = this.determineSubsystemTarget(ship, gameState.player.ship);
        let stanceChanged = false;

        switch (stance) {
            case 'Aggressive':
                if (ship.energyAllocation.weapons !== 70) {
                    ship.energyAllocation = { weapons: 70, shields: 30, engines: 0 };
                    stanceChanged = true;
                }
                break;
            case 'Defensive':
                if (ship.energyAllocation.shields !== 80) {
                    ship.energyAllocation = { weapons: 20, shields: 80, engines: 0 };
                    stanceChanged = true;
                }
                break;
            case 'Balanced':
                if (ship.energyAllocation.weapons !== 50) {
                    ship.energyAllocation = { weapons: 50, shields: 50, engines: 0 };
                    stanceChanged = true;
                }
                break;
        }
        
        if (stanceChanged) {
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `Adjusting power distribution for a ${stance.toLowerCase()} posture.`, isPlayerSource: false });
        }
        
        processCommonTurn(ship, gameState.player.ship, gameState, actions, subsystemTarget);
    }

    processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void {
        // Romulans try to escape. 30% chance of failure.
        const escapeFails = Math.random() < 0.3;

        if (escapeFails) {
            actions.triggerDesperationAnimation({ source: ship, type: 'escape', outcome: 'failure' });
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" attempts an unstable warp jump to escape... but the core breaches! The ship is destroyed!` });
            ship.hull = 0;
        } else {
            actions.triggerDesperationAnimation({ source: ship, type: 'escape', outcome: 'success' });
            actions.addLog({ sourceId: ship.id, sourceName: ship.name, message: `"${ship.name}" attempts an unstable warp jump... and vanishes! They've escaped!` });
            
            gameState.currentSector.entities = gameState.currentSector.entities.filter(e => e.id !== ship.id);
        }
    }
}