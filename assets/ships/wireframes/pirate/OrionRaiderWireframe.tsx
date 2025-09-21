import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const OrionRaiderWireframe: React.FC = () => (
    <WireframeSVG>
        <path d="M 50 10 L 10 40 L 50 90 L 90 40 Z" />
        <line x1="10" y1="40" x2="90" y2="40" />
        <line x1="50" y1="10" x2="50" y2="90" />
    </WireframeSVG>
);
