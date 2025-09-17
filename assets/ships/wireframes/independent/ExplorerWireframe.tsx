import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const IndependentExplorerWireframe: React.FC = () => (
    <WireframeSVG>
        <polygon points="50,10 20,80 80,80" />
        <line x1="50" y1="10" x2="50" y2="60" />
        <rect x="40" y="60" width="20" height="20" />
        <line x1="20" y1="80" x2="10" y2="90" />
        <line x1="80" y1="80" x2="90" y2="90" />
        <circle cx="10" cy="90" r="5" />
        <circle cx="90" cy="90" r="5" />
    </WireframeSVG>
);
