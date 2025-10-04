import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

export const Version2_0: React.FC = () => {
    const releaseDate = "September 27, 2025";
    return (
        <>
            <SectionHeader>Version 2.0 - The "Book of Knowledge" Update</SectionHeader>
            <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49745.3, 11:00 ({releaseDate})</p>
            <p className="text-lg text-text-secondary italic mb-4">A major documentation and intelligence update, focused on aligning the Starfleet Player's Manual with the true, code-level mechanics of the simulation. This revision corrects inaccuracies and reveals previously undocumented tactical systems.</p>
            
            <SubHeader>Declassified Intelligence (Newly Documented Features)</SubHeader>
            <p className="text-text-secondary mb-4">Starfleet Intelligence has declassified the operational parameters for several key systems. The Player's Manual has been updated with the following previously-undocumented tactical information:</p>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li>
                    <strong className="text-white">Derelict Capture Protocols:</strong> The 'Advanced Tactics' section now includes a full briefing on the multi-turn process for capturing derelict vessels, detailing the required resource costs (5 Dilithium, 1 Security Team), the 4-turn repair time, and the strategic outcome (the vessel becomes an armed ally with 30% hull).
                </li>
                <li>
                    <strong className="text-white">Consequential Damage Models:</strong> The 'Core Mechanics' section on energy management now includes a critical warning regarding the risks of emergency dilithium use. Captains are now officially advised of the 25% chance of random subsystem damage *per crystal used*.
                </li>
                <li>
                    <strong className="text-white">Combat Mechanic Specifications:</strong>
                     <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                        <li>**Shield Absorption Ratios:** The 'Advanced Combat' section now specifies the previously-classified 4:1 shield absorption ratio against torpedo damage (4 shield points negate 1 point of torpedo damage).</li>
                        <li>**Phaser Accuracy Modifiers:** The manual now details the 90% base accuracy of phaser systems and lists all known modifiers, including accuracy penalties incurred when the attacker or target is performing evasive maneuvers, and the inherent inaccuracy of Klingon-manufactured disruptor cannons.</li>
                     </ul>
                </li>
                <li>
                    <strong className="text-white">Advanced AI Doctrines:</strong> The 'AI Doctrine' appendix has been updated to include analysis of AI behavior upon losing sensor lock, detailing the "Seeking" (moving to last known coordinates) and "Prowling" (seeking while cloaked) states.
                </li>
            </ul>

            <SubHeader>Manual Corrections (Alignment with Operational Code)</SubHeader>
            <p className="text-text-secondary mb-4">Several sections of the manual were found to be inconsistent with the simulation's operational reality. These discrepancies have been corrected to ensure pilot readiness.</p>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li>
                    <strong className="text-white">Saucer Separation Clarification:</strong> The 'Advanced Tactics' manual now clarifies that the saucer separation animation for certain Federation vessels is a visual representation of the "abandon ship" desperation move. The vessel becomes a derelict and launches shuttles; it does not mechanically split into two controllable entities.
                </li>
                 <li>
                    <strong className="text-white">Scimitar-class Capabilities:</strong> The tactical registry entry for the Romulan Scimitar has been updated. Contrary to initial intelligence reports, the vessel is currently unable to fire its weapons while cloaked, conforming to standard fleet-wide combat logic.
                </li>
                <li>
                    <strong className="text-white">Galaxy Generation Protocols:</strong> The 'Galaxy Generation' section now accurately describes the simulation's world-building process, clarifying that the map is divided into four static quadrants based on faction territory. As a result, certain deep-space fleet templates are not currently in operational use.
                </li>
            </ul>
        </>
    );
};