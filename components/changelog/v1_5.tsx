
import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

const NewV1_5_4 = () => (
    <>
        <SubHeader>Version 1.5.4 - Tactical Viewscreen Calibration</SubHeader>
        <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49730.2, 12:00 (September 23, 2025)</p>
        <p className="text-lg text-text-secondary italic mb-4">A minor patch to correct a weapon targeting display error reported by Engineering.</p>
        
        <SubHeader>Summary of User Directives & Field Reports</SubHeader>
        <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
            <blockquote className="text-text-secondary italic space-y-2">
                <p>"...the visual line representing a phaser laser, is misaligned by one x."</p>
                <p>A report from tactical analysis indicated a consistent off-by-one error in the rendering of phaser effects, causing them to originate and terminate one cell to the left of their intended coordinates. Immediate recalibration was ordered.</p>
            </blockquote>
        </div>

        <SubHeader>Summary of Implemented Changes</SubHeader>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong className="text-white">Bug Fix - Phaser Rendering Alignment:</strong> Corrected an erroneous `SECTOR_WIDTH` constant within the `CombatFXLayer.tsx` component. The value was updated to synchronize it with the game's universal 11x10 grid, ensuring all weapon effects now render with perfect accuracy.
            </li>
        </ul>
    </>
);

const OriginalV1_5_3 = () => (
    <>
        <SubHeader>Version 1.5.3 - Tactical View & UI Refinements</SubHeader>
        <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49729.5, 10:00 (September 23, 2025)</p>
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

const OriginalV1_5_2 = () => (
    <>
        <SubHeader>Version 1.5.2 - AI Resource Management & UI Polish</SubHeader>
        <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49728.1, 20:00 (September 23, 2025)</p>
        <p className="text-lg text-text-secondary italic mb-4">Introduced intelligent, out-of-combat AI behavior for resource management and repairs. Addressed several UI layout and rendering bugs for a smoother user experience.</p>
        
        <SubHeader>Summary of User Directives & Field Reports</SubHeader>
        <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
            <blockquote className="text-text-secondary italic space-y-2">
                <p>User directive specified that AI vessels should exhibit more strategic behavior outside of direct combat. When no enemies are nearby, they should attempt to conserve power, initiate repairs on damaged systems, and generally prepare for their next engagement. If threats approach, they must immediately return to a combat-ready state.</p>
                <p>Additionally, a visual glitch was reported where the decorative, pulsating border of status panels would incorrectly scroll along with the panel's text content, breaking the UI's fixed-frame aesthetic.</p>
            </blockquote>
        </div>

        <SubHeader>Summary of Implemented Changes</SubHeader>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong className="text-white">New AI 'Recovery' Stance:</strong>
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>AI ships will now automatically enter a 'Recovery' stance when no enemies are within a 10-unit radius.</li>
                    <li>In this stance, ships divert all non-essential power to their engines to maximize energy generation and recharge their reserve batteries.</li>
                    <li>Damage control teams are automatically assigned to repair the most critically damaged system, followed by hull repairs.</li>
                    <li>The AI will immediately exit Recovery mode and re-allocate power for combat the moment an enemy vessel closes to within 10 units.</li>
                </ul>
            </li>
            <li>
                <strong className="text-white">UI Layout & Scrolling Fixes:</strong>
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>Corrected the layout of the `SimulatorShipDetailPanel`. The component was refactored to have a fixed outer frame with the panel styling and an independent, internally scrolling div for its content, preventing the border from moving.</li>
                    <li>Restructured the "Dogfight" mode sidebar in the `ScenarioSimulator`. The Player and Target status panels are now in separate containers, allowing them to scroll independently and resolving an issue where scrolling one would move both.</li>
                 </ul>
            </li>
        </ul>
    </>
);

const OriginalV1_5_1 = () => (
    <>
        <SubHeader>Version 1.5.1 - Critical Systems & Bug Fixes</SubHeader>
        <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49727.4, 16:00 (September 23, 2025)</p>
        <p className="text-lg text-text-secondary italic mb-4">A rapid-response patch addressing several critical bugs reported from the field, focusing on combat mechanics, AI resource management, and UI clarity.</p>
        
        <SubHeader>Summary of User Directives & Field Reports</SubHeader>
        <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
            <blockquote className="text-text-secondary italic space-y-2">
                <p>Field reports indicated multiple system malfunctions during combat scenarios:</p>
                <ul className="list-disc list-inside ml-4">
                    <li>The 'Unknown Contact' icon was failing to display, revealing ship identities prematurely.</li>
                    <li>Enemy vessels were observed operating indefinitely with zero reserve power and no dilithium, violating established energy mechanics.</li>
                    <li>A critical flaw in the damage model was causing ships with moderately damaged engines (e.g., 24% health) to become derelict, a state that should only result from total life support failure.</li>
                    <li>UI feedback for engine failure was unclear, causing confusion when movement commands were unavailable.</li>
                </ul>
                <p>Immediate rectification of these issues was ordered.</p>
            </blockquote>
        </div>

        <SubHeader>Summary of Implemented Changes</SubHeader>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong className="text-white">Bug Fix - Unknown Contact Icon:</strong> Corrected the rendering logic in the `SectorView` component. The system now properly checks if a ship is unscanned *before* selecting an icon, ensuring unidentified contacts display the correct sensor blip.
            </li>
            <li>
                <strong className="text-white">Bug Fix - AI Energy & Dilithium Consumption:</strong> Overhauled the end-of-turn energy management logic in `turnManager.ts` for all NPC ships. AI vessels with an energy deficit will now correctly consume one dilithium for an emergency recharge. If no dilithium is available, their power will drop to zero, and the life-support failure countdown will begin as intended.
            </li>
             <li>
                <strong className="text-white">Bug Fix - Derelict Ship Logic:</strong> Corrected a critical bug where engine damage was incorrectly linked to life support failure. The two-turn countdown to a ship becoming derelict now ONLY begins when the Life Support subsystem's health reaches 0.
            </li>
            <li>
                <strong className="text-white">New UI - System Failure Indicators:</strong> To improve tactical clarity, new visual indicators have been added to the `ShipStatus` panel:
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>A red, flashing <span className="font-mono">"OFFLINE"</span> indicator now appears next to the Impulse Engines when their health is below 50%.</li>
                    <li>A red, flashing <span className="font-mono">"FAILING (xT)"</span> timer appears next to Life Support when the two-turn derelict countdown is active.</li>
                 </ul>
            </li>
        </ul>
    </>
);

const OriginalV1_5 = () => (
    <>
        <SubHeader>Version 1.5 - The Energy & Simulation Overhaul</SubHeader>
        <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49725.1, 11:00 (September 23, 2025)</p>
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

export const Version1_5: React.FC = () => {
    return (
        <div>
            <SectionHeader>Version 1.5 Branch</SectionHeader>
            <NewV1_5_4 />
            <hr className="my-6 border-border-dark"/>
            <OriginalV1_5_3 />
            <hr className="my-6 border-border-dark"/>
            <OriginalV1_5_2 />
            <hr className="my-6 border-border-dark"/>
            <OriginalV1_5_1 />
            <hr className="my-6 border-border-dark"/>
            <OriginalV1_5 />
        </div>
    );
};
