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
            <li><strong>Hazards:</strong> Ending a turn inside an asteroid field cell risks taking damage from micrometeoroid impacts. Additionally, asteroid fields provide cover, reducing the accuracy of incoming phaser fire by 30%. However, they are a danger to projectiles; any torpedo traveling through an asteroid field cell has a 40% chance of being destroyed by a collision. Furthermore, asteroid fields act as sensor cover. A ship inside a field is only detectable within 4 hexes, and can only be targeted by weapons from 2 hexes or less.</li>
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
            <li><strong>Shield Regeneration:</strong> At Red Alert, your shields regenerate each turn. The base regeneration rate is a standard <span className="font-bold text-accent-yellow">7 points</span>, which is then modified by your power allocation to Shields and the health of your shield emitters. This means smaller ships with less shield capacity will recharge fully much faster than large dreadnoughts.</li>
            <li><strong>Power Consumption:</strong> Every online system on your ship consumes power each turn. This includes weapons, shields, life support, and more. A fully operational ship at Green Alert with 33% power to engines has a <span className="font-bold">net zero</span> energy change; generation perfectly matches consumption.</li>
            <li><strong>Reserve Power (Battery):</strong> This is your energy buffer. Any deficit between generation and consumption is drained from this pool. Activating systems like <span className="text-cyan-400">Shields</span> (Red Alert), <span className="text-orange-400">Point-Defense</span>, or <span className="text-yellow-400">Evasive Maneuvers</span> drastically increases consumption, causing a drain on your reserves. Any surplus energy will recharge this pool.</li>
            <li><strong>Tactical Trade-offs:</strong> If a system is destroyed, its power consumption is removed from the total. This creates a tactical choice: if you are low on power, you could intentionally leave a non-critical system like the transporter offline to free up energy for shields or weapons.</li>
        </ul>
         <SubHeader>Warp & Scanning</SubHeader>
        <p>From the Quadrant Map, you can travel long distances via Warp Drive. Each warp jump consumes one Dilithium crystal. You can also perform a Long-Range Scan on an adjacent quadrant to reveal basic information about it (e.g., number of hostile contacts) at the cost of Reserve Power.</p>
         <SubHeader>Repairs & Damage Control</SubHeader>
        <p>Damage can be repaired in two ways:</p>
         <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
            <li><strong>Damage Control Teams:</strong> In the Ship Status panel, you can assign your crew to slowly repair the Hull or a specific subsystem. This is a slow process that occurs at the end of each turn and consumes a small amount of power.</li>
            <li><strong>Starbase:</strong> Docking with a friendly Starbase allows for a full repair of all systems, free of charge. You can also resupply torpedoes and dilithium here.</li>
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
                <h4 className="font-bold text-secondary-light">Phasers</h4>
                <p className="text-sm text-text-secondary">Phaser percentage of repair is a direct indication of what percentage of energy is converted to destructive force at the point of impact. In other words, for a given level of phaser energy, 100% working phasers will do twice the damage of 50% working phasers.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-secondary-light">Photon Torpedo Tubes</h4>
                <p className="text-sm text-text-secondary">Like impulse engines, photon torpedo tubes' functionality degrades with damage, reducing the number of tubes available. At 100% repair, three tubes are functional. At 67-99%, two tubes work. At 34-66%, only one works. This effectively reduces potential torpedo damage output.</p>
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
                <p className="text-sm text-text-secondary">When life support systems are damaged below 100%, they cease to produce oxygen. The ship then switches to emergency reserves, which last for exactly two turns. If life support is not repaired within that time, the crew is lost, and the ship becomes a derelict hulk, ripe for salvage or capture. This applies to all ships in the sector, including yours.</p>
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