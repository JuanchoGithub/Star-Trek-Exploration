import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationEscortEngineeringWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Bottom Half of Hull */}
        <path d="M 10 50 L 90 50 L 80 60 L 20 60 Z" />
        {/* Deflector */}
        <circle cx="15" cy="50" r="5" />
        {/* Bottom Nacelle Pylons */}
        <line x1="30" y1="60" x2="20" y2="75" />
        <line x1="70" y1="60" x2="80" y2="75" />
        {/* Bottom Nacelles */}
        <ellipse cx="20" cy="80" rx="15" ry="4" />
        <ellipse cx="80" cy="80" rx="15" ry="4" />
    </WireframeSVG>
);