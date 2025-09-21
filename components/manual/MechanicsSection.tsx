
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
            <li><strong>Hazards:</strong> Be aware that moving through or adjacent to certain phenomena, like asteroid fields, can cause damage for each cell you move through.</li>
        </ul>
        <SubHeader>Energy Management</SubHeader>
        <p>Your ship has two power pools:</p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
            <li><strong>Main Reactor Power (Allocation):</strong> The 100% you allocate via sliders. This is your primary power for passive systems. Higher allocation to <span className="text-red-400">Weapons</span> boosts phaser damage. Higher allocation to <span className="text-cyan-400">Shields</span> increases shield regeneration per turn. Higher allocation to <span className="text-green-400">Engines</span> provides a small passive evasion bonus.</li>
            <li><strong>Reserve Power (Battery):</strong> A separate pool used for active abilities like Red Alert upkeep, evasive maneuvers, and subsystem targeting. This power recharges slowly when Red Alert is off, but is consumed when it's active. If it runs out, you may use a <span className="text-pink-400">Dilithium</span> crystal to fully recharge it, but this can cause subsystem stress damage.</li>
        </ul>
         <SubHeader>Warp & Scanning</SubHeader>
        <p>From the Quadrant Map, you can travel long distances via Warp Drive. Each warp jump consumes one Dilithium crystal. You can also perform a Long-Range Scan on an adjacent quadrant to reveal basic information about it (e.g., number of hostile contacts) at the cost of Reserve Power.</p>
         <SubHeader>Repairs & Damage Control</SubHeader>
        <p>Damage can be repaired in two ways:</p>
         <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
            <li><strong>Damage Control Teams:</strong> In the Ship Status panel, you can assign your crew to repair the Hull or a specific subsystem. This is a slow process that occurs at the end of each turn and consumes Reserve Power.</li>
            <li><strong>Starbase:</strong> Docking with a friendly Starbase allows for a full repair of all systems, free of charge. You can also resupply torpedoes and dilithium here.</li>
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
                <h4 className="font-bold text-secondary-light">Short Range Scanners</h4>
                <p className="text-sm text-text-secondary">Short range scanners lose resolution when they are damaged. Above 90% they are fully functional, but below 90% they are unable to detect anything smaller than a star. Below 50% they do not function at all.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-secondary-light">Long Range Scanners</h4>
                <p className="text-sm text-text-secondary">Long range scanners also lose resolution when damaged. When less than 100% repaired they can no longer detect enemy ships on the quadrant map. Below 50% they are not functional.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-secondary-light">Computer</h4>
                <p className="text-sm text-text-secondary">A modern starship is highly computerized. Portions of the ship's charts can be lost if the computer is sufficiently damaged and can only be recovered by re-scanning. Automatic navigation and viewing the Quadrant Map require the computer to be 100% repaired.</p>
            </div>
            <div className="p-3 bg-bg-paper-lighter rounded">
                <h4 className="font-bold text-secondary-light">Life Support</h4>
                <p className="text-sm text-text-secondary">Life support systems must be 100% functional to generate food and oxygen needed to sustain life. Without a functioning life support system, the ship can last only two days on reserves.</p>
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
