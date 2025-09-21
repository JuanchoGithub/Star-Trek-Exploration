import React from 'react';
import type { AwayMissionResult, ResourceType } from '../types';

// Helper to format resource names
const formatResourceName = (resource: ResourceType): string => {
    // FIX: Added missing resource types to satisfy the Record<ResourceType, string> type.
    const names: Record<ResourceType, string> = {
        hull: 'Hull Integrity',
        shields: 'Shield Systems',
        energy: 'Reserve Power',
        dilithium: 'Dilithium',
        torpedoes: 'Torpedoes',
        morale: 'Crew Morale',
        weapons: 'Weapon Systems',
        engines: 'Engine Systems',
        transporter: 'Transporter Systems',
        security_teams: 'Security Teams',
        scanners: 'Scanner Systems',
        computer: 'Computer Core',
        lifeSupport: 'Life Support',
        shuttlecraft: 'Shuttlebay',
    };
    return names[resource] || resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const SuccessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const FailureIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface AwayMissionResultDialogProps {
    result: AwayMissionResult;
    onClose: () => void;
}

const AwayMissionResultDialog: React.FC<AwayMissionResultDialogProps> = ({ result, onClose }) => {
    const isSuccess = result.status === 'success';
    const borderColor = isSuccess ? 'var(--color-accent-green)' : 'var(--color-accent-red)';
    const headerColor = isSuccess ? 'text-accent-green' : 'text-accent-red';

    const gains = result.changes.filter(c => c.amount > 0);
    const losses = result.changes.filter(c => c.amount < 0);

    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-8">
            <div className="panel-style p-6 max-w-2xl w-full" style={{ borderColor }}>
                <div className={`flex items-center justify-center gap-3 ${headerColor}`}>
                    {isSuccess ? <SuccessIcon /> : <FailureIcon />}
                    <h2 className="text-3xl font-bold uppercase tracking-widest">
                        Mission {isSuccess ? 'Success' : 'Failure'}
                    </h2>
                </div>
                
                <div className="bg-black p-4 rounded min-h-[100px] text-lg text-text-primary my-6 text-center">
                    <p className="italic">"{result.log}"</p>
                </div>

                {(gains.length > 0 || losses.length > 0) && (
                    <>
                        <h3 className="text-center text-lg font-bold text-secondary-light mb-3">Mission Debriefing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-bg-paper-lighter p-3 rounded">
                                <h4 className="font-bold text-accent-green mb-2 text-center border-b border-border-dark pb-1">Resources Gained</h4>
                                <ul className="list-none space-y-1">
                                    {gains.map((change, i) => (
                                        <li key={i} className="flex justify-between items-center text-sm px-1">
                                            <span className="text-text-secondary">{formatResourceName(change.resource)}</span>
                                            <span className="font-bold text-accent-green">+{change.amount}</span>
                                        </li>
                                    ))}
                                    {gains.length === 0 && <li className="text-text-disabled italic text-center pt-2">None</li>}
                                </ul>
                            </div>
                            <div className="bg-bg-paper-lighter p-3 rounded">
                                <h4 className="font-bold text-accent-red mb-2 text-center border-b border-border-dark pb-1">Losses / Damage</h4>
                                <ul className="list-none space-y-1">
                                    {losses.map((change, i) => (
                                        <li key={i} className="flex justify-between items-center text-sm px-1">
                                            <span className="text-text-secondary">{formatResourceName(change.resource)}</span>
                                            <span className="font-bold text-accent-red">{change.amount}</span>
                                        </li>
                                    ))}
                                    {losses.length === 0 && <li className="text-text-disabled italic text-center pt-2">None</li>}
                                </ul>
                            </div>
                        </div>
                    </>
                )}

                <div className="mt-8 text-center">
                    <button
                        onClick={onClose}
                        className="btn btn-primary px-8"
                    >
                        Return to Bridge
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AwayMissionResultDialog;