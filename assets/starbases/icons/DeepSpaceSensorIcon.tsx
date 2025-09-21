import React from 'react';
import { BaseIcon } from '../../ui/icons/BaseIcon';

export const DeepSpaceSensorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="1.5">
        {/* Central Hub */}
        <circle cx="12" cy="12" r="2" />
        {/* Main Dish */}
        <path d="M4 12c0-4.42 3.58-8 8-8s8 3.58 8 8" />
        {/* Secondary Dish */}
        <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4" strokeDasharray="2 2" />
        {/* Signal Paths */}
        <line x1="12" y1="14" x2="12" y2="22" />
        <line x1="8" y1="22" x2="16" y2="22" />
    </BaseIcon>
);
