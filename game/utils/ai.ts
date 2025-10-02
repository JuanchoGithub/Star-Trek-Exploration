import type { Position, Ship, BeamWeapon } from '../../types';

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
