import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 96 96" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationExplorerSaucerWireframe: React.FC = () => (
    <WireframeSVG>
        <path d="M40.0 7.0L27.0 12.0 18.0 20.0 15.0 26.0 15.0 37.0 18.0 43.0 27.0 51.0 40.0 56.0 55.0 56.0 68.0 51.0 79.0 39.0 80.0 27.0 78.0 22.0 71.0 14.0 62.0 9.0 55.0 7.0 41.0 7.0Z M45.0 14.0L56.0 15.0 62.0 17.0 67.0 20.0 71.0 25.0 73.0 30.0 72.0 36.0 64.0 45.0 56.0 48.0 46.0 49.0 33.0 46.0 25.0 40.0 22.0 33.0 22.0 30.0 25.0 23.0 33.0 17.0 39.0 15.0 44.0 15.0Z M41.0 19.0L33.0 22.0 27.0 29.0 27.0 34.0 33.0 41.0 35.0 42.0 39.0 39.0 41.0 29.0 46.0 26.0 49.0 26.0 54.0 29.0 56.0 39.0 60.0 42.0 67.0 36.0 68.0 29.0 62.0 22.0 54.0 19.0 42.0 19.0Z M47.0 36.0L43.0 39.0 43.0 42.0 45.0 44.0 50.0 44.0 52.0 42.0 52.0 39.0 48.0 36.0Z" />
    </WireframeSVG>
);