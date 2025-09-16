import React from 'react';
import type { CombatEffect, Entity } from '../types';

interface CombatFXLayerProps {
    effects: CombatEffect[];
    entities: Entity[];
}

const SECTOR_WIDTH = 12;
const SECTOR_HEIGHT = 10;

const getPercentageCoords = (gridPos: { x: number; y: number }) => {
    const x = (gridPos.x / SECTOR_WIDTH) * 100 + (100 / SECTOR_WIDTH / 2);
    const y = (gridPos.y / SECTOR_HEIGHT) * 100 + (100 / SECTOR_HEIGHT / 2);
    return { x: `${x}%`, y: `${y}%` };
};

const CombatFXLayer: React.FC<CombatFXLayerProps> = ({ effects, entities }) => {
    const entityMap = new Map<string, Entity>(entities.map(e => [e.id, e]));

    return (
        <div className="absolute inset-0 pointer-events-none z-50">
            <svg width="100%" height="100%">
                {effects.map((effect, index) => {
                    if (effect.type === 'phaser') {
                        const source = entityMap.get(effect.sourceId);
                        const target = entityMap.get(effect.targetId);
                        if (!source || !target) return null;

                        const start = getPercentageCoords(source.position);
                        const end = getPercentageCoords(target.position);

                        return <line key={`${effect.sourceId}-${effect.targetId}-${index}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} className="phaser-beam" />;
                    }
                    return null;
                })}
            </svg>
        </div>
    );
};
export default CombatFXLayer;
