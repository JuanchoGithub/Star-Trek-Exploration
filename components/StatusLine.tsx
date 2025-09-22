import React from 'react';
import { LogEntry } from '../types';

interface StatusLineProps {
  latestLog: LogEntry | null;
  onToggleLog: () => void;
  onOpenGameMenu: () => void;
  children?: React.ReactNode;
}

const StatusLine: React.FC<StatusLineProps> = ({ latestLog, onToggleLog, onOpenGameMenu, children }) => {
  const rawLogMessage = latestLog ? latestLog.message : "Welcome to the U.S.S. Endeavour.";
  
  const truncateMessage = (message: string, maxLength: number) => {
    if (message.length <= maxLength) {
        return message;
    }
    // Truncate and add ellipsis
    return message.substring(0, maxLength) + '...';
  };

  const displayedLogMessage = truncateMessage(rawLogMessage, 100);

  return (
    <div className="panel-style p-2 h-full flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenGameMenu} 
          className="btn btn-tertiary flex-shrink-0"
        >
          Game Menu
        </button>
        {children}
      </div>
      <p className="flex-grow text-center mx-4 italic text-text-secondary truncate" title={rawLogMessage}>
        {displayedLogMessage}
      </p>
      <button 
        onClick={onToggleLog} 
        className="btn btn-primary flex-shrink-0"
      >
        View Captain's Log
      </button>
    </div>
  );
};

export default StatusLine;