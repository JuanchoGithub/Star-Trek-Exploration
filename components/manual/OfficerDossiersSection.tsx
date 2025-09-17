import React from 'react';
import { getFactionIcons } from '../../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../../hooks/useTheme';
import { SectionHeader } from './shared';

interface OfficerDossiersSectionProps {
    themeName: ThemeName;
}

const OfficerEntry: React.FC<{
    name: string,
    icon: React.ReactNode,
    record: string,
    profile: string,
    analysis: string
}> = ({ name, icon, record, profile, analysis }) => (
    <div className="mb-6 p-3 bg-bg-paper-lighter rounded">
        <div className="flex items-center gap-4">
            <div className="flex-shrink-0 text-secondary-light">{icon}</div>
            <h3 className="text-xl font-bold text-accent-yellow">{name}</h3>
        </div>
        <div className="mt-2 pl-12">
            <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary">Service Record</h4>
            <p className="text-sm text-text-secondary italic mb-2">{record}</p>
             <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary">Psychological Profile</h4>
            <p className="text-sm text-text-secondary italic mb-2">{profile}</p>
             <h4 className="font-bold text-sm uppercase tracking-wider text-text-secondary">Operational Analysis</h4>
            <p className="text-sm text-text-secondary italic">{analysis}</p>
        </div>
    </div>
);

export const OfficerDossiersSection: React.FC<OfficerDossiersSectionProps> = ({ themeName }) => {
    const { ScienceIcon, SecurityIcon, EngineeringIcon } = getFactionIcons(themeName);
    
    return (
        <div>
            <SectionHeader>Bridge Officer Dossiers</SectionHeader>
            <p className="text-text-secondary mb-4">An overview of your senior staff. Their unique personalities and experience will shape the advice they provide during critical mission decisions.</p>
            <OfficerEntry 
                name="Cmdr. T'Vok, Science Officer"
                icon={<ScienceIcon className="w-8 h-8"/>}
                record="Graduate of the Vulcan Science Academy. Distinguished career in stellar cartography and xeno-biology. Served on the U.S.S. Intrepid before requesting a transfer to the Endeavour for its deep-space exploration profile."
                profile="Personality Type: Logical. Unflappable under pressure. Analyzes all situations based on available data and probability, often dismissing emotional or intuitive arguments."
                analysis="Cmdr. T'Vok's counsel will always favor the most probable path to success with the least risk to scientific objectives. He will advocate for gathering more data before acting and will prioritize non-violent, analytical solutions."
            />
             <OfficerEntry 
                name="Lt. Thorne, Chief of Security"
                icon={<SecurityIcon className="w-8 h-8"/>}
                record="Decorated combat veteran of the Cardassian border skirmishes. Excelled in tactical operations and boarding actions. Known for a direct and sometimes confrontational command style."
                profile="Personality Type: Aggressive. Believes in overwhelming force as the most effective deterrent and solution. Prone to action over deliberation. Possesses a strong protective instinct for the crew."
                analysis="Lt. Thorne's advice will almost always involve a direct, forceful approach. He will recommend pre-emptive strikes, security sweeps, and tactical solutions to mission objectives, viewing diplomatic or scientific approaches as secondary or inefficient."
            />
             <OfficerEntry 
                name="Lt. Cmdr. Singh, Chief Engineer"
                icon={<EngineeringIcon className="w-8 h-8"/>}
                record="Rose through the ranks in Starfleet Engineering. Specialist in warp field dynamics and structural integrity. Served as Chief Engineer on a Miranda-class vessel before this assignment."
                profile="Personality Type: Cautious. Meticulous and risk-averse. Views every situation through the lens of equipment stress and potential system failure. 'Measure twice, cut once' is his mantra."
                analysis="Lt. Cmdr. Singh will consistently recommend the path of least risk to the ship and its crew. He will advocate for using remote probes, reinforcing systems before an operation, and finding engineering-based solutions that avoid direct confrontation or unknown variables."
            />
        </div>
    )
};
