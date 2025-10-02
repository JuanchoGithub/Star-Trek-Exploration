
import { ShipRole, ShipModel, ShipSubsystems, TorpedoType, BeamWeapon, ProjectileWeapon, AmmoType } from '../../../types';
import {
    WEAPON_PHASER_TYPE_V,
    WEAPON_PHASER_TYPE_VI,
    WEAPON_PHASER_TYPE_VIII,
    WEAPON_PHASER_TYPE_X,
    WEAPON_PULSE_PHASER,
    WEAPON_TORPEDO_PHOTON,
    WEAPON_TORPEDO_QUANTUM,
    WEAPON_TORPEDO_PLASMA,
    WEAPON_TORPEDO_HEAVY_PLASMA,
    WEAPON_TORPEDO_HEAVY_PHOTON,
    WEAPON_PULSE_DISRUPTOR,
    WEAPON_DISRUPTOR_LIGHT,
    WEAPON_DISRUPTOR_MEDIUM,
    WEAPON_DISRUPTOR_HEAVY,
    WEAPON_DISRUPTOR_ROMULAN_LIGHT,
    WEAPON_DISRUPTOR_ROMULAN_MEDIUM,
    WEAPON_PULSE_DISRUPTOR_ROMULAN
} from '../../weapons/weaponRegistry';

// FIX: Exported the ShipClassStats interface to be used for type annotations.
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
    securityTeams: { max: number };
    shuttleCount: number;
    dilithium: { max: number };
    energyModifier: number;
    baseEnergyGeneration: number;
    systemConsumption: Record<keyof ShipSubsystems | 'base', number>;

    // New properties for modular weapons
    weapons: (BeamWeapon | ProjectileWeapon)[];
    ammo: Partial<Record<AmmoType, { max: number }>>;

    // @deprecated - will be removed in a future phase
    torpedoes: { max: number };
    torpedoType: TorpedoType | 'None';
}

// Subsystem templates for each faction
const F = (subsystems: Partial<ShipSubsystems>): ShipSubsystems => ({
    weapons: { health: 100, maxHealth: 100 },
    engines: { health: 100, maxHealth: 100 },
    shields: { health: 100, maxHealth: 100 },
    transporter: { health: 100, maxHealth: 100 },
    pointDefense: { health: 100, maxHealth: 100 },
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
    pointDefense: { health: 80, maxHealth: 80 },
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
    pointDefense: { health: 100, maxHealth: 100 },
    computer: { health: 90, maxHealth: 90 },
    lifeSupport: { health: 80, maxHealth: 80 },
    shuttlecraft: { health: 0, maxHealth: 0 },
    ...subsystems
});

const NO_CLOAK = { cloakingCapable: false, cloakEnergyCost: { initial: 0, maintain: 0 }, cloakFailureChance: 0 };

const baselineConsumption: Record<keyof ShipSubsystems | 'base', number> = {
    weapons: 5, shields: 3, engines: 0, lifeSupport: 3, computer: 2,
    transporter: 1, pointDefense: 1, shuttlecraft: 1, base: 4,
};
const baselineTotalConsumption = Object.values(baselineConsumption).reduce((sum, val) => sum + val, 0);


const calculateDerivedStats = (maxHull: number, maxShields: number) => {
    const totalDurability = maxHull + maxShields;
    const baselineDurability = 570; // Sovereign-class
    const baselineEnergy = 200;
    const baselineDilithium = 20;

    const energyModifier = Number((1.0 + ((totalDurability - baselineDurability) / baselineDurability) * 0.5).toFixed(3));
    
    const baseEnergyGeneration = Math.round(baselineTotalConsumption * energyModifier);
    const systemConsumption: Record<keyof ShipSubsystems | 'base', number> = {} as any;
    for (const key in baselineConsumption) {
        systemConsumption[key as keyof typeof baselineConsumption] = Number((baselineConsumption[key as keyof typeof baselineConsumption] * energyModifier).toFixed(2));
    }
    
    return {
        energyModifier,
        energy: { max: Math.round(baselineEnergy * energyModifier) },
        dilithium: { max: Math.round(baselineDilithium * energyModifier) },
        baseEnergyGeneration,
        systemConsumption,
    };
};

export const shipClasses: Record<ShipModel, Record<string, ShipClassStats>> = {
    Federation: {
        'Sovereign-class': {
            name: 'Sovereign-class', role: 'Dreadnought', ...NO_CLOAK, maxHull: 450, maxShields: 120,
            ...calculateDerivedStats(450, 120),
            subsystems: F({ weapons: {health: 180, maxHealth: 180}, shields: {health: 120, maxHealth: 120}}),
            securityTeams: { max: 8 }, shuttleCount: 6,
            // @deprecated
            torpedoes: { max: 20 }, torpedoType: 'Quantum',
            // New weapon system
            weapons: [WEAPON_PHASER_TYPE_X, WEAPON_TORPEDO_QUANTUM],
            ammo: { 'Quantum': { max: 20 } },
        },
        'Constitution-class': {
            name: 'Constitution-class', role: 'Cruiser', ...NO_CLOAK, maxHull: 300, maxShields: 100,
            ...calculateDerivedStats(300, 100),
            subsystems: F({ weapons: {health: 120, maxHealth: 120}, computer: {health: 110, maxHealth: 110}}),
            securityTeams: { max: 5 }, shuttleCount: 4,
            // @deprecated
            torpedoes: { max: 10 }, torpedoType: 'Photon',
            // New weapon system
            weapons: [WEAPON_PHASER_TYPE_VI, WEAPON_TORPEDO_PHOTON],
            ammo: { 'Photon': { max: 10 } },
        },
        'Galaxy-class': {
            name: 'Galaxy-class', role: 'Explorer', ...NO_CLOAK, maxHull: 400, maxShields: 120,
            ...calculateDerivedStats(400, 120),
            subsystems: F({ shields: {health: 140, maxHealth: 140}, pointDefense: {health: 140, maxHealth: 140}, computer: {health: 140, maxHealth: 140}}),
            securityTeams: { max: 6 }, shuttleCount: 8,
            // @deprecated
            torpedoes: { max: 12 }, torpedoType: 'Photon',
            // New weapon system
            weapons: [WEAPON_PHASER_TYPE_V, WEAPON_TORPEDO_PHOTON],
            ammo: { 'Photon': { max: 12 } },
        },
        'Intrepid-class': {
            name: 'Intrepid-class', role: 'Scout', ...NO_CLOAK, maxHull: 200, maxShields: 80,
            ...calculateDerivedStats(200, 80),
            subsystems: F({ engines: {health: 120, maxHealth: 120}, pointDefense: {health: 130, maxHealth: 130}}),
            securityTeams: { max: 3 }, shuttleCount: 2,
            // @deprecated
            torpedoes: { max: 6 }, torpedoType: 'Photon',
            // New weapon system
            weapons: [WEAPON_PHASER_TYPE_VIII, WEAPON_TORPEDO_PHOTON],
            ammo: { 'Photon': { max: 6 } },
        },
        'Defiant-class': {
            name: 'Defiant-class', role: 'Escort', cloakingCapable: true, cloakEnergyCost: { initial: 0, maintain: 50 }, cloakFailureChance: 0.10, maxHull: 250, maxShields: 100,
            ...calculateDerivedStats(250, 100),
            subsystems: F({ weapons: {health: 180, maxHealth: 180}, engines: {health: 120, maxHealth: 120}}),
            securityTeams: { max: 4 }, shuttleCount: 1,
            // @deprecated
            torpedoes: { max: 8 }, torpedoType: 'Quantum',
            // New weapon system
            weapons: [WEAPON_PULSE_PHASER, WEAPON_TORPEDO_QUANTUM],
            ammo: { 'Quantum': { max: 8 } },
        },
    },
    Klingon: {
        'B\'rel-class Bird-of-Prey': {
            name: 'B\'rel-class Bird-of-Prey', role: 'Escort', cloakingCapable: true, cloakEnergyCost: { initial: 0, maintain: 45 }, cloakFailureChance: 0.08, maxHull: 150, maxShields: 50,
            ...calculateDerivedStats(150, 50),
            subsystems: K({ weapons: {health: 140, maxHealth: 140}, engines: {health: 120, maxHealth: 120}}),
            securityTeams: { max: 4 }, shuttleCount: 0,
            // @deprecated
            torpedoes: { max: 6 }, torpedoType: 'Photon',
            // New weapon system
            weapons: [WEAPON_DISRUPTOR_LIGHT, WEAPON_TORPEDO_PHOTON],
            ammo: { 'Photon': { max: 6 } },
        },
        'K\'t\'inga-class': {
            name: 'K\'t\'inga-class', role: 'Cruiser', ...NO_CLOAK, maxHull: 300, maxShields: 80,
            ...calculateDerivedStats(300, 80),
            subsystems: K({ weapons: {health: 140, maxHealth: 140}}),
            securityTeams: { max: 6 }, shuttleCount: 0,
            // @deprecated
            torpedoes: { max: 10 }, torpedoType: 'Photon',
            // New weapon system
            weapons: [WEAPON_DISRUPTOR_MEDIUM, WEAPON_TORPEDO_PHOTON],
            ammo: { 'Photon': { max: 10 } },
        },
        'Vor\'cha-class': {
            name: 'Vor\'cha-class', role: 'Attack Cruiser', cloakingCapable: false, ...NO_CLOAK, maxHull: 350, maxShields: 100,
            ...calculateDerivedStats(350, 100),
            subsystems: K({ weapons: {health: 160, maxHealth: 160}, shields: {health: 100, maxHealth: 100}}),
            securityTeams: { max: 8 }, shuttleCount: 0,
            // @deprecated
            torpedoes: { max: 12 }, torpedoType: 'Photon',
            // New weapon system
            weapons: [WEAPON_DISRUPTOR_HEAVY, WEAPON_TORPEDO_PHOTON],
            ammo: { 'Photon': { max: 12 } },
        },
        'Negh\'Var-class': {
            name: 'Negh\'Var-class', role: 'Battleship', ...NO_CLOAK, maxHull: 500, maxShields: 120,
            ...calculateDerivedStats(500, 120),
            subsystems: K({ weapons: {health: 200, maxHealth: 200}, shields: {health: 120, maxHealth: 120}}),
            securityTeams: { max: 10 }, shuttleCount: 0,
            // @deprecated
            torpedoes: { max: 18 }, torpedoType: 'HeavyPhoton',
            // New weapon system
            weapons: [WEAPON_PULSE_DISRUPTOR, WEAPON_TORPEDO_HEAVY_PHOTON],
            ammo: { 'HeavyPhoton': { max: 18 } },
        },
    },
    Romulan: {
        'D\'deridex-class': {
            name: 'D\'deridex-class', role: 'Warbird', cloakingCapable: true, cloakEnergyCost: { initial: 0, maintain: 40 }, cloakFailureChance: 0.01, maxHull: 400, maxShields: 100,
            ...calculateDerivedStats(400, 100),
            subsystems: R({ weapons: {health: 180, maxHealth: 180}, shields: {health: 110, maxHealth: 110}}),
            securityTeams: { max: 7 }, shuttleCount: 0,
            // @deprecated
            torpedoes: { max: 15 }, torpedoType: 'HeavyPlasma',
            // New weapon system
            weapons: [WEAPON_DISRUPTOR_ROMULAN_MEDIUM, WEAPON_TORPEDO_HEAVY_PLASMA],
            ammo: { 'HeavyPlasma': { max: 15 } },
        },
        'Valdore-type': {
            name: 'Valdore-type', role: 'Scout', cloakingCapable: true, cloakEnergyCost: { initial: 0, maintain: 40 }, cloakFailureChance: 0.01, maxHull: 200, maxShields: 80,
            ...calculateDerivedStats(200, 80),
            subsystems: R({ weapons: {health: 120, maxHealth: 120}, engines: {health: 130, maxHealth: 130}}),
            securityTeams: { max: 3 }, shuttleCount: 0,
            // @deprecated
            torpedoes: { max: 8 }, torpedoType: 'Plasma',
            // New weapon system
            weapons: [WEAPON_DISRUPTOR_ROMULAN_LIGHT, WEAPON_TORPEDO_PLASMA],
            ammo: { 'Plasma': { max: 8 } },
        },
        'Scimitar-class': {
            name: 'Scimitar-class', role: 'Command Ship', cloakingCapable: true, cloakEnergyCost: { initial: 0, maintain: 40 }, cloakFailureChance: 0.01, maxHull: 450, maxShields: 120,
            ...calculateDerivedStats(450, 120),
            subsystems: R({ weapons: {health: 200, maxHealth: 200}, shields: {health: 140, maxHealth: 140}}),
            securityTeams: { max: 10 }, shuttleCount: 0,
            // @deprecated
            torpedoes: { max: 25 }, torpedoType: 'HeavyPlasma',
            // New weapon system
            weapons: [WEAPON_PULSE_DISRUPTOR_ROMULAN, WEAPON_TORPEDO_HEAVY_PLASMA],
            ammo: { 'HeavyPlasma': { max: 25 } },
        },
    },
    Pirate: {
        'Orion Raider': {
            name: 'Orion Raider', role: 'Raider', ...NO_CLOAK, maxHull: 180, maxShields: 50,
            ...calculateDerivedStats(180, 50),
            subsystems: K({ weapons: {health: 80, maxHealth: 80}, engines: {health: 130, maxHealth: 130}}),
            securityTeams: { max: 2 }, shuttleCount: 0,
            // @deprecated
            torpedoes: { max: 4 }, torpedoType: 'Photon',
            // New weapon system
            weapons: [WEAPON_PHASER_TYPE_V, WEAPON_TORPEDO_PHOTON],
            ammo: { 'Photon': { max: 4 } },
        },
        'Ferengi Marauder': {
            name: 'Ferengi Marauder', role: 'Marauder', ...NO_CLOAK, maxHull: 250, maxShields: 80,
            ...calculateDerivedStats(250, 80),
            subsystems: F({ weapons: {health: 120, maxHealth: 120}, shields: {health: 80, maxHealth: 80}, lifeSupport: {health: 120, maxHealth: 120}}),
            securityTeams: { max: 3 }, shuttleCount: 1,
            // @deprecated
            torpedoes: { max: 8 }, torpedoType: 'Plasma',
            // New weapon system
            weapons: [WEAPON_PULSE_DISRUPTOR, WEAPON_TORPEDO_PLASMA],
            ammo: { 'Plasma': { max: 8 } },
        },
        'Nausicaan Battleship': {
            name: 'Nausicaan Battleship', role: 'Battleship', ...NO_CLOAK, maxHull: 350, maxShields: 100,
            ...calculateDerivedStats(350, 100),
            subsystems: K({ weapons: {health: 160, maxHealth: 160}, engines: {health: 80, maxHealth: 80}}),
            securityTeams: { max: 5 }, shuttleCount: 0,
            // @deprecated
            torpedoes: { max: 0 }, torpedoType: 'None',
            // New weapon system
            weapons: [WEAPON_PULSE_PHASER],
            ammo: {},
        },
    },
    Independent: {
        'Civilian Freighter': {
            name: 'Civilian Freighter', role: 'Freighter', ...NO_CLOAK, maxHull: 200, maxShields: 40,
            ...calculateDerivedStats(200, 40),
            subsystems: F({ weapons: { health: 40, maxHealth: 40 }, engines: { health: 80, maxHealth: 80 }, lifeSupport: { health: 120, maxHealth: 120 }}),
            securityTeams: { max: 1 }, shuttleCount: 1,
            // @deprecated
            torpedoes: { max: 0 }, torpedoType: 'None',
            // New weapon system
            weapons: [WEAPON_PHASER_TYPE_V],
            ammo: {},
        }
    }
};
