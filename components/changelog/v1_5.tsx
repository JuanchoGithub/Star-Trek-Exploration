import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

export const Version1_5: React.FC = () => {
    const releaseDate = "September 23, 2025";
    return (
        <>
            <SectionHeader>Version 1.5 - The Energy & Simulation Overhaul</SectionHeader>
            <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49725.1, 11:00 ({releaseDate})</p>
            <p className="text-lg text-text-secondary italic mb-4">A fundamental redesign of ship energy management systems, a comprehensive overhaul of the Scenario Simulator, and a full update to the Player's Manual to document these extensive changes.</p>
            
            <SubHeader>Summary of User Directives</SubHeader>
            <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
                <blockquote className="text-text-secondary italic space-y-2">
                    <p>User mandated a complete revamp of the game's energy management to introduce a more granular, tactical model. This included dynamic power generation based on engine allocation and damage, passive power consumption for all individual ship components, and updated AI doctrines to utilize these new mechanics. Subsequently, a series of directives called for a major overhaul of the Scenario Simulator to include a detailed ship information panel mirroring the Battle Replayer, full combat animation support, and a more intuitive UI/UX for 'Spectate' mode. Finally, a complete documentation update was ordered for the Player's Manual to reflect all new features and mechanics.</p>
                </blockquote>
            </div>

            <SubHeader>Summary of Implemented Changes</SubHeader>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li>
                    <strong className="text-white">New Dynamic Energy Grid:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>A ship's energy generation is now determined by a baseline value (scaled by class) and amplified by power allocated to engines (from 50% at 0% allocation to 200% at 100% allocation).</li>
                        <li>Engine damage now directly reduces energy generation, making engines a critical tactical target.</li>
                        <li>Every major ship system now has a passive energy cost. Disabling or destroying a system frees up its power for other functions.</li>
                        <li>AI doctrines for all factions have been updated to a three-way Weapons/Shields/Engines power allocation system.</li>
                    </ul>
                </li>
                <li>
                    <strong className="text-white">Scenario Simulator Overhaul:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>Added a detailed, scrollable ship information panel, providing a comprehensive tactical readout of any selected vessel.</li>
                        <li>The information panel includes a full breakdown of the new energy grid, showing generation, consumption, and net power balance.</li>
                        <li>Restored all combat animations (phasers, torpedoes, explosions) to the simulator.</li>
                        <li>Redesigned 'Spectate' mode with a split-view UI for simultaneous log and ship detail viewing, and implemented intuitive click-to-deselect controls.</li>
                    </ul>
                </li>
                 <li>
                    <strong className="text-white">Main Menu Redesign:</strong> The main menu was streamlined for clarity, removing the sub-menu and adding direct-access buttons for the Manual and Changelog.
                </li>
                <li>
                    <strong className="text-white">Comprehensive Manual Update:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>Added brand-new sections detailing the features and UI of the 'Scenario Simulator' and 'Battle Replayer'.</li>
                        <li>The 'Entity Registry' was updated to include a detailed "Energy Profile" for every ship, showing baseline generation and passive consumption for each system.</li>
                         <li>All relevant mechanics sections were updated to reflect the new energy management system.</li>
                    </ul>
                </li>
            </ul>
        </>
    );
};
