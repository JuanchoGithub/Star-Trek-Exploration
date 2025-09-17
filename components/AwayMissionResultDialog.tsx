

import React from 'react';

interface AwayMissionResultDialogProps {
    result: string;
    onClose: () => void;
}

const AwayMissionResultDialog: React.FC<AwayMissionResultDialogProps> = ({ result, onClose }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-8">
            <div className="panel-style p-6 max-w-2xl w-full">
                <h2 className="text-2xl font-bold text-secondary-light mb-4">Away Mission Debrief</h2>
                <div className="bg-black p-4 rounded min-h-[100px] text-lg text-text-primary">
                    <p>{result}</p>
                </div>
                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="btn btn-primary px-8"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AwayMissionResultDialog;