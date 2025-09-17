import React from 'react';
import type { SectorState } from '../types';
// Fix: Corrected the import path for PlayerShipIcon.
import { PlayerShipIcon } from '../assets/ships/icons';

interface QuadrantViewProps {
    quadrantMap: SectorState[][];
    playerPosition: { qx: number; qy: number };
    onWarp: (pos: { qx: number; qy: number }) => void;
}

const QuadrantView: React.FC<QuadrantViewProps> = ({ quadrantMap, playerPosition, onWarp }) => {
    const quadrantSize = { width: 8, height: 8 };

    return (
        <div className="panel-style p-2 h-full flex flex-col">
            <h2 className="text-xl font-bold text-secondary-light mb-2 text-center">Quadrant Map</h2>
            <div className="grid grid-cols-8 grid-rows-8 h-full gap-1 flex-grow">
                {quadrantMap.flat().map((sector, index) => {
                    const qx = index % quadrantSize.width;
                    const qy = Math.floor(index / quadrantSize.width);
                    const isPlayerHere = playerPosition.qx === qx && playerPosition.qy === qy;
                    const isAdjacent = Math.abs(playerPosition.qx - qx) + Math.abs(playerPosition.qy - qy) === 1;

                    let bgColor = 'bg-bg-paper';
                    let borderColor = 'border-border-dark';
                    let textColor = 'text-text-disabled';
                    let hoverClass = '';

                    if (sector.visited) {
                        bgColor = 'bg-bg-paper-lighter';
                        borderColor = 'border-border-main';
                        textColor = 'text-secondary-main';
                    }
                    
                    if (isPlayerHere) {
                        bgColor = 'bg-primary-dark';
                        borderColor = 'border-primary-main';
                    } else if (isAdjacent) {
                        hoverClass = 'hover:bg-accent-green cursor-pointer';
                    }


                    return (
                        <div
                            key={`sector-${qx}-${qy}`}
                            className={`border ${borderColor} ${bgColor} ${hoverClass} transition-colors flex items-center justify-center relative`}
                            onClick={() => {
                                if (isAdjacent) onWarp({ qx, qy });
                            }}
                        >
                            <span className={`font-bold ${textColor}`}>({qx},{qy})</span>
                            {isPlayerHere && (
                                <div className="absolute inset-0 flex items-center justify-center text-accent-yellow">
                                    <PlayerShipIcon className="w-8 h-8 animate-pulse" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default QuadrantView;