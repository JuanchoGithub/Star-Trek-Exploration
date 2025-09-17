import React from 'react';
import { SectionHeader, SubHeader } from './shared';

export const CombatSection: React.FC = () => (
     <div>
        <SectionHeader>Advanced Combat Theory</SectionHeader>
        <p>Combat is a complex interplay of positioning, power management, and tactical choices.</p>
        <SubHeader>Phaser Combat Breakdown</SubHeader>
        <p className="text-text-secondary">Phaser damage is calculated through several steps. Understanding them is key to victory.</p>
        <ol className="list-decimal list-inside space-y-3 p-2 border border-border-dark rounded mt-2">
            <li>
                <strong>Hit Chance:</strong> Starts at a base of 90%. If a target is taking Evasive Maneuvers, this is significantly reduced. Your own Evasive Maneuvers also slightly reduce your accuracy. Nebulae in a sector will reduce accuracy for all combatants.
            </li>
            <li>
                <strong>Base Damage:</strong> Directly proportional to your <span className="text-red-400 font-bold">Power to Weapons</span> allocation. At 100% allocation, your base damage is 20. At 50%, it is 10.
            </li>
             <li>
                <strong>Range Modifier:</strong> Phasers lose effectiveness over distance. An attack at maximum range (6-7 hexes) may do only 20-30% of its potential damage. Close-range attacks are devastating.
            </li>
            <li>
                <strong>Shield Absorption:</strong> Damage is first applied to shields. Healthy shields can absorb an entire phaser blast.
            </li>
             <li>
                <strong>Subsystem Targeting & Shield Bypass:</strong> When targeting a specific subsystem (Weapons, Engines, Shields), your phasers attempt to "bleed through" the shields. The weaker the target's shields, the more damage bypasses them and hits the subsystem and hull directly.
            </li>
             <li>
                <strong>Targeting Focus Bonus:</strong> Maintaining a lock on the same subsystem for consecutive turns grants a significant damage bonus against that specific subsystem, leading to critical hits.
            </li>
        </ol>
        <SubHeader>Example Scenario</SubHeader>
        <div className="bg-bg-paper-lighter p-3 mt-2 rounded-md font-mono text-sm">
            <p>&gt; <span className="text-secondary-light">SITUATION:</span> U.S.S. Endeavour vs. Klingon D7.</p>
            <p>&gt; <span className="text-secondary-light">RANGE:</span> 3 hexes (effective).</p>
            <p>&gt; <span className="text-secondary-light">PLAYER POWER:</span> 80% to Weapons.</p>
            <p>&gt; <span className="text-secondary-light">KLINGON STATUS:</span> Shields at 50%.</p>
            <p className="mt-2 text-accent-yellow">&gt; --- CALCULATION ---</p>
            <p>&gt; 1. Base Damage: 20 * (80/100) = <span className="text-white font-bold">16</span></p>
            <p>&gt; 2. Range Modifier at 3 hexes: ~0.67x</p>
            <p>&gt; 3. Effective Damage: 16 * 0.67 = <span className="text-white font-bold">~10.7</span></p>
            <p>&gt; 4. Damage to Shields: The D7's shields (10/20) absorb a portion of the hit.</p>
            <p>&gt; 5. Damage to Hull: Remaining damage penetrates to the hull.</p>
            <p className="mt-2 text-accent-yellow">&gt; --- SCENARIO VARIANT: TARGETING WEAPONS ---</p>
             <p>&gt; The D7's shields are low (50%). A significant portion of the <span className="text-white font-bold">10.7</span> effective damage will bypass the shields, hitting the weapons system and hull directly. If you held the lock from last turn, a <span className="text-white font-bold">1.5x</span> critical multiplier is applied to the subsystem damage, likely disabling it.</p>
        </div>
         <SubHeader>Torpedoes, Boarding, and Retreat</SubHeader>
          <ul className="list-disc list-inside ml-4 text-text-secondary my-2">
            <li><strong>Photon Torpedoes:</strong> Fire-and-forget weapons that travel across the map. They are powerful but have limited ammo and can be shot down by enemy point-defense fire. They always target the hull.</li>
            <li><strong>Boarding / Strike Teams:</strong> If an enemy's shields are below 20%, you can use your Transporter to send a Security team. A <span className="text-purple-400">Boarding</span> action attempts to capture the ship, but you lose the team if it fails. A <span className="text-orange-400">Strike Team</span> deals direct hull damage, with a small chance of losing the team. Both actions require an operational Transporter.</li>
            <li><strong>Retreat:</strong> If there are hostiles present, you can initiate a retreat. For 3 turns, you will be unable to take action as your ship prepares to warp. If you survive, all hostile ships will be removed from the sector.</li>
        </ul>
    </div>
);
