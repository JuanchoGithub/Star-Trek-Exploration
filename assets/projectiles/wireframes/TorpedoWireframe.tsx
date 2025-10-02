import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const TorpedoWireframe: React.FC = () => (
    <WireframeSVG>
        <circle cx="50" cy="50" r="30" />
        <line x1="50" y1="10" x2="50" y2="90" />
        <line x1="10" y1="50" x2="90" y2="50" />
        <circle cx="50" cy="50" r="40" strokeDasharray="5 5" />
    </WireframeSVG>
);