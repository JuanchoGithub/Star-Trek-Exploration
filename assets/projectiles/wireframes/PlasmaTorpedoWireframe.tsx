import React from 'react';
import { BaseWireframe } from '../../ships/wireframes/UnknownShipWireframe';

export const PlasmaTorpedoWireframe: React.FC = () => (
    <BaseWireframe>
        {/* Outer containment field */}
        <circle cx="50" cy="50" r="40" />
        {/* Swirling plasma core */}
        <path d="M 50 20 A 30 30 0 0 1 80 50" />
        <path d="M 50 20 A 30 30 0 0 0 20 50" />
        <path d="M 50 80 A 30 30 0 0 1 20 50" />
        <path d="M 50 80 A 30 30 0 0 0 80 50" />
        <circle cx="50" cy="50" r="15" strokeDasharray="4 4" />
    </BaseWireframe>
);
