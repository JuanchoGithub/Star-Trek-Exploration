import React from 'react';
import { BaseIcon } from '../BaseIcon';

export const RomulanWeaponIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 15l10-10 4 4L7 19H3v-4z"/>
        <path d="M14 6L21 13"/>
        <path d="M18 3l3 3"/>
    </BaseIcon>
);
