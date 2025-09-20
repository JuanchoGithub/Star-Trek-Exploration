import React from 'react';

const RomulanTargetingReticle: React.FC = () => {
    return (
        <div className="absolute -inset-6 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                {/* Main diamond */}
                <polygon points="50,0 100,50 50,100 0,50" className="romulan-reticle-bracket" style={{ animationDelay: '0.5s', strokeWidth: 1.5 }} />
                
                {/* Inner crosshairs */}
                <line x1="50" y1="25" x2="50" y2="75" className="romulan-reticle-bracket" />
                <line x1="25" y1="50" x2="75" y2="50" className="romulan-reticle-bracket" />
                
                {/* Outer aiming brackets */}
                <polyline points="20,10 10,20 20,30" className="romulan-reticle-bracket" />
                <polyline points="80,10 90,20 80,30" className="romulan-reticle-bracket" style={{ animationDelay: '0.2s' }}/>
                <polyline points="20,90 10,80 20,70" className="romulan-reticle-bracket" style={{ animationDelay: '0.4s' }}/>
                <polyline points="80,90 90,80 80,70" className="romulan-reticle-bracket" style={{ animationDelay: '0.6s' }}/>
            </svg>
        </div>
    );
};

export default RomulanTargetingReticle;
