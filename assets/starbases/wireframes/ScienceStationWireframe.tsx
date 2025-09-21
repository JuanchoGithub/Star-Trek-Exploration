import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const ScienceStationWireframe: React.FC = () => (
    <WireframeSVG>
        <circle cx="50" cy="50" r="10" />
        <circle cx="50" cy="50" r="30" />
        <circle cx="50" cy="50" r="45" strokeDasharray="5 5"/>
        <line x1="50" y1="20" x2="50" y2="5" />
        <line x1="50" y1="80" x2="50" y2="95" />
        <line x1="20" y1="50" x2="5" y2="50" />
        <line x1="80" y1="50" x2="95" y2="50" />
        <line x1="71" y1="29" x2="85" y2="15" />
        <line x1="29" y1="71" x2="15" y2="85" />
    </WireframeSVG>
);
