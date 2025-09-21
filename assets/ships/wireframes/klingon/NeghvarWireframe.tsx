import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const NeghvarWireframe: React.FC = () => (
    <WireframeSVG>
        <path d="M 50 10 L 20 40 L 30 80 L 50 90 L 70 80 L 80 40 Z" />
        <path d="M 30 80 L 10 70 L 20 40" />
        <path d="M 70 80 L 90 70 L 80 40" />
        <line x1="50" y1="10" x2="50" y2="90" />
        <line x1="30" y1="80" x2="70" y2="80" />
        <rect x="45" y="15" width="10" height="15" />
    </WireframeSVG>
);
