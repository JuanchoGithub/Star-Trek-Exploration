import React, { useRef, useEffect } from 'react';

interface LogPanelProps {
  logs: string[];
}

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = 0;
        }
    }, [logs]);

  return (
    <div className="panel-style p-4 h-full grid grid-rows-[auto_1fr] gap-2 min-h-0">
      <h2 className="text-xl font-bold text-secondary-light">Captain's Log</h2>
      <div ref={logContainerRef} className="bg-black p-2 rounded-inner overflow-y-auto font-mono text-sm space-y-1">
        {logs.map((log, index) => {
            const isError = log.toLowerCase().includes('critical') || log.toLowerCase().includes('failed');
            const isSuccess = log.toLowerCase().includes('destroyed!');
            const isWarning = log.toLowerCase().includes('damage');
            
            let textColor = 'text-text-secondary';
            if (isError) textColor = 'text-accent-red';
            else if (isSuccess) textColor = 'text-accent-green';
            else if (isWarning) textColor = 'text-accent-yellow';

            return <p key={index} className={textColor}>{log}</p>
        })}
      </div>
    </div>
  );
};

export default LogPanel;