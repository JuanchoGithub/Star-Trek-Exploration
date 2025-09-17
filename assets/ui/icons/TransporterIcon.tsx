import React from 'react';
import { BaseIcon } from './BaseIcon';

export const TransporterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="12" r="5" strokeDasharray="2 2" />
        <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
        <circle cx="12" cy="12" r="11" strokeDasharray="4 4" />
    </BaseIcon>
);
