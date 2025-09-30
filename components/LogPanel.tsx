import React, { useRef, useEffect, useMemo, useState } from 'react';
import type { LogEntry, Ship, LogCategory } from '../types';
import PlaybackControls from './PlaybackControls';

const MaximizeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
);
const MinimizeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    </svg>
);

interface PlaybackControlsProps {
    currentIndex: number;
    maxIndex: number;
    isPlaying: boolean;
    isTurnResolving?: boolean;
    onTogglePlay?: () => void;
    onStep: (direction: number) => void;
    onSliderChange: (index: number) => void;
}

interface LogPanelProps {
  logs: LogEntry[];
  onClose?: () => void;
  allShips?: Ship[];
  isSpectateMode?: boolean;
  playbackControls?: PlaybackControlsProps;
  playOrderEvents?: string[];
  playOrderIndex?: number;
  turn?: number;
}

const TurnSeparator: React.FC<{ turn: number }> = ({ turn }) => (
    <div className="flex items-center my-4" aria-hidden="true">
        <div className="flex-grow border-t border-border-dark"></div>
        <span className="flex-shrink mx-4 text-xs text-text-disabled uppercase">Turn {turn}</span>
        <div className="flex-grow border-t border-border-dark"></div>
    </div>
);

const LogPanel: React.FC<LogPanelProps> = ({ logs, onClose, allShips, isSpectateMode, playbackControls, playOrderEvents, playOrderIndex, turn }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const [selectedFaction, setSelectedFaction] = useState<string>('all');
    const [selectedShipId, setSelectedShipId] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedShipClass, setSelectedShipClass] = useState<string>('all');


    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, isMaximized, selectedFaction, selectedShipId, selectedCategory, selectedShipClass, playOrderEvents, playOrderIndex]);

    // Memoized filter options
    const factions = useMemo(() => ['all', ...Array.from(new Set(logs.map(l => l.sourceFaction).filter((f): f is string => !!f)))], [logs]);
    const categories = useMemo(() => ['all', ...Array.from(new Set(logs.map(l => l.category).filter((c): c is LogCategory => !!c)))], [logs]);
    
    const shipIdsInLog = useMemo(() => new Set(logs.map(l => l.sourceId)), [logs]);
    const allShipsInLog = useMemo(() => allShips?.filter(s => shipIdsInLog.has(s.id)) || [], [allShips, shipIdsInLog]);

    const filteredShipClasses = useMemo(() => {
        const relevantShips = selectedFaction === 'all' 
            ? allShipsInLog 
            : allShipsInLog.filter(s => s.faction === selectedFaction);
        return ['all', ...Array.from(new Set(relevantShips.map(s => s.shipClass)))];
    }, [allShipsInLog, selectedFaction]);

    const filteredShips = useMemo(() => {
        let ships = allShipsInLog;
        if (selectedFaction !== 'all') {
            ships = ships.filter(s => s.faction === selectedFaction);
        }
        if (selectedShipClass !== 'all') {
            ships = ships.filter(s => s.shipClass === selectedShipClass);
        }
        return ships;
    }, [allShipsInLog, selectedFaction, selectedShipClass]);

    // Reset filters if they become invalid due to another filter change
    useEffect(() => {
        if (selectedShipId !== 'all' && !filteredShips.some(s => s.id === selectedShipId)) {
            setSelectedShipId('all');
        }
    }, [filteredShips, selectedShipId]);

    useEffect(() => {
        if (selectedShipClass !== 'all' && !filteredShipClasses.includes(selectedShipClass)) {
            setSelectedShipClass('all');
        }
    }, [filteredShipClasses, selectedShipClass]);
    
    // Final log filtering logic
    const filteredLogs = useMemo(() => {
        const shipMap = new Map(allShips?.map(ship => [ship.id, ship]));

        return logs.filter(log => {
            if (selectedFaction !== 'all' && log.sourceFaction !== selectedFaction) return false;
            if (selectedShipId !== 'all' && log.sourceId !== selectedShipId) return false;
            if (selectedCategory !== 'all' && log.category !== selectedCategory) return false;
            
            if (selectedShipClass !== 'all') {
                const sourceShip = shipMap.get(log.sourceId);
                if (!sourceShip || typeof sourceShip !== 'object' || !('shipClass' in sourceShip) || (sourceShip as Ship).shipClass !== selectedShipClass) {
                    return false;
                }
            }

            return true;
        });
    }, [logs, selectedFaction, selectedShipId, selectedCategory, selectedShipClass, allShips]);

    const logView = (
        <div ref={logContainerRef} className="bg-black p-2 rounded-inner overflow-y-auto flex-grow min-h-0">
            {playOrderEvents ? (
                <>
                    {turn && <TurnSeparator turn={turn} />}
                    <ol className="list-decimal list-inside text-sm font-mono text-text-primary space-y-1">
                        {playOrderEvents.map((event, index) => (
                            <li key={index} className={index === playOrderIndex ? 'text-accent-yellow font-bold bg-bg-paper-lighter rounded' : ''}>
                                {index === playOrderIndex && <span className="inline-block w-6 text-center">-&gt;</span>}
                                <span className={index === playOrderIndex ? 'ml-0' : 'ml-6'}>{event}</span>
                            </li>
                        ))}
                         {playOrderEvents.length === 0 && (
                            <li className="list-none italic text-text-disabled">No significant events this turn.</li>
                        )}
                    </ol>
                </>
            ) : (
                filteredLogs.map((log, index) => {
                    const previousLog = filteredLogs[index - 1];
                    const isNewTurn = previousLog && previousLog.turn !== log.turn;
                    const showHeader = !previousLog || previousLog.sourceId !== log.sourceId || isNewTurn;
                    
                    const alignment = log.isPlayerSource ? 'justify-end' : 'justify-start';
                    const bubbleAlignment = log.isPlayerSource ? 'items-end' : 'items-start';

                    return (
                    <React.Fragment key={log.id}>
                        {isNewTurn && <TurnSeparator turn={log.turn} />}
                        <div className={`flex ${alignment} ${showHeader ? 'mt-3' : 'mt-1'}`}>
                        <div className={`flex flex-col ${bubbleAlignment} max-w-[80%]`}>
                            {showHeader && (
                                <span className="text-xs text-text-disabled px-2">{log.sourceName} - Turn {log.turn}</span>
                            )}
                            <div className={`p-2 rounded-lg border-2 ${log.color} bg-bg-paper-lighter`}>
                                <p className="text-text-primary whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: log.message }}></p>
                            </div>
                        </div>
                        </div>
                    </React.Fragment>
                    );
                })
            )}
        </div>
    );

    if (onClose) {
        // Modal version for main game
        return (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col z-50 p-4" onClick={onClose}>
                <div 
                    className="panel-style p-4 w-full max-w-4xl mx-auto flex-grow min-h-0 flex flex-col gap-2"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center flex-shrink-0">
                        <h2 className="text-xl font-bold text-secondary-light">Captain's Log</h2>
                        <button onClick={onClose} className="btn btn-tertiary">Close</button>
                    </div>
                    {logView}
                </div>
            </div>
        );
    }

    const getSimulatorTitle = () => {
        if (playOrderEvents) return `Execution Order: Turn ${turn}`;
        return 'Simulator Log';
    };

    const simulatorLogContent = (
        <>
            <div className="flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold text-secondary-light">{getSimulatorTitle()}</h2>
                {!playOrderEvents && (
                    <button onClick={() => setIsMaximized(!isMaximized)} className="btn btn-tertiary p-2">
                        {isMaximized ? <MinimizeIcon className="w-5 h-5" /> : <MaximizeIcon className="w-5 h-5" />}
                    </button>
                )}
            </div>
            {!playOrderEvents && (
                <div className="flex flex-wrap gap-2 items-center flex-shrink-0 border-b border-border-dark pb-2">
                    <select value={selectedFaction} onChange={e => setSelectedFaction(e.target.value)} className="bg-bg-paper p-1 rounded border border-border-dark text-sm">
                        {factions.map(f => <option key={f} value={f}>{f === 'all' ? 'All Factions' : f}</option>)}
                    </select>
                    <select value={selectedShipClass} onChange={e => setSelectedShipClass(e.target.value)} className="bg-bg-paper p-1 rounded border border-border-dark text-sm" disabled={filteredShipClasses.length <= 1}>
                        <option value="all">All Classes</option>
                        {filteredShipClasses.filter(c => c !== 'all').map(sc => <option key={sc} value={sc}>{sc}</option>)}
                    </select>
                    <select value={selectedShipId} onChange={e => setSelectedShipId(e.target.value)} className="bg-bg-paper p-1 rounded border border-border-dark text-sm" disabled={filteredShips.length === 0}>
                        <option value="all">All Ships</option>
                        {filteredShips.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-bg-paper p-1 rounded border border-border-dark text-sm">
                        {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                </div>
            )}
            {logView}
            {isMaximized && isSpectateMode && playbackControls && (
                <div className="flex-shrink-0 mt-2">
                    <PlaybackControls {...playbackControls} allowStepPastEnd={true} />
                </div>
            )}
        </>
    );
    
    const containerClasses = isMaximized 
        ? "fixed inset-4 bg-bg-default z-50 p-4 panel-style flex flex-col gap-2"
        : "panel-style p-4 h-full w-full flex flex-col gap-2";

    return (
        <div className={containerClasses}>
            {simulatorLogContent}
        </div>
    );
};

export default LogPanel;