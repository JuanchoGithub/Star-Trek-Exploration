
import type { Position, Ship } from '../../types';

// FIX: Added cyrb53 hash function.
export const cyrb53 = (str: string, seed = 0): number => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

// FIX: Added seeded random number generator.
export const seededRandom = (seed: number): (() => number) => {
    let state = seed;
    return function() {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
    };
};

export const uniqueId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

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
