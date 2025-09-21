import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const VorchaWireframe: React.FC = () => (
    <WireframeSVG>
        <path d="M 50 15 L 40 40 L 10 30 L 30 70 L 50 85 L 70 70 L 90 30 L 60 40 Z" />
        <line x1="50" y1="15" x2="50" y2="85" />
        <line x1="10" y1="30" x2="30" y2="70" />
        <line x1="90" y1="30" x2="70" y2="70" />
        <rect x="45" y="20" width="10" height="10" />
    </WireframeSVG>
);
