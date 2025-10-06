import React from 'react';
import { BaseWireframe } from '../../ships/wireframes/UnknownShipWireframe';

export const MClassWireframe: React.FC = () => (
    <BaseWireframe>
        <circle cx="50" cy="50" r="40" />
        <ellipse cx="50" cy="50" rx="40" ry="15" />
        <ellipse cx="50" cy="50" rx="25" ry="38" transform="rotate(30 50 50)" />
        <ellipse cx="50" cy="50" rx="15" ry="40" transform="rotate(-30 50 50)" />
    </BaseWireframe>
);
