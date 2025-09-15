import React from 'react';
import type { AwayMissionTemplate, AwayMissionOption } from '../types';
import { ScienceIcon, SecurityIcon, EngineeringIcon } from './Icons';

interface AwayMissionDialogProps {
    mission: AwayMissionTemplate;
    onChoose: (option: AwayMissionOption) => void;
}

const roleIcons: { [key in AwayMissionOption['role']]: React.ReactNode } = {
    Security: <SecurityIcon className="w-6 h-6" />,
    Science: <ScienceIcon className="w-6 h-6" />,
    Engineering: <EngineeringIcon className="w-6 h-6" />,
    Medical: <div />, // placeholder
    Counselor: <div />, // placeholder
};


const AwayMissionDialog: React.FC<AwayMissionDialogProps> = ({ mission, onChoose }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-8">
            <div className="bg-gray-800 border-2 border-green-400 p-6 rounded-md max-w-2xl w-full text-center">
                <h2 className="text-3xl font-bold text-green-400 mb-4">{mission.title}</h2>
                <p className="text-lg mb-6 text-gray-300">{mission.description}</p>
                <div className="space-y-3">
                    {mission.options.map((option) => (
                        <button
                            key={option.role}
                            onClick={() => onChoose(option)}
                            className="w-full text-left p-4 font-bold rounded transition-all flex items-center gap-4 bg-green-700 hover:bg-green-600 text-white"
                        >
                            {roleIcons[option.role]}
                            <div className="flex flex-col">
                                <span className="font-bold">{option.role} Approach</span>
                                <span className="font-normal text-sm text-gray-200">{option.text}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AwayMissionDialog;