import React from 'react';
import type { ActiveCounselSession, AwayMissionRole } from '../types';
import { ScienceIcon, SecurityIcon, EngineeringIcon } from '../assets/ui/icons';

interface OfficerCounselDialogProps {
  counselSession: ActiveCounselSession;
  onProceed: () => void;
  onAbort: () => void;
}

const roleIcons: { [key in AwayMissionRole]?: React.ReactNode } = {
    Security: <SecurityIcon className="w-8 h-8 text-accent-red" />,
    Science: <ScienceIcon className="w-8 h-8 text-secondary-light" />,
    Engineering: <EngineeringIcon className="w-8 h-8 text-accent-yellow" />,
};

const OfficerCounselDialog: React.FC<OfficerCounselDialogProps> = ({ counselSession, onProceed, onAbort }) => {
  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-8">
      <div className="panel-style p-6 max-w-3xl w-full flex flex-col" style={{borderColor: 'var(--color-accent-yellow)'}}>
        <h2 className="text-3xl font-bold text-accent-yellow mb-2 text-center">Officer Counsel: {counselSession.mission.title}</h2>
        <p className="text-md mb-6 text-text-secondary text-center italic">"{counselSession.mission.description}"</p>
        
        <div className="space-y-4 mb-6 overflow-y-auto max-h-[40vh] pr-2">
            {counselSession.advice.map((adv, index) => (
                <div key={index} className="flex items-start gap-4 bg-black p-3 rounded-md">
                    <div className="flex-shrink-0 pt-1">
                        {roleIcons[adv.role]}
                    </div>
                    <div>
                        <h4 className="font-bold text-accent-yellow">{adv.officerName} ({adv.role})</h4>
                        <p className="text-text-primary italic">"{adv.message}"</p>
                    </div>
                </div>
            ))}
        </div>
        
        <div className="mt-auto flex justify-center gap-4">
          <button
            onClick={onAbort}
            className="btn btn-tertiary px-6"
          >
            Abort Mission
          </button>
          <button
            onClick={onProceed}
            className="btn btn-accent green px-8"
          >
            Proceed to Mission
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfficerCounselDialog;