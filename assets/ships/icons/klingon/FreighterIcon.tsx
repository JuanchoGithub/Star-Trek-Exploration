import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        {children}
    </svg>
);

export const KlingonFreighterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path d="M2 8v8h14L22 8H2zm17 3l-2 2h-2v-2h2l2-2v2zM5 11h4v2H5v-2z"/>
    </Icon>
);
