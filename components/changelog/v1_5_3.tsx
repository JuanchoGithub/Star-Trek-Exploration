import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

export const Version1_5_3: React.FC = () => {
    const releaseDate = "September 23, 2025";
    return (
        <>
            <SectionHeader>Version 1.5.3 - Tactical View & UI Refinements</SectionHeader>
            <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49729.5, 10:00 ({releaseDate})</p>
            <p className="text-lg text-text-secondary italic mb-4">Minor but impactful adjustments to the main tactical viewscreen to improve spatial awareness and streamline user interaction, based on direct command-level feedback.</p>
            
            <SubHeader>Summary of User Directives</SubHeader>
            <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
                <blockquote className="text-text-secondary italic space-y-2">
                    <p>User issued two directives to refine the primary command interface. The first was to recalibrate the main viewscreen's aspect ratio from 12:10 to a more balanced 11:10. The second was to relocate and redesign the "Sector View" and "Quadrant Map" buttons, moving them to a vertical stack on the left of the map and stripping all thematic skinning for a cleaner, function-over-form appearance.</p>
                </blockquote>
            </div>

            <SubHeader>Summary of Implemented Changes</SubHeader>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li>
                    <strong className="text-white">Map Aspect Ratio Recalibrated to 11:10:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>The core constant for sector width was updated from 12 to 11 in `gameConstants.ts`.</li>
                        <li>This change was propagated across all relevant UI components (`App.tsx`, `SectorView.tsx`, `ScenarioSimulator.tsx`) to ensure the tactical map, grid, and containers all render correctly at the new 11:10 aspect ratio.</li>
                     </ul>
                </li>
                <li>
                    <strong className="text-white">Viewscreen Control Relocation & Redesign:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>The "Sector View" and "Quadrant Map" toggle buttons have been moved from their previous location to a new vertical stack on the left-hand side of the main viewscreen.</li>
                        <li>The buttons have been re-styled as simple, unskinned colored bars that together span the full height of the map, providing a cleaner, more integrated look that is consistent across all UI themes.</li>
                     </ul>
                </li>
            </ul>
        </>
    );
};
