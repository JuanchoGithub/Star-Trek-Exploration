import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

export const Version1_4: React.FC = () => {
    const releaseDate = "September 22, 2025";
    return (
        <>
            <SectionHeader>Version 1.4 - Battle Replayer</SectionHeader>
            <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49722.3, 14:00 ({releaseDate})</p>
            <p className="text-lg text-text-secondary italic mb-4">A comprehensive after-action review system has been added to the simulation for advanced tactical analysis.</p>
            
            <SubHeader>Summary of User Directives</SubHeader>
            <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
                <blockquote className="text-text-secondary italic">
                    <p>User requested a comprehensive 'Battle Replayer' to analyze combat encounters. Initial requests focused on basic playback, but follow-up directives expanded the scope to include fully interactive, detailed inspection of any ship's status on any given turn. This included demands for a verbose turn-by-turn combat log and a complete tactical readout showing every subsystem, resource, timer, and active modifier.</p>
                </blockquote>
            </div>

            <SubHeader>Summary of Implemented Changes</SubHeader>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li>
                    <strong className="text-white">New 'Battle Replayer' Feature:</strong> A new "Battle Replayer" is now accessible from the Game Menu after any combat encounter.
                </li>
                <li>
                    <strong className="text-white">Automatic Recording:</strong> The simulation now automatically records a complete snapshot of the sector state at the end of every turn, storing the last 100 turns of activity. This history is cleared upon warping to a new sector.
                </li>
                <li>
                    <strong className="text-white">Full Playback Controls:</strong> The replayer includes a turn slider, play/pause functionality, and step-by-step controls to review the engagement turn-by-turn.
                </li>
                <li>
                    <strong className="text-white">Interactive Tactical View:</strong> You can now click on any ship within the replayer's Sector View to select it for detailed analysis.
                </li>
                 <li>
                    <strong className="text-white">Comprehensive Status Panels:</strong> Detailed, scrollable panels provide an exhaustive, real-time breakdown of every variable for both your ship and the selected target for any specific turn. This includes hull, shields, energy, all subsystem health percentages, resources, critical timers (e.g., life support failure), and active tactical modifiers (e.g., nebula cover, stun effects).
                </li>
                <li>
                    <strong className="text-white">Expandable Log Viewer:</strong> A new "Show Full Log" button opens a large, scrollable overlay, allowing you to read the detailed event log for the selected turn while still viewing the tactical map.
                </li>
            </ul>
        </>
    );
};
