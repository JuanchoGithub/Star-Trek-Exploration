import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const PirateShipWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Main Hull */}
        <polygon points="20,40 80,30 85,70 15,80" />
        <line x1="20" y1="40" x2="15" y2="80" />
        <line x1="80" y1="30" x2="85" y2="70" />

        {/* Command Module */}
        <rect x="55" y="20" width="20" height="15" />
        <line x1="65" y1="30" x2="65" y2="35" />

        {/* Weapon Pod 1 (Top Left) */}
        <rect x="15" y="25" width="15" height="15" />
        <line x1="22.5" y1="25" x2="22.5" y2="20" />

        {/* Weapon Pod 2 (Bottom Right) */}
        <circle cx="88" cy="75" r="8" />
        <line x1="88" y1="75" x2="95" y2="75" />

        {/* Engine Section */}
        <rect x="10" y="75" width="15" height="15" />
        <line x1="5" y1="82.5" x2="10" y2="82.5" />

        {/* Hull Details / "Greebles" */}
        <path d="M 30 50 L 40 55 L 35 65" />
        <rect x="60" y="50" width="10" height="10" />
    </WireframeSVG>
);