import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationCruiserSaucerWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Saucer Section */}
        <ellipse cx="50" cy="40" rx="35" ry="18" />
        <ellipse cx="50" cy="40" r="10" />
        <path d="M 15 40 C 30 30, 70 30, 85 40" />
    </WireframeSVG>
);