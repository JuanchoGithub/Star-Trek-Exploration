import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FerengiMarauderWireframe: React.FC = () => (
    <WireframeSVG>
        <path d="M 50 10 L 10 30 L 10 70 L 50 90 L 90 70 L 90 30 Z" />
        <path d="M 10 30 L 50 50 L 90 30" />
        <line x1="50" y1="50" x2="50" y2="90" />
        <path d="M 10 70 L 50 50 L 90 70" />
    </WireframeSVG>
);
