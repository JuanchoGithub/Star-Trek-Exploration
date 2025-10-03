import { ShipModel } from '../../../types';
import { ShipClassStats } from './shipClassStats';

export const factionDefaults: Partial<Record<ShipModel, Partial<ShipClassStats>>> = {
    // This file is now empty, but kept for potential future use with other faction-wide defaults.
    // Cloaking is now handled exclusively by the 'cloakChance' property in shipClassStats.ts.
};
