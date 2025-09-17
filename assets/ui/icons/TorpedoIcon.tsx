import React from 'react';
import { BaseIcon } from './BaseIcon';

export const TorpedoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}><path d="M8 20c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2v-4H8v4zm8-18h-2V1h-4v1H8V1H6v1H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></BaseIcon>
);
