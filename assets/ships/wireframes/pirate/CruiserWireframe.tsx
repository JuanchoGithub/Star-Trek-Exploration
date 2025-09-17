import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const PirateCruiserWireframe: React.FC = () => (
    <WireframeSVG>
        <polygon points="10,40 90,20 80,80 20,90" />
        <rect x="30" y="30" width="40" height="50" />
        <line x1="10" y1="40" x2="30" y2="30" />
        <line x1="90" y1="20" x2="70" y2="30" />
        <line x1="80" y1="80" x2="70" y2="80" />
        <line x1="20" y1="90" x2="30" y2="80" />
        <circle cx="15" cy="25" r="8" />
        <circle cx="85" y="85" r="8" />
    </WireframeSVG>
);
