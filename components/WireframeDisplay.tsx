import React from 'react';
import type { Entity, Planet, Ship, TorpedoProjectile } from '../types';
import { planetTypes } from '../assets/planets/configs/planetTypes';
import { shipTypes, ShipFaction } from '../assets/ships/configs/shipTypes';
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
            const faction = ship.scanned ? ship.faction as ShipFaction : 'Unknown';
            const config = shipTypes[faction] || shipTypes['Independent'];
            WireframeComponent = config.wireframe;
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