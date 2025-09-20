import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationExplorerEngineeringWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Secondary Hull */}
        <ellipse cx="68" cy="72" rx="30" ry="10" />
        {/* Deflector Dish */}
        <ellipse cx="41" cy="72" rx="5" ry="5" />
        <line x1="41" y1="67" x2="41" y2="77" />
        <line x1="36" y1="72" x2="46" y2="72" />

        {/* Neck */}
        <path d="M 50 45 C 55 55, 60 63, 60 63" />
        <path d="M 40 45 C 45 55, 50 63, 50 63" />

        {/* Pylons */}
        <path d="M 80 65 C 85 55, 88 40, 85 30" />
        <line x1="80" y1="65" x2="84" y2="67" /> 
        <line x1="85" y1="30" x2="89" y2="32" /> 

        {/* Nacelle */}
        <ellipse cx="80" cy="25" rx="18" ry="5" />
        <ellipse cx="65" cy="25" rx="4" ry="4" strokeWidth="2" />
        <line x1="62" y1="25" x2="98" y2="25" />
    </WireframeSVG>
);