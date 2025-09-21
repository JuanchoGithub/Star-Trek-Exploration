import React from 'react';
import { TorpedoType } from '../../../types';
import { TorpedoProjectileIcon, QuantumTorpedoIcon, PlasmaTorpedoIcon } from '../icons';
import { TorpedoWireframe, QuantumTorpedoWireframe, PlasmaTorpedoWireframe } from '../wireframes';

export interface TorpedoConfig {
    name: string;
    damage: number;
    speed: number;
    specialDamage?: {
        type: 'plasma_burn';
        damage: number;
        duration: number;
    };
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    wireframe: React.FC;
    colorClass: string;
}

export const torpedoStats: Record<TorpedoType, TorpedoConfig> = {
    Photon: {
        name: 'Photon Torpedo',
        damage: 50,
        speed: 2,
        icon: TorpedoProjectileIcon,
        wireframe: TorpedoWireframe,
        colorClass: 'text-accent-orange'
    },
    Quantum: {
        name: 'Quantum Torpedo',
        damage: 75,
        speed: 3,
        icon: QuantumTorpedoIcon,
        wireframe: QuantumTorpedoWireframe,
        colorClass: 'text-accent-indigo'
    },
    Plasma: {
        name: 'Plasma Torpedo',
        damage: 30,
        speed: 1,
        specialDamage: {
            type: 'plasma_burn',
            damage: 10,
            duration: 2,
        },
        icon: PlasmaTorpedoIcon,
        wireframe: PlasmaTorpedoWireframe,
        colorClass: 'text-accent-teal'
    },
    HeavyPlasma: {
        name: 'Heavy Plasma Torpedo',
        damage: 40,
        speed: 1,
        specialDamage: {
            type: 'plasma_burn',
            damage: 15,
            duration: 2,
        },
        icon: PlasmaTorpedoIcon,
        wireframe: PlasmaTorpedoWireframe,
        colorClass: 'text-green-400'
    },
    HeavyPhoton: {
        name: 'Heavy Photon Torpedo',
        damage: 90,
        speed: 1,
        icon: TorpedoProjectileIcon,
        wireframe: TorpedoWireframe,
        colorClass: 'text-orange-500'
    }
};