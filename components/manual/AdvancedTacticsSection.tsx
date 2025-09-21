import React from 'react';
import { getFactionIcons } from '../../assets/ui/icons/getFactionIcons';
import { ThemeName } from '../../hooks/useTheme';
import { SectionHeader, SubHeader } from './shared';

interface AdvancedTacticsSectionProps {
    themeName: ThemeName;
}

export const AdvancedTacticsSection: React.FC<AdvancedTacticsSectionProps> = ({ themeName }) => {
    const { WeaponIcon, ShieldIcon, EngineIcon, TransporterIcon } = getFactionIcons(themeName);
    
    return (
        <div>
            <SectionHeader>Advanced Tactical Operations</SectionHeader>
            <SubHeader>Subsystem Targeting Strategy</SubHeader>
            <p className="text-text-secondary mb-4">A discerning captain knows that simply pounding on an enemy's hull is inefficient. Crippling key systems can neutralize a threat with less risk and greater tactical advantage. An enemy ship is only as dangerous as its functioning components.</p>
            <div className="space-y-3">
                <div className="flex items-start gap-4 p-2 bg-bg-paper-lighter rounded">
                    <WeaponIcon className="w-8 h-8 text-accent-red flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-bold">Targeting: Weapons</h4>
                        <p className="text-sm text-text-secondary">Disabling an enemy's weapon systems is the most direct way to reduce incoming damage. A ship with zero weapon health cannot fire phasers or launch torpedoes, rendering it harmless from a distance. This is the priority target when facing a high-damage vessel like a Klingon Bird-of-Prey.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-2 bg-bg-paper-lighter rounded">
                    <EngineIcon className="w-8 h-8 text-accent-green flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-bold">Targeting: Engines</h4>
                        <p className="text-sm text-text-secondary">A ship that cannot move is a sitting duck. Disabling engines will leave a vessel dead in space, unable to pursue, retreat, or adjust its range. This makes them exceptionally vulnerable to slow-moving, high-damage torpedoes and allows you to control the engagement distance.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-2 bg-bg-paper-lighter rounded">
                    <ShieldIcon className="w-8 h-8 text-secondary-main flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-bold">Targeting: Shields</h4>
                        <p className="text-sm text-text-secondary">Destroying the shield generator prevents the enemy from regenerating their shields for the remainder of combat. This means any subsequent hull damage is permanent. This is a powerful long-term strategy in a protracted battle, ensuring that your efforts are not undone by their engineering crews.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 p-2 bg-bg-paper-lighter rounded">
                    <TransporterIcon className="w-8 h-8 text-accent-purple flex-shrink-0 mt-1"/>
                    <div>
                        <h4 className="font-bold">Targeting: Transporter</h4>
                        <p className="text-sm text-text-secondary">While most hostile ships lack transporters, those that possess them (primarily other Federation or high-tier vessels) use them to repel boarders and conduct rapid internal repairs. Disabling their transporter makes them highly vulnerable to your own boarding actions and strike teams.</p>
                    </div>
                </div>
            </div>
            <SubHeader>Away Team & Transporter Doctrine</SubHeader>
            <p className="text-text-secondary mb-4">Your Security Teams and Transporter Room are a versatile strategic asset, not just a last resort. Proper deployment can end a battle or complete a mission without firing a shot.</p>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-1">
                <li><strong>Condition for Transport:</strong> All transport-based actions (Away Missions, Boarding, Strikes) require two conditions: your Transporter must be online, and the target's shields must be down (or below 20% for enemy ships).</li>
                <li><strong>Boarding:</strong> A high-risk, high-reward maneuver. Success instantly captures the enemy vessel, changing its icon to friendly blue on the tactical display. Failure results in the loss of the entire security team and a significant blow to crew morale. Only to be attempted when victory is uncertain or a ship must be taken intact.</li>
                <li><strong>Strike:</strong> A lower-risk alternative to boarding. A security team transports over, sabotages a critical system dealing direct hull damage, and transports back. There is a small but non-zero chance of losing the team in the firefight, with a minor morale penalty.</li>
                 <li><strong>Planetary Away Missions:</strong> The primary method of investigating planets. The composition of the away team (Science, Security, Engineering) is determined by your command choice, influencing the probability of success. A disabled Transporter makes these missions impossible.</li>
            </ul>
             <SubHeader>General Order 1: The Prime Directive</SubHeader>
            <div className="border-l-4 border-border-main pl-4 italic text-text-secondary my-4">
                "As the right of each sentient species to live in accordance with its normal cultural evolution is considered sacred, no Starfleet personnel may interfere with the healthy and normal development of alien life and culture. Such interference includes the introduction of superior knowledge, strength, or technology to a world whose society is incapable of handling such advantages wisely."
            </div>
            <p className="text-text-secondary">This is Starfleet's most important mandate. On missions involving pre-warp civilizations—societies that have not yet discovered warp drive on their own—you are forbidden from revealing your ship, your technology, or the existence of extraterrestrial life. This directive will present you with profound ethical dilemmas. You may be forced to allow a natural disaster to run its course to prevent cultural contamination, or find a clever, indirect way to assist that does not violate the spirit of the law. Your choices in these situations will define your career as a Starfleet captain.</p>
        </div>
    );
};