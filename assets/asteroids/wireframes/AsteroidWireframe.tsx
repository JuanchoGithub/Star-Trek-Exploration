import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const AsteroidWireframe: React.FC = () => (
    <WireframeSVG>
        <polygon points="50,10 85,30 90,60 70,90 30,85 15,55 25,20" />
        <line x1="50" y1="10" x2="55" y2="50" />
        <line x1="85" y1="30" x2="55" y2="50" />
        <line x1="15" y1="55" x2="55" y2="50" />
        <line x1="70" y1="90" x2="55" y2="50" />
    </WireframeSVG>
);