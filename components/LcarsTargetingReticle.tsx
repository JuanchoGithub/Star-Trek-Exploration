import React from 'react';

// A component to build one side of the targeting bracket ([ shape)
const Bracket: React.FC = () => {
    const verticalColors = [
        'bg-lcars-blue-light',
        'bg-lcars-blue-dark',
        'bg-lcars-gray',
        'bg-lcars-orange',
        'bg-lcars-gray',
        'bg-lcars-blue-dark',
        'bg-lcars-blue-light'
    ];

    return (
        <div className="w-full h-full relative">
            {/* The vertical bar of the bracket */}
            <div className="absolute top-0 left-0 w-1 h-full flex flex-col">
                {verticalColors.map((color, i) => (
                    <div key={i} className={`w-full flex-grow ${color}`} />
                ))}
            </div>
            {/* The top horizontal bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-lcars-blue-light" />
            {/* The bottom horizontal bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-lcars-blue-light" />
        </div>
    );
};

// An SVG-based arrow component. It is no longer absolutely positioned itself.
const Arrow: React.FC<{
    className: string;
    style?: React.CSSProperties;
}> = ({ className, style }) => (
    <svg
        className={`w-4 h-4 text-lcars-orange ${className}`}
        style={style}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const LcarsTargetingReticle: React.FC = () => {
    return (
        // Container is sized down to better fit the target icon.
        <div className="absolute -inset-2 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 relative">
                {/* Left Bracket */}
                <div className="absolute left-0 top-0 h-full w-3">
                    <Bracket />
                </div>
                {/* Right Bracket (a flipped copy of the left one) */}
                <div className="absolute right-0 top-0 h-full w-3 transform scale-x-[-1]">
                    <Bracket />
                </div>

                {/* Animated arrows moving inwards.
                    Wrapper div handles positioning and animation (translate).
                    Inner SVG handles orientation (rotate) and centering (translate).
                */}
                <div className="absolute top-0 left-1/2 animate-target-top">
                    <Arrow className="-translate-x-1/2" />
                </div>
                <div className="absolute bottom-0 left-1/2 animate-target-bottom">
                    <Arrow className="-translate-x-1/2 rotate-180" />
                </div>
                <div className="absolute top-1/2 left-0 animate-target-left">
                    <Arrow className="-translate-y-1/2 -rotate-90" />
                </div>
                <div className="absolute top-1/2 right-0 animate-target-right">
                    <Arrow className="-translate-y-1/2 rotate-90" />
                </div>
            </div>
        </div>
    );
};

export default LcarsTargetingReticle;
