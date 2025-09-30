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
    // New props for Play-by-Play Order mode
    isPlayOrderMode?: boolean;
    isOrderPlaying?: boolean; // New prop for play/pause state
    onToggleOrderPlay?: () => void; // New handler for the play/pause button
    onTogglePlayOrder?: () => void;
    onStepOrder?: (direction: number) => void;
    onExitPlayOrder?: () => void;
    turnEventsCount?: number;
    playOrderIndex?: number;
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
    isPlayOrderMode,
    onTogglePlayOrder,
    onStepOrder,
    onExitPlayOrder,
    turnEventsCount = 0,
    playOrderIndex = -1,
    isOrderPlaying,
    onToggleOrderPlay,
}) => {
    if (isPlayOrderMode) {
        return (
            <div className="panel-style p-3">
                <div className="flex items-center gap-4">
                    <button onClick={onToggleOrderPlay} className="btn btn-primary w-24">
                        {isOrderPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button onClick={() => onStepOrder && onStepOrder(-1)} disabled={playOrderIndex < 0} className="btn btn-secondary">Prev</button>
                    <div className="flex-grow text-center">
                        <span className="font-bold text-lg whitespace-nowrap">Step: {playOrderIndex + 1} / {turnEventsCount}</span>
                    </div>
                    <button onClick={() => onStepOrder && onStepOrder(1)} disabled={playOrderIndex >= turnEventsCount - 1} className="btn btn-secondary">Next</button>
                    <button onClick={onExitPlayOrder} className="btn btn-tertiary">Exit View</button>
                </div>
            </div>
        );
    }
    
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
                {onTogglePlayOrder && (
                    <button onClick={onTogglePlayOrder} className="btn btn-tertiary">Play Order</button>
                )}
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