import React from 'react';
import { SectionHeader, SubHeader } from './shared';

const ShieldLeakageExplanation: React.FC = () => (
    <div className="mt-2">
        <dt className="font-bold text-text-secondary">Phaser Shield Leakage (Probabilistic):</dt>
        <dd className="mt-1 text-sm text-text-primary">
            <p>Phaser fire against shielded targets now has a chance to "leak" a portion of its damage directly to the hull, bypassing the shields entirely. This mechanic makes every phaser hit meaningful and prevents combat stalemates.</p>
            <ul className="list-disc list-inside ml-4 my-2 space-y-1">
                <li>The chance of a leak is calculated based on the target's current shield percentage. It starts at a base of <strong className="text-white">5%</strong> against full shields and increases exponentially as shields weaken. A ship at 50% shields has a ~29% chance of suffering a leak, while a ship at 10% shields has a ~82% chance.</li>
                <li>If a leak occurs, the amount of damage that bypasses the shields is also proportional to the leakage chance.</li>
                <li>Any successful leak that would deal less than 1 point of damage is rounded up to a minimum of <strong className="text-white">1 point</strong>, ensuring even glancing hits have an impact.</li>
                <li>The combat log will explicitly state the chance of leakage, whether the check succeeded or failed, and the amount of damage that penetrated.</li>
            </ul>
        </dd>
    </div>
);


export const CombatSection: React.FC = () => {
    return (
     <div>
        <SectionHeader>Advanced Combat Mechanics</SectionHeader>
        <p className="text-text-secondary mb-4">A thorough understanding of weapon mechanics is paramount. For detailed specifications on individual weapon systems, refer to the 'Weapon Systems Registry'.</p>
        
        <SubHeader>Energy Weapons (Phasers & Disruptors)</SubHeader>
        <div className="p-3 bg-bg-paper-lighter rounded my-4">
            <h4 className="text-lg font-bold text-accent-yellow">Accuracy Modifiers</h4>
            <p className="text-text-secondary mb-2">Phaser and disruptor accuracy is not guaranteed. All energy weapons begin with a <strong className="text-white">base 90% chance to hit</strong>. This is then multiplied by any applicable modifiers from the list below:</p>
            <ul className="list-disc list-inside ml-4 text-text-secondary space-y-1 text-sm">
                <li><strong className="text-cyan-400">Target Evasive Maneuvers:</strong> Accuracy is multiplied by 0.60.</li>
                <li><strong className="text-gray-400">Asteroid Field Cover:</strong> Accuracy is multiplied by 0.70.</li>
                <li><strong className="text-purple-400">Nebula Obscurement:</strong> Accuracy is multiplied by 0.75.</li>
                <li><strong className="text-yellow-400">Attacker Evasive Maneuvers:</strong> Accuracy is multiplied by 0.75.</li>
                <li><strong className="text-red-400">Klingon Disruptors:</strong> Accuracy is multiplied by 0.95.</li>
            </ul>
            <p className="text-xs text-text-disabled mt-2">Note: Modifiers are cumulative. For example, firing a Klingon disruptor (x0.95) at an evasive target (x0.60) in a nebula (x0.75) would result in a final hit chance of: 90% &times; 0.95 &times; 0.60 &times; 0.75 &approx; 38.5%.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <dt className="font-bold text-text-secondary mt-2">Phaser Damage Falloff:</dt>
                <dd className="mt-1 text-sm">
                    <p>
                        The damage of all energy weapons (phasers, disruptors) decreases linearly over distance. Damage is 100% at range 1 and falls off to a minimum of 20% at the weapon's maximum range.
                    </p>
                    <p className="mt-2 italic">
                        The previous static table was only accurate for a weapon with a max range of 6. For precise damage values at each range for every weapon, please consult the new <strong className="text-white">Weapon Systems Registry</strong> section.
                    </p>
                </dd>
            </div>
            <ShieldLeakageExplanation />
        </div>
        
        <SubHeader>Projectile Weapons (Torpedoes)</SubHeader>
        <div className="p-3 bg-bg-paper-lighter rounded my-4">
            <h4 className="text-lg font-bold text-accent-yellow">Shield Absorption</h4>
            <p className="text-text-secondary">Unlike energy weapons, torpedoes do not "leak" through shields. Instead, their kinetic and explosive energy is absorbed by the shield bubble. Shields are highly effective at mitigating this type of damage, but at a significant energy cost.</p>
             <p className="text-center font-bold text-2xl my-4 text-white">4 Shield Points : 1 Torpedo Damage</p>
             <p className="text-text-secondary">For every 4 points of energy drained from the shield grid, 1 point of incoming torpedo damage is negated. This makes torpedoes exceptionally good at draining shield power, but less effective at dealing hull damage to a fully shielded target.</p>
        </div>
        <p className="text-text-secondary mb-4">All torpedoes have a chance to miss that increases with distance. Different torpedo types (Photon, Quantum, Plasma) have different base accuracies and modifiers. For a detailed breakdown of hit chances for each weapon type, please consult the <strong className="text-white">Weapon Systems Registry</strong>.</p>
    </div>
    );
};