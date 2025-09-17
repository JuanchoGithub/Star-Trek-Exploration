import React from 'react';
import { BaseIcon } from './BaseIcon';

export const SecurityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="23" x2="23" y2="1" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </BaseIcon>
);
