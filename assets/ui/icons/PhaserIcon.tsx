import React from 'react';
import { BaseIcon } from './BaseIcon';

export const PhaserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}>
        <path d="M20 9V7c0-1.1-.9-2-2-2h-3c-1.1 0-2 .9-2 2v2H5v6h15V9h-2zm-5 0H9V7h6v2z" />
    </BaseIcon>
);
