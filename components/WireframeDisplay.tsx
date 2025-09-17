import React from 'react';
// FIX: Imported ShipModel type.
import type { Entity, Planet, Ship, ShipModel } from '../types';
import { planetTypes } from '../assets/planets/configs/planetTypes';
import { shipVisuals } from '../assets/ships/configs/shipVisuals';
import { starbaseType } from '../assets/starbases/configs/starbaseTypes';
import { asteroidType } from '../assets/asteroids/configs/asteroidTypes';
import { beaconType } from '../assets/beacons/configs/beaconTypes';
import { TorpedoWireframe } from '../assets/projectiles/wireframes';

interface WireframeDisplayProps {
    target: Entity;
}

const WireframeDisplay: React.FC<WireframeDisplayProps> = ({ target }) => {
    let WireframeComponent: React.FC | null = null;

    switch (target.type) {
        case 'ship': {
            const ship = target as Ship;
            // FIX: Corrected type to include 'Unknown' as a possibility.
            const model: ShipModel | 'Unknown' = ship.scanned ? ship.shipModel : 'Unknown';

            if (model === 'Unknown') {
                // FIX: Added non-null assertion as 'Unknown' role is guaranteed to exist.
                WireframeComponent = shipVisuals.Unknown.roles.Unknown!.wireframe;
            } else {
                const visualConfig = shipVisuals[model];
                const roleConfig = visualConfig?.roles[ship.shipRole] ?? visualConfig?.roles[visualConfig.defaultRole];
                // FIX: Added non-null assertion for the final fallback to 'Unknown'.
                const finalConfig = roleConfig ?? shipVisuals.Unknown.roles.Unknown!;
                WireframeComponent = finalConfig.wireframe;
            }
            break;
        }
        case 'planet': {
            const planet = target as Planet;
            const config = planetTypes[planet.planetClass];
            WireframeComponent = config?.wireframe || planetTypes['M'].wireframe;
            break;
        }
        case 'starbase':
            WireframeComponent = starbaseType.wireframe;
            break;
        case 'asteroid_field':
            WireframeComponent = asteroidType.wireframe;
            break;
        case 'event_beacon':
            WireframeComponent = beaconType.wireframe;
            break;
        case 'torpedo_projectile':
            WireframeComponent = TorpedoWireframe;
            break;
        default:
            return null;
    }

    if (!WireframeComponent) {
        return null;
    }
    
    return (
        <div className="w-full h-full p-2">
            <WireframeComponent />
        </div>
    );
};

export default WireframeDisplay;