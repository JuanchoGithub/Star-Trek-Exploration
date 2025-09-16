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
        <polygon points="50,15 80,40 70,85 30,85 20,40" />
        <line x1="50" y1="15" x2="50" y2="85" />
        <line x1="20" y1="40" x2="80" y2="40" />
        <line x1="30" y1="85" x2="70" y2="85" />
    </WireframeSVG>
);