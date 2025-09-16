import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const DClassWireframe: React.FC = () => (
     <WireframeSVG>
        <circle cx="50" cy="50" r="40" />
        <path d="M 30 25 L 45 45 L 30 60" />
        <path d="M 60 20 L 75 40 L 60 55 L 75 70" />
        <circle cx="55" cy="65" r="7" />
    </WireframeSVG>
);
