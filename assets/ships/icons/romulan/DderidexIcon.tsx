import React from 'react';
import { BaseIcon } from '../../../ui/icons/BaseIcon';

export const DderidexIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}>
        <path d="M12 2C6 5 2 10 2 10v4s4 2 10 2 10-2 10-2v-4s-4-5-10-5zm0 4c4 0 8 2 8 2v1s-4 2-8 2-8-2-8-2v-1s4-2 8-2z"/>
        <path d="M4 16v3h16v-3c-4 2-12 2-16 0z"/>
    </BaseIcon>
);
