import React from 'react';
import { BaseIcon } from './BaseIcon';

export const FederationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}>
        <path d="M12.38,3.22,4.33,18.54a1,1,0,0,0,.9,1.46h13.54a1,1,0,0,0,.9-1.46L11.62,3.22A1,1,0,0,0,12.38,3.22Zm-.76,0L18.77,18H5.23Z M11,10.23a1,1,0,0,1,1-1h.05a1,1,0,0,1,1,1v4.32a1,1,0,0,1-1,1h-.05a1,1,0,0,1-1-1Z" />
    </BaseIcon>
);

export const KlingonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}>
        <path d="M12,2a4.47,4.47,0,0,0-4,2,4.47,4.47,0,0,0-4,2,11.18,11.18,0,0,0,1,6,1,1,0,0,0,1,1h8a1,1,0,0,0,1-1,11.18,11.18,0,0,0,1-6,4.47,4.47,0,0,0-4-2A4.47,4.47,0,0,0,12,2Zm5,10H7a9.23,9.23,0,0,1-1-4,2.5,2.5,0,0,1,2-2,2.5,2.5,0,0,1,2,2,1.4,1.4,0,0,0,2,0,2.5,2.5,0,0,1,2-2,2.5,2.5,0,0,1,2,2A9.23,9.23,0,0,1,17,12Z M12,14.21,8.71,19.54A1,1,0,0,0,9.54,21h5a1,1,0,0,0,.83-1.46Z" />
    </BaseIcon>
);

export const RomulanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <BaseIcon {...props}>
    <path d="M21 9c-2.17-1.67-4.56-3-7-3-2.44 0-4.83 1.33-7 3L2 14h5v3c0 1.66 1.34 3 3 3h4c1.66 0 3-1.34 3-3v-3h5l-5-5z" />
  </BaseIcon>
);