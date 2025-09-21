import React from 'react';
import { BaseIcon } from '../../../ui/icons/BaseIcon';

export const IntrepidIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}>
        <path d="M12 2L2 10l10 2 10-2L12 2z"/>
        <path d="M3 11v3l9 2 9-2v-3l-9 3-9-3z"/>
        <path d="M6 15l-3 2v1l3-1zm12 0l3 2v1l-3-1z"/>
        <rect x="2" y="19" width="6" height="2" rx="1"/>
        <rect x="16" y="19" width="6" height="2" rx="1"/>
    </BaseIcon>
);
