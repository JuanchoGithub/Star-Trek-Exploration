import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationShipWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Pylon */}
        <line x1="70" y1="55" x2="80" y2="35" />
        {/* Neck */}
        <polygon points="45,48 55,48 65,60 55,60" />
        {/* Secondary Hull */}
        <ellipse cx="70" cy="70" rx="35" ry="12" />
        {/* Nacelle */}
        <rect x="75" y="25" width="23" height="10" rx="5" />
        {/* Saucer Section */}
        <ellipse cx="40" cy="40" rx="35" ry="10" />
    </WireframeSVG>
);