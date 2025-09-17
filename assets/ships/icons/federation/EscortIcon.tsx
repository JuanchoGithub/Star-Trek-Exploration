import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        {children}
    </svg>
);

export const FederationEscortIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        {/* Nacelles */}
        <rect x="2" y="11" width="5" height="2.5" rx="1"/>
        <rect x="17" y="11" width="5" height="2.5" rx="1"/>
        {/* Main Hull */}
        <path d="M7 8h10l2 4H5l2-4z"/>
        <path d="M5 12h14v2c0 1.66-3.14 3-7 3s-7-1.34-7-3v-2z"/>
    </Icon>
);
