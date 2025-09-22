
import { Position, SectorState, Entity, Ship } from '../../types';
import { isPosInNebula, isDeepNebula, isCommBlackout } from './sector';
import { calculateDistance } from '../utils/ai';

export const canPlayerSeeEntity = (entity: Entity, playerShip: Ship, sector: SectorState): boolean => {
    if (entity.id === playerShip.id) return true;

    if (entity.faction === playerShip.faction) {
        // Allies can see each other unless one is in comm blackout, then only if adjacent
        if (isCommBlackout(entity.position, sector) || isCommBlackout(playerShip.position, sector)) {
            return Math.max(Math.abs(playerShip.position.x - entity.position.x), Math.abs(playerShip.position.y - entity.position.y)) <= 1;
        }
        return true;
    }

    // Hostile or neutral entities
    if (entity.type === 'ship' && (entity as Ship).cloakState === 'cloaked') return false;

    if (isDeepNebula(entity.position, sector)) return false;

    if (isPosInNebula(playerShip.position, sector)) {
        // If player is in nebula, can only see adjacent enemies
        return Math.max(Math.abs(playerShip.position.x - entity.position.x), Math.abs(playerShip.position.y - entity.position.y)) <= 1;
    }

    const asteroidPositions = new Set(sector.entities.filter(e => e.type === 'asteroid_field').map(f => `${f.position.x},${f.position.y}`));
    const entityPosKey = `${entity.position.x},${entity.position.y}`;
    if (entity.type === 'ship' && asteroidPositions.has(entityPosKey)) {
        const distance = calculateDistance(playerShip.position, entity.position);
        if (distance > 4) {
            return false; // Undetectable due to asteroid field
        }
    }
    
    // Player is outside nebula, can see entities not in deep nebula or cloaked.
    return true;
};