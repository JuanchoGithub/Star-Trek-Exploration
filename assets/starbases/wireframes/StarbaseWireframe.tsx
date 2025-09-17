import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const StarbaseWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Central Spire */}
        <line x1="50" y1="90" x2="50" y2="30" />
        {/* Main Dish */}
        <path d="M 20 30 Q 50 10 80 30" />
        <path d="M 20 30 Q 50 45 80 30" />
        {/* Docking Arms */}
        <line x1="50" y1="60" x2="20" y2="45" />
        <line x1="50" y1="60" x2="80" y2="45" />
        <line x1="50" y1="75" x2="30" y2="70" />
        <line x1="50" y1="75" x2="70" y2="70" />
        {/* Lower Section */}
        <rect x="45" y="85" width="10" height="10" />
    </WireframeSVG>
);