import React from 'react';
import { PlayIcon, PauseIcon } from '../assets/ui/icons';

interface PlaybackControlsProps {
    currentIndex: number;
    maxIndex: number;
    isPlaying: boolean;
    isTurnResolving?: boolean;
    onTogglePlay?: () => void;
    onStep: (direction: number) => void;
    onSliderChange: (index: number) => void;
    onResumeFromHistory?: () => void;
    allowStepPastEnd?: boolean;
    label?: string;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
    currentIndex,
    maxIndex,
    isPlaying,
    isTurnResolving,
    onTogglePlay,
    onStep,
    onSliderChange,
    onResumeFromHistory,
    allowStepPastEnd = false,
    label = 'Turn',
}) => {
    return (
        <div className="panel-style p-3">
            <div className="flex items-center gap-4">
                {onTogglePlay && (
                    <button 
                        onClick={onTogglePlay} 
                        className="btn btn-primary relative h-10 w-16 p-0 flex items-center justify-center"
                        aria-label={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
                        disabled={isTurnResolving}
                    >
                        <div>
                            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                        </div>
                    </button>
                )}
                <button onClick={() => onStep(-1)} disabled={isTurnResolving || currentIndex <= 0} className="btn btn-secondary">Prev</button>
                <input 
                    type="range"
                    min="0"
                    max={maxIndex}
                    value={currentIndex}
                    onChange={e => onSliderChange(Number(e.target.value))}
                    className="flex-grow"
                    aria-label={`Simulation ${label}`}
                    disabled={isTurnResolving}
                />
                <button onClick={() => onStep(1)} disabled={isTurnResolving || (!allowStepPastEnd && currentIndex >= maxIndex)} className="btn btn-secondary">Next</button>
                <span className="font-bold text-lg whitespace-nowrap">{label}: {currentIndex + 1} / {maxIndex + 1}</span>
            </div>
            {onResumeFromHistory && (
                 <button onClick={onResumeFromHistory} className="w-full btn btn-accent yellow mt-2">
                    Take Control From This Turn
                </button>
            )}
        </div>
    );
};

export default PlaybackControls;