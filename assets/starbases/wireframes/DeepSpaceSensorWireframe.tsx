import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const DeepSpaceSensorWireframe: React.FC = () => (
    <WireframeSVG>
        <rect x="45" y="45" width="10" height="10" />
        <path d="M 20 50 C 20 28, 80 28, 80 50" />
        <path d="M 30 50 C 30 39, 70 39, 70 50" strokeDasharray="4 4" />
        <line x1="50" y1="45" x2="50" y2="28" />
        <line x1="50" y1="55" x2="50" y2="80" />
        <line x1="30" y1="80" x2="70" y2="80" />
    </WireframeSVG>
);
