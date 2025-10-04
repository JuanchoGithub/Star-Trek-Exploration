import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

export const Version2_2: React.FC = () => {
    const releaseDate = "September 29, 2025";
    return (
        <>
            <SectionHeader>Version 2.2 - The "Hazard & M.A.C.O." Update</SectionHeader>
            <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49755.2, 18:00 ({releaseDate})</p>
            <p className="text-lg text-text-secondary italic mb-4">A major update focusing on environmental hazards with the complete overhaul of Ion Storms, a Meticulous Analysis and Combat Overhaul (M.A.C.O.) of the simulator's tactical information displays, and numerous AI and stability improvements based on field reports.</p>

            <SubHeader>Summary of User Directives & Field Reports</SubHeader>
            <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
                <blockquote className="text-text-secondary italic space-y-2">
                    <p>Analysis of simulation data and direct command feedback highlighted several areas for immediate improvement. Directives were issued to:</p>
                    <ul className="list-disc list-inside ml-4">
                        <li>Transform "Ion Storms" from a purely cosmetic effect into a genuine, unpredictable environmental hazard with a wide range of mechanical effects.</li>
                        <li>Completely overhaul the tactical detail panel within the Scenario Simulator to provide maximum data clarity, replacing graphical bars with precise numerical readouts and adding detailed targeting and repair-status information.</li>
                        <li>Correct a critical AI doctrine flaw where allied vessels would fail to engage hostile targets in simulations without a designated player ship.</li>
                        <li>Address a series of high-priority bugs causing simulator crashes and UI display errors.</li>
                        <li>Enhance combat logging to provide comprehensive, consolidated reports on environmental effects for all vessels.</li>
                        <li>Ensure all documentation in the Player's Manual is updated to reflect these significant changes.</li>
                    </ul>
                </blockquote>
            </div>

            <SubHeader>Summary of Implemented Changes</SubHeader>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li>
                    <strong className="text-white">New Feature: Ion Storm Hazard Overhaul:</strong>
                    <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>Ion Storms are now a dangerous environmental hazard. Each turn, every ship inside a storm is checked against 8 potential system failures. If any checks succeed, one is chosen at random and applied.</li>
                        <li>New effects include hull damage, systems going offline, power drains, and torpedo misfires.</li>
                        <li>Ion Storm visuals have been updated with a distinct greenish/yellow palette and increased density to create a more imposing tactical environment.</li>
                    </ul>
                </li>
                <li>
                    <strong className="text-white">Major Feature: Simulator M.A.C.O. (Meticulous Analysis and Combat Overhaul):</strong>
                    <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>The `SimulatorShipDetailPanel` has been completely redesigned for data clarity, replacing graphical status bars with precise numerical readouts for Hull, Shields, and other resources.</li>
                        <li>**New Subsystem Highlighting:** Subsystems are now highlighted with a <span className="text-red-500">red ring</span> if they are being targeted by an enemy, and a <span className="text-yellow-400">yellow ring</span> if they are being repaired by their own crew.</li>
                        <li>**New Targeting Intelligence:** The panel now includes "Targeted By" and "Targeting Data" sections, providing a real-time list of who is targeting the selected ship and what the selected ship is targeting, respectively.</li>
                        <li>Restored "Threat Analysis" and "Environment" sections to provide a complete tactical overview for any selected vessel.</li>
                    </ul>
                </li>
                 <li>
                    <strong className="text-white">AI Doctrine Enhancement:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>Corrected a critical flaw in AI logic. Allied vessels will now correctly engage hostile targets in simulations, even when no player ship is present. The `FederationAI` and `IndependentAI` have been significantly overhauled to support this.</li>
                    </ul>
                </li>
                <li>
                    <strong className="text-white">Enhanced Logging & UI Feedback:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>Ion Storm effects are now logged for all ships. The log message has been consolidated to show the results of all 8 probability checks and the final, randomly selected outcome in a single, detailed report.</li>
                        <li>The main `ShipStatus` panel now includes an "Environment" section, clearly indicating if the player is in an Ion Storm, Nebula, or Asteroid Field.</li>
                    </ul>
                </li>
                 <li>
                    <strong className="text-white">Critical Bug Fixes & Stability Improvements:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>Fixed multiple `Cannot read properties of undefined` errors that caused the simulator to crash when running in "Spectate" mode without a player ship.</li>
                        <li>Resolved rendering bugs where Ion Storm effects were not visible on the tactical map or in the manual's sector preview.</li>
                        <li>Corrected the `[object Object]` display bug in the simulator's detail panel.</li>
                    </ul>
                </li>
                 <li>
                    <strong className="text-white">Code Quality & Maintainability:</strong> Refactored the combat effects rendering layer to eliminate hardcoded grid constants, preventing future alignment bugs with weapon visuals.
                </li>
                <li>
                    <strong className="text-white">Documentation Update:</strong> The Player's Manual, specifically the sections on Environmental Hazards and previous changelogs, has been updated to fully reflect the new, hazardous nature of Ion Storms.</li>
            </ul>
        </>
    );
};