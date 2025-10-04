import type { GameState, Ship, Position, Mine } from '../../types';
import { AIStance } from './FactionAI';
import { calculateDistance } from '../utils/ai';
import { SECTOR_WIDTH, SECTOR_HEIGHT } from '../../assets/configs/gameConstants';
import { isPosInNebula, isDeepNebula } from '../utils/sector';

// Exported interfaces for use in logger
export interface MoveScoreDetails {
    position: Position;
    threatScore: number;
    centralityScore: number;
    coverScore: number;
    rangeScore?: number;
    finalScore: number;
    // Component values for logging
    threatComponent: number;
    centralityComponent: number;
    coverComponent: number;
    rangeComponent?: number;
}

export interface PathfindingResult {
    chosenMove: {
        position: Position;
        details: MoveScoreDetails;
    } | null;
    topCandidates: MoveScoreDetails[];
    reason: string; // Top-level reason for no move or the chosen move's high-level logic
}

/**
 * Finds the most advantageous adjacent cell for a ship to move to based on its current tactical stance.
 * This function uses a sophisticated scoring system that evaluates:
 * - Threat Pressure: How close a move is to all visible enemies.
 * - Centrality: How much "open space" a move provides, heavily rewarding moves away from edges and corners.
 * - Cover: Bonuses for moving into nebulae, asteroid fields, or deep nebula for concealment.
 *
 * @param ship The ship to find a move for.
 * @param potentialTargets An array of all visible hostile ships.
 * @param gameState The full current game state.
 * @param allShipsInSector An array of all ships in the sector for collision detection.
 * @param stance The current tactical stance of the ship ('Aggressive', 'Defensive', etc.).
 * @returns An object containing the best position to move to, a log message explaining the decision, and the calculated threat score for that move.
 */
export function findOptimalMove(
    ship: Ship,
    potentialTargets: Ship[],
    gameState: GameState,
    allShipsInSector: Ship[],
    stance: AIStance,
    optimalRangeOverride?: number
): PathfindingResult {
    const { currentSector } = gameState;
    const occupiedPositions = new Set(allShipsInSector.filter(s => s.id !== ship.id).map(s => `${s.position.x},${s.position.y}`));

    const visibleMines = currentSector.entities.filter((e): e is Mine => 
        e.type === 'mine' && e.visibleTo.includes(ship.shipModel)
    );
    visibleMines.forEach(mine => occupiedPositions.add(`${mine.position.x},${mine.position.y}`));

    const candidateMoves: Position[] = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            candidateMoves.push({ x: ship.position.x + dx, y: ship.position.y + dy });
        }
    }
    
    const validCandidates = candidateMoves.filter(p => 
        p.x >= 0 && p.x < SECTOR_WIDTH &&
        p.y >= 0 && p.y < SECTOR_HEIGHT &&
        !occupiedPositions.has(`${p.x},${p.y}`)
    );

    if (validCandidates.length === 0) {
        return { chosenMove: null, topCandidates: [], reason: `All movement vectors are blocked. Holding position.` };
    }

    const coverPositions = new Set([
        ...currentSector.nebulaCells.map(p => `${p.x},${p.y}`),
        ...currentSector.entities.filter(e => e.type === 'asteroid_field').map(e => `${e.position.x},${e.position.y}`)
    ]);

    const candidateDetails: MoveScoreDetails[] = [];

    for (const candidate of validCandidates) {
        let reasons: string[] = [];

        // 1. Threat Score: Lower is better for Defensive, higher for Aggressive. Calculated from all enemies.
        let threatScore = 0;
        if (potentialTargets.length > 0) {
            for (const enemy of potentialTargets) {
                const dist = calculateDistance(candidate, enemy.position);
                // Inverse square law: threat drops off sharply with distance.
                threatScore += 1 / (dist * dist + 1); 
            }
        }

        // 2. Centrality Score: Higher is better. Measures distance from edges.
        const centralityScore = 
            (candidate.x * (SECTOR_WIDTH - 1 - candidate.x)) + 
            (candidate.y * (SECTOR_HEIGHT - 1 - candidate.y));

        // 3. Cover Score: Higher is better.
        let coverScore = 0;
        if (coverPositions.has(`${candidate.x},${candidate.y}`)) {
            coverScore += 10;
            reasons.push('cover');
        }
        if (isDeepNebula(candidate, currentSector)) {
            coverScore += 15; // Extra bonus for deep cover
            reasons.push('deep cover');
        }

        // 4. Combine scores based on stance
        const threatWeight = 50;
        const defensiveCentralityWeight = 0.5;
        const aggressiveCentralityWeight = 0.1;
        const balancedCentralityWeight = 0.2; // A small weight to act as a tie-breaker
        const coverWeight = 1.5;

        let threatComponent = 0;
        let centralityComponent = 0;
        let coverComponent = coverScore * coverWeight;
        let rangeComponent: number | undefined = undefined;
        let finalScore = 0;

        if (stance === 'Defensive') {
            threatComponent = -threatScore * threatWeight;
            centralityComponent = centralityScore * defensiveCentralityWeight;
            finalScore = threatComponent + centralityComponent + coverComponent;
        } else if (stance === 'Aggressive') {
            threatComponent = threatScore * threatWeight;
            centralityComponent = centralityScore * aggressiveCentralityWeight; // Reward for moving to center
            finalScore = threatComponent + centralityComponent + coverComponent;
        } else { // Balanced
             const optimalRange = optimalRangeOverride ?? 4;
             let distToClosest = 0;
             if (potentialTargets.length > 0) {
                 distToClosest = Math.min(...potentialTargets.map(t => calculateDistance(candidate, t.position)));
             }
             const rangeScore = -Math.abs(distToClosest - optimalRange);
             rangeComponent = rangeScore * 5;
             centralityComponent = centralityScore * balancedCentralityWeight; // Re-introduce centrality with a low weight
             finalScore = rangeComponent + coverComponent + centralityComponent;
        }

        candidateDetails.push({
            position: candidate,
            threatScore,
            centralityScore,
            coverScore,
            rangeScore: rangeComponent !== undefined ? -Math.abs(calculateDistance(candidate, potentialTargets[0]?.position || candidate) - (optimalRangeOverride ?? 4)) : undefined,
            finalScore,
            threatComponent,
            centralityComponent,
            coverComponent,
            rangeComponent,
        });
    }

    if (candidateDetails.length === 0) {
        return { chosenMove: null, topCandidates: [], reason: 'No valid moves found.' };
    }

    candidateDetails.sort((a, b) => b.finalScore - a.finalScore);

    const bestMoveDetails = candidateDetails[0];
    const topCandidates = candidateDetails.slice(0, 4);

    let reasonStr = '';
    if (stance === 'Defensive') {
        if (bestMoveDetails.coverComponent > Math.abs(bestMoveDetails.threatComponent) && bestMoveDetails.coverScore > 0) reasonStr = 'Prioritizing move to cover.';
        else if (bestMoveDetails.centralityComponent > Math.abs(bestMoveDetails.threatComponent)) reasonStr = 'Seeking open space to prevent being boxed in.';
        else reasonStr = 'Maximizing distance from threats.';
    } else if (stance === 'Aggressive') {
        if (bestMoveDetails.coverComponent > bestMoveDetails.threatComponent && bestMoveDetails.coverScore > 0) reasonStr = 'Advancing on target via available cover.';
        else reasonStr = 'Closing to optimal attack range.';
    } else { // Balanced
         if (bestMoveDetails.coverScore > 0 && Math.abs(bestMoveDetails.coverComponent) > Math.abs(bestMoveDetails.rangeComponent || 0)) reasonStr = 'Moving to utilize available cover.';
         else reasonStr = 'Maneuvering to optimal engagement distance.';
    }

    return {
        chosenMove: {
            position: bestMoveDetails.position,
            details: bestMoveDetails,
        },
        topCandidates,
        reason: reasonStr
    };
}