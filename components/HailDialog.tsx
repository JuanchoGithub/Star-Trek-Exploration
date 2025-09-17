import React from 'react';
import type { ActiveHail, Entity } from '../types';

interface HailDialogProps {
    hailData: ActiveHail;
    target: Entity;
    onClose: () => void;
}

const HailDialog: React.FC<HailDialogProps> = ({ hailData, target, onClose }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-8">
            <div className="panel-style p-6 max-w-2xl w-full" style={{borderColor: 'var(--color-accent-teal)'}}>
                <h2 className="text-2xl font-bold text-accent-teal mb-2">COMMUNICATION CHANNEL OPEN</h2>
                <p className="text-md mb-4 text-text-secondary">Hailing: {target.name}</p>
                <div className="bg-black p-4 rounded min-h-[120px] text-lg text-text-primary italic">
                    {hailData.loading ? (
                        <p className="animate-pulse">Establishing connection...</p>
                    ) : (
                        `"${hailData.message}"`
                    )}
                </div>
                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="btn btn-accent teal text-white"
                    >
                        Close Channel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HailDialog;