import { EntityTypeConfig } from '../../types';
import { FederationShuttleIcon } from '../../ships/icons/federation';
import { FederationShuttleWireframe } from '../../ships/wireframes/federation';

export const shuttleType: EntityTypeConfig = {
    icon: FederationShuttleIcon,
    wireframe: FederationShuttleWireframe,
    colorClass: 'text-blue-300'
};