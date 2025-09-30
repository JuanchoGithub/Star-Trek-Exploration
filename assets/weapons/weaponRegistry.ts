import type { BeamWeapon, ProjectileWeapon, AmmoType } from '../../types';

export const WEAPON_PHASER_STANDARD: BeamWeapon = {
    id: 'phaser_standard',
    name: 'Standard Phaser Array',
    type: 'beam',
    slot: 'forward',
    baseDamage: 30,
    range: 6,
};

const createTorpedoLauncher = (ammoType: AmmoType, name: string): ProjectileWeapon => ({
    id: `torpedo_${ammoType.toLowerCase()}`,
    name: `${name} Launcher`,
    type: 'projectile',
    slot: 'forward',
    ammoType: ammoType,
    fireRate: 1,
});

export const WEAPON_TORPEDO_PHOTON = createTorpedoLauncher('Photon', 'Photon Torpedo');
export const WEAPON_TORPEDO_QUANTUM = createTorpedoLauncher('Quantum', 'Quantum Torpedo');
export const WEAPON_TORPEDO_PLASMA = createTorpedoLauncher('Plasma', 'Plasma Torpedo');
export const WEAPON_TORPEDO_HEAVY_PLASMA = createTorpedoLauncher('HeavyPlasma', 'Heavy Plasma Torpedo');
export const WEAPON_TORPEDO_HEAVY_PHOTON = createTorpedoLauncher('HeavyPhoton', 'Heavy Photon Torpedo');
