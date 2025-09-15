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
    <div className="bg-gray-800 border-2 border-blue-400 p-4 rounded-md h-full grid grid-rows-[auto_1fr] gap-2 min-h-0">
      <h2 className="text-xl font-bold text-blue-300">Captain's Log</h2>
      <div ref={logContainerRef} className="bg-black p-2 rounded-inner overflow-y-auto font-mono text-sm space-y-1">
        {logs.map((log, index) => {
            const isError = log.toLowerCase().includes('critical') || log.toLowerCase().includes('failed');
            const isSuccess = log.toLowerCase().includes('destroyed!');
            const isWarning = log.toLowerCase().includes('damage');
            
            let textColor = 'text-gray-300';
            if (isError) textColor = 'text-red-400';
            else if (isSuccess) textColor = 'text-green-400';
            else if (isWarning) textColor = 'text-yellow-400';

            return <p key={index} className={textColor}>{log}</p>
        })}
      </div>
    </div>
  );
};

export default LogPanel;