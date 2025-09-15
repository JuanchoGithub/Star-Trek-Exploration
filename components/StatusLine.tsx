import React from 'react';

interface StatusLineProps {
  latestLog: string;
  onToggleLog: () => void;
  onOpenGameMenu: () => void;
}

const StatusLine: React.FC<StatusLineProps> = ({ latestLog, onToggleLog, onOpenGameMenu }) => {
  return (
    <div className="bg-gray-800 border-2 border-blue-400 p-2 rounded-md h-full flex items-center justify-between text-sm font-mono">
       <button 
        onClick={onOpenGameMenu} 
        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded flex-shrink-0"
      >
        Game Menu
      </button>
      <p className="flex-grow text-center mx-4 italic text-gray-400 truncate" title={latestLog}>
        {latestLog}
      </p>
      <button 
        onClick={onToggleLog} 
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-3 rounded flex-shrink-0"
      >
        View Captain's Log
      </button>
    </div>
  );
};

export default StatusLine;