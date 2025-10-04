import { Position, SectorState } from '../../types';

const posToString = (pos: Position) => `${pos.x},${pos.y}`;

export const getNeighboringPositions = (pos: Position, depth: number = 1): Position[] => {
    const neighbors: Position[] = [];
    for (let dy = -depth; dy <= depth; dy++) {
        for (let dx = -depth; dx <= depth; dx++) {
            if (dx === 0 && dy === 0) continue;
            neighbors.push({ x: pos.x + dx, y: pos.y + dy });
        }
    }
    return neighbors;
};

export const isPosInNebula = (pos: Position, sector: SectorState): boolean => {
    if (!sector.nebulaCells || sector.nebulaCells.length === 0) return false;
    // Using a Set for a more performant lookup, which might also resolve subtle consistency issues.
    const nebulaCellSet = new Set(sector.nebulaCells.map(posToString));
    return nebulaCellSet.has(posToString(pos));
};

export const isDeepNebula = (pos: Position, sector: SectorState): boolean => {
    if (!sector.nebulaCells || sector.nebulaCells.length === 0) return false;

    const nebulaCellSet = new Set(sector.nebulaCells.map(posToString));
    
    if (!nebulaCellSet.has(posToString(pos))) {
        return false; // Not even a nebula cell, so can't be deep nebula
    }
    
    const neighbors = getNeighboringPositions(pos, 1);
    // A cell must have all 8 neighbors to be considered "deep".
    if (neighbors.length !== 8) return false; 
    
    return neighbors.every(n => nebulaCellSet.has(posToString(n)));
};

export const isPosInIonStorm = (pos: Position, sector: SectorState): boolean => {
    if (!sector.ionStormCells || sector.ionStormCells.length === 0) return false;
    const ionStormCellSet = new Set(sector.ionStormCells.map(posToString));
    return ionStormCellSet.has(posToString(pos));
};

export const isDeepIonStorm = (pos: Position, sector: SectorState): boolean => {
    if (!sector.ionStormCells || sector.ionStormCells.length === 0) return false;

    const ionStormCellSet = new Set(sector.ionStormCells.map(posToString));
    
    if (!ionStormCellSet.has(posToString(pos))) {
        return false;
    }
    
    const neighbors = getNeighboringPositions(pos, 1);
    if (neighbors.length !== 8) return false; 
    
    return neighbors.every(n => ionStormCellSet.has(posToString(n)));
};

export const isCommBlackout = (pos: Position, sector: SectorState): boolean => {
    if (!isPosInNebula(pos, sector)) return false;
    const nebulaCellSet = new Set(sector.nebulaCells.map(posToString));
    
    // Check for a 5x5 grid of nebula cells
    for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            if (!nebulaCellSet.has(posToString({ x: pos.x + dx, y: pos.y + dy }))) {
                return false;
            }
        }
    }
    return true;
};