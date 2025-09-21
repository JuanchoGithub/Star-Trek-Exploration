import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const ScimitarWireframe: React.FC = () => (
    <WireframeSVG>
        <path d="M 50 10 L 10 50 L 30 90 L 70 90 L 90 50 Z" />
        <path d="M 10 50 L 50 70 L 90 50" />
        <line x1="50" y1="10" x2="50" y2="70" />
        <path d="M 30 90 L 5 80 L 10 50" />
        <path d="M 70 90 L 95 80 L 90 50" />
    </WireframeSVG>
);
