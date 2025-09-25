import { SAVE_GAME_KEY } from '../../assets/configs/gameConstants';
import { GameState, ShipSubsystems } from '../../types';
import { createInitialGameState } from './initialization';
import { shipClasses } from '../../assets/ships/configs/shipClassStats';

/**
 * The master migration function. It takes any saved game object and iteratively applies
 * all necessary transformations to bring it up to the latest GameState version.
 * This ensures that save files from any previous version can be safely loaded.
 * @param savedState The raw, parsed JSON object from a save file.
 * @returns A valid GameState object conforming to the latest type definitions.
 */
export const migrateSaveData = (savedState: any): GameState => {
    // Basic validation
    if (!savedState || !savedState.player || !savedState.turn) {
        throw new Error("Invalid save data structure: Missing player, turn, or root object.");
    }
    
    // Start with a deep copy to avoid mutating the original object.
    const state: GameState = JSON.parse(JSON.stringify(savedState));

    // ========= START MIGRATION PIPELINE =========
    // Each block of code should represent a migration from one version to the next.

    // Migration: Add basic fields if missing from very old saves
    if ((state.player as any).boardingParty) delete (state.player as any).boardingParty;
    if (!state.player.ship.securityTeams) state.player.ship.securityTeams = { current: 3, max: 3 };
    if (state.player.ship.repairTarget === undefined) state.player.ship.repairTarget = null;
    if (!state.player.ship.subsystems.transporter) state.player.ship.subsystems.transporter = { health: 100, maxHealth: 100 };
    if (!state.player.targeting) { delete state.player.targeting; } else if (!state.player.targeting.consecutiveTurns) { state.player.targeting.consecutiveTurns = 1; }
    if (state.isRetreatingWarp === undefined) state.isRetreatingWarp = false;
    if (state.usedAwayMissionSeeds === undefined) state.usedAwayMissionSeeds = [];
    if (state.usedAwayMissionTemplateIds === undefined) state.usedAwayMissionTemplateIds = [];
    if (state.desperationMoveAnimations === undefined) state.desperationMoveAnimations = [];
    if (state.orbitingPlanetId === undefined) state.orbitingPlanetId = null;
    if (state.player.ship.engineFailureTurn === undefined) state.player.ship.engineFailureTurn = null;
    if (state.player.ship.lifeSupportFailureTurn === undefined) state.player.ship.lifeSupportFailureTurn = null;
    if (state.player.ship.statusEffects === undefined) state.player.ship.statusEffects = [];
    if (state.player.ship.pointDefenseEnabled === undefined) state.player.ship.pointDefenseEnabled = false;
    if (state.player.ship.lastAttackerPosition === undefined) state.player.ship.lastAttackerPosition = null;
    if (state.replayHistory === undefined) state.replayHistory = [];

    // Migration: Rename 'scanners' subsystem to 'pointDefense'
    const migrateSubsystems = (subsystems: any) => {
        if (subsystems && (subsystems as any).scanners) {
            (subsystems as any).pointDefense = (subsystems as any).scanners;
            delete (subsystems as any).scanners;
        }
    };
    
    const migrateShip = (ship: any) => {
        migrateSubsystems(ship.subsystems);
        if (!ship.dilithium) { // Migration: Add dilithium to old ship saves
            const stats = shipClasses[ship.shipModel]?.[ship.shipClass];
            ship.dilithium = { current: stats?.dilithium.max || 0, max: stats?.dilithium.max || 0 };
        }
        if (ship.lastAttackerPosition === undefined) {
            ship.lastAttackerPosition = null;
        }
        if (ship.shieldReactivationTurn === undefined) {
            ship.shieldReactivationTurn = null;
        }
        if (ship.cloakInstability === undefined) {
            ship.cloakInstability = 0;
        }
        if (ship.cloakDestabilizedThisTurn === undefined) {
            ship.cloakDestabilizedThisTurn = false;
        }
    };
    
    migrateShip(state.player.ship);
    
    state.quadrantMap.forEach(row => row.forEach(sector => {
        sector.entities.forEach(entity => {
            if (entity.type === 'ship') {
                migrateShip(entity);
            }
        });
    }));
    
    if (state.currentSector.entities) {
        state.currentSector.entities.forEach(entity => {
            if (entity.type === 'ship') {
                migrateShip(entity);
            }
        });
    }

    if ((state.player.ship.repairTarget as unknown) === 'scanners') {
        state.player.ship.repairTarget = 'pointDefense';
    }
    if (state.player.targeting && (state.player.targeting.subsystem as unknown) === 'scanners') {
        state.player.targeting.subsystem = 'pointDefense';
    }

    // Migration: Add seed/templateId/nebulaCells to legacy sectors
    const migrateSectorData = (sector: any) => {
        if (!sector.seed) sector.seed = `legacy_${Math.random().toString(36).substring(2, 11)}`;
        if (!sector.templateId) sector.templateId = 'unknown_legacy';
        if (sector.hasNebula && !sector.nebulaCells) {
            const cells = new Set<string>();
            const percentage = 0.3 + Math.random() * 0.4;
            const targetCount = Math.floor(12 * 10 * percentage);
            while(cells.size < targetCount) {
                const x = Math.floor(Math.random() * 12);
                const y = Math.floor(Math.random() * 10);
                cells.add(`${x},${y}`);
            }
            sector.nebulaCells = Array.from(cells).map(s => {
                const [x, y] = s.split(',').map(Number);
                return { x, y };
            });
        }
        if (!sector.nebulaCells) sector.nebulaCells = [];
    };

    state.quadrantMap.forEach(row => row.forEach(migrateSectorData));
    migrateSectorData(state.currentSector);

    // ========= END MIGRATION PIPELINE =========
    return state as GameState;
};

/**
 * Saves the provided game state to the browser's local storage.
 * @param gameState The current, valid game state object.
 * @returns True if saving was successful, false otherwise.
 */
export const saveGameToLocalStorage = (gameState: GameState): boolean => {
    try {
        localStorage.setItem(SAVE_GAME_KEY, JSON.stringify(gameState));
        return true;
    } catch (error) {
        console.error("Failed to save game to local storage:", error);
        return false;
    }
};

/**
 * Loads a game state from local storage. If a save exists, it is parsed and migrated.
 * @param options.createNewIfNotFound If true, will return a new game state if no save is found. If false, will return null.
 * @returns The loaded and migrated GameState, a new GameState, or null.
 */
export const loadGameFromLocalStorage = (options: { createNewIfNotFound: boolean }): GameState | null => {
    const savedStateJSON = localStorage.getItem(SAVE_GAME_KEY);
    if (savedStateJSON) {
        try {
            const savedState = JSON.parse(savedStateJSON);
            return migrateSaveData(savedState);
        } catch (e) {
            console.error("Could not parse or migrate saved state from local storage.", e);
        }
    }
    
    if (options.createNewIfNotFound) {
        return createInitialGameState();
    }
    
    return null;
};

/**
 * Triggers a browser download of the current game state as a JSON file.
 * @param gameState The current, valid game state object.
 * @returns An object indicating success or failure, with an optional error message.
 */
export const exportGameState = (gameState: GameState): { success: boolean, error?: string } => {
    try {
        const stateJSON = JSON.stringify(gameState, null, 2);
        const blob = new Blob([stateJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `startrek-save-turn-${gameState.turn}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return { success: true };
    } catch (error) {
        console.error("Failed to export save file:", error);
        return { success: false, error: "Could not export save file." };
    }
};

/**
 * Parses a JSON string, migrates it to the current version, and returns a valid game state.
 * @param jsonString The string content of an imported save file.
 * @returns An object indicating success and the new GameState, or failure with an error message.
 */
export const importGameState = (jsonString: string): { success: boolean, gameState?: GameState, error?: string } => {
    try {
        const importedState = JSON.parse(jsonString);
        const migratedState = migrateSaveData(importedState);
        return { success: true, gameState: migratedState };
    } catch (error) {
        console.error("Failed to import save file:", error);
        return { success: false, error: "Could not parse or migrate the imported save file." };
    }
};