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
    </div>
);
