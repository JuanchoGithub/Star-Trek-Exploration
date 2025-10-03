import React from 'react';

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
}) => {
    return (
        <div className="panel-style p-3">
            <div className="flex items-center gap-4">
                {onTogglePlay && (
                     <button onClick={onTogglePlay} className="btn btn-primary w-24">{isPlaying ? 'Pause' : 'Play'}</button>
                )}
                <button onClick={() => onStep(-1)} disabled={currentIndex <= 0} className="btn btn-secondary">Prev</button>
                <input 
                    type="range"
                    min="0"
                    max={maxIndex}
                    value={currentIndex}
                    onChange={e => onSliderChange(Number(e.target.value))}
                    className="flex-grow"
                />
                <button onClick={() => onStep(1)} disabled={isTurnResolving || (!allowStepPastEnd && currentIndex >= maxIndex)} className="btn btn-secondary">Next</button>
                <span className="font-bold text-lg whitespace-nowrap">Turn: {currentIndex + 1} / {maxIndex + 1}</span>
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