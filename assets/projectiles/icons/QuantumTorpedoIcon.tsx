import React from 'react';
import { BaseIcon } from '../../ui/icons/BaseIcon';

export const QuantumTorpedoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <BaseIcon {...props} viewBox="0 0 24 24">
        <defs>
            <radialGradient id="quantumGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="white" stopOpacity="1"/>
                <stop offset="60%" stopColor="#A5B4FC" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0"/>
            </radialGradient>
            <filter id="quantumFilter">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
            </filter>
        </defs>
        
        {/* Outer blurry glow */}
        <circle cx="12" cy="12" r="10" fill="url(#quantumGlow)" filter="url(#quantumFilter)" />
        
        {/* Main energy ball */}
        <circle cx="12" cy="12" r="8" fill="url(#quantumGlow)" />
        
        {/* Core */}
        <circle cx="12" cy="12" r="3" fill="white" />

        {/* Energy arcs - to give it a more dynamic feel */}
        <path d="M 12 4 A 8 8 0 0 1 20 12" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
        <path d="M 12 20 A 8 8 0 0 1 4 12" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.7" />
    </BaseIcon>
);
