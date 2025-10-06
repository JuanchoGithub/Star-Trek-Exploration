import React from 'react';
import { BaseIcon } from './BaseIcon';

export const PauseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </BaseIcon>
);