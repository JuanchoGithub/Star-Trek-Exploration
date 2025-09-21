import { ShipRole, ShipModel, ShipSubsystems } from '../../../types';

export interface ShipClassStats {
    name: string;
    role: ShipRole;
    cloakingCapable: boolean;
    cloakEnergyCost: { initial: number; maintain: number };
    cloakFailureChance: number;
    maxHull: number;
    maxShields: number;
    energy: { max: number };
    subsystems: ShipSubsystems;
    torpedoes: { max: number };
    securityTeams: { max: number };
    shuttleCount: number;
}

// Subsystem templates for each faction
const F = (subsystems: Partial<ShipSubsystems>): ShipSubsystems => ({
    weapons: { health: 100, maxHealth: 100 },
    engines: { health: 100, maxHealth: 100 },
    shields: { health: 100, maxHealth: 100 },
    transporter: { health: 100, maxHealth: 100 },
    scanners: { health: 100, maxHealth: 100 },
    computer: { health: 100, maxHealth: 100 },
    lifeSupport: { health: 100, maxHealth: 100 },
    shuttlecraft: { health: 100, maxHealth: 100 },
    ...subsystems
});

const K = (subsystems: Partial<ShipSubsystems>): ShipSubsystems => ({
    weapons: { health: 120, maxHealth: 120 },
    engines: { health: 100, maxHealth: 100 },
    shields: { health: 80, maxHealth: 80 },
    transporter: { health: 0, maxHealth: 0 },
    scanners: { health: 80, maxHealth: 80 },
    computer: { health: 80, maxHealth: 80 },
    lifeSupport: { health: 80, maxHealth: 80 },
    shuttlecraft: { health: 0, maxHealth: 0 },
    ...subsystems
});

const R = (subsystems: Partial<ShipSubsystems>): ShipSubsystems => ({
    weapons: { health: 110, maxHealth: 110 },
    engines: { health: 110, maxHealth: 110 },
    shields: { health: 90, maxHealth: 90 },
    transporter: { health: 0, maxHealth: 0 },
    scanners: { health: 100, maxHealth: 100 },
    computer: { health: 90, maxHealth: 90 },
    lifeSupport: { health: 80, maxHealth: 80 },
    shuttlecraft: { health: 0, maxHealth: 0 },
    ...subsystems
});

const NO_CLOAK = { cloakingCapable: false, cloakEnergyCost: { initial: 0, maintain: 0 }, cloakFailureChance: 0 };

export const shipClasses: Record<ShipModel, Record<string, ShipClassStats>> = {
    Federation: {
        'Sovereign-class': { // This is the player's ship, keeping it as a powerful Dreadnought
            name: 'Sovereign-class', role: 'Dreadnought', ...NO_CLOAK, maxHull: 450, maxShields: 120, energy: { max: 200 },
            subsystems: F({ weapons: {health: 180, maxHealth: 180}, shields: {health: 120, maxHealth: 120}}),
            torpedoes: { max: 20 }, securityTeams: { max: 8 }, shuttleCount: 6,
        },
        'Constitution-class': {
            name: 'Constitution-class', role: 'Cruiser', ...NO_CLOAK, maxHull: 300, maxShields: 100, energy: { max: 150 },
            subsystems: F({ weapons: {health: 120, maxHealth: 120}, computer: {health: 110, maxHealth: 110}}),
            torpedoes: { max: 10 }, securityTeams: { max: 5 }, shuttleCount: 4,
        },
        'Galaxy-class': {
            name: 'Galaxy-class', role: 'Explorer', ...NO_CLOAK, maxHull: 400, maxShields: 120, energy: { max: 180 },
            subsystems: F({ shields: {health: 140, maxHealth: 140}, scanners: {health: 140, maxHealth: 140}, computer: {health: 140, maxHealth: 140}}),
            torpedoes: { max: 12 }, securityTeams: { max: 6 }, shuttleCount: 8,
        },
        'Intrepid-class': {
            name: 'Intrepid-class', role: 'Scout', ...NO_CLOAK, maxHull: 200, maxShields: 80, energy: { max: 160 },
            subsystems: F({ engines: {health: 120, maxHealth: 120}, scanners: {health: 130, maxHealth: 130}}),
            torpedoes: { max: 6 }, securityTeams: { max: 3 }, shuttleCount: 2,
        },
        'Defiant-class': {
            name: 'Defiant-class', role: 'Escort', cloakingCapable: true, cloakEnergyCost: { initial: 40, maintain: 10 }, cloakFailureChance: 0.1, maxHull: 250, maxShields: 100, energy: { max: 140 },
            subsystems: F({ weapons: {health: 180, maxHealth: 180}, engines: {health: 120, maxHealth: 120}}),
            torpedoes: { max: 8 }, securityTeams: { max: 4 }, shuttleCount: 1,
        },
    },
    Klingon: {
        'B\'rel-class Bird-of-Prey': {
            name: 'B\'rel-class Bird-of-Prey', role: 'Escort', cloakingCapable: true, cloakEnergyCost: { initial: 30, maintain: 8 }, cloakFailureChance: 0.15, maxHull: 150, maxShields: 50, energy: { max: 120 },
            subsystems: K({ weapons: {health: 140, maxHealth: 140}, engines: {health: 120, maxHealth: 120}}),
            torpedoes: { max: 6 }, securityTeams: { max: 4 }, shuttleCount: 0,
        },
        'K\'t\'inga-class': {
            name: 'K\'t\'inga-class', role: 'Cruiser', ...NO_CLOAK, maxHull: 300, maxShields: 80, energy: { max: 140 },
            subsystems: K({ weapons: {health: 140, maxHealth: 140}}),
            torpedoes: { max: 10 }, securityTeams: { max: 6 }, shuttleCount: 0,
        },
        'Vor\'cha-class': {
            name: 'Vor\'cha-class', role: 'Attack Cruiser', cloakingCapable: false, ...NO_CLOAK, maxHull: 350, maxShields: 100, energy: { max: 160 },
            subsystems: K({ weapons: {health: 160, maxHealth: 160}, shields: {health: 100, maxHealth: 100}}),
            torpedoes: { max: 12 }, securityTeams: { max: 8 }, shuttleCount: 0,
        },
        'Negh\'Var-class': {
            name: 'Negh\'Var-class', role: 'Battleship', ...NO_CLOAK, maxHull: 500, maxShields: 120, energy: { max: 180 },
            subsystems: K({ weapons: {health: 200, maxHealth: 200}, shields: {health: 120, maxHealth: 120}}),
            torpedoes: { max: 18 }, securityTeams: { max: 10 }, shuttleCount: 0,
        },
    },
    Romulan: {
        'D\'deridex-class': {
            name: 'D\'deridex-class', role: 'Warbird', cloakingCapable: true, cloakEnergyCost: { initial: 50, maintain: 15 }, cloakFailureChance: 0, maxHull: 400, maxShields: 100, energy: { max: 200 },
            subsystems: R({ weapons: {health: 180, maxHealth: 180}, shields: {health: 110, maxHealth: 110}}),
            torpedoes: { max: 15 }, securityTeams: { max: 7 }, shuttleCount: 0,
        },
        'Valdore-type': {
            name: 'Valdore-type', role: 'Scout', cloakingCapable: true, cloakEnergyCost: { initial: 40, maintain: 10 }, cloakFailureChance: 0.05, maxHull: 200, maxShields: 80, energy: { max: 150 },
            subsystems: R({ weapons: {health: 120, maxHealth: 120}, engines: {health: 130, maxHealth: 130}}),
            torpedoes: { max: 8 }, securityTeams: { max: 3 }, shuttleCount: 0,
        },
        'Scimitar-class': {
            name: 'Scimitar-class', role: 'Command Ship', cloakingCapable: true, cloakEnergyCost: { initial: 60, maintain: 20 }, cloakFailureChance: 0, maxHull: 450, maxShields: 120, energy: { max: 220 },
            subsystems: R({ weapons: {health: 200, maxHealth: 200}, shields: {health: 140, maxHealth: 140}}),
            torpedoes: { max: 25 }, securityTeams: { max: 10 }, shuttleCount: 0,
        },
    },
    Pirate: {
        'Orion Raider': {
            name: 'Orion Raider', role: 'Raider', ...NO_CLOAK, maxHull: 180, maxShields: 50, energy: { max: 100 },
            subsystems: K({ weapons: {health: 80, maxHealth: 80}, engines: {health: 130, maxHealth: 130}}),
            torpedoes: { max: 4 }, securityTeams: { max: 2 }, shuttleCount: 0,
        },
        'Ferengi Marauder': {
            name: 'Ferengi Marauder', role: 'Marauder', ...NO_CLOAK, maxHull: 250, maxShields: 80, energy: { max: 120 },
            subsystems: F({ weapons: {health: 120, maxHealth: 120}, shields: {health: 80, maxHealth: 80}, lifeSupport: {health: 120, maxHealth: 120}}),
            torpedoes: { max: 8 }, securityTeams: { max: 3 }, shuttleCount: 1,
        },
        'Nausicaan Battleship': {
            name: 'Nausicaan Battleship', role: 'Battleship', ...NO_CLOAK, maxHull: 350, maxShields: 100, energy: { max: 130 },
            subsystems: K({ weapons: {health: 160, maxHealth: 160}, engines: {health: 80, maxHealth: 80}}),
            torpedoes: { max: 12 }, securityTeams: { max: 5 }, shuttleCount: 0,
        },
    },
    Independent: {
        'Civilian Freighter': {
            name: 'Civilian Freighter', role: 'Freighter', ...NO_CLOAK, maxHull: 200, maxShields: 40, energy: { max: 80 },
            subsystems: F({ weapons: { health: 40, maxHealth: 40 }, engines: { health: 80, maxHealth: 80 }, lifeSupport: { health: 120, maxHealth: 120 }}),
            torpedoes: { max: 2 }, securityTeams: { max: 1 }, shuttleCount: 1,
        }
    }
};