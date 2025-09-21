import React from 'react';
import { BaseIcon } from '../../ui/icons/BaseIcon';

export const MilitaryOutpostIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}>
        {/* Central hub */}
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.69L17.31 8 12 11.31 6.69 8 12 4.69zM5 8.69l7 4.32 7-4.32V15.3l-7 4.32-7-4.32V8.69z"/>
        {/* Weapon platforms */}
        <path d="M2 7h2v2H2z" />
        <path d="M20 7h2v2h-2z" />
        <path d="M2 15h2v2H2z" />
        <path d="M20 15h2v2h-2z" />
    </BaseIcon>
);
