import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const MClassWireframe: React.FC = () => (
    <WireframeSVG>
        <circle cx="50" cy="50" r="40" />
        <ellipse cx="50" cy="50" rx="40" ry="15" />
        <ellipse cx="50" cy="50" rx="25" ry="38" transform="rotate(30 50 50)" />
        <ellipse cx="50" cy="50" rx="15" ry="40" transform="rotate(-30 50 50)" />
    </WireframeSVG>
);
