import React from 'react';
// FIX: Imported missing ShipModel and ShipRole types.
import type { ShipModel, ShipRole } from '../../../types';

import { 
    FederationExplorerIcon, FederationCruiserIcon, FederationEscortIcon, FederationFreighterIcon
} from '../icons/federation';
import { 
    KlingonCruiserIcon, KlingonEscortIcon, KlingonFreighterIcon
} from '../icons/klingon';
import { 
    RomulanCruiserIcon, RomulanEscortIcon
} from '../icons/romulan';
import {
    PirateCruiserIcon, PirateEscortIcon
} from '../icons/pirate';
import {
    IndependentFreighterIcon, IndependentExplorerIcon
} from '../icons/independent';
import { UnknownShipIcon } from '../icons';

import {
    FederationExplorerWireframe, FederationCruiserWireframe, FederationEscortWireframe, FederationFreighterWireframe
} from '../wireframes/federation';
import {
    KlingonCruiserWireframe, KlingonEscortWireframe, KlingonFreighterWireframe
} from '../wireframes/klingon';
import {
    RomulanCruiserWireframe, RomulanEscortWireframe
} from '../wireframes/romulan';
import {
    PirateCruiserWireframe, PirateEscortWireframe
} from '../wireframes/pirate';
import {
    IndependentFreighterWireframe, IndependentExplorerWireframe
} from '../wireframes/independent';
import { UnknownShipWireframe } from '../wireframes';


export interface ShipTypeConfig {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    wireframe: React.FC;
    colorClass: string;
}

// FIX: Modified FactionVisuals to allow for the special 'Unknown' role key.
export interface FactionVisuals {
    defaultRole: ShipRole;
    // FIX: Simplified the union type to a single Partial Record to resolve type errors.
    roles: Partial<Record<ShipRole | 'Unknown', ShipTypeConfig>>;
}

// FIX: Corrected the type to use an index signature of `ShipModel | 'Unknown'`.
export const shipVisuals: Record<ShipModel | 'Unknown', FactionVisuals> = {
    Federation: {
        defaultRole: 'Explorer',
        roles: {
            Explorer: { icon: FederationExplorerIcon, wireframe: FederationExplorerWireframe, colorClass: 'text-blue-400' },
            Cruiser: { icon: FederationCruiserIcon, wireframe: FederationCruiserWireframe, colorClass: 'text-blue-300' },
            Escort: { icon: FederationEscortIcon, wireframe: FederationEscortWireframe, colorClass: 'text-sky-400' },
            Freighter: { icon: FederationFreighterIcon, wireframe: FederationFreighterWireframe, colorClass: 'text-cyan-400' },
        }
    },
    Klingon: {
        defaultRole: 'Cruiser',
        roles: {
            Cruiser: { icon: KlingonCruiserIcon, wireframe: KlingonCruiserWireframe, colorClass: 'text-red-500' },
            Escort: { icon: KlingonEscortIcon, wireframe: KlingonEscortWireframe, colorClass: 'text-red-400' },
            Freighter: { icon: KlingonFreighterIcon, wireframe: KlingonFreighterWireframe, colorClass: 'text-orange-400' },
        }
    },
    Romulan: {
        defaultRole: 'Cruiser',
        roles: {
            Cruiser: { icon: RomulanCruiserIcon, wireframe: RomulanCruiserWireframe, colorClass: 'text-green-500' },
            Escort: { icon: RomulanEscortIcon, wireframe: RomulanEscortWireframe, colorClass: 'text-green-400' },
        }
    },
    Pirate: {
        defaultRole: 'Escort',
        roles: {
            Escort: { icon: PirateEscortIcon, wireframe: PirateEscortWireframe, colorClass: 'text-orange-500' },
            Cruiser: { icon: PirateCruiserIcon, wireframe: PirateCruiserWireframe, colorClass: 'text-yellow-500' },
        }
    },
    Independent: {
        defaultRole: 'Freighter',
        roles: {
            Freighter: { icon: IndependentFreighterIcon, wireframe: IndependentFreighterWireframe, colorClass: 'text-gray-300' },
            Explorer: { icon: IndependentExplorerIcon, wireframe: IndependentExplorerWireframe, colorClass: 'text-gray-400' },
        }
    },
    Unknown: {
        defaultRole: 'Explorer', // Not used, but required for type
        roles: {
            Unknown: { icon: UnknownShipIcon, wireframe: UnknownShipWireframe, colorClass: 'text-yellow-400' }
        }
    }
};