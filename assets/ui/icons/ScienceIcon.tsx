import React from 'react';
import { BaseIcon } from './BaseIcon';

export const ScienceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2H9v-2h2v-2H9V9h2V7h2v2h2v2h-2v2h2v2h-2v2h-2z"/></BaseIcon>
);
