import React from 'react';
import { BaseIcon } from '../../ui/icons/BaseIcon';

export const TorpedoProjectileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} viewBox="0 0 24 24">
        <defs>
            <radialGradient id="photonTorpedoGlow">
                <stop offset="0%" stopColor="white" />
                <stop offset="50%" stopColor="rgba(255, 204, 0, 0.9)" />
                <stop offset="100%" stopColor="rgba(249, 115, 22, 0)" />
            </radialGradient>
        </defs>
        {/* Outer glow */}
        <circle cx="12" cy="12" r="12" fill="url(#photonTorpedoGlow)" />
        {/* Core ball */}
        <circle cx="12" cy="12" r="6" fill="#fb923c" />
        <circle cx="12" cy="12" r="3" fill="white" />
        {/* Star flare */}
        <g opacity="0.7" transform="rotate(45 12 12)">
            <path d="M12 4 L12 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M4 12 L20 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </g>
    </BaseIcon>
);