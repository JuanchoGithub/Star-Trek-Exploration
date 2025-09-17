import React from 'react';
import { AsteroidFieldIcon } from '../icons';
import { AsteroidWireframe } from '../wireframes';
import { EntityTypeConfig } from '../../types';

export const asteroidType: EntityTypeConfig = {
    icon: AsteroidFieldIcon,
    wireframe: AsteroidWireframe,
    colorClass: 'text-gray-400'
};
