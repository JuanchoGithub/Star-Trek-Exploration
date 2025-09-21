import React from 'react';
import { BaseIcon } from '../../../ui/icons/BaseIcon';

export const ScimitarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}>
        <path d="M12 2L2 12l2 8h16l2-8L12 2zm-1 5h2v5h-2V7zm-4 7l-2 2h10l-2-2H7z"/>
    </BaseIcon>
);
