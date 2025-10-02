import React from 'react';
import { SectionHeader, SubHeader } from './shared';

export const AIBehaviorSection: React.FC = () => (
    <div>
        <SectionHeader>Appendix B: AI Doctrine Analysis (Revision 1.8)</SectionHeader>
        <p className="text-red-400 font-bold tracking-widest text-sm">CLASSIFICATION: STARFLEET INTELLIGENCE - EYES ONLY</p>
        <p className="text-text-secondary my-4">This document provides a tactical overview of the current command logic ("Artificial Intelligence") governing non-player vessels in this simulation. The recent introduction of a phased turn system has allowed for a significant increase in AI tactical sophistication. Understanding these behavioral patterns is critical for predicting and countering enemy actions.</p>

        <SubHeader>Weapon-Aware Pathfinding (Federation &amp; Romulan)</SubHeader>
        <p className="text-text-secondary mb-2">
            The standard 'Balanced' stance for Federation and Romulan captains has been upgraded with a dynamic engagement logic core. These AIs no longer adhere to a fixed optimal range. Instead, they perform a comparative analysis of their primary phaser system against their current target's primary phaser system at the start of their turn.
        </p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong className="text-accent-yellow">Stand-off Tactic (Out-ranging):</strong> If the AI ship possesses a longer-range phaser than its target, it will attempt to maintain a "stand-off" distance. It calculates the optimal range where its own phaser effectiveness is at least 40% while the enemy's is 20% or less. This allows them to "kite" shorter-ranged opponents.
            </li>
            <li>
                <strong className="text-accent-yellow">Closing Tactic (Out-ranged):</strong> If the AI ship is out-ranged by its target, it recognizes it cannot win a long-range duel. It will immediately attempt to close the distance to a close brawling range of 2 cells to bring its own weapons into their highest damage bracket.
            </li>
             <li>
                <strong className="text-accent-yellow">Matched Range:</strong> If both ships have phasers of equal range, the AI will seek to engage at a tactically-sound range of 3 cells, balancing its own damage output against the risk of incoming fire.
            </li>
        </ul>


        <SubHeader>Core AI Capabilities</SubHeader>
        <p className="text-text-secondary mb-2">
            All hostile and allied vessels now operate under an upgraded logic core, featuring the following enhancements:
        </p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
             <li>
                <strong className="text-accent-yellow">Shared Sensor Network (C3):</strong> Allied vessels now share sensor data. A ship will be aware of any enemy vessel that is visible to any of its allies in the sector. This allows for coordinated squadron tactics.
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Limitation - Comm Blackout:</strong> If an allied ship is positioned deep within a nebula (surrounded by two full layers of nebula cells), its communications are severed. It is cut off from the C3 network and must rely on its own limited sensor range.</li>
                </ul>
            </li>
            <li>
                <strong className="text-accent-yellow">Derelict Capture &amp; Salvage:</strong> AI ships are now opportunistic. If an AI vessel is adjacent to a derelict ship at the start of its turn, it will dispatch a boarding party to capture it. This process takes 4 turns, after which the derelict vessel will be restored to minimal functionality and will join the capturing faction's fleet.
            </li>
             <li>
                <strong className="text-accent-yellow">Intelligent Point-Defense Grid:</strong> Hostile vessels no longer keep their LPD systems active at all times. They will now toggle the system based on immediate threats.
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>LPD will activate if an enemy torpedo is detected on an intercept course.</li>
                    <li><strong>Stealth Factions (Romulan, Pirate):</strong> These factions prioritize evasion. If their cloaking device is available, they will attempt to cloak to evade torpedoes *instead* of activating their point-defense grid.</li>
                 </ul>
            </li>
            <li>
                <strong className="text-accent-yellow">Resource Management &amp; Recovery:</strong>
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Recovery Stance:</strong> If no hostile targets are nearby, an AI ship will enter a 'Recovery' stance. It will maximize power to engines to regenerate energy and will assign damage control teams to repair its most damaged systems.</li>
                    <li><strong>Dilithium Reserves:</strong> Hostile ships now carry a finite supply of Dilithium. If their reserve power is depleted, they will perform an emergency transfer, risking subsystem damage just as a player would.</li>
                    <li><strong>Life Support Failure:</strong> An AI vessel with no power and no dilithium will suffer life support failure, becoming a derelict hulk after 2 turns.</li>
                </ul>
            </li>
            <li>
                <strong className="text-accent-yellow">Intelligent Subsystem Targeting:</strong> The AI no longer targets the hull exclusively. It now analyzes the player's ship and targets key weaknesses based on its factional doctrine.
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Klingons:</strong> Will prioritize targeting your <span className="text-white">Weapon Systems</span>.</li>
                    <li><strong>Romulans:</strong> Will prioritize targeting your <span className="text-white">Engine Systems</span>.</li>
                    <li><strong>Pirates:</strong> Will prioritize targeting your <span className="text-white">Transporter Systems</span> to prevent capture.</li>
                </ul>
            </li>
            <li>
                <strong className="text-accent-yellow">Nebula Tactics &amp; Awareness:</strong>
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>If the player enters a "Deep Nebula" and becomes undetectable, the AI will lose its target lock and move towards your last known coordinates.</li>
                    <li>If an AI ship is inside a nebula, its sensor range is also reduced to 1 hex.</li>
                </ul>
            </li>
            <li>
                <strong className="text-accent-yellow">Dynamic Energy Management:</strong> Hostile vessels will re-allocate power based on their doctrine and the battle's state.
                <div className="pl-6 mt-2 text-sm">
                    <p><strong>- Klingons:</strong> Will use an <span className="text-red-400">Aggressive</span> stance (74% WPN) unless critically damaged (&lt;25% hull), then switch to <span className="text-cyan-400">Defensive</span> (60% SHD).</p>
                    <p><strong>- Romulans:</strong> Will use a <span className="text-yellow-400">Balanced</span> stance. They switch to <span className="text-red-400">Aggressive</span> (70% WPN) if the player's shields are down, and <span className="text-cyan-400">Defensive</span> (70% SHD) if their own hull is below 50%.</p>
                    <p><strong>- Pirates:</strong> Will use a <span className="text-yellow-400">Balanced</span> stance (50% WPN/50% SHD). They become <span className="text-red-400">Aggressive</span> (70% WPN) if the player's hull is below 40%, and <span className="text-cyan-400">Defensive</span> (80% SHD) if their own hull is below 60%.</p>
                </div>
            </li>
             <li>
                <strong>Desperation Moves:</strong> When a vessel's hull integrity drops below 5%, they will initiate a faction-specific "last stand" maneuver.
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Klingons:</strong> Will attempt to ram the player's ship.</li>
                    <li><strong>Romulans:</strong> Will attempt a risky, unstable warp jump to escape.</li>
                    <li><strong>Pirates:</strong> Will overload their reactor and self-destruct.</li>
                    <li><strong>Federation (NPCs):</strong> Will abandon ship, becoming a derelict vessel and launching escape shuttles.</li>
                 </ul>
            </li>
        </ul>

        <SubHeader>Advanced Cloaking Doctrine (Revision 1.7)</SubHeader>
        <p className="text-text-secondary mb-2">Stealth technology is a dynamic state requiring constant power and subject to failure under pressure.</p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong className="text-accent-yellow">Multi-Turn Operation:</strong> Cloaking is no longer instantaneous.
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Engaging:</strong> A two-turn process. On Turn 1, the sequence is initiated, consuming the ship's major action. The ship is vulnerable in a 'cloaking' state. The cloak becomes active at the end of Turn 2.</li>
                    <li><strong>Disengaging:</strong> A three-turn process. The ship enters a 'decloaking' state and remains vulnerable for two full turns. It becomes fully visible and can act normally at the start of Turn 3.</li>
                 </ul>
            </li>
            <li>
                <strong className="text-accent-yellow">Reliability &amp; Failure:</strong>
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>At the end of every turn a cloak is active or engaging, it must pass a reliability check and consume reserve power.</li>
                    <li><strong>Instability:</strong> Taking damage while engaging the cloak will increase the device's 'instability', permanently reducing its base reliability for the rest of combat.</li>
                    <li><strong>Environmental Effects:</strong> Reliability is significantly reduced in nebulae (-25%) and asteroid fields (-10%).</li>
                    <li><strong>Failure Cascade:</strong> If the reliability check fails or there is insufficient power, the cloak collapses, making the ship visible and putting the device on a 2-turn cooldown. Critically, this also shorts out the shield emitters, preventing shield reactivation for 2 turns.</li>
                 </ul>
            </li>
             <li>
                <strong className="text-accent-yellow">Special Case - Pirate Makeshift Cloak:</strong> Pirate cloaks are highly volatile. Each turn they are active, they have a chance to backfire, dealing significant damage to a random subsystem, or even cause the ship to self-destruct catastrophically.
            </li>
        </ul>
    </div>
);
