import React, { useState } from 'react';
import { ThemeName } from '../hooks/useTheme';
import {
    IntroductionSection,
    UISection,
    RegistrySection,
    OfficerDossiersSection,
    TyphonExpanseSection,
    MechanicsSection,
    CombatSection,
    AdvancedTacticsSection,
    CombatSimulationSection,
    AnimationsSection,
    GalaxyGenerationSection,
    AIBehaviorSection,
    ChangelogSection,
} from './manual';

type Section = 'intro' | 'ui' | 'registry' | 'officers' | 'lore' | 'mechanics' | 'combat' | 'advanced' | 'simulations' | 'animations' | 'generation' | 'ai' | 'changelog';

interface PlayerManualProps {
    onClose: () => void;
    themeName: ThemeName;
}

const SectionLink: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`w-full text-left p-3 rounded transition-colors ${active ? 'bg-secondary-main text-secondary-text font-bold' : 'hover:bg-bg-paper-lighter'}`}>
        {children}
    </button>
);

const PlayerManual: React.FC<PlayerManualProps> = ({ onClose, themeName }) => {
    const [activeSection, setActiveSection] = useState<Section>('changelog');

    const renderContent = () => {
        switch(activeSection) {
            case 'intro': return <IntroductionSection />;
            case 'ui': return <UISection />;
            case 'registry': return <RegistrySection />;
            case 'officers': return <OfficerDossiersSection themeName={themeName} />;
            case 'lore': return <TyphonExpanseSection />;
            case 'generation': return <GalaxyGenerationSection />;
            case 'mechanics': return <MechanicsSection />;
            case 'combat': return <CombatSection />;
            case 'advanced': return <AdvancedTacticsSection themeName={themeName} />;
            case 'simulations': return <CombatSimulationSection />;
            case 'ai': return <AIBehaviorSection />;
            case 'animations': return <AnimationsSection />;
            case 'changelog': return <ChangelogSection />;
            default: return null;
        }
    }

    return (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="panel-style h-full w-full max-w-7xl flex flex-col p-4">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h1 className="text-2xl font-bold text-primary-light">STARFLEET PLAYER'S MANUAL</h1>
                    <button onClick={onClose} className="btn btn-tertiary">Close Manual</button>
                </div>
                <div className="flex-grow flex gap-4 min-h-0">
                    <nav className="w-1/5 flex-shrink-0 flex flex-col gap-1 panel-style p-2">
                         <SectionLink active={activeSection === 'changelog'} onClick={() => setActiveSection('changelog')}>Latest Changes (v1.3.2)</SectionLink>
                         <div className="w-full border-t border-border-dark my-2"></div>
                         <SectionLink active={activeSection === 'intro'} onClick={() => setActiveSection('intro')}>Introduction</SectionLink>
                         <SectionLink active={activeSection === 'ui'} onClick={() => setActiveSection('ui')}>Bridge Interface</SectionLink>
                         <SectionLink active={activeSection === 'registry'} onClick={() => setActiveSection('registry')}>Entity Registry</SectionLink>
                         <SectionLink active={activeSection === 'officers'} onClick={() => setActiveSection('officers')}>Bridge Officer Dossiers</SectionLink>
                         <SectionLink active={activeSection === 'lore'} onClick={() => setActiveSection('lore')}>Typhon Expanse Primer</SectionLink>
                         <SectionLink active={activeSection === 'generation'} onClick={() => setActiveSection('generation')}>Galaxy Generation</SectionLink>
                         <SectionLink active={activeSection === 'mechanics'} onClick={() => setActiveSection('mechanics')}>Core Mechanics</SectionLink>
                         <SectionLink active={activeSection === 'combat'} onClick={() => setActiveSection('combat')}>Advanced Combat</SectionLink>
                         <SectionLink active={activeSection === 'advanced'} onClick={() => setActiveSection('advanced')}>Advanced Tactics</SectionLink>
                         <SectionLink active={activeSection === 'simulations'} onClick={() => setActiveSection('simulations')}>Appendix: Combat Sims</SectionLink>
                         <SectionLink active={activeSection === 'ai'} onClick={() => setActiveSection('ai')}>Appendix: AI Doctrine</SectionLink>
                         <SectionLink active={activeSection === 'animations'} onClick={() => setActiveSection('animations')}>Animation Library</SectionLink>
                    </nav>
                    <main className="w-4/5 flex-grow panel-style p-4 flex flex-col min-h-0">
                        <div className="h-full overflow-y-auto pr-2">
                           {renderContent()}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PlayerManual;