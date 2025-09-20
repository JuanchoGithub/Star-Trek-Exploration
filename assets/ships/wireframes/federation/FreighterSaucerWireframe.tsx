import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationFreighterSaucerWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Main Spine */}
        <rect x="10" y="45" width="80" height="10" />
        {/* Bridge */}
        <rect x="85" y="40" width="10" height="20" />
        <line x1="95" y1="50" x2="100" y2="50" />
    </WireframeSVG>
);