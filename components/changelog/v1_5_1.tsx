import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

export const Version1_5_1: React.FC = () => {
    const releaseDate = "September 23, 2025";
    return (
        <>
            <SectionHeader>Version 1.5.1 - Critical Systems & Bug Fixes</SectionHeader>
            <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49727.4, 16:00 ({releaseDate})</p>
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
};
