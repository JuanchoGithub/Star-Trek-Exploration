import React from 'react';
import type { Ship } from '../types';

interface StatusLineProps {
  ship: Ship;
  latestLog: string;
  onToggleLog: () => void;
}

const StatusLine: React.FC<StatusLineProps> = ({ ship, latestLog, onToggleLog }) => {
  const hullPercentage = Math.round((ship.hull / ship.maxHull) * 100);
  const shieldsPercentage = Math.round((ship.shields / ship.maxShields) * 100);

  return (
    <div className="bg-gray-800 border-2 border-blue-400 p-2 rounded-md h-full flex items-center justify-between text-sm font-mono">
      <div className="flex items-center gap-x-4">
        <span className={hullPercentage < 30 ? 'text-red-400' : hullPercentage < 60 ? 'text-yellow-400' : 'text-green-400'}>
          HULL: {hullPercentage}%
        </span>
        <span className={shieldsPercentage < 30 ? 'text-red-400' : shieldsPercentage < 60 ? 'text-yellow-400' : 'text-cyan-400'}>
          SHIELDS: {shieldsPercentage}%
        </span>
      </div>
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
