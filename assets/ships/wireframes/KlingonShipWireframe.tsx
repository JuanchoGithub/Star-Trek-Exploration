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
        {/* Command section / Head */}
        <path d="M 50 15 C 40 25, 45 40, 50 45 C 55 40, 60 25, 50 15 Z" />
        <line x1="50" y1="15" x2="50" y2="45" />

        {/* Main Hull */}
        <path d="M 35 40 L 50 45 L 65 40 L 60 65 L 50 85 L 40 65 Z" />
        
        {/* Wing base */}
        <line x1="35" y1="40" x2="15" y2="35" />
        <line x1="65" y1="40" x2="85" y2="35" />

        {/* Wings - upper edge */}
        <path d="M 15 35 C 5 55, 10 75, 25 80" />
        <path d="M 85 35 C 95 55, 90 75, 75 80" />

        {/* Wings - lower edge */}
        <path d="M 40 65 L 25 80" />
        <path d="M 60 65 L 75 80" />
        
        {/* Wing details / "feathers" */}
        <path d="M 20 45 L 30 65" />
        <path d="M 23 55 L 35 72" />
        <path d="M 80 45 L 70 65" />
        <path d="M 77 55 L 65 72" />
        
        {/* Disruptor Cannons */}
        <rect x="21" y="78" width="8" height="4" transform="rotate(-15 25 80)" />
        <rect x="71" y="78" width="8" height="4" transform="rotate(15 75 80)" />
    </WireframeSVG>
);