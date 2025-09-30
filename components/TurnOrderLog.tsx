import React from 'react';

interface TurnOrderLogProps {
    events: string[];
    onClose: () => void;
    turn: number;
}

const TurnOrderLog: React.FC<TurnOrderLogProps> = ({ events, onClose, turn }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="panel-style h-full w-full max-w-lg flex flex-col p-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-bold text-secondary-light">Execution Order: Turn {turn}</h2>
                    <button onClick={onClose} className="btn btn-tertiary">Close</button>
                </div>
                <div className="flex-grow bg-black p-2 rounded-inner overflow-y-auto">
                    <ol className="list-decimal list-inside text-sm font-mono text-text-primary space-y-1">
                        {events.map((event, index) => (
                            <li key={index}>{event}</li>
                        ))}
                        {events.length === 0 && (
                            <li className="list-none italic text-text-disabled">No significant events this turn.</li>
                        )}
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default TurnOrderLog;