import React from 'react';
import { BaseIcon } from '../BaseIcon';

export const KlingonSecurityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19L19 5" />
        <path d="M5 5l14 14" />
        <path d="M11 5H5v6" />
        <path d="M13 19h6v-6" />
    </BaseIcon>
);
