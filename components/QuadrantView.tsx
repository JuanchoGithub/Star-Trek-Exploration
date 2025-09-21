import React, { useState, useMemo } from 'react';
import type { SectorState, FactionOwner, QuadrantPosition } from '../types';
// FIX: PlayerShipIcon is not directly exported. It's an alias for FederationExplorerIcon.
import { FederationExplorerIcon as PlayerShipIcon } from '../assets/ships/icons';
import { ThemeName } from '../hooks/useTheme';

// Seeded PRNG helpers from useGameLogic
const cyrb53 = (str: string, seed = 0): number => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const seededRandom = (seed: number): (() => number) => {
    let state = seed;
    return function() {
        state = (state * 9301 + 49297) % 233280;
        return state / 233280;
    };
};

const QuadrantGFXBackground: React.FC = React.memo(() => {
    const elements = useMemo(() => {
        const seed = cyrb53(String(Math.random())); // Randomly generate seed each time
        const rand = seededRandom(seed);
        const generatedElements: React.ReactNode[] = [];
        const width = 800; // viewbox width
        const height = 800; // viewbox height

        // Add main grid lines (like graph paper)
        for(let i = 1; i < 8; i++) {
            generatedElements.push(<line key={`h-grid-${i}`} x1={0} y1={i * 100} x2={width} y2={i * 100} stroke="#60a5fa" strokeWidth="1" opacity="0.4" />);
            generatedElements.push(<line key={`v-grid-${i}`} x1={i * 100} y1={0} x2={i * 100} y2={height} stroke="#60a5fa" strokeWidth="1" opacity="0.4" />);
        }
        // Fainter sub-grid
        for(let i = 1; i < 40; i++) {
             if (i % 5 !== 0) {
                generatedElements.push(<line key={`sh-grid-${i}`} x1={0} y1={i * 20} x2={width} y2={i * 20} stroke="white" strokeWidth="0.5" opacity="0.1" />);
                generatedElements.push(<line key={`sv-grid-${i}`} x1={i * 20} y1={0} x2={i * 20} y2={height} stroke="white" strokeWidth="0.5" opacity="0.1" />);
             }
        }

        // Generate dots
        const numDots = 60 + Math.floor(rand() * 20);
        for (let i = 0; i < numDots; i++) {
            const r = rand() > 0.9 ? rand() * 8 + 6 : rand() * 4 + 2;
            const isHalf = rand() > 0.95; // Some dots are cut off at the edge
            let cx = rand() * width;
            let cy = rand() * height;

            if (isHalf) {
                if (rand() > 0.5) {
                    cx = rand() > 0.5 ? -r/2 : width + r/2;
                } else {
                    cy = rand() > 0.5 ? -r/2 : height + r/2;
                }
            }

            generatedElements.push(
                <circle
                    key={`dot-${i}`}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="#E5E7EB"
                    opacity={0.7}
                />
            );
        }

        // Generate smooth curved line (non-looping sine-like wave)
        let currentX = -50; // Start off-screen
        let currentY = rand() * height;
        let pathData = `M ${currentX} ${currentY}`;
        const numSegments = 5 + Math.floor(rand() * 3);
        const segmentWidth = (width + 100) / numSegments;
        for (let i = 0; i < numSegments; i++) {
            const nextX = currentX + segmentWidth;
            const nextY = rand() * height;

            if (i === 0) {
                // The first segment must use a full cubic Bézier to establish the initial direction.
                const cp1x = currentX + (nextX - currentX) * (0.2 + rand() * 0.2);
                const cp1y = rand() * height;
                const cp2x = currentX + (nextX - currentX) * (0.6 + rand() * 0.2);
                const cp2y = rand() * height;
                pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${nextX} ${nextY}`;
            } else {
                // Subsequent segments use the smooth curveto command, which reflects the previous control point.
                const cp2x = currentX + (nextX - currentX) * (0.6 + rand() * 0.2);
                const cp2y = rand() * height;
                pathData += ` S ${cp2x} ${cp2y}, ${nextX} ${nextY}`;
            }
            
            currentX = nextX;
            currentY = nextY;
        }
        generatedElements.push(
            <path
                key="curve"
                d={pathData}
                stroke="#D98383"
                strokeWidth="4"
                fill="none"
                opacity={0.8}
            />
        );
        
        // Add highlighted data point
        generatedElements.push(
            <circle
                key="highlight-dot"
                cx={rand() * width}
                cy={rand() * height}
                r={12}
                fill="#FBBF24"
                opacity={0.9}
            />
        );
        // Add a vertical line like in the image
        const xPos = rand() * width;
        generatedElements.push(
             <line key="v-line-highlight" x1={xPos} y1={0} x2={xPos} y2={height} stroke="#FBBF24" strokeWidth="1.5" opacity="0.6" />
        );


        return generatedElements;
    }, []);

    return (
        <svg
            viewBox="0 0 800 800"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full opacity-90 z-0 pointer-events-none"
            aria-hidden="true"
        >
            {elements}
        </svg>
    );
});


interface QuadrantViewProps {
    quadrantMap: SectorState[][];
    playerPosition: { qx: number; qy: number };
    onWarp: (pos: { qx: number; qy: number }) => void;
    onScanQuadrant: (pos: QuadrantPosition) => void;
    isInCombat: boolean;
    themeName: ThemeName;
}

const QuadrantView: React.FC<QuadrantViewProps> = ({ quadrantMap, playerPosition, onWarp, onScanQuadrant, isInCombat, themeName }) => {
    const quadrantSize = { width: 8, height: 8 };
    const [contextMenu, setContextMenu] = useState<{ qx: number; qy: number } | null>(null);

    const getFactionDisplay = (faction: FactionOwner) => {
        switch (faction) {
            case 'Federation': return { bg: 'bg-transparent', border: 'border-blue-500', text: 'text-blue-300', name: 'Federation Space' };
            case 'Klingon': return { bg: 'bg-transparent', border: 'border-red-500', text: 'text-red-300', name: 'Klingon Empire' };
            case 'Romulan': return { bg: 'bg-transparent', border: 'border-green-500', text: 'text-green-300', name: 'Romulan Star Empire' };
            case 'None': return { bg: 'bg-transparent', border: 'border-gray-500', text: 'text-gray-400', name: 'Uncharted Space' };
            default: return { bg: 'bg-transparent', border: 'border-border-dark', text: 'text-text-disabled', name: 'Unknown' };
        }
    };
    
    const menuStyle: React.CSSProperties = contextMenu ? {
        position: 'absolute',
        left: `${(contextMenu.qx / quadrantSize.width) * 100}%`,
        top: `${(contextMenu.qy / quadrantSize.height) * 100}%`,
        transform: `translate(${contextMenu.qx >= quadrantSize.width / 2 ? '-105%' : '5%'}, ${contextMenu.qy >= quadrantSize.height / 2 ? '-105%' : '5%'})`,
        zIndex: 30,
    } : {};


    return (
        <div className="panel-style p-1 h-full flex flex-col bg-black" onClick={() => setContextMenu(null)}>
            <div className="grid grid-cols-8 grid-rows-8 gap-0 flex-grow relative">
                <QuadrantGFXBackground />
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
                        bgClass = factionDisplay.bg;
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
                        bgClass = 'bg-black bg-opacity-60';
                        borderClass = 'border-border-dark';
                        textClass = 'text-text-disabled';
                        title = `Unexplored Sector (${qx},${qy})`;
                        content = <span className={`font-bold text-3xl ${textClass} opacity-50`}>?</span>;
                    }
                    
                    let hoverClass = '';
                    if (isPlayerHere) {
                        borderClass = 'border-accent-yellow ring-2 ring-accent-yellow';
                    } else if (isAdjacent) {
                        hoverClass = 'hover:bg-accent-yellow hover:bg-opacity-20 cursor-pointer';
                    }

                    const cellClasses = [
                        'border',
                        borderClass,
                        bgClass,
                        hoverClass,
                        'transition-colors flex flex-col items-center justify-center relative p-1 overflow-hidden z-10',
                        themeName === 'klingon' ? 'klingon-quad-cell' : ''
                    ].join(' ');

                    return (
                        <div
                            key={`sector-${qx}-${qy}`}
                            className={cellClasses}
                            onClick={(e) => {
                                if (isAdjacent) {
                                    e.stopPropagation();
                                    setContextMenu({ qx, qy });
                                }
                            }}
                            title={title}
                        >
                            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                                {content}
                            </div>
                            {isPlayerHere && (
                                <div className="absolute inset-0 flex items-center justify-center text-accent-yellow z-20">
                                    <PlayerShipIcon className="w-8 h-8 animate-pulse" />
                                </div>
                            )}
                        </div>
                    );
                })}
                 {contextMenu && (
                    <div 
                        style={menuStyle}
                        className="bg-bg-paper-lighter border-2 border-border-light rounded-md shadow-lg p-2 flex flex-col gap-1 w-36"
                        onClick={e => e.stopPropagation()}
                    >
                        <h4 className="text-sm font-bold text-center border-b border-border-dark mb-1 pb-1">Sector ({contextMenu.qx},{contextMenu.qy})</h4>
                        <button 
                            onClick={() => { onWarp(contextMenu); setContextMenu(null); }} 
                            className="btn btn-primary text-xs w-full"
                            disabled={isInCombat}
                            title={isInCombat ? "Cannot warp during Red Alert" : "Engage Warp Drive"}
                        >
                            Warp
                        </button>
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