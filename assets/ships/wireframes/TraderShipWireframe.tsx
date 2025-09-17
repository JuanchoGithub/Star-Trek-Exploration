import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const TraderShipWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Main Cargo Hold */}
        <rect x="15" y="35" width="70" height="40" />
        <line x1="15" y1="55" x2="85" y2="55" />
        <line x1="35" y1="35" x2="35" y2="75" />
        <line x1="65" y1="35" x2="65" y2="75" />

        {/* Bridge/Cockpit */}
        <polygon points="85,45 95,50 85,55" />
        <line x1="85" y1="50" x2="95" y2="50" />

        {/* Engine pods */}
        <rect x="5" y="30" width="10" height="15" />
        <rect x="5" y="65" width="10" height="15" />

        {/* Antennae/Sensor array */}
        <line x1="50" y1="35" x2="50" y2="25" />
        <line x1="45" y1="25" x2="55" y2="25" />
        
        {/* Docking clamp */}
        <path d="M 50 75 L 50 85 L 45 90" />
        <path d="M 50 85 L 55 90" />
    </WireframeSVG>
);