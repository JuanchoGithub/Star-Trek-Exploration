import React from 'react';
import { BaseWireframe } from '../../ships/wireframes/UnknownShipWireframe';

export const TorpedoWireframe: React.FC = () => (
    <BaseWireframe>
        <circle cx="50" cy="50" r="30" />
        <line x1="50" y1="10" x2="50" y2="90" />
        <line x1="10" y1="50" x2="90" y2="50" />
        <circle cx="50" cy="50" r="40" strokeDasharray="5 5" />
    </BaseWireframe>
);
