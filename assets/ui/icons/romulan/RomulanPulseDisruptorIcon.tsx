
import React from 'react';
import { BaseIcon } from '../BaseIcon';

export const RomulanPulseDisruptorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h20" />
        <path d="M12 4l3 8-3 8-3-8 3-8z" />
        <path d="M20 7l-2 5 2 5" />
        <path d="M4 7l2 5-2 5" />
    </BaseIcon>
);
