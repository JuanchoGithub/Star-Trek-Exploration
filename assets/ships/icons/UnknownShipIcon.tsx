import React from 'react';
import { BaseIcon } from '../../ui/icons/BaseIcon';

export const UnknownShipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 8 12 14 22 8 12 2" />
        <line x1="2" y1="8" x2="12" y2="14" />
        <line x1="22" y1="8" x2="12" y2="14" />
        <line x1="12" y1="2" x2="12" y2="14" />
    </BaseIcon>
);
