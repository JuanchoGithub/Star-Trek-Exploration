import type { Ship, ShipModel, ShipRole } from '../../types';
import { shipRoleStats } from '../../assets/ships/configs/shipRoleStats';
import { shipNames } from '../../assets/ships/configs/shipNames';

// A helper to create a mock ship object
const createMockShip = (id: string, model: ShipModel, role: ShipRole, name: string): Ship => {
    // FIX: Get stats from shipRoleStats to access role-specific properties.
    const stats = shipRoleStats[role];
    return {
        id, name, type: 'ship', shipModel: model, shipRole: role, faction: model,
        // FIX: Added missing properties 'shipClass' and 'cloakingCapable' to conform to the Ship type.
        shipClass: stats.name,
        cloakingCapable: stats.cloakingCapable,
        position: { x: 0, y: 0 }, hull: 1, maxHull: stats.maxHull,
        shields: 0, maxShields: stats.maxShields,
        subsystems: {} as any, energy: {} as any, energyAllocation: {} as any, torpedoes: {} as any, dilithium: {} as any,
        scanned: true, evasive: false, retreatingTurn: null, crewMorale: {} as any, securityTeams: {} as any, repairTarget: null, logColor: '',
        lifeSupportReserves: { current: 100, max: 100 },
        cloakState: 'visible',
        cloakCooldown: 0,
        isStunned: false,
    };
};

// Create a comprehensive list of all possible ships for dropdowns
export const allMockShips: Ship[] = [
    // Federation
    createMockShip('fed-explorer', 'Federation', 'Explorer', shipNames.Federation[0]),
    createMockShip('fed-cruiser', 'Federation', 'Cruiser', shipNames.Federation[1]),
    createMockShip('fed-escort', 'Federation', 'Escort', shipNames.Federation[2]),
    createMockShip('fed-dreadnought', 'Federation', 'Dreadnought', 'U.S.S. Endeavour'),
    createMockShip('fed-freighter', 'Federation', 'Freighter', shipNames.Federation[3]),
    // Klingon
    createMockShip('klingon-cruiser', 'Klingon', 'Cruiser', shipNames.Klingon[0]),
    createMockShip('klingon-escort', 'Klingon', 'Escort', shipNames.Klingon[1]),
    createMockShip('klingon-freighter', 'Klingon', 'Freighter', shipNames.Klingon[2]),
    // Romulan
    createMockShip('romulan-cruiser', 'Romulan', 'Cruiser', shipNames.Romulan[0]),
    createMockShip('romulan-escort', 'Romulan', 'Escort', shipNames.Romulan[1]),
    // Pirate
    createMockShip('pirate-escort', 'Pirate', 'Escort', shipNames.Pirate[0]),
    createMockShip('pirate-cruiser', 'Pirate', 'Cruiser', shipNames.Pirate[1]),
    // Independent
    createMockShip('ind-freighter', 'Independent', 'Freighter', shipNames.Independent[0]),
    createMockShip('ind-explorer', 'Independent', 'Explorer', shipNames.Independent[1]),
];

// Helper to get ships by faction
export const getShipsByFaction = (faction: ShipModel) => {
    return allMockShips.filter(ship => ship.faction === faction);
}