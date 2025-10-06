import React from 'react';
import { BaseWireframe } from '../../ships/wireframes/UnknownShipWireframe';

export const DClassWireframe: React.FC = () => (
     <BaseWireframe>
        <circle cx="50" cy="50" r="40" />
        <path d="M 30 25 L 45 45 L 30 60" />
        <path d="M 60 20 L 75 40 L 60 55 L 75 70" />
        <circle cx="55" cy="65" r="7" />
    </BaseWireframe>
);
