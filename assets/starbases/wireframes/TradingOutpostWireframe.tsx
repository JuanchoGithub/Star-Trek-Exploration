import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const TradingOutpostWireframe: React.FC = () => (
    <WireframeSVG>
        <rect x="35" y="35" width="30" height="30" />
        <line x1="35" y1="50" x2="10" y2="50" />
        <line x1="65" y1="50" x2="90" y2="50" />
        <line x1="50" y1="35" x2="50" y2="10" />
        <line x1="50" y1="65" x2="50" y2="90" />
        <rect x="5" y="20" width="10" height="20" />
        <rect x="85" y="60" width="10" height="20" />
        <rect x="60" y="5" width="20" height="10" />
    </WireframeSVG>
);
