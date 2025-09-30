import type { GameState, Ship, ShipSubsystems, TorpedoProjectile, BeamWeapon, BeamAttackResult } from '../../types';

// Defines a set of actions the AI can perform that will mutate the game state.
export interface AIActions {
    addLog: (log: any) => void;
    fireBeamWeapon: (target: Ship, weapon: BeamWeapon, subsystem: any, source: Ship, state: GameState) => BeamAttackResult;
    triggerDesperationAnimation: (animation: { source: Ship; target?: Ship; type: string; outcome?: 'success' | 'failure' }) => void;
    addTurnEvent: (event: string) => void;
}

export type AIStance = 'Aggressive' | 'Defensive' | 'Balanced' | 'Recovery';

// Abstract base class for all faction-specific AI.
export abstract class FactionAI {
    // Determines the ship's combat stance for the current turn.
    abstract determineStance(ship: Ship, potentialTargets: Ship[]): { stance: AIStance, reason: string };

    // Determines which subsystem to target, if any.
    abstract determineSubsystemTarget(ship: Ship, playerShip: Ship): keyof ShipSubsystems | null;
    
    // NEW abstract method for torpedo defense
    abstract handleTorpedoThreat(ship: Ship, gameState: GameState, actions: AIActions, incomingTorpedoes: TorpedoProjectile[]): { turnEndingAction: boolean, defenseActionTaken: string | null };
    
    // NEW abstract method for the main turn logic
    abstract executeMainTurnLogic(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[], defenseActionTaken: string | null): void;

    // The main turn processing method, now in the base class to enforce order of operations.
    public processTurn(ship: Ship, gameState: GameState, actions: AIActions, potentialTargets: Ship[]): void {
        // A ship in transition cannot take any actions. The log for this is now generated at the end of turn.
        if (ship.cloakState === 'cloaking' || ship.cloakState === 'decloaking') {
            return;
        }

        const incomingTorpedoes = (gameState.currentSector.entities.filter(e => e.type === 'torpedo_projectile') as TorpedoProjectile[]).filter(t => t.targetId === ship.id);

        let defenseActionTaken: string | null = null;
        if (incomingTorpedoes.length > 0) {
            const defenseResult = this.handleTorpedoThreat(ship, gameState, actions, incomingTorpedoes);
            defenseActionTaken = defenseResult.defenseActionTaken;
            if (defenseResult.turnEndingAction) {
                // The defensive action (e.g., cloaking) uses the whole turn.
                return; 
            }
        } else {
            // If there are no torpedoes, ensure point defense is off to conserve power.
            if (ship.pointDefenseEnabled) {
                ship.pointDefenseEnabled = false;
                actions.addLog({ sourceId: ship.id, sourceName: ship.name, sourceFaction: ship.faction, message: `Torpedo threat has passed. Deactivating point-defense grid to conserve power.`, isPlayerSource: false, color: ship.logColor, category: 'system' });
            }
        }
        
        // Execute the main logic for the turn
        this.executeMainTurnLogic(ship, gameState, actions, potentialTargets, defenseActionTaken);
    }
    
    // This method will execute the desperation move.
    abstract processDesperationMove(ship: Ship, gameState: GameState, actions: AIActions): void;
}