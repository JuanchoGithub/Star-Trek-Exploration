import React from 'react';
import type { ShipModel } from '../../../types';

import { 
    FederationExplorerIcon, FederationCruiserIcon, FederationEscortIcon, FederationFreighterIcon, FederationDreadnoughtIcon, IntrepidIcon, DefiantIcon, GalaxyIcon
} from '../icons/federation';
import { 
    BirdOfPreyIcon, KtingaIcon, VorchaIcon, NeghvarIcon
} from '../icons/klingon';
import { 
    RomulanEscortIcon, DderidexIcon, ValdoreIcon, ScimitarIcon
} from '../icons/romulan';
import {
    OrionRaiderIcon, FerengiMarauderIcon, NausicaanBattleshipIcon
} from '../icons/pirate';
import {
    IndependentFreighterIcon, IndependentExplorerIcon
} from '../icons/independent';
import { UnknownShipIcon } from '../icons';

import {
    FederationExplorerWireframe, FederationCruiserWireframe, FederationEscortWireframe, FederationFreighterWireframe, FederationDreadnoughtWireframe,
    FederationExplorerSaucerWireframe, FederationExplorerEngineeringWireframe,
    FederationCruiserSaucerWireframe, FederationCruiserEngineeringWireframe,
    FederationEscortSaucerWireframe, FederationEscortEngineeringWireframe,
    FederationDreadnoughtSaucerWireframe, FederationDreadnoughtEngineeringWireframe,
    FederationFreighterSaucerWireframe, FederationFreighterEngineeringWireframe,
    IntrepidWireframe, DefiantWireframe, GalaxyWireframe,
} from '../wireframes/federation';
import {
    BirdOfPreyWireframe, KtingaWireframe, VorchaWireframe, NeghvarWireframe,
} from '../wireframes/klingon';
import {
    DderidexWireframe, ValdoreWireframe, ScimitarWireframe
} from '../wireframes/romulan';
import {
    OrionRaiderWireframe, FerengiMarauderWireframe, NausicaanBattleshipWireframe,
} from '../wireframes/pirate';
import {
    IndependentFreighterWireframe, IndependentExplorerWireframe
} from '../wireframes/independent';
import { UnknownShipWireframe } from '../wireframes';


export interface ShipVisualsConfig {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    wireframe: React.FC;
    colorClass: string;
    saucerWireframe?: React.FC;
    engineeringWireframe?: React.FC;
}

export interface FactionVisuals {
    classes: Partial<Record<string, ShipVisualsConfig>>;
}

export const shipVisuals: Record<ShipModel | 'Unknown', FactionVisuals> = {
    Federation: {
        classes: {
            'Sovereign-class': { 
                icon: FederationDreadnoughtIcon, 
                wireframe: FederationDreadnoughtWireframe, 
                colorClass: 'text-indigo-400',
                saucerWireframe: FederationDreadnoughtSaucerWireframe,
                engineeringWireframe: FederationDreadnoughtEngineeringWireframe,
            },
            'Constitution-class': { 
                icon: FederationCruiserIcon, 
                wireframe: FederationCruiserWireframe, 
                colorClass: 'text-blue-300',
                saucerWireframe: FederationCruiserSaucerWireframe,
                engineeringWireframe: FederationCruiserEngineeringWireframe,
            },
             'Galaxy-class': { 
                icon: GalaxyIcon, 
                wireframe: GalaxyWireframe, 
                colorClass: 'text-blue-400',
                saucerWireframe: FederationExplorerSaucerWireframe,
                engineeringWireframe: FederationExplorerEngineeringWireframe,
            },
            'Intrepid-class': { 
                icon: IntrepidIcon, 
                wireframe: IntrepidWireframe, 
                colorClass: 'text-sky-300',
                saucerWireframe: FederationEscortSaucerWireframe, // Fallback
                engineeringWireframe: FederationEscortEngineeringWireframe, // Fallback
            },
            'Defiant-class': { 
                icon: DefiantIcon, 
                wireframe: DefiantWireframe, 
                colorClass: 'text-sky-400',
                saucerWireframe: FederationEscortSaucerWireframe, // Fallback
                engineeringWireframe: FederationEscortEngineeringWireframe, // Fallback
            },
        }
    },
    Klingon: {
        classes: {
            'K\'t\'inga-class': { icon: KtingaIcon, wireframe: KtingaWireframe, colorClass: 'text-red-500' },
            'B\'rel-class Bird-of-Prey': { icon: BirdOfPreyIcon, wireframe: BirdOfPreyWireframe, colorClass: 'text-red-400' },
            'Vor\'cha-class': { icon: VorchaIcon, wireframe: VorchaWireframe, colorClass: 'text-red-400' },
            'Negh\'Var-class': { icon: NeghvarIcon, wireframe: NeghvarWireframe, colorClass: 'text-red-600' },
        }
    },
    Romulan: {
        classes: {
            'D\'deridex-class': { icon: DderidexIcon, wireframe: DderidexWireframe, colorClass: 'text-teal-400' },
            'Valdore-type': { icon: ValdoreIcon, wireframe: ValdoreWireframe, colorClass: 'text-green-300' },
            'Scimitar-class': { icon: ScimitarIcon, wireframe: ScimitarWireframe, colorClass: 'text-teal-500' },
        }
    },
    Pirate: {
        classes: {
            'Orion Raider': { icon: OrionRaiderIcon, wireframe: OrionRaiderWireframe, colorClass: 'text-orange-400' },
            'Ferengi Marauder': { icon: FerengiMarauderIcon, wireframe: FerengiMarauderWireframe, colorClass: 'text-yellow-600' },
            'Nausicaan Battleship': { icon: NausicaanBattleshipIcon, wireframe: NausicaanBattleshipWireframe, colorClass: 'text-orange-600' },
        }
    },
    Independent: {
        classes: {
            'Civilian Freighter': { icon: IndependentFreighterIcon, wireframe: IndependentFreighterWireframe, colorClass: 'text-gray-300' },
        }
    },
    Unknown: {
        classes: {
            'Unknown': { icon: UnknownShipIcon, wireframe: UnknownShipWireframe, colorClass: 'text-yellow-400' }
        }
    }
};
