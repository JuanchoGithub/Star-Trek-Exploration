import { Position, SectorState } from '../../types';

const posToString = (pos: Position) => `${pos.x},${pos.y}`;

// Directions for a pointy-top, odd-q vertical layout hex grid
const oddq_directions = [
    // even cols (q is even)
    [{ x: +1, y: 0 }, { x: +1, y: -1 }, { x: 0, y: -1 }, 
     { x: -1, y: -1 }, { x: -1, y: 0 }, { x: 0, y: +1 }],
    // odd cols (q is odd)
    [{ x: +1, y: +1 }, { x: +1, y: 0 }, { x: 0, y: -1 }, 
     { x: -1, y: 0 }, { x: -1, y: +1 }, { x: 0, y: +1 }]
];

export const getNeighboringPositions = (pos: Position, depth: number = 1): Position[] => {
    if (depth !== 1) {
        console.warn("getNeighboringPositions for hex grids currently only supports depth=1");
    }

    const neighbors: Position[] = [];
    const parity = pos.x & 1; // 0 for even, 1 for odd
    const directions = oddq_directions[parity];

    for (const dir of directions) {
        neighbors.push({ x: pos.x + dir.x, y: pos.y + dir.y });
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
    // A cell must have all 6 neighbors to be considered "deep".
    if (neighbors.length !== 6) return false; 
    
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
    if (neighbors.length !== 6) return false; 
    
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