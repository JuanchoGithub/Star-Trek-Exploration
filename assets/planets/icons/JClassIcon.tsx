import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        {children}
    </svg>
);

export const JClassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <circle cx="12" cy="12" r="8" />
        <ellipse cx="12" cy="12" rx="11" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(-20 12 12)" />
    </Icon>
);
