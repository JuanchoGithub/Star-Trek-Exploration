import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const NausicaanBattleshipWireframe: React.FC = () => (
    <WireframeSVG>
        <polygon points="10,50 40,20 90,40 70,80 20,90" />
        <rect x="30" y="40" width="40" height="30" />
        <line x1="40" y1="20" x2="70" y2="40" />
        <line x1="20" y1="90" x2="30" y2="70" />
        <line x1="90" y1="40" x2="70" y2="70" />
    </WireframeSVG>
);
