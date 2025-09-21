import React from 'react';
import { SectionHeader, SubHeader } from './shared';

export const AIBehaviorSection: React.FC = () => (
    <div>
        <SectionHeader>Appendix B: AI Doctrine Analysis</SectionHeader>
        <p className="text-red-400 font-bold tracking-widest text-sm">CLASSIFICATION: STARFLEET INTELLIGENCE - EYES ONLY</p>
        <p className="text-text-secondary my-4">This document provides a tactical overview of the current command logic ("Artificial Intelligence") governing non-player vessels in this simulation. Understanding these behavioral patterns is critical for predicting and countering enemy actions.</p>

        <SubHeader>Current Hostile AI Doctrine (Revision 1.1)</SubHeader>
        <p className="text-text-secondary mb-2">
            The current AI model for hostile vessels (Klingon, Romulan, Pirate) follows a standardized set of combat protocols, but now includes dynamic power management based on the tactical situation.
        </p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong>Targeting Priority:</strong> The AI's primary target is always the U.S.S. Endeavour. It does not currently engage other third-party vessels. Its weapon fire is always directed at the ship's center-of-mass (Hull) and it will not attempt to target specific subsystems.
            </li>
            <li>
                <strong>Movement Protocol:</strong> AI vessels will attempt to close distance with the Endeavour until they are within optimal phaser range (approximately 2-3 hexes). They will then cease movement to maximize weapon accuracy. They do not currently factor in environmental hazards like asteroid fields when plotting their course.
            </li>
            <li>
                <strong>Weapon Usage:</strong> An AI ship will fire its phasers each turn if it has sufficient energy and the Endeavour is in range. It has a moderate (approx. 40%) chance to launch a torpedo if its tubes are operational and the target is in range. AI ships exhibit a high priority for self-preservation, using their phasers for point-defense to shoot down incoming player torpedoes before targeting the player's ship.
            </li>
            <li>
                <strong className="text-accent-yellow">Dynamic Energy Management:</strong> Hostile vessels will now re-allocate power based on their factional doctrine and the current state of the battle. They will adopt one of three stances:
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Aggressive (70% Weapons / 30% Shields):</strong> Maximizes damage output at the expense of defense.</li>
                    <li><strong>Defensive (20% Weapons / 80% Shields):</strong> Prioritizes shield regeneration to survive heavy fire.</li>
                    <li><strong>Balanced (50% Weapons / 50% Shields):</strong> A standard combat configuration.</li>
                </ul>
                <div className="pl-6 mt-2 text-sm">
                    <p><strong>- Klingons:</strong> Will remain Aggressive unless hull integrity is critical (&lt;25%), at which point they will switch to Defensive.</p>
                    <p><strong>- Romulans:</strong> Will switch to Defensive if hull drops below 50%. Will switch to Aggressive if the player's shields are down, otherwise they remain Balanced.</p>
                    <p><strong>- Pirates:</strong> Will become Defensive if hull drops below 60%. Will become Aggressive if the player's hull is below 40%, otherwise they remain Balanced.</p>
                </div>
            </li>
            <li>
                <strong>Cloaking (Romulans):</strong> Romulan vessels will remain cloaked while repositioning. They will typically decloak to attack once they are in weapon range and their hull integrity is above 40%.
            </li>
             <li>
                <strong>System Failures:</strong> The AI is subject to the same physical laws as the player. Destroyed impulse engines will halt their movement and power regeneration. A destroyed life support system will trigger a two-turn countdown before the ship becomes a derelict hulk.
            </li>
             <li>
                <strong>Desperation Moves:</strong> The only significant deviation in AI behavior between factions occurs when a vessel's hull integrity drops below 5%. At this point, they will initiate a faction-specific "last stand" maneuver.
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Klingons:</strong> Will attempt to ram the player's ship, destroying themselves in a final, glorious attack.</li>
                    <li><strong>Romulans:</strong> Will attempt a risky, unstable warp jump to escape. This has a high chance of failure, resulting in the ship's destruction.</li>
                    <li><strong>Pirates:</strong> Will overload their reactor and self-destruct, causing significant area-of-effect damage to any adjacent vessels.</li>
                    <li><strong>Federation (NPCs):</strong> Will abandon ship, becoming a derelict vessel and launching escape shuttles.</li>
                 </ul>
            </li>
        </ul>

        <SubHeader>Future AI Enhancements (Developer Notes)</SubHeader>
        <p className="text-text-secondary mb-2">
            Starfleet Command's wargaming division is actively developing more sophisticated AI logic to provide a more challenging and realistic simulation. Captains should be prepared for future encounters with vessels exhibiting some or all of the following capabilities:
        </p>
        <div className="space-y-3">
             <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-accent-yellow">1. Intelligent Subsystem Targeting</h4>
                <p className="text-sm text-text-secondary">Advanced AI will no longer target only the hull. It will analyze the player's ship and target key weaknesses. Expect Klingons to target your weapon systems to force an honorable melee. Romulans may target your engines to disable you before striking from the shadows. Pirates might target your transporter to prevent you from sending boarding parties.</p>
            </div>
             <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-accent-yellow">2. Advanced Tactical Maneuvering</h4>
                <p className="text-sm text-text-secondary">Instead of simple "move-to-contact" logic, future AI will use the environment to its advantage. It may attempt to keep the player at its own optimal weapon range, use asteroids for cover, or lure the player into a nebula to disrupt targeting sensors before engaging.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-accent-yellow">3. Squadron Coordination</h4>
                <p className="text-sm text-text-secondary">Enemy vessels will begin to operate as a cohesive unit. For example, in a wing of two Romulan Warbirds, one might focus on disabling the player's shields while the other launches a full torpedo spread at the now-vulnerable hull. Escorts might screen a larger capital ship from torpedoes.</p>
            </div>
             <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-accent-yellow">4. Enhanced Faction Personalities</h4>
                <p className="text-sm text-text-secondary">Faction-specific behaviors will become more pronounced during standard combat, not just during desperation moves. Klingons may be more likely to ignore damage to press an attack. Romulans will use their cloak more intelligently, possibly recloaking mid-battle to reposition. Pirates may attempt to retreat if a battle turns against them, valuing profit over honor.</p>
            </div>
        </div>
    </div>
);