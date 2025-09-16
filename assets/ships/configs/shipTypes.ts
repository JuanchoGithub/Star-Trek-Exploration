import React from 'react';
import {
    PlayerShipIcon,
    KlingonBirdOfPreyIcon,
    RomulanWarbirdIcon,
    OrionPirateShipIcon,
    UnknownShipIcon,
    NeutralShipIcon
} from '../icons';
import {
    FederationShipWireframe,
    KlingonShipWireframe,
    RomulanShipWireframe,
    PirateShipWireframe,
    TraderShipWireframe,
    UnknownShipWireframe
} from '../wireframes';

export type ShipFaction = 'Federation' | 'Klingon' | 'Romulan' | 'Pirate' | 'Independent' | 'Unknown';

export interface ShipTypeConfig {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    wireframe: React.FC;
    colorClass: string;
}

export const shipTypes: Record<ShipFaction, ShipTypeConfig> = {
    Federation: {
        icon: PlayerShipIcon,
        wireframe: FederationShipWireframe,
        colorClass: 'text-blue-400'
    },
    Klingon: {
        icon: KlingonBirdOfPreyIcon,
        wireframe: KlingonShipWireframe,
        colorClass: 'text-red-500'
    },
    Romulan: {
        icon: RomulanWarbirdIcon,
        wireframe: RomulanShipWireframe,
        colorClass: 'text-green-400'
    },
    Pirate: {
        icon: OrionPirateShipIcon,
        wireframe: PirateShipWireframe,
        colorClass: 'text-orange-500'
    },
    Independent: {
        icon: NeutralShipIcon,
        wireframe: TraderShipWireframe,
        colorClass: 'text-gray-300'
    },
    Unknown: {
        icon: UnknownShipIcon,
        wireframe: UnknownShipWireframe,
        colorClass: 'text-yellow-400'
    }
};