import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationShuttleWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Main Hull */}
        <path d="M 50 10 L 10 35 L 10 65 L 25 75 L 75 75 L 90 65 L 90 35 L 50 10 Z" />
        {/* Cockpit */}
        <path d="M 40 15 L 50 5 L 60 15" />
        {/* Wings/Nacelles */}
        <path d="M 10 35 L 5 45 L 20 50" />
        <path d="M 90 35 L 95 45 L 80 50" />
        {/* Impulse Engine */}
        <rect x="40" y="75" width="20" height="10" />
    </WireframeSVG>
);