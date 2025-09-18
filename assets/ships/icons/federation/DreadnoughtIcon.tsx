import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="currentColor" {...props}>
        {children}
    </svg>
);

export const FederationDreadnoughtIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path fillRule="evenodd" d="M1,30L53,30L57,34L57,39L52,44L41,45L42,55L95,51L103,56L105,67L100,74L95,76L42,72L41,82L52,83L57,88L57,93L53,97L1,97L0,85L2,83L38,82L37,71L26,70L11,64L26,57L37,56L38,45L2,44L0,42L1,31Z M66,44L76,34L87,30L103,31L114,37L122,46L126,56L126,71L120,84L108,94L99,97L87,97L73,91L66,84L67,81L97,83L104,80L111,72L112,58L104,47L97,44L66,45Z"/>
    </Icon>
);
