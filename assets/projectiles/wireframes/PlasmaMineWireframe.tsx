import React from 'react';
import { BaseWireframe } from '../../ships/wireframes/UnknownShipWireframe';

export const PlasmaMineWireframe: React.FC = () => (
    <BaseWireframe>
        <circle cx="50" cy="50" r="30" />
        <circle cx="50" cy="50" r="15" />
        <line x1="50" y1="10" x2="50" y2="25" />
        <line x1="50" y1="90" x2="50" y2="75" />
        <line x1="10" y1="50" x2="25" y2="50" />
        <line x1="90" y1="50" x2="75" y2="50" />
        <line x1="22" y1="22" x2="35" y2="35" />
        <line x1="78" y1="78" x2="65" y2="65" />
        <line x1="78" y1="22" x2="65" y2="35" />
        <line x1="22" y1="78" x2="35" y2="65" />
    </BaseWireframe>
);
