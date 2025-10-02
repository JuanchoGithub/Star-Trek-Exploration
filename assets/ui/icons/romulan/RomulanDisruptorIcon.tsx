
import React from 'react';
import { BaseIcon } from '../BaseIcon';

export const RomulanDisruptorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h20" />
        <path d="M5 12l2-3h10l2 3" />
        <path d="M5 12l2 3h10l2-3" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
    </BaseIcon>
);
