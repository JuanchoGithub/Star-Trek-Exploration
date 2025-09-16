import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const KlingonShipWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Head */}
        <path d="M 40 20 Q 50 10 60 20" />
        <line x1="50" y1="15" x2="50" y2="40" />
        {/* Body */}
        <path d="M 40 40 L 30 70 L 50 90 L 70 70 L 60 40 Z" />
        {/* Wings */}
        <path d="M 40 40 L 10 50 L 30 70" />
        <path d="M 60 40 L 90 50 L 70 70" />
    </WireframeSVG>
);