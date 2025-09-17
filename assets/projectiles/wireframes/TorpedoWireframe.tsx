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
        <path d="M 10 45 L 60 45 C 80 45 90 50 90 50 C 90 50 80 55 60 55 L 10 55 L 30 50 Z" />
        <line x1="10" y1="50" x2="70" y2="50" />
    </WireframeSVG>
);
