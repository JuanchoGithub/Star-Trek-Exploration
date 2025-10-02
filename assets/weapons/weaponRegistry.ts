import type { BeamWeapon, ProjectileWeapon, AmmoType } from '../../types';
import { PhaserIcon, PulsePhaserIcon } from '../ui/icons';
import { torpedoStats } from '../projectiles/configs/torpedoTypes';

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
export const WEAPON_PHASER_TYPE_VIII = createPhaser(8, 'Type VIII Phaser', 45, 7, 6);
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