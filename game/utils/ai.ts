
import type { Position, Ship } from '../../types';

export const calculateDistance = (pos1: Position, pos2: Position): number => {
    return Math.max(Math.abs(pos1.x - pos2.x), Math.abs(pos1.y - pos2.y));
};

export const moveOneStep = (start: Position, end: Position): Position => {
    const newPos = { ...start };
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    if (Math.abs(dx) > Math.abs(dy)) {
        newPos.x += Math.sign(dx);
    } else if (dy !== 0) {
        newPos.y += Math.sign(dy);
    } else if (dx !== 0) {
        newPos.x += Math.sign(dx);
    }
    return newPos;
};

export const findClosestTarget = (source: Ship, potentialTargets: Ship[]): Ship | null => {
    let closestTarget: Ship | null = null;
    let minDistance = Infinity;

    potentialTargets.forEach(target => {
        if (target.id === source.id) return;
        const distance = calculateDistance(source.position, target.position);
        if (distance < minDistance) {
            minDistance = distance;
            closestTarget = target;
        }
    });

    return closestTarget;
};
