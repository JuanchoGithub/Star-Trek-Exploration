import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const QuantumTorpedoWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Outer boundary */}
        <circle cx="50" cy="50" r="40" />
        {/* Inner core */}
        <circle cx="50" cy="50" r="10" />
        {/* Energy arcs */}
        <path d="M 50 10 A 40 40 0 0 1 90 50" />
        <path d="M 50 90 A 40 40 0 0 1 10 50" />
        <path d="M 10 50 A 40 40 0 0 1 50 10" />
        <path d="M 90 50 A 40 40 0 0 1 50 90" />
        {/* Crosshairs */}
        <line x1="50" y1="20" x2="50" y2="80" strokeDasharray="4 4" />
        <line x1="20" y1="50" x2="80" y2="50" strokeDasharray="4 4" />
    </WireframeSVG>
);
