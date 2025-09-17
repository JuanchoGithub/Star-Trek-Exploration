import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const KlingonEscortWireframe: React.FC = () => (
    <WireframeSVG>
        <path d="M 50 10 L 40 40 L 20 30 L 30 50 L 20 70 L 40 60 L 50 90 L 60 60 L 80 70 L 70 50 L 80 30 L 60 40 Z" />
        <line x1="50" y1="10" x2="50" y2="90" />
        <line x1="20" y1="50" x2="80" y2="50" />
        <circle cx="50" cy="50" r="8" />
    </WireframeSVG>
);
