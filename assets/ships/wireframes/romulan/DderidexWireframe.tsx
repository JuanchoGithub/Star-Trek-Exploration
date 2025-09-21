import React from 'react';

const WireframeSVG: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full wireframe-glow">
        <g stroke="#fde047" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const DderidexWireframe: React.FC = () => (
    <WireframeSVG>
        {/* Head Section */}
        <path d="M 50 10 C 35 20, 35 40, 50 60 C 65 40, 65 20, 50 10 Z" />
        <line x1="50" y1="10" x2="50" y2="60" />
        <circle cx="50" cy="20" r="3" />

        {/* Upper Wings (Primary Hull) */}
        <path d="M 50 60 C 20 50, 5 70, 5 95" />
        <path d="M 50 60 C 80 50, 95 70, 95 95" />

        {/* Lower Wings (Secondary Hull) */}
        <path d="M 50 65 C 25 60, 15 75, 15 95" />
        <path d="M 50 65 C 75 60, 85 75, 85 95" />

        {/* Wing Details */}
        <path d="M 40 62 C 25 68, 18 80, 18 95" />
        <path d="M 60 62 C 75 68, 82 80, 82 95" />
        <path d="M 30 65 C 20 75, 15 85, 15 95" />
        <path d="M 70 65 C 80 75, 85 85, 85 95" />
    </WireframeSVG>
);
