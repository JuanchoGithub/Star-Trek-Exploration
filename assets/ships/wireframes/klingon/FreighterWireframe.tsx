import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const KlingonFreighterWireframe: React.FC = () => (
    <WireframeSVG>
        <polygon points="10,30 90,40 85,70 15,60" />
        <line x1="10" y1="30" x2="15" y2="60" />
        <line x1="90" y1="40" x2="85" y2="70" />
        <rect x="30" y="20" width="15" height="15" />
        <line x1="37.5" y1="20" x2="37.5" y2="33" />
        <rect x="20" y="65" width="20" height="10" />
        <rect x="60" y="70" width="20" height="10" />
    </WireframeSVG>
);
