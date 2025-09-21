import React from 'react';
import { BaseIcon } from '../../ui/icons/BaseIcon';

export const ScienceStationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="1.5">
        {/* Central sphere */}
        <circle cx="12" cy="12" r="3" fill="currentColor" />
        {/* Outer rings */}
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="11" strokeDasharray="4 4"/>
        {/* Radiating arms */}
        <line x1="12" y1="4" x2="12" y2="1" />
        <line x1="12" y1="20" x2="12" y2="23" />
        <line x1="4" y1="12" x2="1" y2="12" />
        <line x1="20" y1="12" x2="23" y2="12" />
        {/* Diagonal arms */}
        <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
        <line x1="7.05" y1="16.95" x2="4.93" y2="19.07" />
    </BaseIcon>
);
