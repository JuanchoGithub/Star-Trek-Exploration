

import React from 'react';
import { SectionHeader, SubHeader } from './shared';

const DamageFalloffTable: React.FC<{ data: { range: number; modifier: string }[] }> = ({ data }) => (
    <div>
        <dt className="font-bold text-text-secondary mt-2">Phaser Damage Falloff:</dt>
        <dd className="mt-1">
            <table className="w-full max-w-sm text-sm text-left border-collapse">
                <thead className="bg-bg-paper-lighter">
                    <tr>
                        <th className="p-2 border border-border-dark font-bold">Range (Hexes)</th>
                        <th className="p-2 border border-border-dark font-bold">Damage Modifier</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(row => (
                        <tr key={row.range} className="bg-bg-paper even:bg-black/20">
                            <td className="p-2 border border-border-dark font-mono">{row.range}</td>
                            <td className="p-2 border border-border-dark font-mono">{row.modifier}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </dd>
    </div>
);

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
    const phaserFalloffData = [
        { range: 1, modifier: '100%' },
        { range: 2, modifier: '80%' },
        { range: 3, modifier: '60%' },
        { range: 4, modifier: '40%' },
        { range: 5, modifier: '20%' },
        { range: 6, modifier: '20% (Minimum)' },
    ];

    return (
     <div>
        <SectionHeader>Advanced Combat Mechanics</SectionHeader>
        <p className="text-text-secondary mb-4">A thorough understanding of weapon mechanics is paramount. For detailed specifications on individual weapon systems, refer to the 'Weapon Systems Registry'.</p>
        
        <SubHeader>Energy Weapons (Phasers)</SubHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DamageFalloffTable data={phaserFalloffData} />
            <ShieldLeakageExplanation />
        </div>
        
        <SubHeader>Projectile Weapons (Torpedoes)</SubHeader>
        <p className="text-text-secondary mb-4">All torpedoes have a chance to miss that increases with distance. The table below shows the base hit chance for a standard Photon Torpedo. Other torpedo types have modifiers applied to this base chance.</p>
        <table className="w-full max-w-md text-sm text-left border-collapse my-4">
            <thead className="bg-bg-paper-lighter">
                <tr>
                    <th className="p-2 border border-border-dark font-bold">Range (Cells)</th>
                    <th className="p-2 border border-border-dark font-bold">Photon (Baseline)</th>
                    <th className="p-2 border border-border-dark font-bold">Quantum (+15%)</th>
                    <th className="p-2 border border-border-dark font-bold">Plasma (-10%)</th>
                    <th className="p-2 border border-border-dark font-bold">Heavy Plasma (-15%)</th>
                    <th className="p-2 border border-border-dark font-bold">Heavy Photon (-20%)</th>
                </tr>
            </thead>
            <tbody>
                <tr className="bg-bg-paper even:bg-black/20"><td className="p-2 border border-border-dark font-mono">1</td><td className="p-2 border border-border-dark font-mono">80%</td><td className="p-2 border border-border-dark font-mono">95%</td><td className="p-2 border border-border-dark font-mono">70%</td><td className="p-2 border border-border-dark font-mono">65%</td><td className="p-2 border border-border-dark font-mono">60%</td></tr>
                <tr className="bg-bg-paper even:bg-black/20"><td className="p-2 border border-border-dark font-mono">2</td><td className="p-2 border border-border-dark font-mono">70%</td><td className="p-2 border border-border-dark font-mono">85%</td><td className="p-2 border border-border-dark font-mono">60%</td><td className="p-2 border border-border-dark font-mono">55%</td><td className="p-2 border border-border-dark font-mono">50%</td></tr>
                <tr className="bg-bg-paper even:bg-black/20"><td className="p-2 border border-border-dark font-mono">3</td><td className="p-2 border border-border-dark font-mono">50%</td><td className="p-2 border border-border-dark font-mono">65%</td><td className="p-2 border border-border-dark font-mono">40%</td><td className="p-2 border border-border-dark font-mono">35%</td><td className="p-2 border border-border-dark font-mono">30%</td></tr>
                <tr className="bg-bg-paper even:bg-black/20"><td className="p-2 border border-border-dark font-mono">4</td><td className="p-2 border border-border-dark font-mono">25%</td><td className="p-2 border border-border-dark font-mono">40%</td><td className="p-2 border border-border-dark font-mono">15%</td><td className="p-2 border border-border-dark font-mono">10%</td><td className="p-2 border border-border-dark font-mono">5%</td></tr>
                <tr className="bg-bg-paper even:bg-black/20"><td className="p-2 border border-border-dark font-mono">5+</td><td className="p-2 border border-border-dark font-mono">0%</td><td className="p-2 border border-border-dark font-mono">0%</td><td className="p-2 border border-border-dark font-mono">0%</td><td className="p-2 border border-border-dark font-mono">0%</td><td className="p-2 border border-border-dark font-mono">0%</td></tr>
            </tbody>
        </table>
    </div>
    );
};