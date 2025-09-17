import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationCruiserWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Secondary Hull */}
        <ellipse cx="50" cy="80" rx="45" ry="12" />
        <line x1="5" y1="80" x2="95" y2="80" />
        {/* Deflector Dish */}
        <ellipse cx="15" cy="80" rx="7" ry="7" />
        
        {/* Neck */}
        <path d="M 45 68 L 30 50" />
        <path d="M 55 68 L 70 50" />

        {/* Pylons */}
        <path d="M 70 72 L 80 60" />
        <path d="M 30 72 L 20 60" />

        {/* Nacelles */}
        <ellipse cx="20" cy="50" rx="18" ry="5" />
        <ellipse cx="80" cy="50" rx="18" ry="5" />
        <line x1="2" y1="50" x2="38" y2="50" />
        <line x1="62" y1="50" x2="98" y2="50" />

        {/* Saucer Section */}
        <ellipse cx="50" cy="40" rx="35" ry="18" />
        <ellipse cx="50" cy="40" r="10" />
        <path d="M 15 40 C 30 30, 70 30, 85 40" />
    </WireframeSVG>
);
