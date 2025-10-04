import React from 'react';
import { SectionHeader, SubHeader } from './shared';
import { 
    WEAPON_PHASER_TYPE_IV,
    WEAPON_PHASER_TYPE_V,
    WEAPON_PHASER_TYPE_VI,
    WEAPON_PHASER_TYPE_VIII,
    WEAPON_PHASER_TYPE_X,
    WEAPON_PULSE_PHASER,
    WEAPON_PULSE_DISRUPTOR,
    WEAPON_TORPEDO_PHOTON, 
    WEAPON_TORPEDO_QUANTUM,
    WEAPON_TORPEDO_PLASMA,
    WEAPON_TORPEDO_HEAVY_PLASMA,
    WEAPON_TORPEDO_HEAVY_PHOTON,
    WEAPON_DISRUPTOR_LIGHT,
    WEAPON_DISRUPTOR_MEDIUM,
    WEAPON_DISRUPTOR_HEAVY,
    WEAPON_DISRUPTOR_ROMULAN_LIGHT,
    WEAPON_DISRUPTOR_ROMULAN_MEDIUM,
    WEAPON_PULSE_DISRUPTOR_ROMULAN
} from '../../assets/weapons/weaponRegistry';
import { BeamWeapon, ProjectileWeapon } from '../../types';
import { WeaponStatDisplay } from './WeaponStatDisplay';
import { getTorpedoHitChance } from '../../game/utils/combat';
import { torpedoStats } from '../../assets/projectiles/configs/torpedoTypes';

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-text-secondary">{label}:</span>
        <span className="font-bold text-text-primary text-right">{String(value)}</span>
    </div>
);

const WeaponDetail: React.FC<{ weapon: BeamWeapon | ProjectileWeapon, notes: string, users: string }> = ({ weapon, notes, users }) => {
    const isBeam = weapon.type === 'beam';
    const isProjectile = weapon.type === 'projectile';
    const projectileWeapon = isProjectile ? (weapon as ProjectileWeapon) : null;
    const torpedoConfig = isProjectile ? torpedoStats[projectileWeapon.ammoType] : null;

    const Icon = weapon.icon;
    const iconColor = isProjectile && torpedoConfig ? torpedoConfig.colorClass : (weapon.name.toLowerCase().includes('disruptor') ? 'text-accent-green' : 'text-accent-red');
    const borderColorClass = isBeam ? (weapon.name.toLowerCase().includes('disruptor') ? 'border-accent-green' : 'border-accent-red') : 'border-accent-sky';

    return (
        <div className={`p-3 bg-bg-paper-lighter rounded border-l-4 ${borderColorClass} mb-4`}>
            <h4 className="text-lg font-bold text-white flex items-center gap-3">
                <Icon className={`w-8 h-8 ${iconColor}`} />
                {weapon.name}
            </h4>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem label="Primary Users" value={users} />
                <DetailItem label="Slot" value={weapon.slot.charAt(0).toUpperCase() + weapon.slot.slice(1)} />
                
                {isBeam ? (
                    <>
                        <WeaponStatDisplay 
                            label="Base Damage"
                            value={(weapon as BeamWeapon).baseDamage}
                            maxValue={100}
                            colorClass="bg-accent-red"
                        />
                        <WeaponStatDisplay 
                            label="Range Effectiveness"
                            phaserRange={(weapon as BeamWeapon).range}
                            phaserBaseDamage={(weapon as BeamWeapon).baseDamage}
                        />
                    </>
                ) : (
                    <WeaponStatDisplay 
                        label="Effective Damage by Range"
                        projectileBaseDamage={torpedoStats[(weapon as ProjectileWeapon).ammoType].damage}
                        torpedoAccuracy={[
                            { range: 1, chance: Math.round(getTorpedoHitChance((weapon as ProjectileWeapon).ammoType, 1) * 100) },
                            { range: 2, chance: Math.round(getTorpedoHitChance((weapon as ProjectileWeapon).ammoType, 2) * 100) },
                            { range: 3, chance: Math.round(getTorpedoHitChance((weapon as ProjectileWeapon).ammoType, 3) * 100) },
                            { range: 4, chance: Math.round(getTorpedoHitChance((weapon as ProjectileWeapon).ammoType, 4) * 100) },
                        ]}
                    />
                )}
                 <div className="col-span-full">
                    <dt className="font-bold text-text-secondary">Tactical Notes:</dt>
                    <dd className="text-text-primary italic">{notes}</dd>
                </div>
            </div>
        </div>
    );
};

const SystemDetail: React.FC<{ name: string, type: string, range: string, notes: string, borderColorClass: string }> = ({ name, type, range, notes, borderColorClass }) => (
     <div className={`p-3 bg-bg-paper-lighter rounded border-l-4 ${borderColorClass} mb-4`}>
        <h4 className="text-lg font-bold text-white">{name}</h4>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <DetailItem label="System Type" value={type} />
            <DetailItem label="Effective Range" value={range} />
            <div className="col-span-full">
                <dt className="font-bold text-text-secondary">Tactical Notes:</dt>
                <dd className="text-text-primary italic">{notes}</dd>
            </div>
        </div>
    </div>
);

const phaserTypes = [
    { weapon: WEAPON_PHASER_TYPE_IV, users: "Federation Scout Vessels" },
    { weapon: WEAPON_PHASER_TYPE_V, users: "Standard Cruisers, Raiders" },
    { weapon: WEAPON_PHASER_TYPE_VI, users: "Upgraded Federation Cruisers" },
    { weapon: WEAPON_PHASER_TYPE_VIII, users: "Advanced Federation Escorts" },
    { weapon: WEAPON_PHASER_TYPE_X, users: "Federation Dreadnoughts" },
];

const phaserFalloffData = [
    { range: 1, modifier: '100%' }, { range: 2, modifier: '80%' }, { range: 3, modifier: '60%' },
    { range: 4, modifier: '40%' }, { range: 5, modifier: '20%' }, { range: 6, modifier: '20%' }
];

const disruptorTypesKlingon = [
    { weapon: WEAPON_DISRUPTOR_LIGHT, users: "Klingon Scouts (B'rel)" },
    { weapon: WEAPON_DISRUPTOR_MEDIUM, users: "Klingon Cruisers (K't'inga)" },
    { weapon: WEAPON_DISRUPTOR_HEAVY, users: "Klingon Attack Cruisers (Vor'cha)" },
];

const disruptorTypesRomulan = [
    { weapon: WEAPON_DISRUPTOR_ROMULAN_LIGHT, users: "Romulan Scouts (Valdore)" },
    { weapon: WEAPON_DISRUPTOR_ROMULAN_MEDIUM, users: "Romulan Warbirds (D'deridex)" },
];


const DamageFalloffCells: React.FC<{ weapon: BeamWeapon }> = ({ weapon }) => {
    const falloff = [1, 0.8, 0.6, 0.4, 0.2, 0.2, 0.2, 0.2];
    const segments = Array.from({ length: weapon.range });

    return (
        <div className="flex border border-border-dark" style={{ minWidth: `${weapon.range * 40}px` }}>
            {segments.map((_, i) => {
                const modifier = falloff[i] || falloff[falloff.length - 1];
                const damage = Math.round(weapon.baseDamage * modifier);
                return (
                    <div key={i} className="flex-1 text-center border-r border-border-dark last:border-r-0 p-1 bg-black/20" style={{ opacity: Math.max(0.3, modifier) }}>
                        <div className="text-xs text-text-disabled">{i + 1}</div>
                        <div className="font-bold text-accent-green">{damage}</div>
                    </div>
                );
            })}
        </div>
    );
};

export const WeaponRegistrySection: React.FC = () => (
    <div>
        <SectionHeader>Weapon Systems Registry</SectionHeader>
        <p className="text-text-secondary mb-4">
            This section provides detailed specifications for all standard-issue Starfleet and known alien weapon systems encountered in the Typhon Expanse.
        </p>

        <SubHeader>Standard Phaser Arrays</SubHeader>
        <p className="text-text-secondary mb-2">
            Phasers are the primary energy weapon of most Alpha Quadrant powers. Their damage is directly proportional to the power allocated to the Weapons subsystem and decreases over distance.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div>
                <h4 className="font-bold text-accent-yellow">Damage Falloff</h4>
                <p className="text-xs text-text-secondary mb-1">Damage decreases at range. Minimum damage is 20%.</p>
                <div className="flex border border-border-dark">
                    {phaserFalloffData.map(({ range, modifier }) => (
                        <div key={range} className="flex-1 text-center border-r border-border-dark last:border-r-0 p-1">
                            <div className="text-xs text-text-disabled">Rng {range}</div>
                            <div className="font-bold text-accent-red">{modifier}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                 <h4 className="font-bold text-accent-yellow">Power Scaling</h4>
                 <p className="text-xs text-text-secondary mb-1">Damage scales with power allocated to weapons.</p>
                 <div className="w-full bg-black h-8 rounded-sm border border-border-dark p-0.5">
                    <div className="h-full bg-gradient-to-r from-red-900 to-accent-red" style={{ width: `100%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-text-disabled mt-1 px-1">
                    <span>0% Power (0% Dmg)</span>
                    <span>100% Power (100% Dmg)</span>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-bg-paper-lighter">
                    <tr>
                        <th className="p-2 border border-border-dark font-bold">Mark</th>
                        <th className="p-2 border border-border-dark font-bold text-center">Base Damage</th>
                        <th className="p-2 border border-border-dark font-bold text-center">Max Range</th>
                        <th className="p-2 border border-border-dark font-bold">Beam Profile</th>
                        <th className="p-2 border border-border-dark font-bold">Primary Users</th>
                    </tr>
                </thead>
                <tbody>
                    {phaserTypes.map(({ weapon, users }) => (
                        <tr key={weapon.id} className="bg-bg-paper even:bg-black/20">
                            <td className="p-2 border border-border-dark font-bold">{weapon.name}</td>
                            <td className="p-2 border border-border-dark font-mono text-center">{weapon.baseDamage}</td>
                            <td className="p-2 border border-border-dark font-mono text-center">{weapon.range}</td>
                            <td className="p-2 border border-border-dark" style={{ minWidth: '100px' }}>
                                <div className="w-full h-4 bg-black/50 flex items-center rounded-sm">
                                    <div className="bg-accent-red" style={{ height: `${Math.max(1, weapon.thickness / 2)}px`, width: '100%', boxShadow: `0 0 ${weapon.thickness}px var(--color-accent-red)` }}></div>
                                </div>
                            </td>
                            <td className="p-2 border border-border-dark">{users}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        <SubHeader>Specialized Energy Weapons</SubHeader>
        <WeaponDetail 
            weapon={WEAPON_PULSE_PHASER}
            users="Federation Escorts (Defiant)"
            notes="Fires rapid, high-energy bolts instead of a continuous beam. It has a shorter range but delivers a powerful punch, making it devastating in close-quarters combat."
        />
        <WeaponDetail 
            weapon={WEAPON_PULSE_DISRUPTOR}
            users="Klingon Battleships (Negh'Var)"
            notes="A heavy, short-range cannon that fires discrete, high-energy plasma bolts. It is devastating at close range, but its significant power draw makes sustained fire difficult."
        />
        <WeaponDetail 
            weapon={WEAPON_PULSE_DISRUPTOR_ROMULAN}
            users="Romulan Command Ships (Scimitar)"
            notes="A powerful pulse weapon designed for surgical strikes from cloak. It has better range than its Klingon counterpart but slightly less raw power, reflecting the Romulan preference for precision."
        />

        <SubHeader>Klingon Disruptor Cannons</SubHeader>
        <p className="text-text-secondary mb-2">
            The standard energy weapon of the Klingon Empire. Disruptors function by tearing matter apart at a molecular level. They are generally considered more powerful but less precise than Federation phasers, and follow the same damage falloff rules.
        </p>
        <div className="overflow-x-auto my-4">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-bg-paper-lighter">
                    <tr>
                        <th className="p-2 border border-border-dark font-bold">Type</th>
                        <th className="p-2 border border-border-dark font-bold">Damage by Range (Hex)</th>
                        <th className="p-2 border border-border-dark font-bold">Beam Profile</th>
                        <th className="p-2 border border-border-dark font-bold">Primary Users</th>
                    </tr>
                </thead>
                <tbody>
                    {disruptorTypesKlingon.map(({ weapon, users }) => (
                        <tr key={weapon.id} className="bg-bg-paper even:bg-black/20">
                            <td className="p-2 border border-border-dark align-middle font-bold">{weapon.name}</td>
                            <td className="p-2 border border-border-dark align-middle">
                                <DamageFalloffCells weapon={weapon} />
                            </td>
                            <td className="p-2 border border-border-dark align-middle" style={{ minWidth: '100px' }}>
                                <div className="w-full h-4 bg-black/50 flex items-center rounded-sm">
                                    <div className="bg-accent-green" style={{ height: `${Math.max(1, weapon.thickness / 2)}px`, width: '100%', boxShadow: `0 0 ${weapon.thickness}px var(--color-accent-green)` }}></div>
                                </div>
                            </td>
                            <td className="p-2 border border-border-dark align-middle">{users}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <SubHeader>Romulan Disruptor Beams</SubHeader>
        <p className="text-text-secondary mb-2">
           Romulan disruptor technology favors precision and range over the brute force of Klingon designs. While their base damage is lower, their superior range allows them to control engagements, making them ideal for sniper tactics from cloak. They are not penalized for accuracy like their Klingon counterparts.
        </p>
        <div className="overflow-x-auto my-4">
            <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-bg-paper-lighter">
                    <tr>
                        <th className="p-2 border border-border-dark font-bold">Type</th>
                        <th className="p-2 border border-border-dark font-bold">Damage by Range (Hex)</th>
                        <th className="p-2 border border-border-dark font-bold">Beam Profile</th>
                        <th className="p-2 border border-border-dark font-bold">Primary Users</th>
                    </tr>
                </thead>
                <tbody>
                    {disruptorTypesRomulan.map(({ weapon, users }) => (
                        <tr key={weapon.id} className="bg-bg-paper even:bg-black/20">
                            <td className="p-2 border border-border-dark align-middle font-bold">{weapon.name}</td>
                            <td className="p-2 border border-border-dark align-middle">
                                <DamageFalloffCells weapon={weapon} />
                            </td>
                            <td className="p-2 border border-border-dark align-middle" style={{ minWidth: '100px' }}>
                                <div className="w-full h-4 bg-black/50 flex items-center rounded-sm">
                                    <div className="bg-accent-green" style={{ height: `${Math.max(1, weapon.thickness / 2)}px`, width: '100%', boxShadow: `0 0 ${weapon.thickness}px var(--color-accent-green)` }}></div>
                                </div>
                            </td>
                            <td className="p-2 border border-border-dark align-middle">{users}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        <SubHeader>Projectile Launchers</SubHeader>
        <WeaponDetail 
            weapon={WEAPON_TORPEDO_PHOTON}
            users="Federation, Klingon, Pirates"
            notes="Standard antimatter warhead. Targets the hull only and cannot be aimed at subsystems. Can be shot down by point-defense phaser fire. Accuracy decreases significantly with range."
        />
        <WeaponDetail 
            weapon={WEAPON_TORPEDO_QUANTUM}
            users="Advanced Federation (Sovereign, Defiant classes)"
            notes="A zero-point energy warhead that is much more difficult for enemy point-defense systems to intercept. It is also more accurate than a standard Photon Torpedo (+15% chance to hit at all ranges). A portion of its damage will bypass shields, striking the hull directly."
        />
        <WeaponDetail 
            weapon={WEAPON_TORPEDO_PLASMA}
            users="Romulan Star Empire"
            notes="A tactical weapon designed to disable and wear down targets. The initial impact is moderate, but the subsequent plasma fire can be devastating as it bypasses shields entirely. It is relatively slow-moving and less accurate at range (-10% chance to hit)."
        />
        <WeaponDetail 
            weapon={WEAPON_TORPEDO_HEAVY_PLASMA}
            users="Romulan (D'deridex Warbird)"
            notes="A larger, more potent version of the standard plasma torpedo. Exceptionally dangerous against vessels with compromised shields. It is slow and inaccurate (-15% chance to hit)."
        />
        <WeaponDetail 
            weapon={WEAPON_TORPEDO_HEAVY_PHOTON}
            users="Klingon Empire (Negh'Var), Pirates (Nausicaan)"
            notes="A brute-force weapon. It is slow, inaccurate (-20% chance to hit), and easy to intercept, but will inflict catastrophic damage if it connects with a depleted shield facing."
        />

        <SubHeader>Defensive Systems</SubHeader>
        <SystemDetail
            name="Laser Point-Defense Grid"
            borderColorClass="border-accent-yellow"
            type="Automated Defensive System"
            range="1 hex"
            notes="An automated defensive laser system that targets incoming torpedoes at very close range. Its chance to hit is directly proportional to its subsystem health. When active, it diverts significant power from the main phaser arrays, reducing their damage and effective range. The system's targeting computer prioritizes the most dangerous torpedoes first."
        />
    </div>
);