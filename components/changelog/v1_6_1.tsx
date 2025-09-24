import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

export const Version1_6_1: React.FC = () => {
    const releaseDate = "September 24, 2025";
    return (
        <>
            <SectionHeader>Version 1.6.1 - Tactical Clarity Update</SectionHeader>
            <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49733.1, 10:00 ({releaseDate})</p>
            <p className="text-lg text-text-secondary italic mb-4">A quality-of-life patch addressing two critical pieces of user feedback regarding shield mechanics and the tactical display of defeated vessels.</p>
            
            <SubHeader>Summary of User Directives & Field Reports</SubHeader>
            <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
                <blockquote className="text-text-secondary italic space-y-2">
                    <p>Engineering reports a persistent malfunction in shield regeneration protocols; depleted shields were failing to recharge from zero, a critical flaw in defensive systems. Additionally, the bridge crew reported tactical confusion due to destroyed vessels not being visually distinct from active combatants. Immediate rectification was ordered to ensure system reliability and combat effectiveness.</p>
                </blockquote>
            </div>

            <SubHeader>Summary of Implemented Changes</SubHeader>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li>
                    <strong className="text-white">Bug Fix - Shield Regeneration:</strong> Corrected a logical flaw in the end-of-turn processing. A faulty condition was preventing shield regeneration from initiating if a ship's shields were at 0. This has been fixed, and shields will now correctly begin recharging from a fully depleted state, provided the ship is at Red Alert with a functional shield generator.
                </li>
                <li>
                    <strong className="text-white">New Feature - Visual State for Destroyed Ships:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li><strong>Tactical View:</strong> Ships with a hull value of 0 or less are now visually marked as destroyed. They will appear grayed-out and semi-transparent on the `SectorView`, and their health bar will be hidden to provide clear, immediate feedback on their status.</li>
                        <li><strong>Command Console:</strong> All offensive action buttons (Fire Phasers, Launch Torpedo, etc.) in the `CommandConsole` are now disabled when a destroyed ship is targeted. This prevents wasted actions and streamlines target selection during combat.</li>
                     </ul>
                </li>
            </ul>
        </>
    );
};
