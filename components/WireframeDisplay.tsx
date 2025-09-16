import React from 'react';
import type { Entity, Planet } from '../types';
import { planetTypes } from '../assets/planets/configs/planetTypes';

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

const KlingonShipWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Head */}
        <path d="M 40 20 Q 50 10 60 20" />
        <line x1="50" y1="15" x2="50" y2="40" />
        {/* Body */}
        <path d="M 40 40 L 30 70 L 50 90 L 70 70 L 60 40 Z" />
        {/* Wings */}
        <path d="M 40 40 L 10 50 L 30 70" />
        <path d="M 60 40 L 90 50 L 70 70" />
    </WireframeSVG>
);

const RomulanShipWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Head */}
        <path d="M 50 15 C 40 25, 40 40, 50 50" />
        <path d="M 50 15 C 60 25, 60 40, 50 50" />
        <line x1="50" y1="15" x2="50" y2="5" />
        
        {/* Body/Wings */}
        <path d="M 50 50 C 10 50, 10 95, 50 95" />
        <path d="M 50 50 C 90 50, 90 95, 50 95" />
        
        {/* Center line */}
        <line x1="50" y1="50" x2="50" y2="95" />
    </WireframeSVG>
);

const PirateShipWireframe: React.FC = () => (
    <WireframeSVG>
        <polygon points="50,15 80,40 70,85 30,85 20,40" />
        <line x1="50" y1="15" x2="50" y2="85" />
        <line x1="20" y1="40" x2="80" y2="40" />
        <line x1="30" y1="85" x2="70" y2="85" />
    </WireframeSVG>
);

const TraderShipWireframe: React.FC = () => (
    <WireframeSVG>
        <rect x="20" y="30" width="60" height="40" />
        <rect x="65" y="20" width="20" height="20" />
        <line x1="20" y1="50" x2="80" y2="50" />
    </WireframeSVG>
);

const UnknownShipWireframe: React.FC = () => (
    <WireframeSVG>
        <path d="M 30 70 L 50 20 L 70 70 Z" />
        <text x="50" y="58" textAnchor="middle" fontSize="24" stroke="#fde047" fill="#fde047">?</text>
    </WireframeSVG>
);


const WireframeDisplay: React.FC<WireframeDisplayProps> = ({ target }) => {
    let wireframe = null;

    if (target.type === 'ship' && !target.scanned) {
        return (
            <div className="w-full h-full p-2">
                <UnknownShipWireframe />
            </div>
        );
    }

    switch (target.type) {
        case 'planet':
            const planet = target as Planet;
            const planetConfig = planetTypes[planet.planetClass];
            if (planetConfig) {
                const WireframeComponent = planetConfig.wireframe;
                wireframe = <WireframeComponent />;
            } else {
                // Fallback to M-class if config not found
                const FallbackWireframe = planetTypes['M'].wireframe;
                wireframe = <FallbackWireframe />;
            }
            break;
        case 'starbase':
            wireframe = <StarbaseWireframe />;
            break;
        case 'asteroid_field':
            wireframe = <AsteroidWireframe />;
            break;
        case 'ship':
            if (target.faction === 'Klingon') {
                wireframe = <KlingonShipWireframe />;
            } else if (target.faction === 'Romulan') {
                wireframe = <RomulanShipWireframe />;
            } else if (target.faction === 'Pirate') {
                wireframe = <PirateShipWireframe />;
            } else { // Independent / Federation
                wireframe = <TraderShipWireframe />;
            }
            break;
        default:
            return null;
    }

    return (
        <div className="w-full h-full p-2">
            {wireframe}
        </div>
    );
};

export default WireframeDisplay;
