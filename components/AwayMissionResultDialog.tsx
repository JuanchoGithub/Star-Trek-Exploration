
import React from 'react';

interface AwayMissionResultDialogProps {
    result: string;
    onClose: () => void;
}

const AwayMissionResultDialog: React.FC<AwayMissionResultDialogProps> = ({ result, onClose }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-8">
            <div className="bg-gray-800 border-2 border-blue-400 p-6 rounded-md max-w-2xl w-full">
                <h2 className="text-2xl font-bold text-blue-400 mb-4">Away Mission Debrief</h2>
                <div className="bg-black p-4 rounded min-h-[100px] text-lg text-gray-200">
                    <p>{result}</p>
                </div>
                <div className="mt-6 text-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AwayMissionResultDialog;