import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 128 128" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const FederationDreadnoughtSaucerWireframe: React.FC = () => (
    <WireframeSVG>
        <path d="M66,44L76,34L87,30L103,31L114,37L122,46L126,56L126,71L120,84L108,94L99,97L87,97L73,91L66,84L67,81L97,83L104,80L111,72L112,58L104,47L97,44L66,45Z"/>
    </WireframeSVG>
);