import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const RomulanEscortWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Main hull */}
        <path d="M 50 10 L 20 50 L 50 90 L 80 50 Z" />
        {/* Head */}
        <path d="M 50 10 C 40 25 60 25 50 10" />
        {/* Wings */}
        <path d="M 20 50 L 5 40 L 25 50" />
        <path d="M 80 50 L 95 40 L 75 50" />
        {/* Engine */}
        <rect x="45" y="80" width="10" height="15" />
        {/* Disruptors */}
        <line x1="20" y1="50" x2="30" y2="40" />
        <line x1="80" y1="50" x2="70" y2="40" />
    </WireframeSVG>
);
