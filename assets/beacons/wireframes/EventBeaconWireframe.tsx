import React from 'react';
import { BaseWireframe } from '../../ships/wireframes/UnknownShipWireframe';

export const EventBeaconWireframe: React.FC = () => (
    <BaseWireframe>
        <circle cx="50" cy="50" r="15" />
        <circle cx="50" cy="50" r="30" strokeDasharray="4 4" />
        <circle cx="50" cy="50" r="45" strokeDasharray="2 6" />
        <line x1="50" y1="5" x2="50" y2="25" />
        <line x1="50" y1="95" x2="50" y2="75" />
        <line x1="5" y1="50" x2="25" y2="50" />
        <line x1="95" y1="50" x2="75" y2="50" />
    </BaseWireframe>
);
