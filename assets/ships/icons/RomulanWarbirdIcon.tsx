import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        {children}
    </svg>
);

export const RomulanWarbirdIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path d="M21 9c-2.17-1.67-4.56-3-7-3-2.44 0-4.83 1.33-7 3L2 14h5v3c0 1.66 1.34 3 3 3h4c1.66 0 3-1.34 3-3v-3h5l-5-5z" />
  </Icon>
);