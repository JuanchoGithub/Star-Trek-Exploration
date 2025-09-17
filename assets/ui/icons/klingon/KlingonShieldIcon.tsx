import React from 'react';
import { BaseIcon } from '../BaseIcon';

export const KlingonShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}>
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 5l2-2 2 2h3l-2 3 2 3h-3l-2 2-2-2H7l2-3-2-3h3z"/>
    </BaseIcon>
);
