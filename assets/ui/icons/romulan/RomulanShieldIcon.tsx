import React from 'react';
import { BaseIcon } from '../BaseIcon';

export const RomulanShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M16 8c-1-1-1-2-2-2-2 0-3 2-3 2s-1-2-3-2c-1 0-1 1-2 2-2 2 0 4 3 6 1 1 2 1 2 1s1 0 2-1c3-2 5-4 3-6z" />
    </BaseIcon>
);
