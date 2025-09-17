import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        {children}
    </svg>
);

export const RomulanEscortIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path d="M12 2c-3 3-5 8-5 8s3-1 5-3c2 2 5 3 5 3s-2-5-5-8zM4 14v6h16v-6c-4.67 2.33-9.33 2.33-14 0z" />
  </Icon>
);
