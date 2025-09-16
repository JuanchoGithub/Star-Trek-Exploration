import React from 'react';
import { MClassIcon, JClassIcon, LClassIcon, DClassIcon } from '../icons';
import { MClassWireframe, JClassWireframe, LClassWireframe, DClassWireframe } from '../wireframes';
import { PlanetClass } from '../../../types';

export interface PlanetTypeConfig {
    key: PlanetClass;
    name: string; // e.g., 'Terrestrial'
    typeName: PlanetClass; // Key for looking up names in planetNames.ts
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    wireframe: React.FC;
    colorClass: string;
}

export const planetTypes: Record<PlanetClass, PlanetTypeConfig> = {
    M: {
        key: 'M',
        name: 'M-Class (Terrestrial)',
        typeName: 'M',
        icon: MClassIcon,
        wireframe: MClassWireframe,
        colorClass: 'text-green-500'
    },
    J: {
        key: 'J',
        name: 'J-Class (Gas Giant)',
        typeName: 'J',
        icon: JClassIcon,
        wireframe: JClassWireframe,
        colorClass: 'text-orange-400'
    },
    L: {
        key: 'L',
        name: 'L-Class (Marginal)',
        typeName: 'L',
        icon: LClassIcon,
        wireframe: LClassWireframe,
        colorClass: 'text-yellow-600'
    },
    D: {
        key: 'D',
        name: 'D-Class (Rock)',
        typeName: 'D',
        icon: DClassIcon,
        wireframe: DClassWireframe,
        colorClass: 'text-gray-500'
    }
};

export const planetClasses = Object.keys(planetTypes) as PlanetClass[];
