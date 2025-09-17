import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        {children}
    </svg>
);

export const FederationExplorerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        {/* Pylon (drawn first, so it's in the back) */}
        <polygon points="16,13 18,13 19,8 17,8"/>
        
        {/* Neck (drawn second) */}
        <polygon points="10,11.5 12,11.5 14,14 12,14"/>
        
        {/* Secondary Hull */}
        <ellipse cx="16" cy="16" rx="8" ry="3"/>
        
        {/* Nacelle */}
        <rect x="17" y="5" width="7" height="3" rx="1.5"/>

        {/* Saucer Section (drawn last, so it's on top) */}
        <ellipse cx="9" cy="9" rx="8" ry="2.5"/>
    </Icon>
);
