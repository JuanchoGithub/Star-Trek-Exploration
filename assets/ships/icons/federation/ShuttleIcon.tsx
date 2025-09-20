import React from 'react';
import { BaseIcon } from '../../../ui/icons/BaseIcon';

export const FederationShuttleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}>
        <path d="M12 2L2 7v10l3-2V9l7-4 7 4v6l3 2V7L12 2z"/>
        <path d="M5 17h14v2H5z"/>
    </BaseIcon>
);