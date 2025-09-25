import React from 'react';
import { shipVisuals } from '../../assets/ships/configs/shipVisuals';
import { planetTypes } from '../../assets/planets/configs/planetTypes';
import { NavigationTargetIcon } from '../../assets/ui/icons';
import { SectionHeader, SubHeader } from './shared';

export const UISection: React.FC = () => {
    // FIX: Accessed ship visuals via ship class name ('Galaxy-class') instead of non-existent role.
    const PlayerShipIcon = shipVisuals.Federation.classes['Galaxy-class']!.icon;
    const MClassIcon = planetTypes.M.icon;
    return (
        <div>
            <SectionHeader>The Bridge Interface</SectionHeader>
            <p>Your command interface is divided into two primary columns and a status line at the bottom.</p>
            <SubHeader>Left Column: Viewscreen & Operations</SubHeader>
            <p className="text-text-secondary">This area contains your view of the current sector and your primary command console.</p>
            <div className="mt-4 p-2 border border-border-dark rounded">
                <div className="font-bold mb-2">1. The Viewscreen</div>
                <p>Displays either the current <strong>Sector View</strong> or the strategic <strong>Quadrant Map</strong>. You can switch between them using the vertical tabs.</p>
                <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2 space-y-1">
                    <li><strong>Sector View:</strong> A tactical grid of the current sector. Click on an empty square to set a <NavigationTargetIcon className="w-4 h-4 inline-block text-accent-yellow" /> navigation target. Click on an entity like a <PlayerShipIcon className="w-4 h-4 inline-block text-blue-400" /> ship or <MClassIcon className="w-4 h-4 inline-block text-green-500" /> planet to select it. Successfully captured ships will be displayed with a friendly blue icon.</li>
                    <li><strong>Quadrant Map:</strong> A strategic overview of the entire Typhon Expanse. Green quadrants are Federation-controlled, Red are Klingon, etc. Click on an adjacent sector to open a context menu to Warp or Scan.</li>
                </ul>
                <div className="font-bold mb-2 mt-4">2. Player HUD</div>
                <p>This section is divided into the Target Information panel and the Command Console.</p>
                <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2">
                    <li><strong>Target Info:</strong> Displays a wireframe and vital statistics (Hull, Shields, Subsystems) for your currently selected target. You must scan unscanned ships to see their details.</li>
                    <li><strong>Command Console:</strong> Contains all your primary actions for the turn: Fire Phasers, Launch Torpedoes, Scan, Hail, Retreat, and special actions like Boarding.</li>
                </ul>
            </div>
            <SubHeader>Right Column: Ship Systems Status</SubHeader>
            <p className="text-text-secondary">This column gives you a detailed, real-time overview of the U.S.S. Endeavour's status.</p>
             <div className="mt-4 p-2 border border-border-dark rounded">
                <div className="font-bold mb-2">1. Primary Status Bars</div>
                 <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2">
                     <li><strong>Hull:</strong> Your ship's structural integrity. If this reaches zero, the Endeavour is destroyed.</li>
                     <li><strong>Shields:</strong> Your main defense. Only active during Red Alert. Regenerates each turn based on power to shields.</li>
                     <li><strong>Reserve Power:</strong> Used for combat actions and system upkeep during Red Alert. Recharges when not in combat.</li>
                     <li><strong>Dilithium:</strong> A critical resource used for warping between quadrants and as an emergency power backup.</li>
                 </ul>
                 <div className="font-bold mb-2 mt-4">2. Tactical Toggles</div>
                 <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2">
                     <li><strong>Red Alert:</strong> Raises shields for combat. Drains reserve power each turn.</li>
                     <li><strong>Evasive:</strong> Increases chance to evade attacks but costs more power. Requires Red Alert.</li>
                     <li><strong>Damage Control:</strong> Assign your engineering crew to slowly repair the Hull or a damaged subsystem. This consumes power each turn.</li>
                 </ul>
                 <div className="font-bold mb-2 mt-4">3. Energy Allocation</div>
                 <p>Perhaps the most critical system. Distribute 100% of your main reactor's power between Weapons, Shields, and Engines. This directly impacts phaser damage, shield regeneration rate, and a passive evasion bonus.</p>
             </div>
            <SubHeader>Dissecting the Ship Systems Status Panel</SubHeader>
            <p className="text-text-secondary mb-4">The right-hand panel provides a comprehensive, at-a-glance overview of the Endeavour's operational status. Mastering this display is key to effective command.</p>
            <div className="mt-4 p-2 border border-border-dark rounded space-y-4">
                <div>
                    <h4 className="font-bold text-accent-yellow">1. Primary Status & Resources</h4>
                    <p className="text-sm text-text-secondary">These bars and readouts track your core ship resources. Hull is your health, Shields are your primary defense (only active on Red Alert), and Reserve Power is the energy pool for all tactical actions. Dilithium, Torpedoes, and Security teams are finite resources for warping, combat, and away missions.</p>
                </div>
                <div>
                    <h4 className="font-bold text-accent-yellow">2. Tactical Systems</h4>
                    <p className="text-sm text-text-secondary">These toggles control your ship's combat state. 'Red Alert' raises shields, 'Evasive' increases your chance to dodge attacks, 'Cloak' conceals your ship, and 'Point-Defense' automatically targets incoming torpedoes. Each provides a significant advantage at the cost of increased energy consumption.</p>
                </div>
                <div>
                    <h4 className="font-bold text-accent-yellow">3. Threat Analysis</h4>
                    <p className="text-sm text-text-secondary">This vital intelligence panel shows how many hostile ships are currently targeting you and the number of torpedoes on an intercept course. Use this information to decide whether to press the attack or adopt a defensive posture.</p>
                </div>
                 <div>
                    <h4 className="font-bold text-accent-yellow">4. Damage Control</h4>
                    <p className="text-sm text-text-secondary">This section allows you to assign damage control teams. Select a damaged subsystem or the hull to begin slow, automated repairs at the end of each turn. A flashing red indicator next to a system denotes a critical failure (e.g., Engines offline, Life Support failing).</p>
                </div>
                 <div>
                    <h4 className="font-bold text-accent-yellow">5. Energy Allocation</h4>
                    <p className="text-sm text-text-secondary">This is your primary command interface for managing the ship's reactor output. Distribute 100% of your power between Weapons, Shields, and Engines. This directly impacts your phaser damage, shield regeneration rate, and energy generation. Adjusting this is a free action and can be done at any time.</p>
                </div>
            </div>
        </div>
    )
};