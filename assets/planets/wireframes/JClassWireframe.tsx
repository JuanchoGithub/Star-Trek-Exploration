import React from 'react';
import { BaseWireframe } from '../../ships/wireframes/UnknownShipWireframe';

export const JClassWireframe: React.FC = () => (
    <BaseWireframe>
        <circle cx="50" cy="50" r="35" />
        <ellipse cx="50" cy="50" rx="45" ry="15" transform="rotate(-15 50 50)" />
        <line x1="15" y1="40" x2="85" y2="40" />
        <line x1="20" y1="60" x2="80" y2="60" />
    </BaseWireframe>
);
