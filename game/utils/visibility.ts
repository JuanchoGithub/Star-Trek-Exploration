import type { Entity, Ship, SectorState } from '../../types';
import { calculateDistance } from '../utils/ai';
import { isPosInNebula, isDeepNebula } from '../utils/sector';

export const canPlayerSeeEntity = (entity: Entity, playerShip: Ship, sector: SectorState): boolean => {
    if (entity.id === playerShip.id) {
        return true;
    }

    const distance = calculateDistance(playerShip.position, entity.position);

    const isPlayerInNebula = isPosInNebula(playerShip.position, sector);
    const isEntityInDeepNebula = isDeepNebula(entity.position, sector);

    // Deep Nebula check: completely undetectable
    if (isEntityInDeepNebula) {
        return false;
    }

    // Player inside nebula check: sensor range is 1
    if (isPlayerInNebula) {
        return distance <= 1;
    }

    // Asteroid field check
    const asteroidPositions = new Set(sector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
    const isEntityInAsteroidField = asteroidPositions.has(`${entity.position.x},${entity.position.y}`);

    if (isEntityInAsteroidField) {
        return distance <= 4;
    }

    // Default visibility
    return true;
};
