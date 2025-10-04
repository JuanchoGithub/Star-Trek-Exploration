import React from 'react';
import { BaseIcon } from '../../ui/icons/BaseIcon';

export const PlasmaMineIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} viewBox="0 0 24 24">
        <defs>
            <radialGradient id="plasmaMineGlowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="white" stopOpacity="1"/>
                <stop offset="60%" stopColor="#67E8F9" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#0D9488" stopOpacity="0.4"/>
            </radialGradient>
            <filter id="plasmaMineGlowFilter">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
            </filter>
        </defs>
        
        {/* Outer blurry glow */}
        <circle cx="12" cy="12" r="11" fill="url(#plasmaMineGlowGradient)" filter="url(#plasmaMineGlowFilter)" />
        
        {/* Main energy ball */}
        <circle cx="12" cy="12" r="9" fill="url(#plasmaMineGlowGradient)" />
        
        {/* Core */}
        <circle cx="12" cy="12" r="4" fill="white" />
    </BaseIcon>
);
