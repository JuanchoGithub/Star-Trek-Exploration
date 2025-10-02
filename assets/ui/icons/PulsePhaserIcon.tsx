import React from 'react';
import { BaseIcon } from './BaseIcon';

export const PulsePhaserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 7l-5.5 5.5" />
        <path d="M23 7l-5.5 5.5" />
        <path d="M15 17l-5.5-5.5" />
        <path d="M23 17l-5.5-5.5" />
        <path d="M2 12h5" />
        <path d="M11 12h11" />
    </BaseIcon>
);