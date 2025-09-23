import React, { useState } from 'react';
// FIX: Corrected import path to be more explicit ('./changelog/index') to resolve a module resolution ambiguity between the 'changelog' directory and the 'Changelog.tsx' file.
import { Version1_5_1, Version1_5, Version1_4_1, Version1_4, Version1_3_2 } from './changelog/index';

type Version = 'v1.5.1' | 'v1.5' | 'v1.4.1' | 'v1.4' | 'v1.3.2';

interface ChangelogProps {
    onClose: () => void;
}

const VersionLink: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`w-full text-left p-3 rounded transition-colors ${active ? 'bg-secondary-main text-secondary-text font-bold' : 'hover:bg-bg-paper-lighter'}`}>
        {children}
    </button>
);

const Changelog: React.FC<ChangelogProps> = ({ onClose }) => {
    const [activeVersion, setActiveVersion] = useState<Version>('v1.5.1');

    const renderContent = () => {
        switch(activeVersion) {
            case 'v1.5.1': return <Version1_5_1 />;
            case 'v1.5': return <Version1_5 />;
            case 'v1.4.1': return <Version1_4_1 />;
            case 'v1.4': return <Version1_4 />;
            case 'v1.3.2': return <Version1_3_2 />;
            default: return null;
        }
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="panel-style h-full w-full max-w-4xl flex flex-col p-4">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h1 className="text-2xl font-bold text-primary-light">SIMULATION CHANGELOG</h1>
                    <button onClick={onClose} className="btn btn-tertiary">Close</button>
                </div>
                <main className="flex-grow flex gap-4 min-h-0">
                    <nav className="w-1/4 flex-shrink-0 flex flex-col gap-1 panel-style p-2">
                         <VersionLink active={activeVersion === 'v1.5.1'} onClick={() => setActiveVersion('v1.5.1')}>
                            Version 1.5.1
                        </VersionLink>
                        <VersionLink active={activeVersion === 'v1.5'} onClick={() => setActiveVersion('v1.5')}>
                            Version 1.5
                        </VersionLink>
                        <VersionLink active={activeVersion === 'v1.4.1'} onClick={() => setActiveVersion('v1.4.1')}>
                            Version 1.4.1
                        </VersionLink>
                        <VersionLink active={activeVersion === 'v1.4'} onClick={() => setActiveVersion('v1.4')}>
                            Version 1.4
                        </VersionLink>
                        <VersionLink active={activeVersion === 'v1.3.2'} onClick={() => setActiveVersion('v1.3.2')}>
                            Version 1.3.2
                        </VersionLink>
                    </nav>
                    <div className="w-3/4 flex-grow panel-style p-4 flex flex-col min-h-0">
                        <div className="h-full overflow-y-auto pr-2">
                           {renderContent()}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Changelog;