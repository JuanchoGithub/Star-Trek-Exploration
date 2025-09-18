import React from 'react';
import { BaseIcon } from '../BaseIcon';

export const BatlethIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 15c4-10 14-10 18 0" />
        <path d="M5 15c3-6 11-6 14 0" />
        <path d="M9 14v-2h6v2" />
        <path d="M6 15l-3 4" />
        <path d="M18 15l3 4" />
    </BaseIcon>
);
