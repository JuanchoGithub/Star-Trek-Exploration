import React from 'react';
import { BaseIcon } from '../BaseIcon';

export const RomulanEngineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12c0-5 4-9 9-9s9 4 9 9-4 9-9 9"/>
        <path d="M12 3v18"/>
        <path d="M18 12h-6"/>
        <path d="M3 12c0 3 2 6 5 7"/>
    </BaseIcon>
);
