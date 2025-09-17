import React from 'react';
import { BaseIcon } from './BaseIcon';

export const EngineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/></BaseIcon>
);
