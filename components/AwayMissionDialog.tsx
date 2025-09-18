import React, { useState } from 'react';
import type { ActiveAwayMission, ActiveAwayMissionOption, AwayMissionRole } from '../types';
import { getFactionIcons } from '../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../hooks/useTheme';

interface AwayMissionDialogProps {
    mission: ActiveAwayMission;
    onChoose: (option: ActiveAwayMissionOption) => void;
    themeName: ThemeName;
}

const AwayMissionDialog: React.FC<AwayMissionDialogProps> = ({ mission, onChoose, themeName }) => {
    const [hoveredRole, setHoveredRole] = useState<AwayMissionRole | null>(null);
    const { ScienceIcon, SecurityIcon, EngineeringIcon } = getFactionIcons(themeName);

    // Using a larger icon for better visual presence.
    const roleIcons: { [key in AwayMissionRole]?: React.ReactNode } = {
        Security: <SecurityIcon className="w-8 h-8 text-accent-red" />,
        Science: <ScienceIcon className="w-8 h-8 text-secondary-light" />,
        Engineering: <EngineeringIcon className="w-8 h-8 text-accent-yellow" />,
        Medical: <div className="w-8 h-8" />, // placeholder
        Counselor: <div className="w-8 h-8" />, // placeholder
    };

    // Pre-process options to link them with advice for cleaner rendering.
    const optionsWithAdvice = mission.options.map(option => ({
        ...option,
        advice: mission.advice.find(adv => adv.role === option.role),
    }));

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-8">
            <div className="panel-style p-6 max-w-3xl w-full flex flex-col" style={{borderColor: 'var(--color-accent-green)'}}>
                <h2 className="text-3xl font-bold text-accent-green mb-2 text-center">{mission.title}</h2>
                <p className="text-lg mb-6 text-text-secondary text-center italic">"{mission.description}"</p>
                
                <div className="space-y-3 border-t border-border-dark pt-4">
                    <h3 className="text-xl font-bold text-accent-yellow text-center mb-2">Consult Your Officers &amp; Choose an Approach</h3>
                    {optionsWithAdvice.map((option) => (
                        <button
                            key={option.role}
                            onClick={() => onChoose(option)}
                            onMouseEnter={() => setHoveredRole(option.role)}
                            onMouseLeave={() => setHoveredRole(null)}
                            className="w-full text-left p-3 flex items-start gap-4 transition-all duration-200 ease-in-out bg-bg-paper-lighter rounded-md border-2 border-transparent hover:border-accent-yellow hover:bg-bg-paper cursor-pointer"
                        >
                            <div className="flex-shrink-0 pt-1">
                                {roleIcons[option.role]}
                            </div>
                            <div className="flex flex-col flex-grow min-h-[4.5rem]">
                                <span className="font-bold text-accent-yellow-dark">
                                    {option.advice?.officerName || `${option.role} Officer`} ({option.role})
                                </span>
                                <div className="font-normal text-sm text-text-primary flex-grow flex items-center">
                                    {hoveredRole === option.role
                                        ? <p className="text-accent-yellow font-bold not-italic">{option.text}</p>
                                        : <p className="italic text-text-secondary">"{option.advice?.message || 'No specific counsel available.'}"</p>
                                    }
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AwayMissionDialog;
