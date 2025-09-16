import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const LClassWireframe: React.FC = () => (
    <WireframeSVG>
        <circle cx="50" cy="50" r="40" />
        <circle cx="35" cy="40" r="8" />
        <circle cx="65" cy="60" r="12" />
        <path d="M 20 70 Q 50 60 80 75" />
    </WireframeSVG>
);
