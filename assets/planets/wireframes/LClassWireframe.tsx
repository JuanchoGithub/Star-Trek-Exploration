import React from 'react';
import { BaseWireframe } from '../../ships/wireframes/UnknownShipWireframe';

export const LClassWireframe: React.FC = () => (
    <BaseWireframe>
        <circle cx="50" cy="50" r="40" />
        <circle cx="35" cy="40" r="8" />
        <circle cx="65" cy="60" r="12" />
        <path d="M 20 70 Q 50 60 80 75" />
    </BaseWireframe>
);
