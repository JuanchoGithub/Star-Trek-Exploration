import React from 'react';
import { EventBeaconIcon } from '../icons';
import { EventBeaconWireframe } from '../wireframes';
import { EntityTypeConfig } from '../../types';

export const beaconType: EntityTypeConfig = {
    icon: EventBeaconIcon,
    wireframe: EventBeaconWireframe,
    colorClass: 'text-purple-400'
};
