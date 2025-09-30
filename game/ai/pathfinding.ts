
import type { GameState, Ship, Position } from '../../types';
import { AIStance } from './FactionAI';
import { calculateDistance } from '../utils/ai';
import { SECTOR_WIDTH, SECTOR_HEIGHT } from '../../assets/configs/gameConstants';
import { isPosInNebula, isDeepNebula } from '../utils/sector';

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
    stance: AIStance
): { position: Position | null; reason: string; threatScore: number } {
    const { currentSector } = gameState;
    const occupiedPositions = new Set(allShipsInSector.filter(s => s.id !== ship.id).map(s => `${s.position.x},${s.position.y}`));

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
        return { position: null, reason: `All movement vectors are blocked. Holding position.`, threatScore: 0 };
    }

    const coverPositions = new Set([
        ...currentSector.nebulaCells.map(p => `${p.x},${p.y}`),
        ...currentSector.entities.filter(e => e.type === 'asteroid_field').map(e => `${e.position.x},${e.position.y}`)
    ]);

    let bestMove: { position: Position; score: number; reason: string; threatScore: number } | null = null;

    for (const candidate of validCandidates) {
        let score = 0;
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
        const centralityWeight = 0.5;
        const coverWeight = 1.5;

        if (stance === 'Defensive') {
            // Minimize threat, maximize centrality and cover.
            score = (-threatScore * threatWeight) + (centralityScore * centralityWeight) + (coverScore * coverWeight);
        } else if (stance === 'Aggressive') {
            // Maximize threat (get closer), but still value centrality and cover to avoid foolish charges.
            score = (threatScore * threatWeight) - (centralityScore * 0.1) + (coverScore * coverWeight);
        } else { // Balanced
             const optimalRange = 4;
             let distToClosest = 0;
             if (potentialTargets.length > 0) {
// FIX: Corrected logic to calculate distance to the nearest target from the candidate position, resolving a type error and a "not defined" error.
                 distToClosest = Math.min(...potentialTargets.map(t => calculateDistance(candidate, t.position)));
             }
             const rangeScore = -Math.abs(distToClosest - optimalRange) * 5;
             score = rangeScore + (centralityScore * centralityWeight) + (coverScore * coverWeight);
        }

        if (!bestMove || score > bestMove.score) {
            // Construct a descriptive reason for the log
            let reasonStr = '';
            if (stance === 'Defensive') {
                if (reasons.includes('deep cover')) reasonStr = 'Prioritizing move to deep nebula for concealment.';
                else if (reasons.includes('cover')) reasonStr = 'Moving into nearby cover.';
                else reasonStr = 'Seeking open space to prevent being boxed in.';
            } else if (stance === 'Aggressive') {
                if (reasons.includes('cover')) reasonStr = 'Advancing on target via available cover.';
                else reasonStr = 'Closing to optimal attack range.';
            } else { // Balanced
                 reasonStr = 'Maneuvering to a balanced engagement distance.';
            }

            bestMove = { position: candidate, score, reason: reasonStr, threatScore };
        }
    }
    
    if (bestMove) {
        return { position: bestMove.position, reason: bestMove.reason, threatScore: parseFloat(bestMove.threatScore.toFixed(2)) };
    }

    return { position: null, reason: 'Could not determine optimal maneuver. Holding position.', threatScore: 0 };
}