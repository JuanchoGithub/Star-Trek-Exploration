import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const UnknownShipWireframe: React.FC = () => (
    <WireframeSVG>
        <polygon points="50,10 10,40 50,70 90,40" />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="30" stroke="#fde047" fill="#fde047">?</text>
    </WireframeSVG>
);
