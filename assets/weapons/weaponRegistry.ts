
import type { BeamWeapon, ProjectileWeapon, AmmoType } from '../../types';
import { PhaserIcon, PulsePhaserIcon } from '../ui/icons';
import { torpedoStats } from '../projectiles/configs/torpedoTypes';
import { KlingonPulseDisruptorIcon, KlingonDisruptorIcon } from '../ui/icons/klingon';
import { RomulanDisruptorIcon, RomulanPulseDisruptorIcon } from '../ui/icons/romulan';

// Helper to create Phaser types
const createPhaser = (type: number | string, name: string, damage: number, range: number, thickness: number): BeamWeapon => ({
    id: `phaser_type_${String(type).toLowerCase()}`,
    name,
    type: 'beam',
    slot: 'forward',
    icon: PhaserIcon,
    baseDamage: damage,
    range,
    thickness,
    animationType: 'beam',
});

// Phaser Types
export const WEAPON_PHASER_TYPE_I = createPhaser(1, 'Type I Phaser', 10, 4, 1.5);
export const WEAPON_PHASER_TYPE_II = createPhaser(2, 'Type II Phaser', 15, 4, 2);
export const WEAPON_PHASER_TYPE_IV = createPhaser(4, 'Type IV Phaser', 25, 5, 3);
export const WEAPON_PHASER_TYPE_V = createPhaser(5, 'Type V Phaser', 30, 6, 4);
export const WEAPON_PHASER_TYPE_VI = createPhaser(6, 'Type VI Phaser', 35, 6, 5);
export const WEAPON_PHASER_TYPE_VII = createPhaser(7, 'Type VII Phaser', 40, 7, 6);
export const WEAPON_PHASER_TYPE_VIII = createPhaser(8, 'Type VIII Phaser', 45, 7, 6);
export const WEAPON_PHASER_TYPE_IX = createPhaser(9, 'Type IX Phaser', 52, 8, 7);
export const WEAPON_PHASER_TYPE_X = createPhaser(10, 'Type X Phaser', 60, 8, 8);

// Legacy Standard Phaser is now Type V
export const WEAPON_PHASER_STANDARD = WEAPON_PHASER_TYPE_V;

// Pulse Phasers
export const WEAPON_PULSE_PHASER: BeamWeapon = {
    id: 'pulse_phaser_cannon',
    name: 'Pulse Phaser Cannon',
    type: 'beam',
    slot: 'forward',
    icon: PulsePhaserIcon,
    baseDamage: 40,
    range: 4,
    thickness: 6,
    animationType: 'pulse',
};

// Helper to create Disruptor types
const createKlingonDisruptor = (type: string, name: string, damage: number, range: number, thickness: number): BeamWeapon => ({
    id: `disruptor_${type.toLowerCase()}`,
    name,
    type: 'beam',
    slot: 'forward',
    icon: KlingonDisruptorIcon,
    baseDamage: damage,
    range,
    thickness,
    animationType: 'beam',
});

// Klingon Disruptor Types
export const WEAPON_DISRUPTOR_LIGHT = createKlingonDisruptor('Light', 'Light Disruptor', 35, 5, 5);
export const WEAPON_DISRUPTOR_MEDIUM = createKlingonDisruptor('Medium', 'Medium Disruptor', 45, 6, 6);
export const WEAPON_DISRUPTOR_HEAVY = createKlingonDisruptor('Heavy', 'Heavy Disruptor', 55, 6, 7);


// Klingon Pulse Disruptors
export const WEAPON_PULSE_DISRUPTOR: BeamWeapon = {
    id: 'pulse_disruptor_cannon',
    name: 'Pulse Disruptor Cannon',
    type: 'beam',
    slot: 'forward',
    icon: KlingonPulseDisruptorIcon,
    baseDamage: 65,
    range: 4,
    thickness: 8,
    animationType: 'pulse',
};

// Helper to create Romulan Disruptor types
const createRomulanDisruptor = (type: string, name: string, damage: number, range: number, thickness: number): BeamWeapon => ({
    id: `romulan_disruptor_${type.toLowerCase()}`,
    name,
    type: 'beam',
    slot: 'forward',
    icon: RomulanDisruptorIcon,
    baseDamage: damage,
    range,
    thickness,
    animationType: 'beam',
});

// Romulan Disruptor Types (More accuracy/range, less raw damage)
export const WEAPON_DISRUPTOR_ROMULAN_LIGHT = createRomulanDisruptor('Light', 'Romulan Light Disruptor', 30, 6, 4);
export const WEAPON_DISRUPTOR_ROMULAN_MEDIUM = createRomulanDisruptor('Medium', 'Romulan Medium Disruptor', 40, 7, 5);

// Romulan Pulse Disruptor (Scimitar)
export const WEAPON_PULSE_DISRUPTOR_ROMULAN: BeamWeapon = {
    id: 'romulan_pulse_disruptor',
    name: 'Romulan Pulse Disruptor',
    type: 'beam',
    slot: 'forward',
    icon: RomulanPulseDisruptorIcon,
    baseDamage: 60,
    range: 5,
    thickness: 7,
    animationType: 'pulse',
};


const createTorpedoLauncher = (ammoType: AmmoType, name: string): ProjectileWeapon => ({
    id: `torpedo_${ammoType.toLowerCase()}`,
    name: `${name} Launcher`,
    type: 'projectile',
    slot: 'forward',
    ammoType: ammoType,
    fireRate: 1,
    icon: torpedoStats[ammoType].icon,
});

export const WEAPON_TORPEDO_PHOTON = createTorpedoLauncher('Photon', 'Photon Torpedo');
export const WEAPON_TORPEDO_QUANTUM = createTorpedoLauncher('Quantum', 'Quantum Torpedo');
export const WEAPON_TORPEDO_PLASMA = createTorpedoLauncher('Plasma', 'Plasma Torpedo');
export const WEAPON_TORPEDO_HEAVY_PLASMA = createTorpedoLauncher('HeavyPlasma', 'Heavy Plasma Torpedo');
export const WEAPON_TORPEDO_HEAVY_PHOTON = createTorpedoLauncher('HeavyPhoton', 'Heavy Photon Torpedo');
