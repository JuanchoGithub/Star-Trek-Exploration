import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

export const Version1_6_2: React.FC = () => {
    const releaseDate = "September 25, 2025";
    return (
        <>
            <SectionHeader>Version 1.6.2 - Save Game Compatibility Patch</SectionHeader>
            <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49735.6, 11:00 ({releaseDate})</p>
            <p className="text-lg text-text-secondary italic mb-4">A maintenance release to ensure backward compatibility with older save game files, preventing crashes related to newly added ship subsystems.</p>
            
            <SubHeader>Summary of User Directives & Field Reports</SubHeader>
            <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
                <blockquote className="text-text-secondary italic space-y-2">
                    <p>Field reports indicated a critical runtime error occurring when loading save games from older simulation versions. The error, <code className="text-accent-red bg-black p-1 rounded">TypeError: Cannot read properties of undefined (reading 'maxHealth')</code>, was traced to the `PlayerHUD` component attempting to access ship subsystems (specifically `shuttlecraft` and `transporter`) that did not exist in the older data structure.</p>
                    <p>A high-priority directive was issued to patch the simulation to handle these legacy save files gracefully and prevent game-breaking crashes for long-term players.</p>
                </blockquote>
            </div>

            <SubHeader>Summary of Implemented Changes</SubHeader>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li>
                    <strong className="text-white">Bug Fix - Legacy Save Compatibility:</strong> The `PlayerHUD.tsx` component has been updated to perform robust checks before accessing subsystem properties.
                </li>
                <li>
                    <strong className="text-white">Defensive Coding Implementation:</strong> The `getAwayMissionButtonState` function now verifies the existence of the `shuttlecraft` and `transporter` subsystems on the player's ship object before attempting to read their `health` or `maxHealth` values. This prevents runtime errors when loading save files created prior to the introduction of these systems.
                </li>
                <li>
                    <strong className="text-white">Improved Stability:</strong> This patch ensures that all players, regardless of when their game was started, can load their progress without encountering crashes related to evolving data structures.
                </li>
            </ul>
        </>
    );
};
