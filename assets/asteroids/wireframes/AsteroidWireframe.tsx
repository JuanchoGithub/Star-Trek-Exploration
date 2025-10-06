import React from 'react';
import { BaseWireframe } from '../../ships/wireframes/UnknownShipWireframe';

export const AsteroidWireframe: React.FC = () => (
    <BaseWireframe>
        <polygon points="50,10 85,30 90,60 70,90 30,85 15,55 25,20" />
        <line x1="50" y1="10" x2="55" y2="50" />
        <line x1="85" y1="30" x2="55" y2="50" />
        <line x1="15" y1="55" x2="55" y2="50" />
        <line x1="70" y1="90" x2="55" y2="50" />
    </BaseWireframe>
);
