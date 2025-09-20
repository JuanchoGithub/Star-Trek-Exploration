import { ShipRole, ShipSubsystems } from "../../../types";

export interface ShipRoleStats {
    maxHull: number;
    maxShields: number;
    energy: { max: number };
    subsystems: ShipSubsystems;
    torpedoes: { max: number };
    securityTeams: { max: number };
    shuttleCount: number;
}

export const shipRoleStats: Record<ShipRole, ShipRoleStats> = {
    Explorer: {
        maxHull: 100,
        maxShields: 50,
        energy: { max: 100 },
        subsystems: {
            weapons: { health: 100, maxHealth: 100 },
            engines: { health: 100, maxHealth: 100 },
            shields: { health: 100, maxHealth: 100 },
            transporter: { health: 100, maxHealth: 100 },
        },
        torpedoes: { max: 10 },
        securityTeams: { max: 3 },
        shuttleCount: 3,
    },
    Dreadnought: {
        maxHull: 150,
        maxShields: 60,
        energy: { max: 120 },
        subsystems: {
            weapons: { health: 150, maxHealth: 150 },
            engines: { health: 80, maxHealth: 80 },
            shields: { health: 120, maxHealth: 120 },
            transporter: { health: 100, maxHealth: 100 },
        },
        torpedoes: { max: 15 },
        securityTeams: { max: 5 },
        shuttleCount: 5,
    },
    Cruiser: {
        maxHull: 120,
        maxShields: 40,
        energy: { max: 80 },
        subsystems: {
            weapons: { health: 120, maxHealth: 120 },
            engines: { health: 100, maxHealth: 100 },
            shields: { health: 100, maxHealth: 100 },
            transporter: { health: 0, maxHealth: 0 },
        },
        torpedoes: { max: 8 },
        securityTeams: { max: 5 },
        shuttleCount: 2,
    },
    Escort: {
        maxHull: 80,
        maxShields: 20,
        energy: { max: 60 },
        subsystems: {
            weapons: { health: 100, maxHealth: 100 },
            engines: { health: 120, maxHealth: 120 },
            shields: { health: 80, maxHealth: 80 },
            transporter: { health: 0, maxHealth: 0 },
        },
        torpedoes: { max: 4 },
        securityTeams: { max: 3 },
        shuttleCount: 1,
    },
    Freighter: {
        maxHull: 150,
        maxShields: 10,
        energy: { max: 40 },
        subsystems: {
            weapons: { health: 20, maxHealth: 20 },
            engines: { health: 80, maxHealth: 80 },
            shields: { health: 50, maxHealth: 50 },
            transporter: { health: 0, maxHealth: 0 },
        },
        torpedoes: { max: 0 },
        securityTeams: { max: 1 },
        shuttleCount: 1,
    }
};