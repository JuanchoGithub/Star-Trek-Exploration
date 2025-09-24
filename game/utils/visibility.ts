import type { Entity, Ship, SectorState } from '../../types';
import { calculateDistance } from '../utils/ai';
import { isPosInNebula, isDeepNebula } from '../utils/sector';

export const canShipSeeEntity = (targetEntity: Entity, viewerShip: Ship, sector: SectorState): boolean => {
    if (targetEntity.id === viewerShip.id) {
        return true;
    }

    const distance = calculateDistance(viewerShip.position, targetEntity.position);

    const isViewerInNebula = isPosInNebula(viewerShip.position, sector);
    const isEntityInDeepNebula = isDeepNebula(targetEntity.position, sector);

    // Deep Nebula check: completely undetectable
    if (isEntityInDeepNebula) {
        return false;
    }

    // Viewer inside nebula check: sensor range is 1
    if (isViewerInNebula) {
        return distance <= 1;
    }

    // Asteroid field check
    const asteroidPositions = new Set(sector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
    const isTargetInAsteroidField = asteroidPositions.has(`${targetEntity.position.x},${targetEntity.position.y}`);

    if (isTargetInAsteroidField) {
        return distance <= 4;
    }

    // Default visibility
    return true;
};
