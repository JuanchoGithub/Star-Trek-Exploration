
import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

const OriginalV1_4_1 = () => (
    <>
        <SubHeader>Version 1.4.1 - Simulation Updates</SubHeader>
        <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49722.8, 18:00 (September 22, 2025)</p>
        <p className="text-lg text-text-secondary italic mb-4">A comprehensive overhaul of the Scenario Simulator, implementing numerous user-requested features for improved functionality, consistency, and tactical clarity.</p>
        
        <SubHeader>Summary of User Directives & Field Reports</SubHeader>
        <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
            <blockquote className="text-text-secondary italic space-y-2">
                <p>User requested a massive overhaul of the Scenario Simulator to bring it up to par with the main game's quality and functionality. Key directives included:</p>
                <ul className="list-disc list-inside ml-4">
                    <li><strong>Visual Consistency:</strong> The setup screen's tactical map needed to be a live, persistent preview of the actual battle map, not just a placeholder.</li>
                    <li><strong>Predictable Generation:</strong> Sector generation needed to be controlled by a persistent seed, with a "Refresh" button to allow cycling through layouts.</li>
                    <li><strong>Clearer Tactical Readout:</strong> Ship icons needed to be colored by their assigned allegiance (Player, Enemy, etc.) for at-a-glance clarity, rather than by their faction.</li>
                    <li><strong>Functional AI:</strong> AI needed to be "fixed" to respect allegiance over hard-coded faction behavior, allowing for scenarios like Federation vs. Federation battles.</li>
                    <li><strong>UI/UX Overhaul:</strong> The cumbersome sector dropdown was to be replaced with a rich modal window. The dogfight UI needed to be enhanced with the player's full `ShipStatus` panel.</li>
                    <li><strong>Critical Bug Fixes:</strong> A persistent, frustrating bug preventing the combat log from scrolling needed to be definitively resolved. Additionally, targeting and layout responsiveness issues were to be corrected.</li>
                </ul>
            </blockquote>
        </div>

        <SubHeader>Summary of Implemented Changes</SubHeader>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong className="text-white">New Simulator Setup Flow:</strong> The setup screen now generates a full, seed-based preview of the selected sector. This exact sector state, including its seed and entity placement, is now preserved and used when the simulation begins. A "Refresh" button has been added to generate new map layouts on demand.
            </li>
            <li>
                <strong className="text-white">Allegiance-Based Systems:</strong> The `SectorView` now colors ships based on their simulator allegiance. The core AI logic for the Federation faction was overhauled to engage in combat if assigned as an 'enemy', enabling more flexible scenarios. The player's `CommandConsole` was also updated to allow targeting based on allegiance, not just faction.
            </li>
             <li>
                <strong className="text-white">Comprehensive UI/UX Overhaul:</strong>
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>The sector dropdown was replaced with a full-screen modal displaying previews and detailed descriptions of each sector template.</li>
                    <li>The simulator layout is now fully responsive, correctly scaling the map and stacking UI elements on smaller screens.</li>
                    <li>In "Dogfight" mode, the player now has access to the full `ShipStatus` panel in a new sidebar for complete control.</li>
                    <li>The combat log in both Dogfight and Spectator modes was moved into a modal/panel with a definitive fix for the long-standing scrolling issue, using a robust flexbox layout to correctly constrain its height.</li>
                 </ul>
            </li>
            <li>
                <strong className="text-white">Core Logic Refactoring:</strong> The `useScenarioLogic` hook was refactored to support the new seed-based, persistent sector generation, improving the simulator's stability and predictability.
            </li>
        </ul>
    </>
);

const OriginalV1_4 = () => (
    <>
        <SubHeader>Version 1.4 - Battle Replayer</SubHeader>
        <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49722.3, 14:00 (September 22, 2025)</p>
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

export const Version1_4: React.FC = () => {
    return (
        <div>
            <SectionHeader>Version 1.4 Branch</SectionHeader>
            <OriginalV1_4_1 />
            <hr className="my-6 border-border-dark"/>
            <OriginalV1_4 />
        </div>
    );
};
