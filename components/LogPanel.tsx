import React, { useRef, useEffect } from 'react';
import type { LogEntry } from '../types';

interface LogPanelProps {
  logs: LogEntry[];
}

const TurnSeparator: React.FC<{ turn: number }> = ({ turn }) => (
    <div className="flex items-center my-4" aria-hidden="true">
        <div className="flex-grow border-t border-border-dark"></div>
        <span className="flex-shrink mx-4 text-xs text-text-disabled uppercase">Turn {turn}</span>
        <div className="flex-grow border-t border-border-dark"></div>
    </div>
);

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

  return (
    <div className="panel-style p-4 h-full grid grid-rows-[auto_1fr] gap-2 min-h-0">
      <h2 className="text-xl font-bold text-secondary-light">Captain's Log</h2>
      <div ref={logContainerRef} className="bg-black p-2 rounded-inner overflow-y-auto font-mono text-sm">
        {logs.map((log, index) => {
            const previousLog = logs[index - 1];
            const showHeader = !previousLog || previousLog.sourceId !== log.sourceId || previousLog.turn !== log.turn;
            const isNewTurn = previousLog && previousLog.turn !== log.turn;
            
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
    </div>
  );
};

export default LogPanel;