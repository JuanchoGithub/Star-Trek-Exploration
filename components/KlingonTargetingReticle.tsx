import React from 'react';

const KlingonTargetingReticle: React.FC = () => {
    return (
        <div className="absolute -inset-4 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                {/* Top Bracket */}
                <path
                    className="klingon-reticle-bracket"
                    d="M 30 20 L 50 5 L 70 20"
                />
                {/* Right Bracket */}
                <path
                    className="klingon-reticle-bracket"
                    d="M 80 30 L 95 50 L 80 70"
                    style={{ animationDelay: '0.1s' }}
                />
                {/* Bottom Bracket */}
                <path
                    className="klingon-reticle-bracket"
                    d="M 70 80 L 50 95 L 30 80"
                    style={{ animationDelay: '0.2s' }}
                />
                {/* Left Bracket */}
                <path
                    className="klingon-reticle-bracket"
                    d="M 20 70 L 5 50 L 20 30"
                    style={{ animationDelay: '0.3s' }}
                />
            </svg>
        </div>
    );
};

export default KlingonTargetingReticle;
