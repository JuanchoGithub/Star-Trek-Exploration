import React from 'react';
import { BaseIcon } from './BaseIcon';

export const ScanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}><path d="M11.5 9C10.12 9 9 10.12 9 11.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5S12.88 9 11.5 9zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-3.21 14.21c-1.53 1.28-3.48 2.04-5.55 2.04s-4.02-.76-5.55-2.04C3.25 16.48 2.3 14.15 2.3 11.5 2.3 8.85 3.25 6.52 4.69 4.79c1.53-1.28 3.48-2.04 5.55-2.04s4.02.76 5.55 2.04c1.44 1.73 2.39 4.06 2.39 6.71s-.95 4.98-2.39 6.71z"/></BaseIcon>
);
