import React from 'react';
import type { Entity, Planet, Ship } from '../types';
import { planetTypes } from '../assets/planets/configs/planetTypes';
import { shipTypes, ShipFaction } from '../assets/ships/configs/shipTypes';

interface WireframeDisplayProps {
    target: Entity;
}

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

const StarbaseWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Central Spire */}
        <line x1="50" y1="90" x2="50" y2="30" />
        {/* Main Dish */}
        <path d="M 20 30 Q 50 10 80 30" />
        <path d="M 20 30 Q 50 45 80 30" />
        {/* Docking Arms */}
        <line x1="50" y1="60" x2="20" y2="45" />
        <line x1="50" y1="60" x2="80" y2="45" />
        <line x1="50" y1="75" x2="30" y2="70" />
        <line x1="50" y1="75" x2="70" y2="70" />
        {/* Lower Section */}
        <rect x="45" y="85" width="10" height="10" />
    </WireframeSVG>
);

const AsteroidWireframe: React.FC = () => (
    <WireframeSVG>
        <polygon points="50,10 85,30 90,60 70,90 30,85 15,55 25,20" />
        <line x1="50" y1="10" x2="55" y2="50" />
        <line x1="85" y1="30" x2="55" y2="50" />
        <line x1="15" y1="55" x2="55" y2="50" />
        <line x1="70" y1="90" x2="55" y2="50" />
    </WireframeSVG>
);


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
            WireframeComponent = StarbaseWireframe;
            break;
        case 'asteroid_field':
            WireframeComponent = AsteroidWireframe;
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