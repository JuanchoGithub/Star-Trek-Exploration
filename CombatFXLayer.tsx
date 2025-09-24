import React from 'react';
import type { CombatEffect, Entity, TorpedoType } from '../types';

interface CombatFXLayerProps {
    effects: CombatEffect[];
    entities: Entity[];
}

const SECTOR_WIDTH = 11;
const SECTOR_HEIGHT = 10;

const getPercentageCoords = (gridPos: { x: number; y: number }) => {
    const x = (gridPos.x / SECTOR_WIDTH) * 100 + (100 / SECTOR_WIDTH / 2);
    const y = (gridPos.y / SECTOR_HEIGHT) * 100 + (100 / SECTOR_HEIGHT / 2);
    return { x: `${x}%`, y: `${y}%` };
};

const getPhaserClass = (faction: string): string => {
    const factionClass = faction.toLowerCase();
    const validFactions = ['federation', 'klingon', 'romulan', 'pirate'];
    if (validFactions.includes(factionClass)) {
        return `phaser-beam ${factionClass}`;
    }
    return 'phaser-beam federation'; // Default to federation red for others
};

const getPointDefenseClass = (faction: string): string => {
    const factionClass = faction.toLowerCase();
    const validFactions = ['federation', 'klingon', 'romulan', 'pirate'];
    if (validFactions.includes(factionClass)) {
        return `point-defense-beam ${factionClass}`;
    }
    return 'point-defense-beam federation';
};

const getExplosionColors = (torpedoType: TorpedoType): [string, string, string] => {
    switch(torpedoType) {
        case 'Quantum':
            return ['white', 'var(--color-accent-indigo)', 'var(--color-accent-purple)'];
        case 'Plasma':
        case 'HeavyPlasma':
            return ['white', 'var(--color-accent-teal)', 'var(--color-accent-green)'];
        case 'HeavyPhoton':
        case 'Photon':
        default:
            return ['white', 'var(--color-accent-orange)', 'var(--color-accent-red)'];
    }
}


const CombatFXLayer: React.FC<CombatFXLayerProps> = ({ effects, entities }) => {
    const entityMap = new Map<string, Entity>(entities.map(e => [e.id, e]));

    return (
        <div className="absolute inset-0 pointer-events-none z-50">
            <svg width="100%" height="100%" className="overflow-visible">
                {effects.map((effect, index) => {
                    if (effect.type === 'phaser') {
                        const source = entityMap.get(effect.sourceId);
                        const target = entityMap.get(effect.targetId);
                        if (!source || !target) return null;

                        const start = getPercentageCoords(source.position);
                        const end = getPercentageCoords(target.position);
                        const phaserClass = getPhaserClass(effect.faction);

                        return (
                            <line 
                                key={`${effect.sourceId}-${effect.targetId}-${index}`} 
                                x1={start.x} 
                                y1={start.y} 
                                x2={end.x} 
                                y2={end.y} 
                                className={phaserClass}
                                style={{ animationDelay: `${effect.delay}ms` }}
                            />
                        );
                    }
                    if (effect.type === 'point_defense') {
                        const source = entityMap.get(effect.sourceId);
                        if (!source) return null;

                        const start = getPercentageCoords(source.position);
                        const end = getPercentageCoords(effect.targetPosition);
                        
                        const width = 2; // width of the triangle base in %
                        const sourceCoords = { x: parseFloat(start.x), y: parseFloat(start.y) };
                        const targetCoords = { x: parseFloat(end.x), y: parseFloat(end.y) };

                        const vec_x = targetCoords.x - sourceCoords.x;
                        const vec_y = targetCoords.y - sourceCoords.y;
                        const vec_mag = Math.sqrt(vec_x*vec_x + vec_y*vec_y) || 1;
                        
                        const perp_x = -vec_y / vec_mag;
                        const perp_y = vec_x / vec_mag;

                        const p1 = `${sourceCoords.x}%,${sourceCoords.y}%`;
                        const p2 = `${targetCoords.x + perp_x * width}%,${targetCoords.y + perp_y * width}%`;
                        const p3 = `${targetCoords.x - perp_x * width}%,${targetCoords.y - perp_y * width}%`;
                        
                        const pointDefenseClass = getPointDefenseClass(effect.faction);

                        return (
                            <polygon
                                key={`pd-${effect.sourceId}-${index}`}
                                points={`${p1} ${p2} ${p3}`}
                                className={pointDefenseClass}
                                style={{ animationDelay: `${effect.delay}ms` }}
                            />
                        );
                    }
                    return null;
                })}
            </svg>
            {/* Non-SVG effects like explosions go here */}
            {effects.map((effect, index) => {
                 if (effect.type === 'torpedo_hit') {
                    const coords = getPercentageCoords(effect.position);
                    const [color1, color2, color3] = getExplosionColors(effect.torpedoType);
                    return (
                        <div
                            key={`explosion-${index}`}
                            className="torpedo-explosion"
                            style={{
                                left: coords.x,
                                top: coords.y,
                                width: '5vw',
                                height: '5vw',
                                animationDelay: `${effect.delay}ms`,
                                '--color-accent-orange': color2, // Override CSS variables for animation
                                '--color-accent-red': color3,
                            } as React.CSSProperties}
                        />
                    );
                }
                if (effect.type === 'phaser_impact') {
                    const coords = getPercentageCoords(effect.position);
                    return (
                        <div
                            key={`phaser-impact-${index}`}
                            className={`phaser-impact ${effect.hitType}`}
                            style={{
                                left: coords.x,
                                top: coords.y,
                                animationDelay: `${effect.delay}ms`,
                            }}
                        />
                    );
                }
                return null;
            })}
        </div>
    );
};
export default CombatFXLayer;