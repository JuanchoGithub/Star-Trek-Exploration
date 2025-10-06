import React from 'react';
import { BaseIcon } from './BaseIcon';

export const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </BaseIcon>
);