import React from 'react';

interface BaseWireframeProps extends React.SVGProps<SVGSVGElement> {
  strokeWidth?: number;
}

export const BaseWireframe: React.FC<BaseWireframeProps> = ({ children, viewBox = "0 0 100 100", strokeWidth = 1.5, ...props }) => (
    <svg viewBox={viewBox} className="w-full h-full wireframe-glow" {...props}>
        <g stroke="#fde047" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </g>
    </svg>
);

export const UnknownShipWireframe: React.FC = () => (
    <BaseWireframe>
        <polygon points="50,10 10,40 50,70 90,40" />
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="30" stroke="#fde047" fill="#fde047">?</text>
    </BaseWireframe>
);
