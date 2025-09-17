import React from 'react';
import { BaseIcon } from '../../ui/icons/BaseIcon';

export const TorpedoProjectileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} viewBox="0 0 24 24">
        <defs>
            <radialGradient id="torpedoGradient">
                <stop offset="0%" stopColor="white" />
                <stop offset="50%" stopColor="yellow" />
                <stop offset="100%" stopColor="orange" />
            </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="8" fill="url(#torpedoGradient)" />
    </BaseIcon>
);