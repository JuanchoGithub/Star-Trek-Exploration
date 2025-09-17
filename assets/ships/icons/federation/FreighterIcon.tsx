import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        {children}
    </svg>
);

export const FederationFreighterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        {/* Main cargo section */}
        <rect x="2" y="9" width="16" height="6" rx="1"/>
        {/* Command section */}
        <rect x="18" y="10" width="4" height="4" rx="1"/>
        {/* Engine */}
        <rect x="2" y="6" width="4" height="2" rx="1"/>
        <rect x="2" y="16" width="4" height="2" rx="1"/>
    </Icon>
);
