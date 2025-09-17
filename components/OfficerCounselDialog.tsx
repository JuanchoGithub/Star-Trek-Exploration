import React from 'react';
import type { ActiveCounselSession, AwayMissionRole } from '../types';
import { ScienceIcon, SecurityIcon, EngineeringIcon } from '../assets/ui/icons';

interface OfficerCounselDialogProps {
  counselSession: ActiveCounselSession;
  onProceed: () => void;
  onAbort: () => void;
}

const roleIcons: { [key in AwayMissionRole]?: React.ReactNode } = {
    Security: <SecurityIcon className="w-8 h-8 text-red-400" />,
    Science: <ScienceIcon className="w-8 h-8 text-blue-400" />,
    Engineering: <EngineeringIcon className="w-8 h-8 text-yellow-400" />,
};

const OfficerCounselDialog: React.FC<OfficerCounselDialogProps> = ({ counselSession, onProceed, onAbort }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-8">
      <div className="bg-gray-800 border-2 border-yellow-400 p-6 rounded-md max-w-3xl w-full flex flex-col">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2 text-center">Officer Counsel: {counselSession.mission.title}</h2>
        <p className="text-md mb-6 text-gray-300 text-center italic">"{counselSession.mission.description}"</p>
        
        <div className="space-y-4 mb-6 overflow-y-auto max-h-[40vh] pr-2">
            {counselSession.advice.map((adv, index) => (
                <div key={index} className="flex items-start gap-4 bg-black p-3 rounded-md">
                    <div className="flex-shrink-0 pt-1">
                        {roleIcons[adv.role]}
                    </div>
                    <div>
                        <h4 className="font-bold text-yellow-300">{adv.officerName} ({adv.role})</h4>
                        <p className="text-gray-200 italic">"{adv.message}"</p>
                    </div>
                </div>
            ))}
        </div>
        
        <div className="mt-auto flex justify-center gap-4">
          <button
            onClick={onAbort}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-all"
          >
            Abort Mission
          </button>
          <button
            onClick={onProceed}
            className="px-8 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all"
          >
            Proceed to Mission
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficerCounselDialog;