import React from 'react';
import { BaseIcon } from '../../ui/icons/BaseIcon';

export const EventBeaconIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
        <path d="M15.41 6.59C14.05 5.23 12.04 4.5 10 4.5c-2.04 0-4.05.73-5.41 2.09" />
        <path d="M17.5 4.5c2.76 2.76 2.76 7.24 0 10" transform="rotate(45 12 12)" />
    </BaseIcon>
);