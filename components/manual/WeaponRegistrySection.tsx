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

// A local component for displaying weapon details, similar to other manual sections.
const WeaponDetail: React.FC<{ weapon: BeamWeapon | ProjectileWeapon, children?: React.ReactNode }> = ({ weapon, children }) => {
    const isBeam = weapon.type === 'beam';
    const borderColorClass = isBeam ? 'border-accent-red' : 'border-accent-sky';

    return (
        <div className={`p-3 bg-bg-paper-lighter rounded border-l-4 ${borderColorClass} mb-4`}>
            <h4 className="text-lg font-bold text-white">{weapon.name}</h4>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <DetailItem label="Weapon Type" value={weapon.type.charAt(0).toUpperCase() + weapon.type.slice(1)} />
                <DetailItem label="Slot" value={weapon.slot.charAt(0).toUpperCase() + weapon.slot.slice(1)} />
                {isBeam ? (
                    <>
                        <DetailItem label="Base Damage" value={(weapon as BeamWeapon).baseDamage} />
                        <DetailItem label="Max Range" value={`${(weapon as BeamWeapon).range} hexes`} />
                    </>
                ) : (
                    <>
                        <DetailItem label="Ammunition" value={(weapon as ProjectileWeapon).ammoType} />
                        <DetailItem label="Fire Rate" value={`${(weapon as ProjectileWeapon).fireRate} / turn`} />
                    </>
                )}
            </div>
            {children}
        </div>
    );
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-text-secondary">{label}:</span>
        <span className="font-bold text-text-primary">{String(value)}</span>
    </div>
);

export const WeaponRegistrySection: React.FC = () => (
    <div>
        <SectionHeader>Weapon Systems Registry</SectionHeader>
        <p className="text-text-secondary mb-4">
            This section provides detailed specifications for all standard-issue Starfleet and known alien weapon systems encountered in the Typhon Expanse. Note that damage values for energy weapons are baseline and are significantly modified by the ship's power allocation. For detailed combat mechanics, see the 'Advanced Combat' section.
        </p>

        <SubHeader>Energy Weapons</SubHeader>
        <WeaponDetail weapon={WEAPON_PHASER_STANDARD}>
            <p className="text-xs italic text-text-disabled mt-2 col-span-full">The versatile backbone of Starfleet's arsenal. While not as powerful in a single burst as a torpedo, their ability to be re-targeted and fired each turn makes them highly effective for wearing down shields and surgically disabling key enemy subsystems.</p>
        </WeaponDetail>
        
        <SubHeader>Projectile Launchers</SubHeader>
        <WeaponDetail weapon={WEAPON_TORPEDO_PHOTON} />
        <WeaponDetail weapon={WEAPON_TORPEDO_QUANTUM} />
        <WeaponDetail weapon={WEAPON_TORPEDO_PLASMA} />
        <WeaponDetail weapon={WEAPON_TORPEDO_HEAVY_PLASMA} />
        <WeaponDetail weapon={WEAPON_TORPEDO_HEAVY_PHOTON} />
    </div>
);
