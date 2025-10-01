import React from 'react';

interface PhaserAnimationPreviewProps {
    faction: 'federation' | 'klingon' | 'romulan' | 'pirate';
}

export const PhaserAnimationPreview: React.FC<PhaserAnimationPreviewProps> = ({ faction }) => {
    // Faction classes are defined in index.html and set stroke color and filter
    const factionClass = `phaser-beam ${faction}`;
    return (
        <div className="w-full h-10 bg-black rounded-sm overflow-hidden border border-border-dark flex items-center justify-between px-2 gap-2">
            <span className="text-xs capitalize text-text-secondary">{faction}</span>
            <svg width="80%" height="50%" viewBox="0 0 200 20" preserveAspectRatio="none">
                <line 
                    x1="0" 
                    y1="10" 
                    x2="200" 
                    y2="10" 
                    // We need the base phaser-beam class for structure, faction class for color, and loop class for animation
                    className={`${factionClass} phaser-beam-loop`}
                />
            </svg>
        </div>
    );
};
