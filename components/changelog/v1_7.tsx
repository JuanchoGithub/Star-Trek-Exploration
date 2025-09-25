import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

export const Version1_7: React.FC = () => {
    const releaseDate = "September 26, 2025";
    return (
        <>
            <SectionHeader>Version 1.7 - AI & Cloaking Overhaul</SectionHeader>
            <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49740.1, 09:00 ({releaseDate})</p>
            <p className="text-lg text-text-secondary italic mb-4">A significant update focused on enhancing strategic depth by overhauling AI behavior, cloaking mechanics, and derelict ship interactions.</p>
            
            <SubHeader>Summary of User Directives & Field Reports</SubHeader>
            <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
                <blockquote className="text-text-secondary italic space-y-2">
                    <p>Analysis of recent combat logs indicated a lack of tactical depth in several key areas. Cloaking was a binary state, offering no risk or trade-off. Derelict vessels were static battlefield objects rather than strategic assets. AI, while improved, lacked the ability to track threats it could not directly see or manage complex states like boarding.</p>
                    <p>A directive was issued to introduce a suite of features to address these shortcomings, focusing on risk-reward mechanics for cloaking, making derelicts a capturable objective, and enhancing the AI's situational awareness and tactical repertoire.</p>
                </blockquote>
            </div>

            <SubHeader>Summary of Implemented Changes</SubHeader>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li>
                    <strong className="text-white">Complex Cloaking Mechanics:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>Cloaking is now a multi-turn process, making ships vulnerable during the transition.</li>
                        <li>A new **Shield Recalibration** feature prevents shields from being immediately raised after decloaking, forcing a tactical cooldown.</li>
                        <li>Taking damage while engaging a cloak now adds permanent **Instability** to the device, reducing its reliability for the remainder of combat.</li>
                    </ul>
                </li>
                <li>
                    <strong className="text-white">Enhanced Boarding & Derelict Capture:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>A new multi-turn boarding process for capturing derelict ships has been implemented.</li>
                        <li>Capturing a derelict requires a resource cost (Dilithium and a Security Team) and several turns, after which the vessel is brought back online as an ally.</li>
                        <li>AI fleets will now attempt to capture derelicts if the opportunity arises.</li>
                    </ul>
                </li>
                 <li>
                    <strong className="text-white">Advanced AI Tactical Awareness:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>AI ships now track their `currentTargetId` and the `lastAttackerPosition`.</li>
                        <li>This allows the AI to respond to unseen threats (e.g., a cloaked ship firing torpedoes) by moving away from the last known point of attack.</li>
                        <li>The `SectorView` now provides visual feedback on targeting, showing lines between an attacker and its target.</li>
                    </ul>
                </li>
                <li>
                    <strong className="text-white">Energy Management Overhaul:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>The logic for using Dilithium crystals for emergency power has been refined, including a risk of consequential subsystem damage on use.</li>
                    </ul>
                </li>
                 <li>
                    <strong className="text-white">General Enhancements & Fixes:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>Captains can now properly undock from starbases, which is now a turn-ending action.</li>
                        <li>The save/load system has been refactored into a dedicated module to improve robustness and simplify future data migrations.</li>
                        <li>Minor layout adjustments have been made to the Player HUD for better readability.</li>
                    </ul>
                </li>
            </ul>
        </>
    );
};