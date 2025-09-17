import React from 'react';
import type { AwayMissionTemplate, AwayMissionOption } from '../types';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../hooks/useTheme';

interface AwayMissionDialogProps {
    mission: AwayMissionTemplate;
    onChoose: (option: AwayMissionOption) => void;
    themeName: ThemeName;
}

const AwayMissionDialog: React.FC<AwayMissionDialogProps> = ({ mission, onChoose, themeName }) => {
    const { ScienceIcon, SecurityIcon, EngineeringIcon } = getFactionIcons(themeName);

    const roleIcons: { [key in AwayMissionOption['role']]: React.ReactNode } = {
        Security: <SecurityIcon className="w-6 h-6" />,
        Science: <ScienceIcon className="w-6 h-6" />,
        Engineering: <EngineeringIcon className="w-6 h-6" />,
        Medical: <div />, // placeholder
        Counselor: <div />, // placeholder
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-8">
            <div className="panel-style p-6 max-w-2xl w-full text-center" style={{borderColor: 'var(--color-accent-green)'}}>
                <h2 className="text-3xl font-bold text-accent-green mb-4">{mission.title}</h2>
                <p className="text-lg mb-6 text-text-secondary">{mission.description}</p>
                <div className="space-y-3">
                    {mission.options.map((option) => (
                        <button
                            key={option.role}
                            onClick={() => onChoose(option)}
                            className="w-full text-left p-4 flex items-center gap-4 btn btn-accent green bg-opacity-40 hover:bg-opacity-60 text-white"
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