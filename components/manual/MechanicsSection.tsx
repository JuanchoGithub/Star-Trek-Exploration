import React from 'react';
import { SectionHeader, SubHeader } from './shared';

export const MechanicsSection: React.FC = () => (
    <div>
        <SectionHeader>Core Mechanics</SectionHeader>
        <SubHeader>Turn Flow</SubHeader>
        <p>The game is turn-based. In each turn, you can perform one or more actions (e.g., set a navigation course, target a subsystem, fire a weapon). When you are ready, press the "End Turn" button. The game will then resolve your actions, move NPCs, and process combat for that turn.</p>
        <SubHeader>Movement & Navigation</SubHeader>
        <p className="text-text-secondary">The U.S.S. Endeavour's impulse engines have two modes of operation:</p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
            <li><strong>Cruise Speed (Green Alert):</strong> When not in combat, the ship can move up to <span className="font-bold text-accent-green">three cells</span> per turn, allowing for rapid travel across sectors.</li>
            <li><strong>Tactical Speed (Red Alert):</strong> During combat, power is diverted to weapons and shields. Movement is reduced to <span className="font-bold text-accent-red">one cell</span> per turn to maximize maneuverability.</li>
        </ul>
        <SubHeader>Energy Management</SubHeader>
        <p className="text-text-secondary">Your ship's power is a dynamic resource. Managing the balance between power generation and consumption is the key to victory.</p>
         <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li><strong>Power Generation:</strong> Your ship generates a baseline amount of energy each turn. This generation is directly affected by your <span className="text-green-400">Engine</span> power allocation and the health of your engine subsystem.
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm font-mono">
                    <li><b>0% Power Allocation:</b> <span className="text-yellow-400">0.5x</span> Base Generation</li>
                    <li><b>33% Power Allocation:</b> <span className="text-green-400">1.0x</span> Base Generation (Standard)</li>
                    <li><b>100% Power Allocation:</b> <span className="text-green-400">2.0x</span> Base Generation (Overload)</li>
                    <li>Engine <span className="text-red-400">damage</span> reduces this output proportionally. An engine at 50% health will produce only 50% of its potential energy at any allocation level.</li>
                 </ul>
            </li>
            <li><strong>Shield Regeneration:</strong> At Red Alert, your shields regenerate each turn. The base regeneration rate is a flat value of <span className="font-bold text-accent-yellow">7 points</span>, which is then modified by your power allocation to Shields and the health of your shield emitters. Because this is a flat rate, larger ships with more total shield capacity will take longer to recharge from a depleted state than smaller ships.</li>
            <li><strong>Power Consumption:</strong> Every online system on your ship consumes passive power each turn. A fully operational ship at Green Alert with 33% power to engines has a net zero energy change. Activating tactical systems adds a significant drain to your passive consumption:
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm font-mono">
                    <li><b className="text-cyan-400">Shields (Red Alert):</b> +20 Power/turn</li>
                    <li><b className="text-yellow-400">Evasive Maneuvers:</b> +10 Power/turn</li>
                    <li><b className="text-orange-400">Point-Defense:</b> +15 Power/turn</li>
                 </ul>
            </li>
            <li><strong>Reserve Power (Battery):</strong> This is your energy buffer. Any deficit between generation and consumption is drained from this pool. Any surplus energy will recharge this pool.</li>
            <li>
                <strong>Emergency Dilithium Use:</strong> If your Reserve Power is insufficient for an action or end-of-turn upkeep, the ship will automatically consume Dilithium crystals to compensate. This is a volatile process.
                <div className="p-2 bg-black/30 border-l-2 border-yellow-400 mt-2 text-sm">
                    <p><strong className="text-white">Consequential Damage (Chance):</strong> Each dilithium crystal used in a single emergency power event adds a cumulative <strong className="text-yellow-400">25% chance</strong> of causing a feedback surge that will damage a random, functioning subsystem. This risk is checked once per event. For example, if a large power deficit requires 3 crystals, there is a single check with a 75% chance (25% &times; 3) of causing damage.</p>
                    <p className="mt-2"><strong className="text-white">Consequential Damage (Scaling):</strong> In addition to the increasing chance, the <strong className="text-red-400">amount of damage</strong> dealt during a feedback surge also scales directly with the number of crystals consumed. A surge caused by 3 crystals will inflict three times as much damage to a subsystem as a surge caused by 1 crystal. This makes large energy deficits extremely dangerous to resolve with dilithium.</p>
                </div>
            </li>
            <li><strong>Tactical Trade-offs:</strong> If a system is destroyed, its power consumption is removed from the total. This creates a tactical choice: if you are low on power, you could intentionally leave a non-critical system like the transporter offline to free up energy for shields or weapons.</li>
        </ul>
         <SubHeader>Warp & Scanning</SubHeader>
        <p>From the Quadrant Map, you can travel long distances via Warp Drive. Each warp jump consumes one Dilithium crystal. You can also perform a Long-Range Scan on an adjacent quadrant to reveal basic information about it (e.g., number of hostile contacts) at the cost of Reserve Power.</p>
         <SubHeader>Repairs & Damage Control</SubHeader>
        <p className="text-text-secondary mb-4">A starship is a complex machine, and damage is an inevitable part of deep-space operations. Understanding how to manage and repair your vessel is a critical command skill.</p>
        <div className="p-3 bg-black rounded border-l-4 border-accent-yellow my-4">
            <h4 className="font-bold text-accent-yellow">New Mechanic: Repair Points</h4>
            <p className="text-sm text-text-secondary mt-2">
                All ships are now equipped with a finite pool of **Repair Points** (typically <strong className="text-white">200</strong>), representing the onboard supply of spare parts, fabrication materials, and specialized tools. This is a critical resource that must be managed carefully.
            </p>
            <ul className="list-disc list-inside ml-4 my-2 space-y-1 text-sm text-text-secondary">
                <li><strong>Cost:</strong> The cost to repair a system is proportional to the percentage of its maximum health being restored. For example, restoring 10 HP to a system with 100 max HP (10% of its health) costs 10 Repair Points.</li>
                <li><strong>Conservation:</strong> To conserve this finite resource, AI captains will not repair systems to 100% functionality. Instead, repairs will automatically cease once a system reaches an acceptable, functional threshold (e.g., 50% for Life Support, 40% for Hull). Player-directed repairs will continue as long as points are available.</li>
                <li><strong>Resupply:</strong> Repair Points can be fully restored by docking at a friendly starbase.</li>
            </ul>
        </div>
        <p>Damage can be repaired in two ways:</p>
         <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
            <li><strong>Damage Control Teams:</strong> In the Ship Status panel, you can assign your crew to slowly repair the Hull or a specific subsystem. This occurs at the end of each turn and consumes Repair Points. The amount repaired per turn is determined by your ship's `Repair Rate` (typically <strong className="text-white">5 HP</strong>).</li>
            <li><strong>Starbase:</strong> Docking with a friendly Starbase allows for a full repair of all systems and resupply of Repair Points, free of charge. You can also resupply torpedoes and dilithium here.</li>
        </ul>
        <SubHeader>Laser Point-Defense System (LPDS)</SubHeader>
        <p className="text-text-secondary">The LPDS is a specialized, short-range defensive system designed to intercept incoming torpedoes. It can be toggled in the Ship Status panel.</p>
         <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
            <li><strong>Function:</strong> When active, the LPDS grid will automatically target and attempt to destroy <span className="font-bold text-white">one</span> incoming hostile torpedo per turn. It will prioritize the most dangerous torpedo type first.</li>
            <li><strong>Effectiveness:</strong> The system's chance to successfully intercept a torpedo is equal to its current subsystem health percentage. A system at 75% health has a <strong className="text-white">75% chance to hit</strong>.</li>
            <li><strong>Range:</strong> The system is effective only at extremely close range, targeting torpedoes in adjacent cells (<strong className="text-white">1 hex</strong>).</li>
            <li><strong>Energy Cost:</strong> The LPDS adds a drain of <strong className="text-white">15 power</strong> to your passive consumption each turn it is active.</li>
            <li><strong>Tactical Trade-off:</strong> Activating the LPDS requires a significant power diversion from your main phaser arrays. While active, your phaser damage is reduced by <strong className="text-accent-red">40%</strong>, and their effective range for damage falloff calculations is penalized by one hex (e.g., a shot at 2 hexes is calculated as if it were 3).</li>
        </ul>
        <SubHeader>Environmental Hazards</SubHeader>
        <p className="text-text-secondary mb-4">The Typhon Expanse is fraught with perilous environmental conditions that can be turned into a tactical advantage or a fatal mistake. Understanding their precise effects is critical to survival.</p>
        <div className="space-y-4 my-4">
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-gray-400">Asteroid Fields</h4>
                <p className="text-sm text-text-secondary mt-1">Dense fields of rock and ice that provide cover but pose a significant risk to navigation and projectiles.</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-sm text-text-secondary space-y-1">
                    <li><strong>Phaser Accuracy:</strong> Reduces accuracy of phaser fire against targets inside the field by <strong className="text-white">30%</strong> (x0.70 multiplier).</li>
                    <li><strong>Sensor Cover:</strong> Ships inside a field are only detectable within <strong className="text-white">4 hexes</strong>, and can only be targeted by weapons from <strong className="text-white">2 hexes</strong> or less.</li>
                    <li><strong>Torpedo Collisions:</strong> Torpedoes traveling through an asteroid field cell have a <strong className="text-white">40% chance per cell</strong> of being destroyed by a collision.</li>
                    <li><strong>Navigational Hazard:</strong> Ending a turn inside an asteroid field risks taking micrometeoroid hull damage.</li>
                </ul>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-purple-400">Nebulae</h4>
                <p className="text-sm text-text-secondary mt-1">Dense clouds of gas and dust that disrupt sensors and targeting systems. Torpedoes are unaffected by nebulae.</p>
                <ul className="list-disc list-inside ml-4 mt-2 text-sm text-text-secondary space-y-1 font-mono">
                     <li><strong>Phaser Accuracy:</strong> Reduces accuracy of phaser fire against targets inside a nebula by <strong className="text-white">25%</strong> (x0.75 multiplier).</li>
                     <li><strong>Sensor Reduction:</strong> While your ship is inside a nebula cell, sensor range is reduced to adjacent cells only (<strong className="text-white">1 hex</strong>).</li>
                     <li><strong>Deep Nebula Concealment:</strong> A ship in a cell completely surrounded by 8 other nebula cells is rendered completely invisible on sensors.</li>
                </ul>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-yellow-400">Ion Storms</h4>
                <p className="text-sm text-text-secondary">If a ship ends its turn in an ion storm, a single effect from the following list (if its chance succeeds) is chosen at random and applied:</p>
                <ul className="list-disc list-inside ml-4 mt-2 font-mono text-xs text-text-secondary space-y-1">
                    <li><b>10% Chance:</b> Hull Damage (5% of max hull)</li>
                    <li><b>5% Chance:</b> Shields Offline (2 turns)</li>
                    <li><b>15% Chance:</b> Shield System Damage (10% of max health)</li>
                    <li><b>7% Chance:</b> Weapons Offline (2 turns)</li>
                    <li><b>7% Chance:</b> Reserve Power Depleted</li>
                    <li><b>23% Chance:</b> Impulse Engines Disabled (1 turn)</li>
                    <li><b>55% Chance:</b> Phaser Ionization (-70% damage for 2 turns)</li>
                </ul>
                <h5 className="font-bold text-white pt-2 text-sm">Projectile Hazard: In-Flight Detonation</h5>
                <p className="text-sm text-text-secondary">Launched torpedoes have a <strong className="text-white">20% chance per cell</strong> of prematurely detonating while traveling through an ion storm. Any ship in the detonation cell (friend or foe) suffers <strong className="text-white">50% of the torpedo's base damage</strong> as splash damage.</p>
            </div>
        </div>
        <SubHeader>Ship Systems Breakdown</SubHeader>
        <p className="text-text-secondary">The Endeavour is a complex machine. Understanding how its key systems function and degrade under fire is essential for effective command.</p>
        <div className="space-y-4 mt-4">
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-secondary-light">Shields</h4>
                <p className="text-sm text-text-secondary">The shields' percentage of repair indicates how efficiently the shield generators can convert energy into actual shielding. Damaged generators are less effective, providing weaker protection for the same amount of power.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-secondary-light">Warp Engines</h4>
                <p className="text-sm text-text-secondary">The warp engines are virtually impossible to destroy completely, but their level of damage affects the maximum possible warp speed. The maximum warp speed is approximately warp 1 plus 0.09 times percentage of repair.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-secondary-light">Impulse Engines</h4>
                <p className="text-sm text-text-secondary">Impulse engines are much simpler than warp engines; they either work or they don't. When they are at less than 50% repair, they simply stop functioning, leaving the ship dead in space.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-secondary-light">Weapon Systems</h4>
                <p className="text-sm text-text-secondary">This subsystem governs both phasers and projectile launchers. Its health percentage directly scales the damage output of your phaser arrays. Additionally, if system health drops below 34%, your torpedo launchers will be inoperable due to critical damage to the loading and targeting mechanisms.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-secondary-light">Laser Point-Defense System (LPDS)</h4>
                <p className="text-sm text-text-secondary">The LPDS is your automated defense against incoming torpedoes. Its effectiveness is directly tied to its health. At 100% health, it has a 100% chance to hit an adjacent torpedo. This chance decreases linearly with damage. A broken LPDS (0% health) cannot fire and consumes no energy.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-secondary-light">Computer</h4>
                <p className="text-sm text-text-secondary">A modern starship is highly computerized. Portions of the ship's charts can be lost if the computer is sufficiently damaged and can only be recovered by re-scanning. Automatic navigation and viewing the Quadrant Map require the computer to be 100% repaired.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-secondary-light">Life Support</h4>
                <p className="text-sm text-text-secondary">Life support is a critical system that is tied to both system health and ship power. A 2-turn countdown to total ship loss (dereliction) will begin under either of the following conditions:</p>
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm text-text-secondary">
                    <li>The Life Support subsystem's health reaches <b>0%</b>.</li>
                    <li>The ship completely runs out of both Reserve Power and backup Dilithium crystals at the end of a turn.</li>
                </ul>
                <p className="text-sm text-text-secondary mt-2">The ship can only be saved from this countdown if <b>both</b> conditions are resolved: Life Support must be repaired above 0%, and the ship must have available power. This applies to all ships in the sector, including yours.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-secondary-light">Transporter</h4>
                <p className="text-sm text-text-secondary">The transporter must be at 100% repair to be used for away missions or tactical operations.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-secondary-light">Shuttlecraft</h4>
                <p className="text-sm text-text-secondary">The shuttlecraft must be at 100% repair to be used for missions.</p>
            </div>
        </div>
    </div>
);