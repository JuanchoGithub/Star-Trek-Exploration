import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationEscortWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Main Hull */}
        <path d="M 20 40 L 80 40 L 90 50 L 80 60 L 20 60 L 10 50 Z" />
        <line x1="10" y1="50" x2="90" y2="50" />
        {/* Bridge */}
        <rect x="45" y="35" width="10" height="10" />
        {/* Deflector */}
        <circle cx="15" cy="50" r="5" />
        {/* Nacelle Pylons */}
        <line x1="30" y1="40" x2="20" y2="25" />
        <line x1="70" y1="40" x2="80" y2="25" />
        <line x1="30" y1="60" x2="20" y2="75" />
        <line x1="70" y1="60" x2="80" y2="75" />
        {/* Nacelles */}
        <ellipse cx="20" cy="20" rx="15" ry="4" />
        <ellipse cx="80" cy="20" rx="15" ry="4" />
        <ellipse cx="20" cy="80" rx="15" ry="4" />
        <ellipse cx="80" cy="80" rx="15" ry="4" />
    </WireframeSVG>
);
