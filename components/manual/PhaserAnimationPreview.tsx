import React from 'react';

interface PhaserAnimationPreviewProps {
    faction: 'federation' | 'klingon' | 'romulan' | 'pirate';
    thickness?: number;
    animationType?: 'beam' | 'pulse';
}

export const PhaserAnimationPreview: React.FC<PhaserAnimationPreviewProps> = ({ faction, thickness = 4, animationType = 'beam' }) => {
    
    const factionClass = `pulse-phaser-bolt ${faction}`;
    const beamFactionClass = `phaser-beam ${faction}`;
    
    return (
        <div className="w-full h-10 bg-black rounded-sm overflow-hidden border border-border-dark flex items-center justify-between px-2 gap-2">
            <span className="text-xs capitalize text-text-secondary">{faction}</span>
            {animationType === 'pulse' ? (
                <div className="relative w-[80%] h-full flex items-center">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className={`${factionClass} pulse-phaser-bolt-loop`}
                            style={{ animationDelay: `${i * 0.4}s` }}
                        />
                    ))}
                </div>
            ) : (
                <svg width="80%" height="50%" viewBox="0 0 200 20" preserveAspectRatio="none">
                    <line 
                        x1="0" 
                        y1="10" 
                        x2="200" 
                        y2="10" 
                        className={`${beamFactionClass} phaser-beam-loop`}
                        strokeWidth={thickness}
                    />
                </svg>
            )}
        </div>
    );
};