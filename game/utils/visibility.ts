import type { Entity, Ship, SectorState } from '../../types';
import { calculateDistance } from '../utils/ai';
import { isPosInNebula, isDeepNebula } from '../utils/sector';

export const canShipSeeEntity = (targetEntity: Entity, viewerShip: Ship, sector: SectorState): boolean => {
    if (targetEntity.id === viewerShip.id) {
        return true;
    }

    const distance = calculateDistance(viewerShip.position, targetEntity.position);

    const isViewerInNebula = isPosInNebula(viewerShip.position, sector);
    const isTargetInNebula = isPosInNebula(targetEntity.position, sector);
    const isEntityInDeepNebula = isDeepNebula(targetEntity.position, sector);

    // Deep Nebula check: completely undetectable
    if (isEntityInDeepNebula) {
        return false;
    }

    // If either ship is in a nebula, visibility is reduced to adjacency
    if (isViewerInNebula || isTargetInNebula) {
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