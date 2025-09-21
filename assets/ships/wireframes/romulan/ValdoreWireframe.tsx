import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const ValdoreWireframe: React.FC = () => (
    <WireframeSVG>
        <path d="M 50 15 L 10 40 L 20 85 L 80 85 L 90 40 Z" />
        <line x1="50" y1="15" x2="50" y2="85" />
        <path d="M 10 40 C 30 50, 70 50, 90 40" />
        <path d="M 20 85 L 5 70" />
        <path d="M 80 85 L 95 70" />
    </WireframeSVG>
);
