import React from 'react';
import { BaseIcon } from '../../../ui/icons/BaseIcon';

export const GalaxyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}>
        <ellipse cx="12" cy="8" rx="10" ry="4"/>
        <path d="M10 11l-1 2h6l-1-2z"/>
        <ellipse cx="12" cy="17" rx="9" ry="3"/>
        <path d="M17 14l3-2v-1l-3 1zm-10 0l-3-2v-1l3 1z"/>
        <rect x="18" y="9" width="5" height="2" rx="1"/>
        <rect x="1" y="9" width="5" height="2" rx="1"/>
    </BaseIcon>
);
