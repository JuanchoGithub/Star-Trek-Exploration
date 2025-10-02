import React from 'react';
import { BaseIcon } from '../../ui/icons/BaseIcon';

export const PlasmaTorpedoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} viewBox="0 0 24 24">
        <defs>
            <radialGradient id="plasmaGlowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="white" stopOpacity="1"/>
                <stop offset="60%" stopColor="#67E8F9" stopOpacity="0.8"/> {/* Lighter cyan */}
                <stop offset="100%" stopColor="#0D9488" stopOpacity="0"/> {/* Darker teal */}
            </radialGradient>
            <filter id="plasmaGlowFilter">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
            </filter>
        </defs>
        
        {/* Outer blurry glow */}
        <circle cx="12" cy="12" r="11" fill="url(#plasmaGlowGradient)" filter="url(#plasmaGlowFilter)" />
        
        {/* Main energy ball */}
        <circle cx="12" cy="12" r="9" fill="url(#plasmaGlowGradient)" />
        
        {/* Core */}
        <circle cx="12" cy="12" r="4" fill="white" />
    </BaseIcon>
);
