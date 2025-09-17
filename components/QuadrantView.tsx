import React, { useState } from 'react';
import type { SectorState, FactionOwner, QuadrantPosition } from '../types';
// FIX: PlayerShipIcon is not directly exported. It's an alias for FederationExplorerIcon.
import { FederationExplorerIcon as PlayerShipIcon } from '../assets/ships/icons';

interface QuadrantViewProps {
    quadrantMap: SectorState[][];
    playerPosition: { qx: number; qy: number };
    onWarp: (pos: { qx: number; qy: number }) => void;
    onScanQuadrant: (pos: QuadrantPosition) => void;
}

const QuadrantView: React.FC<QuadrantViewProps> = ({ quadrantMap, playerPosition, onWarp, onScanQuadrant }) => {
    const quadrantSize = { width: 8, height: 8 };
    const [contextMenu, setContextMenu] = useState<{ qx: number; qy: number } | null>(null);

    const getFactionDisplay = (faction: FactionOwner) => {
        switch (faction) {
            case 'Federation': return { bg: 'bg-blue-900 bg-opacity-50', border: 'border-blue-500', text: 'text-blue-300', name: 'Federation Space' };
            case 'Klingon': return { bg: 'bg-red-900 bg-opacity-50', border: 'border-red-500', text: 'text-red-300', name: 'Klingon Empire' };
            case 'Romulan': return { bg: 'bg-green-900 bg-opacity-50', border: 'border-green-500', text: 'text-green-300', name: 'Romulan Star Empire' };
            case 'None': return { bg: 'bg-gray-700 bg-opacity-50', border: 'border-gray-500', text: 'text-gray-400', name: 'Uncharted Space' };
            default: return { bg: 'bg-bg-paper', border: 'border-border-dark', text: 'text-text-disabled', name: 'Unknown' };
        }
    };
    
    const menuStyle: React.CSSProperties = contextMenu ? {
        position: 'absolute',
        left: `${(contextMenu.qx / quadrantSize.width) * 100}%`,
        top: `${(contextMenu.qy / quadrantSize.height) * 100}%`,
        transform: `translate(${contextMenu.qx >= quadrantSize.width / 2 ? '-105%' : '5%'}, ${contextMenu.qy >= quadrantSize.height / 2 ? '-105%' : '5%'})`,
        zIndex: 20,
    } : {};


    return (
        <div className="panel-style p-1 h-full flex flex-col" onClick={() => setContextMenu(null)}>
            <div className="grid grid-cols-8 grid-rows-8 gap-0 flex-grow relative">
                {quadrantMap.flat().map((sector, index) => {
                    const qx = index % quadrantSize.width;
                    const qy = Math.floor(index / quadrantSize.width);
                    const isPlayerHere = playerPosition.qx === qx && playerPosition.qy === qy;
                    const isAdjacent = !isPlayerHere && (Math.abs(playerPosition.qx - qx) + Math.abs(playerPosition.qy - qy) === 1);
                    
                    const isVisited = sector.visited;
                    const isScanned = sector.isScanned;

                    let bgClass, borderClass, textClass, title, content;
                    const factionDisplay = getFactionDisplay(sector.factionOwner);
                    const hostileCount = sector.entities.filter(e => e.type === 'ship' && ['Klingon', 'Romulan', 'Pirate'].includes(e.faction)).length;

                    if (isVisited) {
                        bgClass = factionDisplay.bg;
                        borderClass = factionDisplay.border;
                        textClass = factionDisplay.text;
                        title = `${factionDisplay.name} (${qx},${qy})`;
                        content = (
                            <>
                                <span className={`font-bold text-xs ${textClass}`}>({qx},{qy})</span>
                                {hostileCount > 0 && <span className="text-xs text-red-400 font-bold">Hostiles: {hostileCount}</span>}
                            </>
                        );
                    } else if (isScanned) {
                        bgClass = factionDisplay.bg.replace('bg-opacity-50', 'bg-opacity-20');
                        borderClass = 'border-dashed ' + factionDisplay.border;
                        textClass = factionDisplay.text.replace('300', '500');
                        title = `Scanned: ${factionDisplay.name} (${qx},${qy})`;
                         content = (
                            <>
                                <span className={`font-bold text-xs ${textClass}`}>({qx},{qy})</span>
                                {hostileCount > 0 && <span className="text-xs text-red-500 font-bold">Hostiles: {hostileCount}</span>}
                                 {!hostileCount && <span className="text-xs text-gray-400">Clear</span>}
                            </>
                        );
                    } else { // Not visited, not scanned
                        bgClass = 'bg-black';
                        borderClass = 'border-border-dark';
                        textClass = 'text-text-disabled';
                        title = `Unexplored Sector (${qx},${qy})`;
                        content = <span className={`font-bold text-3xl ${textClass} opacity-50`}>?</span>;
                    }
                    
                    let hoverClass = '';
                    if (isPlayerHere) {
                        borderClass = 'border-accent-yellow ring-2 ring-accent-yellow';
                    } else if (isAdjacent) {
                        hoverClass = 'hover:bg-opacity-75 hover:border-accent-yellow cursor-pointer';
                    }

                    return (
                        <div
                            key={`sector-${qx}-${qy}`}
                            className={`border ${borderClass} ${bgClass} ${hoverClass} transition-colors flex flex-col items-center justify-center relative p-1`}
                            onClick={(e) => {
                                if (isAdjacent) {
                                    e.stopPropagation();
                                    setContextMenu({ qx, qy });
                                }
                            }}
                            title={title}
                        >
                            {content}
                            {isPlayerHere && (
                                <div className="absolute inset-0 flex items-center justify-center text-accent-yellow">
                                    <PlayerShipIcon className="w-8 h-8 animate-pulse" />
                                </div>
                            )}
                        </div>
                    );
                })}
                 {contextMenu && (
                    <div 
                        style={menuStyle}
                        className="bg-bg-paper-lighter border-2 border-border-light rounded-md shadow-lg p-2 flex flex-col gap-1 w-32"
                        onClick={e => e.stopPropagation()}
                    >
                        <h4 className="text-sm font-bold text-center border-b border-border-dark mb-1 pb-1">Sector ({contextMenu.qx},{contextMenu.qy})</h4>
                        <button onClick={() => { onWarp(contextMenu); setContextMenu(null); }} className="btn btn-primary text-xs w-full">Warp</button>
                        {!quadrantMap[contextMenu.qy][contextMenu.qx].isScanned && (
                            <button onClick={() => { onScanQuadrant(contextMenu); setContextMenu(null); }} className="btn btn-secondary text-xs w-full">Scan (1 Pwr)</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuadrantView;