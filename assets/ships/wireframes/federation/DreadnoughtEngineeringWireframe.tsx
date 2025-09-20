import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 128 128" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationDreadnoughtEngineeringWireframe: React.FC = () => (
    <WireframeSVG>
        <path d="M1,30L53,30L57,34L57,39L52,44L41,45L42,55L95,51L103,56L105,67L100,74L95,76L42,72L41,82L52,83L57,88L57,93L53,97L1,97L0,85L2,83L38,82L37,71L26,70L11,64L26,57L37,56L38,45L2,44L0,42L1,31Z"/>
    </WireframeSVG>
);