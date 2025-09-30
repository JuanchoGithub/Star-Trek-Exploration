import type { Position, Ship } from '../../types';

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

export const calculateThreatInfo = (
    shipToAssess: Ship,
    potentialThreats: Ship[]
): { total: number; contributors: { sourceId: string; score: number }[] } => {
    if (potentialThreats.length === 0) {
        return { total: 0, contributors: [] };
    }

    const contributors = potentialThreats.map(threat => {
        const dist = calculateDistance(shipToAssess.position, threat.position);
        // Inverse square law: threat drops off sharply with distance. Add 1 to avoid division by zero.
        const score = 1 / (dist * dist + 1);
        return { sourceId: threat.id, score };
    });

    const total = contributors.reduce((sum, c) => sum + c.score, 0);
    
    // Sort by highest score and take top 3 for the UI breakdown
    contributors.sort((a, b) => b.score - a.score);

    return {
        total: parseFloat(total.toFixed(2)),
        contributors: contributors.slice(0, 3).map(c => ({...c, score: parseFloat(c.score.toFixed(2))}))
    };
};