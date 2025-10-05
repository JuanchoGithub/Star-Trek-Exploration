import React from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { useUIState } from '../contexts/UIStateContext';

interface StatusLineProps {
  children?: React.ReactNode;
}

const StatusLine: React.FC<StatusLineProps> = ({ children }) => {
  const { gameState } = useGameState();
  const { setShowLogModal, setShowGameMenu } = useUIState();

  const latestLog = gameState && gameState.logs.length > 0 ? gameState.logs[gameState.logs.length-1] : null;
  const rawLogMessage = latestLog ? latestLog.message : "Welcome to the U.S.S. Endeavour.";
  
  const truncateMessage = (message: string, maxLength: number) => {
    if (message.length <= maxLength) {
        return message;
    }
    return message.substring(0, maxLength) + '...';
  };

  const displayedLogMessage = truncateMessage(rawLogMessage, 100);

  return (
    <div className="panel-style p-2 h-full flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setShowGameMenu(true)} 
          className="btn btn-tertiary flex-shrink-0"
        >
          Game Menu
        </button>
        {children}
      </div>
      <p className="flex-grow text-center mx-4 italic text-text-secondary truncate" title={rawLogMessage}>
        {displayedLogMessage}
      </p>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setShowLogModal(true)} 
          className="btn btn-primary flex-shrink-0"
        >
          View Captain's Log
        </button>
      </div>
    </div>
  );
};

export default StatusLine;
