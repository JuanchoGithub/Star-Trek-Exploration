import React from 'react';
import { shipVisuals } from '../../assets/ships/configs/shipVisuals';
import { planetTypes } from '../../assets/planets/configs/planetTypes';
import { NavigationTargetIcon, ScienceIcon } from '../../assets/ui/icons';
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
                    <li>
                        <strong>Quadrant Map:</strong> A strategic overview of the entire Typhon Expanse. Click on an adjacent sector to open a context menu to Warp or Scan.
                        <div className="mt-2 text-xs p-2 bg-black/30 border-l-2 border-accent-yellow">
                            <p><strong className="text-accent-yellow">CRITICAL:</strong> The Quadrant Map requires the ship's main computer to be at 100% operational capacity. If the computer subsystem sustains any damage, the map will become inaccessible, and your view will be automatically returned to the Sector View until repairs are complete.</p>
                        </div>
                    </li>
                </ul>
                <div className="font-bold mb-2 mt-4">2. Player HUD</div>
                <p>This section is divided into the Target Information panel and the Command Console.</p>
                <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2">
                    <li><strong>Target Info:</strong> Displays a wireframe and vital statistics (Hull, Shields, Subsystems) for your currently selected target. You must scan unscanned ships to see their details.</li>
                    <li><strong>Command Console:</strong> Contains all your primary actions for the turn. Weapon controls are dynamically generated based on your ship's loadout. Other actions include Scan, Hail, Retreat, and special operations like Boarding.</li>
                </ul>
            </div>
            <SubHeader>Right Column: Ship Systems Status</SubHeader>
            <p className="text-text-secondary">This column gives you a detailed, real-time overview of the U.S.S. Endeavour's status. It contains several key sections, which are explained in full detail below.</p>
             <div className="mt-4 p-2 border border-border-dark rounded">
                <div className="font-bold mb-2">1. Primary Readouts & Resources</div>
                 <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2">
                     <li><strong>Core Status:</strong> Hull, Shields, Reserve Power, and Crew Morale.</li>
                     <li><strong>Finite Resources:</strong> Dilithium for warping, Torpedoes for heavy combat, and Security teams for away missions.</li>
                 </ul>
                 <div className="font-bold mb-2 mt-4">2. Tactical Toggles</div>
                 <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2">
                     <li><strong>Red Alert:</strong> Raises shields for combat.</li>
                     <li><strong>Evasive:</strong> Increases chance to evade attacks (Requires Red Alert).</li>
                     <li><strong>Cloak:</strong> Engages the cloaking device, if equipped.</li>
                     <li><strong>Point-Defense:</strong> Activates automated lasers to intercept torpedoes.</li>
                 </ul>
                 <div className="font-bold mb-2 mt-4">3. Damage Control & Energy Allocation</div>
                 <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2">
                    <li><strong>Damage Control Assignment:</strong> Use this section to select a damaged subsystem or the hull for your repair teams to focus on.</li>
                    <li><strong>Energy Allocation:</strong> Distribute main reactor power between Weapons, Shields, and Engines to dynamically adjust your ship's performance.</li>
                 </ul>
             </div>
            <SubHeader>Bottom: Status Line &amp; Menus</SubHeader>
            <p className="text-text-secondary">The bar at the bottom of the screen provides quick access to game functions and displays the latest log entry.</p>
            <ul className="list-disc list-inside ml-4 text-sm text-text-secondary mt-2 space-y-1">
                <li><strong>Game Menu:</strong> Access save/load functions, the Player's Manual, and exit options.</li>
                <li><strong>Latest Log Entry:</strong> A truncated version of the most recent event log is displayed for quick reference.</li>
                <li><strong>Captain's Log:</strong> Opens a full-screen modal view of all recorded log entries. To aid in identifying different vessels in the log, each ship is assigned a unique color (`logColor`) which is used for the border of its log entries.</li>
            </ul>
            <SubHeader>Mobile & Touch Interface (PADDs)</SubHeader>
            <p className="text-text-secondary">When operating on smaller, touch-enabled devices such as a PADD, the bridge interface adapts to a single-column layout to maximize screen space for the tactical view.</p>
            <div className="mt-4 p-2 border border-border-dark rounded">
                <p className="text-sm text-text-secondary">In this configuration, the right-hand "Ship Systems Status" column is hidden. To access it, tap the floating circular button labeled with a <ScienceIcon className="w-4 h-4 inline-block" /> systems icon, located in the bottom-right corner of your screen. This will open the full Ship Systems panel in a slide-out overlay from the right, providing access to all status readouts, tactical toggles, damage control, and energy allocation as normal.</p>
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
                    <h4 className="font-bold text-accent-yellow">3. Environment</h4>
                    <p className="text-sm text-text-secondary">This section provides at-a-glance information on your ship's immediate surroundings, indicating if you are currently within a hazardous Ion Storm, a sensor-dampening Nebula, or a cluttered Asteroid Field.</p>
                </div>
                <div>
                    <h4 className="font-bold text-accent-yellow">4. Threat Analysis</h4>
                    <p className="text-sm text-text-secondary">This vital intelligence panel shows how many hostile ships are currently targeting you and the number of torpedoes on an intercept course. Use this information to decide whether to press the attack or adopt a defensive posture.</p>
                </div>
                 <div>
                    <h4 className="font-bold text-accent-yellow">5. Damage Control</h4>
                    <p className="text-sm text-text-secondary">This section allows you to assign damage control teams. Select a damaged subsystem or the hull to begin slow, automated repairs at the end of each turn. A flashing red indicator next to a system denotes a critical failure (e.g., Engines offline, Life Support failing).</p>
                </div>
                 <div>
                    <h4 className="font-bold text-accent-yellow">6. Energy Allocation</h4>
                    <p className="text-sm text-text-secondary">This is your primary command interface for managing the ship's reactor output. Distribute 100% of your power between Weapons, Shields, and Engines. This directly impacts your phaser damage, shield regeneration rate, and energy generation. Adjusting this is a free action and can be done at any time.</p>
                </div>
            </div>
        </div>
    )
};