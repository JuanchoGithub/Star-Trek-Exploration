import React from 'react';
import { SectionHeader, SubHeader } from './shared';

export const ChangelogSection: React.FC = () => (
    <div>
        <SectionHeader>Latest Changes: Version 1.3.2</SectionHeader>
        <p className="text-lg text-text-secondary italic mb-4">This section details the most recent updates to the simulation based on operational feedback.</p>
        
        <SubHeader>Field Report & Directive</SubHeader>
        <div className="p-3 bg-black rounded border-l-4 border-primary-main my-4">
            <blockquote className="text-text-secondary italic">
                <p>"review ship and consumption configuration for all ships, i've just entered combat with The Nova's Remnant, and after 3 turns of fighting it sent this message: 'Power and dilithium reserves are critically low! Attempting to disengage and warp out!' this means the ship ran out of reserve energy AND dilithiums in 3 turns."</p>
                <p className="mt-2">"it seems like some ships have too low energy and dilithium... make the energy requirements equivalent on all ships, that is, if a galaxy class ship's phasers consume 20 units, an intrepid class should consume 50% of that, and the phasers should do 50% of damage... define the current values as baseline levels (for sovereigh class ships / dreadnoughts... every 10 points [of hull + shields] is a 0.015 point more or less... this modifier works both for phaser, point defense systems and any energy requirements consumption. lets also define energy and dilithium for each ship clearly and put it in the entity registry in the manual."</p>
            </blockquote>
        </div>

        <SubHeader>Analysis of Feedback</SubHeader>
        <p className="text-text-secondary mb-2">
            The submitted field report correctly identified a critical imbalance in the combat simulation's energy economy. Smaller, less durable vessels such as the Pirate Raider "The Nova's Remnant" were exhausting their entire energy and dilithium reserves within a few turns of combat. This made them ineffective as sustained threats and resulted in unsatisfying, predictable encounters. The vessel's short combat endurance was not a result of its small size, but a flaw in its power consumption logic, which was not proportional to its capabilities.
        </p>

        <SubHeader>Summary of Implemented Changes</SubHeader>
        <p className="text-text-secondary mb-2">
            In response to the directive, Starfleet Command has authorized a complete overhaul of ship energy profiles. The goal was not simply to increase resource pools, but to create a more nuanced and balanced system where a ship's power consumption is directly proportional to its overall size and durability.
        </p>
        <ul className="list-disc list-inside ml-4 text-text-secondary my-2 space-y-2">
            <li>
                <strong className="text-white">Energy Modifier System:</strong> A new core mechanic, the `energyModifier`, has been introduced. This stat is calculated for every ship class based on its total durability (Maximum Hull + Maximum Shields).
            </li>
            <li>
                <strong className="text-white">Baseline Calibration:</strong> The Sovereign-class Dreadnought, with a total durability of 570, serves as the 1.0x baseline for all calculations. Ships with higher or lower durability have their modifier scaled accordingly. For example, a small Intrepid-class scout with a durability of 280 now has an `energyModifier` of approximately 0.565x.
            </li>
            <li>
                <strong className="text-white">Scaled Energy Consumption:</strong> All actions that consume Reserve Power—including phaser fire, torpedo launches, point-defense, repairs, raising shields, and sensor scans—now have their costs scaled by this `energyModifier`. Smaller ships now consume proportionally less power for every action.
            </li>
            <li>
                <strong className="text-white">Scaled Damage Output:</strong> To maintain combat balance, phaser damage is now also scaled by the `energyModifier`. A ship that consumes less power for its weapons will deal proportionally less damage, ensuring that smaller ships are more efficient but not disproportionately powerful.
            </li>
            <li>
                <strong className="text-white">Proportional Resource Pools:</strong> Each ship's maximum Reserve Power and Dilithium stores have been recalculated based on its `energyModifier`. This ensures smaller ships have appropriately smaller reserves, reflecting their size and role.
            </li>
            <li>
                <strong className="text-white">Manual Update:</strong> The "Entity Registry" section of this manual has been updated to display the newly rebalanced Energy Reserve and Dilithium Store capacities for every ship class, ensuring full transparency of these changes.
            </li>
        </ul>
        <p className="text-text-secondary mt-4">
            <strong>Conclusion:</strong> This rebalancing ensures that vessels of all sizes are viable and that combat pacing is more consistent and strategic. Smaller ships are now less powerful but also more efficient, allowing them to participate in longer, more meaningful engagements without prematurely exhausting their resources.
        </p>
    </div>
);