import React from 'react';
import { BaseIcon } from './BaseIcon';

export const ShuttleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}>
        <path d="M12 2L2 7v10l3-2V9l7-4 7 4v6l3 2V7L12 2z"/>
    </BaseIcon>
);
