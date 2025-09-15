import React from 'react';
import type { SectorState } from '../types';
import { PlayerShipIcon } from './Icons';

interface QuadrantViewProps {
    quadrantMap: SectorState[][];
    playerPosition: { qx: number; qy: number };
    onWarp: (pos: { qx: number; qy: number }) => void;
}

const QuadrantView: React.FC<QuadrantViewProps> = ({ quadrantMap, playerPosition, onWarp }) => {
    const quadrantSize = { width: 8, height: 8 };

    return (
        <div className="bg-black border-2 border-cyan-400 p-2 rounded-md h-[450px] flex flex-col">
            <h2 className="text-xl font-bold text-cyan-300 mb-2 text-center">Quadrant Map</h2>
            <div className="grid grid-cols-8 grid-rows-8 h-full gap-1 flex-grow">
                {quadrantMap.flat().map((sector, index) => {
                    const qx = index % quadrantSize.width;
                    const qy = Math.floor(index / quadrantSize.width);
                    const isPlayerHere = playerPosition.qx === qx && playerPosition.qy === qy;
                    const isAdjacent = Math.abs(playerPosition.qx - qx) + Math.abs(playerPosition.qy - qy) === 1;

                    let bgColor = 'bg-gray-900';
                    let borderColor = 'border-cyan-900';
                    let textColor = 'text-gray-600';
                    let hoverClass = '';

                    if (sector.visited) {
                        bgColor = 'bg-gray-800';
                        borderColor = 'border-cyan-700';
                        textColor = 'text-cyan-400';
                    }
                    
                    if (isPlayerHere) {
                        bgColor = 'bg-blue-800';
                        borderColor = 'border-blue-400';
                    } else if (isAdjacent) {
                        hoverClass = 'hover:bg-green-700 cursor-pointer';
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
                                <div className="absolute inset-0 flex items-center justify-center text-yellow-300">
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
