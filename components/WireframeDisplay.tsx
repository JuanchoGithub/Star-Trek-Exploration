import React from 'react';
import type { Entity, Planet, Ship, ShipModel, Starbase, TorpedoProjectile } from '../../types';
import { planetTypes } from '../assets/planets/configs/planetTypes';
import { shipVisuals } from '../assets/ships/configs/shipVisuals';
import { starbaseTypes } from '../assets/starbases/configs/starbaseTypes';
import { asteroidType } from '../assets/asteroids/configs/asteroidTypes';
import { beaconType } from '../assets/beacons/configs/beaconTypes';
import { FederationShuttleWireframe } from '../assets/ships/wireframes/federation';
import { torpedoStats } from '../assets/projectiles/configs/torpedoTypes';

interface WireframeDisplayProps {
    target: Entity;
}

const WireframeDisplay: React.FC<WireframeDisplayProps> = ({ target }) => {
    let WireframeComponent: React.FC | null = null;

    switch (target.type) {
        case 'ship': {
            const ship = target as Ship;
            const model: ShipModel | 'Unknown' = ship.scanned ? ship.shipModel : 'Unknown';
            const shipClass = ship.scanned ? ship.shipClass : 'Unknown';

            const visualConfig = shipVisuals[model];
            const classConfig = visualConfig?.classes[shipClass] ?? shipVisuals.Unknown.classes['Unknown']!;
            WireframeComponent = classConfig.wireframe;
            break;
        }
        case 'planet': {
            const planet = target as Planet;
            const config = planetTypes[planet.planetClass];
            WireframeComponent = config?.wireframe || planetTypes['M'].wireframe;
            break;
        }
        case 'starbase': {
            const starbase = target as Starbase;
            const config = starbaseTypes[starbase.starbaseType];
            WireframeComponent = config.wireframe;
            break;
        }
        case 'asteroid_field':
            WireframeComponent = asteroidType.wireframe;
            break;
        case 'event_beacon':
            WireframeComponent = beaconType.wireframe;
            break;
        case 'torpedo_projectile': {
            const torpedo = target as TorpedoProjectile;
            WireframeComponent = torpedoStats[torpedo.torpedoType].wireframe;
            break;
        }
        case 'shuttle':
            WireframeComponent = FederationShuttleWireframe;
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