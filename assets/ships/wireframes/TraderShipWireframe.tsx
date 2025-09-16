import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const TraderShipWireframe: React.FC = () => (
    <WireframeSVG>
        <rect x="20" y="30" width="60" height="40" />
        <rect x="65" y="20" width="20" height="20" />
        <line x1="20" y1="50" x2="80" y2="50" />
    </WireframeSVG>
);