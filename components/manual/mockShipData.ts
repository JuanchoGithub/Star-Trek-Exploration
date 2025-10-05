
import type { Ship, ShipModel, ShipRole, AmmoType } from '../../types';
// FIX: Switched from shipRoleStats to shipClasses for more accurate data lookup.
import { shipClasses } from '../../assets/ships/configs/shipClassStats';

// A helper to create a mock ship object
// REFACTORED to remove the `name` parameter and generate it from class/role.
const createMockShip = (id: string, model: ShipModel, className: string): Ship => {
    // FIX: Get stats directly from the specific ship class, not the generic role.
    const stats = shipClasses[model][className];
    const name = `${stats.name} (${stats.role})`;
    return {
        id, name, type: 'ship', shipModel: model, shipRole: stats.role, faction: model,
        shipClass: stats.name,
        // FIX: The ShipClassStats interface uses `cloakChance`, not `cloakingCapable`.
        cloakingCapable: !!stats.cloakChance,
        position: { x: 0, y: 0 }, hull: stats.maxHull, maxHull: stats.maxHull,
        shields: stats.maxShields, maxShields: stats.maxShields,
        subsystems: {} as any, energy: {} as any, energyAllocation: {} as any, dilithium: {} as any,
        scanned: true, evasive: false, retreatingTurn: null, crewMorale: {} as any, securityTeams: {} as any, repairTarget: null, logColor: '',
        // FIX: Added missing repairPoints and repairRate properties to satisfy the Ship interface.
        repairPoints: { current: stats.repairPoints.max, max: stats.repairPoints.max },
        repairRate: stats.repairRate,
        lifeSupportReserves: { current: 100, max: 100 },
        cloakState: 'visible',
        cloakCooldown: 0,
        shieldReactivationTurn: null,
        cloakInstability: 0,
        cloakDestabilizedThisTurn: false,
        cloakTransitionTurnsRemaining: null,
        isStunned: false,
        engineFailureTurn: null,
        lifeSupportFailureTurn: null,
        // FIX: Added missing property `weaponFailureTurn`.
        weaponFailureTurn: null,
        isDerelict: false,
        captureInfo: null,
        statusEffects: [],
        pointDefenseEnabled: false,
        energyModifier: stats.energyModifier,
        // FIX: Add missing/incorrect properties to satisfy the Ship interface.
        torpedoes: { current: stats.torpedoes.max, max: stats.torpedoes.max },
        weapons: JSON.parse(JSON.stringify(stats.weapons)),
        ammo: Object.keys(stats.ammo).reduce((acc, key) => {
            const ammoType = key as AmmoType;
            if (stats.ammo[ammoType]) {
                acc[ammoType] = { current: stats.ammo[ammoType]!.max, max: stats.ammo[ammoType]!.max };
            }
            return acc;
        }, {} as Ship['ammo']),
    };
};

// Create a comprehensive list of all possible ships for dropdowns
// UPDATED to use specific class names and generate names from stats.
export const allMockShips: Ship[] = [
    // Federation
    createMockShip('fed-dreadnought', 'Federation', 'Sovereign-class'),
    createMockShip('fed-explorer', 'Federation', 'Galaxy-class'),
    createMockShip('fed-cruiser', 'Federation', 'Constitution-class'),
    createMockShip('fed-escort', 'Federation', 'Defiant-class'),
    createMockShip('fed-scout', 'Federation', 'Intrepid-class'),
    // Klingon
    createMockShip('klingon-battleship', 'Klingon', "Negh'Var-class"),
    createMockShip('klingon-attack-cruiser', 'Klingon', "Vor'cha-class"),
    createMockShip('klingon-cruiser', 'Klingon', "K't'inga-class"),
    createMockShip('klingon-escort', 'Klingon', "B'rel-class Bird-of-Prey"),
    // Romulan
    createMockShip('romulan-command', 'Romulan', 'Scimitar-class'),
    createMockShip('romulan-warbird', 'Romulan', "D'deridex-class"),
    createMockShip('romulan-scout', 'Romulan', 'Valdore-type'),
    // Pirate
    createMockShip('pirate-marauder', 'Pirate', 'Ferengi Marauder'),
    createMockShip('pirate-raider', 'Pirate', 'Orion Raider'),
    createMockShip('pirate-battleship', 'Pirate', 'Nausicaan Battleship'),
    // Independent
    createMockShip('ind-freighter', 'Independent', 'Civilian Freighter'),
];

// Helper to get ships by faction
export const getShipsByFaction = (faction: ShipModel) => {
    return allMockShips.filter(ship => ship.faction === faction);
}
