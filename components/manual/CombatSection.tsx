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


const WeaponDetail: React.FC<{
    name: string;
    users: string;
    range: string;
    energy: string;
    damage: string;
    notes: string;
    borderColorClass: string;
    children?: React.ReactNode;
}> = ({ name, users, range, energy, damage, notes, borderColorClass, children }) => (
    <div className={`p-3 bg-bg-paper-lighter rounded border-l-4 ${borderColorClass} mb-4`}>
        <h4 className="text-lg font-bold text-white">{name}</h4>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
                <dt className="font-bold text-text-secondary">Primary Users:</dt>
                <dd className="text-text-primary">{users}</dd>
            </div>
             <div>
                <dt className="font-bold text-text-secondary">Effective Range:</dt>
                <dd className="text-text-primary">{range}</dd>
            </div>
             <div>
                <dt className="font-bold text-text-secondary">Energy Cost:</dt>
                <dd className="text-text-primary">{energy}</dd>
            </div>
             <div>
                <dt className="font-bold text-text-secondary">Damage Profile:</dt>
                <dd className="text-text-primary">{damage}</dd>
            </div>
            <div className="col-span-full">
                <dt className="font-bold text-text-secondary">Tactical Notes:</dt>
                <dd className="text-text-primary italic">{notes}</dd>
            </div>
            {children && <div className="col-span-full mt-2">{children}</div>}
        </div>
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
        <SectionHeader>Advanced Combat: Weapon Systems</SectionHeader>
        <p className="text-text-secondary mb-4">A thorough understanding of your own weapon systems—and those of your potential adversaries—is paramount. This section details the operational parameters of all known energy and projectile weapons in the Typhon Expanse.</p>
        
        <SubHeader>Energy Weapons</SubHeader>
        <WeaponDetail
            name="Phasers"
            borderColorClass="border-accent-red"
            users="All Factions"
            range="1-6 hexes"
            energy="Draws directly from main reactor based on 'Weapons' allocation setting."
            damage="Variable (Base 20 for player * % Power to Weapons). Modified by range and phaser subsystem health."
            notes="The standard energy weapon. Can be precisely targeted at enemy subsystems. Accuracy is negatively affected by nebulae and evasive maneuvers."
        >
            <DamageFalloffTable data={phaserFalloffData} />
        </WeaponDetail>
        
        <SubHeader>Projectile Weapons (Torpedoes)</SubHeader>
        <WeaponDetail
            name="Photon Torpedoes"
            borderColorClass="border-accent-sky"
            users="Federation, Klingon, Pirates"
            range="Sector-wide (Travel time applies)"
            energy="None (Consumes ammunition)"
            damage="Base 50. This damage is heavily mitigated by active shields, which can absorb the entire blast if strong enough."
            notes="Standard antimatter warhead. Targets the hull only and cannot be aimed at subsystems. Can be shot down by point-defense phaser fire."
        />
        <WeaponDetail
            name="Quantum Torpedoes"
            borderColorClass="border-accent-indigo"
            users="Advanced Federation (Sovereign, Defiant classes)"
            range="Sector-wide (Faster than Photon Torpedoes)"
            energy="None (Consumes ammunition)"
            damage="Base 75. A portion of this damage will bypass shields, striking the hull directly."
            notes="A zero-point energy warhead that is much more difficult for enemy point-defense systems to intercept. A key Starfleet technological advantage."
        />
         <WeaponDetail
            name="Plasma Torpedoes"
            borderColorClass="border-accent-teal"
            users="Romulan Star Empire"
            range="Sector-wide (Relatively slow travel time)"
            energy="None (Consumes ammunition)"
            damage="Base 30 + Plasma Burn (10 damage per turn for 2 turns). The burn damage bypasses shields entirely."
            notes="A tactical weapon designed to disable and wear down targets. The initial impact is moderate, but the subsequent plasma fire can be devastating to an unshielded hull."
        />
        <WeaponDetail
            name="Heavy Plasma Torpedoes"
            borderColorClass="border-green-400"
            users="Romulan (D'deridex Warbird)"
            range="Sector-wide (Slow travel time)"
            energy="None (Consumes ammunition)"
            damage="Base 40 + Plasma Burn (15 damage per turn for 2 turns). The burn damage bypasses shields entirely."
            notes="A larger, more potent version of the standard plasma torpedo. Exceptionally dangerous against vessels with compromised shields."
        />
        <WeaponDetail
            name="Heavy Photon Torpedoes"
            borderColorClass="border-orange-500"
            users="Klingon Empire (Negh'Var), Pirates (Nausicaan)"
            range="Sector-wide (Slow travel time)"
            energy="None (Consumes ammunition)"
            damage="Base 90. Heavily mitigated by shields."
            notes="A brute-force weapon favored by Klingons. It is slow and relatively easy to intercept, but will inflict catastrophic damage if it connects with a depleted shield facing."
        />
    </div>
    );
};