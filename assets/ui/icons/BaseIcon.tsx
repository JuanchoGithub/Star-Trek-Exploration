import React from 'react';

export const BaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, viewBox = "0 0 24 24", ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} fill="currentColor" {...props}>
        {children}
    </svg>
);
