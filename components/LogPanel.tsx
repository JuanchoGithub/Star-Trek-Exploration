
import React, { useRef, useEffect } from 'react';
import type { LogEntry } from '../types';

interface LogPanelProps {
  logs: LogEntry[];
  onClose?: () => void;
}

const TurnSeparator: React.FC<{ turn: number }> = ({ turn }) => (
    <div className="flex items-center my-4" aria-hidden="true">
        <div className="flex-grow border-t border-border-dark"></div>
        <span className="flex-shrink mx-4 text-xs text-text-disabled uppercase">Turn {turn}</span>
        <div className="flex-grow border-t border-border-dark"></div>
    </div>
);

const LogPanel: React.FC<LogPanelProps> = ({ logs, onClose }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const logView = (
        <div ref={logContainerRef} className="bg-black p-2 rounded-inner overflow-y-auto flex-grow min-h-0">
            {logs.map((log, index) => {
                const previousLog = logs[index - 1];
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
                            <p className="text-text-primary whitespace-pre-wrap">{log.message}</p>
                          </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
            })}
        </div>
    );

    if (onClose) {
        // Modal version
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

    // Inline panel version for simulator
    return (
        <div className="panel-style p-4 h-full w-full flex flex-col gap-2">
            <div className="flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold text-secondary-light">Simulator Log</h2>
            </div>
            {logView}
        </div>
    );
};

export default LogPanel;