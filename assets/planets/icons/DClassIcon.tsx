import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        {children}
    </svg>
);

export const DClassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M5 12c0-3.87 3.13-7 7-7" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6"/>
        <path d="M19 12a7 7 0 0 1-7 7" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6"/>
    </Icon>
);
