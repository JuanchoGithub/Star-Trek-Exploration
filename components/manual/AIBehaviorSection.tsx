import React from 'react';
import { SectionHeader, SubHeader } from './shared';

export const AIBehaviorSection: React.FC = () => (
    <div>
        <SectionHeader>Appendix B: AI Doctrine Analysis</SectionHeader>
        <p className="text-red-400 font-bold tracking-widest text-sm">CLASSIFICATION: STARFLEET INTELLIGENCE - EYES ONLY</p>
        <p className="text-text-secondary my-4">This document provides a tactical overview of the current command logic ("Artificial Intelligence") governing non-player vessels in this simulation. Understanding these behavioral patterns is critical for predicting and countering enemy actions.</p>

        <SubHeader>Current Hostile AI Doctrine (Revision 1.2)</SubHeader>
        <p className="text-text-secondary mb-2">
            The current AI model for hostile vessels (Klingon, Romulan, Pirate) follows a standardized set of combat protocols, now including point-defense systems and dynamic power management.
        </p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
             <li>
                <strong className="text-accent-yellow">Point-Defense Grid:</strong> All hostile vessels are now equipped with LPD systems. They will automatically activate them when combat begins and use them to intercept incoming player torpedoes at close range (1 hex), prioritizing the most dangerous threats first.
            </li>
            <li>
                <strong className="text-accent-yellow">Intelligent Subsystem Targeting:</strong> The AI no longer targets the hull exclusively. It now analyzes the player's ship and targets key weaknesses based on its factional doctrine.
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Klingons:</strong> Will prioritize targeting your <span className="text-white">Weapon Systems</span>. A true warrior prefers an honorable melee, and disabling your phasers forces you to fight on their terms.</li>
                    <li><strong>Romulans:</strong> Will prioritize targeting your <span className="text-white">Engine Systems</span>. Their doctrine emphasizes control of the battlefield; a disabled ship cannot escape their cloaked ambushes or pursue them if they retreat.</li>
                    <li><strong>Pirates:</strong> Will prioritize targeting your <span className="text-white">Transporter Systems</span>. This prevents you from sending boarding parties or strike teams, protecting their vessel (and their loot) from being captured. If transporters are down, they will switch to targeting weapons.</li>
                </ul>
            </li>
            <li>
                <strong>Movement Protocol:</strong> AI vessels will attempt to close distance with the Endeavour until they are within optimal phaser range (approximately 2-3 hexes). They will then cease movement to maximize weapon accuracy. They do not currently factor in environmental hazards like asteroid fields when plotting their course.
            </li>
            <li>
                <strong>Weapon Usage:</strong> An AI ship will fire its phasers each turn if it has sufficient energy and the Endeavour is in range. It has a moderate (approx. 40%) chance to launch a torpedo if its tubes are operational and the target is in range. AI ships exhibit a high priority for self-preservation, using their phasers for point-defense to shoot down incoming player torpedoes before targeting the player's ship.
            </li>
            <li>
                <strong className="text-accent-yellow">Nebula Tactics &amp; Awareness:</strong>
                <p className="text-sm">The AI is now subject to the same nebula visibility rules as the player.</p>
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>If the player enters a "Deep Nebula" and becomes undetectable, the AI will lose its target lock. It will be unable to fire and will either hold its position or move towards your last known coordinates.</li>
                    <li>If an AI ship is inside a nebula, its sensor range is also reduced to 1 hex. It will not be able to see or target you beyond this range.</li>
                    <li>This makes nebulae an exceptionally powerful tool for breaking contact, forcing the AI to reposition, and setting up ambushes.</li>
                </ul>
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
                <strong className="text-accent-yellow">Cloaking Doctrine:</strong>
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Romulans:</strong> All Romulan vessels are equipped with advanced cloaking devices. They will remain cloaked while repositioning and typically decloak to attack once in optimal range, provided their hull integrity is not compromised.</li>
                    <li><strong>Klingons:</strong> Klingon B'rel-class Birds-of-Prey are also equipped with cloaks. They will use them to initiate surprise attacks, decloaking at close range to fire a devastating opening volley.</li>
                    <li><strong>Pirates:</strong> Very rarely (approx. 10% chance), a pirate vessel may be equipped with a stolen, dangerously unstable cloaking device. These devices are unreliable, consume vast amounts of power, and can backfire spectacularly, damaging the pirate ship or even causing it to explode.</li>
                </ul>
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
                <h4 className="font-bold text-accent-yellow">1. Advanced Tactical Maneuvering</h4>
                <p className="text-sm text-text-secondary">Instead of simple "move-to-contact" logic, future AI will use the environment to its advantage. It may attempt to keep the player at its own optimal weapon range, use asteroids for cover, or lure the player into a nebula to disrupt targeting sensors before engaging.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-accent-yellow">2. Squadron Coordination</h4>
                <p className="text-sm text-text-secondary">Enemy vessels will begin to operate as a cohesive unit. For example, in a wing of two Romulan Warbirds, one might focus on disabling the player's shields while the other launches a full torpedo spread at the now-vulnerable hull. Escorts might screen a larger capital ship from torpedoes.</p>
            </div>
             <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-accent-yellow">3. Enhanced Faction Personalities</h4>
                <p className="text-sm text-text-secondary">Faction-specific behaviors will become more pronounced during standard combat, not just during desperation moves. Klingons may be more likely to ignore damage to press an attack. Romulans will use their cloak more intelligently, possibly recloaking mid-battle to reposition. Pirates may attempt to retreat if a battle turns against them, valuing profit over honor.</p>
            </div>
        </div>
    </div>
);