import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const RomulanShipWireframe: React.FC = () => (
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