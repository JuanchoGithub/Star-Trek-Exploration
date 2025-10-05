import React, { useState } from 'react';
import { Version2_2, Version2_1, Version2_0, Version1_7, Version1_6_2, Version1_6_1, Version1_6, Version1_5, Version1_4, Version1_3_2 } from './changelog/index';

type Version = 'v2.2' | 'v2.1' | 'v2.0' | 'v1.7' | 'v1.6.2' | 'v1.6.1' | 'v1.6' | 'v1.5' | 'v1.4' | 'v1.3';

interface ChangelogProps {
    onClose: () => void;
}

const Changelog: React.FC<ChangelogProps> = ({ onClose }) => {
    const [activeVersion, setActiveVersion] = useState<Version>('v2.2');

    const versions: { key: Version, label: string }[] = [
        { key: 'v2.2', label: 'Version 2.2' },
        { key: 'v2.1', label: 'Version 2.1' },
        { key: 'v2.0', label: 'Version 2.0' },
        { key: 'v1.7', label: 'Version 1.7' },
        { key: 'v1.6.2', label: 'Version 1.6.2' },
        { key: 'v1.6.1', label: 'Version 1.6.1' },
        { key: 'v1.6', label: 'Version 1.6.x' },
        { key: 'v1.5', label: 'Version 1.5.x' },
        { key: 'v1.4', label: 'Version 1.4.x' },
        { key: 'v1.3', label: 'Version 1.3.x' },
    ];

    const renderContent = () => {
        switch(activeVersion) {
            case 'v2.2': return <Version2_2 />;
            case 'v2.1': return <Version2_1 />;
            case 'v2.0': return <Version2_0 />;
            case 'v1.7': return <Version1_7 />;
            case 'v1.6.2': return <Version1_6_2 />;
            case 'v1.6.1': return <Version1_6_1 />;
            case 'v1.6': return <Version1_6 />;
            case 'v1.5': return <Version1_5 />;
            case 'v1.4': return <Version1_4 />;
            case 'v1.3': return <Version1_3_2 />;
            default: return null;
        }
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="panel-style h-full w-full max-w-4xl flex flex-col p-4">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h1 className="text-2xl font-bold text-primary-light">SIMULATION CHANGELOG</h1>
                    <div className="flex items-center gap-4">
                        <select
                            value={activeVersion}
                            onChange={(e) => setActiveVersion(e.target.value as Version)}
                            className="bg-bg-paper-lighter border border-border-main rounded p-2 text-text-primary"
                            aria-label="Select a version"
                        >
                            {versions.map(v => (
                                <option key={v.key} value={v.key}>{v.label}</option>
                            ))}
                        </select>
                        <button onClick={onClose} className="btn btn-tertiary">Close</button>
                    </div>
                </div>
                <main className="flex-grow panel-style p-4 flex flex-col min-h-0">
                    <div className="h-full overflow-y-auto pr-2">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Changelog;