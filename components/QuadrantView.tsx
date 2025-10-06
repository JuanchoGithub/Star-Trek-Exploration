// FIX: Removed invalid "--- START OF FILE components/QuadrantView.tsx ---" header.
import React, { useState, useMemo } from 'react';
import type { SectorState, FactionOwner, QuadrantPosition, Ship } from '../types';
import { shipVisuals } from '../assets/ships/configs/shipVisuals';
import { cyrb53, seededRandom } from '../game/utils/helpers';

const QuadrantGFXBackground: React.FC = React.memo(() => {
    const elements = useMemo(() => {
        const seed = cyrb53(String(Math.random())); // Randomly generate seed each time
        const rand = seededRandom(seed);
        const generatedElements: React.ReactNode[] = [];
        const totalSize = 800; // Use a square viewbox

        // Main grid lines for the 8x8 map
        for(let i = 0; i <= 8; i++) {
            const pos = i * 100;
            if (i > 0 && i < 8) { // Only draw inner grid lines
                generatedElements.push(<line key={`h-grid-${i}`} x1={0} y1={pos} x2={totalSize} y2={pos} stroke="#60a5fa" strokeWidth="1" opacity="0.4" />);
                generatedElements.push(<line key={`v-grid-${i}`} x1={pos} y1={0} x2={pos} y2={totalSize} stroke="#60a5fa" strokeWidth="1" opacity="0.4" />);
            }
        }
        // Fainter sub-grid
        for(let i = 1; i < 40; i++) {
             if (i % 5 !== 0) {
                const pos = i * 20;
                generatedElements.push(<line key={`sh-grid-${i}`} x1={0} y1={pos} x2={totalSize} y2={pos} stroke="white" strokeWidth="0.5" opacity="0.1" />);
                generatedElements.push(<line key={`sv-grid-${i}`} x1={pos} y1={0} x2={pos} y2={totalSize} stroke="white" strokeWidth="0.5" opacity="0.1" />);
             }
        }

        // Generate dots across the entire viewbox
        const numDots = 60 + Math.floor(rand() * 15);
        for (let i = 0; i < numDots; i++) {
            const r = rand() > 0.9 ? rand() * 8 + 6 : rand() * 4 + 2;
            const isHalf = rand() > 0.95;
            let cx = rand() * totalSize;
            let cy = rand() * totalSize;

            if (isHalf) {
                if (rand() > 0.5) {
                    cx = rand() > 0.5 ? -r/2 : totalSize + r/2;
                } else {
                    cy = rand() > 0.5 ? -r/2 : totalSize + r/2;
                }
            }

            generatedElements.push(<circle key={`dot-${i}`} cx={cx} cy={cy} r={r} fill="#E5E7EB" opacity={0.7} />);
        }

        // Generate smooth curved line across the entire viewbox
        let currentX = -50;
        let currentY = rand() * totalSize;
        let pathData = `M ${currentX} ${currentY}`;
        const numSegments = 4 + Math.floor(rand() * 2);
        const segmentWidth = (totalSize + 100) / numSegments;
        for (let i = 0; i < numSegments; i++) {
            const nextX = currentX + segmentWidth;
            const nextY = rand() * totalSize;

            if (i === 0) {
                const cp1x = currentX + (nextX - currentX) * (0.2 + rand() * 0.2);
                const cp1y = rand() * totalSize;
                const cp2x = currentX + (nextX - currentX) * (0.6 + rand() * 0.2);
                const cp2y = rand() * totalSize;
                pathData += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${nextX} ${nextY}`;
            } else {
                const cp2x = currentX + (nextX - currentX) * (0.6 + rand() * 0.2);
                const cp2y = rand() * totalSize;
                pathData += ` S ${cp2x} ${cp2y}, ${nextX} ${nextY}`;
            }
            
            currentX = nextX;
            currentY = nextY;
        }
        generatedElements.push(<path key="curve" d={pathData} stroke="#D98383" strokeWidth="4" fill="none" opacity={0.8} />);
        
        // Add highlighted data point somewhere on the grid
        generatedElements.push(<circle key="highlight-dot" cx={rand() * totalSize} cy={rand() * totalSize} r={12} fill="#FBBF24" opacity={0.9} />);
        // Add a vertical line
        const xPos = rand() * totalSize;
        generatedElements.push(<line key="v-line-highlight" x1={xPos} y1={0} x2={xPos} y2={totalSize} stroke="#FBBF24" strokeWidth="1.5" opacity="0.6" />);

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

const QuadrantIndicators: React.FC<{ sector: SectorState }> = ({ sector }) => {
    const indicators = useMemo(() => {
        const presentIndicators = new Set<string>();
        if (!sector.visited && !sector.isScanned) return [];

        if (sector.entities.some(e => e.type === 'ship' && (e as Ship).allegiance === 'enemy')) {
            presentIndicators.add('bg-accent-red');
        }
        if (sector.entities.some(e => e.type === 'starbase' || (e.type === 'ship' && (e as Ship).allegiance === 'ally'))) {
            presentIndicators.add('bg-accent-sky');
        }
        if (sector.entities.some(e => e.type === 'event_beacon')) {
            presentIndicators.add('bg-accent-purple');
        }
        if (sector.entities.some(e => e.type === 'planet')) {
            presentIndicators.add('bg-accent-green');
        }
        if (sector.entities.some(e => e.type === 'asteroid_field') || sector.hasNebula || sector.ionStormCells.length > 0) {
            presentIndicators.add('bg-gray-400');
        }
        return Array.from(presentIndicators);
    }, [sector]);

    if (indicators.length === 0) return null;

    return (
        <div className="absolute bottom-1 left-1 flex gap-1">
            {indicators.map((color, i) => (
                <div key={i} className={`quadrant-indicator ${color}`} />
            ))}
        </div>
    );
};


interface QuadrantViewProps {
    quadrantMap: SectorState[][];
    currentSector: SectorState;
    playerPosition: { qx: number; qy: number };
    playerShip: Ship;
    onWarp: (pos: { qx: number; qy: number }) => void;
    onScanQuadrant: (pos: QuadrantPosition) => void;
    isInCombat: boolean;
    themeName: string;
}

const QuadrantView: React.FC<QuadrantViewProps> = ({ quadrantMap, currentSector, playerPosition, playerShip, onWarp, onScanQuadrant, isInCombat, themeName }) => {
    const quadrantGridSize = { width: 8, height: 8 };
    const gridCells = Array.from({ length: quadrantGridSize.width * quadrantGridSize.height });
    
    const [contextMenu, setContextMenu] = useState<{ qx: number; qy: number } | null>(null);

    const playerVisualConfig = shipVisuals[playerShip.shipModel];
    const playerClassConfig = shipVisuals[playerShip.shipModel]?.classes[playerShip.shipClass] ?? shipVisuals.Unknown.classes['Unknown']!;
    const PlayerShipIcon = playerClassConfig.icon;

    const warpEngineHealthPercent = (playerShip.subsystems.engines.health / playerShip.subsystems.engines.maxHealth);
    const maxWarpDistance = Math.floor(1 + 0.09 * (warpEngineHealthPercent * 100));

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
        left: `${(contextMenu.qx / quadrantGridSize.width) * 100}%`,
        top: `${(contextMenu.qy / quadrantGridSize.height) * 100}%`,
        transform: `translate(${contextMenu.qx >= quadrantGridSize.width / 2 ? '-105%' : '5%'}, ${contextMenu.qy >= quadrantGridSize.height / 2 ? '-105%' : '5%'})`,
        zIndex: 30,
    } : {};

    const sectorForMenu = contextMenu ? quadrantMap[contextMenu.qy][contextMenu.qx] : null;
    const sectorInfo = useMemo(() => {
        if (!sectorForMenu) return { title: '', details: null };
        if (!sectorForMenu.isScanned && !sectorForMenu.visited) {
            return { title: 'Unscanned Sector', details: null };
        }
        
        const factionDisplay = getFactionDisplay(sectorForMenu.factionOwner);
        const hostiles = sectorForMenu.entities.filter(e => e.type === 'ship' && (e as Ship).allegiance === 'enemy').length;
        const friendlies = sectorForMenu.entities.filter(e => e.type === 'ship' && (e as Ship).allegiance === 'ally').length;
        const starbases = sectorForMenu.entities.filter(e => e.type === 'starbase').length;
        const planets = sectorForMenu.entities.filter(e => e.type === 'planet').length;
        const anomalies = sectorForMenu.entities.filter(e => e.type === 'event_beacon').length;

        const hazards = [];
        if (sectorForMenu.hasNebula) hazards.push('Nebula');
        if (sectorForMenu.ionStormCells.length > 0) hazards.push('Ion Storm');
        if (sectorForMenu.entities.some(e => e.type === 'asteroid_field')) hazards.push('Asteroids');

        return {
            title: factionDisplay.name,
            details: { hostiles, friendlies, starbases, planets, anomalies, hazards }
        };
    }, [sectorForMenu]);


    return (
        <div className="panel-style p-1 w-full h-full flex flex-col bg-black" onClick={() => setContextMenu(null)}>
            <div className="grid grid-cols-8 grid-rows-8 gap-0 h-full relative">
                <QuadrantGFXBackground />
                {gridCells.map((_, index) => {
                    const qx = index % quadrantGridSize.width;
                    const qy = Math.floor(index / quadrantGridSize.width);

                    const sector = quadrantMap[qy][qx];
                    const isPlayerHere = playerPosition.qx === qx && playerPosition.qy === qy;
                    
                    const displaySector = isPlayerHere ? currentSector : sector;
                    
                    const distance = Math.max(Math.abs(playerPosition.qx - qx), Math.abs(playerPosition.qy - qy));
                    const isWarpable = !isPlayerHere && distance > 0 && distance <= maxWarpDistance;

                    const isVisited = sector.visited;
                    const isScanned = sector.isScanned;

                    let bgClass, borderClass, textClass, title;
                    const factionDisplay = getFactionDisplay(displaySector.factionOwner);

                    if (isVisited) {
                        bgClass = factionDisplay.bg;
                        borderClass = factionDisplay.border;
                        textClass = factionDisplay.text;
                        title = `${factionDisplay.name} (${qx},${qy})`;
                    } else if (isScanned) {
                        bgClass = factionDisplay.bg;
                        borderClass = 'border-dashed ' + factionDisplay.border;
                        textClass = factionDisplay.text.replace('300', '500');
                        title = `Scanned: ${factionDisplay.name} (${qx},${qy})`;
                    } else { // Not visited, not scanned
                        bgClass = 'bg-black bg-opacity-60';
                        borderClass = 'border-border-dark';
                        textClass = 'text-text-disabled';
                        title = `Unexplored Sector (${qx},${qy})`;
                    }
                    
                    let hoverClass = '';
                    let cellTitle = title;
                    if (isPlayerHere) {
                        borderClass = 'border-accent-yellow ring-2 ring-accent-yellow';
                    } else if (isWarpable) {
                        hoverClass = 'hover:bg-accent-yellow hover:bg-opacity-20 cursor-pointer';
                    } else if (!isVisited && !isScanned && distance > maxWarpDistance) {
                        cellTitle += ` - Out of Warp Range (Max: ${maxWarpDistance})`;
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
                                if (isWarpable) {
                                    e.stopPropagation();
                                    setContextMenu({ qx, qy });
                                }
                            }}
                            title={cellTitle}
                        >
                            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                                <span className={`font-bold text-xs ${textClass}`}>({qx},{qy})</span>
                            </div>
                            {isPlayerHere && (
                                <div className="absolute inset-0 flex items-center justify-center text-accent-yellow z-20">
                                    <PlayerShipIcon className="w-8 h-8 animate-pulse" />
                                </div>
                            )}
                            {(isVisited || isScanned) && <QuadrantIndicators sector={displaySector} />}
                        </div>
                    );
                })}
                 {contextMenu && sectorForMenu && (
                    <div 
                        style={menuStyle}
                        className="bg-bg-paper-lighter border-2 border-border-light rounded-md shadow-lg p-2 flex flex-col gap-1 w-48"
                        onClick={e => e.stopPropagation()}
                    >
                        <h4 className="text-sm font-bold text-center border-b border-border-dark mb-2 pb-1">{sectorInfo.title} ({contextMenu.qx},{contextMenu.qy})</h4>
                        {sectorInfo.details && (
                            <div className="text-xs space-y-1 mb-2">
                                {sectorInfo.details.hostiles > 0 && <div className="flex justify-between"><span className="text-text-secondary">Hostile Contacts:</span><span className="font-bold text-accent-red">{sectorInfo.details.hostiles}</span></div>}
                                {sectorInfo.details.friendlies > 0 && <div className="flex justify-between"><span className="text-text-secondary">Friendly Contacts:</span><span className="font-bold text-accent-sky">{sectorInfo.details.friendlies}</span></div>}
                                {sectorInfo.details.starbases > 0 && <div className="flex justify-between"><span className="text-text-secondary">Starbases:</span><span className="font-bold text-accent-sky">{sectorInfo.details.starbases}</span></div>}
                                {sectorInfo.details.planets > 0 && <div className="flex justify-between"><span className="text-text-secondary">Planets:</span><span className="font-bold text-accent-green">{sectorInfo.details.planets}</span></div>}
                                {sectorInfo.details.anomalies > 0 && <div className="flex justify-between"><span className="text-text-secondary">Anomalies:</span><span className="font-bold text-accent-purple">{sectorInfo.details.anomalies}</span></div>}
                                {sectorInfo.details.hazards.length > 0 && <div className="flex justify-between"><span className="text-text-secondary">Hazards:</span><span className="font-bold text-gray-400">{sectorInfo.details.hazards.join(', ')}</span></div>}
                            </div>
                        )}
                        <button 
                            onClick={() => { onWarp(contextMenu); setContextMenu(null); }} 
                            className="btn btn-primary text-xs w-full"
                            disabled={isInCombat}
                            title={isInCombat ? "Cannot warp during Red Alert" : `Engage Warp Drive (Cost: ${Math.max(Math.abs(playerPosition.qx - contextMenu.qx), Math.abs(playerPosition.qy - contextMenu.qy))} Dilithium)`}
                        >
                            Warp
                        </button>
                        {!sectorForMenu.isScanned && !sectorForMenu.visited && (
                            <button onClick={() => { onScanQuadrant(contextMenu); setContextMenu(null); }} className="btn btn-secondary text-xs w-full">Scan (5 Pwr)</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuadrantView;