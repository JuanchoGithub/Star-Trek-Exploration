import React from 'react';
import { BaseIcon } from '../../../ui/icons/BaseIcon';

export const VorchaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}>
        <path d="M12 2l-10 7v2l5 2v7l5 3 5-3v-7l5-2V9L12 2zm-1 15.5V13h2v4.5l-1 1-1-1z"/>
    </BaseIcon>
);
