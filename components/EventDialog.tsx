

import React from 'react';
import type { EventTemplate, EventTemplateOption } from '../types';

interface EventDialogProps {
    event: EventTemplate;
    onChoose: (option: EventTemplateOption) => void;
}

const EventDialog: React.FC<EventDialogProps> = ({ event, onChoose }) => {
    return (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-8">
            <div className="panel-style p-6 max-w-2xl w-full text-center" style={{borderColor: 'var(--color-accent-purple)'}}>
                <h2 className="text-3xl font-bold text-accent-purple mb-4">{event.title}</h2>
                <p className="text-lg mb-6 text-text-secondary">{event.description}</p>
                <div className="space-y-3">
                    {event.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => onChoose(option)}
                            className="w-full text-left p-4 flex items-center gap-4 btn btn-accent purple bg-opacity-40 hover:bg-opacity-60 text-white"
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