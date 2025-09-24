
import React from 'react';
import { SectionHeader, SubHeader } from './shared';

export const AIBehaviorSection: React.FC = () => (
    <div>
        <SectionHeader>Appendix B: AI Doctrine Analysis</SectionHeader>
        <p className="text-red-400 font-bold tracking-widest text-sm">CLASSIFICATION: STARFLEET INTELLIGENCE - EYES ONLY</p>
        <p className="text-text-secondary my-4">This document provides a tactical overview of the current command logic ("Artificial Intelligence") governing non-player vessels in this simulation. Understanding these behavioral patterns is critical for predicting and countering enemy actions.</p>

        <SubHeader>Current Hostile AI Doctrine (Revision 1.3)</SubHeader>
        <p className="text-text-secondary mb-2">
            The current AI model for hostile vessels (Klingon, Romulan, Pirate) has been significantly upgraded with improved resource management and tactical flexibility.
        </p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
             <li>
                <strong className="text-accent-yellow">Shared Sensor Network (C3):</strong> Allied vessels now share sensor data. A ship will be aware of any enemy vessel that is visible to any of its allies in the sector, provided that ally is not in a communication blackout (e.g., inside a dense nebula). This allows for coordinated squadron tactics, such as one ship acting as a forward scout while another provides fire support from a distance. A ship that is cut off from communications will only be able to engage targets it can see with its own sensors.
            </li>
             <li>
                <strong className="text-accent-yellow">Intelligent Point-Defense Grid:</strong> Hostile vessels no longer keep their LPD systems active at all times. They will now toggle the system based on the immediate threat level. LPD will activate if:
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>An enemy torpedo is detected on an intercept course.</li>
                    <li>The vessel adopts a 'Defensive' power stance.</li>
                    <li>They are facing a known torpedo-heavy vessel like a Sovereign-class.</li>
                 </ul>
                 <p className="text-sm">They will deactivate the system to conserve power if no immediate threats are present and their energy reserves are below 50%.</p>
            </li>
            <li>
                <strong className="text-accent-yellow">Resource Management &amp; Retreat:</strong>
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Dilithium Reserves:</strong> Hostile ships now carry a small, finite supply of Dilithium. If their reserve power is depleted, they will perform an emergency transfer, restoring their energy but risking subsystem damage, just as a player would.</li>
                    <li><strong>Strategic Retreat:</strong> If a ship's reserve power is critically low AND it has no dilithium left, it will attempt a strategic withdrawal. It will set a course away from threats and, after 2 turns, warp out of the sector, removing it from the battle entirely. A wise commander may choose to let a crippled but determined enemy flee rather than risk a final, desperate confrontation.</li>
                </ul>
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
                    <li><strong>Aggressive:</strong> Maximizes damage output at the expense of defense and maneuverability.</li>
                    <li><strong>Defensive:</strong> Prioritizes shield regeneration and engine power for repositioning.</li>
                    <li><strong>Balanced:</strong> A standard combat configuration for sustained engagements.</li>
                </ul>
                <div className="pl-6 mt-2 text-sm">
                    <p><strong>- Klingons:</strong> Will use an <span className="text-red-400">Aggressive</span> stance (74% WPN, 13% SHD, 13% ENG) unless critically damaged (&lt;25% hull), then switch to <span className="text-cyan-400">Defensive</span> (20% WPN, 60% SHD, 20% ENG).</p>
                    <p><strong>- Romulans:</strong> Will use a <span className="text-yellow-400">Balanced</span> stance (34% WPN, 33% SHD, 33% ENG). They switch to <span className="text-red-400">Aggressive</span> (70% WPN, 20% SHD, 10% ENG) if the player's shields are down, and <span className="text-cyan-400">Defensive</span> (10% WPN, 70% SHD, 20% ENG) if their own hull is below 50%.</p>
                    <p><strong>- Pirates:</strong> Will use a <span className="text-yellow-400">Balanced</span> stance (34% WPN, 33% SHD, 33% ENG). They become <span className="text-red-400">Aggressive</span> (60% WPN, 20% SHD, 20% ENG) if the player's hull is below 40%, and <span className="text-cyan-400">Defensive</span> (20% WPN, 60% SHD, 20% ENG) if their own hull is below 60%.</p>
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