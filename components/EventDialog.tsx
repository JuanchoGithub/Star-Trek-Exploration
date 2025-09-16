
import React from 'react';
import type { EventTemplate, EventTemplateOption } from '../types';

interface EventDialogProps {
    event: EventTemplate;
    onChoose: (option: EventTemplateOption) => void;
}

const EventDialog: React.FC<EventDialogProps> = ({ event, onChoose }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-8">
            <div className="bg-gray-800 border-2 border-purple-400 p-6 rounded-md max-w-2xl w-full text-center">
                <h2 className="text-3xl font-bold text-purple-400 mb-4">{event.title}</h2>
                <p className="text-lg mb-6 text-gray-300">{event.description}</p>
                <div className="space-y-3">
                    {event.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => onChoose(option)}
                            className="w-full text-left p-4 font-bold rounded transition-all flex items-center gap-4 bg-purple-700 hover:bg-purple-600 text-white"
                        >
                           {option.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EventDialog;
