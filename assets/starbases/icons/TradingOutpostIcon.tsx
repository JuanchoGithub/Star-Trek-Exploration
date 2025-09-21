import React from 'react';
import { BaseIcon } from '../../ui/icons/BaseIcon';

export const TradingOutpostIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props}>
        {/* Central core */}
        <rect x="9" y="9" width="6" height="6" />
        {/* Docking arms */}
        <path d="M9 11H2v2h7z" />
        <path d="M15 11h7v2h-7z" />
        <path d="M11 9V2h2v7z" />
        <path d="M11 15v7h2v-7z" />
        {/* Cargo pods */}
        <rect x="2" y="5" width="4" height="4" />
        <rect x="18" y="15" width="4" height="4" />
        <rect x="5" y="18" width="4" height="4" />
    </BaseIcon>
);
