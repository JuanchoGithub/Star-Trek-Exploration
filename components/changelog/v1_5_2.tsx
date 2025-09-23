import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

export const Version1_5_2: React.FC = () => {
    const releaseDate = "September 23, 2025";
    return (
        <>
            <SectionHeader>Version 1.5.2 - AI Resource Management & UI Polish</SectionHeader>
            <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49728.1, 20:00 ({releaseDate})</p>
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
};