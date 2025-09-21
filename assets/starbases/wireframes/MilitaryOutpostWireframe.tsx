import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const MilitaryOutpostWireframe: React.FC = () => (
    <WireframeSVG>
        <polygon points="50,10 20,30 20,70 50,90 80,70 80,30" />
        <rect x="40" y="40" width="20" height="20" />
        <line x1="50" y1="10" x2="50" y2="40" />
        <line x1="20" y1="30" x2="40" y2="40" />
        <line x1="80" y1="30" x2="60" y2="40" />
        <line x1="20" y1="70" x2="40" y2="60" />
        <line x1="80" y1="70" x2="60" y2="60" />
        <line x1="50" y1="90" x2="50" y2="60" />
        <line x1="5" y1="20" x2="20" y2="30" />
        <line x1="95" y1="20" x2="80" y2="30" />
        <line x1="5" y1="80" x2="20" y2="70" />
        <line x1="95" y1="80" x2="80" y2="70" />
    </WireframeSVG>
);
