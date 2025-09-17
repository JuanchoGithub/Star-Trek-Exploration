import React from 'react';
import { shipVisuals } from '../../assets/ships/configs/shipVisuals';
import { planetTypes } from '../../assets/planets/configs/planetTypes';
import { NavigationTargetIcon } from '../../assets/ui/icons';
import { SectionHeader, SubHeader } from './shared';

export const UISection: React.FC = () => {
    const PlayerShipIcon = shipVisuals.Federation.roles.Explorer!.icon;
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
        </div>
    )
};
