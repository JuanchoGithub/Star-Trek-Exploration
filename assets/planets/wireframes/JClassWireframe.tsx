import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const JClassWireframe: React.FC = () => (
    <WireframeSVG>
        <circle cx="50" cy="50" r="35" />
        <ellipse cx="50" cy="50" rx="45" ry="15" transform="rotate(-15 50 50)" />
        <line x1="15" y1="40" x2="85" y2="40" />
        <line x1="20" y1="60" x2="80" y2="60" />
    </WireframeSVG>
);
