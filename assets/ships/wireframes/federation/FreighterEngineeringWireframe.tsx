import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationFreighterEngineeringWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Cargo Pods */}
        <rect x="20" y="25" width="20" height="15" />
        <rect x="50" y="25" width="20" height="15" />
        <rect x="20" y="60" width="20" height="15" />
        <rect x="50" y="60" width="20" height="15" />
        {/* Connectors */}
        <line x1="30" y1="40" x2="30" y2="45" />
        <line x1="60" y1="40" x2="60" y2="45" />
        <line x1="30" y1="55" x2="30" y2="60" />
        <line x1="60" y1="55" x2="60" y2="60" />
        {/* Engine */}
        <rect x="0" y="40" width="10" height="20" />
    </WireframeSVG>
);