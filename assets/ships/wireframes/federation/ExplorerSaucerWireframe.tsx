import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationExplorerSaucerWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Saucer Section */}
        <ellipse cx="45" cy="40" rx="40" ry="15" />
        <ellipse cx="45" cy="40" r="8" />
        <path d="M 5 40 C 25 30, 65 30, 85 40" />
        <path d="M 5 40 C 25 50, 65 50, 85 40" />
    </WireframeSVG>
);