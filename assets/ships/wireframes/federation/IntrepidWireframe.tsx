import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const IntrepidWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Main Hull */}
        <path d="M 50 10 L 10 50 L 50 60 L 90 50 Z" />
        <ellipse cx="50" cy="50" rx="40" ry="10" />
        <rect x="45" y="12" width="10" height="8" />
        {/* Pylons */}
        <path d="M 40 55 C 30 70, 30 85, 40 95" />
        <path d="M 60 55 C 70 70, 70 85, 60 95" />
        {/* Nacelles */}
        <ellipse cx="40" cy="98" rx="20" ry="4" />
        <ellipse cx="60" cy="98" rx="20" ry="4" />
    </WireframeSVG>
);
