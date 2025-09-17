import React from 'react';
import { LogEntry } from '../types';

interface StatusLineProps {
  latestLog: LogEntry | null;
  onToggleLog: () => void;
  onOpenGameMenu: () => void;
  children?: React.ReactNode;
}

const StatusLine: React.FC<StatusLineProps> = ({ latestLog, onToggleLog, onOpenGameMenu, children }) => {
  const logMessage = latestLog ? latestLog.message : "Welcome to the U.S.S. Endeavour.";
  
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
      <p className="flex-grow text-center mx-4 italic text-text-secondary truncate" title={logMessage}>
        {logMessage}
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