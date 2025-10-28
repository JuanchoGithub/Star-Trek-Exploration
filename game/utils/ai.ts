import type { Position, Ship, BeamWeapon } from '../../types';

export const uniqueId = () => `id_${new Date().getTime()}_${Math.random().toString(36).substr(2, 9)}`;

// HELPER for distance and movement: Converts odd-q vertical offset coordinates to axial coordinates
const offsetToAxial = (pos: Position) => {
    const q = pos.x;
    const r = pos.y - (pos.x - (pos.x & 1)) / 2;
    return { q, r };
};

export const calculateDistance = (pos1: Position, pos2: Position): number => {
    const a = offsetToAxial(pos1);
    const b = offsetToAxial(pos2);
    const dq = Math.abs(a.q - b.q);
    const dr = Math.abs(a.r - b.r);
    // ds is the change in the implicit 's' coordinate in a cube system (q+r+s=0)
    const ds = Math.abs((-a.q - a.r) - (-b.q - b.r));
    return (dq + dr + ds) / 2;
};

// HELPER for moveOneStep: Converts axial coordinates back to odd-q vertical offset
const axialToOffset = (q: number, r: number): Position => {
    const x = q;
    const y = r + (q - (q & 1)) / 2;
    return { x, y };
};

// All 6 directions on a hex grid in axial coordinates
const axialDirections = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
];


export const moveOneStep = (start: Position, end: Position): Position => {
    if (start.x === end.x && start.y === end.y) {
        return start;
    }

    const startAxial = offsetToAxial(start);
    const endAxial = offsetToAxial(end);
    
    // Find the direction vector that is closest to the vector from start to end.
    let bestDir = axialDirections[0];
    let minDistance = Infinity;

    for (const dir of axialDirections) {
        const nextHex = { q: startAxial.q + dir.q, r: startAxial.r + dir.r };
        const dist = Math.hypot(nextHex.q - endAxial.q, nextHex.r - endAxial.r);
        if (dist < minDistance) {
            minDistance = dist;
            bestDir = dir;
        }
    }
    
    const nextAxial = { q: startAxial.q + bestDir.q, r: startAxial.r + bestDir.r };
    return axialToOffset(nextAxial.q, nextAxial.r);
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

export const getPhaserEffectiveness = (distance: number, range: number): number => {
    if (distance <= 0 || range <= 1) return 1.0;
    // The -1 for range and distance accounts for range 1 being 100%
    return Math.max(0.2, 1 - (distance - 1) / (range - 1));
};

export const calculateOptimalEngagementRange = (aiShip: Ship, targetShip: Ship): number => {
    const getPrimaryPhaserRange = (ship: Ship): number => {
        const beamWeapons = ship.weapons.filter(w => w.type === 'beam') as BeamWeapon[];
        if (beamWeapons.length === 0) return 0;
        return Math.max(...beamWeapons.map(w => w.range));
    };

    if (!targetShip.scanned) {
        return 4; // Fallback to default safe range if target is not scanned
    }

    const aiShipMaxRange = getPrimaryPhaserRange(aiShip);
    const targetShipMaxRange = getPrimaryPhaserRange(targetShip);

    if (aiShipMaxRange <= 1 || targetShipMaxRange <= 1) {
        return 3; // Fallback if one ship has no phasers or only range 1 phasers
    }

    // Case A: Out-ranging the enemy
    if (aiShipMaxRange > targetShipMaxRange) {
        let bestRange = -1;
        let maxEffectivenessAtBestRange = -1;

        // Iterate through possible engagement ranges
        for (let r = 1; r <= aiShipMaxRange; r++) {
            const myEffectiveness = getPhaserEffectiveness(r, aiShipMaxRange);
            const enemyEffectiveness = getPhaserEffectiveness(r, targetShipMaxRange);

            // Check if the "stand-off" conditions are met
            if (enemyEffectiveness <= 0.2 && myEffectiveness >= 0.4) {
                // We want the range that maximizes our damage, which is the closest valid range
                if (bestRange === -1 || r < bestRange) {
                    bestRange = r;
                    maxEffectivenessAtBestRange = myEffectiveness;
                }
            }
        }
        // If a "sweet spot" is found, use it. Otherwise, fight just at the enemy's max range.
        return bestRange !== -1 ? bestRange : targetShipMaxRange;
    } 
    // Case B: Out-ranged by the enemy
    else if (aiShipMaxRange < targetShipMaxRange) {
        return 2; // Close the distance to brawl
    } 
    // Case C: Matched range
    else {
        return 3; // Tactical compromise to balance offense and defense
    }
};

export const getPath = (start: Position, end: Position | null): Position[] => {
    if (!end) return [];
    const path: Position[] = [];
    let current = { ...start };

    let safety = 0;
    while ((current.x !== end.x || current.y !== end.y) && safety < 30) {
        current = moveOneStep(current, end);
        path.push({ ...current });
        safety++;
    }
    return path;
};