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
            <div className="bg-gray-800 border-2 border-teal-400 p-6 rounded-md max-w-2xl w-full">
                <h2 className="text-2xl font-bold text-teal-400 mb-2">COMMUNICATION CHANNEL OPEN</h2>
                <p className="text-md mb-4 text-gray-400">Hailing: {target.name}</p>
                <div className="bg-black p-4 rounded min-h-[120px] text-lg text-gray-200 italic">
                    {hailData.loading ? (
                        <p className="animate-pulse">Establishing connection...</p>
                    ) : (
                        `"${hailData.message}"`
                    )}
                </div>
                <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-all"
                    >
                        Close Channel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HailDialog;
