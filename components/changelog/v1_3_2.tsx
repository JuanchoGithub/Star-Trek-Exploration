
import React from 'react';
import { SectionHeader, SubHeader } from '../manual/shared';

export const Version1_3: React.FC = () => {
    const releaseDate = "September 22, 2025";
    return (
        <>
            <SectionHeader>Version 1.3 Branch</SectionHeader>
            <SubHeader>Version 1.3.2 - Energy Rebalancing</SubHeader>
            <p className="text-sm text-text-disabled -mt-3 mb-4">Release Date: Stardate 49721.8, 09:00 ({releaseDate})</p>
            <p className="text-lg text-text-secondary italic mb-4">Overhaul of the ship energy economy based on operational feedback.</p>
            
            <SubHeader>Field Report & Directive</SubHeader>
            <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
                <blockquote className="text-text-secondary italic">
                        <p>"...some ships have too low energy and dilithium... make the energy requirements equivalent on all ships... if a galaxy class ship's phasers consume 20 units, an intrepid class should consume 50% of that, and the phasers should do 50% of damage... this modifier works both for phaser, point defense systems and any energy requirements consumption."</p>
                </blockquote>
            </div>

            <SubHeader>Summary of Implemented Changes</SubHeader>
            <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
                <li>
                    <strong className="text-white">Energy Modifier System:</strong> Introduced a new `energyModifier` stat for every ship class, calculated based on its total durability (Hull + Shields). The Sovereign-class serves as the 1.0x baseline.
                </li>
                <li>
                    <strong className="text-white">Scaled Energy Consumption:</strong> All actions that consume Reserve Power (phasers, torpedoes, repairs, etc.) now have their costs scaled by this modifier.
                </li>
                <li>
                    <strong className="text-white">Scaled Damage Output:</strong> Phaser damage is now also scaled by the `energyModifier` to maintain combat balance.
                </li>
                <li>
                    <strong className="text-white">Proportional Resource Pools:</strong> Each ship's maximum Reserve Power and Dilithium stores were rebalanced based on its `energyModifier`.
                </li>
            </ul>
        </>
    );
};
