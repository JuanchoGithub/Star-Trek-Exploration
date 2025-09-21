import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const DefiantWireframe: React.FC = () => (
    <WireframeSVG>
        <path d="M 50 10 L 20 40 L 20 60 L 30 70 L 70 70 L 80 60 L 80 40 Z" />
        <line x1="50" y1="10" x2="50" y2="70" />
        <line x1="20" y1="50" x2="80" y2="50" />
        <rect x="45" y="12" width="10" height="8" />
        <path d="M 20 40 L 5 45" />
        <path d="M 80 40 L 95 45" />
        <ellipse cx="5" cy="48" rx="4" ry="8" />
        <ellipse cx="95" cy="48" rx="4" ry="8" />
    </WireframeSVG>
);
