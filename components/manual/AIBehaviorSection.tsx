
import React from 'react';
import { SectionHeader, SubHeader } from './shared';

export const AIBehaviorSection: React.FC = () => (
    <div>
        <SectionHeader>Appendix B: AI Doctrine Analysis (Revision 1.8)</SectionHeader>
        <p className="text-red-400 font-bold tracking-widest text-sm">CLASSIFICATION: STARFLEET INTELLIGENCE - EYES ONLY</p>
        <p className="text-text-secondary my-4">This document provides a tactical overview of the current command logic ("Artificial Intelligence") governing non-player vessels in this simulation. The recent introduction of a phased turn system has allowed for a significant increase in AI tactical sophistication. Understanding these behavioral patterns is critical for predicting and countering enemy actions.</p>

        <SubHeader>Squadron Tactics &amp; Coordinated Fire</SubHeader>
        <p className="text-text-secondary mb-2">
            A significant upgrade has been deployed to the fleet combat logic core. AI vessels no longer act as individuals. Instead, allied and enemy ships now form tactical squadrons and coordinate their attacks on a single, high-priority target.
        </p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong className="text-accent-yellow">Priority Target Designation:</strong> Before any ship acts, all vessels in a communicating squadron collectively analyze all visible threats. They use a scoring algorithm to designate a single "squadron priority target."
            </li>
            <li>
                <strong className="text-accent-yellow">Target Scoring Logic:</strong> The selection algorithm prioritizes targets based on several weighted factors:
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><b className="text-white">Damage Level (Weight: 200):</b> Score increases based on the target's missing hull percentage.</li>
                    <li><b className="text-white">Vulnerability (Weight: 150):</b> A flat bonus is applied if the target's shields are depleted.</li>
                    <li><b className="text-white">Threat Level (Weight: 150 + 0.5 &times; Max Hull):</b> The player's flagship is always considered a high threat. Other targets are weighted by their potential power (proxied by max hull).</li>
                    <li><b className="text-white">Proximity (Weight: 50):</b> Score increases the closer a target is to the squadron's average position.</li>
                </ul>
            </li>
            <li>
                <strong className="text-accent-yellow">Execution &amp; Fallback:</strong> Each ship in the squadron will attempt to engage the designated priority target. If an individual ship cannot engage the priority target (due to range or line-of-sight), it will revert to its standard doctrine of engaging the closest available enemy. This ensures no ship is ever idle.
            </li>
        </ul>

        <SubHeader>Weapon-Aware Pathfinding (Federation & Romulan)</SubHeader>
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
        
        <h4 className="font-bold text-accent-yellow mt-4">Multi-Factor Scoring System</h4>
        <p className="text-text-secondary mb-2">
            In addition to weapon ranges, all AI pathfinding includes a sophisticated multi-factor scoring system. It evaluates every possible move based on multiple weighted factors:
        </p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong className="text-white">Threat Score:</strong> Measures the proximity to enemies. This score is weighted positively for an 'Aggressive' AI (drawing it closer) and negatively for a 'Defensive' AI (pushing it away). The base weight for this factor is <b className="font-mono">50</b>.
            </li>
            <li>
                <strong className="text-white">Centrality Score:</strong> A preference for moving away from edges and corners to maintain maneuverability. The weight varies by stance: <b className="font-mono">Defensive (0.5)</b>, <b className="font-mono">Balanced (0.2)</b>, <b className="font-mono">Aggressive (0.1)</b>.
            </li>
             <li>
                <strong className="text-white">Cover Score:</strong> A significant bonus is awarded for moving into cover. The base weight is <b className="font-mono">1.5</b>, with bonuses of <b className="font-mono">+10</b> for standard cover and an additional <b className="font-mono">+15</b> for deep nebula concealment.
            </li>
            <li>
                <strong className="text-white">Range Score:</strong> In a 'Balanced' stance, this score is the primary driver, weighted by <b className="font-mono">5</b>. It evaluates how close a potential move gets the ship to its calculated ideal engagement range.
            </li>
        </ul>
        <p className="text-text-secondary mt-2">
            Captains can exploit this logic by using cover as bait or by forcing an enemy towards the edge of the map, which works against their inherent positional preference.
        </p>

        <SubHeader>Lost Contact Doctrine</SubHeader>
        <p className="text-text-secondary mb-2">
            When an AI vessel loses sensor contact with its target (e.g., the target cloaks or enters a deep nebula), it will not simply remain idle. It will transition to a hunting state based on its capabilities and tactical situation.
        </p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong className="text-accent-yellow">Seeking Stance:</strong> The default behavior upon losing a target. The AI ship will cease firing and plot a course to the target's last known position in an attempt to re-acquire sensor lock.
            </li>
            <li>
                <strong className="text-accent-yellow">Prowling Stance:</strong> A tactic employed by cloaking-capable vessels. Instead of immediately seeking, the ship will first engage its cloak before proceeding to the target's last known position. This allows it to hunt for the lost target while remaining concealed itself.
            </li>
             <li>
                <strong className="text-accent-yellow">Preparing Stance:</strong> If a ship has taken damage, it may prioritize repairs before beginning its search, anticipating a potential re-engagement.
            </li>
        </ul>

        <SubHeader>Ion Storm Torpedo Firing Doctrine</SubHeader>
        <p className="text-text-secondary mb-2">
            AI captains will no longer fire torpedoes recklessly through hazardous ion storms. Before any launch is authorized, the AI performs a sophisticated risk-reward analysis.
        </p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong className="text-accent-yellow">Reward Calculation:</strong> The AI calculates the potential damage a torpedo would inflict on its target. This "Expected Reward" is then heavily discounted by the torpedo's overall probability of surviving its journey through all ion storm cells on its path.
            </li>
            <li>
                <strong className="text-accent-yellow">Cost Calculation:</strong> The AI calculates the potential for self-damage or friendly fire. It iterates through each storm cell on the torpedo's path, calculating the specific probability of a detonation in that cell. If the firing ship or an allied ship is in that cell, the potential 50% splash damage is added to the "Expected Cost".
            </li>
             <li>
                <strong className="text-accent-yellow">Factional Risk Aversion:</strong> A launch is only authorized if <code className="text-white bg-black p-1 rounded">Reward &gt; Cost &times; RiskFactor</code>.
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm font-mono">
                    <li><b className="text-red-400">Klingon Risk Factor:</b> 1.25 (Low Aversion)</li>
                    <li><b className="text-orange-400">Pirate Risk Factor:</b> 1.75</li>
                    <li><b className="text-blue-400">Federation Risk Factor:</b> 3.0</li>
                    <li><b className="text-green-400">Romulan Risk Factor:</b> 3.5 (High Aversion) - Romulans also have a hard limit and will abort any launch with over a <b className="text-white">40%</b> chance of self-detonation.</li>
                    <li><strong className="text-blue-400">Federation Allies:</strong> Extremely averse to friendly fire. The potential cost of harming an allied vessel is weighted heavily in their calculations.</li>
                    <li><strong className="text-orange-400">Pirates:</strong> Selfish and opportunistic. Their cost calculation only considers potential self-damage; they are completely indifferent to the fate of other "allied" pirate ships.</li>
                </ul>
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
                <strong className="text-accent-yellow">Derelict Ship Doctrine (Capture vs. Destroy):</strong> AI ships now treat derelict vessels not just as opportunities, but as strategic objectives to either be claimed or denied to the enemy. Their approach is now strictly dictated by factional doctrine. Note that any capture attempt requires the vessel to be adjacent to the derelict and have a security team and 5 dilithium available.
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong className="text-white">Federation &amp; Pirate Doctrine (Acquisition):</strong> These factions are fundamentally opportunistic. If a Federation or Pirate vessel is adjacent to a derelict, it will <strong className="text-white">always (100% chance)</strong> attempt to initiate a capture operation. This becomes their primary objective, overriding any other combat maneuvers for that turn. For Starfleet, this is a rescue and recovery operation; for Pirates, it is a purely profitable salvage run.</li>
                    <li><strong className="text-red-400">Klingon Doctrine (Prizes of War vs. Honorable Destruction):</strong> A Klingon captain sees a derelict as either a trophy or a dishonorable hulk. True glory is found in battle, not in scavenging. When adjacent to a derelict, a Klingon vessel has a:
                        <ul className="list-[square] list-inside ml-6 mt-1 font-mono">
                            <li><b>90% chance</b> to destroy the vessel.</li>
                            <li><b>10% chance</b> to capture the vessel as a prize of war.</li>
                        </ul>
                    </li>
                    <li><strong className="text-green-400">Romulan Doctrine (Calculated Neutralization):</strong> A Romulan commander views a derelict as a security risk and a source of intelligence to be denied to the enemy. When adjacent to a derelict, a Romulan vessel has a:
                         <ul className="list-[square] list-inside ml-6 mt-1 font-mono">
                            <li><b>95% chance</b> to destroy the vessel.</li>
                            <li><b>5% chance</b> to capture the vessel for intelligence analysis.</li>
                        </ul>
                    </li>
                    <li><strong>Independent Vessels:</strong> As non-combatants, they will <strong className="text-white">never</strong> attempt to capture or destroy derelict vessels.</li>
                </ul>
            </li>
            <li>
                <strong className="text-accent-yellow">Conservative Repair Doctrine:</strong> AI captains are aware that their **Repair Points** are a finite resource. Their damage control logic is designed for conservation.
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>AI ships will only initiate repairs on a system if it falls below a critical operational threshold:
                        <ul className="list-[square] list-inside ml-6 mt-1 font-mono">
                            <li><b>Life Support:</b> &lt; 30%</li>
                            <li><b>Hull:</b> &lt; 30%</li>
                            <li><b>Engines:</b> &lt; 55%</li>
                            <li><b>Weapons:</b> &lt; 80% (in combat only)</li>
                        </ul>
                    </li>
                    <li>To avoid wasting points, the AI will automatically cease repairs once a system reaches a state of acceptable functionality (e.g., Hull at 40%, Engines at 60%), rather than repairing it all the way to 100%.</li>
                 </ul>
            </li>
             <li>
                <strong className="text-accent-yellow">Intelligent Point-Defense Grid:</strong> Hostile vessels no longer keep their LPD systems active at all times. They will now toggle the system based on immediate threats.
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>LPD will activate if an enemy torpedo is detected on an intercept course.</li>
                    <li><strong>Stealth Factions (Romulan, Pirate):</strong> These factions prioritize evasion. If their cloaking device is available, they will attempt to cloak to evade torpedoes *instead* of activating their point-defense grid.</li>
                 </ul>
            </li>
            <li>
                <strong className="text-accent-yellow">Intelligent Subsystem Targeting:</strong> The AI no longer targets the hull exclusively. It now analyzes the player's ship and targets key weaknesses based on its factional doctrine.
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Federation (Allies):</strong> As per Starfleet tactical doctrine, allied captains follow a logical "disarm, then immobilize" protocol. They will prioritize targeting your <span className="text-white">Weapon Systems</span> to neutralize you as a threat. Once your weapons are disabled, they will shift focus to your <span className="text-white">Engine Systems</span> to prevent your escape.</li>
                    <li><strong>Klingons:</strong> Will prioritize targeting your <span className="text-white">Weapon Systems</span> to force an honorable, close-range battle. However, once a target's shields are depleted, their doctrine shifts; they will target the <span className="text-white">Hull</span> directly to secure a glorious kill.</li>
                    <li><strong>Romulans:</strong> Will prioritize targeting your <span className="text-white">Engine Systems</span>.</li>
                    <li><strong>Pirates:</strong> Prioritize targeting <span className="text-white">Engines</span> if your shields are down to prevent escape. Otherwise, they will target your <span className="text-white">Transporter Systems</span> to prevent your security teams from boarding. If the transporter is already disabled, they will target <span className="text-white">Weapon Systems</span>.</li>
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
                <strong className="text-accent-yellow">Desperation Moves:</strong> When a vessel's hull integrity drops below 30%, they have a linearly scaling chance to initiate a faction-specific "last stand" maneuver, from <b className="text-white">0% at 30% hull</b> to <b className="text-white">100% at 0% hull</b>.
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li><strong>Klingons:</strong> Will attempt to ram the player's ship.</li>
                    <li><strong>Romulans:</strong> Will attempt a risky, unstable warp jump to escape.</li>
                    <li><strong>Pirates:</strong> Will overload their reactor and self-destruct.</li>
                    <li><strong>Federation (NPCs):</strong> Will abandon ship, becoming a derelict vessel and launching escape shuttles.</li>
                 </ul>
            </li>
        </ul>
        <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
            <h4 className="font-bold text-primary-light">Tactical Scenario: The Derelict Cruiser</h4>
            <p className="text-sm text-text-secondary mt-2">
                <strong>SITUATION:</strong> A derelict Constitution-class cruiser is adrift. A Federation Defiant-class, a Klingon B'rel-class, and a Romulan Valdore-type are all adjacent to it. A Pirate Raider is two hexes away.
            </p>
            <p className="text-sm text-text-secondary mt-2">
                <strong>PREDICTED OUTCOMES:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-sm text-text-secondary">
                <li>The <strong className="text-blue-400">Federation</strong> ship, driven by its rescue/recovery doctrine, will immediately begin a capture operation, ignoring the other vessels.</li>
                <li>The <strong className="text-red-400">Klingon</strong> ship, in 9 out of 10 simulations, will target the derelict with its disruptors, viewing its destruction as an honorable necessity. In a rare 1/10 case, it might race the Federation to capture it.</li>
                <li>The <strong className="text-green-400">Romulan</strong> ship will almost certainly (19 out of 20 simulations) target the derelict with plasma torpedoes to deny the asset to all other parties.</li>
                <li>The <strong className="text-orange-400">Pirate</strong> ship, seeing the opportunity, will ignore all threats and move to get adjacent, preparing to initiate its own capture attempt on the next turn.</li>
            </ul>
            <p className="text-sm text-text-secondary mt-2">
                <strong>ANALYSIS:</strong> This scenario creates a "race against time." The Federation and Pirates must complete their capture operations before the Klingons or Romulans succeed in destroying the prize. Captains can use this predictable behavior to their advantage, either by protecting the derelict or by using it as a distraction to engage a preoccupied enemy.
            </p>
        </div>

        <SubHeader>Resource Parity & System Failures</SubHeader>
        <p className="text-text-secondary mb-2">
            All non-player vessels operate under the exact same resource constraints as the player's ship. This principle of "resource parity" ensures a fair and realistic simulation.
        </p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong className="text-white">Energy Grid:</strong> AI ships generate and consume energy based on their class, power allocation, and system damage. They possess a finite reserve power pool.
            </li>
            <li><strong className="text-white">Emergency Dilithium Use:</strong> If an AI ship's reserve power is depleted, it will automatically use its own supply of Dilithium crystals for an emergency recharge.</li>
            <li><strong className="text-white">Consequential Damage Risk:</strong> Crucially, this emergency power transfer carries the same risk for the AI as it does for the player.
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>Each dilithium crystal used introduces a <b className="text-yellow-400">25% cumulative chance</b> of a feedback surge that will damage a random subsystem.</li>
                    <li>The <b className="text-red-400">damage inflicted</b> by a surge scales with the number of crystals consumed.</li>
                </ul>
            </li>
            <li>
                <strong className="text-white">Life Support Failure:</strong> AI ships are also subject to the life support failure cascade. A ship with zero power and zero dilithium will become a derelict hulk after 2 turns.
            </li>
        </ul>

        <SubHeader>Dynamic Energy Management &amp; Stance Logic</SubHeader>
        <p className="text-text-secondary mb-2">Hostile vessels will re-allocate power based on their doctrine and the battle's state.</p>
        <h4 className="font-bold text-accent-yellow mt-4">Core Stance Triggers (Universal Logic)</h4>
        <p className="text-text-secondary mb-2">Before applying faction-specific doctrines, all AI ships share a set of universal triggers for adopting a tactical stance. Understanding these baseline responses is key to predicting enemy behavior.</p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li><strong className="text-cyan-400">Defensive:</strong> An AI will prioritize survival and adopt a Defensive stance if its hull drops below 25% or its shields drop below 15%.</li>
            <li><strong className="text-red-400">Aggressive:</strong> An AI will press the attack if it detects a clear advantage, such as the target's shields being depleted (&lt;= 5%) and its hull being below 70%. It may also become aggressive during a stalemate if both its own and its target's shields are high (&gt; 80%).</li>
            <li><strong className="text-yellow-400">Balanced:</strong> If no special conditions are met, the ship will adopt a Balanced stance, weighing offense and defense equally.</li>
             <li><strong className="text-blue-400">Recovery:</strong> An AI will only enter a Recovery stance when it perceives no immediate or potential threats. This condition is met when there are <strong>no visible hostile targets on sensors</strong> and the AI has <strong>no memory of recently vanished or cloaked contacts</strong>. If these conditions are met and the ship has taken damage (to its hull or any subsystem) or its reserve energy is below 90%, it will adopt this stance. In Recovery, it will maximize power to engines for energy regeneration and assign damage control teams to its most damaged systems. If a threat reappears, it will immediately exit this state.</li>
        </ul>
        <h4 className="font-bold text-accent-yellow mt-4">Factional Overrides & Power Allocation</h4>
        <p className="text-text-secondary mb-2">While all AIs follow the core triggers, each faction has a preferred default stance and unique power allocation profiles:</p>
        <div className="pl-6 mt-2 text-sm space-y-2">
            <p><strong>- Klingons:</strong> Default to an <span className="text-red-400">Aggressive</span> stance. (Power: 74% WPN, 13% SHD, 13% ENG)</p>
            <p><strong>- Romulans:</strong> Default to a <span className="text-yellow-400">Balanced</span> stance. (Power: 34% WPN, 33% SHD, 33% ENG)</p>
            <p><strong>- Pirates:</strong> Default to a <span className="text-yellow-400">Balanced</span> stance. They will become <span className="text-red-400">Aggressive</span> if the player's hull is below 40%, and switch to <span className="text-cyan-400">Defensive</span> if their own hull is below 60%. (Power: 50% WPN, 50% SHD, 0% ENG)</p>
            <p>
                <strong>- Independent Vessels:</strong> These are truly neutral entities. Their sole doctrine is self-preservation.
                <ul className="list-[circle] list-inside ml-4 mt-1">
                    <li>They will <strong className="text-white">always</strong> adopt a <span className="text-cyan-400">Defensive</span> stance and attempt to flee from any perceived threat.</li>
                    <li>They do not engage in combat and will not initiate hostilities.</li>
                    <li>They are non-opportunistic and will <strong className="text-white">never</strong> attempt to capture derelict vessels.</li>
                    <li><strong className="text-accent-yellow">Simulator Note:</strong> If an Independent vessel is manually assigned the 'Ally' allegiance in the Scenario Simulator, its core doctrine is overridden. It will engage 'Enemy' vessels and will not attempt to flee, effectively acting as a friendly combatant.</li>
                </ul>
            </p>
        </div>

        <SubHeader>Advanced Cloaking Doctrine (Revision 1.7)</SubHeader>
        <p className="text-text-secondary mb-2">Stealth technology is no longer a simple fire-and-forget system. It is a dynamic state requiring constant power and subject to failure under pressure. Understanding these new, more complex mechanics is essential to survival.</p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong className="text-accent-yellow">Multi-Turn Operation:</strong>
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
