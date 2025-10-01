
import React from 'react';
import { SectionHeader, SubHeader } from './shared';
import { 
    WEAPON_PHASER_STANDARD, 
    WEAPON_TORPEDO_PHOTON, 
    WEAPON_TORPEDO_QUANTUM,
    WEAPON_TORPEDO_PLASMA,
    WEAPON_TORPEDO_HEAVY_PLASMA,
    WEAPON_TORPEDO_HEAVY_PHOTON
} from '../../assets/weapons/weaponRegistry';
import { BeamWeapon, ProjectileWeapon } from '../../types';
import { WeaponStatDisplay } from './WeaponStatDisplay';
import { getTorpedoHitChance } from '../../game/utils/combat';
import { torpedoStats } from '../../assets/projectiles/configs/torpedoTypes';
import { PhaserAnimationPreview } from './PhaserAnimationPreview';

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
    const torpedoConfig = projectileWeapon ? torpedoStats[projectileWeapon.ammoType] : null;
    const TorpedoIcon = torpedoConfig ? torpedoConfig.icon : null;

    const borderColorClass = isBeam ? 'border-accent-red' : 'border-accent-sky';

    return (
        <div className={`p-3 bg-bg-paper-lighter rounded border-l-4 ${borderColorClass} mb-4`}>
            <h4 className="text-lg font-bold text-white flex items-center gap-3">
                {TorpedoIcon && <TorpedoIcon className={`w-8 h-8 ${torpedoConfig?.colorClass}`} />}
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
                         <div className="col-span-full space-y-2">
                            <dt className="text-xs font-bold uppercase text-text-disabled">Visual Profiles by Faction</dt>
                            <dd className="grid grid-cols-2 gap-2">
                                <PhaserAnimationPreview faction="federation" />
                                <PhaserAnimationPreview faction="klingon" />
                                <PhaserAnimationPreview faction="romulan" />
                                <PhaserAnimationPreview faction="pirate" />
                            </dd>
                        </div>
                    </>
                ) : (
                    <>
                        <WeaponStatDisplay 
                            label="Warhead Damage"
                            value={torpedoStats[(weapon as ProjectileWeapon).ammoType].damage}
                            maxValue={100}
                            colorClass="bg-accent-orange"
                        />
                        <WeaponStatDisplay 
                            label="Accuracy Falloff"
                            torpedoAccuracy={[
                                { range: 1, chance: Math.round(getTorpedoHitChance((weapon as ProjectileWeapon).ammoType, 1) * 100) },
                                { range: 2, chance: Math.round(getTorpedoHitChance((weapon as ProjectileWeapon).ammoType, 2) * 100) },
                                { range: 3, chance: Math.round(getTorpedoHitChance((weapon as ProjectileWeapon).ammoType, 3) * 100) },
                                { range: 4, chance: Math.round(getTorpedoHitChance((weapon as ProjectileWeapon).ammoType, 4) * 100) },
                            ]}
                        />
                    </>
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


export const WeaponRegistrySection: React.FC = () => (
    <div>
        <SectionHeader>Weapon Systems Registry</SectionHeader>
        <p className="text-text-secondary mb-4">
            This section provides detailed specifications for all standard-issue Starfleet and known alien weapon systems encountered in the Typhon Expanse. For detailed combat mechanics like damage falloff and hit chances, see the 'Advanced Combat Mechanics' section.
        </p>

        <SubHeader>Energy Weapons</SubHeader>
        <WeaponDetail 
            weapon={WEAPON_PHASER_STANDARD} 
            users="All Factions"
            notes="The standard energy weapon. Can be precisely targeted at enemy subsystems. A portion of phaser damage will always leak through shields, with the effect becoming more pronounced as shields weaken. Accuracy is negatively affected by nebulae, evasive maneuvers, and firing at targets inside an asteroid field (-30%)."
        />
        
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