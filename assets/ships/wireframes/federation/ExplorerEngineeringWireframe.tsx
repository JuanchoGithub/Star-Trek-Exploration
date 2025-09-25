import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 96 96" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationExplorerEngineeringWireframe: React.FC = () => (
    <WireframeSVG>
        <path d="M47.0 1.0L64.0 5.0 73.0 10.0 82.0 20.0 85.0 30.0 80.0 46.0 59.0 62.0 57.0 75.0 60.0 78.0 66.0 75.0 67.0 63.0 71.0 65.0 70.0 88.0 55.0 83.0 51.0 86.0 49.0 92.0 46.0 92.0 44.0 86.0 40.0 83.0 25.0 88.0 24.0 65.0 28.0 63.0 29.0 75.0 34.0 78.0 38.0 74.0 36.0 62.0 15.0 46.0 10.0 33.0 13.0 20.0 22.0 10.0 31.0 5.0 46.0 2.0Z M43.0 60.0L40.0 63.0 41.0 70.0 44.0 71.0 46.0 67.0 49.0 67.0 50.0 70.0 53.0 71.0 55.0 63.0 52.0 60.0 50.0 61.0 45.0 61.0 44.0 60.0Z" />
    </WireframeSVG>
);