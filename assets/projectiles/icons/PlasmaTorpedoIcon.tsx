import React from 'react';
import { BaseIcon } from '../../ui/icons/BaseIcon';

export const PlasmaTorpedoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} viewBox="0 0 24 24">
        <defs>
            <radialGradient id="plasmaGradient">
                <stop offset="0%" stopColor="white" />
                <stop offset="50%" stopColor="#6EE7B7" />
                <stop offset="100%" stopColor="#10B981" />
            </radialGradient>
        </defs>
        <path d="M 2 9 L 14 9 C 18 9 22 10.5 22 12 C 22 13.5 18 15 14 15 L 2 15 L 7 12 Z" fill="url(#plasmaGradient)" />
    </BaseIcon>
);