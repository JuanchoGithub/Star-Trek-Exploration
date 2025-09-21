import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const GalaxyWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Saucer */}
        <ellipse cx="50" cy="35" rx="48" ry="20" />
        <ellipse cx="50" cy="35" r="12" />
        <path d="M 2 35 C 25 20, 75 20, 98 35" />
        {/* Neck */}
        <path d="M 40 50 L 50 65" />
        <path d="M 60 50 L 55 65" />
        {/* Secondary Hull */}
        <ellipse cx="50" cy="80" rx="40" ry="15" />
        <ellipse cx="25" cy="80" rx="8" ry="8" />
        {/* Pylons */}
        <path d="M 75 75 C 85 65, 90 50, 85 40" />
        <path d="M 25 75 C 15 65, 10 50, 15 40" />
        {/* Nacelles */}
        <ellipse cx="85" cy="35" rx="20" ry="6" />
        <ellipse cx="15" cy="35" rx="20" ry="6" />
    </WireframeSVG>
);
