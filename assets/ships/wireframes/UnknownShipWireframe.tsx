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
        <path d="M 30 70 L 50 20 L 70 70 Z" />
        <text x="50" y="58" textAnchor="middle" fontSize="24" stroke="#fde047" fill="#fde047">?</text>
    </WireframeSVG>
);