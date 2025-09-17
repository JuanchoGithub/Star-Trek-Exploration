import React from 'react';

interface StatusLineProps {
  latestLog: string;
  onToggleLog: () => void;
  onOpenGameMenu: () => void;
  children?: React.ReactNode;
}

const StatusLine: React.FC<StatusLineProps> = ({ latestLog, onToggleLog, onOpenGameMenu, children }) => {
  return (
    <div className="bg-bg-paper-lighter border-2 border-border-main p-2 rounded-md h-full flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenGameMenu} 
          className="bg-bg-paper hover:bg-bg-paper-lighter text-text-primary font-bold py-1 px-3 rounded flex-shrink-0"
        >
          Game Menu
        </button>
        {children}
      </div>
      <p className="flex-grow text-center mx-4 italic text-text-secondary truncate" title={latestLog}>
        {latestLog}
      </p>
      <button 
        onClick={onToggleLog} 
        className="bg-primary-main hover:bg-primary-light text-primary-text font-bold py-1 px-3 rounded flex-shrink-0"
      >
        View Captain's Log
      </button>
    </div>
  );
};

export default StatusLine;