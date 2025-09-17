import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
    <svg xmlns="http://www.w.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        {children}
    </svg>
);

export const FederationCruiserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        {/* Secondary Hull */}
        <path d="M4 16h16c0 1.66-3.58 3-8 3s-8-1.34-8-3z"/>
        {/* Neck */}
        <path d="M11 12h2l3 4H8l3-4z"/>
        {/* Pylons */}
        <path d="M6 16l-3-2v-1l3 1zm12 0l3-2v-1l-3 1z"/>
        {/* Nacelles */}
        <rect x="2" y="9" width="6" height="2" rx="1"/>
        <rect x="16" y="9" width="6" height="2" rx="1"/>
        {/* Saucer */}
        <path d="M4 10c0-2.21 3.58-4 8-4s8 1.79 8 4H4z"/>
    </Icon>
);
