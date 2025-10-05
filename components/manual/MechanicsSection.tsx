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
            <li><strong>Hazards:</strong> Ending a turn inside an asteroid field cell risks taking damage from micrometeoroid impacts. Additionally, asteroid fields provide cover, reducing the accuracy of incoming phaser fire by 30%. They also act as sensor cover: a ship inside a field is only detectable within 4 hexes, and can only be targeted by weapons from 2 hexes or less. <strong className="text-white">Crucially, any torpedo traveling through an asteroid field cell has a 40% chance of being destroyed by a collision.</strong></li>
            <li><strong>Ion Storms:</strong> These sectors are extremely hazardous. Ending a turn inside an ion storm cell subjects the ship to a high risk of random system failures, hull damage, or power drains.</li>
        </ul>
        <SubHeader>Energy Management</SubHeader>
        <p className="text-text-secondary">Your ship's power is a dynamic resource. Managing the balance between power generation and consumption is the key to victory.</p>
         <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li><strong>Power Generation:</strong> Your ship generates a baseline amount of energy each turn. This generation is directly affected by your <span className="text-green-400">Engine</span> power allocation and the health of your engine subsystem.
                 <ul className="list-[circle] list-inside ml-6 mt-1 text-sm">
                    <li>At <span className="font-bold">33% power</span>, engines provide <span className="font-bold">100% (1x)</span> of baseline energy generation.</li>
                    <li>At <span className="font-bold">100% power</span>, engines are overloaded to provide <span className="font-bold">200% (2x)</span> energy generation.</li>
                     <li>At <span className="font-bold">0% power</span>, engines provide only <span className="font-bold">50% (0.5x)</span> energy generation.</li>
                    <li>Engine <span className="text-red-400">damage</span> reduces this output proportionally. An engine at 50% health will produce only 50% of its potential energy.</li>
                 </ul>
            </li>
            <li><strong>Shield Regeneration:</strong> At Red Alert, your shields regenerate each turn. The base regeneration rate is a flat value of <span className="font-bold text-accent-yellow">7 points</span>, which is then modified by your power allocation to Shields and the health of your shield emitters. Because this is a flat rate, larger ships with more total shield capacity (e.g., a Dreadnought) will take significantly longer to recharge from a depleted state than smaller ships (e.g., an Escort).</li>
            <li><strong>Power Consumption:</strong> Every online system on your ship consumes power each turn. This includes weapons, shields, life support, and more. A fully operational ship at Green Alert with 33% power to engines has a <span className="font-bold">net zero</span> energy change; generation perfectly matches consumption.</li>
            <li><strong>Reserve Power (Battery):</strong> This is your energy buffer. Any deficit between generation and consumption is drained from this pool. Activating systems like <span className="text-cyan-400">Shields</span> (Red Alert), <span className="text-orange-400">Point-Defense</span>, or <span className="text-yellow-400">Evasive Maneuvers</span> drastically increases consumption, causing a drain on your reserves. Any surplus energy will recharge this pool.</li>
            <li>
                <strong>Emergency Dilithium Use:</strong> If your Reserve Power is insufficient for an action or end-of-turn upkeep, the ship will automatically consume Dilithium crystals to compensate. This is a volatile process.
                <ul className="list-[circle] list-inside ml-6 mt-1 text-sm text-yellow-400">
                    <li><strong className="text-white">Consequential Damage (Chance):</strong> Each dilithium crystal used in a single emergency power event adds a cumulative 25% chance of causing a feedback surge that will damage a random, functioning subsystem. This risk is checked once per event. For example, if a large power deficit requires 3 crystals, there is a single check with a 75% chance (25% &times; 3) of causing damage.</li>
                    <li><strong className="text-white">Consequential Damage (Scaling):</strong> In addition to the increasing chance, the <strong className="text-red-400">amount of damage</strong> dealt during a feedback surge also scales directly with the number of crystals consumed. A surge caused by 3 crystals will inflict three times as much damage to a subsystem as a surge caused by 1 crystal. This makes large energy deficits extremely dangerous to resolve with dilithium.</li>
                </ul>
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
                All ships are now equipped with a finite pool of **Repair Points**, representing the onboard supply of spare parts, fabrication materials, and specialized tools. This is a critical resource that must be managed carefully.
            </p>
            <ul className="list-disc list-inside ml-4 my-2 space-y-1 text-sm text-text-secondary">
                <li><strong>Capacity:</strong> Most starships begin with a standard capacity of 200 Repair Points.</li>
                <li><strong>Cost:</strong> Repairing 1% of a system's maximum health costs exactly 1 Repair Point. This means repairing a heavily armored component (like the hull) costs significantly more than a lighter component (like the transporter).</li>
                <li><strong>Conservation:</strong> To conserve this finite resource, captains will not repair systems to 100% functionality. Instead, repairs will automatically cease once a system reaches an acceptable, functional threshold (e.g., 50% for Life Support, 40% for Hull).</li>
                <li><strong>Resupply:</strong> Repair Points can be fully restored by docking at a friendly starbase.</li>
            </ul>
        </div>
        <p>Damage can be repaired in two ways:</p>
         <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
            <li><strong>Damage Control Teams:</strong> In the Ship Status panel, you can assign your crew to slowly repair the Hull or a specific subsystem. This is a slow process that occurs at the end of each turn and consumes Repair Points. The amount repaired per turn is determined by your ship's `Repair Rate`.</li>
            <li><strong>Starbase:</strong> Docking with a friendly Starbase allows for a full repair of all systems and resupply of Repair Points, free of charge. You can also resupply torpedoes and dilithium here.</li>
        </ul>
        <SubHeader>Laser Point-Defense System (LPDS)</SubHeader>
        <p className="text-text-secondary">The LPDS is a specialized, short-range defensive system designed to intercept incoming torpedoes. It can be toggled in the Ship Status panel.</p>
         <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
            <li><strong>Function:</strong> When active, the LPDS grid will automatically target and attempt to destroy <span className="font-bold text-white">one</span> incoming hostile torpedo per turn. It will prioritize the most dangerous torpedo type first.</li>
            <li><strong>Effectiveness:</strong> The system's chance to successfully intercept a torpedo is equal to its current subsystem health percentage. A system at 75% health has a 75% chance to hit.</li>
            <li><strong>Range:</strong> The system is effective only at extremely close range, targeting torpedoes in adjacent cells (<span className="font-bold text-white">1 hex</span>).</li>
            <li><strong>Energy Cost:</strong> The LPDS adds a significant drain to your passive power consumption each turn it is active.</li>
            <li><strong>Tactical Trade-off:</strong> Activating the LPDS requires a significant power diversion from your main phaser arrays. While active, your phaser damage is reduced by <span className="font-bold text-accent-red">40%</span>, and their effective range for damage falloff calculations is increased by one hex (e.g., a shot at 2 hexes is calculated as if it were 3).</li>
        </ul>
        <SubHeader>Nebulae</SubHeader>
        <p className="text-text-secondary">
            Nebulae are no longer just visual obstructions; they are tactical environments composed of individual cells of gas and dust. Being inside any nebula cell has immediate effects on combat and sensors.
        </p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
            <li><strong>Phaser Inaccuracy:</strong> Firing phasers at any target <span className="text-white font-bold">inside a nebula cell</span> will reduce your accuracy. The gravimetric distortions and particle density make it difficult to maintain a coherent energy beam over distance. Torpedoes, being self-propelled projectiles, are unaffected by this accuracy penalty.</li>
            <li><strong>Sensor Reduction:</strong> While your ship is inside a nebula cell, your own sensor resolution is drastically reduced. You will only be able to detect hostile ships in adjacent cells. Be warned: this means you can be ambushed as easily as you can set an ambush.</li>
        </ul>
        <SubHeader>Ion Storms</SubHeader>
        <p className="text-text-secondary">
            Unlike nebulae, which offer tactical cover, ion storms are purely hazardous environments. At the end of each turn, any ship within an ion storm cell is subjected to a series of checks against various system failures. If one or more checks succeed, a single, random effect is applied to the ship.
        </p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
            <li>Key risks include spontaneous hull damage, systems being knocked offline for several turns (weapons, shields, engines), complete depletion of reserve power, and even torpedo misfires causing internal damage.</li>
            <li>Full details on all potential effects and their probabilities are available in the <span className="font-bold">Typhon Expanse Primer</span> section of this manual.</li>
        </ul>
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